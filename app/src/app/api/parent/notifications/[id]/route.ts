import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { markParentNotificationRead } from "@/lib/prototype-service";

function parseReadFlag(value: unknown, fallback = true) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "false" || normalized === "0") {
      return false;
    }
    if (normalized === "true" || normalized === "1") {
      return true;
    }
  }

  return fallback;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json().catch(() => ({}));
    const { id } = await context.params;
    const result = await markParentNotificationRead(
      guardianId,
      id,
      parseReadFlag(body.read, true),
    );
    return NextResponse.json(result);
  } catch (error) {
    const status =
      error instanceof ParentAccessSessionError
        ? 401
        : error instanceof Error && error.message === "Notification was not found."
          ? 404
          : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Notification update failed." },
      { status },
    );
  }
}
