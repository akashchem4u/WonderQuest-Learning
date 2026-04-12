import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  const bandCode = request.nextUrl.searchParams.get("band") ?? null;
  const flagFilter = request.nextUrl.searchParams.get("flag") ?? null; // "likely_too_easy" | "likely_too_hard" | "calibrated"
  const minAttempts = Number(request.nextUrl.searchParams.get("minAttempts") ?? "10");

  const conditions: string[] = [`total_attempts >= ${minAttempts}`];
  const params: unknown[] = [];

  if (bandCode) {
    params.push(bandCode);
    conditions.push(`band_code = $${params.length}`);
  }
  if (flagFilter) {
    params.push(flagFilter);
    conditions.push(`calibration_flag = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await db.query(
      `SELECT
         skill_code, band_code, authored_difficulty,
         COUNT(*) as question_count,
         ROUND(AVG(first_try_success_rate), 1) as avg_first_try_rate,
         ROUND(AVG(overall_success_rate), 1) as avg_success_rate,
         ROUND(AVG(avg_time_sec), 1) as avg_time_sec,
         calibration_flag,
         SUM(total_attempts) as total_attempts
       FROM public.question_calibration
       ${whereClause}
       GROUP BY skill_code, band_code, authored_difficulty, calibration_flag
       ORDER BY band_code, skill_code, authored_difficulty`,
      params,
    );

    return NextResponse.json({
      summary: result.rows,
      filters: { bandCode, flagFilter, minAttempts },
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
