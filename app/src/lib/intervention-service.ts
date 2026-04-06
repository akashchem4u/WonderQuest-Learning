import { db } from "@/lib/db";
import type { StudentSkillMasteryRecord } from "@/lib/mastery-service";

type ResolveTeacherInterventionInput = {
  interventionId: string;
  teacherId: string;
  resolutionNote?: string | null;
  strategyTag?: string | null;
  effectivenessRating?: number | null;
};

type CreateTeacherInterventionInput = {
  teacherId: string;
  studentId: string;
  skillCode?: string | null;
  reason: string;
  interventionType?: string | null;
  teacherNote?: string | null;
};

export type TeacherInterventionRecord = {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  reason: string;
  interventionType: string;
  status: string;
  teacherNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
  autoTriggered: boolean;
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

function isAutoTriggeredInterventionType(value: string | null | undefined) {
  return value === "support-queue" || value === "skill-support";
}

function mapTeacherInterventionRow(row: Record<string, unknown>) {
  const interventionType =
    row.intervention_type === null || row.intervention_type === undefined
      ? "support-queue"
      : String(row.intervention_type);

  return {
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: String(row.student_name),
    skillCode:
      row.skill_code === null || row.skill_code === undefined
        ? null
        : String(row.skill_code),
    reason: String(row.reason ?? ""),
    interventionType,
    status: String(row.status ?? "active"),
    teacherNote:
      row.teacher_note === null || row.teacher_note === undefined
        ? null
        : String(row.teacher_note),
    createdAt: String(row.created_at),
    resolvedAt:
      row.resolved_at === null || row.resolved_at === undefined
        ? null
        : String(row.resolved_at),
    resolutionNote:
      row.resolution_note === null || row.resolution_note === undefined
        ? null
        : String(row.resolution_note),
    autoTriggered: isAutoTriggeredInterventionType(interventionType),
  } satisfies TeacherInterventionRecord;
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

export async function listTeacherInterventions(
  teacherId: string,
  status = "active",
) {
  const normalizedTeacherId = ensureText(teacherId);
  const normalizedStatus = ensureText(status).toLowerCase() || "active";

  if (!normalizedTeacherId) {
    return [] satisfies TeacherInterventionRecord[];
  }

  const values: unknown[] = [normalizedTeacherId];
  const statusClause =
    normalizedStatus === "all"
      ? ""
      : (() => {
          values.push(normalizedStatus);
          return `and ti.status = $${values.length}`;
        })();

  const result = await db.query(
    `
      select
        ti.id,
        ti.student_id,
        sp.display_name as student_name,
        ti.skill_code,
        ti.reason,
        ti.intervention_type,
        ti.status,
        ti.teacher_note,
        ti.created_at,
        ti.resolved_at,
        ti.resolution_note
      from public.teacher_interventions ti
      join public.student_profiles sp
        on sp.id = ti.student_id
      where ti.teacher_id = $1
        ${statusClause}
      order by ti.created_at desc
    `,
    values,
  );

  return result.rows.map((row) =>
    mapTeacherInterventionRow(row as Record<string, unknown>),
  );
}

export async function createTeacherIntervention(
  input: CreateTeacherInterventionInput,
) {
  const teacherId = ensureText(input.teacherId);
  const studentId = ensureText(input.studentId);
  const reason = ensureText(input.reason);
  const skillCode = normalizeOptionalText(input.skillCode);
  const teacherNote = normalizeOptionalText(input.teacherNote);
  const interventionType = normalizeOptionalText(input.interventionType) ?? "support-queue";

  if (!teacherId || !studentId || !reason) {
    throw new Error("teacherId, studentId, and reason are required.");
  }

  const roster = await db.query(
    `
      select 1
      from public.teacher_student_roster
      where teacher_id = $1
        and student_id = $2
        and active = true
      limit 1
    `,
    [teacherId, studentId],
  );

  if (!roster.rowCount) {
    throw new Error("Student is not on the active teacher roster.");
  }

  const existing = await db.query(
    `
      select
        ti.id,
        ti.student_id,
        sp.display_name as student_name,
        ti.skill_code,
        ti.reason,
        ti.intervention_type,
        ti.status,
        ti.teacher_note,
        ti.created_at,
        ti.resolved_at,
        ti.resolution_note
      from public.teacher_interventions ti
      join public.student_profiles sp
        on sp.id = ti.student_id
      where ti.teacher_id = $1
        and ti.student_id = $2
        and coalesce(ti.skill_code, '') = $3
        and ti.reason = $4
        and ti.status = 'active'
      order by ti.created_at desc
      limit 1
    `,
    [teacherId, studentId, skillCode ?? "", reason],
  );

  if (existing.rowCount) {
    return mapTeacherInterventionRow(existing.rows[0] as Record<string, unknown>);
  }

  const created = await db.query(
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
      values ($1, $2, $3, $4, $5, 'active', $6)
      returning
        id,
        student_id,
        skill_code,
        reason,
        intervention_type,
        status,
        teacher_note,
        created_at,
        resolved_at,
        resolution_note
    `,
    [teacherId, studentId, skillCode, reason, interventionType, teacherNote],
  );

  const student = await db.query(
    `
      select display_name
      from public.student_profiles
      where id = $1
      limit 1
    `,
    [studentId],
  );

  return mapTeacherInterventionRow({
    ...created.rows[0],
    student_name: student.rows[0]?.display_name ?? "Student",
  } as Record<string, unknown>);
}

export async function runTeacherInterventionAutoQueue(teacherId: string) {
  const normalizedTeacherId = ensureText(teacherId);

  if (!normalizedTeacherId) {
    throw new Error("teacherId is required.");
  }

  const mastery = await db.query(
    `
      select
        ssm.student_id,
        ssm.skill_id,
        sk.code as skill_code,
        sk.display_name,
        sk.subject_code,
        sk.launch_band_code,
        ssm.attempts,
        ssm.correct_attempts,
        ssm.first_try_correct_attempts,
        ssm.remediation_count,
        ssm.mastery_score,
        ssm.confidence_score,
        ssm.consecutive_correct,
        ssm.consecutive_incorrect,
        ssm.last_outcome,
        ssm.last_session_id,
        ssm.last_seen_at,
        ssm.updated_at
      from public.student_skill_mastery ssm
      join public.skills sk
        on sk.id = ssm.skill_id
      join public.teacher_student_roster tsr
        on tsr.student_id = ssm.student_id
      where tsr.teacher_id = $1
        and tsr.active = true
    `,
    [normalizedTeacherId],
  );

  let queued = 0;

  for (const row of mastery.rows) {
    const created = await syncTeacherInterventionSignals({
      studentId: String(row.student_id),
      skillId: String(row.skill_id),
      skillCode: String(row.skill_code),
      displayName: String(row.display_name),
      subjectCode: String(row.subject_code),
      launchBandCode: String(row.launch_band_code),
      attempts: Number(row.attempts ?? 0),
      correctAttempts: Number(row.correct_attempts ?? 0),
      firstTryCorrectAttempts: Number(row.first_try_correct_attempts ?? 0),
      remediationCount: Number(row.remediation_count ?? 0),
      masteryScore: Number(row.mastery_score ?? 0),
      confidenceScore: Number(row.confidence_score ?? 0),
      consecutiveCorrect: Number(row.consecutive_correct ?? 0),
      consecutiveIncorrect: Number(row.consecutive_incorrect ?? 0),
      lastOutcome:
        row.last_outcome === null || row.last_outcome === undefined
          ? null
          : String(row.last_outcome),
      lastSessionId:
        row.last_session_id === null || row.last_session_id === undefined
          ? null
          : String(row.last_session_id),
      lastSeenAt:
        row.last_seen_at === null || row.last_seen_at === undefined
          ? null
          : String(row.last_seen_at),
      updatedAt:
        row.updated_at === null || row.updated_at === undefined
          ? null
          : String(row.updated_at),
      sessionCount: Number(row.session_count ?? 0),
      avgTimeMs: Number(row.avg_time_ms ?? 0),
      proficientAt:
        row.proficient_at === null || row.proficient_at === undefined
          ? null
          : String(row.proficient_at),
      proficiencyEvidence:
        row.proficiency_evidence === null || row.proficiency_evidence === undefined
          ? null
          : (row.proficiency_evidence as Record<string, unknown>),
    });

    queued += created.filter((item) => item.teacherId === normalizedTeacherId).length;
  }

  return { queued };
}
