import type { PoolClient } from "pg";
import { db } from "@/lib/db";
import { launchBands } from "@/lib/launch-plan";
import { formatTeacherBandLabel } from "@/lib/teacher-band-format";

type Queryable = Pick<PoolClient, "query">;

type TeacherProfile = {
  id: string;
  displayName: string;
  email: string | null;
  schoolName: string | null;
};

type TeacherRosterStudent = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  launchBandLabel: string;
};

type AssignmentListStudent = TeacherRosterStudent & {
  completed: boolean;
  completedAt: string | null;
  sessionId: string | null;
};

type AssignmentListItem = {
  id: string;
  teacherId: string;
  title: string;
  description: string | null;
  skillCodes: string[];
  launchBandCode: string | null;
  launchBandLabel: string | null;
  sessionMode: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedStudents: AssignmentListStudent[];
  assignedStudentIds: string[];
  summary: {
    assignedStudents: number;
    completedStudents: number;
    pendingStudents: number;
    completionRate: number;
  };
};

type AssignmentProgressStudent = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  launchBandLabel: string;
  completed: boolean;
  completedAt: string | null;
  sessionId: string | null;
  matchingSessionCount: number;
  lastMatchingSessionAt: string | null;
};

type AssignmentPayload = {
  teacherId: string;
  title: string;
  description?: string | null;
  skillCodes?: string[];
  launchBandCode?: string | null;
  sessionMode?: string;
  dueDate?: string | null;
  studentIds?: string[];
};

type AssignmentPatch = {
  teacherId: string;
  title?: string;
  description?: string | null;
  skillCodes?: string[];
  launchBandCode?: string | null;
  sessionMode?: string;
  dueDate?: string | null;
  studentIds?: string[];
};

function ensureText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalText(value: unknown) {
  const normalized = ensureText(value);
  return normalized ? normalized : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => ensureText(item)).filter(Boolean))];
}

function normalizeLaunchBandCode(
  value: unknown,
  options: { allowUndefined?: boolean } = {},
) {
  if (value === undefined && options.allowUndefined) {
    return undefined;
  }

  const normalized = ensureText(value);

  if (!normalized) {
    return null;
  }

  if (!launchBands.some((band) => band.code === normalized)) {
    throw new Error("Choose a valid launch band.");
  }

  return normalized;
}

function normalizeDueDate(
  value: unknown,
  options: { allowUndefined?: boolean } = {},
) {
  if (value === undefined && options.allowUndefined) {
    return undefined;
  }

  const normalized = ensureText(value);

  if (!normalized) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error("Due date must use YYYY-MM-DD.");
  }

  return normalized;
}

function normalizeSessionMode(
  value: unknown,
  options: { allowUndefined?: boolean } = {},
) {
  if (value === undefined && options.allowUndefined) {
    return undefined;
  }

  return ensureText(value) || "guided-quest";
}

function formatDateOnly(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const normalized = String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(normalized)
    ? normalized.slice(0, 10)
    : normalized;
}

function buildAssignmentSummary(assignedStudents: AssignmentListStudent[]) {
  const assignedCount = assignedStudents.length;
  const completedCount = assignedStudents.filter((student) => student.completed).length;

  return {
    assignedStudents: assignedCount,
    completedStudents: completedCount,
    pendingStudents: Math.max(assignedCount - completedCount, 0),
    completionRate:
      assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0,
  };
}

async function getTeacherProfile(
  teacherId: string,
  queryable: Queryable = db,
): Promise<TeacherProfile> {
  const result = await queryable.query(
    `
      select id, display_name, email, school_name
      from public.teacher_profiles
      where id = $1
      limit 1
    `,
    [teacherId],
  );

  if (!result.rowCount) {
    throw new Error("Teacher profile was not found.");
  }

  return {
    id: String(result.rows[0].id),
    displayName: String(result.rows[0].display_name),
    email:
      result.rows[0].email === null || result.rows[0].email === undefined
        ? null
        : String(result.rows[0].email),
    schoolName:
      result.rows[0].school_name === null || result.rows[0].school_name === undefined
        ? null
        : String(result.rows[0].school_name),
  };
}

