import { NextRequest, NextResponse } from "next/server";
import { resolveTeacherIntervention } from "@/lib/prototype-service";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const auth = await requireTeacherSession(request, body.teacherId);

    if (!auth.ok) {
      return auth.response;
    }

    const { teacherId } = auth;

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
