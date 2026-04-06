import process from "node:process";
import pg from "pg";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const runKey = `backend-${Date.now()}`;
const cookieJar = new Map();
const baseUrlCandidates = process.env.WONDERQUEST_SMOKE_BASE_URL
  ? [process.env.WONDERQUEST_SMOKE_BASE_URL]
  : [
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "http://[::1]:3000",
      "http://127.0.0.1:3001",
      "http://localhost:3001",
      "http://[::1]:3001",
      "http://127.0.0.1:3002",
      "http://localhost:3002",
      "http://[::1]:3002",
      "http://127.0.0.1:3003",
      "http://localhost:3003",
      "http://[::1]:3003",
    ];

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Smoke assertion failed: ${message}`);
  }
}

async function resolveBaseUrl() {
  if (process.env.WONDERQUEST_SMOKE_BASE_URL?.trim()) {
    return process.env.WONDERQUEST_SMOKE_BASE_URL.trim();
  }

  for (const candidate of baseUrlCandidates) {
    try {
      const response = await fetch(`${candidate}/`, { method: "GET" });

      if (response.ok) {
        return candidate;
      }
    } catch {}
  }

  throw new Error(
    `Could not reach WonderQuest locally. Tried: ${baseUrlCandidates.join(", ")}`,
  );
}

function mergeCookies(response) {
  const rawCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : response.headers.get("set-cookie")
        ? [response.headers.get("set-cookie")]
        : [];

  for (const rawCookie of rawCookies) {
    const pair = rawCookie.split(";", 1)[0];

    if (!pair) {
      continue;
    }

    const separatorIndex = pair.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    cookieJar.set(
      pair.slice(0, separatorIndex),
      pair.slice(separatorIndex + 1),
    );
  }
}

function buildCookieHeader() {
  return [...cookieJar.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

async function requestJson(baseUrl, path, { method = "GET", body } = {}) {
  const headers = {};
  const cookieHeader = buildCookieHeader();

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  mergeCookies(response);
  const rawBody = await response.text();
  const payload = rawBody ? JSON.parse(rawBody) : {};

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

function createDbPool() {
  return new pg.Pool({
    host: requireEnv("SUPABASE_DB_HOST"),
    port: Number(requireEnv("SUPABASE_DB_PORT")),
    database: requireEnv("SUPABASE_DB_NAME"),
    user: requireEnv("SUPABASE_DB_USER"),
    password: requireEnv("SUPABASE_DB_PASSWORD"),
    ssl: {
      rejectUnauthorized: false,
    },
    max: 4,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  });
}

async function seedTeacherRoster(pool, studentId) {
  const teacherResult = await pool.query(
    `
      insert into public.teacher_profiles (
        display_name,
        email,
        school_name,
        grade_levels,
        tester_flag
      )
      values ($1, $2, $3, $4, true)
      returning id, display_name
    `,
    [
      "Smoke Teacher",
      `${runKey}@wonderquest-smoke.local`,
      "WonderQuest QA",
      ["K", "1"],
    ],
  );

  const teacherId = String(teacherResult.rows[0].id);

  await pool.query(
    `
      insert into public.teacher_student_roster (
        teacher_id,
        student_id,
        active
      )
      values ($1, $2, true)
      on conflict (teacher_id, student_id) do update
      set active = excluded.active
    `,
    [teacherId, studentId],
  );

  return {
    teacherId,
  };
}

async function seedTeacherIntervention(pool, teacherId, studentId, skillCode) {
  const result = await pool.query(
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
      values ($1, $2, $3, $4, 'support-queue', 'active', $5)
      returning id
    `,
    [
      teacherId,
      studentId,
      skillCode,
      "backend smoke seeded intervention",
      "Resolve through API verification.",
    ],
  );

  return String(result.rows[0].id);
}

async function primeStudentForMilestone(pool, studentId) {
  const result = await pool.query(
    `
      update public.progression_states
      set
        total_points = 30,
        current_level = 1,
        badge_count = 1,
        trophy_count = 0,
        updated_at = now()
      where student_id = $1
      returning student_id
    `,
    [studentId],
  );

  assert(result.rowCount === 1, "progression state should exist for smoke student");
}

