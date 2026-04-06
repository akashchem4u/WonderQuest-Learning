"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

type TabId = "k1-first" | "k1-reviewing" | "prek" | "g23-g45" | "spec";

const TABS: { id: TabId; label: string }[] = [
  { id: "k1-first", label: "K-1 First Time" },
  { id: "k1-reviewing", label: "K-1 Reviewing" },
  { id: "prek", label: "Pre-K Variant" },
  { id: "g23-g45", label: "G2-3 / G4-5" },
  { id: "spec", label: "Spec" },
];

// ── Shared sub-components ────────────────────────────────────────────────────

function DragHandle() {
  return (
    <div
      style={{
        width: 36,
        height: 4,
        borderRadius: 2,
        background: "rgba(255,255,255,0.18)",
        margin: "10px auto 0",
        flexShrink: 0,
      }}
    />
  );
}

function TopBar({
  filledCount = 1,
  total = 5,
  stars = 4,
  accentColor = "#9b72ff",
  starColor = "#c0a8ff",
  starBorderColor = "#9b72ff55",
}: {
  filledCount?: number;
  total?: number;
  stars?: number;
  accentColor?: string;
  starColor?: string;
  starBorderColor?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: i < filledCount ? accentColor : "#2a2050",
            }}
          />
        ))}
      </div>
      <div
        style={{
          background: "#1a1440",
          border: `1.5px solid ${starBorderColor}`,
          borderRadius: 20,
          padding: "4px 10px",
          fontSize: "0.8rem",
          fontWeight: 900,
          color: starColor,
          marginLeft: 10,
        }}
      >
        ⭐ {stars}
      </div>
    </div>
  );
}

// ── Tab 1 — K-1 First Time ───────────────────────────────────────────────────

