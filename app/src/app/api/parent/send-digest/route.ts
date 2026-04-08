import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";
import { getChildWeeklyReport } from "@/lib/parent-report-service";
import { buildWeeklyDigestEmail } from "@/lib/weekly-digest-email";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildNextActions(
  childName: string,
  sessions: number,
  skillsImproved: { name: string; improvement: string }[],
  focusAreas: { name: string; tip: string }[],
): string[] {
  const actions: string[] = [];

  if (sessions === 0) {
    actions.push(`Encourage ${childName} to complete at least one session this week to build momentum.`);
  } else if (sessions < 3) {
    actions.push(`Try to fit in ${3 - sessions} more session${3 - sessions !== 1 ? "s" : ""} this week — consistency is key!`);
  } else {
    actions.push(`Great work this week! Keep ${childName}'s daily learning habit going strong.`);
  }

  if (focusAreas.length > 0) {
    actions.push(`Practice ${focusAreas[0].name} together — ${focusAreas[0].tip}`);
  }

  if (skillsImproved.length > 0) {
    actions.push(`Celebrate ${childName}'s progress in ${skillsImproved[0].name} — positive reinforcement boosts confidence!`);
  } else {
    actions.push(`Ask ${childName} what they learned this week to reinforce retention.`);
  }

  return actions.slice(0, 3);
}

// ─── POST /api/parent/send-digest ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    // Look up guardian email and name
    const guardianRes = await db.query(
      `select email, display_name from public.guardian_profiles where id = $1 limit 1`,
      [guardianId],
    );
    if (!guardianRes.rowCount) {
      return NextResponse.json({ error: "Guardian not found" }, { status: 404 });
    }
    const { email: guardianEmail, display_name: guardianDisplayName } = guardianRes.rows[0] as {
      email: string | null;
      display_name: string | null;
    };

    if (!guardianEmail) {
      return NextResponse.json({ error: "No email address on file for this account" }, { status: 400 });
    }

    // Find the active child (first linked child)
    const linksRes = await db.query(
      `select student_id from public.guardian_student_links where guardian_id = $1 order by created_at asc limit 1`,
      [guardianId],
    );

    // Allow caller to override student
    let studentId: string | null = null;
    try {
      const body = await request.json() as { studentId?: string };
      if (body.studentId) studentId = body.studentId;
    } catch {
      // body may be empty — that's fine
    }

    if (!studentId) {
      studentId = linksRes.rowCount ? (linksRes.rows[0] as { student_id: string }).student_id : null;
    }

    if (!studentId) {
      return NextResponse.json({ error: "No linked children found" }, { status: 400 });
    }

    // Verify guardian owns this student (if a custom studentId was provided)
    if (studentId !== (linksRes.rows[0] as { student_id: string } | undefined)?.student_id) {
      const linkCheck = await db.query(
        `select 1 from public.guardian_student_links where guardian_id = $1 and student_id = $2 limit 1`,
        [guardianId, studentId],
      );
      if (!linkCheck.rowCount) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Fetch weekly report data
    const report = await getChildWeeklyReport(guardianId, studentId, 0);
    if (!report) {
      return NextResponse.json({ error: "Could not load weekly report" }, { status: 500 });
    }

    const childName = report.displayName;
    const parentName = (guardianDisplayName ?? guardianEmail.split("@")[0]);

    // Build skills improved (mastery >= 65%)
    const skillsImproved = report.skills
      .filter((s) => s.masteryPct >= 65)
      .slice(0, 3)
      .map((s) => ({ name: s.skillName, improvement: `${s.masteryPct}% mastery` }));

    // Build focus areas (mastery < 50%, at least 1 attempt)
    const focusAreas = report.skills
      .filter((s) => s.masteryPct < 50 && s.totalCount > 0)
      .slice(0, 2)
      .map((s) => ({
        name: s.skillName,
        tip: `${s.correctCount} of ${s.totalCount} correct — keep practising!`,
      }));

    const nextActions = buildNextActions(childName, report.stats.sessions, skillsImproved, focusAreas);

    const weekEnding = formatDate(report.weekEnd);

    const emailContent = buildWeeklyDigestEmail({
      parentName,
      childName,
      weekEnding,
      sessionsThisWeek: report.stats.sessions,
      totalMinutes: report.stats.learningMinutes,
      streakDays: report.stats.streakDays,
      skillsImproved,
      focusAreas,
      nextActions,
    });

    // Check for API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    // Send via Resend (fetch-based, no SDK dependency required)
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "WonderQuest Learning <onboarding@resend.dev>",
        to: [guardianEmail],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });

    if (!sendRes.ok) {
      const errBody = await sendRes.text();
      console.error("Resend error", sendRes.status, errBody);
      return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
    }

    const sendData = await sendRes.json() as { id?: string };
    return NextResponse.json({ ok: true, messageId: sendData.id ?? null });

  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send digest" },
      { status },
    );
  }
}
