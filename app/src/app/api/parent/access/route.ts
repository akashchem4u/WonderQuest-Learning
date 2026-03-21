import { NextResponse } from "next/server";
import { accessParent } from "@/lib/prototype-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await accessParent(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Parent access failed." },
      { status: 400 },
    );
  }
}
