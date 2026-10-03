begin;

alter table public.transactions
  add column if not exists price_review_status text not null default 'pending'
    check (price_review_status in ('pending', 'approved', 'rejected')),
  add column if not exists spec_verified boolean not null default false,
  add column if not exists reporter_key text,
  add column if not exists report_device_key text,
  add column if not exists price_reviewed_at timestamptz,
  add column if not exists price_review_note text;

create or replace function public.guard_transaction_evidence()
returns trigger language plpgsql set search_path = public as $$
declare
  is_admin boolean := coalesce((auth.jwt()->'app_metadata'->>'pricing_admin') = 'true', false);
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.price_review_status := 'pending';
    new.spec_verified := false;
    new.reporter_key := null;
    new.price_reviewed_at := null;
    new.price_review_note := null;
    if new.source = 'report' then
      if new.report_device_key is null then
        raise exception '請使用新版成交回報表單';
      end if;
      perform pg_advisory_xact_lock(hashtextextended(new.report_device_key || new.model || new.storage, 0));
      if exists (
        select 1 from public.transactions t
        where t.report_device_key = new.report_device_key and t.model = new.model
          and t.storage = new.storage and t.source = 'report'
          and t.created_at > now() - interval '30 days'
      ) then
        raise exception '同一裝置同型號／規格 30 天只能回報一筆';
      end if;
    end if;
  elsif not is_admin then
    if new.price_review_status is distinct from old.price_review_status
      or new.spec_verified is distinct from old.spec_verified
      or new.reporter_key is distinct from old.reporter_key
      or new.report_device_key is distinct from old.report_device_key
      or new.price_reviewed_at is distinct from old.price_reviewed_at
      or new.price_review_note is distinct from old.price_review_note
      or new.created_at is distinct from old.created_at then
      raise exception '僅管理員可審核價格資料';
    end if;
    if to_jsonb(new) is distinct from to_jsonb(old) then
      new.price_review_status := 'pending';
      new.spec_verified := false;
      new.reporter_key := null;
      new.price_reviewed_at := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_transaction_evidence on public.transactions;
create trigger guard_transaction_evidence before insert or update on public.transactions
  for each row execute function public.guard_transaction_evidence();

create or replace function public.submit_transaction_report(p_data jsonb, p_device_id text)
returns void language plpgsql security definer set search_path = public as $$
declare
  r public.transactions;
  device_key text;
begin
  if length(p_device_id) not between 8 and 100 then raise exception '裝置識別無效'; end if;
  r := jsonb_populate_record(null::public.transactions, p_data);
  if coalesce(r.model, '') = '' or coalesce(r.storage, '') = '' or r.price is null or r.price <= 0 then
    raise exception '型號、規格與成交價格必須完整';
  end if;
  device_key := encode(sha256(convert_to(coalesce(auth.uid()::text, p_device_id), 'UTF8')), 'hex');
  insert into public.transactions (
    model, storage, color, condition, battery_health, has_damage,
    purchase_channel, warranty_status, warranty_months, price,
    trade_method, location, source, note, report_device_key
  ) values (
    r.model, r.storage, r.color, r.condition, r.battery_health, coalesce(r.has_damage, false),
    r.purchase_channel, r.warranty_status, r.warranty_months, r.price,
    r.trade_method, r.location, 'report', r.note, device_key
  );
end;
$$;

create or replace function public.review_transaction_price(p_id text, p_status text, p_identity text, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare
  r public.transactions;
  identity_key text;
begin
  if not coalesce((auth.jwt()->'app_metadata'->>'pricing_admin') = 'true', false) then
    raise exception '請登入具有 pricing_admin 權限的管理員帳號';
  end if;
  if p_status not in ('approved', 'rejected') then raise exception '審核狀態無效'; end if;
  select * into r from public.transactions where id::text = p_id for update;
  if not found then raise exception '找不到這筆資料'; end if;
  if p_status = 'approved' then
    if length(trim(coalesce(p_identity, ''))) < 8 or length(trim(coalesce(p_note, ''))) < 5 then
      raise exception '請提供獨立來源識別與同規格核對紀錄';
    end if;
    if (r.condition is not null and r.condition <> '正常無拆修') or coalesce(r.has_damage, false) then
      raise exception '基準行情僅採正常無拆修商品；請先補齊機況';
    end if;
    identity_key := encode(sha256(convert_to(lower(trim(p_identity)), 'UTF8')), 'hex');
    perform pg_advisory_xact_lock(hashtextextended(identity_key || r.model || r.storage, 0));
    if exists (
      select 1 from public.transactions t where t.id::text <> p_id
        and t.reporter_key = identity_key and t.model = r.model and t.storage = r.storage
        and t.source = r.source and t.price_review_status = 'approved'
        and abs(extract(epoch from (t.created_at - r.created_at))) < 30 * 86400
    ) then raise exception '同一來源同型號／規格 30 天僅採計一筆'; end if;
  end if;
  update public.transactions set price_review_status = p_status,
    spec_verified = (p_status = 'approved'), reporter_key = identity_key,
    condition = case when p_status = 'approved' then '正常無拆修' else condition end,
    price_reviewed_at = now(), price_review_note = left(p_note, 1000)
    where id::text = p_id;
end;
$$;

revoke all on function public.submit_transaction_report(jsonb, text) from public;
grant execute on function public.submit_transaction_report(jsonb, text) to anon, authenticated;
revoke all on function public.review_transaction_price(text, text, text, text) from public, anon;
grant execute on function public.review_transaction_price(text, text, text, text) to authenticated;
create index if not exists transactions_evidence_lookup_idx on public.transactions (model, storage, created_at desc);
commit;
