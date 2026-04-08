"use client";

import { useState } from "react";

const C = {
  bg: "#06071a",
  card: "#12152e",
  border: "rgba(255,255,255,0.07)",
  violet: "#9b72ff",
  text: "#f1f5f9",
  muted: "rgba(241,245,249,0.52)",
  red: "#fb7185",
  amber: "#fbbf24",
} as const;

const inputStyle: React.CSSProperties = {
  background: "#0e1029",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 8,
  padding: "0.55rem 0.75rem",
  color: "#f1f5f9",
  fontSize: "0.9rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function AdminSetupPage() {
  const [setupSecret, setSetupSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle(e: React.FormEvent) {
    e.preventDefault();
    if (!setupSecret.trim()) { setError("Enter the setup secret key first."); return; }
    setError(null);
    setLoading(true);
    try {
      localStorage.setItem("oauth_redirect_role", "admin");
      localStorage.setItem("oauth_admin_context", JSON.stringify({ action: "setup", setupSecret: setupSecret.trim() }));
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { supabaseBrowser } = await import("@/lib/supabase-browser");
      await supabaseBrowser.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    } catch {
      setError("Could not start Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* One-time warning */}
        <div style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "0.65rem 0.9rem", color: C.amber, fontSize: "0.83rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
          <span style={{ fontWeight: 700, flexShrink: 0 }}>!</span>
          <span><strong>One-time setup</strong> — this page locks permanently after the first super admin is created.</span>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "2rem" }}>
          {/* Header */}
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 12, background: `${C.violet}22`, marginBottom: "0.75rem" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill={C.violet} />
              </svg>
            </div>
            <h1 style={{ color: C.text, fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Create Super Admin</h1>
            <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0.35rem 0 0" }}>Claim ownership with your Google account</p>
          </div>

          {error && (
            <div style={{ background: `${C.red}18`, border: `1px solid ${C.red}44`, borderRadius: 8, padding: "0.6rem 0.75rem", color: C.red, fontSize: "0.85rem", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleGoogle} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: C.muted, fontSize: "0.8rem" }}>
                Setup Secret Key <span style={{ color: C.red }}>*</span>
              </label>
              <input
                type="password"
                value={setupSecret}
                onChange={(e) => { setSetupSecret(e.target.value); setError(null); }}
                required
                autoComplete="off"
                placeholder="Value of ADMIN_SETUP_SECRET"
                style={inputStyle}
              />
              <span style={{ color: C.muted, fontSize: "0.72rem" }}>
                Set ADMIN_SETUP_SECRET in Render → Environment first.
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "2px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ color: C.muted, fontSize: "0.75rem" }}>then sign in with</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            <button
              type="submit"
              disabled={loading || !setupSecret.trim()}
              style={{ background: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#1a1a2e", cursor: loading || !setupSecret.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 14, fontWeight: 600, minHeight: 46, padding: "10px 16px", opacity: loading || !setupSecret.trim() ? 0.6 : 1, transition: "opacity .15s", width: "100%" }}
            >
              {loading ? "Redirecting…" : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

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
