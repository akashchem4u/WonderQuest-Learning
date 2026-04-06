"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Trophy data ──────────────────────────────────────────────────────────────

type TrophyCategory = "quest" | "streak" | "world" | "special";

type Trophy = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earnCondition: string;
  category: TrophyCategory;
  earned: boolean;
  earnedDate?: string;
  isNew?: boolean;
  progress?: { current: number; total: number; color: string };
};

const ALL_TROPHIES: Trophy[] = [
  // ── Quest Trophies ──
  {
    id: "first-quest",
    emoji: "🏆",
    name: "First Trophy!",
    description: "You conquered your very first quest",
    earnCondition: "Complete 1 quest",
    category: "quest",
    earned: true,
    earnedDate: "3 days ago",
    isNew: true,
  },
  {
    id: "quest-master",
    emoji: "🥇",
    name: "Quest Master",
    description: "You've completed 10 quests — impressive!",
    earnCondition: "Complete 10 quests",
    category: "quest",
    earned: true,
    earnedDate: "Yesterday",
  },
  {
    id: "dragon-slayer",
    emoji: "🐉",
    name: "Dragon Slayer",
    description: "Defeated a legendary boss node",
    earnCondition: "Complete a boss node",
    category: "quest",
    earned: false,
    progress: { current: 3, total: 5, color: "#9b72ff" },
  },
  // ── Streak Trophies ──
  {
    id: "on-fire",
    emoji: "🔥",
    name: "On Fire!",
    description: "Quested 5 days in a row — unstoppable!",
    earnCondition: "Reach a 5-day streak",
    category: "streak",
    earned: true,
    earnedDate: "Today",
    isNew: true,
  },
  {
    id: "ten-day-streak",
    emoji: "⚡",
    name: "Lightning Streak",
    description: "10 days in a row — you're legendary!",
    earnCondition: "Quest 10 consecutive days",
    category: "streak",
    earned: false,
    progress: { current: 5, total: 10, color: "#ffd166" },
  },
  {
    id: "monthly-hero",
    emoji: "🌙",
    name: "Monthly Hero",
    description: "Quest every day for a whole month",
    earnCondition: "30-day consecutive quest streak",
    category: "streak",
    earned: false,
  },
  // ── World Trophies ──
  {
    id: "forest-champion",
    emoji: "🌲",
    name: "Forest Champion",
    description: "Conquered the entire Enchanted Forest world",
    earnCondition: "Complete Enchanted Forest",
    category: "world",
    earned: true,
    earnedDate: "5 days ago",
  },
  {
    id: "ocean-explorer",
    emoji: "🌊",
    name: "Ocean Explorer",
    description: "Dive deep into the Ocean Kingdom",
    earnCondition: "Complete Ocean Kingdom",
    category: "world",
    earned: false,
    progress: { current: 4, total: 8, color: "#58e8c1" },
  },
  {
    id: "world-champion",
    emoji: "🌍",
    name: "World Champion",
    description: "Conquer 3 different worlds",
    earnCondition: "Finish 3 worlds",
    category: "world",
    earned: false,
    progress: { current: 1, total: 3, color: "#58e8c1" },
  },
  // ── Special Trophies ──
  {
    id: "star-shower",
    emoji: "⭐",
    name: "Star Shower",
    description: "Collected 50 stars — dazzling!",
    earnCondition: "Collect 50 stars",
    category: "special",
    earned: false,
    progress: { current: 42, total: 50, color: "#ffd166" },
  },
  {
    id: "grand-champion",
    emoji: "👑",
    name: "Grand Champion",
    description: "Earn every other trophy first — you're the ultimate adventurer!",
    earnCondition: "Earn all other trophies",
    category: "special",
    earned: false,
  },
];

// ─── Visual config ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  TrophyCategory,
  {
    label: string;
    icon: string;
    accentColor: string;
    bg: string;
    borderColor: string;
    progressClass: string;
  }
