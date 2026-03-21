import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/prototype-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await answerQuestion(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit the answer." },
      { status: 400 },
    );
  }
}
