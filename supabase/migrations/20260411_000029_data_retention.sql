-- Track when accounts were last active for retention enforcement
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

-- Update last_active_at trigger on access_sessions insert
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.access_type = 'child' AND NEW.student_id IS NOT NULL THEN
    UPDATE public.student_profiles SET last_active_at = now() WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_student_last_active
  AFTER INSERT ON public.access_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_last_active();
