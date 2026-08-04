create table if not exists public.search_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text not null check (char_length(anonymous_id) between 8 and 100),
  event_type text not null check (event_type in ('search', 'product_view', 'storage_select')),
  query text check (char_length(query) <= 80),
  product_id text check (char_length(product_id) <= 100),
  product_name text check (char_length(product_name) <= 160),
  storage text check (char_length(storage) <= 60),
  created_at timestamptz not null default now()
);

create index if not exists search_events_created_at_idx on public.search_events (created_at desc);
create index if not exists search_events_event_type_idx on public.search_events (event_type, created_at desc);
create index if not exists search_events_product_idx on public.search_events (product_name, created_at desc);

alter table public.search_events enable row level security;

create policy "anonymous visitors can submit search events"
  on public.search_events
  for insert
  to anon, authenticated
  with check (
    char_length(anonymous_id) between 8 and 100
    and event_type in ('search', 'product_view', 'storage_select')
  );

create or replace function public.get_popular_searches(
  p_days integer default 30,
  p_limit integer default 8
)
returns table (
  kind text,
  label text,
  event_count bigint,
  visitor_count bigint
)
language sql
security definer
set search_path = public
as $$
  with scoped as (
    select event_type, query, product_name, storage, anonymous_id, created_at::date as event_day
    from public.search_events
    where created_at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  ),
  deduplicated as (
    select distinct event_type, query, product_name, storage, anonymous_id, event_day
    from scoped
  ),
  rankings as (
    select
      'query'::text as kind,
      query as label,
      count(*) as event_count,
      count(distinct anonymous_id) as visitor_count
    from deduplicated
    where event_type = 'search' and query is not null and query <> ''
    group by query

    union all

    select
      'product'::text as kind,
      concat(product_name, case when storage is null then '' else ' ' || storage end) as label,
      count(*) as event_count,
      count(distinct anonymous_id) as visitor_count
    from deduplicated
    where event_type in ('product_view', 'storage_select') and product_name is not null
    group by product_name, storage
  )
  select kind, label, event_count, visitor_count
  from rankings
  order by event_count desc, visitor_count desc, label asc
  limit greatest(1, least(p_limit * 2, 40));
$$;

revoke all on function public.get_popular_searches(integer, integer) from public;
grant execute on function public.get_popular_searches(integer, integer) to anon, authenticated;
