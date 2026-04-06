-- ============================================================
-- Migration: Teacher infrastructure
-- Date: 2026-04-06
-- Adds teacher profiles, class rosters, assignments, and
-- intervention tracking tables.
-- ============================================================

-- ── Teacher profiles ─────────────────────────────────────────────────────────

create table if not exists public.teacher_profiles (
  id            uuid primary key default gen_random_uuid(),
  display_name  text not null,
  email         text unique,
  school_name   text,
  grade_levels  text[],           -- e.g. ['2', '3']
  tester_flag   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Teacher ↔ student roster ─────────────────────────────────────────────────

create table if not exists public.teacher_student_roster (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references public.teacher_profiles(id) on delete cascade,
  student_id    uuid not null references public.student_profiles(id) on delete cascade,
  added_at      timestamptz not null default now(),
  active        boolean not null default true,
  unique(teacher_id, student_id)
);

create index if not exists idx_teacher_student_roster_teacher
  on public.teacher_student_roster(teacher_id);
create index if not exists idx_teacher_student_roster_student
  on public.teacher_student_roster(student_id);

-- ── Assignments ───────────────────────────────────────────────────────────────

create table if not exists public.assignments (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.teacher_profiles(id) on delete cascade,
  title           text not null,
  description     text,
  skill_codes     text[] not null default '{}',  -- skill codes to focus on
  launch_band_code text,
  session_mode    text not null default 'guided-quest',
  due_date        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Assignment ↔ student (which students are assigned)
create table if not exists public.assignment_students (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references public.assignments(id) on delete cascade,
  student_id     uuid not null references public.student_profiles(id) on delete cascade,
  completed_at   timestamptz,
  session_id     uuid references public.challenge_sessions(id),
  unique(assignment_id, student_id)
);

create index if not exists idx_assignments_teacher
  on public.assignments(teacher_id);
create index if not exists idx_assignment_students_assignment
  on public.assignment_students(assignment_id);
create index if not exists idx_assignment_students_student
  on public.assignment_students(student_id);

-- ── Interventions ─────────────────────────────────────────────────────────────

create table if not exists public.teacher_interventions (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references public.teacher_profiles(id) on delete cascade,
  student_id      uuid not null references public.student_profiles(id) on delete cascade,
  skill_code      text,
  reason          text not null,        -- e.g. "confidence floor 3x", "below benchmark"
  intervention_type text not null default 'support-queue',  -- 'support-queue', 'flag', 'note'
  status          text not null default 'active',           -- 'active', 'resolved', 'monitoring'
  teacher_note    text,
  resolved_at     timestamptz,
  resolution_note text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_interventions_teacher
  on public.teacher_interventions(teacher_id);
create index if not exists idx_interventions_student
  on public.teacher_interventions(student_id);
create index if not exists idx_interventions_status
  on public.teacher_interventions(status);

-- ── Teacher notes ─────────────────────────────────────────────────────────────

create table if not exists public.teacher_notes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.teacher_profiles(id) on delete cascade,
  student_id  uuid not null references public.student_profiles(id) on delete cascade,
  body        text not null,
  private     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_teacher_notes_student
  on public.teacher_notes(teacher_id, student_id);

-- ── Trigger: updated_at ───────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_teacher_profiles_updated
  before update on public.teacher_profiles
  for each row execute function public.touch_updated_at();

create or replace trigger trg_assignments_updated
  before update on public.assignments
  for each row execute function public.touch_updated_at();

create or replace trigger trg_interventions_updated
  before update on public.teacher_interventions
  for each row execute function public.touch_updated_at();

create or replace trigger trg_teacher_notes_updated
  before update on public.teacher_notes
  for each row execute function public.touch_updated_at();
