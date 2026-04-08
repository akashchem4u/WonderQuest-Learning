import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  TEACHER_COOKIE_NAME,
  TeacherAccessThrottleError,
  assertTeacherAccessAllowed,
  issueTeacherAccessToken,
  recordTeacherAccessAttempt,
} from "@/lib/teacher-access";
import { getRequestIpAddress, getRequestUserAgent } from "@/lib/child-access";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { accessTeacherWithCredentials } from "@/lib/teacher-service";
import { TEACHER_SESSION_COOKIE } from "@/lib/teacher-session";

const SESSION_TTL_HOURS = 8;
const ACCESS_TYPE_TEACHER = "teacher";

function hashToken(token: string) {
  return createHash("sha256").update(`wonderquest:teacher:${token}`).digest("hex");
}

async function createTeacherAccessSession(
  teacherId: string,
  ipAddress: string | null,
  userAgent: string | null,
) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO public.access_sessions (access_type, student_id, token_hash, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [ACCESS_TYPE_TEACHER, teacherId, hashToken(token), ipAddress, userAgent, expiresAt],
  );
  return { token, expiresAt };
}

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIpAddress(request);
  const userAgent = getRequestUserAgent(request);

  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = (body.username ?? "").trim().toLowerCase();
    const password = (body.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    await assertTeacherAccessAllowed(ipAddress);

    const result = await accessTeacherWithCredentials({ username, password });

    if (!result.ok) {
      await recordTeacherAccessAttempt({ ipAddress, userAgent, succeeded: false });
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await recordTeacherAccessAttempt({ ipAddress, userAgent, succeeded: true });

    const { token, expiresAt } = await createTeacherAccessSession(
      result.teacherId,
      ipAddress,
      userAgent,
    );

    const response = NextResponse.json({ ok: true, isNew: result.isNew });

    // Shared-access middleware cookie (soft gate — still needed for middleware)
    response.cookies.set({
      name: TEACHER_COOKIE_NAME,
      value: issueTeacherAccessToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    // Secure per-teacher session cookie — replaces the old httpOnly:false UUID cookie
    response.cookies.set({
      name: TEACHER_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    const status = error instanceof TeacherAccessThrottleError
      ? 429
      : isDatabaseConnectionError(error)
        ? 503
        : 400;
    const message = isDatabaseConnectionError(error)
      ? "WonderQuest could not reach the learning database. Try again shortly."
      : error instanceof Error
        ? error.message
        : "Teacher access failed.";
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
