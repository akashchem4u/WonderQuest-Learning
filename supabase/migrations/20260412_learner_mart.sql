-- ============================================================
-- WonderQuest Learner Mart — reusable reporting rollup views
-- WQ-BL-004 | Phase 2 | Canonical learner reporting layer
-- ============================================================

-- 1. Per-student session summary (rolling 30 days)
CREATE OR REPLACE VIEW public.v_student_session_summary AS
SELECT
  cs.student_id,
  COUNT(cs.id)                                                          AS total_sessions,
  COUNT(cs.id) FILTER (WHERE cs.ended_at IS NOT NULL)                  AS completed_sessions,
  COALESCE(SUM(EXTRACT(EPOCH FROM (cs.ended_at - cs.started_at)) * 1000)
    FILTER (WHERE cs.ended_at IS NOT NULL), 0)::BIGINT                 AS total_time_ms,
  COALESCE(AVG(
    (SELECT COUNT(*) FILTER (WHERE sr.correct)::FLOAT /
            NULLIF(COUNT(*), 0) * 100
       FROM public.session_results sr WHERE sr.session_id = cs.id)
  ) FILTER (WHERE cs.ended_at IS NOT NULL), 0)::NUMERIC(5,1)           AS avg_accuracy_pct,
  COALESCE(SUM(
    (SELECT COALESCE(SUM(sr.points_earned), 0)
       FROM public.session_results sr WHERE sr.session_id = cs.id)
  ), 0)::BIGINT                                                         AS total_points,
  COUNT(DISTINCT DATE_TRUNC('day', cs.started_at)::DATE)               AS distinct_active_days,
  MAX(cs.started_at)                                                    AS last_session_at,
  MIN(cs.started_at)                                                    AS first_session_at
FROM public.challenge_sessions cs
WHERE cs.started_at >= NOW() - INTERVAL '30 days'
GROUP BY cs.student_id;

-- 2. Per-student skill mastery snapshot (latest mastery per skill)
CREATE OR REPLACE VIEW public.v_student_skill_snapshot AS
SELECT
  ssm.student_id,
  ssm.skill_id,
  sk.code                                                               AS skill_code,
  sk.display_name,
  sub.name                                                              AS subject_name,
  ssm.mastery_score,
  CASE
    WHEN ssm.mastery_score >= 80 THEN 'strong'
    WHEN ssm.mastery_score >= 50 THEN 'building'
    ELSE 'started'
  END                                                                   AS mastery_status,
  ssm.confidence_score,
  ssm.consecutive_incorrect,
  ssm.last_seen_at,
  ssm.proficient_at IS NOT NULL                                         AS is_proficient
FROM public.student_skill_mastery ssm
JOIN public.skills sk ON sk.id = ssm.skill_id
LEFT JOIN public.subjects sub ON sub.code = sk.subject_code;

-- 3. Per-student weekly streak (last 14 days)
CREATE OR REPLACE VIEW public.v_student_streak AS
SELECT
  student_id,
  COUNT(DISTINCT DATE_TRUNC('day', started_at)::DATE)
    FILTER (WHERE started_at >= NOW() - INTERVAL '14 days') AS streak_days_14d,
  COUNT(DISTINCT DATE_TRUNC('day', started_at)::DATE)
    FILTER (WHERE started_at >= NOW() - INTERVAL '7 days')  AS streak_days_7d
FROM public.challenge_sessions
GROUP BY student_id;

-- 4. Class-level mastery rollup for teacher dashboard
CREATE OR REPLACE VIEW public.v_class_skill_rollup AS
SELECT
  tsr.teacher_id,
  sk.code                                                               AS skill_code,
  sk.display_name,
  sub.name                                                              AS subject_name,
  COUNT(DISTINCT tsr.student_id)                                        AS enrolled_students,
  COUNT(DISTINCT ssm.student_id)
    FILTER (WHERE ssm.mastery_score IS NOT NULL)                        AS students_with_data,
  ROUND(AVG(ssm.mastery_score)
    FILTER (WHERE ssm.mastery_score IS NOT NULL), 1)                    AS avg_mastery,
  COUNT(DISTINCT ssm.student_id)
    FILTER (WHERE ssm.mastery_score >= 80)                              AS strong_count,
  COUNT(DISTINCT ssm.student_id)
    FILTER (WHERE ssm.mastery_score >= 50 AND ssm.mastery_score < 80)   AS building_count,
  COUNT(DISTINCT ssm.student_id)
    FILTER (WHERE ssm.mastery_score < 50)                               AS started_count,
  COUNT(DISTINCT ssm.student_id)
    FILTER (WHERE ssm.consecutive_incorrect >= 2)                       AS struggling_count
FROM public.teacher_student_roster tsr
JOIN public.student_skill_mastery ssm ON ssm.student_id = tsr.student_id
JOIN public.skills sk ON sk.id = ssm.skill_id
LEFT JOIN public.subjects sub ON sub.code = sk.subject_code
GROUP BY tsr.teacher_id, sk.code, sk.display_name, sub.name;

-- 5. Guardian child progress card (one row per parent-child pair)
CREATE OR REPLACE VIEW public.v_guardian_child_card AS
SELECT
  gsl.guardian_id,
  sp.id                                                                 AS student_id,
  sp.display_name,
  sp.username,
  sp.avatar_key,
  sp.launch_band_code,
  vss.total_points,
  vss.completed_sessions,
  vss.avg_accuracy_pct,
  vss.distinct_active_days,
  vss.last_session_at,
  vst.streak_days_14d
FROM public.guardian_student_links gsl
JOIN public.student_profiles sp ON sp.id = gsl.student_id
LEFT JOIN public.v_student_session_summary vss ON vss.student_id = sp.id
LEFT JOIN public.v_student_streak vst ON vst.student_id = sp.id;

-- Indexes to support view performance
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_student_started
  ON public.challenge_sessions (student_id, started_at DESC);

COMMENT ON VIEW public.v_student_session_summary IS 'Rolling 30-day session rollup per student. Used by parent dashboard and teacher reports.';
COMMENT ON VIEW public.v_student_skill_snapshot IS 'Current mastery state per student per skill. Canonical source for all skill displays.';
COMMENT ON VIEW public.v_student_streak IS 'Streak days computed from distinct active days in last 7/14 days.';
COMMENT ON VIEW public.v_class_skill_rollup IS 'Teacher-facing class skill mastery rollup. One row per teacher+skill.';
COMMENT ON VIEW public.v_guardian_child_card IS 'Parent-facing child card with live session summary. One row per guardian-child link.';
