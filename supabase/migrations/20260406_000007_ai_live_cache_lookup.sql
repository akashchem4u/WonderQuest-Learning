create index if not exists idx_example_items_live_cache_lookup
  on public.example_items (source_kind, skill_id, launch_band_code, difficulty, example_key)
  where active = true;
