-- Admin users table for owner-level access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  password_hash text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  is_active boolean NOT NULL DEFAULT false,
  invited_by uuid REFERENCES public.admin_users(id),
  invite_token text UNIQUE,
  invite_expires_at timestamptz,
  invite_accepted_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_users_email_idx ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_invite_token_idx ON public.admin_users(invite_token) WHERE invite_token IS NOT NULL;

-- Admin access sessions — reuse access_sessions table with access_type = 'admin'
-- No schema change needed, access_sessions already has: id, access_type, student_id (we'll use for admin_id), token_hash, expires_at, last_seen_at, revoked_at
