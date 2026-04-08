-- COPPA consent records
-- Stored immutably — consents are never deleted (required for compliance audit trail)
CREATE TABLE IF NOT EXISTS public.coppa_consents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id    uuid NOT NULL REFERENCES public.guardian_profiles(id) ON DELETE RESTRICT,
  student_id     uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE RESTRICT,
  consented_at   timestamptz NOT NULL DEFAULT now(),
  consent_text   text NOT NULL,                    -- exact text shown to parent at time of consent
  ip_address     text,
  user_agent     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coppa_consents_guardian_idx ON public.coppa_consents(guardian_id);
CREATE INDEX IF NOT EXISTS coppa_consents_student_idx ON public.coppa_consents(student_id);
