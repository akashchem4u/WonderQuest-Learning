"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const C = {
  bg: "#06071a",
  card: "#12152e",
  border: "rgba(255,255,255,0.07)",
  violet: "#9b72ff",
  teal: "#2dd4bf",
  text: "#f1f5f9",
  muted: "rgba(241,245,249,0.52)",
  red: "#fb7185",
  amber: "#fbbf24",
} as const;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError("No invite token found. Check your invite link and try again.");
  }, [token]);

  async function handleGoogle() {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      localStorage.setItem("oauth_redirect_role", "admin");
      localStorage.setItem(
        "oauth_admin_context",
        JSON.stringify({ action: "accept-invite", inviteToken: token }),
      );
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { supabaseBrowser } = await import("@/lib/supabase-browser");
      await supabaseBrowser.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    } catch {
      setError("Could not start Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "2rem",
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${C.teal}22`,
              marginBottom: "0.75rem",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill={C.teal}
              />
            </svg>
          </div>
          <h1 style={{ color: C.text, fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
            Accept Admin Invite
          </h1>
          <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0.4rem 0 0" }}>
            Sign in with the Google account your invite was sent to
          </p>
        </div>

        {error && (
          <div
            style={{
              background: `${C.red}18`,
              border: `1px solid ${C.red}44`,
              borderRadius: 8,
              padding: "0.6rem 0.75rem",
              color: C.red,
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            {error}
          </div>
        )}

        {token && (
          <>
            {/* Token preview */}
            <div
              style={{
                background: `${C.teal}10`,
                border: `1px solid ${C.teal}30`,
                borderRadius: 8,
                padding: "0.6rem 0.8rem",
                marginBottom: "1.25rem",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={C.teal}>
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
              </svg>
              <span style={{ color: C.teal, fontSize: "0.8rem" }}>
                Valid invite link detected
              </span>
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                background: "#fff",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                color: "#1a1a2e",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontFamily: "system-ui,-apple-system,sans-serif",
                fontSize: 14,
                fontWeight: 600,
                minHeight: 46,
                padding: "10px 16px",
                opacity: loading ? 0.6 : 1,
                transition: "opacity .15s",
                width: "100%",
              }}
            >
              {loading ? "Redirecting…" : <><GoogleIcon />Continue with Google</>}
            </button>

            <p
              style={{
                color: C.muted,
                fontSize: "0.75rem",
                textAlign: "center",
                marginTop: "0.85rem",
                lineHeight: 1.5,
              }}
            >
              You must sign in with the exact Google account your invite was sent to. Mismatched accounts will be rejected.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
          Loading…
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
