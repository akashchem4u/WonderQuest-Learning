"use client";

import { useState } from "react";
import Link from "next/link";

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
} as const;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign in failed.");
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
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "2rem",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `${C.violet}22`,
              marginBottom: "0.75rem",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C9.24 2 7 4.24 7 7v1H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v1H9V7c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
                fill={C.violet}
              />
            </svg>
          </div>
          <h1 style={{ color: C.text, fontSize: "1.2rem", fontWeight: 600, margin: 0 }}>
            Admin Sign In
          </h1>
          <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0.4rem 0 0" }}>
            WonderQuest owner portal
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ color: C.muted, fontSize: "0.8rem" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "0.55rem 0.75rem",
                color: C.text,
                fontSize: "0.9rem",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <label style={{ color: C.muted, fontSize: "0.8rem" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "0.55rem 0.75rem",
                color: C.text,
                fontSize: "0.9rem",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
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
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            textAlign: "center",
          }}
        >
          <Link
            href="/owner"
            style={{ color: C.teal, fontSize: "0.82rem", textDecoration: "none" }}
          >
            Use access code instead
          </Link>
          <span style={{ color: C.muted, fontSize: "0.8rem" }}>
            Need access? Contact your super admin.
          </span>
        </div>
      </div>
    </div>
  );
}
