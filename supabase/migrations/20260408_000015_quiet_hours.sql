alter table public.guardian_profiles
  add column if not exists quiet_hours_settings jsonb;
