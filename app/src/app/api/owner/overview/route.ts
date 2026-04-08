import { NextRequest, NextResponse } from "next/server";
import { getOwnerOverview } from "@/lib/analytics-service";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const auth = requireOwnerSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const overview = await getOwnerOverview();
    return NextResponse.json(overview);
  } catch (error) {
    console.error("[api/owner/overview] error:", error);
    return NextResponse.json({ error: "Failed to fetch owner overview" }, { status: 500 });
  }
}
