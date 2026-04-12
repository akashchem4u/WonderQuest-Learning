"use client";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionCount?: number;
}

const inputStyle: React.CSSProperties = {
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
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "rgba(255,255,255,0.6)",
  marginBottom: "6px",
  fontFamily: "system-ui",
};

export function ConvertAccountModal({ open, onClose, onSuccess, sessionCount = 0 }: Props) {
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
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 440, borderRadius: 20, padding: "32px 28px",
          background: "#13103a",
          border: "1px solid rgba(155,114,255,0.25)",
          boxShadow: "0 8px 40px rgba(100,60,200,0.3)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f0f6ff", margin: "0 0 4px" }}>
              Save your child&apos;s progress
            </h2>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
              Free account. No credit card. Takes 30 seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "4px", marginLeft: 12 }}
          >
            ✕
          </button>
        </div>

        {/* What gets saved */}
        <div style={{
          background: "rgba(88,232,193,0.08)", border: "1px solid rgba(88,232,193,0.20)",
          borderRadius: 12, padding: "14px 16px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#58e8c1", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            What gets saved permanently
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { icon: "⭐", text: "All stars and points earned" },
              { icon: "🏅", text: "Badges and trophies unlocked" },
              { icon: "📊", text: sessionCount > 0 ? `Skill progress from ${sessionCount} quest${sessionCount !== 1 ? "s" : ""} played` : "All skill progress data" },
              { icon: "🔥", text: "Current streak — don't lose it!" },
            ].map((item) => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Your name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Sarah" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Password (min 6 characters)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="········" required autoComplete="new-password" style={inputStyle} />
          </div>

          {error && (
            <p style={{ fontSize: "0.82rem", color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: "13px",
              background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
              color: "#fff", border: "none", borderRadius: "12px",
              fontSize: "0.95rem", fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              fontFamily: "system-ui", marginTop: 4,
              boxShadow: "0 4px 16px rgba(155,114,255,0.35)",
            }}
          >
            {submitting ? "Saving…" : "Save progress — create free account →"}
          </button>
        </form>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 14, margin: "14px 0 0" }}>
          🔒 COPPA-compliant · No ads · No data sold ever
        </p>
      </div>
    </div>
  );
}
