"use client";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConvertAccountModal({ open, onClose, onSuccess }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/parent/guest/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Conversion failed.");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: "#13103a",
          border: "1px solid rgba(155,114,255,0.25)",
          boxShadow: "0 8px 40px rgba(100,60,200,0.3)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f0f6ff", margin: 0 }}>
            Save your progress
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: "1.2rem",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>
          Create a free account to keep Explorer&apos;s progress permanently.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.6)",
                marginBottom: "6px",
                fontFamily: "system-ui",
              }}
            >
              Your name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid rgba(155,114,255,0.3)",
                borderRadius: "10px",
                fontSize: 16,
                color: "#f0f6ff",
                background: "rgba(155,114,255,0.08)",
                outline: "none",
                fontFamily: "system-ui",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.6)",
                marginBottom: "6px",
                fontFamily: "system-ui",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid rgba(155,114,255,0.3)",
                borderRadius: "10px",
                fontSize: 16,
                color: "#f0f6ff",
                background: "rgba(155,114,255,0.08)",
                outline: "none",
                fontFamily: "system-ui",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.6)",
                marginBottom: "6px",
                fontFamily: "system-ui",
              }}
            >
              Password (min 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="········"
              required
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid rgba(155,114,255,0.3)",
                borderRadius: "10px",
                fontSize: 16,
                color: "#f0f6ff",
                background: "rgba(155,114,255,0.08)",
                outline: "none",
                fontFamily: "system-ui",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: "0.82rem",
                color: "#ff6b6b",
                background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.25)",
                borderRadius: "8px",
                padding: "10px 14px",
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "13px",
              background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              fontFamily: "system-ui",
              marginTop: "4px",
            }}
          >
            {submitting ? "Creating account…" : "Create free account →"}
          </button>
        </form>
      </div>
    </div>
  );
}
