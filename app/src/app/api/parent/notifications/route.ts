import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { getParentNotifications } from "@/lib/prototype-service";

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(max, Math.floor(parsed));
}

function parseBoolean(value: string | null) {
  return value === "1" || value === "true";
}

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const limit = parsePositiveInt(request.nextUrl.searchParams.get("limit"), 25, 100);
    const includeRead = parseBoolean(
      request.nextUrl.searchParams.get("includeRead"),
    );

    const result = await getParentNotifications(guardianId, {
      includeRead,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Notifications lookup failed." },
      { status },
    );
  }
}
