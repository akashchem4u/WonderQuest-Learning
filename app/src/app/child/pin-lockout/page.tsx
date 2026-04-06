"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

type ScreenId = "locked" | "parent" | "unlocked";

const TABS: { id: ScreenId; label: string }[] = [
  { id: "locked",   label: "Locked" },
  { id: "parent",   label: "Parent Required" },
  { id: "unlocked", label: "Unlocked" },
];

export default function PinLockoutPage() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("locked");
  const [countdown, setCountdown] = useState(45);

  // Animate countdown when locked screen is active
  useEffect(() => {
    if (activeScreen !== "locked") return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [activeScreen, countdown]);

  useEffect(() => {
    if (activeScreen === "locked") setCountdown(45);
  }, [activeScreen]);

  const violet  = "#9b72ff";
  const surface = "#100b2e";
  const border  = "#2a2060";
  const text     = "#e0d4ff";
  const muted    = "#7a6090";
  const mint     = "#50e890";

  // SVG ring: r=40 → circumference = 2π*40 ≈ 251.3
  const CIRC = 251.3;
  const ringOffset = CIRC - (countdown / 60) * CIRC;

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, minWidth: 80, padding: "8px 10px", background: active ? violet : "#1e1e3a",
    border: `2px solid ${active ? violet : "#2e2e4e"}`, borderRadius: 8,
    color: active ? "#fff" : "#aaa", fontFamily: "'Nunito', system-ui, sans-serif",
    fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center",
  });

  const ctaParent: React.CSSProperties = {
    width: "100%", padding: 14, borderRadius: 14, border: "none",
    background: "linear-gradient(135deg,#9b72ff,#7c4ddb)", color: "#fff",
    fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 16, fontWeight: 900,
    cursor: "pointer", boxShadow: "0 6px 20px rgba(155,114,255,0.4)", marginBottom: 10,
  };

  const ctaWait: React.CSSProperties = {
    width: "100%", padding: 12, borderRadius: 12, border: `2px solid ${border}`,
    background: "transparent", color: "#6a5090",
    fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer",
  };

  const StepCard = ({ title, steps, borderColor, titleColor }: { title: string; steps: string[]; borderColor?: string; titleColor?: string }) => (
    <div style={{ width: "100%", background: "#1a1060", border: `1px solid ${borderColor ?? border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: titleColor ?? violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{title}</div>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < steps.length - 1 ? `1px solid ${border}` : "none" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#2a1880", border: `2px solid ${violet}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: violet, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#c4a0ff", lineHeight: 1.4 }}>{step}</div>
        </div>
      ))}
    </div>
  );

  return (
    <AppFrame audience="kid">
      <div style={{ background: "#1a1a2e", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 40px", fontFamily: "'Nunito', system-ui, sans-serif" }}>

        {/* Tab bar */}
        <div style={{ width: "100%", maxWidth: 700, display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveScreen(t.id)} style={tabBtnStyle(activeScreen === t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Phone Frame */}
        <div style={{ width: 390, minHeight: 780, background: surface, borderRadius: 40, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 0 0 2px #2a2060" }}>
          {/* Status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px 6px", fontSize: 12, fontWeight: 700, color: violet }}>
            <span style={{ fontSize: 14, color: text, fontWeight: 900 }}>9:41</span>
            <span>WonderQuest</span>
            <span>🔋 94%</span>
          </div>

          {/* ── LOCKED ── */}
          {activeScreen === "locked" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 28px 36px", textAlign: "center" }}>
              <style>{`@keyframes lock-appear { from{transform:scale(0.3);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
              <div style={{ fontSize: 80, marginBottom: 16, animation: "lock-appear 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>🔒</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>Taking a short break!</div>
              <div style={{ fontSize: 14, color: "#b8a0a8", fontWeight: 700, marginBottom: 24, lineHeight: 1.4 }}>Too many tries — just wait a moment and then you can try again!</div>

              {/* Countdown Ring */}
              <div style={{ position: "relative", width: 100, height: 100, marginBottom: 20 }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2060" strokeWidth="6" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={violet} strokeWidth="6" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={ringOffset} style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", fontSize: 28, fontWeight: 900, color: "#fff" }}>{countdown}</div>
                <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap" }}>seconds</div>
              </div>

              <StepCard
                title="What to do now"
                steps={[
                  "Wait for the timer to finish — it won't be long!",
                  "Try your magic code again when the timer reaches zero",
                  "If you still need help, ask a parent to reset it for you",
                ]}
              />

              <button style={ctaParent}>Get a Parent to Help 💙</button>
              <button style={ctaWait}>Wait for the timer ⏳</button>
            </div>
          )}

          {/* ── PARENT REQUIRED ── */}
          {activeScreen === "parent" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 28px 36px", textAlign: "center" }}>
              <div style={{ fontSize: 80, marginBottom: 16 }}>🔐</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>Ask a parent to help!</div>
              <div style={{ fontSize: 14, color: "#b8a0a8", fontWeight: 700, marginBottom: 24, lineHeight: 1.4 }}>Your code has been locked for safety. A parent needs to reset it from their app.</div>

              <StepCard
                title="Parent steps"
                titleColor="#c4a0ff"
                borderColor="#4a30b0"
                steps={[
                  "Parent opens WonderQuest on their phone",
                  "Goes to Zara's profile → Settings → Reset PIN",
                  "Sets a new 4-digit code for Zara to use",
                ]}
              />

              <div style={{ background: "#1a1060", border: `1px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 16, textAlign: "center", width: "100%" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#b8a0e8", lineHeight: 1.5 }}>Don't worry — all your stars ⭐ and worlds are 100% safe. Nothing is lost!</div>
              </div>

              <button style={{ ...ctaParent, marginBottom: 0 }}>Okay, I'll ask a parent 💙</button>
            </div>
          )}

          {/* ── UNLOCKED ── */}
          {activeScreen === "unlocked" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 28px 36px", textAlign: "center" }}>
              <style>{`@keyframes pop { from{transform:scale(0.3);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
              <div style={{ fontSize: 72, marginBottom: 14, animation: "pop 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>🔓</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: mint, marginBottom: 6 }}>All clear, Zara!</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#b8a0e8", marginBottom: 28, lineHeight: 1.4 }}>The cooldown is over — enter your magic code to jump back in!</div>

              <div style={{ background: "#1a2a15", border: `2px solid ${mint}`, borderRadius: 14, padding: 14, marginBottom: 24, width: "100%", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>⭐</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: mint }}>All 42 stars still safe — nothing changed!</span>
              </div>

              {/* PIN dots */}
              <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                {[0,1,2,3].map((i) => (
                  <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: "#2a2060", border: `2px solid #4a30b0` }} />
                ))}
              </div>

              <button style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#50e890,#30c870)", color: "#0a2a15", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 17, fontWeight: 900, cursor: "pointer", boxShadow: "0 6px 20px rgba(80,232,144,0.35)" }}>
                Enter My Code 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
