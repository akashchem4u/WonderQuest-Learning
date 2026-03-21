import { NextResponse } from "next/server";
import { accessChild } from "@/lib/prototype-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await accessChild(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Child access failed." },
      { status: 400 },
    );
  }
}
