import { db } from "@/lib/db";
import { isProficient, getBandCurriculum } from "@/lib/skill-curriculum";

type MasteryUpdateInput = {
  studentId: string;
  skillId: string;
  sessionId: string;
  correct: boolean;
  firstTry: boolean;
  remediationTriggered: boolean;
  timeSpentMs: number;
  bandCode?: string;
};

export type StudentSkillMasteryRecord = {
  studentId: string;
  skillId: string;
  skillCode: string;
  displayName: string;
  subjectCode: string;
  launchBandCode: string;
  attempts: number;
  correctAttempts: number;
  firstTryCorrectAttempts: number;
  remediationCount: number;
  masteryScore: number;
  confidenceScore: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  lastOutcome: string | null;
  lastSessionId: string | null;
  lastSeenAt: string | null;
  updatedAt: string | null;
  sessionCount: number;
  avgTimeMs: number;
  proficientAt: string | null;
  proficiencyEvidence: Record<string, unknown> | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function masteryTarget(input: Pick<MasteryUpdateInput, "correct" | "firstTry">) {
  if (input.correct && input.firstTry) {
    return 96;
  }

  if (input.correct) {
    return 76;
  }

  return 28;
}

function confidenceDelta(input: Pick<MasteryUpdateInput, "correct" | "firstTry">) {
  if (input.correct && input.firstTry) {
    return 8;
  }

  if (input.correct) {
    return 5;
  }

  return -6;
}

function mapMasteryRow(row: Record<string, unknown>) {
  return {
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
  } satisfies StudentSkillMasteryRecord;
}

async function ensureMasteryRow(studentId: string, skillId: string) {
  await db.query(
    `
      insert into public.student_skill_mastery (
        student_id,
        skill_id
      )
      values ($1, $2)
      on conflict (student_id, skill_id) do nothing
    `,
    [studentId, skillId],
  );
}

export async function updateStudentSkillMastery(input: MasteryUpdateInput) {
  await ensureMasteryRow(input.studentId, input.skillId);

  const current = await db.query(
    `
      select
        attempts,
        correct_attempts,
        first_try_correct_attempts,
        remediation_count,
        mastery_score,
        confidence_score,
        consecutive_correct,
        consecutive_incorrect,
        last_session_id,
        session_count,
        avg_time_ms,
        proficient_at
      from public.student_skill_mastery
      where student_id = $1
        and skill_id = $2
      limit 1
    `,
    [input.studentId, input.skillId],
  );

  const row = current.rows[0] ?? {};
  const nextAttempts = Number(row.attempts ?? 0) + 1;
  const nextCorrectAttempts = Number(row.correct_attempts ?? 0) + (input.correct ? 1 : 0);
  const nextFirstTryCorrectAttempts =
    Number(row.first_try_correct_attempts ?? 0) + (input.correct && input.firstTry ? 1 : 0);
  const nextRemediationCount =
    Number(row.remediation_count ?? 0) + (input.remediationTriggered ? 1 : 0);
  const currentMasteryScore = Number(row.mastery_score ?? 50);
  const currentConfidenceScore = Number(row.confidence_score ?? 0);
  const nextMasteryScore = round1(
    currentMasteryScore * 0.82 + masteryTarget(input) * 0.18,
  );
  const nextConfidenceScore = round1(
    clamp(currentConfidenceScore + confidenceDelta(input), 0, 100),
  );
  const nextConsecutiveCorrect = input.correct
    ? Number(row.consecutive_correct ?? 0) + 1
    : 0;
  const nextConsecutiveIncorrect = input.correct
    ? 0
    : Number(row.consecutive_incorrect ?? 0) + 1;
  const nextOutcome = input.correct ? "correct" : "incorrect";

  // Proficiency tracking
  const isNewSession = input.sessionId !== (row.last_session_id ?? null);
  const nextSessionCount = Number(row.session_count ?? 0) + (isNewSession ? 1 : 0);
  const currentAvgTime = Number(row.avg_time_ms ?? 0);
  const nextAvgTime =
    currentAvgTime === 0
      ? input.timeSpentMs
      : Math.round(currentAvgTime * 0.75 + input.timeSpentMs * 0.25);

  const alreadyProficient = !!row.proficient_at;
  const nowProficient =
    !alreadyProficient &&
    isProficient(nextMasteryScore, nextSessionCount, nextAvgTime, input.bandCode ?? "K1");

  const proficientAtValue = alreadyProficient
    ? null // will use coalesce in SQL to keep existing
    : nowProficient
      ? new Date().toISOString()
      : null;

  const proficiencyEvidenceValue = nowProficient
    ? JSON.stringify({
        masteryScore: nextMasteryScore,
        sessionCount: nextSessionCount,
        avgTimeMs: nextAvgTime,
        correctAttempts: nextCorrectAttempts,
        totalAttempts: nextAttempts,
        achievedAt: proficientAtValue,
      })
    : null;

  const result = await db.query(
    `
      update public.student_skill_mastery
      set
        attempts = $3,
        correct_attempts = $4,
        first_try_correct_attempts = $5,
        remediation_count = $6,
        mastery_score = $7,
        confidence_score = $8,
        consecutive_correct = $9,
        consecutive_incorrect = $10,
        last_outcome = $11,
        last_session_id = $12,
        last_seen_at = now(),
        session_count = $13,
        avg_time_ms = $14,
        proficient_at = coalesce(proficient_at, $15::timestamptz),
        proficiency_evidence = coalesce(proficiency_evidence, $16::jsonb)
      where student_id = $1
        and skill_id = $2
      returning
        student_id,
        skill_id,
        attempts,
        correct_attempts,
        first_try_correct_attempts,
        remediation_count,
        mastery_score,
        confidence_score,
        consecutive_correct,
        consecutive_incorrect,
        last_outcome,
        last_session_id,
        last_seen_at,
        updated_at,
        session_count,
        avg_time_ms,
        proficient_at,
        proficiency_evidence
    `,
    [
      input.studentId,
      input.skillId,
      nextAttempts,
      nextCorrectAttempts,
      nextFirstTryCorrectAttempts,
      nextRemediationCount,
      nextMasteryScore,
      nextConfidenceScore,
      nextConsecutiveCorrect,
      nextConsecutiveIncorrect,
      nextOutcome,
      input.sessionId,
      nextSessionCount,
      nextAvgTime,
      proficientAtValue,
      proficiencyEvidenceValue,
    ],
  );

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
        ssm.updated_at,
        ssm.session_count,
        ssm.avg_time_ms,
        ssm.proficient_at,
        ssm.proficiency_evidence
      from public.student_skill_mastery ssm
      join public.skills sk
        on sk.id = ssm.skill_id
      where ssm.student_id = $1
        and ssm.skill_id = $2
      limit 1
    `,
    [input.studentId, input.skillId],
  );

  if (!mastery.rowCount) {
    throw new Error("Student mastery update failed.");
  }

  return mapMasteryRow(mastery.rows[0] as Record<string, unknown>);
}

export async function getStudentSkillMastery(
  studentId: string,
  options: { skillCodes?: string[] } = {},
) {
  const skillCodes = options.skillCodes ?? [];
  const values: unknown[] = [studentId];
  const skillFilter =
    skillCodes.length > 0
      ? (() => {
          values.push(skillCodes);
          return `and sk.code = any($${values.length}::text[])`;
        })()
      : "";

  const result = await db.query(
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
        ssm.updated_at,
        ssm.session_count,
        ssm.avg_time_ms,
        ssm.proficient_at,
        ssm.proficiency_evidence
      from public.student_skill_mastery ssm
      join public.skills sk
        on sk.id = ssm.skill_id
      where ssm.student_id = $1
      ${skillFilter}
      order by ssm.mastery_score asc, ssm.updated_at desc, sk.display_name asc
    `,
    values,
  );

  return result.rows.map((row) => mapMasteryRow(row as Record<string, unknown>));
}

