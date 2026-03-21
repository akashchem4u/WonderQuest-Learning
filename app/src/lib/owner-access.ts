import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const OWNER_COOKIE_NAME = "wonderquest-owner";

function configuredCode() {
  return process.env.OWNER_ACCESS_CODE?.trim() ?? "";
}

function buildToken(code: string) {
  return createHash("sha256")
    .update(`wonderquest-owner:${code}`)
    .digest("hex");
}

export function isOwnerAccessConfigured() {
  return Boolean(configuredCode());
}

export function isValidOwnerCode(code: string) {
  const expected = configuredCode();
  return Boolean(expected) && code.trim() === expected;
}

export function issueOwnerAccessToken() {
  const code = configuredCode();

  if (!code) {
    throw new Error("OWNER_ACCESS_CODE is not configured.");
  }

  return buildToken(code);
}

export async function hasOwnerAccess() {
  const code = configuredCode();

  if (!code) {
    return false;
  }

  const store = await cookies();
  const cookie = store.get(OWNER_COOKIE_NAME)?.value ?? "";
  return cookie === buildToken(code);
}
