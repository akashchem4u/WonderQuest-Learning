-- Add a unique shareable class code to each teacher profile
alter table public.teacher_profiles
  add column if not exists class_code text unique;

-- Generate short codes for existing teachers who don't have one
update public.teacher_profiles
  set class_code = upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  where class_code is null;

-- Index for fast lookup by class code
create index if not exists idx_teacher_profiles_class_code
  on public.teacher_profiles(class_code)
  where class_code is not null;
