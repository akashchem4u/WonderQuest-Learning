alter table public.feedback_items
add column if not exists context jsonb not null default '{}'::jsonb;
