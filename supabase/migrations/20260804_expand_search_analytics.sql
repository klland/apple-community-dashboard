alter table public.search_events
  add column if not exists category text check (char_length(category) <= 40),
  add column if not exists result_count integer check (result_count >= 0 and result_count <= 10000);

create index if not exists search_events_category_idx
  on public.search_events (category, created_at desc);

create or replace function public.get_search_analytics(p_days integer default 30)
returns jsonb
language sql
security definer
set search_path = public
as $function$
  with scoped as (
    select event_type, query, product_name, category, storage, anonymous_id, result_count, created_at
    from public.search_events
    where created_at >= now() - make_interval(days => greatest(14, least(p_days, 365)))
  )
  select jsonb_build_object(
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('date', day, 'event_count', event_count, 'visitor_count', visitor_count) order by day)
      from (
        select created_at::date as day, count(*) as event_count, count(distinct anonymous_id) as visitor_count
        from scoped
        where event_type = 'search'
        group by created_at::date
      ) daily_rows
    ), '[]'::jsonb),
    'zero_results', coalesce((
      select jsonb_agg(jsonb_build_object('label', query, 'event_count', event_count, 'visitor_count', visitor_count) order by event_count desc, visitor_count desc, query)
      from (
        select query, count(*) as event_count, count(distinct anonymous_id) as visitor_count
        from scoped
        where event_type = 'search' and result_count = 0 and query is not null and query <> ''
        group by query
        order by event_count desc, visitor_count desc, query
        limit 8
      ) zero_rows
    ), '[]'::jsonb),
    'conversion', jsonb_build_object(
      'search_visitors', (select count(distinct anonymous_id) from scoped where event_type = 'search'),
      'product_visitors', (select count(distinct anonymous_id) from scoped where event_type = 'product_view'),
      'converted_visitors', (
        select count(distinct product_event.anonymous_id)
        from scoped product_event
        where product_event.event_type = 'product_view'
          and exists (
            select 1
            from scoped search_event
            where search_event.event_type = 'search'
              and search_event.anonymous_id = product_event.anonymous_id
              and search_event.created_at::date = product_event.created_at::date
          )
      )
    ),
    'storage', coalesce((
      select jsonb_agg(jsonb_build_object('label', storage, 'event_count', event_count, 'visitor_count', visitor_count) order by event_count desc, visitor_count desc, storage)
      from (
        select storage, count(*) as event_count, count(distinct anonymous_id) as visitor_count
        from scoped
        where event_type = 'storage_select' and storage is not null and storage <> ''
        group by storage
        order by event_count desc, visitor_count desc, storage
        limit 8
      ) storage_rows
    ), '[]'::jsonb),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object('label', category, 'event_count', event_count, 'visitor_count', visitor_count) order by event_count desc, visitor_count desc, category)
      from (
        select category, count(*) as event_count, count(distinct anonymous_id) as visitor_count
        from scoped
        where event_type = 'product_view' and category is not null and category <> ''
        group by category
        order by event_count desc, visitor_count desc, category
        limit 8
      ) category_rows
    ), '[]'::jsonb),
    'trending', coalesce((
      select jsonb_agg(jsonb_build_object(
        'label', label,
        'current_count', current_count,
        'previous_count', previous_count,
        'visitor_count', visitor_count
      ) order by (current_count::numeric + 1) / (previous_count::numeric + 1) desc, current_count desc, label)
      from (
        select
          product_name as label,
          count(*) filter (where created_at >= now() - interval '7 days') as current_count,
          count(*) filter (where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days') as previous_count,
          count(distinct anonymous_id) filter (where created_at >= now() - interval '7 days') as visitor_count
        from scoped
        where event_type = 'product_view' and product_name is not null
        group by product_name
        having count(*) filter (where created_at >= now() - interval '7 days') > 0
        order by (count(*) filter (where created_at >= now() - interval '7 days')::numeric + 1)
          / (count(*) filter (where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days')::numeric + 1) desc,
          count(*) filter (where created_at >= now() - interval '7 days') desc,
          product_name
        limit 8
      ) trending_rows
    ), '[]'::jsonb)
  );
$function$;

revoke all on function public.get_search_analytics(integer) from public;
grant execute on function public.get_search_analytics(integer) to anon, authenticated;
