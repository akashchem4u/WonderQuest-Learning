"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";

// ─── Difficulty config ────────────────────────────────────────────────────────

const DIFFICULTIES: {
  id: Difficulty;
  label: string;
  emoji: string;
  desc: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}[] = [
  {
    id: "easy",
    label: "Easy",
    emoji: "🌱",
    desc: "Warm-up questions to build confidence",
    accent: "#50e890",
    accentBg: "rgba(80,232,144,0.10)",
    accentBorder: "rgba(80,232,144,0.35)",
    accentText: "#50e890",
  },
  {
    id: "medium",
    label: "Medium",
    emoji: "⚡",
    desc: "Push your skills with balanced challenges",
    accent: "#9b72ff",
    accentBg: "rgba(155,114,255,0.10)",
    accentBorder: "rgba(155,114,255,0.35)",
    accentText: "#c4a0ff",
  },
  {
    id: "hard",
    label: "Hard",
    emoji: "🔥",
    desc: "Maximum challenge — for the brave!",
    accent: "#ff7b6b",
    accentBg: "rgba(255,123,107,0.10)",
    accentBorder: "rgba(255,123,107,0.35)",
    accentText: "#ff9f93",
  },
];

// ─── Challenge Setup ──────────────────────────────────────────────────────────

function ChallengeModeSetup() {
  const [selected, setSelected] = useState<Difficulty>("medium");

  const chosen = DIFFICULTIES.find((d) => d.id === selected)!;

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes bolt-flicker {
          0%, 90%, 100% { opacity: 1; }
          95%            { opacity: 0.5; }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes edge-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155,114,255,0); }
          50%       { box-shadow: 0 0 24px 4px rgba(155,114,255,0.18); }
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 30% 0%, rgba(60,20,140,0.28) 0%, transparent 55%), #0a0812",
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#f0f6ff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        {/* Nav */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            display: "flex",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <Link
            href="/child"
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "#9b72ff",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            background: "linear-gradient(160deg, #16102e, #0e0e1e)",
            border: "2px solid rgba(155,114,255,0.28)",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
            animation: "edge-glow 3s ease-in-out infinite",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "32px 28px 24px",
              background: "radial-gradient(ellipse at 50% 0%, rgba(155,114,255,0.18) 0%, transparent 65%)",
              borderBottom: "1px solid rgba(155,114,255,0.14)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: 72,
                lineHeight: 1,
                display: "block",
                marginBottom: 12,
                animation: "bolt-flicker 3s ease-in-out infinite",
                filter: "drop-shadow(0 0 16px rgba(155,114,255,0.5))",
              }}
            >
              ⚡
            </span>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#c4a0ff",
                margin: 0,
                marginBottom: 8,
                letterSpacing: "0.03em",
                textShadow: "0 0 20px rgba(155,114,255,0.4)",
              }}
            >
              Challenge Mode
            </h1>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#9b8ec4",
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              Pick your difficulty and take control
              <br />
              of your learning!
            </p>
          </div>

          {/* Difficulty selector */}
          <div style={{ padding: "24px 28px 8px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: "rgba(155,114,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 14,
              }}
            >
              Choose Your Level
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DIFFICULTIES.map((d) => {
                const isSelected = selected === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelected(d.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      width: "100%",
                      padding: "14px 18px",
                      background: isSelected ? d.accentBg : "rgba(255,255,255,0.03)",
                      border: `2px solid ${isSelected ? d.accentBorder : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 16,
                      cursor: "pointer",
                      fontFamily: "'Nunito', system-ui, sans-serif",
                      textAlign: "left",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 32,
                        lineHeight: 1,
                        flexShrink: 0,
                        filter: isSelected
                          ? `drop-shadow(0 0 8px ${d.accent})`
                          : undefined,
                      }}
                    >
                      {d.emoji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 900,
                          color: isSelected ? d.accentText : "#c4b0ff",
                          marginBottom: 2,
                        }}
                      >
                        {d.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isSelected ? d.accentText : "#7a6da0",
                          opacity: isSelected ? 0.85 : 1,
                        }}
                      >
                        {d.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: d.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#0a0812",
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Topic hint */}
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#5a4a80",
                textAlign: "center",
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              We&rsquo;ll find questions matching your level
            </p>
          </div>

          {/* CTA */}
          <div style={{ padding: "16px 28px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              href={`/play?sessionMode=self-directed-challenge&difficulty=${selected}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                minHeight: 60,
                background: `linear-gradient(135deg, ${chosen.accent}, ${chosen.accent}cc)`,
                color: "#0a0812",
                border: "none",
                borderRadius: 18,
                fontFamily: "'Nunito', system-ui, sans-serif",
                fontSize: 19,
                fontWeight: 900,
                cursor: "pointer",
                textDecoration: "none",
                textAlign: "center",
                letterSpacing: "0.02em",
                boxShadow: `0 8px 28px ${chosen.accent}44`,
              }}
            >
              Accept Challenge →
            </Link>
            <Link
              href="/child"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: 44,
                background: "none",
                border: "none",
                fontFamily: "'Nunito', system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(155,114,255,0.4)",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ─── PIN gate ─────────────────────────────────────────────────────────────────

type PinGateState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "authed" };

export default function ChildChallengePage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [gateState, setGateState] = useState<PinGateState>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/child/session", { method: "GET" });
        if (res.ok && !cancelled) setGateState({ status: "authed" });
      } catch {
        // no active session — show gate
      }
    }
    void checkSession();
    return () => { cancelled = true; };
  }, [router]);

  function appendDigit(d: string) {
    setPin((cur) => (cur.length >= 4 ? cur : cur + d));
  }

  function removeDigit() {
    setPin((cur) => cur.slice(0, -1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || pin.length !== 4) return;
    setGateState({ status: "submitting" });
    try {
      const res = await fetch("/api/child/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin, displayName: "", avatarKey: "", launchBandCode: "" }),
      });
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Access denied.");
      }
      setGateState({ status: "authed" });
    } catch (err) {
      setGateState({
        status: "error",
        message: err instanceof Error ? err.message : "Access denied.",
      });
      setPin("");
    }
  }

  if (gateState.status === "authed") return <ChallengeModeSetup />;

  const ready = !!username && pin.length === 4;

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 30% 0%, rgba(60,20,140,0.28) 0%, transparent 55%), #0a0812",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#f0f6ff",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            background: "#161b22",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "28px",
            padding: "36px 32px",
            width: "100%",
            maxWidth: "380px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>⚡</div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: "#f0f6ff", marginBottom: "6px" }}>
            Challenge Mode
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#8b949e",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            Enter your username and PIN to start
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "2px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#f0f6ff",
                fontFamily: "inherit",
                fontSize: "15px",
                fontWeight: 700,
                marginBottom: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {/* PIN dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: pin.length > i ? "#9b72ff" : "rgba(255,255,255,0.08)",
                    border: `2px solid ${pin.length > i ? "#9b72ff" : "rgba(255,255,255,0.12)"}`,
                    transition: "background 0.15s",
                  }}
                />
              ))}
            </div>

            {/* PIN keypad */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => appendDigit(d)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#f0f6ff",
                    fontFamily: "inherit",
                    fontSize: "20px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => appendDigit("0")}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#f0f6ff",
                  fontFamily: "inherit",
                  fontSize: "20px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                0
              </button>
              <button
                type="button"
                onClick={removeDigit}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#9b72ff",
                  fontFamily: "inherit",
                  fontSize: "18px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                ⌫
              </button>
            </div>

            {gateState.status === "error" && (
              <div
                style={{
                  background: "rgba(255,123,107,0.12)",
                  border: "1px solid #ff7b6b",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#ff7b6b",
                  marginBottom: "14px",
                }}
              >
                {gateState.message}
              </div>
            )}

            <button
              type="submit"
              disabled={!ready || gateState.status === "submitting"}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: ready ? "#9b72ff" : "rgba(255,255,255,0.06)",
                color: ready ? "#fff" : "#8b949e",
                fontFamily: "inherit",
                fontSize: "16px",
                fontWeight: 900,
                cursor: ready ? "pointer" : "default",
                transition: "background 0.2s",
              }}
            >
              {gateState.status === "submitting" ? "Checking..." : "Enter Challenge Mode ⚡"}
            </button>
          </form>

          <div style={{ marginTop: "20px" }}>
            <Link
              href="/child"
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#8b949e",
                textDecoration: "none",
              }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
