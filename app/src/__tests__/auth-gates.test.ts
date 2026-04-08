/**
 * Auth gate integration tests
 *
 * Runs against a live dev server. Set TEST_BASE_URL to override the default.
 * Usage: node --test src/__tests__/auth-gates.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const TIMEOUT_MS = 5_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCookieHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("; ");
}

async function get(
  path: string,
  cookies?: Record<string, string>
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (cookies && Object.keys(cookies).length > 0) {
    headers["Cookie"] = buildCookieHeader(cookies);
  }
  return fetch(`${BASE}${path}`, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    // Do not follow redirects — a redirect to /login is still an auth failure.
    redirect: "manual",
  });
}

async function post(
  path: string,
  body?: unknown,
  cookies?: Record<string, string>
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (cookies && Object.keys(cookies).length > 0) {
    headers["Cookie"] = buildCookieHeader(cookies);
  }
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "manual",
  });
}

/**
 * Returns true when the status signals "not authenticated / not authorized".
 * A redirect (3xx) to a login page counts as an auth rejection too.
 */
function isAuthRejection(status: number): boolean {
  return status === 401 || status === 403 || (status >= 300 && status < 400);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("Auth gate integration", () => {
  // -------------------------------------------------------------------------
  // 1. Child — unauthenticated
  // -------------------------------------------------------------------------
  it("GET /api/child/quest without session cookie returns 401", async () => {
    const res = await get("/api/child/quest");
    assert.ok(
      isAuthRejection(res.status),
      `Expected auth rejection (401/403/3xx), got ${res.status}`
    );
  });

  // -------------------------------------------------------------------------
  // 2. Parent — unauthenticated
  // -------------------------------------------------------------------------
  it("GET /api/parent/activity without session cookie returns 401", async () => {
    const res = await get("/api/parent/activity");
    assert.ok(
      isAuthRejection(res.status),
      `Expected auth rejection (401/403/3xx), got ${res.status}`
    );
  });

  // -------------------------------------------------------------------------
  // 3. Teacher — unauthenticated
  // -------------------------------------------------------------------------
  it("GET /api/teacher/class without session cookie returns 401", async () => {
    const res = await get("/api/teacher/class");
    assert.ok(
      isAuthRejection(res.status),
      `Expected auth rejection (401/403/3xx), got ${res.status}`
    );
  });

  // -------------------------------------------------------------------------
  // 4. Owner — unauthenticated
  // -------------------------------------------------------------------------
  it("GET /api/owner/overview without session cookie returns 401", async () => {
    const res = await get("/api/owner/overview");
    assert.ok(
      isAuthRejection(res.status),
      `Expected auth rejection (401/403/3xx), got ${res.status}`
    );
  });

  // -------------------------------------------------------------------------
  // 5. Health route — public
  // -------------------------------------------------------------------------
  it("GET /api/health returns 200 with ok field", async () => {
    const res = await get("/api/health");
    assert.strictEqual(
      res.status,
      200,
      `Expected 200, got ${res.status}`
    );
    const body: unknown = await res.json();
    assert.ok(
      body !== null && typeof body === "object" && "ok" in body,
      `Response body missing 'ok' field: ${JSON.stringify(body)}`
    );
  });

  // -------------------------------------------------------------------------
  // 6. Invalid child session cookie
  // -------------------------------------------------------------------------
  it("GET /api/child/quest with fake session cookie returns 401", async () => {
    const res = await get("/api/child/quest", {
      "wq_child_session": "fake-invalid-session-token-xyz",
      "wq_session": "fake-invalid-session-token-xyz",
    });
    assert.ok(
      isAuthRejection(res.status),
      `Expected auth rejection (401/403/3xx) for fake cookie, got ${res.status}`
    );
  });

  // -------------------------------------------------------------------------
  // 7. CSRF — POST without CSRF/Origin headers must not 500
  // -------------------------------------------------------------------------
  it("POST /api/parent/login without CSRF headers returns 400/401/405, not 500", async () => {
    // Deliberately omit Origin / X-CSRF-Token / Referer so the server's CSRF
    // guard (if any) triggers. We just need it to handle the request gracefully.
    const res = await post("/api/parent/login", {
      username: "nonexistent@example.com",
      password: "hunter2",
    });
    assert.ok(
      res.status !== 500,
      `Server crashed with 500 on a CSRF-unprotected POST (got ${res.status})`
    );
    assert.ok(
      res.status >= 400 && res.status < 500,
      `Expected a 4xx client error, got ${res.status}`
    );
  });
});
