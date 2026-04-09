import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPushToGuardian } from "@/lib/push-service";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — process all reminders

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (or authorized manually)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET?.trim()}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find students who haven't played today but have played in the past 7 days
  // and whose guardian has push subscriptions and streak reminder enabled
  const studentsResult = await db.query(`
    SELECT DISTINCT
      sp.id AS student_id,
      sp.display_name AS student_name,
      gsl.guardian_id
    FROM public.student_profiles sp
    JOIN public.guardian_student_links gsl ON gsl.student_id = sp.id
    JOIN public.push_subscriptions ps ON ps.guardian_id = gsl.guardian_id
    LEFT JOIN public.challenge_sessions cs ON cs.student_id = sp.id
      AND cs.started_at >= CURRENT_DATE
    LEFT JOIN public.notification_preferences np ON np.guardian_id = gsl.guardian_id
    WHERE cs.id IS NULL  -- no session today
      AND (np.push_streak_reminder IS NULL OR np.push_streak_reminder = true)
      AND EXISTS (
        SELECT 1 FROM public.challenge_sessions cs2
        WHERE cs2.student_id = sp.id
          AND cs2.started_at >= NOW() - INTERVAL '7 days'
      )
  `);

  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const row of studentsResult.rows) {
    try {
      await sendPushToGuardian(row.guardian_id as string, {
        title: `${row.student_name as string} hasn't played yet today 🎮`,
        body: "Tap to start a session!",
        url: "/parent",
      });
      results.sent++;
    } catch (err) {
      results.failed++;
      results.errors.push(
        `${row.guardian_id as string}/${row.student_id as string}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  console.log("Play reminder results:", results);
  return NextResponse.json({ ok: true, ...results });
}
