"use client";

import { useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0820",
  surface: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#2a2060",
  borderLight: "#1e1850",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#58e8c1",
  coral: "#ff7b6b",
  text: "#e8e0ff",
  muted: "#9080c0",
  mutedDark: "#6050a0",
  green: "#50e890",
  greenBg: "#1a2a15",
  greenBorder: "#50e89044",
  dangerBg: "#1e0808",
  dangerBorder: "#602020",
  dangerText: "#f09090",
  dangerMuted: "#c09090",
  quitBtn: "#602020",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

// ─── Stub session data ─────────────────────────────────────────────────────────
const SESSION = {
  starsEarned: 4,
  totalQuestions: 5,
  currentQuestion: 3,
  questName: "Story Builder",
};

type PauseView = "child" | "parent" | "quit-confirm";

export default function PlayPausePage() {
  const [view, setView] = useState<PauseView>("child");

  return (
    <AppFrame audience="kid" currentPath="/play">
      <div
        style={{
          ...FONT,
          minHeight: "100vh",
          background: C.bg,
          color: C.text,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Dimmed play content behind sheet ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "20px 16px 16px",
            gap: 14,
            filter: "brightness(0.25) blur(2px)",
            pointerEvents: "none",
          }}
        >
          {/* Topbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 4, flex: 1 }}>
              {[true, true, false, false, false].map((filled, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: filled ? C.violet : C.border,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                background: C.card,
                borderRadius: 20,
                padding: "4px 10px",
                fontSize: "0.8rem",
                fontWeight: 900,
                color: "#c0a8ff",
                marginLeft: 10,
              }}
            >
              {"\u2b50"} {SESSION.starsEarned}
            </div>
          </div>

          {/* Hero card */}
          <div
            style={{
              background: C.card,
              borderRadius: 16,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ fontSize: "2.5rem" }}>{"🐝"}</div>
            <div style={{ fontWeight: 900, color: "#b89eff" }}>
              What letter starts "bee"?
            </div>
          </div>

          {/* Choice grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: "auto",
            }}
          >
            {["B", "S", "D", "R"].map((letter) => (
              <div
                key={letter}
                style={{
                  background: C.card,
                  borderRadius: 14,
                  height: 76,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 900,
                }}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrim ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(8,5,20,0.60)",
            zIndex: 5,
          }}
        />

        {/* ── Bottom sheet ── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            borderRadius: "24px 24px 0 0",
            background: "linear-gradient(180deg, #1a1040 0%, #100b2e 100%)",
            borderTop: `2px solid ${C.violet}44`,
            boxShadow: "0 -8px 32px #00000066",
          }}
        >
          {/* Drag handle */}
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.18)",
              margin: "10px auto 0",
            }}
          />

          <div
            style={{
              padding: "14px 20px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Progress saved chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: C.greenBg,
                border: `1.5px solid ${C.greenBorder}`,
                borderRadius: 10,
                padding: "8px 12px",
              }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{"🛡"}</span>
              <span
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  color: C.green,
                  lineHeight: 1.3,
                }}
              >
                {view === "quit-confirm"
                  ? `Your ${"\u2b50"} ${SESSION.starsEarned} stars are SAFE \u2014 you\u2019ll keep them even if you leave!`
                  : `Progress saved! You\u2019ve earned ${"\u2b50"} ${SESSION.starsEarned} stars so far \u2014 they\u2019re safe!`}
              </span>
            </div>

            {/* ── Child Pause View ── */}
            {view === "child" && (
              <>
                <div
                  style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}
                >
                  Take a break?
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: C.muted,
                  }}
                >
                  Your progress is saved. You can come back any time!
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <Link href="/play/session" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        ...FONT,
                        width: "100%",
                        height: 52,
                        borderRadius: 14,
                        border: "none",
                        background:
                          "linear-gradient(135deg, #9b72ff, #7248e8)",
                        color: "#fff",
                        fontSize: "0.92rem",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {"▶"} Resume session
                    </button>
                  </Link>
                  <button
                    onClick={() => setView("quit-confirm")}
                    style={{
                      ...FONT,
                      height: 52,
                      borderRadius: 14,
                      border: `1.5px solid ${C.dangerBorder}`,
                      background: C.dangerBg,
                      color: C.dangerText,
                      fontSize: "0.92rem",
                      fontWeight: 900,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {"← Leave this session"}
                  </button>
                  <div
                    style={{
                      height: 1,
                      background: C.borderLight,
                      margin: "2px 0",
                    }}
                  />
                  <button
                    onClick={() => setView("parent")}
                    style={{
                      ...FONT,
                      height: 52,
                      borderRadius: 14,
                      border: `1.5px solid #3a3060`,
                      background: C.card,
                      color: C.muted,
                      fontSize: "0.82rem",
                      fontWeight: 900,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {"🔒 Parent access"}
                  </button>
                </div>
              </>
            )}

            {/* ── Parent Pause View ── */}
            {view === "parent" && (
              <>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <Link href="/play/session" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        ...FONT,
                        width: "100%",
                        height: 52,
                        borderRadius: 14,
                        border: "none",
                        background:
                          "linear-gradient(135deg, #9b72ff, #7248e8)",
                        color: "#fff",
                        fontSize: "0.92rem",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {"▶"} Resume session
                    </button>
                  </Link>
                  <button
                    onClick={() => setView("quit-confirm")}
                    style={{
                      ...FONT,
                      height: 52,
                      borderRadius: 14,
                      border: `1.5px solid ${C.dangerBorder}`,
                      background: C.dangerBg,
                      color: C.dangerText,
                      fontSize: "0.92rem",
                      fontWeight: 900,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {"← Leave session"}
                  </button>
                </div>

                <div
                  style={{
                    height: 1,
                    background: C.borderLight,
                    margin: "2px 0",
                  }}
                />

                {/* Parent controls section */}
                <div
                  style={{
                    background: "#0d0a20",
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: C.mutedDark,
                    }}
                  >
                    {"🔒"} Parent Controls
                  </div>
                  {[
                    { icon: "⏹", label: "End session now" },
                    { icon: "📅", label: "Adjust today\u2019s session limit" },
                    { icon: "⚙️", label: "Open parent settings" },
                    { icon: "👁", label: "View progress report" },
                  ].map(({ icon, label }) => (
                    <button
                      key={label}
                      style={{
                        ...FONT,
                        height: 44,
                        borderRadius: 10,
                        border: `1.5px solid ${C.border}`,
                        background: C.card,
                        color: C.muted,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textAlign: "left",
                        padding: "0 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setView("child")}
                  style={{
                    ...FONT,
                    height: 44,
                    borderRadius: 12,
                    border: `1.5px solid ${C.border}`,
                    background: "#1e1840",
                    color: "#c9a8ff",
                    fontSize: "0.84rem",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {"← Back"}
                </button>
              </>
            )}

            {/* ── Quit Confirm View ── */}
            {view === "quit-confirm" && (
              <>
                <div
                  style={{
                    background: C.dangerBg,
                    border: `2px solid ${C.dangerBorder}`,
                    borderRadius: 14,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.96rem",
                      fontWeight: 900,
                      color: C.dangerText,
                    }}
                  >
                    Leave this session?
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: C.dangerMuted,
                      lineHeight: 1.4,
                    }}
                  >
                    You\u2019re only on question {SESSION.currentQuestion} of{" "}
                    {SESSION.totalQuestions} \u2014 but your stars are always
                    saved!
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href="/child" style={{ flex: 1, textDecoration: "none" }}>
                      <button
                        style={{
                          ...FONT,
                          width: "100%",
                          height: 46,
                          borderRadius: 12,
                          background: C.quitBtn,
                          border: "none",
                          color: "#fff",
                          fontSize: "0.88rem",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        Leave
                      </button>
                    </Link>
                    <Link href="/play/session" style={{ flex: 1, textDecoration: "none" }}>
                      <button
                        style={{
                          ...FONT,
                          width: "100%",
                          height: 46,
                          borderRadius: 12,
                          background:
                            "linear-gradient(135deg, #9b72ff, #7248e8)",
                          border: "none",
                          color: "#fff",
                          fontSize: "0.88rem",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        Stay and play! {"🎉"}
                      </button>
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => setView("child")}
                  style={{
                    ...FONT,
                    height: 52,
                    borderRadius: 14,
                    border: `1.5px solid ${C.border}`,
                    background: "#1e1840",
                    color: "#c9a8ff",
                    fontSize: "0.92rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    marginTop: 2,
                  }}
                >
                  {"← Back to pause menu"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
