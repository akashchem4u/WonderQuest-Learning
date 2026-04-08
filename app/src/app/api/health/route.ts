import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isLiveQuestionGenerationEnabled } from "@/lib/live-question-generator";

export async function GET() {
  const startedAt = Date.now();

  const dbCheck = await Promise.race([
    db.query("SELECT 1").then(() => true).catch(() => false),
    new Promise<false>((resolve) => setTimeout(() => resolve(false), 3000)),
  ]);

  const liveQuestionGenerationEnabled = isLiveQuestionGenerationEnabled();

  return NextResponse.json(
    {
      // Legacy fields — kept for smoke check + backward compat
      status: dbCheck ? "ok" : "degraded",
      liveQuestionGenerationEnabled,
      // Enhanced fields
      ok: dbCheck,
      db: dbCheck ? "connected" : "unavailable",
      liveQuestions: liveQuestionGenerationEnabled,
      ts: new Date().toISOString(),
      responseTimeMs: Date.now() - startedAt,
    },
    { status: dbCheck ? 200 : 503 },
  );
}
