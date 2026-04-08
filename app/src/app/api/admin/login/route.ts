import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import {
  verifyAdminPassword,
  createAdminSession,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await db.query(
      `SELECT id, password_hash, role, display_name, is_active
       FROM public.admin_users
       WHERE email = $1`,
      [email],
    );

    if (!result.rowCount) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const row = result.rows[0];

    if (!row.is_active) {
      return NextResponse.json({ error: "Account is not active. Please accept your invite first." }, { status: 401 });
    }

    const valid = verifyAdminPassword(password, row.password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createAdminSession(row.id as string);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
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
    console.error("[api/admin/login]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
