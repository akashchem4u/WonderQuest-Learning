// GET /api/parent/child-activity-log?studentId=xxx
// Returns last 30 access_sessions (access_type='child') for the child,
// joined with aggregated session_results for COPPA parent oversight.
// Requires parent session.

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
        select 1
        from public.guardian_student_links
        where guardian_id = $1
          and student_id = $2::uuid
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

    // Fetch last 30 child access sessions joined with aggregated session_results.
    // challenge_sessions is matched via started_at proximity since access_sessions
    // doesn't have a direct challenge_session_id FK. We aggregate session_results
    // for each challenge_session that falls within the access session window.
    const result = await db.query(
      `
        select
          acs.id,
          acs.created_at   as started_at,
          acs.last_seen_at as ended_at,
          acs.ip_address,
          acs.user_agent,
          coalesce(sr_agg.questions_answered, 0) as questions_answered,
          coalesce(sr_agg.correct_answers, 0)    as correct_answers,
          cs_agg.session_mode
        from public.access_sessions acs
        -- aggregate challenge sessions that started during this access session window
        left join lateral (
          select
            count(sr.id)                                  as questions_answered,
            count(sr.id) filter (where sr.is_correct)    as correct_answers
          from public.challenge_sessions cs2
          join public.session_results sr on sr.session_id = cs2.id
          where cs2.student_id = acs.student_id
            and cs2.started_at >= acs.created_at
            and cs2.started_at <= coalesce(acs.last_seen_at, acs.expires_at)
        ) sr_agg on true
        left join lateral (
          select cs3.session_mode
          from public.challenge_sessions cs3
          where cs3.student_id = acs.student_id
            and cs3.started_at >= acs.created_at
            and cs3.started_at <= coalesce(acs.last_seen_at, acs.expires_at)
          order by cs3.started_at desc
          limit 1
        ) cs_agg on true
        where acs.student_id = $1::uuid
          and acs.access_type = 'child'
        order by acs.created_at desc
        limit 30
      `,
      [studentId],
    );

    const sessions = result.rows.map((row) => ({
      id: String(row.id),
      startedAt: row.started_at ? String(row.started_at) : null,
      endedAt: row.ended_at ? String(row.ended_at) : null,
      sessionMode: row.session_mode ? String(row.session_mode) : null,
      deviceHint: row.user_agent ? String(row.user_agent) : null,
      ipAddress: row.ip_address ? String(row.ip_address) : null,
      questionsAnswered: Number(row.questions_answered),
      correctAnswers: Number(row.correct_answers),
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch activity log.",
      },
      { status },
    );
  }
}
