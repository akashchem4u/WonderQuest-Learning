"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  violetDim: "rgba(155,114,255,0.14)",
  violetBorder: "rgba(155,114,255,0.28)",
  blue: "#38bdf8",
  mint: "#22c55e",
  mintDim: "rgba(34,197,94,0.12)",
  gold: "#ffd166",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.10)",
  text: "#f0f6ff",
  muted: "#8b949e",
  faint: "rgba(255,255,255,0.08)",
} as const;

type Scenario = "a" | "b" | "c";

export default function WrongChildPage() {
  const [scenario, setScenario] = useState<Scenario>("a");

  const tabs: { id: Scenario; label: string }[] = [
    { id: "a", label: "No Sessions Yet" },
    { id: "b", label: "Sessions Exist" },
    { id: "c", label: "Device Swap" },
  ];

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        {/* Page header */}
        <div style={{ marginBottom: 24, maxWidth: 720 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>Update Linked Child</div>
          <div style={{ fontSize: 14, color: C.muted }}>Something doesn't look right? No problem — let's sort it out.</div>
        </div>

        {/* Scenario tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", maxWidth: 720 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setScenario(t.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: scenario === t.id ? `1.5px solid ${C.violet}` : `1.5px solid ${C.border}`,
                background: scenario === t.id ? C.violetDim : C.surfaceAlt,
                color: scenario === t.id ? C.violet : C.muted,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui",
                transition: "all .15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Scenario A: No Sessions ───────────────────────────────── */}
        {scenario === "a" && (
          <div style={{ maxWidth: 480 }}>
            {/* Info banner */}
            <div style={{ background: C.amberDim, borderLeft: `4px solid ${C.amber}`, borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#fbbf24", lineHeight: 1.55 }}>
              <strong style={{ color: C.gold }}>It looks like this might not be the right profile.</strong> You can update it below — Liam's data (if any) will be saved.
            </div>

            {/* Card */}
            <div style={{ background: C.surface, borderRadius: 16, padding: 22, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted, marginBottom: 14 }}>Currently linked</div>

              {/* Child row */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.violetDim, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#9b72ff,#6040cc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🐻</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Liam</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Grade K–1 · Violet Band</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.violetDim, border: `1px solid ${C.violetBorder}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: C.violet, marginTop: 5 }}>🟣 Level 2</div>
                </div>
              </div>

              <div style={{ height: 1, background: C.border, marginBottom: 16 }} />

              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>No sessions played yet. This is a good time to update the profile before any progress is recorded.</div>

              <button style={{ width: "100%", padding: "13px 16px", background: C.violet, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8, fontFamily: "system-ui" }}>
                ✏️ Update to correct child
              </button>
              <button style={{ width: "100%", padding: "12px 16px", background: C.faint, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
                Keep Liam — this is correct
              </button>
            </div>

            {/* What happens card */}
            <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>What happens when you update?</div>
              {[
                "No sessions yet — clean switch, nothing is lost",
                "Liam's profile is saved and can be re-linked later",
                "You'll be taken to the child setup form to enter the correct details",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                  <span style={{ color: C.mint, flexShrink: 0 }}>✅</span>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", fontSize: 13, color: C.violet, fontWeight: 600, cursor: "pointer" }}>💬 Contact support if you need help</div>
          </div>
        )}

        {/* ── Scenario B: Sessions Exist ────────────────────────────── */}
        {scenario === "b" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: C.amberDim, borderLeft: `4px solid ${C.amber}`, borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#fbbf24", lineHeight: 1.55 }}>
              <strong style={{ color: C.gold }}>Sessions have already been recorded under Liam.</strong> Switching to a different child will not transfer those sessions — they'll stay on Liam's profile.
            </div>

            <div style={{ background: C.surface, borderRadius: 16, padding: 22, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted, marginBottom: 14 }}>Currently linked</div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.violetDim, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#9b72ff,#6040cc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🐻</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Liam</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Grade K–1 · Violet Band</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.violetDim, border: `1px solid ${C.violetBorder}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: C.violet, marginTop: 5 }}>🟣 Level 2 · 3 sessions</div>
                </div>
              </div>

              <div style={{ height: 1, background: C.border, marginBottom: 18 }} />

              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>What would you like to do?</div>

              <button style={{ width: "100%", padding: "13px 16px", background: C.violet, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8, fontFamily: "system-ui" }}>
                🔄 Link different child instead
              </button>
              <button style={{ width: "100%", padding: "12px 16px", background: C.violetDim, color: C.violet, border: `1px solid ${C.violetBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 8, fontFamily: "system-ui" }}>
                📋 Move Liam's sessions to correct child
              </button>
              <button style={{ width: "100%", padding: "12px 16px", background: C.faint, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
                Keep Liam — this is correct after all
              </button>
            </div>

            <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ background: C.mintDim, borderLeft: `4px solid ${C.mint}`, borderRadius: "0 10px 10px 0", padding: "12px 14px", fontSize: 13, color: "#4ade80", lineHeight: 1.55, marginBottom: 14 }}>
                🔒 <strong style={{ color: C.mint }}>Progress is never deleted.</strong> Liam's 3 sessions and stars are saved permanently and visible in your history.
              </div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>The "Move sessions" option sends a request to our support team — we'll transfer progress within 24 hours.</div>
            </div>

            <div style={{ textAlign: "center", fontSize: 13, color: C.violet, fontWeight: 600, cursor: "pointer" }}>💬 Contact support about session transfer</div>
          </div>
        )}

        {/* ── Scenario C: Device Swap ───────────────────────────────── */}
        {scenario === "c" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: C.violetDim, borderLeft: `4px solid ${C.violet}`, borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#c4b5fd", lineHeight: 1.55 }}>
              <strong style={{ color: C.violet }}>Maya is playing on a new device.</strong> Her progress is safe — you just need to re-authorise this device so her account stays linked.
            </div>

            <div style={{ background: C.surface, borderRadius: 16, padding: 22, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted, marginBottom: 14 }}>Maya's profile</div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(34,197,94,0.10)", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#58e8c1,#20b8a0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🦊</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Maya</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Grade 2–3 · Mint Band</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.mintDim, border: `1px solid rgba(34,197,94,0.28)`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: C.mint, marginTop: 5 }}>🟢 Level 4 · 12 sessions</div>
                </div>
              </div>

              <div style={{ height: 1, background: C.border, marginBottom: 16 }} />

              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>All of Maya's stars, badges, and skills will be available on this device once authorised.</div>

              <button style={{ width: "100%", padding: "13px 16px", background: C.mint, color: "#0f2d1a", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8, fontFamily: "system-ui" }}>
                ✅ Authorise this device for Maya
              </button>
              <button style={{ width: "100%", padding: "12px 16px", background: C.faint, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
                This is a different child
              </button>
            </div>

            {/* Steps card */}
            <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>After authorisation:</div>

              {/* Step dots */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: i < 2 ? C.mint : i === 2 ? C.violet : C.faint,
                    boxShadow: i === 2 ? `0 0 0 3px rgba(155,114,255,0.25)` : "none",
                  }} />
                ))}
                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginLeft: 4 }}>Step 3 of 4 — Device authorisation</span>
              </div>

              {[
                { icon: "✅", text: "Maya's profile found", active: true },
                { icon: "✅", text: "Progress synced from cloud", active: true },
                { icon: "⬤", text: "Authorise new device ← You are here", highlight: true },
                { icon: "⬜", text: "Maya starts playing on new device", dim: true },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, fontSize: 13, color: step.highlight ? C.violet : step.dim ? C.muted : C.muted, fontWeight: step.highlight ? 700 : 400, lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0 }}>{step.icon}</span>
                  {step.text}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", fontSize: 13, color: C.violet, fontWeight: 600, cursor: "pointer" }}>💬 Is this a school device? Get help</div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
