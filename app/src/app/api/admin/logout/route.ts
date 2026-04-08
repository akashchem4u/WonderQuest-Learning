import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function hashToken(token: string) {
  return createHash("sha256").update(`wonderquest:admin:${token}`).digest("hex");
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

const loginUrl = () => process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "http://localhost:3000";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return clearAndRedirect(token, loginUrl());
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return clearAndRedirect(token, loginUrl());
}
