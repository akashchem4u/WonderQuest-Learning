import { createHash, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const CHILD_SESSION_COOKIE_NAME = "wonderquest-child-session";

const ACCESS_TYPE_CHILD = "child";

export class ChildAccessThrottleError extends Error {}

export class ChildAccessSessionError extends Error {}

function readPositiveInt(name: string, fallback: number) {
  const raw = Number(process.env[name] ?? "");

  if (!Number.isFinite(raw) || raw <= 0) {
    return fallback;
  }

  return Math.floor(raw);
}

const SESSION_TTL_MINUTES = readPositiveInt("ACCESS_SESSION_TTL_MINUTES", 240);
const MAX_ATTEMPTS = readPositiveInt("ACCESS_MAX_ATTEMPTS", 5);
const LOCKOUT_MINUTES = readPositiveInt("ACCESS_LOCKOUT_MINUTES", 15);

function hashToken(token: string) {
  return createHash("sha256")
    .update(`wonderquest:${ACCESS_TYPE_CHILD}:${token}`)
    .digest("hex");
}

function truncate(value: string | null | undefined, maxLength: number) {
  if (!value) {
    return null;
  }

  return value.slice(0, maxLength);
}

function recentWindowStart() {
  return new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);
}

export function getRequestIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return truncate(forwardedFor.split(",")[0]?.trim() ?? null, 64);
  }

  return truncate(request.headers.get("x-real-ip"), 64);
}

export function getRequestUserAgent(request: NextRequest) {
  return truncate(request.headers.get("user-agent"), 512);
}

export async function assertChildAccessAllowed(
  identifier: string,
  ipAddress: string | null,
) {
  const recentSince = recentWindowStart();
  const result = ipAddress
    ? await db.query(
        `
          select
            count(*) filter (
              where identifier = $2 and succeeded = false and created_at >= $4
            ) as identifier_failures,
            count(*) filter (
              where ip_address = $3 and succeeded = false and created_at >= $4
            ) as ip_failures
          from public.access_attempts
          where access_type = $1
            and (
              identifier = $2
              or ip_address = $3
            )
        `,
        [ACCESS_TYPE_CHILD, identifier, ipAddress, recentSince],
      )
    : await db.query(
        `
          select
            count(*) filter (
              where identifier = $2 and succeeded = false and created_at >= $3
            ) as identifier_failures,
            0::bigint as ip_failures
          from public.access_attempts
          where access_type = $1
            and identifier = $2
        `,
        [ACCESS_TYPE_CHILD, identifier, recentSince],
      );

  const row = result.rows[0];
  const identifierFailures = Number(row?.identifier_failures ?? 0);
  const ipFailures = Number(row?.ip_failures ?? 0);

  if (identifierFailures >= MAX_ATTEMPTS || ipFailures >= MAX_ATTEMPTS) {
    throw new ChildAccessThrottleError(
      `Too many incorrect PIN attempts. Wait ${LOCKOUT_MINUTES} minutes and try again.`,
    );
  }
}

export async function recordChildAccessAttempt(input: {
  identifier: string;
  ipAddress: string | null;
  userAgent: string | null;
  succeeded: boolean;
  failureReason?: string | null;
}) {
  await db.query(
    `
      insert into public.access_attempts (
        access_type,
        identifier,
        ip_address,
        user_agent,
        succeeded,
        failure_reason
      )
      values ($1, $2, $3, $4, $5, $6)
    `,
    [
      ACCESS_TYPE_CHILD,
      input.identifier,
      input.ipAddress,
      input.userAgent,
      input.succeeded,
      input.failureReason ?? null,
    ],
  );
}

export async function clearChildAccessFailures(
  identifier: string,
  ipAddress: string | null,
) {
  if (ipAddress) {
    await db.query(
      `
        delete from public.access_attempts
        where access_type = $1
          and succeeded = false
          and (
            identifier = $2
            or ip_address = $3
          )
      `,
      [ACCESS_TYPE_CHILD, identifier, ipAddress],
    );
    return;
  }

  await db.query(
    `
      delete from public.access_attempts
      where access_type = $1
        and succeeded = false
        and identifier = $2
    `,
    [ACCESS_TYPE_CHILD, identifier],
  );
}

export async function createChildAccessSession(input: {
  studentId: string;
  ipAddress: string | null;
  userAgent: string | null;
}) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

  await db.query(
    `
      insert into public.access_sessions (
        access_type,
        student_id,
        token_hash,
        ip_address,
        user_agent,
        expires_at
      )
      values ($1, $2, $3, $4, $5, $6)
    `,
    [
      ACCESS_TYPE_CHILD,
      input.studentId,
      hashToken(token),
      input.ipAddress,
      input.userAgent,
      expiresAt,
    ],
  );

  return {
    token,
    expiresAt,
  };
}

export async function requireChildAccessSession(request: NextRequest) {
  const token = request.cookies.get(CHILD_SESSION_COOKIE_NAME)?.value ?? "";

  if (!token) {
    throw new ChildAccessSessionError(
      "A child access session is required. Return to child access and sign in again.",
    );
  }

  const result = await db.query(
    `
      update public.access_sessions
      set last_seen_at = now()
      where access_type = $1
        and token_hash = $2
        and revoked_at is null
        and expires_at > now()
      returning id, student_id, expires_at
    `,
    [ACCESS_TYPE_CHILD, hashToken(token)],
  );

  if (!result.rowCount) {
    throw new ChildAccessSessionError(
      "The child access session expired. Return to child access and sign in again.",
    );
  }

  const row = result.rows[0];

  return {
    accessSessionId: row.id as string,
    studentId: row.student_id as string,
    expiresAt: row.expires_at as string,
  };
}
