-- Add guest fields to guardian_profiles
ALTER TABLE public.guardian_profiles
  ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS guest_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_guardian_profiles_guest_expires
  ON public.guardian_profiles (guest_expires_at)
  WHERE is_guest = true;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;
