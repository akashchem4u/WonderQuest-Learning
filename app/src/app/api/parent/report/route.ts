import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { getChildWeeklyReport } from "@/lib/parent-report-service";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    // Accept both ?childId= and ?studentId= (legacy alias used by some pages)
    const studentId =
      request.nextUrl.searchParams.get("childId")?.trim() ||
      request.nextUrl.searchParams.get("studentId")?.trim() ||
      null;

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId." }, { status: 400 });
    }

    // weekOffset: positive = further back in time (0 = current week, 1 = last week, etc.)
    const rawOffset = parseInt(request.nextUrl.searchParams.get("weekOffset") ?? "0", 10);
    // Clamp to a safe range: 0 (current week) to 52 (one year back)
    const weekOffset = Math.min(52, Math.max(0, isNaN(rawOffset) ? 0 : rawOffset));

    const report = await getChildWeeklyReport(guardianId, studentId, weekOffset);

    if (!report) {
      return NextResponse.json({ error: "Child not found or not linked to this account." }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Parent report lookup failed." },
      { status },
    );
  }
}