async function completeSession(baseUrl, session) {
  const queue = [...session.questions];
  const seenQuestionKeys = new Set();
  const answeredQuestionKeys = [];
  let lastAnswer = null;

  while (queue.length > 0) {
    const question = queue.shift();

    if (!question?.questionKey || seenQuestionKeys.has(question.questionKey)) {
      continue;
    }

    seenQuestionKeys.add(question.questionKey);

    const result = await requestJson(baseUrl, "/api/play/answer", {
      method: "POST",
      body: {
        sessionId: session.sessionId,
        questionKey: question.questionKey,
        answer: question.correctAnswer,
        attempt: 1,
        timeSpentMs: 1200,
      },
    });

    if (!result.ok) {
      throw new Error(
        `/api/play/answer failed (${result.status}): ${result.payload.error ?? "Unknown error"}`,
      );
    }

    answeredQuestionKeys.push(question.questionKey);
    lastAnswer = result.payload;

    if (result.payload.adaptiveQuestion?.questionKey) {
      queue.unshift(result.payload.adaptiveQuestion);
    }

    if (result.payload.sessionCompleted) {
      break;
    }
  }

  assert(lastAnswer !== null, "session should yield at least one answer result");
  assert(lastAnswer.sessionCompleted === true, "guided quest should complete");

  return {
    answeredQuestionKeys,
    lastAnswer,
  };
}

