import { NextRequest, NextResponse } from "next/server";
import {
  ChildAccessSessionError,
  requireChildAccessSession,
} from "@/lib/child-access";
import { createPlaySession } from "@/lib/prototype-service";
import { track } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessSession = await requireChildAccessSession(request);
    const result = await createPlaySession({
      studentId: accessSession.studentId,
      sessionMode: body.sessionMode,
    });
    void track(accessSession.studentId, "session_started", {
      band: result.student.launchBandCode,
      session_mode: body.sessionMode ?? "guided-quest",
      level: result.progression.currentLevel,
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ChildAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start the play session." },
      { status },
    );
  }
}
