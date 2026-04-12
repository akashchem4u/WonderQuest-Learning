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
  confidence_score: number | null;
  consecutive_incorrect: number | null;
  last_seen_at: string | null;
}

function scoreRecommendation(
  curriculumPriority: CurriculumSkill["priority"],
  status: MasteryStatus,
  mastery: SkillMasteryRow | undefined,
): { score: number; reason: string } {
  const masteryScore = mastery?.mastery_score ?? 0;
  const confidence = mastery?.confidence_score ?? 0;
  const consecutiveIncorrect = mastery?.consecutive_incorrect ?? 0;
  const daysSinceLastSeen = mastery?.last_seen_at
    ? Math.floor((Date.now() - new Date(mastery.last_seen_at).getTime()) / 86_400_000)
    : 999;

  const isRusty = status === "proficient" && daysSinceLastSeen >= 14;
  const isStruggling = consecutiveIncorrect >= 2;
  const isWeakMastery = status === "in_progress" && masteryScore < 55;
  const isLowConfidence = status === "in_progress" && confidence < 40;

  // Base score from priority + status
  const priorityWeight: Record<CurriculumSkill["priority"], number> = {
    essential: 60,
    "on-track": 40,
    enrichment: 20,
    challenge: 10,
  };
  let score = priorityWeight[curriculumPriority] ?? 10;

  if (status === "not_started") {
    score += 30;
    const reason = curriculumPriority === "essential"
      ? "Essential skill — not started yet"
      : "Not started yet";
    return { score, reason };
  }

  if (status === "proficient" && !isRusty) {
    return { score: 2, reason: "Already proficient" };
  }

  if (isRusty) {
    score += 25;
    return { score, reason: `Proficient but not practiced in ${daysSinceLastSeen} days` };
  }

  if (isStruggling) {
    score += 35;
    return { score, reason: `${consecutiveIncorrect} consecutive wrong answers — needs support` };
  }

  if (isWeakMastery) {
    score += 25;
    return { score, reason: "Weak mastery — needs more practice" };
  }

  if (isLowConfidence) {
    score += 15;
    return { score, reason: "Building confidence — keep going" };
  }

  // Generic in-progress
  score += 10;
  return { score, reason: "In progress" };
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
          ssm.proficient_at,
          ssm.confidence_score,
          ssm.consecutive_incorrect,
          ssm.last_seen_at
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

      const { score, reason } = scoreRecommendation(skill.priority, status, mastery);

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
        reason,
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