async function getTeacherRosterStudents(
  teacherId: string,
  queryable: Queryable = db,
) {
  const result = await queryable.query(
    `
      select
        sp.id as student_id,
        sp.display_name,
        sp.launch_band_code
      from public.teacher_student_roster tsr
      join public.student_profiles sp
        on sp.id = tsr.student_id
      where tsr.teacher_id = $1
        and tsr.active = true
      order by sp.display_name asc
    `,
    [teacherId],
  );

  return result.rows.map((row) => ({
    studentId: String(row.student_id),
    displayName: String(row.display_name),
    launchBandCode: String(row.launch_band_code),
    launchBandLabel: formatTeacherBandLabel(String(row.launch_band_code)),
  })) satisfies TeacherRosterStudent[];
}

async function validateSkillCodes(
  skillCodes: string[],
  launchBandCode: string | null,
  queryable: Queryable = db,
) {
  if (!skillCodes.length) {
    return;
  }

  const result = await queryable.query(
    `
      select code, launch_band_code
      from public.skills
      where code = any($1::text[])
    `,
    [skillCodes],
  );

  const foundCodes = new Map(
    result.rows.map((row) => [String(row.code), String(row.launch_band_code)]),
  );

  const missingCodes = skillCodes.filter((code) => !foundCodes.has(code));

  if (missingCodes.length) {
    throw new Error(`Unknown skill codes: ${missingCodes.join(", ")}.`);
  }

  if (!launchBandCode) {
    return;
  }

  const mismatchedCodes = skillCodes.filter(
    (code) => foundCodes.get(code) !== launchBandCode,
  );

  if (mismatchedCodes.length) {
    throw new Error(
      `Skill codes do not match launch band ${launchBandCode}: ${mismatchedCodes.join(", ")}.`,
    );
  }
}

function resolveAssignedStudentIds(
  requestedStudentIds: string[],
  roster: TeacherRosterStudent[],
) {
  const rosterIds = new Set(roster.map((student) => student.studentId));
  const resolvedStudentIds = requestedStudentIds.length
    ? requestedStudentIds
    : roster.map((student) => student.studentId);

  if (!resolvedStudentIds.length) {
    throw new Error("Teacher roster is empty. Add students before creating assignments.");
  }

  const invalidStudentIds = resolvedStudentIds.filter((studentId) => !rosterIds.has(studentId));

  if (invalidStudentIds.length) {
    throw new Error("Assignments can only target learners on the active teacher roster.");
  }

  return [...new Set(resolvedStudentIds)];
}

async function syncAssignmentStudents(
  queryable: Queryable,
  assignmentId: string,
  studentIds: string[],
) {
  await queryable.query(
    `
      delete from public.assignment_students
      where assignment_id = $1
        and not (student_id = any($2::uuid[]))
    `,
    [assignmentId, studentIds],
  );

  await queryable.query(
    `
      insert into public.assignment_students (
        assignment_id,
        student_id
      )
      select $1::uuid, student_id
      from unnest($2::uuid[]) as t(student_id)
      on conflict (assignment_id, student_id) do nothing
    `,
    [assignmentId, studentIds],
  );
}

async function getAssignmentRows(
  teacherId: string,
  assignmentIds?: string[],
  queryable: Queryable = db,
) {
  const filters: string[] = ["a.teacher_id = $1"];
  const values: unknown[] = [teacherId];

  if (assignmentIds?.length) {
    values.push(assignmentIds);
    filters.push(`a.id = any($${values.length}::uuid[])`);
  }

  const result = await queryable.query(
    `
      select
        a.id,
        a.teacher_id,
        a.title,
        a.description,
        a.skill_codes,
        a.launch_band_code,
        a.session_mode,
        a.due_date,
        a.created_at,
        a.updated_at
      from public.assignments a
      where ${filters.join(" and ")}
      order by
        case when a.due_date is null then 1 else 0 end asc,
        a.due_date asc,
        a.created_at desc
    `,
    values,
  );

  return result.rows;
}

