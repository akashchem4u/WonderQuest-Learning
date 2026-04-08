import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { hashAdminPassword, createAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  let body: { token?: unknown; password?: unknown; confirmPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!token) {
    return NextResponse.json({ error: "Invite token is required." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const result = await db.query(
      `SELECT id FROM public.admin_users
       WHERE invite_token = $1
         AND invite_expires_at > now()
         AND invite_accepted_at IS NULL`,
      [token],
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { error: "Invite token is invalid or has expired." },
        { status: 400 },
      );
    }

    const adminId = result.rows[0].id as string;
    const passwordHash = hashAdminPassword(password);

    await db.query(
      `UPDATE public.admin_users
       SET password_hash = $1,
           invite_token = NULL,
           invite_accepted_at = now(),
           is_active = true,
           updated_at = now()
       WHERE id = $2`,
      [passwordHash, adminId],
    );

    const sessionToken = await createAdminSession(adminId);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      path: "/",
      maxAge: 8 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable. Please try again." }, { status: 503 });
    }
    console.error("[api/admin/accept-invite]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
