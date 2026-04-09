"use client";
import { useState } from "react";

interface Credentials {
  parentUsername: string;
  parentPin: string;
  childUsername: string;
  childPin: string;
}

interface Props {
  style?: React.CSSProperties;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        fontSize: 11, padding: "2px 8px", borderRadius: 6,
        background: copied ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: copied ? "#34d399" : "rgba(255,255,255,0.5)",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "0.04em", fontFamily: "monospace" }}>{value}</div>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export function GuestStartButton({ style }: Props) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/parent/guest", { method: "POST" });
    if (res.ok) {
      const data = await res.json() as { ok: boolean; credentials: Credentials };
      setCredentials(data.credentials);
    }
    setLoading(false);
  }

  if (credentials) {
    return (
      <div style={{
        maxWidth: 360, width: "100%",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16, padding: "20px 24px",
        textAlign: "left",
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Your guest credentials</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Save these — valid for 24 hours</div>
        </div>

        {/* Parent section */}
        <div style={{
          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 10, padding: "12px 14px", marginBottom: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Parent login — wonderquest-learning.vercel.app/parent
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <CredentialRow label="Username" value={credentials.parentUsername} />
            <CredentialRow label="PIN" value={credentials.parentPin} />
          </div>
        </div>

        {/* Child section */}
        <div style={{
          background: "rgba(45,212,191,0.10)", border: "1px solid rgba(45,212,191,0.22)",
          borderRadius: 10, padding: "12px 14px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2dd4bf", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Child login — wonderquest-learning.vercel.app/child
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <CredentialRow label="Username" value={credentials.childUsername} />
            <CredentialRow label="PIN" value={credentials.childPin} />
          </div>
        </div>

        <button
          onClick={() => { window.location.href = "/parent"; }}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #9b72ff 0%, #2dd4bf 100%)",
            color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(155,114,255,0.35)",
          }}
        >
          Continue to dashboard →
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        cursor: loading ? "wait" : "pointer",
        border: "none",
        opacity: loading ? 0.8 : 1,
        ...style,
      }}
    >
      {loading ? "Setting up…" : "Start with a Guest Account →"}
    </button>
  );
}
