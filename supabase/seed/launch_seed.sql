insert into public.theme_families (code, display_name, description)
values
  ('animal-adventure', 'Animal Adventure', 'Friendly animal world for younger children.'),
  ('sports-world', 'Sports World', 'Playful sports-themed progression with movement and score energy.'),
  ('space-explorer', 'Space Explorer', 'Mission-driven world for question bursts and challenge ladders.'),
  ('building-quest', 'Building Quest', 'Builder-themed world for strategy and problem solving.')
on conflict (code) do nothing;

insert into public.launch_bands (
  code,
  display_name,
  sort_order,
  age_min,
  age_max,
  grade_min,
  grade_max,
  primary_theme_code,
  audience_label
)
values
  ('PREK', 'Ages 2 to 5', 1, 2, 5, null, null, 'animal-adventure', 'Pre-primary learners'),
  ('K1', 'Kindergarten to Grade 1', 2, 5, 7, 'K', '1', 'sports-world', 'Early readers'),
  ('G23', 'Grade 2 to Grade 3', 3, 7, 9, '2', '3', 'space-explorer', 'Growing independent learners'),
  ('G45', 'Grade 4 to Grade 5', 4, 9, 11, '4', '5', 'building-quest', 'More strategic learners')
on conflict (code) do nothing;

insert into public.subjects (code, display_name)
values
  ('early-literacy', 'Early Literacy'),
  ('reading', 'Reading'),
  ('phonics', 'Phonics'),
  ('math', 'Math'),
  ('logic', 'Logic'),
  ('world-knowledge', 'World Knowledge')
on conflict (code) do nothing;
