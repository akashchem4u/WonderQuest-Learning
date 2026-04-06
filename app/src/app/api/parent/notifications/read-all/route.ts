import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { markAllParentNotificationsRead } from "@/lib/prototype-service";

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

async function updateAllNotifications(request: NextRequest) {
  const { guardianId } = await requireParentAccessSession(request);
  const body = await request.json().catch(() => ({}));
  const childId =
    typeof body.childId === "string" && body.childId.trim().length > 0
      ? body.childId.trim()
      : null;
  const result = await markAllParentNotificationsRead(guardianId, {
    childId,
    read: parseReadFlag(body.read, true),
  });
  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  try {
    return await updateAllNotifications(request);
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bulk notification update failed." },
      { status },
    );
  }
}

export async function POST(request: NextRequest) {
  return PATCH(request);
}
