create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  original_url text not null,
  short_code text unique not null,
  qr_image text,
  total_scans integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qr_scans (
  id uuid primary key default gen_random_uuid(),
  qr_code_id uuid not null references public.qr_codes(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  ip_address text,
  masked_ip text,
  country text,
  city text,
  region text,
  device_type text,
  browser text,
  os text,
  user_agent text,
  referrer text,
  is_bot boolean not null default false,
  scanned_at timestamptz not null default now()
);

alter table public.qr_scans
  add column if not exists is_bot boolean not null default false;

create unique index if not exists qr_codes_short_code_idx on public.qr_codes(short_code);
create index if not exists qr_codes_creator_id_idx on public.qr_codes(creator_id);
create index if not exists qr_codes_created_at_idx on public.qr_codes(created_at desc);
create index if not exists qr_scans_qr_code_id_idx on public.qr_scans(qr_code_id);
create index if not exists qr_scans_creator_id_idx on public.qr_scans(creator_id);
create index if not exists qr_scans_scanned_at_idx on public.qr_scans(scanned_at desc);
create index if not exists qr_scans_qr_code_scanned_at_idx on public.qr_scans(qr_code_id, scanned_at desc);
create index if not exists qr_scans_creator_scanned_at_idx on public.qr_scans(creator_id, scanned_at desc);

alter table public.profiles enable row level security;
alter table public.qr_codes enable row level security;
alter table public.qr_scans enable row level security;

drop policy if exists "profiles can read own profile" on public.profiles;
drop policy if exists "profiles can update own profile" on public.profiles;
drop policy if exists "qr codes select own" on public.qr_codes;
drop policy if exists "qr codes insert own" on public.qr_codes;
drop policy if exists "qr codes update own" on public.qr_codes;
drop policy if exists "qr codes delete own" on public.qr_codes;
drop policy if exists "qr scans select own" on public.qr_scans;
drop policy if exists "qr scans no direct insert" on public.qr_scans;

create policy "profiles can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "qr codes select own"
  on public.qr_codes
  for select
  using (auth.uid() = creator_id);

create policy "qr codes insert own"
  on public.qr_codes
  for insert
  with check (auth.uid() = creator_id);

create policy "qr codes update own"
  on public.qr_codes
  for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

create policy "qr codes delete own"
  on public.qr_codes
  for delete
  using (auth.uid() = creator_id);

create policy "qr scans select own"
  on public.qr_scans
  for select
  using (auth.uid() = creator_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_qr_codes_updated_at on public.qr_codes;

create trigger set_qr_codes_updated_at
  before update on public.qr_codes
  for each row execute function public.set_updated_at();

create or replace function public.record_qr_scan(
  p_short_code text,
  p_ip_address text,
  p_masked_ip text,
  p_country text,
  p_city text,
  p_region text,
  p_device_type text,
  p_browser text,
  p_os text,
  p_user_agent text,
  p_referrer text,
  p_is_bot boolean default false
)
returns table (
  found boolean,
  original_url text,
  qr_code_id uuid,
  creator_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qr record;
begin
  select id, creator_id, original_url
  into v_qr
  from public.qr_codes
  where short_code = p_short_code
    and is_active = true
  limit 1;

  if v_qr.id is null then
    return query
      select false, null::text, null::uuid, null::uuid;
    return;
  end if;

  insert into public.qr_scans (
    qr_code_id,
    creator_id,
    ip_address,
    masked_ip,
    country,
    city,
    region,
    device_type,
    browser,
    os,
    user_agent,
    referrer,
    is_bot
  )
  values (
    v_qr.id,
    v_qr.creator_id,
    p_ip_address,
    p_masked_ip,
    p_country,
    p_city,
    p_region,
    p_device_type,
    p_browser,
    p_os,
    p_user_agent,
    p_referrer,
    coalesce(p_is_bot, false)
  );

  update public.qr_codes
  set total_scans = total_scans + 1,
      updated_at = now()
  where id = v_qr.id;

  return query
    select true, v_qr.original_url, v_qr.id, v_qr.creator_id;
end;
$$;

create or replace function public.cleanup_old_qr_scans(p_retention_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.qr_scans
  where scanned_at < now() - make_interval(days => greatest(p_retention_days, 1));

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

drop function if exists public.increment_qr_scan_count(uuid);

revoke all on function public.record_qr_scan(
  text, text, text, text, text, text, text, text, text, text, text, boolean
) from public, anon, authenticated;
revoke all on function public.cleanup_old_qr_scans(integer) from public, anon, authenticated;

grant execute on function public.record_qr_scan(
  text, text, text, text, text, text, text, text, text, text, text, boolean
) to service_role;
grant execute on function public.cleanup_old_qr_scans(integer) to service_role;

notify pgrst, 'reload schema';
