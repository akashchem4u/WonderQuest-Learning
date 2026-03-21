import { NextRequest, NextResponse } from "next/server";
import {
  ChildAccessSessionError,
  requireChildAccessSession,
} from "@/lib/child-access";
import { answerQuestion } from "@/lib/prototype-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessSession = await requireChildAccessSession(request);
    const result = await answerQuestion({
      sessionId: body.sessionId,
      studentId: accessSession.studentId,
      questionKey: body.questionKey,
      answer: body.answer,
      attempt: body.attempt,
      timeSpentMs: body.timeSpentMs,
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ChildAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit the answer." },
      { status },
    );
  }
}
