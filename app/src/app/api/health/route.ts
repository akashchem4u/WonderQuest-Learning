import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isLiveQuestionGenerationEnabled } from "@/lib/live-question-generator";

export async function GET() {
  const startedAt = Date.now();

  try {
    const result = await db.query("select now() as now");
    return NextResponse.json({
      ok: true,
      status: "ok",
      database: "reachable",
      liveQuestionGenerationEnabled: isLiveQuestionGenerationEnabled(),
      timestamp:
        result.rows[0]?.now === null || result.rows[0]?.now === undefined
          ? new Date().toISOString()
          : String(result.rows[0].now),
      responseTimeMs: Date.now() - startedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "degraded",
        database: "unreachable",
        liveQuestionGenerationEnabled: isLiveQuestionGenerationEnabled(),
        error: error instanceof Error ? error.message : "Health check failed.",
        responseTimeMs: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}
