import { NextRequest, NextResponse } from "next/server";
import { requireOwnerSession } from "@/lib/owner-session";
import {
  MASTERY_VERSION,
  EMA_RETAIN,
  EMA_ALPHA,
  MASTERY_TARGET_CORRECT_FIRST_TRY,
  MASTERY_TARGET_CORRECT_RETRY,
  MASTERY_TARGET_INCORRECT,
} from "@/lib/mastery-config";
import { BAND_THRESHOLDS } from "@/lib/skill-curriculum";

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    mastery: {
      version: MASTERY_VERSION,
      emaRetain: EMA_RETAIN,
      emaAlpha: EMA_ALPHA,
      targets: {
        correctFirstTry: MASTERY_TARGET_CORRECT_FIRST_TRY,
        correctRetry: MASTERY_TARGET_CORRECT_RETRY,
        incorrect: MASTERY_TARGET_INCORRECT,
      },
    },
    proficiencyThresholds: BAND_THRESHOLDS,
    canonicalTables: [
      "challenge_sessions",
      "session_results",
      "student_skill_mastery",
      "progression_states",
    ],
  });
}
