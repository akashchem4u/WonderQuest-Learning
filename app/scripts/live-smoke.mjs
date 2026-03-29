import process from "node:process";

const runKey = `qa-${Date.now()}`;
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
    ];

async function resolveBaseUrl() {
  for (const candidate of baseUrlCandidates) {
    try {
      const response = await fetch(`${candidate}/`, {
        method: "GET",
      });

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

    const key = pair.slice(0, separatorIndex);
    const value = pair.slice(separatorIndex + 1);
    cookieJar.set(key, value);
  }
}

function buildCookieHeader() {
  return [...cookieJar.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

async function postJson(baseUrl, path, body) {
  const headers = {
    "Content-Type": "application/json",
  };
  const cookieHeader = buildCookieHeader();

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  mergeCookies(response);
  const rawBody = await response.text();
  const payload = rawBody ? JSON.parse(rawBody) : {};

  if (!response.ok) {
    throw new Error(`${path} failed (${response.status}): ${payload.error ?? response.statusText}`);
  }

  return { payload, status: response.status };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Smoke assertion failed: ${message}`);
  }
}

function assertQuestionSkillOrder(session, expectedSkills, label) {
  const actualSkills = Array.isArray(session.questions)
    ? session.questions.map((question) => question.skill)
    : [];

  assert(
    actualSkills.length >= expectedSkills.length,
    `${label} should return at least ${expectedSkills.length} questions`,
  );
  assert(
    expectedSkills.every((skill, index) => actualSkills[index] === skill),
    `${label} should start ${expectedSkills.join(" -> ")} (got ${actualSkills.join(" -> ")})`,
  );
}

async function main() {
  const baseUrl = await resolveBaseUrl();
  const childUsername = `${runKey}-child`;
  const prekUsername = `${runKey}-prek`;
  const parentUsername = `${runKey}-parent`;

  // ── Child access + play session ───────────────────────────────────────────

  const { payload: child } = await postJson(baseUrl, "/api/child/access", {
    username: childUsername,
    pin: "2468",
    displayName: "QA Child",
    avatarKey: "lion-striker",
    launchBandCode: "K1",
  });
  assert(child.student?.id, "child.student.id should be present");
  assert(cookieJar.has("wonderquest-child-session"), "child session cookie should be set");

  const { payload: session } = await postJson(baseUrl, "/api/play/session", {
    sessionMode: "guided-quest",
  });
  assert(session.sessionId, "sessionId should be present");
  assert(Array.isArray(session.questions) && session.questions.length > 0, "questions array should be non-empty");
  assertQuestionSkillOrder(
    session,
    ["short-a-sound", "read-simple-word", "add-to-10"],
    "K1 guided quest",
  );

  const firstQuestion = session.questions[0];

  const wrongAnswer = firstQuestion.answers.find(
    (answer) => answer !== firstQuestion.correctAnswer,
  );

  const { payload: retry } = await postJson(baseUrl, "/api/play/answer", {
    sessionId: session.sessionId,
    questionKey: firstQuestion.questionKey,
    answer: wrongAnswer,
    attempt: 1,
    timeSpentMs: 3200,
  });
  assert(retry.needsRetry === true, "wrong answer should set needsRetry=true");
  assert(retry.explainer !== null, "wrong answer should return an explainer");

  const { payload: recovery } = await postJson(baseUrl, "/api/play/answer", {
    sessionId: session.sessionId,
    questionKey: firstQuestion.questionKey,
    answer: firstQuestion.correctAnswer,
    attempt: 999,
    timeSpentMs: 1800,
  });
  assert(recovery.correct === true, "correct answer should set correct=true");
  assert(recovery.pointsEarned > 0, "correct answer should earn points");

  // ── Child session cookie durability ───────────────────────────────────────

  const childSessionHeaders = {};
  const childCookieHeader = buildCookieHeader();
  if (childCookieHeader) childSessionHeaders.Cookie = childCookieHeader;
  const childRestoreRaw = await fetch(`${baseUrl}/api/child/session`, {
    method: "GET",
    headers: childSessionHeaders,
  });
  assert(childRestoreRaw.ok, `GET /api/child/session should succeed (got ${childRestoreRaw.status})`);
  const childRestore = await childRestoreRaw.json();
  assert(childRestore.student?.id === child.student.id, "session-restored student id should match original");
  assert(typeof childRestore.progression?.totalPoints === "number", "session-restored progression should be present");

  // ── PREK guided sequencing ────────────────────────────────────────────────

  const { payload: prekChild } = await postJson(baseUrl, "/api/child/access", {
    username: prekUsername,
    pin: "8642",
    displayName: "QA PREK Child",
    avatarKey: "bunny-helper",
    launchBandCode: "PREK",
  });
  assert(prekChild.student?.id, "prek child.student.id should be present");

  const { payload: prekSession } = await postJson(baseUrl, "/api/play/session", {
    sessionMode: "guided-quest",
  });
  assert(prekSession.sessionId, "prek sessionId should be present");
  assertQuestionSkillOrder(
    prekSession,
    ["count-to-3", "shape-circle", "letter-b-recognition"],
    "PREK guided quest",
  );

  // ── Parent access + session cookie durability ─────────────────────────────

  const { payload: parent } = await postJson(baseUrl, "/api/parent/access", {
    username: parentUsername,
    pin: "1357",
    displayName: "QA Parent",
    childUsername,
    relationship: "parent",
    notifyWeekly: true,
    notifyMilestones: true,
  });
  assert(parent.guardian?.id, "parent.guardian.id should be present");
  assert(cookieJar.has("wonderquest-parent-session"), "parent session cookie should be set");
  assert(parent.linkedChildren.length > 0, "parent should have at least one linked child");
  assert(parent.childDashboard !== null, "childDashboard should be present after linking");

  // Return visit — restore the family surface from the session cookie alone (no credentials).
  const headers = {};
  const cookieHeader = buildCookieHeader();
  if (cookieHeader) headers.Cookie = cookieHeader;
  const sessionRestoreRaw = await fetch(`${baseUrl}/api/parent/session`, {
    method: "GET",
    headers,
  });
  assert(sessionRestoreRaw.ok, `GET /api/parent/session should succeed (got ${sessionRestoreRaw.status})`);
  const parentReturn = await sessionRestoreRaw.json();
  assert(parentReturn.guardian?.id === parent.guardian.id, "session-restored guardian id should match original");
  assert(parentReturn.linkedChildren.length > 0, "linked children should be present in cookie-restored session");

  // ── Feedback submission ───────────────────────────────────────────────────

  const { payload: feedback } = await postJson(baseUrl, "/api/feedback", {
    submittedByRole: "parent",
    guardianId: parent.guardian.id,
    studentId: child.student.id,
    sourceChannel: "parent-dashboard",
    reportedType: "bug",
    message: "The parent dashboard should make the latest child summary easier to scan.",
    context: {
      screen: "parent-dashboard",
      deviceType: "desktop",
      browser: "chrome",
    },
  });
  assert(feedback.feedbackId, "feedbackId should be present");
  assert(feedback.triage?.category, "triage category should be present");

  console.log(
    JSON.stringify(
      {
        baseUrl,
        childCreated: child.created,
        childSessionCookieSet: cookieJar.has("wonderquest-child-session"),
        childSessionRestoreStudentId: childRestore.student?.id ?? null,
        sessionId: session.sessionId,
        firstQuestion: firstQuestion.questionKey,
        k1QuestionSkills: session.questions.map((question) => question.skill),
        prekQuestionSkills: prekSession.questions.map((question) => question.skill),
        retryNeedsExplainer: retry.needsRetry,
        recoveryPoints: recovery.pointsEarned,
        parentSessionCookieSet: cookieJar.has("wonderquest-parent-session"),
        linkedChildren: parent.linkedChildren.length,
        childDashboardTimeSpentMs: parent.childDashboard?.totalTimeSpentMs ?? null,
        childDashboardAverageEffectiveness:
          parent.childDashboard?.averageEffectiveness ?? null,
        sessionRestoreLinkedChildren: parentReturn.linkedChildren.length,
        feedbackCategory: feedback.triage.category,
      },
      null,
      2,
    ),
  );
}

await main();
