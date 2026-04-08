import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { hashAdminPassword, createAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  let body: {
    email?: unknown;
    displayName?: unknown;
    password?: unknown;
    confirmPassword?: unknown;
    setupSecret?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const setupSecret = typeof body.setupSecret === "string" ? body.setupSecret : "";
  const expectedSecret = process.env.ADMIN_SETUP_SECRET ?? "";

  if (!expectedSecret || setupSecret !== expectedSecret) {
    return NextResponse.json({ error: "Invalid setup secret." }, { status: 403 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!email || !displayName) {
    return NextResponse.json({ error: "Email and display name are required." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    // Only works when table is empty
    const countResult = await db.query(`SELECT COUNT(*) as cnt FROM public.admin_users`);
    if (Number(countResult.rows[0].cnt) > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed. Use the invite flow to add more admins." },
        { status: 409 },
      );
    }

    const passwordHash = hashAdminPassword(password);

    const insertResult = await db.query(
      `INSERT INTO public.admin_users
         (email, display_name, password_hash, role, is_active, invite_accepted_at)
       VALUES ($1, $2, $3, 'super_admin', true, now())
       RETURNING id`,
      [email, displayName, passwordHash],
    );

    const adminId = insertResult.rows[0].id as string;
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
    console.error("[api/admin/setup]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
