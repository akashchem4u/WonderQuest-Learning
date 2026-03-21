import { NextResponse } from "next/server";
import {
  OWNER_COOKIE_NAME,
  isOwnerAccessConfigured,
  isValidOwnerCode,
  issueOwnerAccessToken,
} from "@/lib/owner-access";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim() ?? "";

    if (!isOwnerAccessConfigured()) {
      return NextResponse.json(
        { error: "Owner access code is not configured yet." },
        { status: 400 },
      );
    }

    if (!isValidOwnerCode(code)) {
      return NextResponse.json(
        { error: "Owner access code is not valid." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: OWNER_COOKIE_NAME,
      value: issueOwnerAccessToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Owner access failed.",
      },
      { status: 400 },
    );
  }
}
