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
    throw new Error(`${path} failed: ${payload.error ?? response.statusText}`);
  }

  return payload;
}

async function main() {
  const baseUrl = await resolveBaseUrl();
  const childUsername = `${runKey}-child`;
  const parentUsername = `${runKey}-parent`;

  const child = await postJson(baseUrl, "/api/child/access", {
    username: childUsername,
    pin: "2468",
    displayName: "QA Child",
    avatarKey: "lion-striker",
    launchBandCode: "K1",
  });

  const session = await postJson(baseUrl, "/api/play/session", {
    sessionMode: "guided-quest",
  });

  const firstQuestion = session.questions[0];

  const wrongAnswer = firstQuestion.answers.find(
    (answer) => answer !== firstQuestion.correctAnswer,
  );

  const retry = await postJson(baseUrl, "/api/play/answer", {
    sessionId: session.sessionId,
    questionKey: firstQuestion.questionKey,
    answer: wrongAnswer,
    attempt: 1,
    timeSpentMs: 3200,
  });

  const recovery = await postJson(baseUrl, "/api/play/answer", {
    sessionId: session.sessionId,
    questionKey: firstQuestion.questionKey,
    answer: firstQuestion.correctAnswer,
    attempt: 999,
    timeSpentMs: 1800,
  });

  const parent = await postJson(baseUrl, "/api/parent/access", {
    username: parentUsername,
    pin: "1357",
    displayName: "QA Parent",
    childUsername,
    relationship: "parent",
    notifyWeekly: true,
    notifyMilestones: true,
  });

  const feedback = await postJson(baseUrl, "/api/feedback", {
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

  console.log(
    JSON.stringify(
      {
        baseUrl,
        childCreated: child.created,
        sessionId: session.sessionId,
        firstQuestion: firstQuestion.questionKey,
        retryNeedsExplainer: retry.needsRetry,
        recoveryPoints: recovery.pointsEarned,
        linkedChildren: parent.linkedChildren.length,
        childDashboardTimeSpentMs: parent.childDashboard?.totalTimeSpentMs ?? null,
        childDashboardAverageEffectiveness:
          parent.childDashboard?.averageEffectiveness ?? null,
        feedbackCategory: feedback.triage.category,
      },
      null,
      2,
    ),
  );
}

await main();
