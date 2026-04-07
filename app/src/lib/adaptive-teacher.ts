// adaptive-teacher.ts
// AI teacher engine — analyzes each student's mastery and generates targeted push sessions.

import { db } from "@/lib/db";
import { getCurriculumForBand } from "@/lib/curriculum-standards";

// Adaptive suggestion for a single student
export type AdaptiveSuggestion = {
  studentId: string;
  displayName: string;
  bandCode: string;
  archetype: "advanced" | "on-track" | "developing" | "foundational";
  focusSkill: string;
  focusSkillName: string;
  reason: string;
  aiNote: string;
  masteryScore: number;
  priority: "urgent" | "normal";
  // Skill fatigue: student has spent many sessions on focusSkill with limited progress
  fatigued?: boolean;
  varietySkill?: string;        // skill code to mix in as a variety break
  varietySkillName?: string;    // display name of the variety skill
  varietyReason?: string;       // why we're mixing this in
};

type MasteryRow = {
  skill_code: string;
  mastery_score: number;
  session_count: number;
  proficient_at: string | null;
};

function detectArchetype(avgMastery: number): AdaptiveSuggestion["archetype"] {
  if (avgMastery >= 82) return "advanced";
  if (avgMastery >= 65) return "on-track";
  if (avgMastery >= 42) return "developing";
  return "foundational";
}

function buildAiNote(
  displayName: string,
  skillName: string,
  archetype: AdaptiveSuggestion["archetype"],
): string {
  const first = displayName.split(" ")[0];
  if (archetype === "foundational") {
    return `${first} benefits from shorter, high-frequency practice. Start with 3–4 questions on ${skillName} and celebrate each correct answer with specific praise.`;
  }
  if (archetype === "developing") {
    return `${first} is building momentum on ${skillName}. Pair this skill with something they already do well to build confidence before challenging questions.`;
  }
  if (archetype === "on-track") {
    return `${first} is progressing steadily. A focused 5-minute drill on ${skillName} will help consolidate their understanding before the next complexity level.`;
  }
  // advanced
  return `${first} is excelling overall. Push ${skillName} at a higher complexity — they're ready for multi-step problems and can help peers who are still building this skill.`;
}