export async function getStudentSkillMasteryByCode(
  studentId: string,
  skillCode: string,
) {
  const [mastery] = await getStudentSkillMastery(studentId, {
    skillCodes: [skillCode],
  });

  return mastery ?? null;
}

export type SkillProficiencySummaryItem = {
  skillCode: string;
  displayName: string;
  subjectCode: string;
  masteryScore: number;
  sessionCount: number;
  avgTimeMs: number;
  proficientAt: string | null;
  proficiencyEvidence: Record<string, unknown> | null;
  attempts: number;
  correctAttempts: number;
};

export async function getSkillProficiencySummary(
  studentId: string,
  bandCode: string,
): Promise<SkillProficiencySummaryItem[]> {
  const curriculumCodes = getBandCurriculum(bandCode);
  if (curriculumCodes.length === 0) return [];

  const result = await db.query(
    `
      select
        sk.code as skill_code,
        sk.display_name,
        sk.subject_code,
        ssm.mastery_score,
        ssm.session_count,
        ssm.avg_time_ms,
        ssm.proficient_at,
        ssm.proficiency_evidence,
        ssm.attempts,
        ssm.correct_attempts
      from public.skills sk
      left join public.student_skill_mastery ssm
        on ssm.skill_id = sk.id
        and ssm.student_id = $1
      where sk.code = any($2::text[])
      order by sk.display_name asc
    `,
    [studentId, curriculumCodes],
  );

  // Build a map of results and fill in missing curriculum skills with nulls
  const byCode = new Map<string, SkillProficiencySummaryItem>();
  for (const row of result.rows) {
    byCode.set(String(row.skill_code), {
      skillCode: String(row.skill_code),
      displayName: String(row.display_name),
      subjectCode: String(row.subject_code),
      masteryScore: Number(row.mastery_score ?? 0),
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
      attempts: Number(row.attempts ?? 0),
      correctAttempts: Number(row.correct_attempts ?? 0),
    });
  }

  return curriculumCodes.map((code) => {
    if (byCode.has(code)) return byCode.get(code)!;
    // Skill not yet practiced — look up display name from result if available
    const matched = result.rows.find((r) => String(r.skill_code) === code);
    return {
      skillCode: code,
      displayName: matched ? String(matched.display_name) : code,
      subjectCode: matched ? String(matched.subject_code) : "unknown",
      masteryScore: 0,
      sessionCount: 0,
      avgTimeMs: 0,
      proficientAt: null,
      proficiencyEvidence: null,
      attempts: 0,
      correctAttempts: 0,
    };
  });
}
