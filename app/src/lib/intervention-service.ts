import { db } from "@/lib/db";
import type { StudentSkillMasteryRecord } from "@/lib/mastery-service";

type ResolveTeacherInterventionInput = {
  interventionId: string;
  teacherId: string;
  resolutionNote?: string | null;
  strategyTag?: string | null;
  effectivenessRating?: number | null;
};

function ensureText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalText(value: unknown) {
  const normalized = ensureText(value);
  return normalized ? normalized : null;
}

function normalizeRating(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("effectivenessRating must be a number between 1 and 5.");
  }

  const rounded = Math.round(parsed);

  if (rounded < 1 || rounded > 5) {
    throw new Error("effectivenessRating must be a number between 1 and 5.");
  }

  return rounded;
}

function buildInterventionReason(mastery: StudentSkillMasteryRecord) {
  if (mastery.consecutiveIncorrect >= 2) {
    return `confidence floor ${mastery.consecutiveIncorrect}x`;
  }

  if (mastery.masteryScore < 45) {
    return `below benchmark (${mastery.masteryScore}%)`;
  }

  if (mastery.remediationCount >= 3) {
    return `remediation triggered ${mastery.remediationCount}x`;
  }

  return `watch ${mastery.skillCode}`;
}

function shouldTriggerIntervention(mastery: StudentSkillMasteryRecord) {
  return (
    mastery.attempts >= 3 &&
    (mastery.masteryScore < 45 ||
      mastery.consecutiveIncorrect >= 2 ||
      mastery.remediationCount >= 3)
  );
}

export async function syncTeacherInterventionSignals(
  mastery: StudentSkillMasteryRecord,
) {
  const roster = await db.query(
    `
      select teacher_id
      from public.teacher_student_roster
      where student_id = $1
        and active = true
    `,
    [mastery.studentId],
  );

  if (!roster.rowCount) {
    return [];
  }

  const teacherIds = roster.rows.map((row) => String(row.teacher_id));

  if (!shouldTriggerIntervention(mastery)) {
    await db.query(
      `
        update public.teacher_interventions
        set status = 'monitoring'
        where student_id = $1
          and coalesce(skill_code, '') = $2
          and teacher_id = any($3::uuid[])
          and status = 'active'
      `,
      [mastery.studentId, mastery.skillCode, teacherIds],
    );

    return [];
  }

  const reason = buildInterventionReason(mastery);
  const result = await db.query(
    `
      insert into public.teacher_interventions (
        teacher_id,
        student_id,
        skill_code,
        reason,
        intervention_type,
        status,
        teacher_note
      )
      select
        teacher_id,
        $1::uuid,
        $2,
        $3,
        'support-queue',
        'active',
        $4
      from unnest($5::uuid[]) as t(teacher_id)
      where not exists (
        select 1
        from public.teacher_interventions existing
        where existing.teacher_id = t.teacher_id
          and existing.student_id = $1
          and coalesce(existing.skill_code, '') = $2
          and existing.status in ('active', 'monitoring')
      )
      returning id, teacher_id
    `,
    [
      mastery.studentId,
      mastery.skillCode,
      reason,
      `Auto-flagged from mastery score ${mastery.masteryScore}% and confidence ${mastery.confidenceScore}%.`,
      teacherIds,
    ],
  );

  await db.query(
    `
      update public.teacher_interventions
      set
        reason = $3,
        intervention_type = 'support-queue',
        status = 'active',
        teacher_note = $4
      where student_id = $1
        and coalesce(skill_code, '') = $2
        and teacher_id = any($5::uuid[])
        and status in ('active', 'monitoring')
    `,
    [
      mastery.studentId,
      mastery.skillCode,
      reason,
      `Auto-flagged from mastery score ${mastery.masteryScore}% and confidence ${mastery.confidenceScore}%.`,
      teacherIds,
    ],
  );

  return result.rows.map((row) => ({
    id: String(row.id),
    teacherId: String(row.teacher_id),
  }));
}

export async function resolveTeacherIntervention(
  input: ResolveTeacherInterventionInput,
) {
  const resolutionNote = normalizeOptionalText(input.resolutionNote);
  const strategyTag = normalizeOptionalText(input.strategyTag);
  const effectivenessRating = normalizeRating(input.effectivenessRating);

  const intervention = await db.query(
    `
      update public.teacher_interventions
      set
        status = 'resolved',
        resolved_at = now(),
        resolution_note = $3
      where id = $1
        and teacher_id = $2
      returning id, teacher_id, student_id, skill_code, resolution_note, resolved_at
    `,
    [input.interventionId, input.teacherId, resolutionNote],
  );

  if (!intervention.rowCount) {
    throw new Error("Intervention was not found.");
  }

  const row = intervention.rows[0];

  await db.query(
    `
      insert into public.intervention_resolution_feedback (
        intervention_id,
        teacher_id,
        student_id,
        skill_code,
        strategy_tag,
        notes,
        effectiveness_rating
      )
      values ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      row.id,
      row.teacher_id,
      row.student_id,
      row.skill_code ?? null,
      strategyTag,
      resolutionNote,
      effectivenessRating,
    ],
  );

  return {
    interventionId: String(row.id),
    teacherId: String(row.teacher_id),
    studentId: String(row.student_id),
    skillCode:
      row.skill_code === null || row.skill_code === undefined
        ? null
        : String(row.skill_code),
    resolvedAt:
      row.resolved_at === null || row.resolved_at === undefined
        ? null
        : String(row.resolved_at),
    resolutionNote:
      row.resolution_note === null || row.resolution_note === undefined
        ? null
        : String(row.resolution_note),
    strategyTag,
    effectivenessRating,
  };
}
