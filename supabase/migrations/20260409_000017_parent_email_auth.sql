-- Migration: 20260409_000017_parent_email_auth
-- Adds email-based auth columns and Google OAuth readiness columns to guardian_profiles.
-- Phase 1: PIN + username auth already live.
-- Phase 2 (this migration): prepares the table for email/password and future Google OAuth.

alter table public.guardian_profiles
  add column if not exists email          text,
  add column if not exists email_verified boolean not null default false,
  add column if not exists password_hash  text,
  add column if not exists google_id      text,
  add column if not exists oauth_provider text;

-- Unique index on email (sparse — only non-null values are constrained)
create unique index if not exists idx_guardian_email
  on public.guardian_profiles(email)
  where email is not null;

-- Unique index on google_id (sparse — only non-null values are constrained)
create unique index if not exists idx_guardian_google_id
  on public.guardian_profiles(google_id)
  where google_id is not null;

comment on column public.guardian_profiles.email is
  'Parent email address used for email/password auth (Phase 2) and Google OAuth (future).';

comment on column public.guardian_profiles.email_verified is
  'True once the parent has confirmed their email address.';

comment on column public.guardian_profiles.password_hash is
  'bcrypt hash of the parent password for email/password auth. Null for OAuth-only accounts.';

comment on column public.guardian_profiles.google_id is
  'Google subject ID (sub) for Sign in with Google. Null until OAuth is enabled.';

comment on column public.guardian_profiles.oauth_provider is
  'OAuth provider used to create/link this account (e.g. ''google''). Null for PIN-only accounts.';

-- Password reset tokens table
create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.guardian_profiles(id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 minutes',
  used_at timestamptz
);
create index if not exists idx_prt_guardian on public.password_reset_tokens(guardian_id);
create index if not exists idx_prt_token on public.password_reset_tokens(token);
