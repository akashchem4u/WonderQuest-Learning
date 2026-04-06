export type BandCode = "PREK" | "K1" | "G23" | "G45";

export type ProficiencyThreshold = {
  minSessions: number;       // min distinct sessions on this skill
  masteryThreshold: number;  // mastery_score must be >= this (0-100)
  maxAvgTimeMs: number;      // avg response time must be <= this
};

export const BAND_THRESHOLDS: Record<BandCode, ProficiencyThreshold> = {
  PREK: { minSessions: 2, masteryThreshold: 72, maxAvgTimeMs: 18000 },
  K1:   { minSessions: 3, masteryThreshold: 78, maxAvgTimeMs: 15000 },
  G23:  { minSessions: 3, masteryThreshold: 82, maxAvgTimeMs: 12000 },
  G45:  { minSessions: 4, masteryThreshold: 85, maxAvgTimeMs: 10000 },
};

// Canonical skill codes per band (subset of all skills — the ones that define grade-level competency)
export const BAND_CURRICULUM: Record<BandCode, string[]> = {
  PREK: [
    "count-to-3", "count-to-5", "bigger-smaller",
    "shape-circle", "shape-triangle", "color-recognition",
    "letter-a-recognition", "letter-b-recognition", "rhyme-match",
    "weather-basics",
  ],
  K1: [
    "add-to-10", "subtract-from-10", "number-bonds-to-5",
    "short-a-sound", "short-e-sound", "short-i-sound",
    "read-simple-word", "sight-words-basic", "decodable-cvc-word",
    "sentence-complete-basics",
  ],
  G23: [
    "add-3-digit", "skip-count-by-5", "time-to-hour", "compare-numbers", "multiply-3x4",
    "main-idea", "cause-effect",
    "pattern-next-item",
    "life-cycle-basics",
    "paragraph-sequence",
  ],
  G45: [
    "compare-fractions", "decimal-place-value", "percent-basics", "ratio-simple",
    "text-evidence", "inference-making", "use-context-clues",
    "ecosystem-change",
    "historical-cause-effect",
    "revision-choice",
  ],
};

export function getBandThreshold(bandCode: string): ProficiencyThreshold {
  return BAND_THRESHOLDS[bandCode as BandCode] ?? BAND_THRESHOLDS["K1"];
}

export function getBandCurriculum(bandCode: string): string[] {
  return BAND_CURRICULUM[bandCode as BandCode] ?? [];
}

export function isProficient(
  masteryScore: number,
  sessionCount: number,
  avgTimeMs: number,
  bandCode: string,
): boolean {
  const t = getBandThreshold(bandCode);
  return (
    sessionCount >= t.minSessions &&
    masteryScore >= t.masteryThreshold &&
    avgTimeMs <= t.maxAvgTimeMs
  );
}
