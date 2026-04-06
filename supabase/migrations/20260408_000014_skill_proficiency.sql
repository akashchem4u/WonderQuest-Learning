-- Add proficiency tracking columns to student_skill_mastery
alter table public.student_skill_mastery
  add column if not exists session_count integer not null default 0,
  add column if not exists avg_time_ms numeric(10,2) not null default 0,
  add column if not exists proficient_at timestamptz,
  add column if not exists proficiency_evidence jsonb;

-- Index for proficiency queries
create index if not exists idx_student_skill_mastery_proficient
  on public.student_skill_mastery(student_id, proficient_at)
  where proficient_at is not null;
