import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { getParentReport } from "@/lib/prototype-service";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    // Accept both ?childId= and ?studentId= (legacy alias used by some pages)
    const childId =
      request.nextUrl.searchParams.get("childId")?.trim() ||
      request.nextUrl.searchParams.get("studentId")?.trim() ||
      null;
    const result = await getParentReport(guardianId, { childId });
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Parent report lookup failed." },
      { status },
    );
  }
}
