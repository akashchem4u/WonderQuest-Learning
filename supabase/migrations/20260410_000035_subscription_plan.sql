ALTER TABLE public.guardian_profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- plan values: 'free', 'family', 'family_plus'
COMMENT ON COLUMN public.guardian_profiles.plan IS 'free | family | family_plus';
