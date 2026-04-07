import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { db } from "@/lib/db";
import { resolveFramework } from "@/lib/curriculum-frameworks";

// Returns curriculum framework resolution info for the logged-in parent.
// Shape: { stateCode, schoolName, isdName, resolution: FrameworkResolution }
export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const result = await db.query(
      `select state_code, school_name, isd_name from public.guardian_profiles where id = $1 limit 1`,
      [guardianId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Guardian not found." }, { status: 404 });
    }

    const row = result.rows[0] as {
      state_code: string | null;
      school_name: string | null;
      isd_name: string | null;
    };

    const resolution = resolveFramework(row.state_code, row.isd_name);

    return NextResponse.json({
      stateCode: row.state_code,
      schoolName: row.school_name,
      isdName: row.isd_name,
      resolution,
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load account context." },
      { status },
    );
  }
}
