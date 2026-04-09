"use client";

import { useState } from "react";

const C = {
  bg:     "#06071a",
  card:   "#0d1021",
  border: "rgba(255,255,255,0.08)",
  violet: "#9b72ff",
  text:   "#f1f5f9",
  muted:  "rgba(241,245,249,0.5)",
  red:    "#fb7185",
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

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      localStorage.setItem("oauth_redirect_role", "admin");
      localStorage.setItem("oauth_admin_context", JSON.stringify({ action: "login" }));
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { supabaseBrowser } = await import("@/lib/supabase-browser");
      await supabaseBrowser.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    } catch {
      setError("Could not start Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
    }}>
      {/* Branding */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#9b72ff,#5a30d0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem",
          }}>🌟</div>
          <span style={{
            font: "900 1.4rem system-ui",
            background: "linear-gradient(135deg,#c3aaff,#9b72ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>WonderQuest</span>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "2rem",
        width: "100%",
        maxWidth: 380,
      }}>
        {/* Role badge + heading */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", padding: "3px 12px",
            borderRadius: 999, background: `${C.violet}18`, color: C.violet,
            fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: "0.85rem",
          }}>Owner Portal</div>
          <h1 style={{ color: C.text, fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.3rem" }}>
            Admin Sign In
          </h1>
          <p style={{ color: C.muted, fontSize: "0.85rem", margin: 0, lineHeight: 1.55 }}>
            Sign in with your registered Google account to access the owner portal.
          </p>
        </div>

        {error && (
          <div style={{
            background: `${C.red}18`,
            border: `1px solid ${C.red}44`,
            borderRadius: 8,
            padding: "0.7rem 0.9rem",
            color: C.red,
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
          }}>
            {error}
          </div>
        )}

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

        <p style={{
          color: C.muted,
          fontSize: "0.75rem",
          textAlign: "center",
          marginTop: "1.25rem",
          lineHeight: 1.5,
        }}>
          Your Google account must be registered by the super admin before you can sign in.
        </p>
      </div>
    </div>
  );
}
