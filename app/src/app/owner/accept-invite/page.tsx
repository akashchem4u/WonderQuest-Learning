"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
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
    ...extra,
  };
}

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No invite token found. Check your invite link and try again.");
    }
  }, [token]);

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
      const res = await fetch("/api/admin/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to accept invite.");
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
          maxWidth: 420,
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
              background: `${C.teal}22`,
              marginBottom: "0.75rem",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill={C.teal}
              />
            </svg>
          </div>
          <h1 style={{ color: C.text, fontSize: "1.2rem", fontWeight: 600, margin: 0 }}>
            Create your admin account
          </h1>
          <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0.4rem 0 0" }}>
            You have been invited to WonderQuest admin
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

        {token && (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
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

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.25rem",
                background: loading ? `${C.teal}66` : C.teal,
                color: "#06071a",
                border: "none",
                borderRadius: 8,
                padding: "0.65rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Setting up…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#06071a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(241,245,249,0.52)",
          }}
        >
          Loading…
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
