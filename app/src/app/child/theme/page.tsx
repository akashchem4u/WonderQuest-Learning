"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type ThemeId = "cosmic" | "forest" | "ocean" | "sunset" | "candy" | "midnight";
type AccentId = "violet" | "mint" | "gold" | "coral" | "cyan" | "rose";

type ThemeOption = {
  id: ThemeId;
  label: string;
  emoji: string;
  previewBg: string;
  labelBg: string;
  labelColor: string;
  pageBg: string;
  cardBg: string;
  accentColor: string;
  textColor: string;
  connColor: string;
  headerBg: string;
  ctaGradient: string;
};

type AccentOption = {
  id: AccentId;
  color: string;
  label: string;
};

// ─── Theme and accent data ────────────────────────────────────────────────────

type SessionData = {
  student: { displayName: string; launchBandCode: string };
  progression: { totalPoints: number; currentLevel: number; badgeCount: number; trophyCount: number };
};

const THEMES: ThemeOption[] = [
  {
    id: "cosmic",
    label: "Cosmic",
    emoji: "🌌",
    previewBg: "linear-gradient(135deg, #100b2e, #1e1470)",
    labelBg: "#12103a",
    labelColor: "#c4b0ff",
    pageBg: "#100b2e",
    cardBg: "#1e1470",
    accentColor: "#9b72ff",
    textColor: "#e8e0ff",
    connColor: "#9b72ff",
    headerBg: "rgba(30,20,112,0.4)",
    ctaGradient: "linear-gradient(135deg, #9b72ff, #7c4dff)",
  },
  {
    id: "forest",
    label: "Forest",
    emoji: "🌿",
    previewBg: "linear-gradient(135deg, #0a1a0e, #1a3a1a)",
    labelBg: "#0e1a10",
    labelColor: "#90e890",
    pageBg: "#0a1a0e",
    cardBg: "#1a3a1a",
    accentColor: "#58e890",
    textColor: "#d0f0d0",
    connColor: "#58e890",
    headerBg: "rgba(26,58,26,0.6)",
    ctaGradient: "linear-gradient(135deg, #3a8a3a, #2a6a2a)",
  },
  {
    id: "ocean",
    label: "Ocean",
    emoji: "🌊",
    previewBg: "linear-gradient(135deg, #040e28, #0a1e5a)",
    labelBg: "#060e20",
    labelColor: "#58c8e8",
    pageBg: "#040e28",
    cardBg: "#0a1e5a",
    accentColor: "#58c8e8",
    textColor: "#c0e8f8",
    connColor: "#58c8e8",
    headerBg: "rgba(4,20,60,0.6)",
    ctaGradient: "linear-gradient(135deg, #1a6a8a, #0a4a6a)",
  },
  {
    id: "sunset",
    label: "Sunset",
    emoji: "🌅",
    previewBg: "linear-gradient(135deg, #1a0a08, #3a1a10)",
    labelBg: "#1a0a08",
    labelColor: "#ff8860",
    pageBg: "#1a0a08",
    cardBg: "#3a1a10",
    accentColor: "#ff8860",
    textColor: "#f8d0c0",
    connColor: "#ff8860",
    headerBg: "rgba(58,26,16,0.6)",
    ctaGradient: "linear-gradient(135deg, #cc4422, #aa2a10)",
  },
  {
    id: "candy",
    label: "Candy",
    emoji: "🍬",
    previewBg: "linear-gradient(135deg, #1a0820, #2a1040)",
    labelBg: "#160820",
    labelColor: "#ff88cc",
    pageBg: "#1a0820",
    cardBg: "#2a1040",
    accentColor: "#ff88cc",
    textColor: "#f8c8e8",
    connColor: "#ff88cc",
    headerBg: "rgba(42,16,64,0.6)",
    ctaGradient: "linear-gradient(135deg, #cc44aa, #aa2288)",
  },
  {
    id: "midnight",
    label: "Midnight",
    emoji: "🌙",
    previewBg: "linear-gradient(135deg, #08080e, #101018)",
    labelBg: "#080810",
    labelColor: "#8888cc",
    pageBg: "#08080e",
    cardBg: "#101018",
    accentColor: "#8888cc",
    textColor: "#c8c8e8",
    connColor: "#8888cc",
    headerBg: "rgba(16,16,24,0.6)",
    ctaGradient: "linear-gradient(135deg, #4444aa, #222266)",
  },
];

