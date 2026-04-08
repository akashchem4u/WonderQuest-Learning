// GET /api/parent/child-data-summary?studentId=xxx
// Returns: what data WonderQuest holds for a child, for COPPA transparency
// Requires parent session

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId = request.nextUrl.searchParams.get("studentId")?.trim();
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Verify the student belongs to this guardian
    const ownershipCheck = await db.query(
      `
        select sp.id, sp.display_name, sp.username, sp.created_at
        from public.guardian_student_links gsl
        join public.student_profiles sp on sp.id = gsl.student_id
        where gsl.guardian_id = $1
          and gsl.student_id = $2::uuid
        limit 1
      `,
      [guardianId, studentId],
    );

    if (!ownershipCheck.rowCount) {
      return NextResponse.json(
        { error: "Student not found or not linked to this guardian." },
        { status: 404 },
      );
    }

    const studentRow = ownershipCheck.rows[0];

    // Gather summary stats in parallel
    const [sessionStats, badgeCount, lastActive] = await Promise.all([
      // Sessions count and questions answered from challenge_sessions + session_results
      db.query(
        `
          select
            count(distinct cs.id) as sessions_count,
            coalesce(sum(sr_counts.q_count), 0) as questions_answered
          from public.challenge_sessions cs
          left join (
            select session_id, count(*) as q_count
            from public.session_results
            group by session_id
          ) sr_counts on sr_counts.session_id = cs.id
          where cs.student_id = $1
        `,
        [studentId],
      ),
      // Badges earned from student_notifications
      db.query(
        `
          select count(*) as badges_earned
          from public.student_notifications
          where student_id = $1
            and type = 'badge'
        `,
        [studentId],
      ),
      // Last active from most recent session
      db.query(
        `
          select max(started_at) as last_active_at
          from public.challenge_sessions
          where student_id = $1
        `,
        [studentId],
      ),
    ]);

    const sessionsCount = Number(sessionStats.rows[0]?.sessions_count ?? 0);
    const questionsAnswered = Number(sessionStats.rows[0]?.questions_answered ?? 0);
    const badgesEarned = Number(badgeCount.rows[0]?.badges_earned ?? 0);
    const lastActiveAt = lastActive.rows[0]?.last_active_at
      ? String(lastActive.rows[0].last_active_at)
      : null;

    return NextResponse.json({
      student: {
        id: String(studentRow.id),
        displayName: String(studentRow.display_name),
        username: String(studentRow.username),
        createdAt: String(studentRow.created_at),
      },
      dataSummary: {
        sessionsCount,
        questionsAnswered,
        badgesEarned,
        lastActiveAt,
        dataCategories: [
          "Educational progress data (quiz answers, scores)",
          "Session timing data",
          "Badge and achievement records",
          "Access logs (login timestamps, IP addresses)",
        ],
      },
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch child data summary.",
      },
      { status },
    );
  }
}
