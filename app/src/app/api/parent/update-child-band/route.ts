import { NextRequest, NextResponse } from "next/server";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";
import { db } from "@/lib/db";

const VALID_BANDS = ["PREK", "K1", "G23", "G45"] as const;
type BandCode = (typeof VALID_BANDS)[number];

function isValidBand(code: unknown): code is BandCode {
  return typeof code === "string" && (VALID_BANDS as readonly string[]).includes(code);
}

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const body = await request.json();
    const { childId, launchBandCode } = body as { childId?: string; launchBandCode?: string };

    if (!childId || typeof childId !== "string") {
      return NextResponse.json({ error: "childId is required." }, { status: 400 });
    }

    if (!isValidBand(launchBandCode)) {
      return NextResponse.json(
        { error: `Invalid band. Must be one of: ${VALID_BANDS.join(", ")}.` },
        { status: 400 },
      );
    }

    // Verify the guardian owns this student
    const link = await db.query(
      `select 1
       from public.guardian_student_links
       where guardian_id = $1 and student_id = $2
       limit 1`,
      [guardianId, childId],
    );

    if (!link.rowCount) {
      return NextResponse.json({ error: "Child not linked to this account." }, { status: 403 });
    }

    await db.query(
      `update public.student_profiles set launch_band_code = $1 where id = $2`,
      [launchBandCode, childId],
    );

    return NextResponse.json({ success: true, launchBandCode });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Band update failed." },
      { status },
    );
  }
}
