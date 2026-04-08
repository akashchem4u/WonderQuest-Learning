ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS active_child_id uuid REFERENCES public.student_profiles(id) ON DELETE SET NULL;
