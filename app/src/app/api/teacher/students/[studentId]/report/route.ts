import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params;
  const auth = await requireTeacherSession(
    request,
    request.nextUrl.searchParams.get("teacherId"),
  );

  if (!auth.ok) {
    return auth.response;
  }

  const { teacherId } = auth;

  // Verify the student is on this teacher's roster
  const rosterCheck = await db.query(
    `select 1 from public.teacher_student_roster
     where teacher_id = $1 and student_id = $2
     limit 1`,
    [teacherId, studentId],
  );

  if (!rosterCheck.rowCount || rosterCheck.rows.length === 0) {
    return NextResponse.json(
      { error: "Student not found or not on your roster" },
      { status: 404 },
    );
  }

  // Fetch student profile
  const profileRes = await db.query(
    `select display_name, avatar_key, launch_band_code, username
     from public.student_profiles
     where id = $1`,
    [studentId],
  );

  if (!profileRes.rows.length) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const profile = profileRes.rows[0];

  // Session stats from canonical tables
  const statsRes = await db.query(
    `select
       count(cs.id) as total_sessions,
       count(cs.id) filter (where cs.ended_at is not null) as completed_sessions,
       coalesce(
         sum(extract(epoch from (cs.ended_at - cs.started_at)) * 1000)
         filter (where cs.ended_at is not null), 0
       ) as total_time_ms,
       coalesce(
         avg(sr_agg.accuracy_pct) filter (where cs.ended_at is not null and cs.total_questions > 0),
         0
       ) as avg_accuracy_pct,
       coalesce(sum(sr_agg.points), 0) as total_points
     from public.challenge_sessions cs
     left join lateral (
       select
         count(*) filter (where correct)::float / nullif(cs.total_questions, 0) * 100 as accuracy_pct,
         coalesce(sum(points_earned), 0) as points
       from public.session_results
       where session_id = cs.id
     ) sr_agg on true
     where cs.student_id = $1`,
    [studentId],
  );

  const stats = statsRes.rows[0] ?? {};

  // Recent sessions (last 10) from canonical tables
  const sessionsRes = await db.query(
    `select
       cs.id,
       cs.session_mode,
       cs.started_at,
       cs.ended_at,
       cs.total_questions,
       cs.effectiveness_score,
       coalesce(sr_agg.correct_answers, 0) as correct_answers,
       coalesce(sr_agg.points_earned, 0) as points_earned
     from public.challenge_sessions cs
     left join lateral (
       select
         count(*) filter (where correct) as correct_answers,
         coalesce(sum(points_earned), 0) as points_earned
       from public.session_results
       where session_id = cs.id
     ) sr_agg on true
     where cs.student_id = $1
     order by cs.started_at desc
     limit 10`,
    [studentId],
  );

  // Streak: count consecutive days with at least one session up to today
  const streakRes = await db.query(
    `select distinct date_trunc('day', started_at at time zone 'UTC') as session_day
     from public.challenge_sessions
     where student_id = $1
     order by session_day desc`,
    [studentId],
  );

  let streakDays = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const oneDay = 86400_000;
  let expected = today.getTime();
  for (const row of streakRes.rows) {
    const dayTs = new Date(row.session_day as string).getTime();
    if (streakDays === 0 && Math.abs(dayTs - expected) > oneDay) break;
    if (dayTs !== expected && dayTs !== expected - oneDay) break;
    streakDays++;
    expected = dayTs - oneDay;
  }

  // Skill progress from canonical student_skill_mastery (mastery_score is 0–100)
  let topSkills: { skillCode: string; masteryPct: number }[] = [];
  let skillGaps: { skillCode: string; masteryPct: number }[] = [];

  try {
    const skillRes = await db.query(
      `select sk.code as skill_code, ssm.mastery_score
       from public.student_skill_mastery ssm
       join public.skills sk on sk.id = ssm.skill_id
       where ssm.student_id = $1
       order by ssm.mastery_score desc`,
      [studentId],
    );

    const allSkills = skillRes.rows.map((r) => ({
      skillCode: r.skill_code as string,
      masteryPct: Math.round(Number(r.mastery_score)),
    }));

    topSkills = allSkills.slice(0, 3);
    skillGaps = [...allSkills].reverse().slice(0, 3).filter((s) => s.masteryPct < 70);
  } catch {
    topSkills = [];
    skillGaps = [];
  }

  return NextResponse.json({
    student: {
      id: studentId,
      displayName: profile.display_name as string,
      avatarKey: (profile.avatar_key as string) ?? "",
      launchBandCode: (profile.launch_band_code as string) ?? "",
      username: (profile.username as string) ?? "",
    },
    stats: {
      totalSessions: Number(stats.total_sessions ?? 0),
      completedSessions: Number(stats.completed_sessions ?? 0),
      totalTimeMs: Number(stats.total_time_ms ?? 0),
      avgAccuracyPct: Math.round(Number(stats.avg_accuracy_pct ?? 0)),
      totalPoints: Number(stats.total_points ?? 0),
      streakDays,
    },
    recentSessions: sessionsRes.rows.map((r) => ({
      id: r.id as string,
      sessionMode: (r.session_mode as string) ?? "",
      startedAt: r.started_at as string,
      endedAt: (r.ended_at as string | null) ?? null,
      correctAnswers: Number(r.correct_answers ?? 0),
      totalQuestions: Number(r.total_questions ?? 0),
      pointsEarned: Number(r.points_earned ?? 0),
      effectivenessScore: r.effectiveness_score != null ? Number(r.effectiveness_score) : null,
    })),
    topSkills,
    skillGaps,
  });
}
