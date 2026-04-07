-- Add optional school name and ISD/district fields to guardian profiles
alter table public.guardian_profiles
  add column if not exists school_name text,
  add column if not exists isd_name text;
