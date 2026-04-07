-- Migration: guardian_pushed_activities
-- Allows guardians to push a specific skill into their child's next play session.

create table if not exists public.guardian_pushed_activities (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.guardian_profiles(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  skill_code text not null,
  priority text not null default 'normal', -- 'urgent' | 'normal'
  note text,
  pushed_at timestamptz not null default now(),
  consumed_at timestamptz,
  session_id uuid
);

create index if not exists idx_gpa_student_consumed
  on public.guardian_pushed_activities(student_id, consumed_at);

create index if not exists idx_gpa_guardian
  on public.guardian_pushed_activities(guardian_id);
