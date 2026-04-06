import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { getParentSkills } from "@/lib/prototype-service";

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    // Accept both ?childId= and ?studentId= (legacy alias used by some pages)
    const childId =
      request.nextUrl.searchParams.get("childId")?.trim() ||
      request.nextUrl.searchParams.get("studentId")?.trim() ||
      null;
    const result = await getParentSkills(guardianId, { childId });
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Skill mastery lookup failed." },
      { status },
    );
  }
}
