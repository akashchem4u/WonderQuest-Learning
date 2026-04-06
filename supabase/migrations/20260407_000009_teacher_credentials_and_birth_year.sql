-- Add username + password auth to teacher profiles
alter table public.teacher_profiles
  add column if not exists username text unique,
  add column if not exists password_hash text;

-- Add birth year to student profiles for age-based band recommendation
alter table public.student_profiles
  add column if not exists birth_year smallint;

-- Index for teacher username lookup
create index if not exists idx_teacher_profiles_username
  on public.teacher_profiles(username)
  where username is not null;
