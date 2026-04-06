const TEACHER_BAND_LABELS: Record<string, string> = {
  PREK: "Pre-K",
  K1: "K-1",
  G23: "G2-3",
  G45: "G4-5",
  G6: "Grade 6",
};

export function normalizeTeacherBandCode(value: string) {
  return value.trim().toUpperCase();
}

export function formatTeacherBandLabel(value: string) {
  return TEACHER_BAND_LABELS[normalizeTeacherBandCode(value)] ?? value.trim();
}

