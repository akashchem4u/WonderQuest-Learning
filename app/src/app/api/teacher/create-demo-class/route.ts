import { NextRequest, NextResponse } from "next/server";
import { createVirtualClassroom, hasVirtualClassroom } from "@/lib/virtual-classroom";
import { requireTeacherSession } from "@/lib/teacher-session";

const VALID_BANDS = new Set(["PREK", "K1", "G23", "G45", "G6"]);

export async function POST(request: NextRequest) {
  const auth = await requireTeacherSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => ({})) as { bandCode?: string };
  const bandCode = body.bandCode ?? "G23";

  if (!VALID_BANDS.has(bandCode)) {
    return NextResponse.json({ error: "Invalid band code" }, { status: 400 });
  }

  try {
    const { teacherId } = auth;
    const already = await hasVirtualClassroom(teacherId);
    if (already) {
      return NextResponse.json({ alreadyExists: true });
    }

    const result = await createVirtualClassroom(teacherId, bandCode, 15);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/teacher/create-demo-class]", error);
    return NextResponse.json({ error: "Failed to create demo classroom" }, { status: 500 });
  }
}
