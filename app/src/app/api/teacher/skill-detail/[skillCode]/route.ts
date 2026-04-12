import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatTeacherBandLabel } from "@/lib/teacher-band-format";
import { requireTeacherSession } from "@/lib/teacher-session";

// GET /api/teacher/skill-detail/[skillCode]?teacherId=xxx
// Returns: skillName, totalStudents, mastered, building, started, avgAccuracy,
//          weeklyTrend[{week, sessions, accuracy}],
//          studentBreakdown[{studentId, name, mastery, status, sessions, lastActive}]

function masteryStatus(masteryScore: number | null, accuracy: number): "Strong" | "Building" | "Started" {
  const score = masteryScore ?? accuracy;
  if (score >= 80) return "Strong";
  if (score >= 50) return "Building";
  return "Started";
}

function relativeDate(isoDate: string | null): string {
  if (!isoDate) return "Never";
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff <= 6) return `${diff} days ago`;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ skillCode: string }> },
) {
  const { skillCode } = await params;
  const auth = await requireTeacherSession(
    request,
    request.nextUrl.searchParams.get("teacherId"),
  );

  if (!auth.ok) {
    return auth.response;
  }

  if (!skillCode) {
    return NextResponse.json({ error: "skillCode is required" }, { status: 400 });
  }

  const { teacherId } = auth;

  try {
    // -- Skill metadata --
    const skillMeta = await db.query(
      `select sk.code, sk.display_name, sk.launch_band_code
       from public.skills sk
       where sk.code = $1
       limit 1`,
      [skillCode],
    );

    const skillRow = skillMeta.rows[0] ?? null;
    const skillName = (skillRow?.display_name as string | null) ?? skillCode;
    const launchBandCode = (skillRow?.launch_band_code as string | null) ?? "";
    const bandLabel = launchBandCode ? formatTeacherBandLabel(launchBandCode) : "";

    // -- Per-student aggregate (only teacher's roster) --
    const studentAgg = await db.query(
      `select
         sp.id as student_id,
         sp.display_name,
         count(sr.id) as total_attempts,
         count(*) filter (where sr.correct) as correct_attempts,
         max(cs.started_at) as last_active,
         ssm.mastery_score,
         ssm.proficient_at
       from public.teacher_student_roster tsr
       join public.student_profiles sp
         on sp.id = tsr.student_id
       join public.challenge_sessions cs
         on cs.student_id = sp.id
       join public.session_results sr
         on sr.session_id = cs.id
       join public.skills sk
         on sk.id = sr.skill_id
       left join public.student_skill_mastery ssm
         on ssm.student_id = sp.id and ssm.skill_id = sr.skill_id
       where tsr.teacher_id = $1
         and tsr.active = true
         and sk.code = $2
       group by sp.id, sp.display_name, ssm.mastery_score, ssm.proficient_at
       order by sp.display_name asc`,
      [teacherId, skillCode],
    );

    const studentBreakdown = studentAgg.rows.map((row) => {
      const total = Number(row.total_attempts ?? 0);
      const correct = Number(row.correct_attempts ?? 0);
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      const masteryScore = row.mastery_score != null ? Math.round(Number(row.mastery_score)) : null;
      const status = masteryStatus(masteryScore, accuracy);
      return {
        studentId: row.student_id as string,
        name: row.display_name as string,
        mastery: masteryScore ?? accuracy,
        accuracy,
        isProficient: row.proficient_at != null,
        status,
        sessions: total,
        lastActive: relativeDate(row.last_active as string | null),
      };
    });

    const totalStudents = studentBreakdown.length;
    const mastered = studentBreakdown.filter((s) => s.isProficient).length;
    const building = studentBreakdown.filter((s) => s.status === "Building").length;
    const started = studentBreakdown.filter((s) => s.status === "Started").length;

    const totalCorrect = studentBreakdown.reduce((sum, s) => sum + Math.round((s.accuracy / 100) * s.sessions), 0);
    const totalSessions = studentBreakdown.reduce((sum, s) => sum + s.sessions, 0);
    const avgAccuracy = totalSessions > 0 ? Math.round((totalCorrect / totalSessions) * 100) : 0;

    // -- Weekly trend (last 4 weeks) --
    const weeklyTrendRes = await db.query(
      `select
         date_trunc('week', cs.started_at)::date as week_start,
         count(sr.id) as sessions,
         count(*) filter (where sr.correct) as correct_count
       from public.teacher_student_roster tsr
       join public.challenge_sessions cs
         on cs.student_id = tsr.student_id
       join public.session_results sr
         on sr.session_id = cs.id
       join public.skills sk
         on sk.id = sr.skill_id
       where tsr.teacher_id = $1
         and tsr.active = true
         and sk.code = $2
         and cs.started_at >= now() - interval '28 days'
       group by date_trunc('week', cs.started_at)::date
       order by week_start asc`,
      [teacherId, skillCode],
    );

    const weeklyTrend = weeklyTrendRes.rows.map((row) => {
      const s = Number(row.sessions ?? 0);
      const c = Number(row.correct_count ?? 0);
      return {
        week: (row.week_start as string).slice(0, 10),
        sessions: s,
        accuracy: s > 0 ? Math.round((c / s) * 100) : 0,
      };
    });

    return NextResponse.json({
      skillCode,
      skillName,
      bandLabel,
      launchBandCode,
      totalStudents,
      mastered,
      building,
      started,
      avgAccuracy,
      weeklyTrend,
      studentBreakdown,
    });
  } catch (error) {
    console.error("[api/teacher/skill-detail] error:", error);
    return NextResponse.json({ error: "Failed to fetch skill detail" }, { status: 500 });
  }
}
