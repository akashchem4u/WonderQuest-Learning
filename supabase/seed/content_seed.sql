insert into public.skills (
  code,
  subject_code,
  launch_band_code,
  display_name,
  description
)
values
  ('letter-b-recognition', 'early-literacy', 'PREK', 'Letter B Recognition', 'Identify the uppercase letter B in a small set.'),
  ('count-to-3', 'math', 'PREK', 'Count to 3', 'Count a small set of visible objects accurately.'),
  ('shape-circle', 'math', 'PREK', 'Recognize Circles', 'Identify the circle from a few common shapes.'),
  ('short-a-sound', 'phonics', 'K1', 'Short A Sound', 'Match simple words with the short a vowel sound.'),
  ('add-to-10', 'math', 'K1', 'Addition to 10', 'Solve single-step addition problems within 10.'),
  ('read-simple-word', 'reading', 'K1', 'Read Simple Word', 'Recognize and select a short common word.'),
  ('main-idea', 'reading', 'G23', 'Find Main Idea', 'Determine what a short paragraph is mostly about.'),
  ('multiply-3x4', 'math', 'G23', 'Multiply 3 by 4', 'Connect equal groups to a multiplication fact.'),
  ('pattern-next-item', 'logic', 'G23', 'Predict Pattern', 'Choose the next item in a repeating pattern.'),
  ('compare-fractions', 'math', 'G45', 'Compare Fractions', 'Compare simple fractions with equal numerators or denominators.'),
  ('use-context-clues', 'reading', 'G45', 'Use Context Clues', 'Use nearby sentence clues to infer word meaning.'),
  ('engineering-basics', 'world-knowledge', 'G45', 'Engineering Basics', 'Understand simple why-questions about testing and design.')
on conflict (code) do nothing;

insert into public.content_templates (
  template_key,
  subject_code,
  launch_band_code,
  modality,
  reading_load,
  prompt_pattern,
  answer_pattern,
  explanation_pattern
)
values
  ('tap-letter-choice', 'early-literacy', 'PREK', 'tap', 'low', 'Tap the correct letter.', 'single choice from 3 options', 'voice-led letter reminder with simple object association'),
  ('count-visible-objects', 'math', 'PREK', 'tap', 'low', 'How many objects do you see?', 'single number choice from 3 options', 'slow count-along with animated objects'),
  ('phonics-word-pick', 'phonics', 'K1', 'tap', 'medium', 'Pick the word with the target sound.', 'single choice from 3 words', 'spoken sound-out with mascot example'),
  ('simple-addition-scoreboard', 'math', 'K1', 'tap', 'medium', 'Solve a one-step addition problem.', 'single number choice from 3 options', 'count-on with score fill animation'),
  ('paragraph-main-idea', 'reading', 'G23', 'tap', 'medium', 'Read a short paragraph and choose its main idea.', 'single choice from 3 summaries', 'mission recap showing detail versus main idea'),
  ('multiplication-groups', 'math', 'G23', 'tap', 'medium', 'Match equal groups to a multiplication fact.', 'single choice from 3 totals', 'repeated addition visual array'),
  ('fraction-compare', 'math', 'G45', 'tap', 'medium', 'Compare two fractions and choose the larger one.', 'single choice from 3 options', 'tile comparison with matched whole shapes'),
  ('context-clue-word-meaning', 'reading', 'G45', 'tap', 'high', 'Use a sentence to infer a word meaning.', 'single choice from 3 meanings', 'highlight surrounding clue words and reason through them')
on conflict (template_key) do nothing;
