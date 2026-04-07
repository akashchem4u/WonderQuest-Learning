import { NextRequest, NextResponse } from "next/server";
import {
  getTeacherInterventions,
  createIntervention,
  resolveIntervention,
} from "@/lib/teacher-service";
import { requireTeacherSession } from "@/lib/teacher-session";

export async function GET(request: NextRequest) {
  const auth = await requireTeacherSession(
    request,
    request.nextUrl.searchParams.get("teacherId"),
  );
  const status = request.nextUrl.searchParams.get("status") ?? "active";

  if (!auth.ok) {
    return auth.response;
  }

  const { teacherId } = auth;

  try {
    const interventions = await getTeacherInterventions(teacherId, status);
    return NextResponse.json({ interventions });
  } catch (error) {
    console.error("[api/teacher/interventions GET] error:", error);
    return NextResponse.json({ error: "Failed to fetch interventions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      teacherId?: string;
      studentId?: string;
      skillCode?: string;
      reason?: string;
      interventionType?: string;
      teacherNote?: string;
    };
    const auth = await requireTeacherSession(request, body.teacherId);

    if (!auth.ok) {
      return auth.response;
    }

    const { teacherId } = auth;

    if (!body.studentId || !body.reason) {
      return NextResponse.json(
        { error: "studentId and reason are required" },
        { status: 400 },
      );
    }

    const result = await createIntervention({
      teacherId,
      studentId: body.studentId,
      skillCode: body.skillCode,
      reason: body.reason,
      interventionType: body.interventionType,
      teacherNote: body.teacherNote,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[api/teacher/interventions POST] error:", error);
    return NextResponse.json({ error: "Failed to create intervention" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as {
      teacherId?: string;
      interventionId?: string;
      resolutionNote?: string;
    };
    const auth = await requireTeacherSession(request, body.teacherId);

    if (!auth.ok) {
      return auth.response;
    }

    const { teacherId } = auth;

    if (!body.interventionId) {
      return NextResponse.json(
        { error: "interventionId is required" },
        { status: 400 },
      );
    }

    await resolveIntervention(teacherId, body.interventionId, body.resolutionNote);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/teacher/interventions PATCH] error:", error);
    return NextResponse.json({ error: "Failed to resolve intervention" }, { status: 500 });
  }
}