> = {
  quest: {
    label: "Quest Trophies",
    icon: "⚔️",
    accentColor: "#9b72ff",
    bg: "linear-gradient(135deg, #1a1060, #2a1880)",
    borderColor: "#9b72ff",
    progressClass: "prog-violet",
  },
  streak: {
    label: "Streak Trophies",
    icon: "🔥",
    accentColor: "#ffd166",
    bg: "linear-gradient(135deg, #2a1808, #1a1060)",
    borderColor: "#ffd166",
    progressClass: "prog-gold",
  },
  world: {
    label: "World Trophies",
    icon: "🌍",
    accentColor: "#58e8c1",
    bg: "linear-gradient(135deg, #0a2a20, #1a1060)",
    borderColor: "#58e8c1",
    progressClass: "prog-mint",
  },
  special: {
    label: "Special Trophies",
    icon: "✨",
    accentColor: "#ff7b6b",
    bg: "linear-gradient(135deg, #2a1010, #1a1060)",
    borderColor: "#ff7b6b",
    progressClass: "prog-coral",
  },
};

const CATEGORIES: TrophyCategory[] = ["quest", "streak", "world", "special"];

// ─── Trophy Room (authed view) ────────────────────────────────────────────────

function TrophyRoom() {
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);

  const earnedTrophies = ALL_TROPHIES.filter((t) => t.earned);
  const lockedTrophies = ALL_TROPHIES.filter((t) => !t.earned);
  const nextTrophy =
    ALL_TROPHIES.find((t) => !t.earned && t.progress != null) ?? lockedTrophies[0];

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* ── Top bar ─────────────────────────────────────────── */}
        <div
          style={{
            background: "#0d0924",
            borderBottom: "2px solid #1e1860",
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
              fontWeight: 700,
              color: "#9b72ff",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <div style={{ width: "1px", height: "20px", background: "#2a2060" }} />
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff" }}>
            Trophy Room 🏆
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              background: "#1a0f00",
              border: "2px solid #ffd166",
              borderRadius: "12px",
              padding: "5px 14px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#ffd166",
            }}
          >
            🏆 {earnedTrophies.length} Trophies
          </div>
        </div>

        {/* ── Cosmic stars decoration ──────────────────────────── */}
        <div
          style={{
            background:
              "linear-gradient(180deg, #0d0924 0%, #100b2e 60%)",
            padding: "24px 24px 0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#7a60c0",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Your Achievement Cabinet
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#5a4080",
            }}
          >
            {earnedTrophies.length} earned · {lockedTrophies.length} still to unlock
          </div>
        </div>

        {/* ── Main layout ─────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "28px 24px",
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ── Left: trophy shelves ──────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {CATEGORIES.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const catTrophies = ALL_TROPHIES.filter((t) => t.category === cat);
              const catEarned = catTrophies.filter((t) => t.earned).length;
              const pct = Math.round((catEarned / catTrophies.length) * 100);

              return (
                <div key={cat}>
                  {/* Shelf label */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{cfg.icon}</span>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 900,
                        color: cfg.accentColor,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {cfg.label}
                    </div>
                    <div
                      style={{
                        marginLeft: "auto",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: cfg.accentColor,
                        background: `${cfg.accentColor}18`,
                        border: `1px solid ${cfg.accentColor}50`,
                        padding: "3px 10px",
                        borderRadius: "20px",
                      }}
                    >
                      {catEarned}/{catTrophies.length}
                    </div>
                  </div>

                  {/* Shelf progress bar */}
                  <div
                    style={{
                      height: "4px",
                      background: "#1e1860",
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: cfg.accentColor,
                        borderRadius: "4px",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>

                  {/* Shelf wood plank */}
                  <div
                    style={{
                      background: "#1a1245",
                      border: `2px solid ${catEarned > 0 ? cfg.borderColor + "60" : "#2a1f6e"}`,
                      borderRadius: "16px",
                      padding: "20px",
                      position: "relative",
                      boxShadow:
                        catEarned > 0
                          ? `0 0 24px ${cfg.accentColor}18`
                          : "none",
                    }}
                  >
                    {/* Shelf line */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0",
                        left: "20px",
                        right: "20px",
                        height: "3px",
                        background: `linear-gradient(90deg, transparent, ${cfg.accentColor}30, transparent)`,
                        borderRadius: "2px",
                      }}
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "14px",
                      }}
                    >
                      {catTrophies.map((trophy) => (
                        <TrophyCard
                          key={trophy.id}
                          trophy={trophy}
                          catConfig={cfg}
                          onSelect={setSelectedTrophy}
                          isSelected={selectedTrophy?.id === trophy.id}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Right rail ───────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "sticky",
              top: "24px",
            }}
          >
            {/* Selected trophy detail */}
            {selectedTrophy && (
              <div
                style={{
                  background: selectedTrophy.earned
                    ? CATEGORY_CONFIG[selectedTrophy.category].bg
                    : "rgba(255,255,255,0.04)",
                  border: `2px solid ${
                    selectedTrophy.earned
                      ? CATEGORY_CONFIG[selectedTrophy.category].borderColor
                      : "rgba(255,255,255,0.1)"
                  }`,
                  borderRadius: "20px",
                  padding: "22px 18px",
                  textAlign: "center",
                  position: "relative",
                  boxShadow: selectedTrophy.earned
                    ? `0 0 30px ${CATEGORY_CONFIG[selectedTrophy.category].accentColor}30`
                    : "none",
                }}
              >
                <button
                  onClick={() => setSelectedTrophy(null)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "14px",
                    background: "none",
                    border: "none",
                    color: "#5a4080",
                    fontSize: "16px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ✕
                </button>
                <span
                  style={{
                    fontSize: "60px",
                    display: "block",
                    marginBottom: "10px",
                    animation: selectedTrophy.earned ? "trophyFloat 3s ease-in-out infinite" : "none",
                    opacity: selectedTrophy.earned ? 1 : 0.4,
                    filter: selectedTrophy.earned
                      ? `drop-shadow(0 0 12px ${CATEGORY_CONFIG[selectedTrophy.category].accentColor})`
                      : "none",
                  }}
                >
                  {selectedTrophy.emoji}
                </span>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: `${CATEGORY_CONFIG[selectedTrophy.category].accentColor}18`,
                    border: `1px solid ${CATEGORY_CONFIG[selectedTrophy.category].borderColor}`,
                    color: CATEGORY_CONFIG[selectedTrophy.category].accentColor,
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "10px",
                  }}
                >
                  {CATEGORY_CONFIG[selectedTrophy.category].label}
                </div>
                <div
                  style={{ fontSize: "17px", fontWeight: 900, color: "#fff", marginBottom: "6px" }}
                >
                  {selectedTrophy.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#b8a0e8",
                    fontWeight: 700,
                    lineHeight: 1.5,
                    marginBottom: "10px",
                  }}
                >
                  {selectedTrophy.description}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: selectedTrophy.earned ? "#ffd166" : "#5a4080",
                    fontWeight: 700,
                    marginBottom: selectedTrophy.progress ? "10px" : 0,
                  }}
                >
                  {selectedTrophy.earned
                    ? `🏆 Earned ${selectedTrophy.earnedDate}`
                    : `How to earn: ${selectedTrophy.earnCondition}`}
                </div>
                {selectedTrophy.progress && !selectedTrophy.earned && (
                  <div>
                    <div
                      style={{
                        height: "6px",
                        background: "#2a2060",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginBottom: "5px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.round(
                            (selectedTrophy.progress.current / selectedTrophy.progress.total) * 100,
                          )}%`,
                          background: selectedTrophy.progress.color,
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: selectedTrophy.progress.color,
                      }}
                    >
                      {selectedTrophy.progress.current}/{selectedTrophy.progress.total} · almost there!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Total count card */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  color: "#ffd166",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "14px",
                }}
              >
                Trophy Cabinet
              </div>

              {/* Big stat */}
              <div style={{ textAlign: "center", marginBottom: "14px" }}>
                <div
                  style={{
                    fontSize: "52px",
                    fontWeight: 900,
                    color: "#ffd166",
                    lineHeight: 1,
                    textShadow: "0 0 20px #ffd16680",
                  }}
                >
                  {earnedTrophies.length}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#7a6090",
                    fontWeight: 700,
                    marginTop: "4px",
                  }}
                >
                  of {ALL_TROPHIES.length} trophies earned
                </div>
              </div>

              {/* Overall progress bar */}
              <div
                style={{
                  height: "8px",
                  background: "#1a1060",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round((earnedTrophies.length / ALL_TROPHIES.length) * 100)}%`,
                    background: "linear-gradient(90deg, #ffd166, #ff9d3b)",
                    borderRadius: "5px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              {/* Categories breakdown */}
              {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const catTrophies = ALL_TROPHIES.filter((t) => t.category === cat);
                const catEarned = catTrophies.filter((t) => t.earned).length;
                return (
                  <div
                    key={cat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: "#7a6090" }}>
                      {cfg.icon} {cfg.label.replace(" Trophies", "")}
                    </span>
                    <span
                      style={{
                        color: catEarned > 0 ? cfg.accentColor : "#3a3060",
                      }}
                    >
                      {catEarned}/{catTrophies.length}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Next trophy to earn */}
            {nextTrophy && (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 900,
                    color: "#58e8c1",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}
                >
                  Next to Earn 🔮
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: nextTrophy.progress ? "10px" : 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "36px",
                      opacity: 0.7,
                      filter: `drop-shadow(0 0 8px ${CATEGORY_CONFIG[nextTrophy.category].accentColor}50)`,
                    }}
                  >
                    {nextTrophy.emoji}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 900,
                        color: "#fff",
                        marginBottom: "3px",
                      }}
                    >
                      {nextTrophy.name}
                    </div>
                    <div
                      style={{ fontSize: "11px", color: "#7a6090", fontWeight: 700 }}
                    >
                      {nextTrophy.earnCondition}
                    </div>
                  </div>
                </div>
                {nextTrophy.progress && (
                  <div>
                    <div
                      style={{
                        height: "6px",
                        background: "#2a2060",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginBottom: "5px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.round(
                            (nextTrophy.progress.current / nextTrophy.progress.total) * 100,
                          )}%`,
                          background: nextTrophy.progress.color,
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: nextTrophy.progress.color,
                      }}
                    >
                      {nextTrophy.progress.current}/{nextTrophy.progress.total} · keep going!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Keyframe animations */}
        <style>{`
          @keyframes trophyFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes goldPulse {
            0%, 100% { box-shadow: 0 0 16px #ffd16640; }
            50% { box-shadow: 0 0 32px #ffd16680; }
          }
          @keyframes newBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    </AppFrame>
  );
}

// ─── Single trophy card ───────────────────────────────────────────────────────

function TrophyCard({
  trophy,
  catConfig,
  onSelect,
  isSelected,
}: {
  trophy: Trophy;
  catConfig: (typeof CATEGORY_CONFIG)[TrophyCategory];
  onSelect: (t: Trophy) => void;
  isSelected: boolean;
}) {
  const progressPct =
    trophy.progress
      ? Math.round((trophy.progress.current / trophy.progress.total) * 100)
      : null;

  // Determine styling
  let bg = trophy.earned ? catConfig.bg : "#0f0c2a";
  let borderColor = trophy.earned ? catConfig.borderColor : "#1e1a50";
  if (trophy.progress && !trophy.earned) {
    borderColor = `${catConfig.borderColor}80`;
    bg = `${catConfig.accentColor}0a`;
  }
  if (isSelected) borderColor = "#fff";

  return (
    <div
      onClick={() => (trophy.earned || trophy.progress ? onSelect(trophy) : undefined)}
      style={{
        background: bg,
        border: `2px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "18px 12px",
        textAlign: "center",
        cursor: trophy.earned || trophy.progress ? "pointer" : "default",
        transition: "all 0.2s",
        position: "relative",
        opacity: trophy.earned ? 1 : trophy.progress ? 0.75 : 0.3,
        boxShadow: isSelected
          ? "0 0 0 3px rgba(255,255,255,0.3)"
          : trophy.earned
          ? `0 0 18px ${catConfig.accentColor}35`
          : "none",
        transform: isSelected ? "translateY(-3px) scale(1.02)" : "none",
        animation: trophy.earned && !isSelected ? "goldPulse 4s ease-in-out infinite" : "none",
      }}
    >
      {/* Shimmer for earned */}
      {trophy.earned && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* NEW dot */}
      {trophy.isNew && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "10px",
            height: "10px",
            background: "#ff7b6b",
            borderRadius: "50%",
            border: "2px solid #100b2e",
            animation: "newBlink 1.5s ease-in-out infinite",
          }}
        />
      )}

      {/* Emoji */}
      <span
        style={{
          fontSize: "42px",
          display: "block",
          marginBottom: "10px",
          animation: trophy.earned ? "trophyFloat 3s ease-in-out infinite" : "none",
          filter: trophy.earned
            ? `drop-shadow(0 0 8px ${catConfig.accentColor}80)`
            : "grayscale(100%)",
        }}
      >
        {trophy.emoji}
      </span>

      {/* Name */}
      <div
        style={{
          fontSize: "13px",
          fontWeight: 900,
          color: trophy.earned ? "#fff" : "#5a5080",
          marginBottom: "4px",
          lineHeight: 1.2,
        }}
      >
        {trophy.name}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: "10px",
          color: trophy.earned ? "#b8a0e8" : "#3a3060",
          fontWeight: 700,
          lineHeight: 1.3,
          marginBottom: trophy.earnedDate ? "6px" : 0,
        }}
      >
        {trophy.description}
      </div>

      {/* Earned date */}
      {trophy.earnedDate && (
        <div
          style={{
            fontSize: "10px",
            color: "#ffd166",
            fontWeight: 700,
            marginTop: "4px",
          }}
        >
          Earned {trophy.earnedDate}
        </div>
      )}

      {/* Progress bar for close-to-unlock */}
      {progressPct !== null && !trophy.earned && (
        <div style={{ marginTop: "8px" }}>
          <div
            style={{
              height: "5px",
              background: "#2a2060",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: trophy.progress!.color,
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ fontSize: "9px", fontWeight: 700, color: trophy.progress!.color }}>
            {trophy.progress!.current}/{trophy.progress!.total}
          </div>
        </div>
      )}

      {/* Locked label */}
      {!trophy.earned && !trophy.progress && (
        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#2a2050",
            marginTop: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Not yet earned
        </div>
      )}
    </div>
  );
}

// ─── PIN gate ─────────────────────────────────────────────────────────────────

type PinGateState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "authed" };

export default function ChildTrophiesPage() {
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [gateState, setGateState] = useState<PinGateState>({ status: "idle" });

  // Restore existing session
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/child/session", { method: "GET" });
        if (res.ok && !cancelled) {
          setGateState({ status: "authed" });
        }
      } catch {
        // no session — show gate
      }
    }
    void checkSession();
    return () => {
      cancelled = true;
    };
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
        body: JSON.stringify({
          username,
          pin,
          displayName: "",
          avatarKey: "",
          launchBandCode: "",
        }),
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

  if (gateState.status === "authed") {
    return <TrophyRoom />;
  }

  // ── Gate UI ──────────────────────────────────────────────────────────────────
  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#fff",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "28px",
            padding: "36px 32px",
            width: "100%",
            maxWidth: "380px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>🏆</div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#fff",
              marginBottom: "6px",
            }}
          >
            Trophy Room
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#7a6090",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            Enter your username and PIN to see your trophies
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "2px solid #2a2060",
                background: "#1a1060",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "15px",
                fontWeight: 700,
                marginBottom: "16px",
                outline: "none",
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
                    background: pin.length > i ? "#ffd166" : "#2a2060",
                    border: `2px solid ${pin.length > i ? "#ffd166" : "#3a3070"}`,
                    transition: "background 0.15s",
                    boxShadow: pin.length > i ? "0 0 8px #ffd16680" : "none",
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
                    border: "2px solid #2a2060",
                    background: "#1a1060",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "20px",
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                >
                  {d}
                </button>
              ))}
              {/* Row 4: blank, 0, backspace */}
              <div />
              <button
                type="button"
                onClick={() => appendDigit("0")}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #2a2060",
                  background: "#1a1060",
                  color: "#fff",
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
                  border: "2px solid #2a2060",
                  background: "#1a1060",
                  color: "#ffd166",
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
              disabled={
                !username || pin.length !== 4 || gateState.status === "submitting"
              }
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background:
                  !username || pin.length !== 4
                    ? "#1a1060"
                    : "linear-gradient(135deg, #ffd166, #ff9d3b)",
                color: !username || pin.length !== 4 ? "#3a3060" : "#100b2e",
                fontFamily: "inherit",
                fontSize: "16px",
                fontWeight: 900,
                cursor:
                  !username || pin.length !== 4 ? "default" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {gateState.status === "submitting" ? "Opening..." : "Open Trophy Room 🏆"}
            </button>
          </form>
        </div>
      </div>
    </AppFrame>
  );
}
