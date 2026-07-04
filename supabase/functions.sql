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

notify pgrst, 'reload schema';

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
