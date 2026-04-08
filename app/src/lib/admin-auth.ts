import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const ADMIN_SESSION_COOKIE = "wonderquest-admin-session";
const SESSION_TTL_HOURS = 8;

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(`wq-admin:${salt}:${password}`).digest("hex");
  return `v1:${salt}:${hash}`;
}

export function verifyAdminPassword(password: string, stored: string): boolean {
  if (!stored.startsWith("v1:")) return false;
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const salt = parts[1];
  const expectedHash = parts[2];
  const hash = createHash("sha256").update(`wq-admin:${salt}:${password}`).digest("hex");
  return hash === expectedHash;
}

export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createAdminSession(adminId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(`wq-admin-session:${token}`).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  await db.query(
    `INSERT INTO public.access_sessions (access_type, admin_id, token_hash, expires_at)
     VALUES ('admin', $1, $2, $3)`,
    [adminId, tokenHash, expiresAt],
  );

  // Update last_login_at
  await db.query(
    `UPDATE public.admin_users SET last_login_at = now() WHERE id = $1`,
    [adminId],
  );

  return token;
}

export async function getAdminFromSession(
  token: string,
): Promise<{ adminId: string; role: string; displayName: string } | null> {
  if (!token) return null;
  const tokenHash = createHash("sha256").update(`wq-admin-session:${token}`).digest("hex");

  const sessionResult = await db.query(
    `UPDATE public.access_sessions
     SET last_seen_at = now()
     WHERE access_type = 'admin' AND token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
     RETURNING admin_id`,
    [tokenHash],
  );

  if (!sessionResult.rowCount) return null;
  const adminId = sessionResult.rows[0].admin_id as string;

  const adminResult = await db.query(
    `SELECT id, role, display_name FROM public.admin_users WHERE id = $1 AND is_active = true`,
    [adminId],
  );

  if (!adminResult.rowCount) return null;
  const row = adminResult.rows[0];
  return {
    adminId: row.id as string,
    role: row.role as string,
    displayName: row.display_name as string,
  };
}

type AdminSessionResult =
  | { ok: true; adminId: string; role: string; displayName: string }
  | { ok: false; response: NextResponse };

export function requireAdminSession(
  request: NextRequest,
): AdminSessionResult | Promise<AdminSessionResult> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin authentication required." },
        { status: 401 },
      ),
    };
  }
  return getAdminFromSession(token).then((admin) => {
    if (!admin)
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: "Admin session expired. Please log in again." },
          { status: 401 },
        ),
      };
    return { ok: true as const, ...admin };
  });
}
