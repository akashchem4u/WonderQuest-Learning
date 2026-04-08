-- Skill review queue: tracks owner-flagged skills for content QA
create table if not exists public.skill_review_queue (
  id uuid primary key default gen_random_uuid(),
  skill_code text not null,
  status text not null default 'flag', -- flag | approve | dismiss
  notes text,
  reviewed_by text not null default 'owner',
  created_at timestamptz not null default now()
);

create index if not exists idx_skill_review_queue_skill_code
  on public.skill_review_queue(skill_code, created_at desc);

create index if not exists idx_skill_review_queue_status
  on public.skill_review_queue(status, created_at desc);

alter table public.skill_review_queue enable row level security;
create policy "server_access_only" on public.skill_review_queue
  to service_role using (true) with check (true);