async function main() {
  const baseUrl = await resolveBaseUrl();
  const teacherCode = requireEnv("TEACHER_ACCESS_CODE");
  const pool = createDbPool();
  const childUsername = `${runKey}-child`;
  const parentUsername = `${runKey}-parent`;

  try {
    const childAccess = await requestJson(baseUrl, "/api/child/access", {
      method: "POST",
      body: {
        username: childUsername,
        pin: "2468",
        displayName: "Backend Smoke Child",
        avatarKey: "lion-striker",
        launchBandCode: "K1",
      },
    });

    if (!childAccess.ok) {
      throw new Error(
        `/api/child/access failed (${childAccess.status}): ${childAccess.payload.error ?? "Unknown error"}`,
      );
    }

    const studentId = String(childAccess.payload.student.id);

    const parentAccess = await requestJson(baseUrl, "/api/parent/access", {
      method: "POST",
      body: {
        username: parentUsername,
        pin: "1357",
        displayName: "Backend Smoke Parent",
        childUsername,
        relationship: "parent",
        notifyWeekly: true,
        notifyMilestones: true,
      },
    });

    if (!parentAccess.ok) {
      throw new Error(
        `/api/parent/access failed (${parentAccess.status}): ${parentAccess.payload.error ?? "Unknown error"}`,
      );
    }

    const guardianId = String(parentAccess.payload.guardian.id);
    await primeStudentForMilestone(pool, studentId);
    const { teacherId } = await seedTeacherRoster(pool, studentId);

    const teacherAccess = await requestJson(baseUrl, "/api/teacher/access", {
      method: "POST",
      body: { code: teacherCode },
    });

    if (!teacherAccess.ok) {
      throw new Error(
        `/api/teacher/access failed (${teacherAccess.status}): ${teacherAccess.payload.error ?? "Unknown error"}`,
      );
    }

    const createAssignment = await requestJson(baseUrl, "/api/teacher/assignments", {
      method: "POST",
      body: {
        teacherId,
        title: "Smoke guided quest",
        description: "Verifies assignment completion tracking.",
        skillCodes: [],
        launchBandCode: "K1",
        sessionMode: "guided-quest",
        studentIds: [studentId],
      },
    });

    if (!createAssignment.ok) {
      throw new Error(
        `/api/teacher/assignments failed (${createAssignment.status}): ${createAssignment.payload.error ?? "Unknown error"}`,
      );
    }

    const assignmentId = String(createAssignment.payload.assignment.id);
    const listAssignments = await requestJson(
      baseUrl,
      `/api/teacher/assignments?teacherId=${teacherId}`,
    );

    assert(listAssignments.ok, "teacher assignments list route should succeed");
    assert(
      Array.isArray(listAssignments.payload.roster) &&
        listAssignments.payload.roster.some((student) => student.studentId === studentId),
      "teacher assignments list should include the roster student",
    );
    assert(
      Array.isArray(listAssignments.payload.assignments) &&
        listAssignments.payload.assignments.some((assignment) => assignment.id === assignmentId),
      "teacher assignments list should include the created assignment",
    );

    const assignmentDetail = await requestJson(
      baseUrl,
      `/api/teacher/assignments/${assignmentId}?teacherId=${teacherId}`,
    );

    assert(assignmentDetail.ok, "teacher assignment detail route should succeed");
    assert(
      assignmentDetail.payload.assignment?.assignedStudentIds?.includes(studentId),
      "teacher assignment detail should include the assigned learner",
    );

    const updateAssignment = await requestJson(
      baseUrl,
      `/api/teacher/assignments/${assignmentId}`,
      {
        method: "PATCH",
        body: {
          teacherId,
          title: "Smoke guided quest updated",
          description: "Updated during backend smoke.",
          skillCodes: [],
          launchBandCode: "K1",
          sessionMode: "guided-quest",
          dueDate: "2030-01-15",
          studentIds: [studentId],
        },
      },
    );

    assert(updateAssignment.ok, "teacher assignment update route should succeed");
    assert(
      updateAssignment.payload.assignment?.title === "Smoke guided quest updated",
      "teacher assignment update should persist the new title",
    );
    assert(
      updateAssignment.payload.assignment?.dueDate === "2030-01-15",
      "teacher assignment update should persist the due date",
    );

    const deleteCandidate = await requestJson(baseUrl, "/api/teacher/assignments", {
      method: "POST",
      body: {
        teacherId,
        title: "Smoke delete target",
        description: "Should be deleted during smoke.",
        skillCodes: [],
        launchBandCode: "K1",
        sessionMode: "guided-quest",
        studentIds: [studentId],
      },
    });

    assert(deleteCandidate.ok, "secondary assignment create should succeed");
    const deletedAssignmentId = String(deleteCandidate.payload.assignment.id);
    const deleteAssignment = await requestJson(
      baseUrl,
      `/api/teacher/assignments/${deletedAssignmentId}?teacherId=${teacherId}`,
      {
        method: "DELETE",
      },
    );

    assert(deleteAssignment.ok, "teacher assignment delete route should succeed");
    assert(
      deleteAssignment.payload.deleted === true,
      "teacher assignment delete route should confirm deletion",
    );

    const listAfterDelete = await requestJson(
      baseUrl,
      `/api/teacher/assignments?teacherId=${teacherId}`,
    );

    assert(listAfterDelete.ok, "teacher assignments list should still succeed");
    assert(
      Array.isArray(listAfterDelete.payload.assignments) &&
        listAfterDelete.payload.assignments.some((assignment) => assignment.id === assignmentId) &&
        !listAfterDelete.payload.assignments.some(
          (assignment) => assignment.id === deletedAssignmentId,
        ),
      "teacher assignments list should reflect deletion without losing the active assignment",
    );

    const playSession = await requestJson(baseUrl, "/api/play/session", {
      method: "POST",
      body: {
        sessionMode: "guided-quest",
      },
    });

    if (!playSession.ok) {
      throw new Error(
        `/api/play/session failed (${playSession.status}): ${playSession.payload.error ?? "Unknown error"}`,
      );
    }

    assert(
      Array.isArray(playSession.payload.questions) &&
        playSession.payload.questions.length > 0,
      "play session should include questions",
    );

    const sessionOutcome = await completeSession(baseUrl, playSession.payload);
    const seededInterventionId = await seedTeacherIntervention(
      pool,
      teacherId,
      studentId,
      String(playSession.payload.questions[0]?.skill ?? "short-a-sound"),
    );

    const parentNotifications = await requestJson(
      baseUrl,
      "/api/parent/notifications?includeRead=1&limit=10",
    );
    const parentLinkHealth = await requestJson(baseUrl, "/api/parent/link-health");
    const parentSkills = await requestJson(baseUrl, "/api/parent/skills");
    const parentReport = await requestJson(baseUrl, "/api/parent/report");
    const assignmentProgress = await requestJson(
      baseUrl,
      `/api/teacher/assignments/${assignmentId}/progress?teacherId=${teacherId}`,
    );
    const health = await requestJson(baseUrl, "/api/health");

    assert(parentNotifications.ok, "parent notifications route should succeed");
    assert(parentLinkHealth.ok, "parent link health route should succeed");
    assert(parentSkills.ok, "parent skills route should succeed");
    assert(parentReport.ok, "parent report route should succeed");
    assert(assignmentProgress.ok, "teacher assignment progress route should succeed");
    assert(health.ok, "health route should succeed");

    const firstNotificationId = String(
      parentNotifications.payload.notifications?.[0]?.id ?? "",
    );
    assert(firstNotificationId, "parent notifications should return at least one item");

    const markNotificationRead = await requestJson(
      baseUrl,
      `/api/parent/notifications/${firstNotificationId}`,
      {
        method: "PATCH",
        body: { read: true },
      },
    );
    const markAllNotificationsRead = await requestJson(
      baseUrl,
      "/api/parent/notifications/read-all",
      {
        method: "PATCH",
        body: { read: true },
      },
    );
    const parentNotificationsAfterRead = await requestJson(
      baseUrl,
      "/api/parent/notifications?includeRead=1&limit=10",
    );
    const resolveIntervention = await requestJson(
      baseUrl,
      `/api/teacher/interventions/${seededInterventionId}/resolve`,
      {
        method: "POST",
        body: {
          teacherId,
          resolutionNote: "Small-group reteach worked.",
          strategyTag: "small-group-reteach",
          effectivenessRating: 4,
        },
      },
    );

    assert(markNotificationRead.ok, "single notification read route should succeed");
    assert(markAllNotificationsRead.ok, "bulk notification read route should succeed");
    assert(
      parentNotificationsAfterRead.ok,
      "parent notifications route should still succeed after marking read",
    );
    assert(resolveIntervention.ok, "teacher intervention resolve route should succeed");

    const assignmentRow = await pool.query(
      `
        select completed_at, session_id
        from public.assignment_students
        where assignment_id = $1
          and student_id = $2
        limit 1
      `,
      [assignmentId, studentId],
    );
    const notificationRows = await pool.query(
      `
        select type, title, description, created_at
        from public.student_notifications
        where student_id = $1
        order by created_at desc
      `,
      [studentId],
    );
    const interventionFeedbackRows = await pool.query(
      `
        select strategy_tag, effectiveness_rating
        from public.intervention_resolution_feedback
        where intervention_id = $1
        limit 1
      `,
      [seededInterventionId],
    );

    assert(assignmentRow.rowCount === 1, "assignment_students row should exist");
    assert(
      assignmentRow.rows[0].completed_at !== null,
      "assignment should be marked complete",
    );
    assert(
      assignmentRow.rows[0].session_id === playSession.payload.sessionId,
      "assignment completion should retain the completing session id",
    );
    assert(notificationRows.rowCount > 0, "milestone notifications should be written");
    assert(
      notificationRows.rows.some((row) => String(row.type) === "level_up"),
      "milestone notifications should include level_up",
    );
    assert(
      Number(parentNotifications.payload.unreadCount ?? 0) > 0,
      "parent notifications unread count should reflect milestone delivery",
    );
    assert(
      Array.isArray(parentNotifications.payload.notifications) &&
        parentNotifications.payload.notifications.some(
          (item) => item.studentId === studentId,
        ),
      "parent notifications route should return the learner milestone",
    );
    assert(
      parentLinkHealth.payload.healthy === true,
      "parent link health should report a healthy guardian/student link",
    );
    assert(
      Array.isArray(parentSkills.payload.skills) &&
        parentSkills.payload.skills.length > 0,
      "parent skills route should return persisted or fallback mastery data",
    );
    assert(
      parentReport.payload.report?.weekly?.sessionCount >= 1,
      "parent report weekly summary should include the smoke session",
    );
    assert(
      Number(assignmentProgress.payload.summary?.completedStudents ?? 0) === 1,
      "assignment progress summary should show the learner as completed",
    );
    assert(
      Number(parentNotificationsAfterRead.payload.unreadCount ?? -1) === 0,
      "notification lifecycle routes should clear unread count",
    );
    assert(
      interventionFeedbackRows.rowCount === 1,
      "intervention resolution should write feedback",
    );
    assert(
      Number(interventionFeedbackRows.rows[0].effectiveness_rating ?? 0) === 4,
      "intervention resolution should persist the effectiveness rating",
    );

    console.log(
      JSON.stringify(
        {
          baseUrl,
          teacherId,
          guardianId,
          studentId,
          assignmentId,
          deletedAssignmentId,
          sessionId: playSession.payload.sessionId,
          interventionId: seededInterventionId,
          assignmentListCount: listAfterDelete.payload.assignments.length,
          answeredQuestionKeys: sessionOutcome.answeredQuestionKeys,
          milestones: sessionOutcome.lastAnswer.milestones,
          assignmentProgressSummary: assignmentProgress.payload.summary,
          notificationTypes: notificationRows.rows.map((row) => String(row.type)),
          parentUnreadCount: Number(parentNotifications.payload.unreadCount ?? 0),
          parentUnreadCountAfterRead: Number(
            parentNotificationsAfterRead.payload.unreadCount ?? 0,
          ),
          parentNotificationCount: Array.isArray(parentNotifications.payload.notifications)
            ? parentNotifications.payload.notifications.length
            : 0,
          parentSkillCount: Array.isArray(parentSkills.payload.skills)
            ? parentSkills.payload.skills.length
            : 0,
          weeklyReportSessions: Number(parentReport.payload.report?.weekly?.sessionCount ?? 0),
          healthStatus: health.payload.status,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

await main();
