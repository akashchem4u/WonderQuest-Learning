import process from "node:process";
import pg from "pg";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const { Pool } = pg;
const runKey = `parent-report-${Date.now()}`;
const cookieJar = new Map();
const baseUrlCandidates = process.env.WONDERQUEST_SMOKE_BASE_URL
  ? [process.env.WONDERQUEST_SMOKE_BASE_URL]
  : [
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3001",
      "http://localhost:3001",
      "http://127.0.0.1:3002",
      "http://localhost:3002",
      "http://127.0.0.1:3003",
      "http://localhost:3003",
      "http://127.0.0.1:3004",
      "http://localhost:3004",
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
  return new Pool({
    host: requireEnv("SUPABASE_DB_HOST"),
    port: Number(requireEnv("SUPABASE_DB_PORT")),
    database: requireEnv("SUPABASE_DB_NAME"),
    user: requireEnv("SUPABASE_DB_USER"),
    password: requireEnv("SUPABASE_DB_PASSWORD"),
    ssl: {
      rejectUnauthorized: false,
    },
    max: 2,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  });
}

async function main() {
  const baseUrl = await resolveBaseUrl();
  const pool = createDbPool();

  try {
    const childUsername = `${runKey}-child`;
    const parentUsername = `${runKey}-parent`;
    const childPin = "2468";
    const parentPin = "1357";

    const childAccess = await requestJson(baseUrl, "/api/child/access", {
      method: "POST",
      body: {
        username: childUsername,
        pin: childPin,
        displayName: "Week Offset Child",
        launchBandCode: "K1",
        avatarKey: "lion-striker",
      },
    });
    assert(childAccess.ok, "child access should succeed");

    const parentAccess = await requestJson(baseUrl, "/api/parent/access", {
      method: "POST",
      body: {
        username: parentUsername,
        pin: parentPin,
        displayName: "Week Offset Parent",
        childUsername,
        relationship: "parent",
      },
    });
    assert(parentAccess.ok, "parent access should succeed");

    const identityRows = await pool.query(
      `
        select
          sp.id as student_id,
          gp.id as guardian_id
        from public.student_profiles sp
        join public.guardian_student_links gsl
          on gsl.student_id = sp.id
        join public.guardian_profiles gp
          on gp.id = gsl.guardian_id
        where sp.username = $1
          and gp.username = $2
        limit 1
      `,
      [childUsername, parentUsername],
    );
    assert(identityRows.rowCount === 1, "smoke identities should be persisted");

    const studentId = String(identityRows.rows[0].student_id);
    const guardianId = String(identityRows.rows[0].guardian_id);

    const skillRows = await pool.query(
      `
        select id
        from public.skills
        where launch_band_code = 'K1'
          and active = true
        order by code asc
        limit 1
      `,
    );
    assert(skillRows.rowCount === 1, "smoke should find a K1 skill");
    const skillId = String(skillRows.rows[0].id);

    const sessionRows = await pool.query(
      `
        insert into public.challenge_sessions (
          student_id,
          session_mode,
          total_questions,
          started_at,
          ended_at,
          effectiveness_score
        )
        values ($1, 'guided-quest', 1, now(), now() + interval '4 minutes', 100)
        returning id
      `,
      [studentId],
    );
    const sessionId = String(sessionRows.rows[0].id);

    await pool.query(
      `
        insert into public.session_results (
          session_id,
          skill_id,
          correct,
          first_try,
          time_spent_ms,
          effective_time_ms,
          remediation_triggered,
          points_earned
        )
        values ($1, $2, true, true, 12000, 12000, false, 10)
      `,
      [sessionId, skillId],
    );

    const currentWeek = await requestJson(
      baseUrl,
      `/api/parent/report?studentId=${studentId}&weekOffset=0`,
    );
    const previousWeek = await requestJson(
      baseUrl,
      `/api/parent/report?studentId=${studentId}&weekOffset=1`,
    );

    assert(currentWeek.ok, "current-week parent report should succeed");
    assert(previousWeek.ok, "previous-week parent report should succeed");

    assert(
      currentWeek.payload.report?.studentId === studentId &&
        currentWeek.payload.report?.weekLabel === "This week" &&
        Array.isArray(currentWeek.payload.report?.sessionLog) &&
        currentWeek.payload.report.sessionLog.length >= 1,
      "current-week report should include the seeded current-week session",
    );
    assert(
      previousWeek.payload.report?.studentId === studentId &&
        previousWeek.payload.report?.weekLabel === "Last week" &&
        previousWeek.payload.report?.weekStart !==
          currentWeek.payload.report?.weekStart &&
        Array.isArray(previousWeek.payload.report?.sessionLog) &&
        previousWeek.payload.report.sessionLog.length === 0 &&
        Number(previousWeek.payload.report?.stats?.sessions ?? -1) === 0,
      "previous-week report should shift the window and exclude the seeded current-week session",
    );

    console.log(
      JSON.stringify(
        {
          baseUrl,
          guardianId,
          studentId,
          sessionId,
          currentWeekLabel: currentWeek.payload.report?.weekLabel,
          currentWeekStart: currentWeek.payload.report?.weekStart,
          currentWeekSessions: currentWeek.payload.report?.stats?.sessions ?? 0,
          previousWeekLabel: previousWeek.payload.report?.weekLabel,
          previousWeekStart: previousWeek.payload.report?.weekStart,
          previousWeekSessions:
            previousWeek.payload.report?.stats?.sessions ?? 0,
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