const ACCENTS: AccentOption[] = [
  { id: "violet", color: "#9b72ff", label: "Violet" },
  { id: "mint", color: "#58e8c1", label: "Mint" },
  { id: "gold", color: "#ffd166", label: "Gold" },
  { id: "coral", color: "#ff7b6b", label: "Coral" },
  { id: "cyan", color: "#4ad0ee", label: "Cyan" },
  { id: "rose", color: "#ff88cc", label: "Rose" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildThemePage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("cosmic");
  const [selectedAccent, setSelectedAccent] = useState<AccentId>("violet");
  const [saved, setSaved] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);
  const [hoveredAccent, setHoveredAccent] = useState<AccentId | null>(null);
  const [displayName, setDisplayName] = useState("Explorer");

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        if (data?.student?.displayName) setDisplayName(data.student.displayName);
      })
      .catch(() => {});
  }, []);

  const activeTheme = THEMES.find((t) => t.id === selectedTheme) ?? THEMES[0];

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0820",
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#e8e0ff",
          paddingBottom: 60,
        }}
      >
        {/* Back nav */}
        <div style={{ padding: "16px 24px 0" }}>
          <Link
            href="/child"
            style={{
              color: "#9b72ff",
              fontWeight: 900,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
        </div>

        {/* Page header */}
        <div style={{ padding: "20px 24px 12px" }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 4,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            {`${displayName}'s Theme 🎨`}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#9b8ec4",
              fontWeight: 700,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            Makes everything look different — just for you!
          </div>
        </div>

        {/* Desktop 2-col layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 24,
            padding: "0 24px",
            maxWidth: 1040,
            alignItems: "start",
          }}
        >
          {/* Preview pane */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: "#9b8ec4",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10,
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Live Preview
            </div>
            <div
              style={{
                background: activeTheme.pageBg,
                border: "2px solid #2a2060",
                borderRadius: 20,
                overflow: "hidden",
                minHeight: 380,
                position: "relative",
                transition: "background 0.4s ease",
              }}
            >
              {/* Preview header */}
              <div
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  background: activeTheme.headerBg,
                }}
              >
                <span style={{ fontSize: 28 }}>🦁</span>
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: activeTheme.textColor,
                      fontFamily: "'Nunito', system-ui, sans-serif",
                    }}
                  >
                    {`${displayName}'s World`}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: activeTheme.connColor,
                      opacity: 0.8,
                      fontFamily: "'Nunito', system-ui, sans-serif",
                    }}
                  >
                    🌟 18 stars · Node 7
                  </div>
                </div>
              </div>

              {/* Mock nodes */}
              <div
                style={{
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                }}
              >
                {/* Node 1 — done */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1a4a2a, #2d6b3d)",
                    border: `3px solid #50e890`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  🔤
                </div>
                <div
                  style={{
                    width: 32,
                    height: 4,
                    background: activeTheme.connColor,
                    flexShrink: 0,
                  }}
                />
                {/* Node 2 — active */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${activeTheme.cardBg}, ${activeTheme.pageBg})`,
                    border: `3px solid ${activeTheme.accentColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                    boxShadow: `0 0 12px ${activeTheme.accentColor}44`,
                  }}
                >
                  🎯
                </div>
                <div
                  style={{
                    width: 32,
                    height: 4,
                    background: "#2a2060",
                    flexShrink: 0,
                  }}
                />
                {/* Node 3 — locked */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#1a1540",
                    border: "3px solid #2a2060",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                    opacity: 0.45,
                  }}
                >
                  🌊
                </div>
              </div>

              {/* Preview quest card */}
              <div
                style={{
                  margin: "0 20px 16px",
                  background: activeTheme.cardBg,
                  border: `2px solid ${activeTheme.accentColor}`,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: activeTheme.textColor,
                    marginBottom: 4,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  Story Builder
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: activeTheme.connColor,
                    opacity: 0.7,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  Aim High · Quest 2 of 3
                </div>
              </div>

              {/* Preview CTA */}
              <div
                style={{
                  margin: "0 20px 20px",
                  background: activeTheme.ctaGradient,
                  border: "none",
                  borderRadius: 12,
                  color: activeTheme.textColor,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 900,
                  padding: 12,
                  textAlign: "center",
                }}
              >
                ▶ Continue Quest
              </div>

              {/* Preview label */}
              <div
                style={{
                  textAlign: "center",
                  paddingBottom: 16,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {activeTheme.label} Theme{selectedTheme === "cosmic" ? " (Default)" : " — Active"}
              </div>
            </div>
          </div>

          {/* Picker panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#e8e0ff",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                Choose your theme
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#9b8ec4",
                  marginTop: 2,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {selectedTheme === "cosmic"
                  ? "Makes everything look different — just for you!"
                  : `${activeTheme.label} is selected! ✓`}
              </div>
            </div>

            {/* Theme swatch grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTheme(theme.id)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedTheme(theme.id)}
                  onMouseEnter={() => setHoveredTheme(theme.id)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    border: `3px solid ${selectedTheme === theme.id ? "#fff" : "transparent"}`,
                    cursor: "pointer",
                    transform:
                      hoveredTheme === theme.id ? "scale(1.04)" : "scale(1)",
                    transition: "border-color 0.15s, transform 0.15s",
                    position: "relative",
                  }}
                >
                  {selectedTheme === theme.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        background: "rgba(255,255,255,0.9)",
                        color: "#100b2e",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        fontSize: 11,
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                        fontFamily: "'Nunito', system-ui, sans-serif",
                      }}
                    >
                      ✓
                    </div>
                  )}
                  {/* Preview area */}
                  <div
                    style={{
                      height: 60,
                      background: theme.previewBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    {theme.emoji}
                  </div>
                  {/* Label */}
                  <div
                    style={{
                      background: theme.labelBg,
                      color: theme.labelColor,
                      padding: "6px 8px",
                      fontSize: 11,
                      fontWeight: 900,
                      textAlign: "center",
                      fontFamily: "'Nunito', system-ui, sans-serif",
                    }}
                  >
                    {theme.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Accent color section */}
            <div
              style={{
                background: "#12103a",
                border: "2px solid #2a2060",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#9b8ec4",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 10,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                Accent color
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {ACCENTS.map((accent) => (
                  <div
                    key={accent.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedAccent(accent.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelectedAccent(accent.id)
                    }
                    onMouseEnter={() => setHoveredAccent(accent.id)}
                    onMouseLeave={() => setHoveredAccent(null)}
                    title={accent.label}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: accent.color,
                      cursor: "pointer",
                      border: `3px solid ${selectedAccent === accent.id ? "#fff" : "transparent"}`,
                      transform:
                        hoveredAccent === accent.id ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.15s, border-color 0.15s",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #9b72ff, #7c4dff)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontFamily: "'Nunito', system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 900,
                padding: 13,
                cursor: "pointer",
                transition: "transform 0.15s",
              }}
            >
              ✓ Save My Theme
            </button>

            {/* Save confirmation */}
            {saved && (
              <div
                style={{
                  textAlign: "center",
                  padding: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#50e890",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                🎉 Theme saved! Looks amazing!
              </div>
            )}
          </div>
        </div>

        {/* Keyframe styles */}
        <style>{`
          @keyframes node-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(155, 114, 255, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(155, 114, 255, 0); }
          }
        `}</style>
      </div>
    </AppFrame>
  );
}
