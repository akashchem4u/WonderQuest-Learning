import { NextRequest, NextResponse } from "next/server";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";
import { db } from "@/lib/db";
import { hashPin, verifyPin } from "@/lib/pin";

export async function PATCH(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json() as {
      displayName?: string;
      relationshipLabel?: string;
      stateCode?: string | null;
      schoolName?: string | null;
      isdName?: string | null;
      notificationSettings?: {
        weeklyReports?: boolean;
        milestoneNotifications?: boolean;
        teacherMessages?: boolean;
      };
      currentPin?: string;
      newPin?: string;
    };

    // ── Input validation ────────────────────────────────────────────────────
    if (body.displayName !== undefined && body.displayName !== null && body.displayName.length > 100) {
      return NextResponse.json({ error: "Display name must be 100 characters or fewer." }, { status: 400 });
    }
    if (body.stateCode !== undefined && body.stateCode !== null && body.stateCode.length > 2) {
      return NextResponse.json({ error: "State code must be 2 characters or fewer." }, { status: 400 });
    }
    if (body.schoolName !== undefined && body.schoolName !== null && body.schoolName.length > 200) {
      return NextResponse.json({ error: "School name must be 200 characters or fewer." }, { status: 400 });
    }
    if (body.isdName !== undefined && body.isdName !== null && body.isdName.length > 200) {
      return NextResponse.json({ error: "ISD name must be 200 characters or fewer." }, { status: 400 });
    }

    // ── Profile update ──────────────────────────────────────────────────────
    if (body.displayName !== undefined || body.relationshipLabel !== undefined) {
      const sets: string[] = ["updated_at = now()"];
      const vals: unknown[] = [guardianId];
      if (body.displayName !== undefined) {
        vals.push(body.displayName);
        sets.push(`display_name = $${vals.length}`);
      }
      if (body.relationshipLabel !== undefined) {
        vals.push(body.relationshipLabel);
        sets.push(`relationship_label = $${vals.length}`);
      }
      await db.query(
        `update public.guardian_profiles set ${sets.join(", ")} where id = $1`,
        vals,
      );
    }

    // ── School / curriculum update ──────────────────────────────────────────
    if (body.stateCode !== undefined || body.schoolName !== undefined || body.isdName !== undefined) {
      const sets: string[] = ["updated_at = now()"];
      const vals: unknown[] = [guardianId];
      if (body.stateCode !== undefined) {
        vals.push(body.stateCode ?? null);
        sets.push(`state_code = $${vals.length}`);
      }
      if (body.schoolName !== undefined) {
        vals.push(body.schoolName ?? null);
        sets.push(`school_name = $${vals.length}`);
      }
      if (body.isdName !== undefined) {
        vals.push(body.isdName ?? null);
        sets.push(`isd_name = $${vals.length}`);
      }
      await db.query(
        `update public.guardian_profiles set ${sets.join(", ")} where id = $1`,
        vals,
      );
    }

    // ── Notification settings update ────────────────────────────────────────
    if (body.notificationSettings !== undefined) {
      await db.query(
        `update public.guardian_profiles set notification_settings = $2, updated_at = now() where id = $1`,
        [guardianId, JSON.stringify(body.notificationSettings)],
      );
    }

    // ── PIN change ──────────────────────────────────────────────────────────
    if (body.newPin !== undefined) {
      if (!/^\d{4}$/.test(body.newPin)) {
        return NextResponse.json({ error: "New PIN must be exactly 4 digits." }, { status: 400 });
      }

      // Fetch current guardian username + pin_hash for verification
      const row = await db.query(
        `select username, pin_hash from public.guardian_profiles where id = $1 limit 1`,
        [guardianId],
      );
      if (!row.rowCount) {
        return NextResponse.json({ error: "Guardian not found." }, { status: 404 });
      }

      const username = row.rows[0].username as string;
      const storedHash = row.rows[0].pin_hash as string | null;

      if (storedHash) {
        // Existing PIN — require current PIN verification
        if (!body.currentPin) {
          return NextResponse.json({ error: "Current PIN is required." }, { status: 400 });
        }
        if (!verifyPin(body.currentPin, username, storedHash)) {
          return NextResponse.json({ error: "Current PIN is incorrect." }, { status: 400 });
        }
      }
      // No PIN set (SSO account) — allow setting without current PIN

      const newHash = hashPin(body.newPin, username);
      await db.query(
        `update public.guardian_profiles set pin_hash = $2, updated_at = now() where id = $1`,
        [guardianId, newHash],
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status },
    );
  }
}
