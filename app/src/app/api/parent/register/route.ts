import { NextRequest, NextResponse } from "next/server";
import {
  PARENT_SESSION_COOKIE_NAME,
  ParentAccessThrottleError,
  createParentAccessSession,
  getRequestIpAddress,
  getRequestUserAgent,
} from "@/lib/parent-access";
import { accessParent } from "@/lib/parent-service";

export async function POST(request: NextRequest) {
  const ipAddress = getRequestIpAddress(request);
  const userAgent = getRequestUserAgent(request);

  try {
    const body = await request.json() as {
      email?: string;
      password?: string;
      displayName?: string;
      childUsername?: string;
      notifyWeekly?: boolean;
      notifyMilestones?: boolean;
    };

    const email = (body.email ?? "").trim();
    const password = body.password ?? "";
    const displayName = (body.displayName ?? "").trim();

    const result = await accessParent(
      {
        mode: "register",
        email,
        password,
        displayName,
        childUsername: body.childUsername,
        notifyWeekly: body.notifyWeekly,
        notifyMilestones: body.notifyMilestones,
      },
      { ipAddress, userAgent },
    );

    const accessSession = await createParentAccessSession({
      guardianId: result.guardian.id,
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json(result, { status: 201 });
    response.cookies.set({
      name: PARENT_SESSION_COOKIE_NAME,
      value: accessSession.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: accessSession.expiresAt,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    const isConflict = message.includes("already exists");
    const status = error instanceof ParentAccessThrottleError ? 429 : isConflict ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
