import { NextRequest, NextResponse } from "next/server";
import { ParentAccessSessionError, requireParentAccessSession } from "@/lib/parent-access";
import { getChildWeeklyReport } from "@/lib/parent-report-service";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const studentId = request.nextUrl.searchParams.get("studentId");
    const weekOffset = Number(request.nextUrl.searchParams.get("weekOffset") ?? "0");

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const report = await getChildWeeklyReport(guardianId, studentId, weekOffset);
    if (!report) {
      return NextResponse.json({ error: "Student not found or not linked to your account" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch report" },
      { status },
    );
  }
}
