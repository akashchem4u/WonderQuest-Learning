create index if not exists idx_example_items_band_order_active
  on public.example_items (launch_band_code, difficulty, example_key)
  where active = true;

create index if not exists idx_example_items_skill_order_active
  on public.example_items (skill_id, difficulty, example_key)
  where active = true;
