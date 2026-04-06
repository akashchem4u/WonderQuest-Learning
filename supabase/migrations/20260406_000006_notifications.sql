-- 20260406_000006_notifications.sql
-- Student milestone and activity notifications for parent lane

create table if not exists public.student_notifications (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.student_profiles(id) on delete cascade,
  guardian_id uuid references public.guardian_profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  description text not null,
  value       text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_student_notifications_student
  on public.student_notifications(student_id, created_at desc);

create index if not exists idx_student_notifications_guardian
  on public.student_notifications(guardian_id, read, created_at desc);

comment on table public.student_notifications is
  'Milestone and activity notifications surfaced to parents (level-ups, badges, streaks, session counts)';
