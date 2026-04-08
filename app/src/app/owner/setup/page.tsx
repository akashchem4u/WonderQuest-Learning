"use client";

import { useState } from "react";

const C = {
  bg: "#06071a",
  surface: "#0e1029",
  card: "#12152e",
  border: "rgba(255,255,255,0.07)",
  violet: "#9b72ff",
  teal: "#2dd4bf",
  text: "#f1f5f9",
  muted: "rgba(241,245,249,0.52)",
  red: "#fb7185",
  amber: "#fbbf24",
} as const;

function inputStyle(): React.CSSProperties {
  return {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "0.55rem 0.75rem",
    color: C.text,
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}

export default function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, password, confirmPassword, setupSecret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Setup failed.");
        return;
      }
      window.location.href = "/owner";
    } catch {
      setError("Network error. Please try again.");
    } finally {
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
          width: "100%",
          maxWidth: 440,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Warning banner */}
        <div
          style={{
            background: `${C.amber}15`,
            border: `1px solid ${C.amber}44`,
            borderRadius: 8,
            padding: "0.65rem 0.9rem",
            color: C.amber,
            fontSize: "0.83rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontWeight: 700, flexShrink: 0 }}>!</span>
          <span>
            <strong>Initial setup</strong> — this page can only be used once. After the first super
            admin is created, use the invite flow to add more admins.
          </span>
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "2rem",
          }}
        >
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <h1 style={{ color: C.text, fontSize: "1.2rem", fontWeight: 600, margin: 0 }}>
              Create Super Admin
            </h1>
            <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0.4rem 0 0" }}>
              First-time admin account setup
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
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: C.muted, fontSize: "0.8rem" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle()}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: C.muted, fontSize: "0.8rem" }}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="Your name"
                style={inputStyle()}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: C.muted, fontSize: "0.8rem" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                style={inputStyle()}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ color: C.muted, fontSize: "0.8rem" }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                style={inputStyle()}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
                marginTop: "0.25rem",
              }}
            >
              <label style={{ color: C.muted, fontSize: "0.8rem" }}>Setup Secret Key</label>
              <input
                type="password"
                value={setupSecret}
                onChange={(e) => setSetupSecret(e.target.value)}
                required
                placeholder="ADMIN_SETUP_SECRET env value"
                style={inputStyle()}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.25rem",
                background: loading ? `${C.violet}66` : C.violet,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.65rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating…" : "Create super admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
