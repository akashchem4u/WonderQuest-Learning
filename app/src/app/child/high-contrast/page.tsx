"use client";

import { useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

type TabKey = "play" | "comparison" | "focus" | "spec";

const TABS: { key: TabKey; label: string }[] = [
  { key: "play", label: "Play Screen HC" },
  { key: "comparison", label: "Component Comparison" },
  { key: "focus", label: "Focus & Keyboard" },
  { key: "spec", label: "Spec" },
];

type AnswerState = "unanswered" | "correct";

const ANSWERS = [
  { label: "A", text: "Five", correct: false },
  { label: "B", text: "Six", correct: false },
  { label: "C", text: "Seven", correct: true },
  { label: "D", text: "Eight", correct: false },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function HCPhone({ answerState }: { answerState: AnswerState }) {
  return (
    <div style={{
      width: 375, minHeight: 667,
      background: "#0a0a0a",
      border: "3px solid #555",
      borderRadius: 36,
      overflow: "hidden",
      position: "relative",
      flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{ width: 120, height: 24, background: "#222", borderRadius: "0 0 14px 14px", margin: "0 auto" }} />

      {/* HC screen */}
      <div style={{ background: "#000000", minHeight: 619, display: "flex", flexDirection: "column" }}>

        {/* Status bar */}
        <div style={{
          background: "#000000",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 16px 8px",
          borderBottom: "1px solid #333",
        }}>
          <span style={{ color: "#ffffff", fontSize: 12, fontWeight: 700 }}>9:41</span>
          <span style={{ color: "#ffffff", fontSize: 12, fontWeight: 700 }}>WonderQuest</span>
          <span style={{ color: "#ffffff", fontSize: 12, fontWeight: 700 }}>●●●</span>
        </div>

        {/* Top bar */}
        <div style={{
          background: "#000000",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "2px solid #ffffff",
        }}>
          <button style={{
            ...FONT,
            background: "#000000", border: "2px solid #ffffff", borderRadius: 6,
            color: "#ffffff", fontSize: 13, fontWeight: 700, padding: "6px 12px", cursor: "pointer",
          }}>
            ← Exit
          </button>
          <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 700 }}>Question 4 of 8</span>
          <button style={{
            ...FONT,
            background: "#000000", border: "2px solid #ffffff", borderRadius: 6,
            color: "#ffffff", fontSize: 13, fontWeight: 700, padding: "6px 12px", cursor: "pointer",
          }}>
            ⚙
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, padding: 16,
          display: "flex", flexDirection: "column", gap: 14,
          background: "#000000",
        }}>

          {/* Question card */}
          <div style={{
            background: "#0a0a0a",
            border: "2px solid #ffffff",
            borderRadius: 8,
            padding: "20px 16px 16px",
          }}>
            <span style={{
              display: "inline-block",
              background: "#000000", border: "2px solid #00ffff",
              color: "#00ffff", fontSize: 11, fontWeight: 700,
              padding: "2px 8px", borderRadius: 4,
              marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" as const,
            }}>
              Maths
            </span>
            <p style={{ color: "#ffffff", fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
              What is 3 + 4?
            </p>
            <button style={{
              ...FONT,
              display: "flex", alignItems: "center", gap: 8,
              background: "#000000", border: "2px solid #ffffff",
              borderRadius: 6, color: "#ffffff", fontSize: 13, fontWeight: 700,
              padding: "8px 14px", cursor: "pointer", width: "100%", justifyContent: "center",
            }}>
              <span style={{ fontSize: 18 }}>🔊</span>
              <span>Read aloud</span>
            </button>
          </div>

          {/* Answer buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ANSWERS.map((ans) => {
              const isCorrect = ans.correct && answerState === "correct";
              const isDimmed = !ans.correct && answerState === "correct";
              return (
                <button
                  key={ans.label}
                  style={{
                    ...FONT,
                    background: isCorrect ? "#00ff00" : "#000000",
                    border: isCorrect ? "3px solid #ffffff" : "2px solid #ffffff",
                    borderRadius: 8,
                    color: isCorrect ? "#000000" : "#ffffff",
                    fontSize: 16, fontWeight: 700,
                    minHeight: 64,
                    padding: "0 16px",
                    cursor: answerState === "unanswered" ? "pointer" : "default",
                    textAlign: "left" as const,
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%",
                    opacity: isDimmed ? 0.45 : 1,
                  }}
                >
                  <span style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28,
                    border: "2px solid currentColor",
                    borderRadius: 4,
                    fontSize: 13, fontWeight: 900, flexShrink: 0,
                  }}>
                    {ans.label}
                  </span>
                  <span>{ans.text}</span>
                </button>
              );
            })}
          </div>

          {/* Correct feedback */}
          {answerState === "correct" && (
            <>
              <div style={{
                background: "#0a0a0a", border: "2px solid #00ff00",
                borderRadius: 8, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#00ff00" }}>✓</div>
                <div>
                  <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 700 }}>✓ Yes! Correct!</div>
                  <div style={{ color: "#cccccc", fontSize: 13, fontWeight: 600, marginTop: 2 }}>3 + 4 = 7. Well done!</div>
                </div>
              </div>
              <button style={{
                ...FONT,
                background: "#ffff00", border: "2px solid #ffff00",
                borderRadius: 8, color: "#000000",
                fontSize: 16, fontWeight: 900,
                minHeight: 56, padding: "0 20px",
                cursor: "pointer", width: "100%",
              }}>
                Next Question →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* 1. Question card */}
      <CompRow title="1 — Question Card">
        <CompCell label="Standard" labelColor="#50e890">
          <div style={{ background: "linear-gradient(135deg,#161b22,#1f2937)", border: "1px solid #30363d", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "inline-block", background: "rgba(80,232,144,0.15)", color: "#50e890", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, marginBottom: 8 }}>Maths</div>
            <p style={{ color: "#f0f6ff", fontSize: 16, fontWeight: 700 }}>What is 3 + 4?</p>
          </div>
        </CompCell>
        <CompCell label="High Contrast" labelColor="#ffff00" note={<><strong style={{ color: "#00ffff" }}>21:1</strong> (#fff / #000) ✓ AAA · 2px solid #fff border</>}>
          <div style={{ background: "#0a0a0a", border: "2px solid #ffffff", borderRadius: 8, padding: 16 }}>
            <div style={{ display: "inline-block", background: "#000000", border: "2px solid #00ffff", color: "#00ffff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, marginBottom: 8, textTransform: "uppercase" as const }}>Maths</div>
            <p style={{ color: "#ffffff", fontSize: 16, fontWeight: 700 }}>What is 3 + 4?</p>
          </div>
        </CompCell>
      </CompRow>

      {/* 2. Answer button */}
      <CompRow title="2 — Answer Button (Default)">
        <CompCell label="Standard" labelColor="#50e890">
          <button style={{ ...FONT, background: "linear-gradient(135deg,#1f2937,#374151)", border: "1px solid #4b5563", borderRadius: 8, color: "#f0f6ff", fontSize: 15, fontWeight: 700, padding: "14px 16px", width: "100%", textAlign: "left" as const, minHeight: 56, cursor: "pointer" }}>Seven</button>
        </CompCell>
        <CompCell label="High Contrast" labelColor="#ffff00" note={<><strong style={{ color: "#00ffff" }}>21:1</strong> (#fff / #000) ✓ AAA</>}>
          <button style={{ ...FONT, background: "#000000", border: "2px solid #ffffff", borderRadius: 8, color: "#ffffff", fontSize: 15, fontWeight: 700, padding: "14px 16px", width: "100%", textAlign: "left" as const, minHeight: 56, cursor: "pointer" }}>Seven</button>
        </CompCell>
      </CompRow>

      {/* 3. Correct selected */}
      <CompRow title="3 — Answer Button (Correct Selected)">
        <CompCell label="Standard" labelColor="#50e890">
          <button style={{ ...FONT, background: "linear-gradient(135deg,#065f46,#047857)", border: "1px solid #50e890", borderRadius: 8, color: "#ecfdf5", fontSize: 15, fontWeight: 700, padding: "14px 16px", width: "100%", textAlign: "left" as const, minHeight: 56, cursor: "pointer" }}>✓ Seven — Correct!</button>
        </CompCell>
        <CompCell label="High Contrast" labelColor="#ffff00" note={<><strong style={{ color: "#00ffff" }}>15.3:1</strong> (#000 / #00ff00) ✓ AAA</>}>
          <button style={{ ...FONT, background: "#00ff00", border: "3px solid #ffffff", borderRadius: 8, color: "#000000", fontSize: 15, fontWeight: 700, padding: "14px 16px", width: "100%", textAlign: "left" as const, minHeight: 56, cursor: "pointer" }}>✓ Seven — Correct!</button>
        </CompCell>
      </CompRow>

      {/* 4. Stars */}
      <CompRow title="4 — Star Rating">
        <CompCell label="Standard" labelColor="#50e890">
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[true, true, true, false, false].map((filled, i) => (
              <span key={i} style={{ fontSize: 24, color: filled ? "#f59e0b" : "#374151", filter: filled ? "drop-shadow(0 0 4px #f59e0b88)" : "none" }}>★</span>
            ))}
          </div>
        </CompCell>
        <CompCell label="High Contrast" labelColor="#ffff00" note={<>Filled: <strong style={{ color: "#00ffff" }}>19.3:1</strong> (#ffff00 / #000) ✓ AAA</>}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }} aria-label="3 out of 5 stars">
            {[true, true, true, false, false].map((filled, i) => (
              <span key={i} style={{ fontSize: 24, color: filled ? "#ffff00" : "#555555", fontWeight: 900 }}>★</span>
            ))}
          </div>
        </CompCell>
      </CompRow>

      {/* 5. XP bar */}
      <CompRow title="5 — XP Progress Bar">
        <CompCell label="Standard" labelColor="#50e890">
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>XP: 650 / 1000</div>
          <div style={{ background: "#1f2937", borderRadius: 20, height: 12, overflow: "hidden", width: "100%" }}>
            <div style={{ background: "linear-gradient(90deg,#50e890,#34d399)", height: "100%", width: "65%", borderRadius: 20 }} />
          </div>
        </CompCell>
        <CompCell label="High Contrast" labelColor="#ffff00" note={<>Fill: <strong style={{ color: "#00ffff" }}>19.3:1</strong> (#ffff00 / #000) ✓ AAA</>}>
          <div style={{ fontSize: 12, color: "#ffffff", marginBottom: 6, fontWeight: 700 }}>XP: 650 / 1000</div>
          <div style={{ background: "#000000", border: "2px solid #ffffff", borderRadius: 4, height: 16, width: "100%", overflow: "hidden" }}>
            <div style={{ background: "#ffff00", height: "100%", width: "65%" }} />
          </div>
        </CompCell>
      </CompRow>

      {/* 6. Badge */}
      <CompRow title="6 — Notification Badge">
        <CompCell label="Standard" labelColor="#50e890">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(80,232,144,0.15)", border: "1px solid #50e890", borderRadius: 20, color: "#50e890", fontSize: 13, fontWeight: 700, padding: "6px 14px" }}>🎉 New badge!</div>
        </CompCell>
        <CompCell label="High Contrast" labelColor="#ffff00" note={<>Text: <strong style={{ color: "#00ffff" }}>21:1</strong> (#fff / #000) ✓ AAA</>}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#000000", border: "2px solid #ffffff", borderRadius: 4, color: "#ffffff", fontSize: 13, fontWeight: 700, padding: "6px 14px" }}>+ New badge!</div>
        </CompCell>
      </CompRow>
    </div>
  );
}

function CompRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 16 }}>{title}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>{children}</div>
    </div>
  );
}

function CompCell({ label, labelColor, note, children }: { label: string; labelColor: string; note?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: labelColor }}>{label}</div>
      {children}
      {note && <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{note}</div>}
    </div>
  );
}

function FocusTab() {
  const steps = [
    { num: 1, title: "Tab to navigate", desc: "Move focus to next interactive element. Each button/link gets a 3px yellow outline when focused.", keys: ["Tab"] },
    { num: 2, title: "Shift+Tab to go back", desc: "Move focus to previous element.", keys: ["Shift", "Tab"] },
    { num: 3, title: "Space / Enter to activate", desc: "Press the focused button or follow a link.", keys: ["Space", "Enter"] },
    { num: 4, title: "Esc to dismiss", desc: "Close modals, dismiss banners, or cancel actions.", keys: ["Esc"] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Focus ring demo */}
      <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Focus Ring — WCAG 2.4.7 Visible Focus</h3>
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 16, lineHeight: 1.5 }}>
          HC focus rule: <code style={{ color: "#ffff00", background: "#111", padding: "2px 6px", borderRadius: 4 }}>outline: 3px solid #ffff00; outline-offset: 2px</code>
        </p>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <button style={{ ...FONT, background: "#000000", border: "2px solid #ffffff", borderRadius: 6, color: "#ffffff", fontSize: 14, fontWeight: 700, padding: "10px 20px", cursor: "pointer" }}>Answer button</button>
            <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>No focus</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <button style={{ ...FONT, background: "#000000", border: "2px solid #ffffff", borderRadius: 6, color: "#ffffff", fontSize: 14, fontWeight: 700, padding: "10px 20px", outline: "3px solid #ffff00", outlineOffset: 2, cursor: "pointer" }}>Answer button</button>
            <span style={{ fontSize: 11, color: "#ffff00", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Focused</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <button style={{ ...FONT, color: "#66b3ff", fontSize: 14, fontWeight: 700, textDecoration: "underline", cursor: "pointer", background: "none", border: "none", padding: 4 }}>Learn more</button>
            <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>No focus</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <button style={{ ...FONT, color: "#66b3ff", fontSize: 14, fontWeight: 700, textDecoration: "underline", cursor: "pointer", background: "none", border: "none", padding: 4, outline: "3px solid #ffff00", outlineOffset: 2 }}>Learn more</button>
            <span style={{ fontSize: 11, color: "#ffff00", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Focused</span>
          </div>
        </div>
      </div>

      {/* Keyboard flow */}
      <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Keyboard Flow</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "12px 0",
              borderBottom: i < steps.length - 1 ? "1px solid #2a2a2a" : "none",
            }}>
              <div style={{
                width: 28, height: 28, background: "#ffff00", color: "#000000",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 900, flexShrink: 0, marginTop: 2,
              }}>
                {step.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 2 }}>
                  {step.title}
                  {step.keys.map((k) => (
                    <span key={k} style={{
                      display: "inline-block", background: "#1a1a1a", border: "1px solid #555",
                      borderBottom: "3px solid #555", borderRadius: 4, color: "#ffff00",
                      fontSize: 11, fontWeight: 700, padding: "1px 7px", fontFamily: "monospace",
                      marginLeft: 6,
                    }}>
                      {k}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpecTab() {
  const rows = [
    { section: "Colors", items: [
      { k: "Background", v: "#000000 — no gradients or translucency" },
      { k: "Text", v: "#ffffff on #000 — 21:1 contrast (WCAG AAA)" },
      { k: "Focus outline", v: "#ffff00 — 3px solid, offset 2px" },
      { k: "Correct state", v: "#00ff00 bg, #000 text — 15.3:1 ✓ AAA" },
      { k: "Subject tag", v: "#00ffff border/text on #000 — 21:1 ✓ AAA" },
      { k: "Filled stars", v: "#ffff00 on #000 — 19.3:1 ✓ AAA" },
      { k: "XP bar fill", v: "#ffff00 on #000 — 19.3:1 ✓ AAA" },
    ]},
    { section: "Components", items: [
      { k: "Answer buttons", v: "min-height 64px · 2px white border · no shadow · no glow" },
      { k: "Correct button", v: "#00ff00 bg + ✓ text label — non-colour indicator" },
      { k: "Progress bar", v: "\"Question 4 of 8\" text — no animated dots" },
      { k: "Stars", v: "★ text char · filled=#ffff00 · empty=#555" },
      { k: "Badges", v: "Square radius · 2px white border · no rounded chip" },
      { k: "Audio btn", v: "\"Read aloud\" text + icon · aria-label on button" },
    ]},
    { section: "Rules", items: [
      { k: "No animations", v: "No CSS keyframes, no transitions, no pulse effects" },
      { k: "No shadows", v: "box-shadow: none on all elements" },
      { k: "No translucency", v: "No rgba() backgrounds, no blur/backdrop-filter" },
      { k: "Hover = yellow", v: "#ffff00 bg + #000 text on hover for all buttons" },
      { k: "Focus = yellow", v: "3px #ffff00 outline overrides all component outlines" },
      { k: "aria-live", v: "Progress text: polite · Feedback: assertive" },
    ]},
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {rows.map((section) => (
        <div key={section.section} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #333" }}>
            {section.section}
          </h3>
          {section.items.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "200px 1fr", gap: 12,
              padding: "10px 0",
              borderBottom: i < section.items.length - 1 ? "1px solid #222" : "none",
            }}>
              <span style={{ color: "#9b8ec4", fontWeight: 700, fontSize: 13 }}>{row.k}</span>
              <span style={{ color: "#ddd", fontSize: 13 }}>{row.v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ChildHighContrastPage() {
  const [tab, setTab] = useState<TabKey>("play");
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
      `}</style>

      <div style={{ ...FONT, background: "#111", minHeight: "100vh", padding: "24px 16px", color: "#e8e8e8" }}>

        {/* Engineering hint */}
        <div style={{
          background: "#fffbea", border: "2px solid #f0c040", borderRadius: 8,
          padding: "12px 16px", margin: "0 auto 20px", maxWidth: 1100,
          fontFamily: "monospace", fontSize: 12, color: "#333", lineHeight: 1.6,
        }}>
          <strong style={{ color: "#b45309" }}>child-high-contrast-mode-v2</strong> — High contrast mode for child play screen. WCAG AAA = 7:1 contrast ratio for all text. Pure black backgrounds with white/yellow/cyan accents. No gradients, no translucency, no animations. All interactive elements have 3px yellow focus outlines. Stars are ★ text characters.
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, maxWidth: 1100, margin: "0 auto 20px", flexWrap: "wrap" as const }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                ...FONT,
                background: tab === t.key ? "#ffff00" : "#1e1e1e",
                border: `2px solid ${tab === t.key ? "#ffff00" : "#444"}`,
                borderRadius: 8, color: tab === t.key ? "#000" : "#aaa",
                fontSize: 13, fontWeight: 700,
                padding: "8px 18px", cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Tab 1: Play Screen */}
          {tab === "play" && (
            <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" as const }}>
              {/* Variant A */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textAlign: "center", marginBottom: 8 }}>
                  Default state — question unanswered
                </div>
                <HCPhone answerState="unanswered" />
              </div>

              {/* Variant B */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textAlign: "center", marginBottom: 8 }}>
                  Selected state —{" "}
                  <span style={{ display: "inline-block", background: "#ffff00", color: "#000", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" as const }}>
                    correct answer
                  </span>
                </div>
                <HCPhone answerState="correct" />
              </div>

              {/* Notes sidebar */}
              <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  {
                    title: "HC Design rules applied",
                    items: [
                      "Black background — no gradients",
                      "All text: white #ffffff on #000000 (21:1)",
                      "Borders: 2px solid #ffffff on all cards and buttons",
                      "No shadows, no translucency, no blur",
                      "Answer buttons: min-height 64px (easy tap)",
                      "Hover/focus: yellow inverted (#ffff00 bg, #000 text)",
                    ],
                  },
                  {
                    title: "Correct answer feedback",
                    items: [
                      "Selected button: #00ff00 background (not colour-only)",
                      "\"✓ Yes! Correct!\" large bold text indicator",
                      "aria-live=\"assertive\" announces feedback",
                      "3px white border (thicker = more visible)",
                    ],
                  },
                  {
                    title: "Progress — no dot animations",
                    text: "Replaced animated dot sequence with plain \"Question 4 of 8\" text. Wrapped in aria-live=\"polite\" region so screen readers announce transitions.",
                  },
                  {
                    title: "Audio button",
                    text: "Speaker icon alone is not accessible. HC mode shows \"Read aloud\" text alongside the icon. aria-label on the button element.",
                  },
                ].map((card, i) => (
                  <div key={i} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: 14 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#ffff00", marginBottom: 6 }}>{card.title}</h4>
                    {card.items && (
                      <ul style={{ paddingLeft: 16 }}>
                        {card.items.map((item, j) => (
                          <li key={j} style={{ fontSize: 12, color: "#ccc", lineHeight: 1.7 }}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {card.text && <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{card.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "comparison" && <ComparisonTab />}
          {tab === "focus" && <FocusTab />}
          {tab === "spec" && <SpecTab />}
        </div>

        {/* Back nav */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/child/hub" style={{
            ...FONT,
            display: "inline-block",
            background: "#1e1e1e", border: "2px solid #444",
            borderRadius: 10, color: "#aaa",
            fontSize: 13, fontWeight: 700,
            padding: "8px 20px", textDecoration: "none",
          }}>
            ← Child Hub
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
