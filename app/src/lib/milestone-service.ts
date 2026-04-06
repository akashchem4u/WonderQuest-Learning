import { db } from "@/lib/db";

type ProgressionSnapshot = {
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
};

type MilestoneFlags = {
  leveledUp: boolean;
  badgeEarned: boolean;
  trophyEarned: boolean;
};

type MilestoneNotificationInput = {
  studentId: string;
  previousProgression: ProgressionSnapshot;
  nextProgression: ProgressionSnapshot;
  milestones: MilestoneFlags;
};

type StudentIdentity = {
  displayName: string;
};

type NotificationRow = {
  type: string;
  title: string;
  description: string;
  value: string | null;
};

async function getStudentIdentity(studentId: string): Promise<StudentIdentity | null> {
  const result = await db.query(
    `
      select display_name
      from public.student_profiles
      where id = $1
      limit 1
    `,
    [studentId],
  );

  if (!result.rowCount) {
    return null;
  }

  return {
    displayName: String(result.rows[0].display_name ?? "Your learner"),
  };
}

function buildMilestoneRows(
  displayName: string,
  previousProgression: ProgressionSnapshot,
  nextProgression: ProgressionSnapshot,
  milestones: MilestoneFlags,
) {
  const rows: NotificationRow[] = [];

  if (milestones.leveledUp) {
    rows.push({
      type: "level_up",
      title: "Level up unlocked",
      description: `${displayName} reached level ${nextProgression.currentLevel}.`,
      value: String(nextProgression.currentLevel),
    });
  }

  if (milestones.badgeEarned) {
    rows.push({
      type: "badge",
      title: "New badge earned",
      description: `${displayName} earned a new badge and now has ${nextProgression.badgeCount}.`,
      value: String(nextProgression.badgeCount - previousProgression.badgeCount),
    });
  }

  if (milestones.trophyEarned) {
    rows.push({
      type: "milestone-earned",
      title: "Big milestone reached",
      description: `${displayName} unlocked a trophy milestone and now has ${nextProgression.trophyCount}.`,
      value: String(nextProgression.trophyCount),
    });
  }

  return rows;
}

async function getGuardianIdsForStudent(studentId: string) {
  const result = await db.query(
    `
      select guardian_id
      from public.guardian_student_links
      where student_id = $1
      order by guardian_id asc
    `,
    [studentId],
  );

  return result.rows
    .map((row) => String(row.guardian_id ?? ""))
    .filter(Boolean);
}

async function filterDedupedRows(
  studentId: string,
  guardianId: string | null,
  rows: NotificationRow[],
) {
  const filteredRows: NotificationRow[] = [];

  for (const row of rows) {
    const recent = await db.query(
      `
        select 1
        from public.student_notifications
        where student_id = $1
          and (
            ($2::uuid is null and guardian_id is null)
            or guardian_id = $2::uuid
          )
          and type = $3
          and coalesce(value, '') = coalesce($4, '')
          and created_at >= now() - interval '12 hours'
        limit 1
      `,
      [studentId, guardianId, row.type, row.value],
    );

    if (!recent.rowCount) {
      filteredRows.push(row);
    }
  }

  return filteredRows;
}

async function insertNotificationRows(
  studentId: string,
  guardianId: string | null,
  rows: NotificationRow[],
) {
  if (!rows.length) {
    return [];
  }

  const result = await db.query(
    `
      insert into public.student_notifications (
        student_id,
        guardian_id,
        type,
        title,
        description,
        value
      )
      select
        $1::uuid,
        $2::uuid,
        t.type,
        t.title,
        t.description,
        nullif(t.value, '')
      from unnest(
        $3::text[],
        $4::text[],
        $5::text[],
        $6::text[]
      ) as t(type, title, description, value)
      returning id, guardian_id, type, title, description, value, created_at
    `,
    [
      studentId,
      guardianId,
      rows.map((row) => row.type),
      rows.map((row) => row.title),
      rows.map((row) => row.description),
      rows.map((row) => row.value ?? ""),
    ],
  );

  return result.rows.map((row) => ({
    id: String(row.id),
    guardianId:
      row.guardian_id === null || row.guardian_id === undefined
        ? null
        : String(row.guardian_id),
    type: String(row.type),
    title: String(row.title),
    description: String(row.description),
    value: row.value === null || row.value === undefined ? null : String(row.value),
    createdAt: String(row.created_at),
  }));
}

export async function createMilestoneNotifications(
  input: MilestoneNotificationInput,
) {
  if (
    !input.milestones.leveledUp &&
    !input.milestones.badgeEarned &&
    !input.milestones.trophyEarned
  ) {
    return [];
  }

  const identity = await getStudentIdentity(input.studentId);

  if (!identity) {
    return [];
  }

  const rows = buildMilestoneRows(
    identity.displayName,
    input.previousProgression,
    input.nextProgression,
    input.milestones,
  );

  if (!rows.length) {
    return [];
  }

  const guardianIds = await getGuardianIdsForStudent(input.studentId);
  const targets = guardianIds.length
    ? guardianIds.map((guardianId) => guardianId)
    : [null];
  const inserted = [];

  for (const guardianId of targets) {
    const filteredRows = await filterDedupedRows(input.studentId, guardianId, rows);
    const writtenRows = await insertNotificationRows(
      input.studentId,
      guardianId,
      filteredRows,
    );
    inserted.push(...writtenRows);
  }

  return inserted;
}

// ─── Student milestone list ───────────────────────────────────────────────────

export type StudentMilestone = {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

export async function getStudentMilestones(
  studentId: string,
  limit = 50,
): Promise<StudentMilestone[]> {
  const result = await db.query<StudentMilestone>(
    `select id, type, title, description, created_at as "createdAt", read
     from public.student_notifications
     where student_id = $1
     order by created_at desc
     limit $2`,
    [studentId, limit],
  );
  return result.rows;
}
