import process from "node:process";

const baseUrl = process.env.WONDERQUEST_SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const runKey = `qa-${Date.now()}`;

async function postJson(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${path} failed: ${payload.error ?? response.statusText}`);
  }

  return payload;
}

async function main() {
  const childUsername = `${runKey}-child`;
  const parentUsername = `${runKey}-parent`;

  const child = await postJson("/api/child/access", {
    username: childUsername,
    pin: "2468",
    displayName: "QA Child",
    avatarKey: "lion-striker",
    launchBandCode: "K1",
  });

  const session = await postJson("/api/play/session", {
    studentId: child.student.id,
    sessionMode: "guided-quest",
  });

  const firstQuestion = session.questions[0];

  const wrongAnswer = firstQuestion.answers.find(
    (answer) => answer !== "10",
  );

  const retry = await postJson("/api/play/answer", {
    sessionId: session.sessionId,
    studentId: child.student.id,
    questionKey: firstQuestion.questionKey,
    answer: wrongAnswer,
    attempt: 1,
  });

  const recovery = await postJson("/api/play/answer", {
    sessionId: session.sessionId,
    studentId: child.student.id,
    questionKey: firstQuestion.questionKey,
    answer: "10",
    attempt: 999,
  });

  const parent = await postJson("/api/parent/access", {
    username: parentUsername,
    pin: "1357",
    displayName: "QA Parent",
    childUsername,
    relationship: "parent",
    notifyWeekly: true,
    notifyMilestones: true,
  });

  const feedback = await postJson("/api/feedback", {
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
        childCreated: child.created,
        sessionId: session.sessionId,
        firstQuestion: firstQuestion.questionKey,
        retryNeedsExplainer: retry.needsRetry,
        recoveryPoints: recovery.pointsEarned,
        linkedChildren: parent.linkedChildren.length,
        feedbackCategory: feedback.triage.category,
      },
      null,
      2,
    ),
  );
}

await main();
