import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

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

const ACCESS_TYPE_TEACHER = "teacher";

function readPositiveInt(name: string, fallback: number) {
  const raw = Number(process.env[name] ?? "");
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
}

const MAX_CODE_ATTEMPTS = readPositiveInt("ACCESS_MAX_ATTEMPTS", 5);
const LOCKOUT_MINUTES = readPositiveInt("ACCESS_LOCKOUT_MINUTES", 15);

export class TeacherAccessThrottleError extends Error {}

export async function assertTeacherAccessAllowed(ipAddress: string | null) {
  if (!ipAddress) return;

  const recentSince = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);
  const result = await db.query(
    `
      select count(*) as ip_failures
      from public.access_attempts
      where access_type = $1
        and ip_address = $2
        and succeeded = false
        and created_at >= $3
    `,
    [ACCESS_TYPE_TEACHER, ipAddress, recentSince],
  );

  if (Number(result.rows[0]?.ip_failures ?? 0) >= MAX_CODE_ATTEMPTS) {
    throw new TeacherAccessThrottleError(
      `Too many incorrect attempts. Wait ${LOCKOUT_MINUTES} minutes and try again.`,
    );
  }
}

export async function recordTeacherAccessAttempt(input: {
  ipAddress: string | null;
  userAgent: string | null;
  succeeded: boolean;
}) {
  await db.query(
    `
      insert into public.access_attempts (
        access_type, identifier, ip_address, user_agent, succeeded
      )
      values ($1, '', $2, $3, $4)
    `,
    [ACCESS_TYPE_TEACHER, input.ipAddress, input.userAgent, input.succeeded],
  );
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