function K1FirstTimePhone() {
  return (
    <div
      style={{
        width: 390,
        height: 700,
        borderRadius: 40,
        background: "#100b2e",
        border: "2.5px solid #2a1f60",
        boxShadow: "0 0 0 1px #9b72ff22, 0 24px 48px #00000088",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Question area (behind scrim) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px 16px",
          gap: 16,
        }}
      >
        <TopBar filledCount={1} stars={4} />

        <div
          style={{
            background: "#1a1440",
            border: "2px solid #9b72ff44",
            borderRadius: 16,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div style={{ fontSize: "3rem" }}>🐝</div>
          <div style={{ fontSize: "1rem", fontWeight: 900, color: "#b89eff" }}>What letter does</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff" }}>&ldquo;bee&rdquo;</div>
          <div style={{ fontSize: "1rem", fontWeight: 900, color: "#b89eff" }}>start with?</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: "auto",
          }}
        >
          {[
            { letter: "B", phoneme: "buh" },
            { letter: "S", phoneme: "sss" },
            { letter: "D", phoneme: "duh" },
            { letter: "R", phoneme: "rrr" },
          ].map(({ letter, phoneme }) => (
            <div
              key={letter}
              style={{
                background: "#1a1440",
                border: "2px solid #2a1f60",
                borderRadius: 14,
                height: 80,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                fontSize: "2.2rem",
                fontWeight: 900,
                color: "#e8e0ff",
              }}
            >
              {letter}
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9080c0" }}>{phoneme}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrim */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(8,5,20,0.55)",
          backdropFilter: "blur(1.5px)",
          zIndex: 5,
        }}
      />

      {/* Full Explainer Sheet — Violet */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: "24px 24px 0 0",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "linear-gradient(180deg, #1a1040 0%, #100b2e 100%)",
          borderTop: "2px solid #9b72ff55",
          boxShadow: "0 -8px 32px #00000066",
        }}
      >
        <DragHandle />
        <div
          style={{
            padding: "16px 20px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.6,
              color: "#9b72ff",
            }}
          >
            ✨ New Question Type
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            Beginning Sounds
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.5 }}>
            Listen to the word, then find the letter it starts with!
          </div>

          {/* Example card */}
          <div
            style={{
              background: "#221960",
              border: "1.5px solid #9b72ff44",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: "2.4rem", flexShrink: 0 }}>🐱</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  opacity: 0.55,
                  color: "#e8e0ff",
                }}
              >
                Example
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>&ldquo;cat&rdquo;</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.4, color: "#b89eff" }}>
                Starts with <strong>C</strong> — you hear &ldquo;cuh&rdquo; at the beginning!
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "🔊 Listen to the word (or read it)",
              "Say it slowly — what sound do you hear first?",
              "Tap the letter that makes that sound!",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: 1,
                    background: "#9b72ff",
                    color: "#fff",
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#c8bef0",
                    lineHeight: 1.4,
                    paddingTop: 2,
                  }}
                >
                  {text}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginTop: 4,
            }}
          >
            <button
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#6050a0",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 2px",
                textDecoration: "underline",
                textUnderlineOffset: 2,
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Skip
            </button>
            <button
              style={{
                flex: 1,
                height: 52,
                borderRadius: 26,
                border: "none",
                fontSize: "1rem",
                fontWeight: 900,
                cursor: "pointer",
                background: "linear-gradient(135deg, #9b72ff, #7248e8)",
                color: "#fff",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Got it! Let&apos;s go →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2 — K-1 Reviewing ────────────────────────────────────────────────────

function K1ReviewingPhone() {
  return (
    <div
      style={{
        width: 390,
        height: 700,
        borderRadius: 40,
        background: "#100b2e",
        border: "2.5px solid #2a1f60",
        boxShadow: "0 0 0 1px #9b72ff22, 0 24px 48px #00000088",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Question area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px 16px",
          gap: 16,
        }}
      >
        <TopBar filledCount={2} stars={7} />

        <div
          style={{
            background: "#1a1440",
            border: "2px solid #9b72ff44",
            borderRadius: 16,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div style={{ fontSize: "3rem" }}>🐸</div>
          <div style={{ fontSize: "1rem", fontWeight: 900, color: "#b89eff" }}>What letter does</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff" }}>&ldquo;frog&rdquo;</div>
          <div style={{ fontSize: "1rem", fontWeight: 900, color: "#b89eff" }}>start with?</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "auto" }}>
          {[
            { letter: "F", phoneme: "fff" },
            { letter: "T", phoneme: "tuh" },
            { letter: "G", phoneme: "guh" },
            { letter: "P", phoneme: "puh" },
          ].map(({ letter, phoneme }) => (
            <div
              key={letter}
              style={{
                background: "#1a1440",
                border: "2px solid #2a1f60",
                borderRadius: 14,
                height: 80,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                fontSize: "2.2rem",
                fontWeight: 900,
                color: "#e8e0ff",
              }}
            >
              {letter}
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9080c0" }}>{phoneme}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lighter scrim for reviewing */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(8,5,20,0.30)",
          zIndex: 5,
        }}
      />

      {/* Abbreviated mini-sheet */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: "20px 20px 0 0",
          zIndex: 10,
          background: "#1a1040",
          borderTop: "1.5px solid #9b72ff44",
          boxShadow: "0 -6px 24px #00000055",
          padding: "12px 20px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.15)",
            margin: "0 auto 2px",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: "2rem", flexShrink: 0 }}>🔤</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#b89eff", lineHeight: 1.4 }}>
            <strong style={{ color: "#fff" }}>Beginning Sounds</strong> — say the word slowly and tap the first letter you hear!
          </div>
        </div>
        <button
          style={{
            height: 48,
            borderRadius: 24,
            border: "none",
            fontSize: "0.95rem",
            fontWeight: 900,
            cursor: "pointer",
            background: "linear-gradient(135deg, #9b72ff, #7248e8)",
            color: "#fff",
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          Got it! →
        </button>
      </div>
    </div>
  );
}

// ── Tab 3 — Pre-K Variant ────────────────────────────────────────────────────

function PreKPhone() {
  return (
    <div
      style={{
        width: 390,
        height: 700,
        borderRadius: 40,
        background: "#100b2e",
        border: "2.5px solid #2a1f60",
        boxShadow: "0 0 0 1px #9b72ff22, 0 24px 48px #00000088",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Question area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px 16px",
          gap: 16,
        }}
      >
        <TopBar
          filledCount={1}
          stars={2}
          accentColor="#ffd166"
          starColor="#ffe08a"
          starBorderColor="#ffd16655"
        />

        <div
          style={{
            borderRadius: 16,
            border: "2px solid #ffd16644",
            background: "#1e1200",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: 20,
            marginTop: 8,
          }}
        >
          <div style={{ fontSize: "4rem" }}>⭕</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#ffe08a" }}>Find the circle!</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          {/* Circle */}
          <div
            style={{
              background: "#1e1200",
              border: "2px solid #3a2400",
              borderRadius: 14,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#ffd166" strokeWidth="3" />
            </svg>
          </div>
          {/* Triangle */}
          <div
            style={{
              background: "#1e1200",
              border: "2px solid #3a2400",
              borderRadius: 14,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44">
              <polygon points="22,4 40,38 4,38" fill="none" stroke="#9080c0" strokeWidth="3" />
            </svg>
          </div>
          {/* Square */}
          <div
            style={{
              background: "#1e1200",
              border: "2px solid #3a2400",
              borderRadius: 14,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44">
              <rect x="5" y="5" width="34" height="34" fill="none" stroke="#9080c0" strokeWidth="3" rx="3" />
            </svg>
          </div>
          {/* Star */}
          <div
            style={{
              background: "#1e1200",
              border: "2px solid #3a2400",
              borderRadius: 14,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44">
              <polygon
                points="22,2 27,17 43,17 30,27 35,42 22,32 9,42 14,27 1,17 17,17"
                fill="none"
                stroke="#9080c0"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Scrim */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(8,4,0,0.5)",
          zIndex: 5,
        }}
      />

      {/* Full Explainer Sheet — Gold */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: "24px 24px 0 0",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "linear-gradient(180deg, #1e1400 0%, #100b2e 100%)",
          borderTop: "2px solid #ffd16655",
          boxShadow: "0 -8px 32px #00000066",
        }}
      >
        <DragHandle />
        <div style={{ padding: "16px 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.6,
              color: "#ffd166",
            }}
          >
            🌟 Something new!
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            Finding Shapes
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffe8a0", lineHeight: 1.5 }}>
            Look at the big shape, then find the one that matches!
          </div>

          {/* Example card */}
          <div
            style={{
              background: "#2a1800",
              border: "1.5px solid #ffd16644",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: "2.4rem", flexShrink: 0 }}>🔺</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  opacity: 0.55,
                  color: "#e8e0ff",
                }}
              >
                Example
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>Triangle</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.4, color: "#ffdd88" }}>
                Three pointy sides — like a mountain!
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "👀 Look at the shape at the top",
              "Find the one that looks the same!",
              "Tap it! ✨",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: 1,
                    background: "#ffd166",
                    color: "#1a0c00",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c8bef0", lineHeight: 1.4, paddingTop: 2 }}>
                  {text}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginTop: 4,
            }}
          >
            <button
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#6a5000",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 2px",
                textDecoration: "underline",
                textUnderlineOffset: 2,
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Skip
            </button>
            <button
              style={{
                flex: 1,
                height: 52,
                borderRadius: 26,
                border: "none",
                fontSize: "1rem",
                fontWeight: 900,
                cursor: "pointer",
                background: "linear-gradient(135deg, #ffd166, #f0a000)",
                color: "#1a0c00",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Got it! Let&apos;s go →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4 — G2-3 / G4-5 ─────────────────────────────────────────────────────

function G23Phone() {
  return (
    <div
      style={{
        width: 330,
        height: 620,
        borderRadius: 32,
        background: "#100b2e",
        border: "2.5px solid #2a1f60",
        boxShadow: "0 0 0 1px #9b72ff22, 0 24px 48px #00000088",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Question area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px 16px",
          gap: 16,
        }}
      >
        <TopBar filledCount={2} stars={11} accentColor="#58e8c1" starColor="#7af0d0" starBorderColor="#58e8c144" />

        <div
          style={{
            background: "#0d1e18",
            border: "2px solid #58e8c144",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "#7af0d0" }}>3 × 4 = ?</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "auto" }}>
          {["9", "12", "15", "7"].map((n) => (
            <div
              key={n}
              style={{
                background: "#0d1e18",
                border: "1.5px solid #1a3028",
                borderRadius: 14,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: 900,
                color: "#e8e0ff",
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Scrim */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(2,10,8,0.5)",
          zIndex: 5,
        }}
      />

      {/* Mint explainer sheet */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: "20px 20px 0 0",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "linear-gradient(180deg, #0a1e1a 0%, #100b2e 100%)",
          borderTop: "2px solid #58e8c155",
          boxShadow: "0 -8px 32px #00000066",
        }}
      >
        <DragHandle />
        <div style={{ padding: "16px 20px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6, color: "#58e8c1" }}>
            ✨ New Question Type
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>Multiplication</div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#a0e8d8", lineHeight: 1.5 }}>
            Think of groups — 3 × 4 means 3 groups of 4!
          </div>

          <div
            style={{
              background: "#0d2820",
              border: "1.5px solid #58e8c144",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: "2.4rem", flexShrink: 0 }}>🍎</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.55, color: "#e8e0ff" }}>
                Try it
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>2 × 3 = ?</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.4, color: "#7af0d0" }}>
                2 groups of 3 = 🍎🍎🍎 + 🍎🍎🍎 = 6
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Picture the groups in your head",
              "Count them up (or skip-count!)",
              "Tap the total!",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: 1,
                    background: "#58e8c1",
                    color: "#051a14",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c8bef0", lineHeight: 1.4, paddingTop: 2 }}>
                  {text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
            <button
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#6050a0",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 2px",
                textDecoration: "underline",
                textUnderlineOffset: 2,
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Skip
            </button>
            <button
              style={{
                flex: 1,
                height: 52,
                borderRadius: 26,
                border: "none",
                fontSize: "1rem",
                fontWeight: 900,
                cursor: "pointer",
                background: "linear-gradient(135deg, #58e8c1, #30b090)",
                color: "#051a14",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Got it! →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function G45Phone() {
  return (
    <div
      style={{
        width: 330,
        height: 620,
        borderRadius: 32,
        background: "#100b2e",
        border: "2.5px solid #2a1f60",
        boxShadow: "0 0 0 1px #9b72ff22, 0 24px 48px #00000088",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Question area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px 16px",
          gap: 12,
        }}
      >
        <TopBar filledCount={3} stars={18} accentColor="#ff7b6b" starColor="#ffa090" starBorderColor="#ff7b6b44" />

        <div
          style={{
            background: "#1e0e08",
            border: "2px solid #ff7b6b44",
            borderRadius: 14,
            padding: 16,
            fontSize: "0.95rem",
            textAlign: "left",
            lineHeight: 1.5,
            color: "#ffa090",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 900, color: "#ff7b6b", marginBottom: 6, letterSpacing: "0.05em" }}>
            📖 PASSAGE
          </div>
          Maya walked slowly to school, her backpack dragging. She stared at her shoes the whole way.
        </div>

        <div style={{ fontSize: "0.82rem", fontWeight: 900, color: "#ffa090", padding: "0 2px" }}>
          🔍 How does Maya feel?
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
          {[
            "A) Excited and happy",
            "B) Tired or sad",
            "C) Scared and running late",
          ].map((choice) => (
            <div
              key={choice}
              style={{
                background: "#1e0e08",
                border: "1.5px solid #3a1408",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#e8e0ff",
              }}
            >
              {choice}
            </div>
          ))}
        </div>
      </div>

      {/* Scrim */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(12,3,0,0.5)",
          zIndex: 5,
        }}
      />

      {/* Coral explainer sheet */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: "20px 20px 0 0",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "linear-gradient(180deg, #1e0e0a 0%, #100b2e 100%)",
          borderTop: "2px solid #ff7b6b55",
          boxShadow: "0 -8px 32px #00000066",
        }}
      >
        <DragHandle />
        <div style={{ padding: "16px 20px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6, color: "#ff7b6b" }}>
            ✨ New Question Type
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>Inference Questions</div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f0b0a0", lineHeight: 1.5 }}>
            The answer isn&apos;t in the words — you have to figure it out from clues!
          </div>

          <div
            style={{
              background: "#2a1008",
              border: "1.5px solid #ff7b6b44",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: "2.4rem", flexShrink: 0 }}>🔍</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.55, color: "#e8e0ff" }}>
                Detective thinking
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
                Read the clues, then decide what must be true
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.4, color: "#ffa090" }}>
                &ldquo;Dragging backpack + staring at shoes&rdquo; → probably sad!
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Read carefully — look for feeling clues",
              'Ask yourself: "What does this tell me?"',
              "Tap the answer that fits the clues!",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: 1,
                    background: "#ff7b6b",
                    color: "#1a0500",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c8bef0", lineHeight: 1.4, paddingTop: 2 }}>
                  {text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
            <button
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#6050a0",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 2px",
                textDecoration: "underline",
                textUnderlineOffset: 2,
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Skip
            </button>
            <button
              style={{
                flex: 1,
                height: 52,
                borderRadius: 26,
                border: "none",
                fontSize: "1rem",
                fontWeight: 900,
                cursor: "pointer",
                background: "linear-gradient(135deg, #ff7b6b, #d04a38)",
                color: "#fff",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Got it! →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 5 — Spec ─────────────────────────────────────────────────────────────

function SpecTab() {
  const specCards = [
    {
      title: "Trigger Logic",
      items: [
        { type: "do", text: "Show full panel on first-ever encounter of a question type" },
        { type: "do", text: "Show abbreviated panel on encounters 2–3" },
        { type: "do", text: "Stop showing entirely after encounter 4+" },
        { type: "do", text: "Track per child × per question-type (not global)" },
        { type: "dont", text: "Never show explainer mid-session (only before question 1 of a type)" },
        { type: "dont", text: "Never auto-advance — child must tap CTA or Skip" },
      ],
    },
    {
      title: "Layout Rules",
      items: [
        { type: "neutral", text: "Full sheet: ~55–65% of phone frame height" },
        { type: "neutral", text: "Abbreviated sheet: ~22–28% of phone frame height" },
        { type: "neutral", text: "Always has drag handle (::before 36px bar)" },
        { type: "neutral", text: "Content above sheet is dimmed with scrim overlay" },
        { type: "neutral", text: "Full sheet has Skip link; abbreviated sheet has no Skip" },
        { type: "neutral", text: "Sheet always position: absolute; bottom: 0" },
      ],
    },
    {
      title: "Band Color Tokens",
      items: [
        { type: "neutral", text: "Pre-K: gold #ffd166 border-top, dark #1e1400 bg" },
        { type: "neutral", text: "K-1: violet #9b72ff border-top, dark #1a1040 bg" },
        { type: "neutral", text: "G2-3: mint #58e8c1 border-top, dark #0a1e1a bg" },
        { type: "neutral", text: "G4-5: coral #ff7b6b border-top, dark #1e0e0a bg" },
        { type: "neutral", text: "Step number circles: filled with band color" },
        { type: "neutral", text: "CTA button: linear-gradient from band color → darker shade" },
      ],
    },
    {
      title: "Content Guidelines",
      items: [
        { type: "neutral", text: "Pre-K: ≤2-word steps (Look / Find / Tap)" },
        { type: "neutral", text: "K-1: short action sentences, sound-it-out language" },
        { type: "neutral", text: 'G2-3: math framing ("groups of"), skip-count hint' },
        { type: "neutral", text: 'G4-5: inference framing, "detective thinking" metaphor' },
        { type: "dont", text: 'Never say "If you get it wrong…"' },
        { type: "dont", text: "Never mention scoring/accuracy in panel" },
      ],
    },
    {
      title: "Abbreviated Panel Rules",
      items: [
        { type: "neutral", text: "Single row: icon + 1 sentence (≤12 words)" },
        { type: "neutral", text: "No steps, no example card" },
        { type: "neutral", text: "Scrim opacity: 0.30 (lighter than full = 0.55)" },
        { type: "neutral", text: 'Got it! → no "Let\'s go" suffix (brevity)' },
        { type: "neutral", text: "No Skip link (short enough to not need escape)" },
        { type: "neutral", text: "Same band color border-top and CTA gradient" },
      ],
    },
    {
      title: "Accessibility / UX",
      items: [
        { type: "neutral", text: "CTA button: min height 52px (touch target)" },
        { type: "neutral", text: "Skip link: min tap area 44px (add padding)" },
        { type: "neutral", text: "Sheet: border-radius: 24px 24px 0 0" },
        { type: "neutral", text: "Drag handle: cosmetic only — no swipe-dismiss in v3" },
        { type: "neutral", text: "No animation on sheet entry in this file (shown static)" },
        { type: "neutral", text: "Sheet slide-up: translateY(100%) → 0, 0.3s ease-out" },
      ],
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        maxWidth: 760,
        width: "100%",
      }}
    >
      {specCards.map((card) => (
        <div
          key={card.title}
          style={{
            background: "#fffbea",
            border: "2px solid #f0c040",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#3a2800",
            lineHeight: 1.6,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: "0.8rem", marginBottom: 6, color: "#7a4800", fontWeight: 900 }}>
            {card.title}
          </div>
          <ul style={{ paddingLeft: 14, margin: 0 }}>
            {card.items.map((item, i) => (
              <li
                key={i}
                style={{
                  marginBottom: 3,
                  color:
                    item.type === "do"
                      ? "#1a6030"
                      : item.type === "dont"
                      ? "#8a1010"
                      : "#3a2800",
                }}
              >
                {item.type === "do" ? "✅ " : item.type === "dont" ? "❌ " : ""}
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PlayExplainerPage() {
  const [activeTab, setActiveTab] = useState<TabId>("k1-first");

  return (
    <AppFrame audience="kid" currentPath="/play">
      <div
        style={{
          fontFamily: "'Nunito', system-ui, sans-serif",
          background: "#100b2e",
          color: "#e8e0ff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 16px 48px",
          gap: 20,
        }}
      >
        {/* Page title */}
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 900,
            color: "#6050a0",
            letterSpacing: "0.04em",
            margin: 0,
          }}
        >
          play-explainer-panel-v3 · WonderQuest Design System
        </p>

        {/* Dev state-switcher tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `1.5px solid ${activeTab === tab.id ? "#9b72ff" : "#2a2050"}`,
                background: activeTab === tab.id ? "#9b72ff" : "#14102a",
                color: activeTab === tab.id ? "#fff" : "#9080c0",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Nunito', system-ui, sans-serif",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "k1-first" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div
              style={{
                background: "#fffbea",
                border: "2px solid #f0c040",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#3a2800",
                lineHeight: 1.6,
                maxWidth: 390,
                width: "100%",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 900 }}>
                K-1 First Time — Full Explainer Sheet
              </div>
              First encounter with this question type. Full 3-step how-to shown. Sheet occupies ~60% of frame height.
              Content above dimmed with scrim. Child must tap &ldquo;Got it! Let&apos;s go →&rdquo; or &ldquo;Skip&rdquo; — never auto-advances.
            </div>
            <K1FirstTimePhone />
          </div>
        )}

        {activeTab === "k1-reviewing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div
              style={{
                background: "#fffbea",
                border: "2px solid #f0c040",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#3a2800",
                lineHeight: 1.6,
                maxWidth: 390,
                width: "100%",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 900 }}>
                K-1 Reviewing — Abbreviated Sheet
              </div>
              Child has seen this question type before (≥1 prior session). Single-row reminder: icon + 1 short sentence.
              Smaller sheet (~25% height). Same &ldquo;Got it!&rdquo; CTA; no Skip needed. Appears for ≤3 sessions, then stops showing entirely.
            </div>
            <K1ReviewingPhone />
          </div>
        )}

        {activeTab === "prek" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div
              style={{
                background: "#fffbea",
                border: "2px solid #f0c040",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#3a2800",
                lineHeight: 1.6,
                maxWidth: 390,
                width: "100%",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 900 }}>
                Pre-K Variant — Gold Theme, Simpler Language
              </div>
              Pre-K explainer uses shorter sentences, bigger emoji, fewer steps. &ldquo;New type&rdquo; label becomes &ldquo;🌟 Something new!&rdquo;
              Steps use simple action verbs only (Look / Find / Tap).
            </div>
            <PreKPhone />
          </div>
        )}

        {activeTab === "g23-g45" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <div
              style={{
                background: "#fffbea",
                border: "2px solid #f0c040",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#3a2800",
                lineHeight: 1.6,
                maxWidth: 760,
                width: "100%",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 900 }}>
                G2-3 Mint · G4-5 Coral — Band Variants
              </div>
              G2-3: math explainer (multiplication / skip-count). Mint theme. G4-5: reading explainer (inference questions).
              Coral theme. Both use same sheet structure — only color tokens + content change.
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#58e8c1" }}>
                  G2-3 Mint · Multiplication
                </div>
                <G23Phone />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ff7b6b" }}>
                  G4-5 Coral · Inference
                </div>
                <G45Phone />
              </div>
            </div>
          </div>
        )}

        {activeTab === "spec" && <SpecTab />}

        {/* Back navigation */}
        <div style={{ marginTop: 24 }}>
          <Link
            href="/play"
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#9b72ff",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: 20,
              border: "1.5px solid #9b72ff44",
              background: "#1a1040",
            }}
          >
            ← Back to Play
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
