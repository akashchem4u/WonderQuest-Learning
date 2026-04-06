import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { getParentReport as getLegacyParentReport } from "@/lib/prototype-service";

function resolveChildId(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get("childId")?.trim() ||
    request.nextUrl.searchParams.get("studentId")?.trim() ||
    null
  );
}

function parseWeekOffset(value: string | null) {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
}

function startOfWeekUtc(offsetWeeks: number) {
  const now = new Date();
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const mondayIndex = (current.getUTCDay() + 6) % 7;
  current.setUTCDate(current.getUTCDate() - mondayIndex - offsetWeeks * 7);
  return current;
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(weekStart: Date, weekEnd: Date, weekOffset: number) {
  if (weekOffset === 0) {
    return "This week";
  }

  if (weekOffset === 1) {
    return "Last week";
  }

  const startLabel = weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const endLabel = weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return `${startLabel} - ${endLabel}`;
}

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const childId = resolveChildId(request);
    const weekOffset = parseWeekOffset(
      request.nextUrl.searchParams.get("weekOffset"),
    );
    const legacy = await getLegacyParentReport(guardianId, {
      childId,
    });

    const weekStart = startOfWeekUtc(weekOffset);
    const weekEnd = addUtcDays(weekStart, 6);
    const weekAfter = addUtcDays(weekStart, 7);

    const student = await db.query(
      `
        select
          sp.id,
          sp.display_name,
          sp.avatar_key,
          sp.launch_band_code,
          coalesce(ps.streak_count, 0) as streak_count
        from public.guardian_student_links gsl
        join public.student_profiles sp
          on sp.id = gsl.student_id
        left join public.progression_states ps
          on ps.student_id = sp.id
        where gsl.guardian_id = $1
          and ($2::uuid is null or sp.id = $2::uuid)
        order by sp.display_name asc
        limit 1
      `,
      [guardianId, childId],
    );

    if (!student.rowCount) {
      return NextResponse.json(
        { error: "Linked child was not found for this guardian." },
        { status: 404 },
      );
    }

    const studentRow = student.rows[0];
    const studentId = String(studentRow.id);

    const [sessionLog, skillBreakdown, heatmap, badgeCount] = await Promise.all([
      db.query(
        `
          select
            cs.id as session_id,
            cs.started_at,
            cs.ended_at,
            cs.session_mode,
            cs.effectiveness_score,
            coalesce(sum(sr.points_earned), 0) as stars_earned,
            count(sr.id) filter (where sr.correct) as correct_count,
            count(sr.id) as total_questions
          from public.challenge_sessions cs
          left join public.session_results sr
            on sr.session_id = cs.id
          where cs.student_id = $1
            and cs.started_at >= $2
            and cs.started_at < $3
          group by
            cs.id,
            cs.started_at,
            cs.ended_at,
            cs.session_mode,
            cs.effectiveness_score
          order by cs.started_at desc
        `,
        [studentId, weekStart.toISOString(), weekAfter.toISOString()],
      ),
      db.query(
        `
          select
            sk.id as skill_id,
            sk.display_name as skill_name,
            sk.subject_code,
            count(sr.id) as total_count,
            count(*) filter (where sr.correct) as correct_count,
            count(distinct cs.id) as session_count
          from public.session_results sr
          join public.challenge_sessions cs
            on cs.id = sr.session_id
          join public.skills sk
            on sk.id = sr.skill_id
          where cs.student_id = $1
            and cs.started_at >= $2
            and cs.started_at < $3
          group by sk.id, sk.display_name, sk.subject_code
          order by total_count desc, sk.display_name asc
        `,
        [studentId, weekStart.toISOString(), weekAfter.toISOString()],
      ),
      db.query(
        `
          with day_window as (
            select generate_series($2::date, $3::date, interval '1 day')::date as day
          )
          select
            dw.day,
            coalesce(count(distinct cs.id), 0) as session_count
          from day_window dw
          left join public.challenge_sessions cs
            on cs.student_id = $1
           and cs.started_at::date = dw.day
          group by dw.day
          order by dw.day asc
        `,
        [studentId, formatIsoDate(weekStart), formatIsoDate(weekEnd)],
      ),
      db.query(
        `
          select count(*) as badge_count
          from public.student_notifications sn
          where sn.student_id = $1
            and (sn.guardian_id is null or sn.guardian_id = $2)
            and sn.type = 'badge'
            and sn.created_at >= $3
            and sn.created_at < $4
        `,
        [studentId, guardianId, weekStart.toISOString(), weekAfter.toISOString()],
      ),
    ]);

    const sessions = sessionLog.rows.map((row) => ({
      sessionId: String(row.session_id),
      startedAt: String(row.started_at),
      sessionMode: String(row.session_mode),
      starsEarned: Number(row.stars_earned ?? 0),
      correctCount: Number(row.correct_count ?? 0),
      totalQuestions: Number(row.total_questions ?? 0),
      durationMinutes:
        row.ended_at === null || row.ended_at === undefined
          ? null
          : Math.max(
              1,
              Math.round(
                (new Date(String(row.ended_at)).getTime() -
                  new Date(String(row.started_at)).getTime()) /
                  60_000,
              ),
            ),
      effectivenessScore:
        row.effectiveness_score === null || row.effectiveness_score === undefined
          ? null
          : Number(row.effectiveness_score),
    }));

    const learningMinutes = sessions.reduce(
      (total, session) => total + (session.durationMinutes ?? 0),
      0,
    );
    const starsEarned = sessions.reduce(
      (total, session) => total + session.starsEarned,
      0,
    );

    const report = {
      studentId,
      displayName: String(studentRow.display_name),
      launchBandCode: String(studentRow.launch_band_code),
      avatarKey: String(studentRow.avatar_key),
      weekLabel: formatWeekLabel(weekStart, weekEnd, weekOffset),
      weekStart: formatIsoDate(weekStart),
      weekEnd: formatIsoDate(weekEnd),
      stats: {
        starsEarned,
        sessions: sessions.length,
        learningMinutes,
        newBadges: Number(badgeCount.rows[0]?.badge_count ?? 0),
        streakDays: Number(studentRow.streak_count ?? 0),
      },
      skills: skillBreakdown.rows.map((row) => {
        const totalCount = Number(row.total_count ?? 0);
        const correctCount = Number(row.correct_count ?? 0);
        return {
          skillId: String(row.skill_id),
          skillName: String(row.skill_name),
          subject: String(row.subject_code),
          correctCount,
          totalCount,
          masteryPct:
            totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
          sessionCount: Number(row.session_count ?? 0),
        };
      }),
      sessionLog: sessions,
      heatmap: heatmap.rows.map((row) => ({
        dayLabel: new Date(`${String(row.day)}T00:00:00.000Z`).toLocaleDateString(
          "en-US",
          { weekday: "short", timeZone: "UTC" },
        ),
        date: String(row.day).slice(0, 10),
        sessionCount: Number(row.session_count ?? 0),
      })),
    };

    return NextResponse.json({
      ...legacy,
      report,
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Parent report lookup failed." },
      { status },
    );
  }
}