export async function generateAdaptiveSuggestions(
  teacherId: string,
): Promise<AdaptiveSuggestion[]> {
  // Get all students for this teacher
  const rosterRes = await db.query(
    `select sp.id, sp.display_name, sp.launch_band_code
     from public.teacher_student_roster tsr
     join public.student_profiles sp on sp.id = tsr.student_id
     where tsr.teacher_id = $1`,
    [teacherId],
  );

  const suggestions: AdaptiveSuggestion[] = [];

  for (const studentRow of rosterRes.rows) {
    const studentId = studentRow.id as string;
    const displayName = studentRow.display_name as string;
    const bandCode = studentRow.launch_band_code as string;

    const curriculum = getCurriculumForBand(bandCode);
    if (!curriculum.length) continue;

    // Fetch mastery for all curriculum skills
    const skillCodes = curriculum.map((s) => s.code);
    const masteryRes = await db.query(
      `select sk.code as skill_code, ssm.mastery_score, ssm.session_count, ssm.proficient_at
       from public.student_skill_mastery ssm
       join public.skills sk on sk.id = ssm.skill_id
       where ssm.student_id = $1 and sk.code = any($2::text[])`,
      [studentId, skillCodes],
    );

    const masteryMap = new Map<string, MasteryRow>();
    for (const row of masteryRes.rows as MasteryRow[]) {
      masteryMap.set(row.skill_code, row);
    }

    // Calculate average mastery across known skills
    const masteryValues = [...masteryMap.values()].map((m) => m.mastery_score);
    const avgMastery = masteryValues.length
      ? masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length
      : 0;

    const archetype = detectArchetype(avgMastery);

    // Pick the most impactful skill to push:
    // Priority 1: essential skill not started or below 70
    // Priority 2: on-track skill not started or below 80
    const essentialSkills = curriculum.filter((s) => s.priority === "essential");
    const onTrackSkills = curriculum.filter((s) => s.priority === "on-track");

    let focusSkill = curriculum[0];
    let focusMastery = 0;
    let priority: "urgent" | "normal" = "normal";
    let foundFocus = false;

    // Find worst essential skill below threshold
    let worstScore = 101;
    for (const skill of essentialSkills) {
      const mastery = masteryMap.get(skill.code);
      const score = mastery?.mastery_score ?? 0;
      if (!mastery || score < 70) {
        if (score < worstScore) {
          worstScore = score;
          focusSkill = skill;
          focusMastery = score;
          priority = score < 40 ? "urgent" : "normal";
          foundFocus = true;
        }
      }
    }

    // If all essential skills are good (worstScore == 101), push an on-track skill
    if (!foundFocus) {
      for (const skill of onTrackSkills) {
        const mastery = masteryMap.get(skill.code);
        const score = mastery?.mastery_score ?? 0;
        if (!mastery || score < 80) {
          focusSkill = skill;
          focusMastery = score;
          break;
        }
      }
    }

    // ── Skill fatigue detection ─────────────────────────────────────────────
    // If the student has done 5+ sessions on this skill with < 75% mastery,
    // they may be hitting a plateau. Suggest mixing in a variety skill from
    // the same subject to refresh engagement while maintaining progress.
    const focusMasteryRow = masteryMap.get(focusSkill.code);
    const focusSessionCount = focusMasteryRow?.session_count ?? 0;
    const FATIGUE_THRESHOLD = 5;
    let fatigued = false;
    let varietySkill: string | undefined;
    let varietySkillName: string | undefined;
    let varietyReason: string | undefined;

    if (focusSessionCount >= FATIGUE_THRESHOLD && focusMastery < 75 && !focusMasteryRow?.proficient_at) {
      fatigued = true;
      // Find a companion skill: same subject, different code, easier or different angle
      const sameSubject = curriculum.filter(
        (s) =>
          s.subject === focusSkill.subject &&
          s.code !== focusSkill.code &&
          !masteryMap.get(s.code)?.proficient_at // not yet mastered
      );
      // Prefer an easier skill (lower complexity) or a skill the student hasn't started
      const companion =
        sameSubject.find((s) => (masteryMap.get(s.code)?.session_count ?? 0) < 3 && s.complexity < focusSkill.complexity) ??
        sameSubject.find((s) => (masteryMap.get(s.code)?.session_count ?? 0) < 2) ??
        sameSubject.find((s) => s.code !== focusSkill.code);

      if (companion) {
        varietySkill = companion.code;
        varietySkillName = companion.name;
        const first = displayName.split(" ")[0];
        varietyReason = `${first} has practiced ${focusSkill.name} ${focusSessionCount} times. Mixing in ${companion.name} keeps engagement high and gives the mind a fresh angle — often helping the original skill click faster.`;
      }
    }

    const reason =
      fatigued && varietySkillName
        ? `${displayName.split(" ")[0]} has had ${focusSessionCount} sessions on ${focusSkill.name} at ${Math.round(focusMastery)}%. Mix in ${varietySkillName} to re-energise progress.`
        : focusMastery === 0
        ? `${displayName.split(" ")[0]} has not yet started ${focusSkill.name} — an ${focusSkill.priority} skill for their grade band.`
        : `${displayName.split(" ")[0]} is at ${Math.round(focusMastery)}% on ${focusSkill.name} — continued practice will build lasting proficiency.`;

    suggestions.push({
      studentId,
      displayName,
      bandCode,
      archetype,
      focusSkill: focusSkill.code,
      focusSkillName: focusSkill.name,
      reason,
      aiNote: buildAiNote(displayName, focusSkill.name, archetype),
      masteryScore: Math.round(focusMastery),
      priority,
      fatigued: fatigued || undefined,
      varietySkill: varietySkill || undefined,
      varietySkillName: varietySkillName || undefined,
      varietyReason: varietyReason || undefined,
    });
  }

  // Sort: urgent first, then by mastery score ascending (most need first)
  return suggestions.sort((a, b) => {
    if (a.priority === "urgent" && b.priority !== "urgent") return -1;
    if (b.priority === "urgent" && a.priority !== "urgent") return 1;
    return a.masteryScore - b.masteryScore;
  });
}

export async function pushAdaptiveSessions(
  teacherId: string,
  suggestions: AdaptiveSuggestion[],
): Promise<number> {
  let pushed = 0;
  for (const s of suggestions) {
    // Only push if no unconsumed push already exists for this student+skill
    const exists = await db.query(
      `select 1 from public.teacher_pushed_sessions
       where teacher_id = $1 and student_id = $2 and skill_code = $3 and consumed_at is null
       limit 1`,
      [teacherId, s.studentId, s.focusSkill],
    );
    if (!exists.rowCount) {
      await db.query(
        `insert into public.teacher_pushed_sessions
           (teacher_id, student_id, skill_code, reason, priority, note, is_ai_generated)
         values ($1, $2, $3, $4, $5, $6, true)`,
        [teacherId, s.studentId, s.focusSkill, s.reason, s.priority, s.aiNote],
      );
      pushed++;
    }

    // When the student is fatigued on the focus skill, also push the variety skill
    // so they actually receive cross-skill questions in their next session.
    if (s.fatigued && s.varietySkill && s.varietyReason) {
      const varietyExists = await db.query(
        `select 1 from public.teacher_pushed_sessions
         where teacher_id = $1 and student_id = $2 and skill_code = $3 and consumed_at is null
         limit 1`,
        [teacherId, s.studentId, s.varietySkill],
      );
      if (!varietyExists.rowCount) {
        await db.query(
          `insert into public.teacher_pushed_sessions
             (teacher_id, student_id, skill_code, reason, priority, note, is_ai_generated)
           values ($1, $2, $3, $4, $5, $6, true)`,
          [
            teacherId,
            s.studentId,
            s.varietySkill,
            s.varietyReason,
            "normal",
            `Variety break: mixing in ${s.varietySkillName ?? s.varietySkill} to prevent plateau fatigue on ${s.focusSkillName}.`,
          ],
        );
        pushed++;
      }
    }
  }
  return pushed;
}
