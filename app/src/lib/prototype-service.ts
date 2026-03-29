// prototype-service.ts
// Platform lane ownership.
//
// This file retains `accessChild` and re-exports all other service functions
// from their domain modules so existing API routes and pages need no changes.
//
// Domain modules (Phase 1 split):
//   session-service.ts   — createPlaySession, answerQuestion
//   parent-service.ts    — accessParent
//   analytics-service.ts — getOwnerOverview, getTeacherOverview, getTeacherSkillDetail, getOwnerTriageDetail
//   feedback-service.ts  — createFeedback

import { db } from "@/lib/db";
import { getAvatarByKey } from "@/lib/launch-data";
import {
  assertChildAccessAllowed,
  clearChildAccessFailures,
  recordChildAccessAttempt,
} from "@/lib/child-access";
import { launchBands } from "@/lib/launch-plan";
import { hashPin, normalizeUsername, validatePin, verifyPin } from "@/lib/pin";

// ─── Re-exports ───────────────────────────────────────────────────────────────

export { createPlaySession, answerQuestion } from "@/lib/session-service";
export { accessParent } from "@/lib/parent-service";
export {
  getOwnerOverview,
  getTeacherOverview,
  getTeacherSkillDetail,
  getOwnerTriageDetail,
} from "@/lib/analytics-service";
export { createFeedback } from "@/lib/feedback-service";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChildAccessInput = {
  username: string;
  pin: string;
  displayName?: string;
  avatarKey?: string;
  launchBandCode?: string;
};

type ChildAccessContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function ensureText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureLaunchBandCode(launchBandCode: string) {
  if (!launchBands.some((item) => item.code === launchBandCode)) {
    throw new Error("Choose a valid age or grade band.");
  }

  return launchBandCode;
}

function toProgression(row?: Record<string, unknown>) {
  return {
    totalPoints: Number(row?.total_points ?? 0),
    currentLevel: Number(row?.current_level ?? 1),
    badgeCount: Number(row?.badge_count ?? 0),
    trophyCount: Number(row?.trophy_count ?? 0),
  };
}

async function ensureProgressionState(studentId: string) {
  await db.query(
    `
      insert into public.progression_states (student_id)
      values ($1)
      on conflict (student_id) do nothing
    `,
    [studentId],
  );
}

// ─── Exported service functions ───────────────────────────────────────────────

export async function accessChild(
  input: ChildAccessInput,
  context: ChildAccessContext = {},
) {
  const username = normalizeUsername(ensureText(input.username));
  const pin = ensureText(input.pin);
  const displayName = ensureText(input.displayName);
  const avatarKey = ensureText(input.avatarKey);
  const launchBandCode = ensureLaunchBandCode(
    ensureText(input.launchBandCode) || "K1",
  );

  if (!username) {
    throw new Error("Username is required.");
  }

  if (!validatePin(pin)) {
    throw new Error("PIN must be exactly 4 digits.");
  }

  await assertChildAccessAllowed(username, context.ipAddress ?? null);

  const existing = await db.query(
    `
      select
        sp.id,
        sp.username,
        sp.display_name,
        sp.avatar_key,
        sp.launch_band_code,
        sp.preferred_theme_code,
        sp.pin_hash,
        ps.total_points,
        ps.current_level,
        ps.badge_count,
        ps.trophy_count
      from public.student_profiles sp
      left join public.progression_states ps
        on ps.student_id = sp.id
      where sp.username = $1
      limit 1
    `,
    [username],
  );

  if (existing.rowCount) {
    const row = existing.rows[0];

    if (!verifyPin(pin, username, row.pin_hash as string)) {
      await recordChildAccessAttempt({
        identifier: username,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        succeeded: false,
        failureReason: "wrong-pin",
      });
      throw new Error("Wrong username or PIN.");
    }

    await ensureProgressionState(row.id as string);
    await clearChildAccessFailures(username, context.ipAddress ?? null);
    await recordChildAccessAttempt({
      identifier: username,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
      succeeded: true,
      failureReason: null,
    });

    return {
      created: false,
      student: {
        id: row.id as string,
        username: row.username as string,
        displayName: row.display_name as string,
        avatarKey: row.avatar_key as string,
        launchBandCode: row.launch_band_code as string,
        preferredThemeCode: (row.preferred_theme_code as string | undefined) ?? null,
      },
      progression: toProgression(row),
    };
  }

  if (!displayName || !avatarKey) {
    throw new Error("Display name and avatar are required for first-time setup.");
  }

  const avatar = getAvatarByKey(avatarKey);

  if (!avatar) {
    throw new Error("Choose a valid avatar.");
  }

  if (avatar.launch_band !== launchBandCode) {
    throw new Error("Choose an avatar that matches the selected age or grade band.");
  }

  const inserted = await db.query(
    `
      insert into public.student_profiles (
        username,
        pin_hash,
        display_name,
        avatar_key,
        launch_band_code,
        preferred_theme_code
      )
      values ($1, $2, $3, $4, $5, $6)
      returning id, username, display_name, avatar_key, launch_band_code, preferred_theme_code
    `,
    [
      username,
      hashPin(pin, username),
      displayName,
      avatarKey,
      launchBandCode,
      avatar.theme,
    ],
  );

  await ensureProgressionState(inserted.rows[0].id as string);
  await clearChildAccessFailures(username, context.ipAddress ?? null);
  await recordChildAccessAttempt({
    identifier: username,
    ipAddress: context.ipAddress ?? null,
    userAgent: context.userAgent ?? null,
    succeeded: true,
    failureReason: null,
  });

  return {
    created: true,
    student: {
      id: inserted.rows[0].id as string,
      username: inserted.rows[0].username as string,
      displayName: inserted.rows[0].display_name as string,
      avatarKey: inserted.rows[0].avatar_key as string,
      launchBandCode: inserted.rows[0].launch_band_code as string,
      preferredThemeCode:
        (inserted.rows[0].preferred_theme_code as string | undefined) ?? null,
    },
    progression: {
      totalPoints: 0,
      currentLevel: 1,
      badgeCount: 0,
      trophyCount: 0,
    },
  };
}
