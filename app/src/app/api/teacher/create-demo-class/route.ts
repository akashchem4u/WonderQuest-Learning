import { NextRequest, NextResponse } from "next/server";
import { isValidTeacherId } from "@/lib/teacher-identity";
import { createVirtualClassroom, hasVirtualClassroom } from "@/lib/virtual-classroom";

const VALID_BANDS = new Set(["PREK", "K1", "G23", "G45"]);

export async function POST(request: NextRequest) {
  const teacherId = request.cookies.get("wonderquest-teacher-id")?.value ?? "";
  if (!isValidTeacherId(teacherId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { bandCode?: string };
  const bandCode = body.bandCode ?? "G23";

  if (!VALID_BANDS.has(bandCode)) {
    return NextResponse.json({ error: "Invalid band code" }, { status: 400 });
  }

  try {
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
