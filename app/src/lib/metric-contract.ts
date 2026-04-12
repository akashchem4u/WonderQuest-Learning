/**
 * metric-contract.ts
 *
 * Canonical metric dictionary for WonderQuest.
 * Every metric used across child, parent, teacher, and owner surfaces
 * should reference the definitions here to stay consistent.
 *
 * Version: 1.0 — established 2026-04-11
 */

// ── Accuracy ──────────────────────────────────────────────────────────────────
// Raw correct/total. No smoothing. Resets per session or per time window.
// Range: 0–100 (percentage)
// Source: session_results.correct
export const METRIC_ACCURACY = {
  name: "accuracy",
  label: "Accuracy",
  formula: "correct_answers / total_answers × 100",
  range: "0–100",
  note: "Raw ratio. Does not account for retries or response speed.",
} as const;

// ── Mastery Score ─────────────────────────────────────────────────────────────
// EMA-smoothed per-skill score. Moves toward a target after each answer.
// Range: 0–100
// Source: student_skill_mastery.mastery_score
// Update: mastery = mastery × EMA_RETAIN + masteryTarget × EMA_ALPHA
export const METRIC_MASTERY = {
  name: "mastery_score",
  label: "Mastery",
  formula: "EMA(mastery_target) — see mastery-config.ts",
  range: "0–100",
  note: "Smoothed. Accounts for firstTry, retry, and incorrect outcomes.",
} as const;

// ── Confidence Score ──────────────────────────────────────────────────────────
// Cumulative delta-based score reflecting response consistency.
// Range: 0–100
// Source: student_skill_mastery.confidence_score
export const METRIC_CONFIDENCE = {
  name: "confidence_score",
  label: "Confidence",
  formula: "confidence += confidenceDelta(outcome)",
  range: "0–100",
  note: "+8 first-try correct, +5 retry correct, -6 incorrect.",
} as const;

// ── Proficiency ───────────────────────────────────────────────────────────────
// Binary: a skill is proficient or not. Set when mastery + sessions + speed thresholds are met.
// Source: student_skill_mastery.proficient_at (non-null = proficient)
// Thresholds per band: see skill-curriculum.ts BAND_THRESHOLDS
export const METRIC_PROFICIENCY = {
  name: "proficient",
  label: "Proficiency",
  formula: "mastery_score >= threshold AND session_count >= min_sessions AND avg_time_ms <= max_time",
  range: "true / false",
  note: "Thresholds vary by band (PREK: 72, K1: 78, G23: 82, G45: 85, G6: 88).",
} as const;

// ── Curriculum Completion (Grade Readiness) ───────────────────────────────────
// Weighted completion of grade-level curriculum based on proficient skill counts.
// NOT a mastery average. Labelled "Grade Readiness" in the parent UI.
// Formula: essential_pct × 0.60 + on_track_pct × 0.30 + enrichment_pct × 0.10
// Range: 0–100
// Source: student_skill_mastery.proficient_at + curriculum-standards.ts priority
export const METRIC_GRADE_READINESS = {
  name: "grade_readiness",
  label: "Grade Readiness",
  formula: "essentialProficient/essentialTotal×60 + onTrackProficient/onTrackTotal×30 + enrichmentProficient/enrichmentTotal×10",
  range: "0–100",
  note: "Curriculum-completion metric, not a mastery average. Interpret as: 'how much of this grade's curriculum is mastered?'",
} as const;

// ── Consistency ───────────────────────────────────────────────────────────────
// Distinct active days with at least one session in a 30-day window.
// Range: 0–100 (percentage of 30 days)
// Source: challenge_sessions.started_at — COUNT(DISTINCT date)
export const METRIC_CONSISTENCY = {
  name: "consistency",
  label: "Consistency",
  formula: "COUNT(DISTINCT session_date_in_last_30_days) / 30 × 100",
  range: "0–100",
  note: "Multiple sessions on the same day count as ONE active day.",
} as const;

// ── All metrics dictionary ────────────────────────────────────────────────────
export const METRIC_DICTIONARY = {
  accuracy: METRIC_ACCURACY,
  mastery: METRIC_MASTERY,
  confidence: METRIC_CONFIDENCE,
  proficiency: METRIC_PROFICIENCY,
  gradeReadiness: METRIC_GRADE_READINESS,
  consistency: METRIC_CONSISTENCY,
} as const;

export type MetricKey = keyof typeof METRIC_DICTIONARY;
