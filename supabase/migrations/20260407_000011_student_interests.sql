-- Add interests column to student_profiles for storing child interest tags
alter table public.student_profiles
  add column if not exists interests text[] not null default '{}';
