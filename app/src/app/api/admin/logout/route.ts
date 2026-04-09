import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function hashToken(token: string) {
  return createHash("sha256").update(`wonderquest:admin:${token}`).digest("hex");
}

function buildRedirectUrl(request: NextRequest, path: string): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configuredOrigin) {
    return `${configuredOrigin}${path}`;
  }

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

function clearAndRedirect(token: string | undefined, redirectUrl: string) {
  if (token) {
    db.query(
      `UPDATE public.access_sessions SET revoked_at = now()
       WHERE access_type = 'admin' AND token_hash = $1`,
      [hashToken(token)],
    ).catch(() => {});
  }
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax" });
  return response;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return clearAndRedirect(token, buildRedirectUrl(request, "/"));
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return clearAndRedirect(token, buildRedirectUrl(request, "/"));
}
