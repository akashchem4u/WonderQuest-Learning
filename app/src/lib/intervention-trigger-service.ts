// intervention-trigger-service.ts
// Automatic intervention triggering when a child scores poorly on a skill repeatedly.
// Called fire-and-forget after a session ends.

import { db } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillAccuracy = {
  skillId: string;
  skillCode: string;
  displayName: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPct: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getFailedSkillsForSession(sessionId: string): Promise<string[]> {
  const result = await db.query(
    `
      SELECT DISTINCT skill_id
      FROM public.session_results
      WHERE session_id = $1 AND correct = false
    `,
    [sessionId],
  );
  return result.rows.map((r) => r.skill_id as string);
}

async function getRecentSkillAccuracy(
  studentId: string,
  skillId: string,
): Promise<SkillAccuracy | null> {
  const result = await db.query(
    `
      SELECT
        sr.skill_id,
        sk.code AS skill_code,
        sk.display_name,
        COUNT(*) AS total_attempts,
        COUNT(*) FILTER (WHERE sr.correct) AS correct_attempts
      FROM public.session_results sr
      JOIN public.challenge_sessions cs ON cs.id = sr.session_id
      JOIN public.skills sk ON sk.id = sr.skill_id
      WHERE cs.student_id = $1
        AND cs.started_at >= now() - interval '14 days'
        AND sr.skill_id = $2
      GROUP BY sr.skill_id, sk.code, sk.display_name
    `,
    [studentId, skillId],
  );

  if (!result.rowCount) return null;

  const row = result.rows[0];
  const totalAttempts = Number(row.total_attempts);
  const correctAttempts = Number(row.correct_attempts);
  const accuracyPct = totalAttempts > 0
    ? Math.round((correctAttempts / totalAttempts) * 100)
    : 0;

  return {
    skillId: row.skill_id as string,
    skillCode: row.skill_code as string,
    displayName: row.display_name as string,
    totalAttempts,
    correctAttempts,
    accuracyPct,
  };
}

async function hasActiveIntervention(
  studentId: string,
  skillCode: string,
): Promise<boolean> {
  const result = await db.query(
    `
      SELECT 1
      FROM public.teacher_interventions
      WHERE student_id = $1
        AND skill_code = $2
        AND status = 'active'
      LIMIT 1
    `,
    [studentId, skillCode],
  );
  return (result.rowCount ?? 0) > 0;
}

async function getTeachersForStudent(studentId: string): Promise<string[]> {
  const result = await db.query(
    `
      SELECT teacher_id
      FROM public.teacher_student_roster
      WHERE student_id = $1 AND active = true
    `,
    [studentId],
  );
  return result.rows.map((r) => r.teacher_id as string);
}

async function createAutoIntervention(
  teacherId: string,
  studentId: string,
  skill: SkillAccuracy,
): Promise<void> {
  const reason = `Auto-triggered: ${skill.accuracyPct}% accuracy on ${skill.displayName} across recent sessions`;

  await db.query(
    `
      INSERT INTO public.teacher_interventions
        (teacher_id, student_id, skill_code, reason, intervention_type)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [teacherId, studentId, skill.skillCode, reason, "skill-support"],
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Check if a student needs an auto-intervention after a session.
 * Triggered after session ends — call fire-and-forget (don't await).
 */
export async function checkAndTriggerInterventions(
  studentId: string,
  sessionId: string,
): Promise<void> {
  // 1. Get all skill_ids from this session that had incorrect answers
  const failedSkillIds = await getFailedSkillsForSession(sessionId);

  if (failedSkillIds.length === 0) return;

  // 2. For each failed skill, check accuracy across recent sessions
  for (const skillId of failedSkillIds) {
    const accuracy = await getRecentSkillAccuracy(studentId, skillId);

    if (!accuracy) continue;

    // 3. If accuracy < 50% AND total_attempts >= 3, consider auto-intervention
    if (accuracy.accuracyPct < 50 && accuracy.totalAttempts >= 3) {
      const alreadyActive = await hasActiveIntervention(studentId, accuracy.skillCode);
      if (alreadyActive) continue;

      // Find teacher(s) for this student
      const teacherIds = await getTeachersForStudent(studentId);
      if (teacherIds.length === 0) continue;

      // Create an intervention for each teacher
      for (const teacherId of teacherIds) {
        await createAutoIntervention(teacherId, studentId, accuracy);
      }
    }
  }
}
