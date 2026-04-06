import { NextRequest, NextResponse } from "next/server";
import { resolveTeacherIntervention } from "@/lib/prototype-service";
import { hasTeacherAccess } from "@/lib/teacher-access";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await hasTeacherAccess())) {
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const teacherId = typeof body.teacherId === "string" ? body.teacherId.trim() : "";

    if (!teacherId) {
      return NextResponse.json(
        { error: "teacherId is required." },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    const payload = await resolveTeacherIntervention({
      interventionId: id,
      teacherId,
      resolutionNote: body.resolutionNote,
      strategyTag: body.strategyTag,
      effectivenessRating: body.effectivenessRating,
    });

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Intervention could not be resolved.";
    const status = message === "Intervention was not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
