import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await db.query(
      `SELECT id, email, display_name, role FROM public.admin_users WHERE id = $1`,
      [auth.adminId],
    );

    if (!result.rowCount) {
      return NextResponse.json({ error: "Admin not found." }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      id: row.id as string,
      email: row.email as string,
      displayName: row.display_name as string,
      role: row.role as string,
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/me]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
