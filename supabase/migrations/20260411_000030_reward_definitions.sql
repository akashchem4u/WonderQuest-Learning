-- ─── Badge & Trophy catalog tables ───────────────────────────────────────────
-- badge_definitions: the master list of all badges (DB-backed, replaces client stubs)
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text NOT NULL UNIQUE,
  badge_key    text GENERATED ALWAYS AS (code) STORED,  -- alias used by existing API route
  display_name text NOT NULL,
  description  text NOT NULL,
  emoji        text NOT NULL DEFAULT '🏅',
  icon_key     text,                                      -- alias used by existing API route
  category     text NOT NULL DEFAULT 'achievement',       -- 'streak','mastery','milestone','achievement'
  required_value integer NOT NULL DEFAULT 1,
  band_code    text,
  sort_order   integer NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trophy_definitions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text NOT NULL UNIQUE,
  trophy_key   text GENERATED ALWAYS AS (code) STORED,   -- alias used by existing API route
  display_name text NOT NULL,
  description  text NOT NULL,
  emoji        text NOT NULL DEFAULT '🏆',
  icon_key     text,                                       -- alias used by existing API route
  tier         text NOT NULL DEFAULT 'bronze',             -- 'bronze','silver','gold'
  category     text NOT NULL DEFAULT 'milestone',
  required_value integer NOT NULL DEFAULT 1,
  band_code    text,
  sort_order   integer NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── Student earned-rewards join tables ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_badges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  badge_id     uuid NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at    timestamptz NOT NULL DEFAULT now(),
  display_seen boolean NOT NULL DEFAULT false,
  UNIQUE (student_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.student_trophies (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  trophy_id    uuid NOT NULL REFERENCES public.trophy_definitions(id) ON DELETE CASCADE,
  earned_at    timestamptz NOT NULL DEFAULT now(),
  display_seen boolean NOT NULL DEFAULT false,
  UNIQUE (student_id, trophy_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id   ON public.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_trophies_student_id ON public.student_trophies(student_id);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_active    ON public.badge_definitions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_trophy_definitions_active   ON public.trophy_definitions(is_active) WHERE is_active = true;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.badge_definitions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trophy_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_trophies   ENABLE ROW LEVEL SECURITY;

-- Catalog tables: service_role only (read by server-side API routes)
CREATE POLICY "service_role_only" ON public.badge_definitions
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_only" ON public.trophy_definitions
  TO service_role USING (true) WITH CHECK (true);

-- Student earned rows: service_role only
CREATE POLICY "service_role_only" ON public.student_badges
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_only" ON public.student_trophies
  TO service_role USING (true) WITH CHECK (true);

-- ─── Seed badge definitions ───────────────────────────────────────────────────
INSERT INTO public.badge_definitions (code, display_name, description, emoji, category, required_value, sort_order) VALUES
  ('first_quest',     'First Quest',      'Completed your first learning quest',           '🌟', 'milestone',    1,  0),
  ('streak_3',        '3-Day Streak',     'Played 3 days in a row',                        '🔥', 'streak',       3,  1),
  ('streak_7',        'Week Warrior',     'Played 7 days in a row',                        '⚡', 'streak',       7,  2),
  ('streak_30',       'Monthly Master',   'Played 30 days in a row',                       '💎', 'streak',      30,  3),
  ('perfect_session', 'Perfect Score',    'Answered every question correctly in a session', '✨', 'achievement',  1,  4),
  ('100_questions',   'Century Club',     'Answered 100 questions total',                  '💯', 'milestone',  100,  5),
  ('500_questions',   'Question Master',  'Answered 500 questions total',                  '🧠', 'milestone',  500,  6),
  ('skill_mastered',  'Skill Master',     'Reached mastery on any skill',                  '🎯', 'mastery',      1,  7),
  ('5_skills',        'Multi-Talented',   'Reached mastery on 5 different skills',         '🌈', 'mastery',      5,  8),
  ('helping_hand',    'Helper',           'Used a hint and then got the answer right',     '💡', 'achievement',  1,  9)
ON CONFLICT (code) DO NOTHING;

-- ─── Seed trophy definitions ──────────────────────────────────────────────────
INSERT INTO public.trophy_definitions (code, display_name, description, emoji, tier, category, required_value, sort_order) VALUES
  ('level_5',      'Level 5 Hero',      'Reached Level 5',                    '🏆', 'bronze', 'milestone',    5,  0),
  ('level_10',     'Level 10 Legend',   'Reached Level 10',                   '👑', 'silver', 'milestone',   10,  1),
  ('level_25',     'Level 25 Champion', 'Reached Level 25',                   '🌠', 'gold',   'milestone',   25,  2),
  ('1000_points',  'Star Collector',    'Earned 1,000 total stars',           '⭐', 'bronze', 'milestone', 1000,  3),
  ('10000_points', 'Galaxy Brain',      'Earned 10,000 total stars',          '🌌', 'gold',   'milestone',10000,  4),
  ('all_bands',    'Band Explorer',     'Played in all 4 learning bands',     '🗺️', 'silver', 'achievement',  4,  5)
ON CONFLICT (code) DO NOTHING;
