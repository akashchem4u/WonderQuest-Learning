-- 1. Add priority column to skills table (source of truth for skill tiers)
alter table public.skills
  add column if not exists priority text not null default 'on-track'
  check (priority in ('essential', 'on-track', 'enrichment', 'challenge'));

-- 2. Seed priority values for all known skill codes
update public.skills set priority = 'essential' where code in (
  'color-recognition','shape-circle','count-to-3','bigger-smaller',
  'add-to-10','sight-words-basic','read-simple-word','short-a-sound',
  'add-3-digit','multiply-3x4','main-idea','cause-effect',
  'fraction-half','data-bar-chart','long-division','paragraph-sequence'
);
update public.skills set priority = 'on-track' where code in (
  'letter-a-recognition','letter-b-recognition','rhyme-basic','pattern-ab-basic',
  'short-e-sound','short-i-sound','count-to-20','subtract-to-10',
  'skip-count-by-5','compare-numbers','time-to-hour','paragraph-sequence',
  'measurement-cm','compare-numbers','estimation-round','story-character'
);
update public.skills set priority = 'enrichment' where code in (
  'animal-sounds','body-parts','same-different',
  'sentence-building','main-idea','time-to-hour','shape-3d-basic',
  'life-cycle-basics','pattern-next-item','fraction-half','measurement-cm',
  'earth-layers','story-character','pattern-complex','estimation-round'
);
update public.skills set priority = 'challenge' where code in (
  'season-basic','feelings-basic',
  'life-cycle-basics','weather-types','pattern-next-item',
  'earth-layers','story-character','data-bar-chart',
  'energy-forms','persuasive-text','geometry-area','pattern-complex'
);