async function getAssignmentStudentMap(
  assignmentIds: string[],
  queryable: Queryable = db,
) {
  if (!assignmentIds.length) {
    return new Map<string, AssignmentListStudent[]>();
  }

  const result = await queryable.query(
    `
      select
        ast.assignment_id,
        ast.student_id,
        ast.completed_at,
        ast.session_id,
        sp.display_name,
        sp.launch_band_code
      from public.assignment_students ast
      join public.student_profiles sp
        on sp.id = ast.student_id
      where ast.assignment_id = any($1::uuid[])
      order by sp.display_name asc
    `,
    [assignmentIds],
  );

  const studentMap = new Map<string, AssignmentListStudent[]>();

  for (const row of result.rows) {
    const assignmentId = String(row.assignment_id);
    const items = studentMap.get(assignmentId) ?? [];

    items.push({
      studentId: String(row.student_id),
      displayName: String(row.display_name),
      launchBandCode: String(row.launch_band_code),
      launchBandLabel: formatTeacherBandLabel(String(row.launch_band_code)),
      completed: Boolean(row.completed_at),
      completedAt:
        row.completed_at === null || row.completed_at === undefined
          ? null
          : String(row.completed_at),
      sessionId:
        row.session_id === null || row.session_id === undefined
          ? null
          : String(row.session_id),
    });

    studentMap.set(assignmentId, items);
  }

  return studentMap;
}

async function buildAssignmentListItems(
  teacherId: string,
  assignmentIds?: string[],
  queryable: Queryable = db,
) {
  const rows = await getAssignmentRows(teacherId, assignmentIds, queryable);
  const studentMap = await getAssignmentStudentMap(
    rows.map((row) => String(row.id)),
    queryable,
  );

  return rows.map((row) => {
    const assignedStudents = studentMap.get(String(row.id)) ?? [];

    return {
      id: String(row.id),
      teacherId: String(row.teacher_id),
      title: String(row.title),
      description:
        row.description === null || row.description === undefined
          ? null
          : String(row.description),
      skillCodes: Array.isArray(row.skill_codes)
        ? row.skill_codes.map((value: unknown) => String(value))
        : [],
      launchBandCode:
        row.launch_band_code === null || row.launch_band_code === undefined
          ? null
          : String(row.launch_band_code),
      launchBandLabel:
        row.launch_band_code === null || row.launch_band_code === undefined
          ? null
          : formatTeacherBandLabel(String(row.launch_band_code)),
      sessionMode: String(row.session_mode),
      dueDate:
        formatDateOnly(row.due_date),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      assignedStudents,
      assignedStudentIds: assignedStudents.map((student) => student.studentId),
      summary: buildAssignmentSummary(assignedStudents),
    } satisfies AssignmentListItem;
  });
}

async function getAssignmentListItem(
  teacherId: string,
  assignmentId: string,
  queryable: Queryable = db,
) {
  const items = await buildAssignmentListItems(teacherId, [assignmentId], queryable);

  if (!items.length) {
    throw new Error("Assignment was not found.");
  }

  return items[0];
}

