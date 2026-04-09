import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { db } from "@/lib/db";
import { resolveFramework } from "@/lib/curriculum-frameworks";

// Returns curriculum framework resolution info + active child for the logged-in parent.
// Shape: { stateCode, schoolName, isdName, resolution: FrameworkResolution, activeChildId }
export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const result = await db.query(
      `select state_code, school_name, isd_name, active_child_id, pin_hash from public.guardian_profiles where id = $1 limit 1`,
      [guardianId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Guardian not found." }, { status: 404 });
    }

    const row = result.rows[0] as {
      state_code: string | null;
      school_name: string | null;
      isd_name: string | null;
      active_child_id: string | null;
      pin_hash: string | null;
    };

    const resolution = resolveFramework(row.state_code, row.isd_name);

    return NextResponse.json({
      stateCode: row.state_code,
      schoolName: row.school_name,
      isdName: row.isd_name,
      hasPin: Boolean(row.pin_hash),
      resolution,
      activeChildId: row.active_child_id ?? null,
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load account context." },
      { status },
    );
  }
}

// Persists the active child selection for the logged-in parent.
// Body: { activeChildId: string }
export async function PATCH(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const body = (await request.json()) as { activeChildId?: string };
    const activeChildId = body.activeChildId ?? null;

    // If a childId is provided, verify it belongs to this guardian before saving.
    if (activeChildId) {
      const check = await db.query(
        `select 1 from public.guardian_student_links where guardian_id = $1 and student_id = $2 limit 1`,
        [guardianId, activeChildId],
      );
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Child not linked to this account." }, { status: 403 });
      }
    }

    await db.query(
      `update public.guardian_profiles set active_child_id = $1, updated_at = now() where id = $2`,
      [activeChildId, guardianId],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update active child." },
      { status },
    );
  }
}
