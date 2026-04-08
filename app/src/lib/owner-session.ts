import { NextRequest, NextResponse } from "next/server";
import {
  isValidOwnerAccessToken,
  OWNER_COOKIE_NAME,
} from "@/lib/owner-access";

type OwnerSessionResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

function unauthorized(message: string) {
  return {
    ok: false as const,
    response: NextResponse.json({ error: message }, { status: 401 }),
  };
}

export function requireOwnerSession(
  request: NextRequest,
): OwnerSessionResult {
  const token = request.cookies.get(OWNER_COOKIE_NAME)?.value?.trim() ?? "";

  if (!isValidOwnerAccessToken(token)) {
    return unauthorized("Owner access is required.");
  }

  return { ok: true };
}
