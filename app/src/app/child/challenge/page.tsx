"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Colors ──────────────────────────────────────────────────────────────────
// Base: #0d1117  Card: #161b22  Accent: #50e890  Gold: #ffd166
// Violet: #9b72ff  Mint: #58e8c1  Coral: #ff7b6b  Muted: #8b949e

// ─── Types ───────────────────────────────────────────────────────────────────

type Band = "p0" | "p1" | "p2" | "p3";
type ChallengeStatus = "available" | "started" | "completed" | "skipped" | "quiet";

type ThemeFamily = "space" | "animals" | "sports" | "arts" | "ocean" | "building";

type DailyChallenge = {
  id: string;
  name: string;
  subject: string;
  subjectEmoji: string;
  band: Band;
  xpBonus: number;
  xpLabel: string;
  mascot: string;
  themeFamily: ThemeFamily;
  status: ChallengeStatus;
};

// ─── Theme config ─────────────────────────────────────────────────────────────

const THEME_GRADIENTS: Record<ThemeFamily, string> = {
  space:    "linear-gradient(135deg, #0d0d2b 0%, #1a1060 50%, #2d0b6b 100%)",
  animals:  "linear-gradient(135deg, #0f3d1e 0%, #1a5c2e 50%, #0d3321 100%)",
  sports:   "linear-gradient(135deg, #2b0d0d 0%, #5c1a1a 50%, #7a2020 100%)",
  arts:     "linear-gradient(135deg, #2b0d2b 0%, #5c1a5c 50%, #6b1060 100%)",
  ocean:    "linear-gradient(135deg, #0d1e3d 0%, #1a3060 50%, #0d2244 100%)",
  building: "linear-gradient(135deg, #2b1a0d 0%, #5c3d1a 50%, #7a4a14 100%)",
};

const BAND_LABELS: Record<Band, string> = {
  p0: "P0 · Early Learner",
  p1: "P1 · Growing",
  p2: "P2 · Fluent",
  p3: "P3 · Advanced",
};

const BAND_COLORS: Record<Band, string> = {
  p0: "#ffd166",
  p1: "#9b72ff",
  p2: "#58e8c1",
  p3: "#ff7b6b",
};

// ─── Static prototype data ────────────────────────────────────────────────────

