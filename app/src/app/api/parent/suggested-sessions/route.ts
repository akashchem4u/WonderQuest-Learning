import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { db } from "@/lib/db";
import { getCurriculumForBand, type CurriculumSkill } from "@/lib/curriculum-standards";

// ─── Recommendation scoring ───────────────────────────────────────────────────

type MasteryStatus = "not_started" | "in_progress" | "proficient";

interface SkillMasteryRow {
  skill_code: string;
  mastery_score: number | null;
  session_count: number | null;
  proficient_at: string | null;
}

function scorePriority(
  curriculumPriority: CurriculumSkill["priority"],
  status: MasteryStatus,
  masteryScore: number,
): number {
  // Higher score = higher recommendation rank
  if (curriculumPriority === "essential") {
    if (status === "not_started") return 100;
    if (status === "in_progress" && masteryScore < 70) return 90;
    if (status === "in_progress") return 70;
    return 10; // proficient — lowest interest
  }
  if (curriculumPriority === "on-track") {
    if (status === "not_started") return 60;
    if (status === "in_progress" && masteryScore < 70) return 50;
    if (status === "in_progress") return 40;
    return 8;
  }
  if (curriculumPriority === "enrichment") {
    if (status === "not_started") return 30;
    if (status === "in_progress") return 20;
    return 5;
  }
  // challenge
  if (status === "not_started") return 15;
  if (status === "in_progress") return 10;
  return 3;
}

// ─── GET /api/parent/suggested-sessions?studentId=xxx ────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId = request.nextUrl.searchParams.get("studentId")?.trim();
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required." }, { status: 400 });
    }

    // Verify guardian owns the student
    const linkCheck = await db.query(
      `
        select 1
        from public.guardian_student_links
        where guardian_id = $1
          and student_id = $2
        limit 1
      `,
      [guardianId, studentId],
    );

    if (!linkCheck.rowCount) {
      return NextResponse.json(
        { error: "You do not have access to this student." },
        { status: 403 },
      );
    }

    // Fetch student's band
    const studentResult = await db.query(
      `
        select launch_band_code
        from public.student_profiles
        where id = $1
        limit 1
      `,
      [studentId],
    );

    if (!studentResult.rowCount) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const bandCode = studentResult.rows[0].launch_band_code as string;
    const curriculumSkills = getCurriculumForBand(bandCode);

    if (!curriculumSkills.length) {
      return NextResponse.json({
        bandCode,
        recommendations: [],
        pendingPushed: [],
      });
    }

    // Fetch mastery records for all curriculum skills in one query
    const skillCodes = curriculumSkills.map((s) => s.code);

    const masteryResult = await db.query(
      `
        select
          sk.code as skill_code,
          ssm.mastery_score,
          ssm.session_count,
          ssm.proficient_at
        from public.student_skill_mastery ssm
        join public.skills sk on sk.id = ssm.skill_id
        where ssm.student_id = $1
          and sk.code = any($2::text[])
      `,
      [studentId, skillCodes],
    );

    const masteryMap = new Map<string, SkillMasteryRow>();
    for (const row of masteryResult.rows as SkillMasteryRow[]) {
      masteryMap.set(row.skill_code, row);
    }

    // Build recommendations
    const recommendations = curriculumSkills.map((skill) => {
      const mastery = masteryMap.get(skill.code);
      const masteryScore = mastery ? (mastery.mastery_score ?? 0) : 0;
      const sessionCount = mastery ? (mastery.session_count ?? 0) : 0;
      const isProficient = mastery ? mastery.proficient_at !== null : false;

      let status: MasteryStatus;
      if (!mastery) {
        status = "not_started";
      } else if (isProficient) {
        status = "proficient";
      } else {
        status = "in_progress";
      }

      const score = scorePriority(skill.priority, status, masteryScore);

      return {
        skillCode: skill.code,
        skillName: skill.name,
        subject: skill.subject,
        priority: skill.priority,
        complexity: skill.complexity,
        activityType: skill.activityType,
        description: skill.description,
        masteryScore,
        sessionCount,
        isProficient,
        status,
        _score: score,
      };
    });

    // Sort by score descending, then by complexity ascending (easier first within same score)
    recommendations.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return a.complexity - b.complexity;
    });

    // Assign rank and strip internal score field
    const rankedRecommendations = recommendations.map((rec, index) => {
      const { _score: _removed, ...rest } = rec;
      return { ...rest, recommendationRank: index + 1 };
    });

    // Fetch pending pushed activities (unconsumed)
    const pushedResult = await db.query(
      `
        select
          id,
          skill_code,
          priority,
          note,
          pushed_at
        from public.guardian_pushed_activities
        where student_id = $1
          and consumed_at is null
        order by pushed_at asc
      `,
      [studentId],
    );

    const pendingPushed = pushedResult.rows.map((row) => ({
      activityId: row.id as string,
      skillCode: row.skill_code as string,
      priority: row.priority as string,
      note: (row.note as string | null) ?? null,
      pushedAt: row.pushed_at as string,
    }));

    return NextResponse.json({
      bandCode,
      recommendations: rankedRecommendations,
      pendingPushed,
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch suggestions.",
      },
      { status },
    );
  }
}
