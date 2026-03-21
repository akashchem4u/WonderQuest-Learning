import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const TEACHER_COOKIE_NAME = "wonderquest-teacher";

function configuredCode() {
  return process.env.TEACHER_ACCESS_CODE?.trim() ?? "";
}

function buildToken(code: string) {
  return createHash("sha256")
    .update(`wonderquest-teacher:${code}`)
    .digest("hex");
}

export function isTeacherAccessConfigured() {
  return Boolean(configuredCode());
}

export function isValidTeacherCode(code: string) {
  const expected = configuredCode();
  return Boolean(expected) && code.trim() === expected;
}

export function issueTeacherAccessToken() {
  const code = configuredCode();

  if (!code) {
    throw new Error("TEACHER_ACCESS_CODE is not configured.");
  }

  return buildToken(code);
}

export async function hasTeacherAccess() {
  const code = configuredCode();

  if (!code) {
    return false;
  }

  const store = await cookies();
  const cookie = store.get(TEACHER_COOKIE_NAME)?.value ?? "";
  return cookie === buildToken(code);
}
