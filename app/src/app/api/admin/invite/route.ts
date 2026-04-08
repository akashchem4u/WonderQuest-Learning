import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession, generateInviteToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  let body: { email?: unknown; displayName?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  const role = body.role === "super_admin" || body.role === "admin" ? body.role : "admin";

  if (!email || !displayName) {
    return NextResponse.json({ error: "Email and display name are required." }, { status: 400 });
  }

  try {
    // Check for existing email
    const existing = await db.query(
      `SELECT id FROM public.admin_users WHERE email = $1`,
      [email],
    );
    if (existing.rowCount) {
      return NextResponse.json({ error: "An admin with that email already exists." }, { status: 409 });
    }

    const token = generateInviteToken();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await db.query(
      `INSERT INTO public.admin_users
         (email, display_name, role, is_active, invited_by, invite_token, invite_expires_at)
       VALUES ($1, $2, $3, false, $4, $5, $6)`,
      [email, displayName, role, auth.adminId, token, expiresAt],
    );

    const inviteUrl = `/owner/accept-invite?token=${token}`;
    return NextResponse.json({ inviteUrl, token });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable. Please try again." }, { status: 503 });
    }
    console.error("[api/admin/invite]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
