import { NextResponse } from "next/server";
import { getOwnerOverview } from "@/lib/analytics-service";

export async function GET() {
  try {
    const overview = await getOwnerOverview();
    return NextResponse.json(overview);
  } catch (error) {
    console.error("[api/owner/overview] error:", error);
    return NextResponse.json({ error: "Failed to fetch owner overview" }, { status: 500 });
  }
}
