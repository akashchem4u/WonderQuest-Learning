-- Migration: teacher_pushed_sessions + virtual classroom columns
-- Teachers can push targeted skill sessions to individual students.
-- Virtual/demo classroom students are flagged with is_virtual = true.

create table if not exists public.teacher_pushed_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  skill_code text not null,
  reason text,
  priority text not null default 'normal',
  note text,
  pushed_at timestamptz not null default now(),
  consumed_at timestamptz,
  session_id uuid,
  is_ai_generated boolean not null default false
);

create index if not exists idx_tps_student on public.teacher_pushed_sessions(student_id, consumed_at);
create index if not exists idx_tps_teacher on public.teacher_pushed_sessions(teacher_id);

-- Mark virtual/demo classrooms
alter table public.student_profiles
  add column if not exists is_virtual boolean not null default false,
  add column if not exists virtual_teacher_id uuid;
