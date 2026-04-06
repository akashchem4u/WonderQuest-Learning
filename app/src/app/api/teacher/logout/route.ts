import { NextRequest, NextResponse } from "next/server";

/** Build an absolute redirect URL using Host header so 0.0.0.0 dev binds work. */
function buildRedirectUrl(request: NextRequest, path: string): string {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (request.url.startsWith("https") ? "https" : "http");
  // Use Host header; replace wildcard bind address with localhost so browsers can connect
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost"
  ).replace(/^0\.0\.0\.0/, "localhost");
  return `${proto}://${host}${path}`;
}

/** GET /api/teacher/logout — clears the teacher identity cookie and redirects to teacher login. */
export async function GET(request: NextRequest) {
  const loginUrl = buildRedirectUrl(request, "/teacher");
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set({
    name: "wonderquest-teacher-id",
    value: "",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
