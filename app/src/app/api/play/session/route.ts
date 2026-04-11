import { NextRequest, NextResponse } from "next/server";
import {
  ChildAccessSessionError,
  requireChildAccessSession,
} from "@/lib/child-access";
import { createPlaySession } from "@/lib/prototype-service";
import { track } from "@/lib/analytics";
import { db } from "@/lib/db";
import { canPlaySession, getLimits, type Plan } from "@/lib/plan-limits";

// Give this route 30 s on Vercel (default is 10–15 s which can kill DB + AI warmup)
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessSession = await requireChildAccessSession(request);

    // Plan gate: check daily session limit
    const limitRow = await db.query(
      `SELECT gp.plan,
              COUNT(cs.id) AS sessions_today
         FROM public.guardian_student_links gsl
         JOIN public.guardian_profiles gp ON gp.id = gsl.guardian_id
         LEFT JOIN public.challenge_sessions cs
           ON cs.student_id = gsl.student_id
          AND cs.started_at >= CURRENT_DATE
        WHERE gsl.student_id = $1
        GROUP BY gp.plan
        LIMIT 1`,
      [accessSession.studentId],
    );
    const limitData = limitRow.rows[0] as { plan: string; sessions_today: string } | undefined;
    const plan = (limitData?.plan ?? "free") as Plan;
    const sessionsToday = parseInt(limitData?.sessions_today ?? "0", 10);
    if (!canPlaySession(plan, sessionsToday)) {
      const limit = getLimits(plan).sessionsPerDay as number;
      return NextResponse.json(
        { error: "daily_limit_reached", sessionsToday, limit },
        { status: 403 },
      );
    }

    const result = await createPlaySession({
      studentId: accessSession.studentId,
      sessionMode: body.sessionMode,
      chosenQuestId: typeof body.chosenQuestId === "string" ? body.chosenQuestId : undefined,
      chosenQuestTable: body.chosenQuestTable === "teacher_pushed_sessions" || body.chosenQuestTable === "guardian_pushed_activities"
        ? body.chosenQuestTable
        : undefined,
    });
    void track(accessSession.studentId, "session_started", {
      band: result.student.launchBandCode,
      session_mode: body.sessionMode ?? "guided-quest",
      level: result.progression.currentLevel,
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ChildAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start the play session." },
      { status },
    );
  }
}
