-- Add deactivated_at column for soft-disable on all profile tables
-- When set (non-null), the account is deactivated but all history is preserved
-- Reactivate by setting deactivated_at = NULL

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.guardian_profiles
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.teacher_profiles
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ DEFAULT NULL;

-- Index for filtering active-only queries
CREATE INDEX IF NOT EXISTS idx_students_active ON public.student_profiles (id) WHERE deactivated_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_guardians_active ON public.guardian_profiles (id) WHERE deactivated_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_teachers_active ON public.teacher_profiles (id) WHERE deactivated_at IS NULL;
