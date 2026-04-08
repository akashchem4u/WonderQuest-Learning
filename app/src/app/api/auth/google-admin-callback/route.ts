import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { createAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

type Body = {
  googleId: string;
  email: string;
  displayName: string;
  action: "setup" | "login" | "accept-invite";
  setupSecret?: string;
  inviteToken?: string;
};

function sessionCookieOptions(token: string) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 8 * 60 * 60,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { googleId, email, displayName, action } = body;
  if (!googleId || !email || !action) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    // ── 1. ONE-TIME SETUP ─────────────────────────────────────────────────────
    if (action === "setup") {
      const expectedSecret = process.env.ADMIN_SETUP_SECRET ?? "";
      const providedSecret = typeof body.setupSecret === "string" ? body.setupSecret : "";

      if (!expectedSecret || providedSecret !== expectedSecret) {
        return NextResponse.json({ error: "Invalid setup secret." }, { status: 403 });
      }

      const countResult = await db.query(`SELECT COUNT(*) AS cnt FROM public.admin_users`);
      if (Number(countResult.rows[0].cnt) > 0) {
        return NextResponse.json(
          { error: "Setup already completed. Use the invite flow to add more admins." },
          { status: 409 },
        );
      }

      const insertResult = await db.query(
        `INSERT INTO public.admin_users
           (email, display_name, password_hash, role, is_active,
            google_id, oauth_provider, invite_accepted_at)
         VALUES ($1, $2, '', 'super_admin', true, $3, 'google', now())
         RETURNING id`,
        [email.toLowerCase(), displayName, googleId],
      );

      const adminId = insertResult.rows[0].id as string;
      const token = await createAdminSession(adminId);
      const res = NextResponse.json({ ok: true, redirectTo: "/owner" });
      res.cookies.set(sessionCookieOptions(token));
      return res;
    }

    // ── 2. LOGIN ──────────────────────────────────────────────────────────────
    if (action === "login") {
      // Try by google_id first, then fall back to email
      let result = await db.query(
        `SELECT id, is_active FROM public.admin_users WHERE google_id = $1 LIMIT 1`,
        [googleId],
      );

      if (!result.rowCount) {
        result = await db.query(
          `SELECT id, is_active FROM public.admin_users WHERE email = $1 LIMIT 1`,
          [email.toLowerCase()],
        );

        if (result.rowCount) {
          // Link google_id for future sign-ins
          await db.query(
            `UPDATE public.admin_users
             SET google_id = $1, oauth_provider = 'google', updated_at = now()
             WHERE id = $2`,
            [googleId, result.rows[0].id],
          );
        }
      }

      if (!result.rowCount) {
        return NextResponse.json(
          { error: "Your Google account is not registered as a WonderQuest admin. Contact your super admin." },
          { status: 404 },
        );
      }

      const row = result.rows[0];
      if (!row.is_active) {
        return NextResponse.json(
          { error: "Your admin account is inactive. Contact your super admin." },
          { status: 403 },
        );
      }

      const token = await createAdminSession(row.id as string);
      const res = NextResponse.json({ ok: true, redirectTo: "/owner" });
      res.cookies.set(sessionCookieOptions(token));
      return res;
    }

    // ── 3. ACCEPT INVITE ──────────────────────────────────────────────────────
    if (action === "accept-invite") {
      const inviteToken = typeof body.inviteToken === "string" ? body.inviteToken.trim() : "";
      if (!inviteToken) {
        return NextResponse.json({ error: "Invite token is required." }, { status: 400 });
      }

      const result = await db.query(
        `SELECT id, email FROM public.admin_users
         WHERE invite_token = $1
           AND invite_expires_at > now()
           AND invite_accepted_at IS NULL`,
        [inviteToken],
      );

      if (!result.rowCount) {
        return NextResponse.json(
          { error: "Invite link is invalid or has expired." },
          { status: 400 },
        );
      }

      const row = result.rows[0];
      // Email must match the invited address
      if ((row.email as string).toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: `This invite was sent to ${row.email as string}. Please sign in with that Google account.` },
          { status: 403 },
        );
      }

      await db.query(
        `UPDATE public.admin_users
         SET google_id          = $1,
             oauth_provider     = 'google',
             display_name       = COALESCE(NULLIF(display_name, ''), $2),
             invite_token       = NULL,
             invite_accepted_at = now(),
             is_active          = true,
             updated_at         = now()
         WHERE id = $3`,
        [googleId, displayName, row.id as string],
      );

      const token = await createAdminSession(row.id as string);
      const res = NextResponse.json({ ok: true, redirectTo: "/owner" });
      res.cookies.set(sessionCookieOptions(token));
      return res;
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable. Please try again." }, { status: 503 });
    }
    console.error("[api/auth/google-admin-callback]", err);
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 });
  }
}
