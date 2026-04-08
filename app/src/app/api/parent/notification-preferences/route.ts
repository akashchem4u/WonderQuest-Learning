import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";

type NotificationPreferences = {
  email_weekly_digest: boolean;
  email_milestone_alerts: boolean;
  email_daily_summary: boolean;
  push_session_complete: boolean;
  push_streak_reminder: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
};

const DEFAULTS: NotificationPreferences = {
  email_weekly_digest: true,
  email_milestone_alerts: true,
  email_daily_summary: false,
  push_session_complete: false,
  push_streak_reminder: true,
  quiet_hours_enabled: false,
  quiet_hours_start: "21:00",
  quiet_hours_end: "07:00",
};

const ALLOWED_FIELDS = new Set<string>(Object.keys(DEFAULTS));

export async function GET(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const result = await db.query(
      `SELECT email_weekly_digest, email_milestone_alerts, email_daily_summary,
              push_session_complete, push_streak_reminder,
              quiet_hours_enabled,
              to_char(quiet_hours_start, 'HH24:MI') AS quiet_hours_start,
              to_char(quiet_hours_end,   'HH24:MI') AS quiet_hours_end
       FROM public.notification_preferences
       WHERE guardian_id = $1
       LIMIT 1`,
      [guardianId],
    );

    if (!result.rowCount) {
      return NextResponse.json({ preferences: DEFAULTS });
    }

    return NextResponse.json({ preferences: result.rows[0] as NotificationPreferences });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load preferences." },
      { status },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);

    const body = await request.json().catch(() => ({})) as Record<string, unknown>;

    // Filter to only allowed fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
    }

    // Ensure a row exists with defaults, then update only the changed fields
    await db.query(
      `INSERT INTO public.notification_preferences (
         guardian_id,
         email_weekly_digest, email_milestone_alerts, email_daily_summary,
         push_session_complete, push_streak_reminder,
         quiet_hours_enabled, quiet_hours_start, quiet_hours_end
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (guardian_id) DO NOTHING`,
      [
        guardianId,
        DEFAULTS.email_weekly_digest,
        DEFAULTS.email_milestone_alerts,
        DEFAULTS.email_daily_summary,
        DEFAULTS.push_session_complete,
        DEFAULTS.push_streak_reminder,
        DEFAULTS.quiet_hours_enabled,
        DEFAULTS.quiet_hours_start,
        DEFAULTS.quiet_hours_end,
      ],
    );

    // Build dynamic SET clause for only the provided fields
    const setClauses: string[] = [];
    const params: unknown[] = [guardianId];
    for (const [key, value] of Object.entries(updates)) {
      params.push(value);
      setClauses.push(`${key} = $${params.length}`);
    }
    setClauses.push("updated_at = now()");

    await db.query(
      `UPDATE public.notification_preferences
       SET ${setClauses.join(", ")}
       WHERE guardian_id = $1`,
      params,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save preferences." },
      { status },
    );
  }
}
