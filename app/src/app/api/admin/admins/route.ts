import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await db.query(
      `SELECT id, email, display_name, role, is_active, last_login_at, invite_accepted_at
       FROM public.admin_users
       ORDER BY created_at ASC`,
    );

    const admins = result.rows.map((row) => ({
      id: row.id as string,
      email: row.email as string,
      displayName: row.display_name as string,
      role: row.role as string,
      isActive: row.is_active as boolean,
      lastLoginAt: (row.last_login_at as string | null) ?? null,
      inviteAcceptedAt: (row.invite_accepted_at as string | null) ?? null,
    }));

    return NextResponse.json({ admins });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/admins]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
