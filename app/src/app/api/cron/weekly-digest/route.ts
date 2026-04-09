import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getChildWeeklyReport } from "@/lib/parent-report-service";
import { buildWeeklyDigestEmail } from "@/lib/weekly-digest-email";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — process all parents

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (or authorized manually)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET?.trim()}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get current week's Monday
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStarting = new Date(now);
  weekStarting.setUTCDate(now.getUTCDate() - daysToMonday);
  weekStarting.setUTCHours(0, 0, 0, 0);
  const weekStartingDate = weekStarting.toISOString().slice(0, 10);

  // Compute week ending date label (Sunday = weekStarting + 6 days)
  const weekEndingDate = new Date(weekStarting);
  weekEndingDate.setUTCDate(weekStarting.getUTCDate() + 6);
  const weekEndingLabel = weekEndingDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  // Fetch all guardians opted into weekly digest
  const guardiansResult = await db.query(`
    SELECT DISTINCT gp.id, gp.email, gp.display_name
    FROM public.guardian_profiles gp
    JOIN public.guardian_student_links gsl ON gsl.guardian_id = gp.id
    LEFT JOIN public.notification_preferences np ON np.guardian_id = gp.id
    WHERE gp.email IS NOT NULL
      AND gp.email != ''
      AND (np.email_weekly_digest IS NULL OR np.email_weekly_digest = true)
  `);

  const results = { sent: 0, skipped: 0, failed: 0, errors: [] as string[] };

  for (const guardian of guardiansResult.rows) {
    // Get all linked children
    const childrenResult = await db.query(
      `SELECT student_id FROM public.guardian_student_links WHERE guardian_id = $1`,
      [guardian.id],
    );

    for (const { student_id } of childrenResult.rows) {
      // Check dedup
      const alreadySent = await db.query(
        `SELECT id FROM public.weekly_digest_sends WHERE guardian_id=$1 AND student_id=$2 AND week_starting=$3`,
        [guardian.id, student_id, weekStartingDate],
      );
      if (alreadySent.rowCount) {
        results.skipped++;
        continue;
      }

      try {
        const report = await getChildWeeklyReport(guardian.id, student_id, 0);
        if (!report || report.stats.sessions === 0) {
          results.skipped++;
          continue;
        }

        const skillsImproved = report.skills
          .filter((s) => s.masteryPct >= 65)
          .slice(0, 3)
          .map((s) => ({ name: s.skillName, improvement: `${s.masteryPct}% mastery` }));

        const focusAreas = report.skills
          .filter((s) => s.masteryPct < 50)
          .slice(0, 2)
          .map((s) => ({ name: s.skillName, tip: "Keep practicing to build confidence" }));

        const nextActions = [
          report.stats.sessions < 3
            ? "Try to complete 3 sessions this week"
            : "Keep the momentum going!",
          focusAreas[0]
            ? `Practice ${focusAreas[0].name} a bit more`
            : "Explore a new skill area",
          report.stats.streakDays >= 3
            ? `Protect that ${report.stats.streakDays}-day streak!`
            : "Play 2 days in a row to start a streak",
        ];

        const { subject, html, text } = buildWeeklyDigestEmail({
          parentName: (guardian.display_name as string | null) ?? "there",
          childName: report.displayName,
          weekEnding: weekEndingLabel,
          sessionsThisWeek: report.stats.sessions,
          totalMinutes: report.stats.learningMinutes,
          streakDays: report.stats.streakDays,
          skillsImproved,
          focusAreas,
          nextActions,
        });

        await sendEmail({
          to: guardian.email as string,
          subject,
          html,
          text,
        });

        // Record send
        await db.query(
          `INSERT INTO public.weekly_digest_sends (guardian_id, student_id, week_starting) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [guardian.id, student_id, weekStartingDate],
        );
        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push(
          `${guardian.id}/${student_id}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  console.log("Weekly digest results:", results);
  return NextResponse.json({ ok: true, ...results });
}
