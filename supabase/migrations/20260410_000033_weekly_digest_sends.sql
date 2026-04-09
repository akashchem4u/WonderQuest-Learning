CREATE TABLE IF NOT EXISTS public.weekly_digest_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid NOT NULL REFERENCES public.guardian_profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  week_starting date NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent',
  UNIQUE(guardian_id, student_id, week_starting)
);
ALTER TABLE public.weekly_digest_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.weekly_digest_sends
  FOR ALL TO service_role USING (true) WITH CHECK (true);
