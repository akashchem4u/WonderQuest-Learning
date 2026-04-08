import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { TEACHER_SESSION_COOKIE } from "@/lib/teacher-session";
import { TEACHER_COOKIE_NAME } from "@/lib/teacher-access";

/** Build an absolute redirect URL using Host header so 0.0.0.0 dev binds work. */
function buildRedirectUrl(request: NextRequest, path: string): string {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (request.url.startsWith("https") ? "https" : "http");
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost"
  ).replace(/^0\.0\.0\.0/, "localhost");
  return `${proto}://${host}${path}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(`wonderquest:teacher:${token}`).digest("hex");
}

/** POST /api/teacher/logout — revokes the DB session and clears cookies. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(TEACHER_SESSION_COOKIE)?.value ?? "";
  if (token) {
    await db
      .query(
        `UPDATE public.access_sessions SET revoked_at = now()
         WHERE access_type = 'teacher' AND token_hash = $1`,
        [hashToken(token)],
      )
      .catch(() => {});
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TEACHER_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(TEACHER_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}

/** GET /api/teacher/logout — clears cookies and redirects to teacher login. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(TEACHER_SESSION_COOKIE)?.value ?? "";
  if (token) {
    await db
      .query(
        `UPDATE public.access_sessions SET revoked_at = now()
         WHERE access_type = 'teacher' AND token_hash = $1`,
        [hashToken(token)],
      )
      .catch(() => {});
  }
  const loginUrl = buildRedirectUrl(request, "/teacher");
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(TEACHER_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(TEACHER_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
