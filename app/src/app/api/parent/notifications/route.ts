import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import {
  getParentNotifications,
  markParentNotificationRead,
} from "@/lib/prototype-service";

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
    const childId =
      request.nextUrl.searchParams.get("childId")?.trim() ||
      request.nextUrl.searchParams.get("studentId")?.trim() ||
      null;

    const result = await getParentNotifications(guardianId, {
      includeRead,
      limit,
    });

    if (!childId) {
      return NextResponse.json(result);
    }

    const notifications = result.notifications.filter(
      (notification) => notification.studentId === childId,
    );

    return NextResponse.json({
      ...result,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      notifications,
    });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Notifications lookup failed." },
      { status },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json().catch(() => ({}));
    const rawIds = Array.isArray(body.ids) ? (body.ids as unknown[]) : [];
    const ids: string[] = [];
    for (const value of rawIds) {
      const normalized = String(value).trim();
      if (normalized && !ids.includes(normalized)) {
        ids.push(normalized);
      }
    }
    const read = typeof body.read === "boolean" ? body.read : true;

    if (!ids.length) {
      return NextResponse.json(
        { error: "ids is required." },
        { status: 400 },
      );
    }

    const updates = await Promise.all(
      ids.map((notificationId) =>
        markParentNotificationRead(guardianId, notificationId, read),
      ),
    );

    return NextResponse.json({
      updatedCount: updates.length,
      notifications: updates,
    });
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
