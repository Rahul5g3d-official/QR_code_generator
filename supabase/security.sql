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
