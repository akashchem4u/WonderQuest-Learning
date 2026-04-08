import { NextRequest, NextResponse } from "next/server";
import { accessParentViaGoogle, accessTeacherViaGoogle } from "@/lib/parent-service";
import {
  createParentAccessSession,
  getRequestIpAddress,
  getRequestUserAgent,
  PARENT_SESSION_COOKIE_NAME,
} from "@/lib/parent-access";
import { createTeacherDbSession, TEACHER_SESSION_COOKIE } from "@/lib/teacher-session";
import { TEACHER_COOKIE_NAME, issueTeacherAccessToken } from "@/lib/teacher-access";
import { track } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      googleId: string;
      email: string;
      displayName: string;
      role: "parent" | "teacher";
    };

    const { googleId, email, displayName, role } = body;
    if (!googleId || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ipAddress = getRequestIpAddress(request);
    const userAgent = getRequestUserAgent(request);

    if (role === "parent") {
      const result = await accessParentViaGoogle(googleId, email, displayName);
      const session = await createParentAccessSession({
        guardianId: result.guardian.id,
        ipAddress,
        userAgent,
      });
      void track(result.guardian.id, "parent_login", { method: "google" });

      const response = NextResponse.json({ ok: true, redirectTo: "/parent" });
      response.cookies.set({
        name: PARENT_SESSION_COOKIE_NAME,
        value: session.token,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: session.expiresAt,
        path: "/",
      });
      return response;
    }

    if (role === "teacher") {
      const result = await accessTeacherViaGoogle(googleId, email, displayName);
      if (!result) {
        return NextResponse.json(
          { error: "No teacher account found for this Google address. Contact your school admin." },
          { status: 404 }
        );
      }
      const session = await createTeacherDbSession(result.teacher.id, ipAddress, userAgent);
      void track(result.teacher.id, "teacher_login", { method: "google" });

      const response = NextResponse.json({ ok: true, redirectTo: "/teacher" });
      // Shared-access middleware cookie (soft gate — needed for middleware)
      response.cookies.set({
        name: TEACHER_COOKIE_NAME,
        value: issueTeacherAccessToken(),
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      response.cookies.set({
        name: TEACHER_SESSION_COOKIE,
        value: session.token,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: session.expiresAt,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 });
  }
}
