// teacher-service.ts
// Teacher-facing data access layer.
// Exports: getOrCreateTeacherProfile, getTeacherProfile, updateTeacherProfile,
//          getTeacherClassRoster, getTeacherStudentDetail,
//          createAssignment, getTeacherAssignments,
//          createIntervention, resolveIntervention,
//          upsertTeacherNote, getTeacherInterventions,
//          accessTeacherWithCredentials

import crypto from "crypto";
import { db } from "@/lib/db";

// ─── Teacher Profile Types ────────────────────────────────────────────────────

export type TeacherProfile = {
  id: string;
  displayName: string;
  email: string | null;
  schoolName: string | null;
  gradeLevels: string[];
  testerFlag: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeacherProfileUpdate = {
  displayName?: string;
  schoolName?: string;
  gradeLevels?: string[];
  email?: string | null;
};

// ─── Teacher Profile Functions ────────────────────────────────────────────────

export async function getOrCreateTeacherProfile(input: {
  email?: string;
  displayName?: string;
  schoolName?: string;
}): Promise<{ id: string; displayName: string; email: string | null; schoolName: string | null; isNew: boolean }> {
  // Look for an existing non-tester profile
  const existing = await db.query(
    `select id, display_name, email, school_name
     from public.teacher_profiles
     where tester_flag = false
     order by created_at asc
     limit 1`,
    [],
  );

  if (existing.rowCount && existing.rows.length > 0) {
    const row = existing.rows[0];
    return {
      id: row.id as string,
      displayName: row.display_name as string,
      email: (row.email as string | null) ?? null,
      schoolName: (row.school_name as string | null) ?? null,
      isNew: false,
    };
  }

  // Create a new profile
  const created = await db.query(
    `insert into public.teacher_profiles (display_name, email, school_name, tester_flag)
     values ($1, $2, $3, false)
     returning id, display_name, email, school_name`,
    [
      input.displayName ?? "Teacher",
      input.email ?? null,
      input.schoolName ?? null,
    ],
  );

  const row = created.rows[0];
  return {
    id: row.id as string,
    displayName: row.display_name as string,
    email: (row.email as string | null) ?? null,
    schoolName: (row.school_name as string | null) ?? null,
    isNew: true,
  };
}

export async function getTeacherProfile(teacherId: string): Promise<TeacherProfile | null> {
  const result = await db.query(
    `select id, display_name, email, school_name, grade_levels, tester_flag, created_at, updated_at
     from public.teacher_profiles
     where id = $1
     limit 1`,
    [teacherId],
  );

  if (!result.rowCount || result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id as string,
    displayName: row.display_name as string,
    email: (row.email as string | null) ?? null,
    schoolName: (row.school_name as string | null) ?? null,
    gradeLevels: (row.grade_levels as string[] | null) ?? [],
    testerFlag: Boolean(row.tester_flag),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function updateTeacherProfile(
  teacherId: string,
  updates: Partial<TeacherProfileUpdate>,
): Promise<void> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (updates.displayName !== undefined) {
    setClauses.push(`display_name = $${paramIdx++}`);
    values.push(updates.displayName);
  }
  if (updates.schoolName !== undefined) {
    setClauses.push(`school_name = $${paramIdx++}`);
    values.push(updates.schoolName);
  }
  if (updates.gradeLevels !== undefined) {
    setClauses.push(`grade_levels = $${paramIdx++}`);
    values.push(updates.gradeLevels);
  }
  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIdx++}`);
    values.push(updates.email ?? null);
  }

  if (setClauses.length === 0) return;

  setClauses.push(`updated_at = now()`);
  values.push(teacherId);

  await db.query(
    `update public.teacher_profiles
     set ${setClauses.join(", ")}
     where id = $${paramIdx}`,
    values,
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type RosterStudent = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  sessionsLast7d: number;
  correctLast7d: number;
  totalLast7d: number;
  sessionsPrev7d: number;
  correctPrev7d: number;
  totalPrev7d: number;
  lastSessionAt: string | null;
  inInterventionQueue: boolean;
  streak: number;
};

export type StudentDetail = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
  sessionsLast30d: number;
  correctLast30d: number;
  totalLast30d: number;
  topSkills: { skill: string; correctCount: number; totalCount: number }[];
  recentSessions: {
    sessionId: string;
    startedAt: string;
    sessionMode: string;
    correctCount: number;
    totalQuestions: number;
    effectivenessScore: number | null;
  }[];
  activeInterventions: {
    id: string;
    reason: string;
    skillCode: string | null;
    createdAt: string;
    teacherNote: string | null;
  }[];
  teacherNote: { body: string; updatedAt: string } | null;
};

export type AssignmentInput = {
  teacherId: string;
  title: string;
  description?: string;
  skillCodes: string[];
  launchBandCode?: string;
  sessionMode?: string;
  dueDate?: string;
  studentIds: string[];
};

export type InterventionInput = {
  teacherId: string;
  studentId: string;
  skillCode?: string;
  reason: string;
  interventionType?: string;
  teacherNote?: string;
};

// ─── Roster ───────────────────────────────────────────────────────────────────

export async function getTeacherClassRoster(teacherId: string): Promise<RosterStudent[]> {
  const result = await db.query(
    `
      select
        sp.id                                                          as student_id,
        sp.display_name,
        sp.avatar_key,
        sp.launch_band_code,
        coalesce(ps.total_points, 0)                                  as total_points,
        coalesce(ps.current_level, 1)                                 as current_level,
        count(cs.id) filter (
          where cs.started_at >= now() - interval '7 days'
        )                                                              as sessions_last_7d,
        coalesce(sum(
          (select count(*) filter (where sr.correct)
           from public.session_results sr where sr.session_id = cs.id)
        ) filter (where cs.started_at >= now() - interval '7 days'), 0) as correct_last_7d,
        coalesce(sum(
          (select count(*)
           from public.session_results sr where sr.session_id = cs.id)
        ) filter (where cs.started_at >= now() - interval '7 days'), 0) as total_last_7d,
        count(cs.id) filter (
          where cs.started_at >= now() - interval '14 days'
            and cs.started_at < now() - interval '7 days'
        )                                                              as sessions_prev_7d,
        coalesce(sum(
          (select count(*) filter (where sr.correct)
           from public.session_results sr where sr.session_id = cs.id)
        ) filter (
          where cs.started_at >= now() - interval '14 days'
            and cs.started_at < now() - interval '7 days'
        ), 0)                                                          as correct_prev_7d,
        coalesce(sum(
          (select count(*)
           from public.session_results sr where sr.session_id = cs.id)
        ) filter (
          where cs.started_at >= now() - interval '14 days'
            and cs.started_at < now() - interval '7 days'
        ), 0)                                                          as total_prev_7d,
        max(cs.started_at)                                             as last_session_at,
        exists(
          select 1 from public.teacher_interventions ti
          where ti.student_id = sp.id
            and ti.teacher_id = $1
            and ti.status = 'active'
        )                                                              as in_intervention_queue
      from public.teacher_student_roster tsr
      join public.student_profiles sp on sp.id = tsr.student_id
      left join public.progression_states ps on ps.student_id = sp.id
      left join public.challenge_sessions cs on cs.student_id = sp.id
      where tsr.teacher_id = $1 and tsr.active = true
      group by sp.id, sp.display_name, sp.avatar_key, sp.launch_band_code,
               ps.total_points, ps.current_level
      order by sp.display_name asc
    `,
    [teacherId],
  );

  return result.rows.map((row) => ({
    studentId: row.student_id as string,
    displayName: row.display_name as string,
    avatarKey: row.avatar_key as string,
    launchBandCode: row.launch_band_code as string,
    totalPoints: Number(row.total_points),
    currentLevel: Number(row.current_level),
    sessionsLast7d: Number(row.sessions_last_7d),
    correctLast7d: Number(row.correct_last_7d),
    totalLast7d: Number(row.total_last_7d),
    sessionsPrev7d: Number(row.sessions_prev_7d),
    correctPrev7d: Number(row.correct_prev_7d),
    totalPrev7d: Number(row.total_prev_7d),
    lastSessionAt: (row.last_session_at as string | null) ?? null,
    inInterventionQueue: Boolean(row.in_intervention_queue),
    streak: 0, // TODO: compute from session dates
  }));
}

// ─── Student detail ───────────────────────────────────────────────────────────

export async function getTeacherStudentDetail(
  teacherId: string,
  studentId: string,
): Promise<StudentDetail | null> {
  // Verify teacher has this student on roster
  const rosterCheck = await db.query(
    `select 1 from public.teacher_student_roster
     where teacher_id = $1 and student_id = $2 and active = true limit 1`,
    [teacherId, studentId],
  );

  if (!rosterCheck.rowCount) return null;

  const [profile, sessions, skills, interventions, note] = await Promise.all([
    db.query(
      `select sp.*, coalesce(ps.total_points,0) as total_points,
              coalesce(ps.current_level,1) as current_level,
              coalesce(ps.badge_count,0) as badge_count,
              coalesce(ps.trophy_count,0) as trophy_count
       from public.student_profiles sp
       left join public.progression_states ps on ps.student_id = sp.id
       where sp.id = $1 limit 1`,
      [studentId],
    ),
    db.query(
      `select cs.id, cs.started_at, cs.session_mode, cs.total_questions,
              cs.effectiveness_score,
              count(sr.id) filter (where sr.correct) as correct_count
       from public.challenge_sessions cs
       left join public.session_results sr on sr.session_id = cs.id
       where cs.student_id = $1
       group by cs.id, cs.started_at, cs.session_mode, cs.total_questions, cs.effectiveness_score
       order by cs.started_at desc limit 20`,
      [studentId],
    ),
    db.query(
      `select sr.skill_id,
              sk.display_name as skill_name,
              count(*) filter (where sr.correct) as correct_count,
              count(*) as total_count
       from public.session_results sr
       join public.challenge_sessions cs on cs.id = sr.session_id
       join public.skills sk on sk.id = sr.skill_id
       where cs.student_id = $1 and cs.started_at >= now() - interval '30 days'
       group by sr.skill_id, sk.display_name
       order by correct_count desc limit 8`,
      [studentId],
    ),
    db.query(
      `select id, reason, skill_code, created_at, teacher_note
       from public.teacher_interventions
       where teacher_id = $1 and student_id = $2 and status = 'active'
       order by created_at desc`,
      [teacherId, studentId],
    ),
    db.query(
      `select body, updated_at
       from public.teacher_notes
       where teacher_id = $1 and student_id = $2
       order by updated_at desc limit 1`,
      [teacherId, studentId],
    ),
  ]);

  if (!profile.rowCount) return null;

  const p = profile.rows[0];
  const last30Sessions = sessions.rows.filter(
    (r) => new Date(r.started_at as string) >= new Date(Date.now() - 30 * 86400_000),
  );

  return {
    studentId: p.id as string,
    displayName: p.display_name as string,
    avatarKey: p.avatar_key as string,
    launchBandCode: p.launch_band_code as string,
    totalPoints: Number(p.total_points),
    currentLevel: Number(p.current_level),
    badgeCount: Number(p.badge_count),
    trophyCount: Number(p.trophy_count),
    sessionsLast30d: last30Sessions.length,
    correctLast30d: last30Sessions.reduce((s, r) => s + Number(r.correct_count), 0),
    totalLast30d: last30Sessions.reduce((s, r) => s + Number(r.total_questions), 0),
    topSkills: skills.rows.map((r) => ({
      skill: r.skill_name as string,
      correctCount: Number(r.correct_count),
      totalCount: Number(r.total_count),
    })),
    recentSessions: sessions.rows.slice(0, 10).map((r) => ({
      sessionId: r.id as string,
      startedAt: r.started_at as string,
      sessionMode: r.session_mode as string,
      correctCount: Number(r.correct_count),
      totalQuestions: Number(r.total_questions),
      effectivenessScore: r.effectiveness_score != null ? Number(r.effectiveness_score) : null,
    })),
    activeInterventions: interventions.rows.map((r) => ({
      id: r.id as string,
      reason: r.reason as string,
      skillCode: (r.skill_code as string | null) ?? null,
      createdAt: r.created_at as string,
      teacherNote: (r.teacher_note as string | null) ?? null,
    })),
    teacherNote: note.rowCount
      ? { body: note.rows[0].body as string, updatedAt: note.rows[0].updated_at as string }
      : null,
  };
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function createAssignment(input: AssignmentInput) {
  const assignment = await db.query(
    `insert into public.assignments
       (teacher_id, title, description, skill_codes, launch_band_code, session_mode, due_date)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, created_at`,
    [
      input.teacherId,
      input.title,
      input.description ?? null,
      input.skillCodes,
      input.launchBandCode ?? null,
      input.sessionMode ?? "guided-quest",
      input.dueDate ?? null,
    ],
  );

  const assignmentId = assignment.rows[0].id as string;

  if (input.studentIds.length > 0) {
    const valuePlaceholders = input.studentIds
      .map((_, i) => `($1, $${i + 2})`)
      .join(", ");
    await db.query(
      `insert into public.assignment_students (assignment_id, student_id)
       values ${valuePlaceholders}
       on conflict do nothing`,
      [assignmentId, ...input.studentIds],
    );
  }

  return { assignmentId, createdAt: assignment.rows[0].created_at as string };
}

export async function getTeacherAssignments(teacherId: string) {
  const result = await db.query(
    `select a.id, a.title, a.description, a.skill_codes, a.launch_band_code,
            a.session_mode, a.due_date, a.created_at,
            count(ast.student_id) as assigned_count,
            count(ast.completed_at) as completed_count
     from public.assignments a
     left join public.assignment_students ast on ast.assignment_id = a.id
     where a.teacher_id = $1
     group by a.id
     order by a.created_at desc`,
    [teacherId],
  );

  return result.rows.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    description: (r.description as string | null) ?? null,
    skillCodes: r.skill_codes as string[],
    launchBandCode: (r.launch_band_code as string | null) ?? null,
    sessionMode: r.session_mode as string,
    dueDate: (r.due_date as string | null) ?? null,
    createdAt: r.created_at as string,
    assignedCount: Number(r.assigned_count),
    completedCount: Number(r.completed_count),
  }));
}

export async function getAssignmentProgress(teacherId: string, assignmentId: string) {
  // Verify assignment belongs to teacher
  const asgn = await db.query(
    `select id, title, skill_codes, due_date, created_at, session_mode
     from public.assignments
     where id = $1 and teacher_id = $2
     limit 1`,
    [assignmentId, teacherId],
  );

  if (!asgn.rowCount) return null;

  const a = asgn.rows[0];

  const students = await db.query(
    `select ast.student_id, sp.display_name, sp.avatar_key,
            ast.completed_at, ast.session_id
     from public.assignment_students ast
     join public.student_profiles sp on sp.id = ast.student_id
     where ast.assignment_id = $1
     order by sp.display_name asc`,
    [assignmentId],
  );

  const studentList = students.rows.map((r) => ({
    studentId: r.student_id as string,
    displayName: r.display_name as string,
    avatarKey: r.avatar_key as string,
    completed: r.completed_at != null,
    completedAt: (r.completed_at as string | null) ?? null,
    sessionId: (r.session_id as string | null) ?? null,
  }));

  return {
    assignmentId: a.id as string,
    title: a.title as string,
    skillCodes: a.skill_codes as string[],
    sessionMode: a.session_mode as string,
    dueDate: (a.due_date as string | null) ?? null,
    createdAt: a.created_at as string,
    totalStudents: studentList.length,
    completedCount: studentList.filter((s) => s.completed).length,
    students: studentList,
  };
}

// ─── Interventions ────────────────────────────────────────────────────────────

export async function createIntervention(input: InterventionInput) {
  const result = await db.query(
    `insert into public.teacher_interventions
       (teacher_id, student_id, skill_code, reason, intervention_type, teacher_note)
     values ($1, $2, $3, $4, $5, $6)
     returning id, created_at`,
    [
      input.teacherId,
      input.studentId,
      input.skillCode ?? null,
      input.reason,
      input.interventionType ?? "support-queue",
      input.teacherNote ?? null,
    ],
  );

  return { interventionId: result.rows[0].id as string, createdAt: result.rows[0].created_at as string };
}

export async function resolveIntervention(
  teacherId: string,
  interventionId: string,
  resolutionNote?: string,
) {
  await db.query(
    `update public.teacher_interventions
     set status = 'resolved', resolved_at = now(), resolution_note = $3, updated_at = now()
     where id = $1 and teacher_id = $2`,
    [interventionId, teacherId, resolutionNote ?? null],
  );
}

export async function getTeacherInterventions(teacherId: string, status = "active") {
  const result = await db.query(
    `select ti.id, ti.student_id, sp.display_name as student_name,
            ti.skill_code, ti.reason, ti.intervention_type, ti.status,
            ti.teacher_note, ti.created_at, ti.resolved_at, ti.resolution_note
     from public.teacher_interventions ti
     join public.student_profiles sp on sp.id = ti.student_id
     where ti.teacher_id = $1 and ti.status = $2
     order by ti.created_at desc`,
    [teacherId, status],
  );

  return result.rows.map((r) => ({
    id: r.id as string,
    studentId: r.student_id as string,
    studentName: r.student_name as string,
    skillCode: (r.skill_code as string | null) ?? null,
    reason: r.reason as string,
    interventionType: r.intervention_type as string,
    status: r.status as string,
    teacherNote: (r.teacher_note as string | null) ?? null,
    createdAt: r.created_at as string,
    resolvedAt: (r.resolved_at as string | null) ?? null,
    resolutionNote: (r.resolution_note as string | null) ?? null,
  }));
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function upsertTeacherNote(
  teacherId: string,
  studentId: string,
  body: string,
) {
  await db.query(
    `insert into public.teacher_notes (teacher_id, student_id, body)
     values ($1, $2, $3)
     on conflict (teacher_id, student_id)
     do update set body = excluded.body, updated_at = now()`,
    [teacherId, studentId, body],
  );
}

// ─── Credential-based Teacher Access ─────────────────────────────────────────

function hashTeacherPassword(password: string, username: string): string {
  return crypto.createHash("sha256")
    .update(`${username}:${password}:wonderquest-teacher`)
    .digest("hex");
}

function verifyTeacherPassword(password: string, username: string, hash: string): boolean {
  return hashTeacherPassword(password, username) === hash;
}

export async function accessTeacherWithCredentials(input: {
  username: string;
  password: string;
}): Promise<{ ok: boolean; teacherId: string; isNew: boolean; error?: string }> {
  const { username, password } = input;

  const existing = await db.query(
    `select id, display_name, username, password_hash
     from public.teacher_profiles
     where username = $1 and tester_flag = false
     limit 1`,
    [username],
  );

  if (existing.rowCount && existing.rows.length > 0) {
    const row = existing.rows[0];
    const passwordHash = row.password_hash as string | null;

    if (!passwordHash) {
      // Legacy profile without password — allow any password and set it
      await db.query(
        `update public.teacher_profiles set password_hash = $2, username = $3 where id = $1`,
        [row.id, hashTeacherPassword(password, username), username],
      );
      return { ok: true, teacherId: row.id as string, isNew: false };
    }

    if (!verifyTeacherPassword(password, username, passwordHash)) {
      return { ok: false, teacherId: "", isNew: false, error: "Wrong username or password." };
    }

    return { ok: true, teacherId: row.id as string, isNew: false };
  }

  // Self-register new teacher
  const inserted = await db.query(
    `insert into public.teacher_profiles (display_name, username, password_hash, tester_flag)
     values ($1, $2, $3, false)
     returning id`,
    [username, username, hashTeacherPassword(password, username)],
  );

  return { ok: true, teacherId: inserted.rows[0].id as string, isNew: true };
}

// ── Class Code Functions ──────────────────────────────────────────────────────

export async function ensureTeacherClassCode(teacherId: string): Promise<string> {
  const existing = await db.query(
    `select class_code from public.teacher_profiles where id = $1`,
    [teacherId]
  );
  if (existing.rows[0]?.class_code) return existing.rows[0].class_code as string;

  // Generate a fresh 6-char code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await db.query(
    `update public.teacher_profiles set class_code = $2 where id = $1`,
    [teacherId, code]
  );
  return code;
}

export async function joinClassByCode(input: {
  classCode: string;
  studentId: string;
}): Promise<{ ok: boolean; teacherName: string; schoolName: string | null }> {
  const teacher = await db.query(
    `select id, display_name, school_name from public.teacher_profiles
     where upper(class_code) = upper($1) and tester_flag = false
     limit 1`,
    [input.classCode]
  );

  if (!teacher.rowCount) throw new Error("Class code not found. Check the code and try again.");

  const row = teacher.rows[0];

  await db.query(
    `insert into public.teacher_student_roster (teacher_id, student_id)
     values ($1, $2)
     on conflict (teacher_id, student_id) do update set active = true`,
    [row.id, input.studentId]
  );

  return {
    ok: true,
    teacherName: row.display_name as string,
    schoolName: (row.school_name as string | null) ?? null,
  };
}
