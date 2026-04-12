/**
 * mastery-config.ts
 *
 * Centralised mastery scoring configuration.
 * All mastery targets, EMA weights, and confidence deltas live here
 * so they can be tuned without touching service logic.
 *
 * Version history:
 *   v1 (2026-04-11): Initial extraction from mastery-service.ts
 */

export const MASTERY_VERSION = "v1" as const;

// ── EMA smoothing ─────────────────────────────────────────────────────────────
// nextMastery = currentMastery * EMA_RETAIN + masteryTarget * EMA_ALPHA
export const EMA_RETAIN = 0.82;
export const EMA_ALPHA = 0.18;

// ── Mastery targets by outcome ────────────────────────────────────────────────
// These are the "ideal mastery" values the EMA moves toward after each answer.
export const MASTERY_TARGET_CORRECT_FIRST_TRY = 96;
export const MASTERY_TARGET_CORRECT_RETRY = 76;
export const MASTERY_TARGET_INCORRECT = 28;

// ── Confidence score deltas ───────────────────────────────────────────────────
// Applied directly to confidence_score (0–100) after each answer.
export const CONFIDENCE_DELTA_CORRECT_FIRST_TRY = 8;
export const CONFIDENCE_DELTA_CORRECT_RETRY = 5;
export const CONFIDENCE_DELTA_INCORRECT = -6;

// ── Mastery floor / ceiling ───────────────────────────────────────────────────
export const MASTERY_FLOOR = 0;
export const MASTERY_CEILING = 100;
export const CONFIDENCE_FLOOR = 0;
export const CONFIDENCE_CEILING = 100;
