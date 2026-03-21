create table if not exists public.access_sessions (
  id uuid primary key default gen_random_uuid(),
  access_type text not null check (access_type in ('child')),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  token_hash text not null unique,
  ip_address text,
  user_agent text,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.access_attempts (
  id uuid primary key default gen_random_uuid(),
  access_type text not null check (access_type in ('child')),
  identifier text not null,
  ip_address text,
  user_agent text,
  succeeded boolean not null default false,
  failure_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_access_sessions_token_hash
on public.access_sessions(token_hash);

create index if not exists idx_access_sessions_student
on public.access_sessions(student_id, access_type, expires_at desc);

create index if not exists idx_access_attempts_identifier
on public.access_attempts(access_type, identifier, created_at desc);

create index if not exists idx_access_attempts_ip
on public.access_attempts(access_type, ip_address, created_at desc);