async function createAssignmentTransaction(input: AssignmentPayload) {
  const title = ensureText(input.title);

  if (!title) {
    throw new Error("Assignment title is required.");
  }

  const skillCodes = normalizeStringArray(input.skillCodes);
  const launchBandCode = normalizeLaunchBandCode(input.launchBandCode) ?? null;
  const sessionMode = normalizeSessionMode(input.sessionMode);
  const dueDate = normalizeDueDate(input.dueDate);
  const requestedStudentIds = normalizeStringArray(input.studentIds);
  const description = normalizeOptionalText(input.description);

  const client = await db.connect();

  try {
    await client.query("begin");
    await getTeacherProfile(input.teacherId, client);
    const roster = await getTeacherRosterStudents(input.teacherId, client);
    const studentIds = resolveAssignedStudentIds(requestedStudentIds, roster);
    await validateSkillCodes(skillCodes, launchBandCode, client);

    const assignmentResult = await client.query(
      `
        insert into public.assignments (
          teacher_id,
          title,
          description,
          skill_codes,
          launch_band_code,
          session_mode,
          due_date
        )
        values ($1, $2, $3, $4::text[], $5, $6, $7)
        returning id
      `,
      [
        input.teacherId,
        title,
        description,
        skillCodes,
        launchBandCode,
        sessionMode,
        dueDate,
      ],
    );

    const assignmentId = String(assignmentResult.rows[0].id);
    await syncAssignmentStudents(client, assignmentId, studentIds);
    await client.query("commit");

    return assignmentId;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function updateAssignmentTransaction(
  assignmentId: string,
  patch: AssignmentPatch,
) {
  const client = await db.connect();

  try {
    await client.query("begin");
    const current = await getAssignmentListItem(patch.teacherId, assignmentId, client);
    const nextTitle =
      patch.title === undefined ? current.title : ensureText(patch.title);

    if (!nextTitle) {
      throw new Error("Assignment title is required.");
    }

    const nextDescription =
      patch.description === undefined
        ? current.description
        : normalizeOptionalText(patch.description);
    const nextSkillCodes =
      patch.skillCodes === undefined
        ? current.skillCodes
        : normalizeStringArray(patch.skillCodes);
    const normalizedBandCode = normalizeLaunchBandCode(patch.launchBandCode, {
      allowUndefined: true,
    });
    const nextLaunchBandCode =
      normalizedBandCode === undefined
        ? current.launchBandCode
        : normalizedBandCode;
    const normalizedSessionMode = normalizeSessionMode(patch.sessionMode, {
      allowUndefined: true,
    });
    const nextSessionMode =
      normalizedSessionMode === undefined
        ? current.sessionMode
        : normalizedSessionMode;
    const normalizedDueDate = normalizeDueDate(patch.dueDate, {
      allowUndefined: true,
    });
    const nextDueDate =
      normalizedDueDate === undefined ? current.dueDate : normalizedDueDate;

    await validateSkillCodes(nextSkillCodes, nextLaunchBandCode, client);
    await getTeacherProfile(patch.teacherId, client);

    if (patch.studentIds !== undefined) {
      const roster = await getTeacherRosterStudents(patch.teacherId, client);
      const studentIds = resolveAssignedStudentIds(
        normalizeStringArray(patch.studentIds),
        roster,
      );
      await syncAssignmentStudents(client, assignmentId, studentIds);
    }

    await client.query(
      `
        update public.assignments
        set
          title = $3,
          description = $4,
          skill_codes = $5::text[],
          launch_band_code = $6,
          session_mode = $7,
          due_date = $8
        where id = $1
          and teacher_id = $2
      `,
      [
        assignmentId,
        patch.teacherId,
        nextTitle,
        nextDescription,
        nextSkillCodes,
        nextLaunchBandCode,
        nextSessionMode,
        nextDueDate,
      ],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function listTeacherAssignments(teacherId: string) {
  const teacher = await getTeacherProfile(teacherId);
  const roster = await getTeacherRosterStudents(teacherId);
  const assignments = await buildAssignmentListItems(teacherId);

  return {
    teacher,
    teacherId,
    roster,
    assignments,
  };
}

export async function getTeacherAssignmentDetail(
  teacherId: string,
  assignmentId: string,
) {
  const teacher = await getTeacherProfile(teacherId);
  const roster = await getTeacherRosterStudents(teacherId);
  const assignment = await getAssignmentListItem(teacherId, assignmentId);

  return {
    teacher,
    teacherId,
    roster,
    assignment,
  };
}

export async function createTeacherAssignment(input: AssignmentPayload) {
  const teacherId = ensureText(input.teacherId);

  if (!teacherId) {
    throw new Error("teacherId is required.");
  }

  const assignmentId = await createAssignmentTransaction({
    ...input,
    teacherId,
  });

  return getTeacherAssignmentDetail(teacherId, assignmentId);
}

export async function updateTeacherAssignment(
  assignmentId: string,
  patch: AssignmentPatch,
) {
  const teacherId = ensureText(patch.teacherId);

  if (!teacherId) {
    throw new Error("teacherId is required.");
  }

  await updateAssignmentTransaction(assignmentId, {
    ...patch,
    teacherId,
  });

  return getTeacherAssignmentDetail(teacherId, assignmentId);
}

export async function deleteTeacherAssignment(
  teacherId: string,
  assignmentId: string,
) {
  await getTeacherProfile(teacherId);

  const result = await db.query(
    `
      delete from public.assignments
      where id = $1
        and teacher_id = $2
      returning id
    `,
    [assignmentId, teacherId],
  );

  if (!result.rowCount) {
    throw new Error("Assignment was not found.");
  }

  return {
    deleted: true,
    assignmentId,
    teacherId,
  };
}

export async function getAssignmentProgress(assignmentId: string) {
  const assignmentResult = await db.query(
    `
      select
        a.id,
        a.teacher_id,
        a.title,
        a.description,
        a.skill_codes,
        a.launch_band_code,
        a.session_mode,
        a.due_date,
        a.created_at
      from public.assignments a
      where a.id = $1
      limit 1
    `,
    [assignmentId],
  );

  if (!assignmentResult.rowCount) {
    throw new Error("Assignment was not found.");
  }

  const assignment = assignmentResult.rows[0];
  const studentResult = await db.query(
    `
      select
        ast.student_id,
        ast.completed_at,
        ast.session_id,
        sp.display_name,
        sp.launch_band_code,
        coalesce(progress.matching_session_count, 0) as matching_session_count,
        progress.last_matching_session_at
      from public.assignment_students ast
      join public.assignments a
        on a.id = ast.assignment_id
      join public.student_profiles sp
        on sp.id = ast.student_id
      left join lateral (
        select
          count(distinct cs.id) as matching_session_count,
          max(cs.started_at) as last_matching_session_at
        from public.challenge_sessions cs
        where cs.student_id = ast.student_id
          and cs.started_at >= a.created_at
          and cs.session_mode = a.session_mode
          and (
            cardinality(a.skill_codes) = 0
            or exists (
              select 1
              from public.session_results sr
              join public.skills sk
                on sk.id = sr.skill_id
              where sr.session_id = cs.id
                and sk.code = any(a.skill_codes)
            )
          )
      ) as progress
        on true
      where ast.assignment_id = $1
      order by sp.display_name asc
    `,
    [assignmentId],
  );

  const students = studentResult.rows.map((row) => ({
    studentId: String(row.student_id),
    displayName: String(row.display_name),
    launchBandCode: String(row.launch_band_code),
    launchBandLabel: formatTeacherBandLabel(String(row.launch_band_code)),
    completed: Boolean(row.completed_at),
    completedAt:
      row.completed_at === null || row.completed_at === undefined
        ? null
        : String(row.completed_at),
    sessionId:
      row.session_id === null || row.session_id === undefined
        ? null
        : String(row.session_id),
    matchingSessionCount: Number(row.matching_session_count ?? 0),
    lastMatchingSessionAt:
      row.last_matching_session_at === null || row.last_matching_session_at === undefined
        ? null
        : String(row.last_matching_session_at),
  })) satisfies AssignmentProgressStudent[];

  const completedStudents = students.filter((student) => student.completed).length;
  const assignedStudents = students.length;

  return {
    assignment: {
      id: String(assignment.id),
      teacherId: String(assignment.teacher_id),
      title: String(assignment.title),
      description:
        assignment.description === null || assignment.description === undefined
          ? null
          : String(assignment.description),
      skillCodes: Array.isArray(assignment.skill_codes)
        ? assignment.skill_codes.map((value: unknown) => String(value))
        : [],
      launchBandCode:
        assignment.launch_band_code === null || assignment.launch_band_code === undefined
          ? null
          : String(assignment.launch_band_code),
      launchBandLabel:
        assignment.launch_band_code === null || assignment.launch_band_code === undefined
          ? null
          : formatTeacherBandLabel(String(assignment.launch_band_code)),
      sessionMode: String(assignment.session_mode),
      dueDate:
        formatDateOnly(assignment.due_date),
      createdAt: String(assignment.created_at),
    },
    summary: {
      assignedStudents,
      completedStudents,
      pendingStudents: Math.max(assignedStudents - completedStudents, 0),
      completionRate:
        assignedStudents > 0
          ? Math.round((completedStudents / assignedStudents) * 100)
          : 0,
    },
    students,
  };
}