const TODAY_CHALLENGE: DailyChallenge = {
  id: "dc-2026-04-06",
  name: "The Star Chart Mystery",
  subject: "Math",
  subjectEmoji: "📐",
  band: "p0",
  xpBonus: 20,
  xpLabel: "Star Dust",
  mascot: "🚀",
  themeFamily: "space",
  status: "available",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getQuietHours(): boolean {
  const h = new Date().getHours();
  return h >= 0 && h < 7;
}

// ─── Challenge Launcher ───────────────────────────────────────────────────────

function DailyChallengeLauncher() {
  const challenge = TODAY_CHALLENGE;
  const [status, setStatus] = useState<ChallengeStatus>(
    getQuietHours() ? "quiet" : challenge.status
  );

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const gradient = THEME_GRADIENTS[challenge.themeFamily];
  const bandColor = BAND_COLORS[challenge.band];
  const bandLabel = BAND_LABELS[challenge.band];

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#0d1117",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#f0f6ff",
          paddingBottom: "48px",
        }}
      >
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#161b22",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Link
            href="/child"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              fontWeight: 900,
              color: "#9b72ff",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#f0f6ff" }}>
            Daily Challenge ⚡
          </div>
        </div>

        {/* ── Page content ────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "32px 20px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
          }}
        >
          {/* Eyebrow */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "4px",
              }}
            >
              Today&rsquo;s Challenge
            </div>
            <div style={{ fontSize: "13px", color: "#8b949e", fontWeight: 700 }}>
              {todayLabel}
            </div>
          </div>

          {/* ── Main challenge card ──────────────────────────────────── */}
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Gradient header */}
            <div
              style={{
                background: gradient,
                padding: "28px 24px 22px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {/* Today badge */}
              <div
                style={{
                  background: "linear-gradient(90deg, #c9a000, #ffd166)",
                  borderRadius: "20px",
                  color: "#1a1000",
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  textTransform: "uppercase",
                }}
              >
                Today&rsquo;s Challenge ⚡
              </div>

              {/* Date */}
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {todayLabel}
              </div>

              {/* Mascot */}
              <div
                style={{
                  fontSize: "64px",
                  lineHeight: 1,
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
                }}
              >
                {challenge.mascot}
              </div>

              {/* Quest name */}
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#fff",
                  textAlign: "center",
                  lineHeight: 1.25,
                }}
              >
                {challenge.name}
              </div>
            </div>

            {/* Card body */}
            <div
              style={{
                padding: "20px 24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Chips row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Subject chip */}
                <span
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "5px 12px",
                    color: "#f0f6ff",
                    whiteSpace: "nowrap",
                  }}
                >
                  {challenge.subjectEmoji} {challenge.subject}
                </span>

                {/* Band chip */}
                <span
                  style={{
                    border: `1.5px solid ${bandColor}`,
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "5px 12px",
                    color: bandColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {bandLabel}
                </span>
              </div>

              {/* XP chip — shown when available or started */}
              {(status === "available" || status === "started") && (
                <div>
                  <span
                    style={{
                      background: "rgba(80,232,144,0.12)",
                      border: "1.5px solid rgba(80,232,144,0.3)",
                      borderRadius: "20px",
                      color: "#50e890",
                      fontSize: "13px",
                      fontWeight: 800,
                      padding: "6px 14px",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                    }}
                  >
                    +{challenge.xpBonus} {challenge.xpLabel}! ✨
                  </span>
                </div>
              )}

              {/* XP earned — completed */}
              {status === "completed" && (
                <div
                  style={{
                    background: "rgba(88,232,193,0.12)",
                    border: "1.5px solid rgba(88,232,193,0.35)",
                    borderRadius: "10px",
                    color: "#58e8c1",
                    fontSize: "15px",
                    fontWeight: 800,
                    padding: "10px 16px",
                    textAlign: "center",
                  }}
                >
                  +{challenge.xpBonus} {challenge.xpLabel} earned! ✨
                </div>
              )}

              {/* ── State-based CTA area ── */}

              {/* AVAILABLE */}
              {status === "available" && (
                <>
                  <Link
                    href="/play?sessionMode=daily-challenge"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "14px 24px",
                      borderRadius: "14px",
                      background: "#50e890",
                      color: "#051a0a",
                      fontSize: "17px",
                      fontWeight: 900,
                      textDecoration: "none",
                      minHeight: "52px",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Accept Challenge! 🚀
                  </Link>
                  <Link
                    href="/child"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8b949e",
                      fontSize: "14px",
                      fontWeight: 700,
                      textDecoration: "none",
                      minHeight: "44px",
                    }}
                  >
                    Explore freely instead →
                  </Link>
                </>
              )}

              {/* STARTED */}
              {status === "started" && (
                <div
                  style={{
                    background: "rgba(255,209,102,0.1)",
                    border: "2px solid #ffd166",
                    borderRadius: "12px",
                    color: "#ffd166",
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "10px 14px",
                    textAlign: "center",
                    animation: "pulseRing 2s ease infinite",
                  }}
                >
                  🔥 Quest in progress — tap to continue!
                </div>
              )}
              {status === "started" && (
                <Link
                  href="/play?sessionMode=daily-challenge"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 24px",
                    borderRadius: "14px",
                    background: "#50e890",
                    color: "#051a0a",
                    fontSize: "17px",
                    fontWeight: 900,
                    textDecoration: "none",
                    minHeight: "52px",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  Continue Quest 🔥
                </Link>
              )}

              {/* COMPLETED */}
              {status === "completed" && (
                <>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 900,
                      color: "#f0f6ff",
                      textAlign: "center",
                    }}
                  >
                    CHALLENGE COMPLETE! 🏆
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#f0f6ff",
                      textAlign: "center",
                    }}
                  >
                    See you tomorrow! 🌟
                  </div>
                </>
              )}

              {/* SKIPPED */}
              {status === "skipped" && (
                <>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      color: "#8b949e",
                      fontSize: "14px",
                      fontWeight: 600,
                      minHeight: "48px",
                      padding: "10px 20px",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    New challenge unlocks at midnight! 🌙
                  </div>
                  <div
                    style={{
                      color: "#8b949e",
                      fontSize: "12px",
                      textAlign: "center",
                    }}
                  >
                    Challenges reset every day — a fresh start is always coming!
                  </div>
                </>
              )}

              {/* QUIET HOURS */}
              {status === "quiet" && (
                <>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 900,
                      color: "#f0f6ff",
                      textAlign: "center",
                    }}
                  >
                    Good morning! 🌅
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      color: "#8b949e",
                      fontSize: "14px",
                      fontWeight: 600,
                      minHeight: "48px",
                      padding: "10px 20px",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Available after 7 am 🌅
                  </div>
                  <div
                    style={{
                      color: "#8b949e",
                      fontSize: "12px",
                      textAlign: "center",
                    }}
                  >
                    Your challenge is ready and waiting — no rush!
                  </div>
                </>
              )}

              {/* Footer hint (available / quiet) */}
              {(status === "available" || status === "quiet") && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8b949e",
                    textAlign: "center",
                  }}
                >
                  New challenge tomorrow ✨
                </div>
              )}
            </div>
          </div>

          {/* ── Dev state switcher (prototype only) ─────────────────── */}
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 900,
                color: "#8b949e",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "12px",
              }}
            >
              Dev — Status Override
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(["available", "started", "completed", "skipped", "quiet"] as ChallengeStatus[]).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    style={{
                      background:
                        status === s ? "rgba(80,232,144,0.12)" : "rgba(255,255,255,0.05)",
                      border: `1.5px solid ${status === s ? "#50e890" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "20px",
                      color: status === s ? "#50e890" : "#8b949e",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "5px 12px",
                    }}
                  >
                    {s}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes pulseRing {
            0%   { box-shadow: 0 0 0 0   rgba(255,209,102,0.5); }
            70%  { box-shadow: 0 0 0 10px rgba(255,209,102,0); }
            100% { box-shadow: 0 0 0 0   rgba(255,209,102,0); }
          }
        `}</style>
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
  }, []);

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

  if (gateState.status === "authed") return <DailyChallengeLauncher />;

  const ready = !!username && pin.length === 4;

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#0d1117",
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
            Daily Challenge
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#8b949e",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            Enter your username and PIN to accept today&rsquo;s challenge
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
                background: ready ? "#50e890" : "rgba(255,255,255,0.06)",
                color: ready ? "#051a0a" : "#8b949e",
                fontFamily: "inherit",
                fontSize: "16px",
                fontWeight: 900,
                cursor: ready ? "pointer" : "default",
                transition: "background 0.2s",
              }}
            >
              {gateState.status === "submitting" ? "Checking..." : "See Today's Challenge ⚡"}
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
