/**
 * email.ts — Resend-backed transactional email
 * All sends are fire-and-forget (void) — a failed email never breaks an API response.
 * Set RESEND_API_KEY + RESEND_FROM_EMAIL in env to enable. No-ops silently if unset.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY ?? "";
// Default to Resend's sandbox sender until a custom domain is verified.
// Override by setting RESEND_FROM_EMAIL=WonderQuest <noreply@yourdomain.com>
const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

function client() {
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://wonderquest.app";
}

// ─── Generic transactional send ───────────────────────────────────────────────

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const resend = client();
  if (!resend) return;

  const { to, subject, html, text } = input;
  await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  }).catch((err: unknown) => {
    console.error("[email] sendEmail failed:", err);
  });
}

// ─── Admin invite ─────────────────────────────────────────────────────────────

export async function sendAdminInviteEmail(input: {
  toEmail: string;
  toName: string;
  inviteUrl: string;         // relative path, e.g. /owner/accept-invite?token=xxx
  invitedByName: string;
  role: string;
  expiresHours?: number;
}): Promise<void> {
  const resend = client();
  if (!resend) return;

  const {
    toEmail, toName, inviteUrl, invitedByName,
    role, expiresHours = 72,
  } = input;

  const fullUrl = `${appUrl()}${inviteUrl}`;
  const roleName = role === "super_admin" ? "Super Admin" : "Admin";

  await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `You've been invited to WonderQuest as ${roleName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#06071a;font-family:system-ui,-apple-system,sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#06071a;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:28px;text-align:center;">
          <span style="font-size:22px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;">
            Wonder<span style="color:#9b72ff;">Quest</span>
          </span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#12152e;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:32px;">

          <!-- Icon -->
          <div style="text-align:center;margin-bottom:20px;">
            <div style="display:inline-block;width:52px;height:52px;border-radius:14px;background:rgba(155,114,255,0.15);line-height:52px;text-align:center;font-size:24px;">🛡️</div>
          </div>

          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#f1f5f9;text-align:center;">
            You're invited to WonderQuest
          </h1>
          <p style="margin:0 0 24px;font-size:14px;color:rgba(241,245,249,0.55);text-align:center;line-height:1.6;">
            <strong style="color:#f1f5f9;">${invitedByName}</strong> has invited you to join as
            <strong style="color:#9b72ff;">${roleName}</strong>.
          </p>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${fullUrl}"
               style="display:inline-block;background:#9b72ff;color:#fff;text-decoration:none;border-radius:10px;padding:13px 32px;font-size:15px;font-weight:700;letter-spacing:0.01em;">
              Accept invite →
            </a>
          </div>

          <p style="margin:0 0 6px;font-size:12px;color:rgba(241,245,249,0.35);text-align:center;">
            Or copy this link:
          </p>
          <p style="margin:0 0 20px;font-size:11px;color:rgba(155,114,255,0.8);text-align:center;word-break:break-all;font-family:monospace;">
            ${fullUrl}
          </p>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 0 16px;">

          <p style="margin:0;font-size:11px;color:rgba(241,245,249,0.3);text-align:center;line-height:1.6;">
            This invite is for <strong style="color:rgba(241,245,249,0.5);">${toEmail}</strong> only
            and expires in ${expiresHours} hours.<br>
            You must sign in with the Google account tied to this email.
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(241,245,249,0.25);">
            WonderQuest Learning · You're receiving this because you were invited by ${invitedByName}.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err: unknown) => {
    console.error("[email] sendAdminInviteEmail failed:", err);
  });
}

// ─── Parent welcome ───────────────────────────────────────────────────────────

export async function sendParentWelcomeEmail(input: {
  toEmail: string;
  toName: string;
}): Promise<void> {
  const resend = client();
  if (!resend) return;

  const { toEmail, toName } = input;
  const dashboardUrl = `${appUrl()}/parent`;

  await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: "Welcome to WonderQuest 🌟",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#06071a;font-family:system-ui,-apple-system,sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#06071a;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:28px;text-align:center;">
          <span style="font-size:22px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;">
            Wonder<span style="color:#9b72ff;">Quest</span>
          </span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#12152e;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:32px;">

          <div style="text-align:center;margin-bottom:20px;font-size:36px;">🌟</div>

          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#f1f5f9;text-align:center;">
            Welcome to WonderQuest, ${toName}!
          </h1>
          <p style="margin:0 0 24px;font-size:14px;color:rgba(241,245,249,0.55);text-align:center;line-height:1.6;">
            Your account is ready. Start linking your child and tracking their learning journey.
          </p>

          <div style="text-align:center;margin-bottom:24px;">
            <a href="${dashboardUrl}"
               style="display:inline-block;background:#9b72ff;color:#fff;text-decoration:none;border-radius:10px;padding:13px 32px;font-size:15px;font-weight:700;">
              Go to my dashboard →
            </a>
          </div>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 0 16px;">

          <p style="margin:0;font-size:11px;color:rgba(241,245,249,0.3);text-align:center;line-height:1.6;">
            Questions? Just reply to this email — we're here to help.
          </p>

        </td></tr>

        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(241,245,249,0.25);">
            WonderQuest Learning · You're receiving this because you just signed up.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch((err: unknown) => {
    console.error("[email] sendParentWelcomeEmail failed:", err);
  });
}
