create extension if not exists pgcrypto;

create table if not exists public.theme_families (
  code text primary key,
  display_name text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.launch_bands (
  code text primary key,
  display_name text not null,
  sort_order integer not null unique,
  age_min integer,
  age_max integer,
  grade_min text,
  grade_max text,
  primary_theme_code text not null references public.theme_families(code),
  audience_label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.guardian_profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  pin_hash text not null,
  display_name text not null,
  relationship_label text,
  notification_settings jsonb not null default '{}'::jsonb,
  tester_flag boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  pin_hash text not null,
  display_name text not null,
  avatar_key text not null,
  launch_band_code text not null references public.launch_bands(code),
  preferred_theme_code text references public.theme_families(code),
  age_label text,
  reading_independence_level text,
  tester_flag boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guardian_student_links (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.guardian_profiles(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  linked_at timestamptz not null default now(),
  unique (guardian_id, student_id)
);

create table if not exists public.progression_states (
  student_id uuid primary key references public.student_profiles(id) on delete cascade,
  total_points integer not null default 0,
  current_level integer not null default 1,
  streak_count integer not null default 0,
  badge_count integer not null default 0,
  trophy_count integer not null default 0,
  unlocked_badges jsonb not null default '[]'::jsonb,
  unlocked_trophies jsonb not null default '[]'::jsonb,
  unlocked_worlds jsonb not null default '[]'::jsonb,
  last_restored_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  code text primary key,
  display_name text not null,
  active boolean not null default true
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  subject_code text not null references public.subjects(code),
  launch_band_code text not null references public.launch_bands(code),
  display_name text not null,
  description text not null,
  difficulty_floor integer not null default 1,
  difficulty_ceiling integer not null default 5,
  active boolean not null default true
);

create table if not exists public.content_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  subject_code text not null references public.subjects(code),
  launch_band_code text not null references public.launch_bands(code),
  modality text not null,
  reading_load text not null,
  prompt_pattern text not null,
  answer_pattern text not null,
  explanation_pattern text not null,
  active boolean not null default true
);

create table if not exists public.example_items (
  id uuid primary key default gen_random_uuid(),
  example_key text not null unique,
  skill_id uuid not null references public.skills(id) on delete cascade,
  theme_code text references public.theme_families(code),
  launch_band_code text not null references public.launch_bands(code),
  prompt_text text not null,
  correct_answer text not null,
  distractors jsonb not null default '[]'::jsonb,
  explanation_text text not null,
  voice_script text,
  media_hint text,
  difficulty integer not null default 1,
  active boolean not null default true
);

create table if not exists public.explainer_assets (
  id uuid primary key default gen_random_uuid(),
  explainer_key text not null unique,
  launch_band_code text not null references public.launch_bands(code),
  subject_code text not null references public.subjects(code),
  format text not null,
  misconception_type text not null,
  script_text text not null,
  media_hint text,
  active boolean not null default true
);

create table if not exists public.challenge_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  session_mode text not null,
  theme_code text references public.theme_families(code),
  requested_focus text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_questions integer not null default 0,
  effectiveness_score numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists public.session_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.challenge_sessions(id) on delete cascade,
  example_item_id uuid references public.example_items(id),
  skill_id uuid references public.skills(id),
  correct boolean not null,
  first_try boolean not null,
  time_spent_ms integer not null default 0,
  effective_time_ms integer not null default 0,
  hint_used boolean not null default false,
  remediation_triggered boolean not null default false,
  points_earned integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  submitted_by_role text not null,
  guardian_id uuid references public.guardian_profiles(id),
  student_id uuid references public.student_profiles(id),
  source_channel text not null,
  message text not null,
  attachment_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_triage (
  feedback_id uuid primary key references public.feedback_items(id) on delete cascade,
  ai_category text,
  confidence numeric(5,2),
  urgency text,
  impacted_area text,
  duplicate_cluster_id text,
  summary text,
  routing_target text,
  review_status text not null default 'pending',
  reviewer_note text
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.guardian_profiles(id) on delete cascade,
  channel text not null,
  notification_type text not null,
  enabled boolean not null default true,
  preferred_time_window text,
  quiet_hours text,
  created_at timestamptz not null default now(),
  unique (guardian_id, channel, notification_type)
);

create index if not exists idx_student_profiles_band on public.student_profiles(launch_band_code);
create index if not exists idx_skills_band_subject on public.skills(launch_band_code, subject_code);
create index if not exists idx_example_items_band on public.example_items(launch_band_code);
create index if not exists idx_sessions_student on public.challenge_sessions(student_id, started_at desc);
create index if not exists idx_session_results_session on public.session_results(session_id);
