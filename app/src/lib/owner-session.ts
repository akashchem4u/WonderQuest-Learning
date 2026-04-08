import { NextRequest, NextResponse } from "next/server";
import {
  isValidOwnerAccessToken,
  OWNER_COOKIE_NAME,
} from "@/lib/owner-access";
import { getAdminFromSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

type OwnerSessionResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

function unauthorized(message: string) {
  return {
    ok: false as const,
    response: NextResponse.json({ error: message }, { status: 401 }),
  };
}

export async function requireOwnerSession(
  request: NextRequest,
): Promise<OwnerSessionResult> {
  // 1. Check legacy OWNER_ACCESS_CODE token (backward compat)
  const token = request.cookies.get(OWNER_COOKIE_NAME)?.value?.trim() ?? "";
  if (isValidOwnerAccessToken(token)) {
    return { ok: true };
  }

  // 2. Check admin account session
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  if (adminToken) {
    try {
      const admin = await getAdminFromSession(adminToken);
      if (admin) return { ok: true };
    } catch {
      // DB unavailable — fall through to unauthorized
    }
  }

  return unauthorized("Owner access is required.");
}
