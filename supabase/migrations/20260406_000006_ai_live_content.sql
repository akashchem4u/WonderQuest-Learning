alter table public.example_items
  add column if not exists source_kind text not null default 'seeded',
  add column if not exists generation_metadata jsonb not null default '{}'::jsonb;

alter table public.explainer_assets
  add column if not exists source_kind text not null default 'seeded',
  add column if not exists generation_metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_example_items_skill_difficulty
  on public.example_items (skill_id, difficulty, active);

create index if not exists idx_example_items_band_difficulty
  on public.example_items (launch_band_code, difficulty, active);

create index if not exists idx_example_items_source_kind
  on public.example_items (source_kind);

create index if not exists idx_explainer_assets_source_kind
  on public.explainer_assets (source_kind);
