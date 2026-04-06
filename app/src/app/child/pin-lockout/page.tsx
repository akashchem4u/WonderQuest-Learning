"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

const PIN_ATTEMPTS_KEY = "wonderquest-pin-attempts";

export default function PinLockoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSeconds = parseInt(searchParams.get("seconds") ?? "60", 10);

  const [countdown, setCountdown] = useState(initialSeconds);
  const [phase, setPhase] = useState<"locked" | "unlocked">("locked");

  // Countdown timer
  useEffect(() => {
    if (phase === "unlocked" || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // When countdown reaches 0, allow retry
  useEffect(() => {
    if (countdown <= 0 && phase === "locked") {
      setPhase("unlocked");
      if (typeof window !== "undefined") localStorage.removeItem(PIN_ATTEMPTS_KEY);
    }
  }, [countdown, phase]);

  const CIRC = 251.3;
  const ringOffset = CIRC - (countdown / Math.max(initialSeconds, 1)) * CIRC;

  // ── Palette ──────────────────────────────────────────────────────────────
  const C = {
    base: "#100b2e",
    surface: "#161b22",
    border: "rgba(255,255,255,0.08)",
    violet: "#9b72ff",
    mint: "#50e890",
    text: "#f0f6ff",
    muted: "#8b949e",
  };

  return (
    <AppFrame audience="kid">
      <div style={{
        minHeight: "100vh",
        background: C.base,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px 48px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>

          {phase === "locked" ? (
            <>
              <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>🔒</div>

              <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: "0 0 10px" }}>
                Taking a short break!
              </h1>
              <p style={{ fontSize: 15, color: C.muted, margin: "0 0 32px", lineHeight: 1.5 }}>
                Too many tries — just wait a moment and you can try again.
              </p>

              {/* Countdown ring */}
              <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 32px" }}>
                <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(155,114,255,0.15)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={C.violet}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={ringOffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -55%)",
                  fontSize: 32, fontWeight: 800, color: C.text,
                }}>
                  {countdown}
                </div>
                <div style={{
                  position: "absolute",
                  bottom: 14, left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 10, fontWeight: 700, color: C.muted,
                  textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap",
                }}>
                  seconds left
                </div>
              </div>

              {/* Info card */}
              <div style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "16px 20px",
                marginBottom: 20,
                textAlign: "left",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>What to do now</div>
                {[
                  "Wait for the timer — it won't be long!",
                  "Try your PIN again when the timer reaches zero.",
                  "If you still need help, ask a parent to reset it.",
                ].map((step, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "7px 0",
                    borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "rgba(155,114,255,0.12)",
                      border: "1.5px solid rgba(155,114,255,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: C.violet, flexShrink: 0,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{step}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/parent")}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
                  color: "#fff", fontSize: 16, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(155,114,255,0.35)",
                }}
              >
                Get a Parent to Help 💙
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 80, marginBottom: 16 }}>🔓</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: C.mint, margin: "0 0 10px" }}>
                All clear! Try again 🎉
              </h1>
              <p style={{ fontSize: 15, color: C.muted, margin: "0 0 28px", lineHeight: 1.5 }}>
                The cooldown is over — enter your name and PIN to jump back in!
              </p>

              <div style={{
                background: "rgba(80,232,144,0.08)",
                border: "1.5px solid rgba(80,232,144,0.25)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 28,
                fontSize: 13, color: C.mint, fontWeight: 600,
              }}>
                ⭐ All your stars and progress are safe — nothing changed!
              </div>

              <button
                onClick={() => router.push("/child")}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #50e890, #30c870)",
                  color: "#0a2a15", fontSize: 16, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(80,232,144,0.35)",
                }}
              >
                Enter My PIN 🚀
              </button>
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
