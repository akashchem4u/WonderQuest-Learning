import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

// PATCH /api/admin/admins/:id — toggle is_active (super_admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminSession(request);
  if (!auth.ok) return auth.response;

  // Only super_admins can deactivate / reactivate
  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
  }

  const { id } = await params;

  let body: { isActive?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive (boolean) is required." }, { status: 400 });
  }

  // Cannot deactivate yourself
  if (id === auth.adminId) {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 409 });
  }

  try {
    const result = await db.query(
      `UPDATE public.admin_users
       SET is_active = $1, updated_at = now()
       WHERE id = $2
       RETURNING id, email, is_active`,
      [body.isActive, id],
    );

    if (!result.rowCount) {
      return NextResponse.json({ error: "Admin not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, admin: result.rows[0] });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[api/admin/admins/[id]]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
