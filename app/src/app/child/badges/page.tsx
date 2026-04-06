"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { accessChild, restoreChildSession } from "@/lib/prototype-service";
import { launchBands } from "@/lib/launch-plan";

// ─── Badge data ───────────────────────────────────────────────────────────────

type BadgeCategory = "quest" | "streak" | "star" | "world" | "special";

type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earnCondition: string;
  category: BadgeCategory;
  earned: boolean;
  earnedDate?: string;
  isNew?: boolean;
  progress?: { current: number; total: number; color: string };
};

const ALL_BADGES: Badge[] = [
  // Earned
  {
    id: "first-quest",
    emoji: "🌟",
    name: "First Quest!",
    description: "You completed your very first quest",
    earnCondition: "Complete 1 quest",
    category: "quest",
    earned: true,
    earnedDate: "3 days ago",
    isNew: true,
  },
  {
    id: "forest-explorer",
    emoji: "🌲",
    name: "Forest Explorer",
    description: "Braved the Enchanted Forest world",
    earnCondition: "Complete Enchanted Forest",
    category: "world",
    earned: true,
    earnedDate: "5 days ago",
  },
  {
    id: "on-fire",
    emoji: "🔥",
    name: "On Fire!",
    description: "You quested 5 days in a row — you're unstoppable!",
    earnCondition: "Reach a 5-day streak",
    category: "streak",
    earned: true,
    earnedDate: "Today",
    isNew: true,
  },
  // In-progress / close
  {
    id: "star-collector",
    emoji: "⭐",
    name: "Star Collector",
    description: "Collect 50 stars across any quests",
    earnCondition: "Collect 50 stars",
    category: "star",
    earned: false,
    progress: { current: 42, total: 50, color: "#ffd166" },
  },
  {
    id: "crystal-master",
    emoji: "💎",
    name: "Crystal Master",
    description: "Complete every node in Crystal Caverns",
    earnCondition: "Finish Crystal Caverns (12 nodes)",
    category: "world",
    earned: false,
    progress: { current: 7, total: 12, color: "#9b72ff" },
  },
  {
    id: "world-champion",
    emoji: "🏆",
    name: "World Champion",
    description: "Complete 3 different worlds",
    earnCondition: "Finish 3 worlds",
    category: "world",
    earned: false,
    progress: { current: 2, total: 3, color: "#58e8c1" },
  },
  {
    id: "ten-day-streak",
    emoji: "🔟",
    name: "10-Day Streak",
    description: "Quest 10 days in a row — legendary!",
    earnCondition: "Quest 10 consecutive days",
    category: "streak",
    earned: false,
    progress: { current: 5, total: 10, color: "#ff9d3b" },
  },
  // Locked
  {
    id: "ocean-hero",
    emoji: "🌊",
    name: "Ocean Hero",
    description: "Dive into the Ocean Kingdom",
    earnCondition: "Complete Ocean Kingdom",
    category: "world",
    earned: false,
  },
  {
    id: "hundred-stars",
    emoji: "💯",
    name: "100 Stars!",
    description: "You collected 100 stars total — wow!",
    earnCondition: "Collect 100 total stars",
    category: "star",
    earned: false,
  },
  {
    id: "butterfly-effect",
    emoji: "🦋",
    name: "Butterfly Effect",
    description: "Pick Flutter as your explorer companion",
    earnCondition: "Choose the Flutter avatar",
    category: "special",
    earned: false,
  },
  {
    id: "dragon-tamer",
    emoji: "🐉",
    name: "Dragon Tamer",
    description: "Defeat a boss node — that takes real skill!",
    earnCondition: "Complete a boss node",
    category: "quest",
    earned: false,
  },
  {
    id: "rainbow-seeker",
    emoji: "🌈",
    name: "Rainbow Seeker",
    description: "Explore 3 different worlds in one day",
    earnCondition: "Play 3 worlds in a single day",
    category: "special",
    earned: false,
  },
  {
    id: "night-owl",
    emoji: "🌙",
    name: "Night Owl",
    description: "Sneaked in a quest after 8pm",
    earnCondition: "Complete a quest after 8 PM",
    category: "special",
    earned: false,
  },
  {
    id: "speed-quester",
    emoji: "⚡",
    name: "Speed Quester",
    description: "5 quests in one day — speedy adventurer!",
    earnCondition: "Complete 5 quests in one day",
    category: "quest",
    earned: false,
  },
  {
    id: "grand-champion",
    emoji: "👑",
    name: "Grand Champion",
    description: "The ultimate badge — earn every other badge first!",
    earnCondition: "Earn all other badges",
    category: "special",
    earned: false,
  },
];

const CATEGORY_META: Record<
  BadgeCategory | "all",
  { label: string; count: number; accentColor: string }
> = {
  all: { label: "All", count: ALL_BADGES.length, accentColor: "#9b72ff" },
  quest: {
    label: "⚡ Quest",
    count: ALL_BADGES.filter((b) => b.category === "quest").length,
    accentColor: "#9b72ff",
  },
  streak: {
    label: "🔥 Streak",
    count: ALL_BADGES.filter((b) => b.category === "streak").length,
    accentColor: "#ff9d3b",
  },
  star: {
    label: "⭐ Stars",
    count: ALL_BADGES.filter((b) => b.category === "star").length,
    accentColor: "#ffd166",
  },
  world: {
    label: "🌍 World",
    count: ALL_BADGES.filter((b) => b.category === "world").length,
    accentColor: "#58e8c1",
  },
  special: {
    label: "✨ Special",
    count: ALL_BADGES.filter((b) => b.category === "special").length,
    accentColor: "#ff7b6b",
  },
};

const CATEGORY_BG: Record<BadgeCategory, string> = {
  quest: "linear-gradient(135deg, #1a1060, #2a1880)",
  streak: "linear-gradient(135deg, #2a1808, #1a1060)",
  star: "linear-gradient(135deg, #2a2010, #1a1060)",
  world: "linear-gradient(135deg, #0a2a15, #1a1060)",
  special: "linear-gradient(135deg, #2a1010, #1a1060)",
};

const CATEGORY_BORDER: Record<BadgeCategory, string> = {
  quest: "#9b72ff",
  streak: "#ff9d3b",
  star: "#ffd166",
  world: "#58e8c1",
  special: "#ff7b6b",
};

// ─── Badge Collection view ────────────────────────────────────────────────────

function BadgeCollection() {
  const [activeCategory, setActiveCategory] = useState<BadgeCategory | "all">("all");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const earnedBadges = ALL_BADGES.filter((b) => b.earned);
  const lockedBadges = ALL_BADGES.filter((b) => !b.earned);
  const nextBadge = ALL_BADGES.find(
    (b) => !b.earned && b.progress != null,
  ) ?? lockedBadges[0];

  const filteredBadges =
    activeCategory === "all"
      ? ALL_BADGES
      : ALL_BADGES.filter((b) => b.category === activeCategory);

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
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "#2a2060",
            }}
          />
          <div
            style={{
              fontSize: "18px",
              fontWeight: 900,
              color: "#fff",
            }}
          >
            Badge Collection 🏅
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              background: "#1a1060",
              border: "2px solid #9b72ff",
              borderRadius: "12px",
              padding: "5px 14px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#9b72ff",
            }}
          >
            {earnedBadges.length} earned · {lockedBadges.length} to unlock
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
          {/* ── Left: badge grid ──────────────────────────────── */}
          <div>
            {/* Category filter */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {(Object.keys(CATEGORY_META) as (BadgeCategory | "all")[]).map((cat) => {
                const meta = CATEGORY_META[cat];
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: "20px",
                      border: `2px solid ${isActive ? meta.accentColor : "#2a2060"}`,
                      background: isActive ? meta.accentColor : "#1a1060",
                      color: isActive ? "#fff" : "#7a6090",
                      fontFamily: "inherit",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {meta.label} ({meta.count})
                  </button>
                );
              })}
            </div>

            {/* Badge grid — 3-col on desktop, responsive */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "16px",
              }}
            >
              {filteredBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  onSelect={setSelectedBadge}
                  isSelected={selectedBadge?.id === badge.id}
                />
              ))}
            </div>
          </div>

          {/* ── Right rail: progress + next ───────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "sticky",
              top: "24px",
            }}
          >
            {/* Selected badge detail */}
            {selectedBadge && (
              <div
                style={{
                  background: selectedBadge.earned
                    ? CATEGORY_BG[selectedBadge.category]
                    : "rgba(255,255,255,0.04)",
                  border: `2px solid ${selectedBadge.earned ? CATEGORY_BORDER[selectedBadge.category] : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "20px",
                  padding: "22px 18px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => setSelectedBadge(null)}
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
                    fontSize: "56px",
                    display: "block",
                    marginBottom: "10px",
                    animation: selectedBadge.earned ? "badgeFloat 3s ease-in-out infinite" : "none",
                    opacity: selectedBadge.earned ? 1 : 0.4,
                  }}
                >
                  {selectedBadge.emoji}
                </span>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: `rgba(255,255,255,0.06)`,
                    border: `1px solid ${CATEGORY_BORDER[selectedBadge.category]}`,
                    color: CATEGORY_BORDER[selectedBadge.category],
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "10px",
                  }}
                >
                  {selectedBadge.category}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    color: "#fff",
                    marginBottom: "6px",
                  }}
                >
                  {selectedBadge.name}
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
                  {selectedBadge.description}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#5a4080",
                    fontWeight: 700,
                    marginBottom: selectedBadge.progress ? "10px" : 0,
                  }}
                >
                  {selectedBadge.earned
                    ? `Earned ${selectedBadge.earnedDate}`
                    : `How to earn: ${selectedBadge.earnCondition}`}
                </div>
                {selectedBadge.progress && !selectedBadge.earned && (
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
                          width: `${Math.round((selectedBadge.progress.current / selectedBadge.progress.total) * 100)}%`,
                          background: selectedBadge.progress.color,
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: selectedBadge.progress.color,
                      }}
                    >
                      {selectedBadge.progress.current}/{selectedBadge.progress.total} · almost there!
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress summary card */}
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
                  color: "#9b72ff",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "14px",
                }}
              >
                Your Progress
              </div>

              {/* Big stat */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: 900,
                    color: "#ffd166",
                    lineHeight: 1,
                  }}
                >
                  {earnedBadges.length}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#7a6090",
                    fontWeight: 700,
                    marginTop: "4px",
                  }}
                >
                  of {ALL_BADGES.length} badges earned
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: "8px",
                  background: "#1a1060",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round((earnedBadges.length / ALL_BADGES.length) * 100)}%`,
                    background: "linear-gradient(90deg, #9b72ff, #58e8c1)",
                    borderRadius: "5px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              {/* Category breakdown */}
              {(["quest", "streak", "star", "world", "special"] as BadgeCategory[]).map((cat) => {
                const catBadges = ALL_BADGES.filter((b) => b.category === cat);
                const catEarned = catBadges.filter((b) => b.earned).length;
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
                      {CATEGORY_META[cat].label}
                    </span>
                    <span
                      style={{
                        color: catEarned > 0 ? CATEGORY_BORDER[cat] : "#3a3060",
                      }}
                    >
                      {catEarned}/{catBadges.length}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Next badge to earn */}
            {nextBadge && (
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
                    marginBottom: nextBadge.progress ? "10px" : 0,
                  }}
                >
                  <span style={{ fontSize: "36px", opacity: 0.7 }}>{nextBadge.emoji}</span>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 900,
                        color: "#fff",
                        marginBottom: "3px",
                      }}
                    >
                      {nextBadge.name}
                    </div>
                    <div
                      style={{ fontSize: "11px", color: "#7a6090", fontWeight: 700 }}
                    >
                      {nextBadge.earnCondition}
                    </div>
                  </div>
                </div>
                {nextBadge.progress && (
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
                          width: `${Math.round((nextBadge.progress.current / nextBadge.progress.total) * 100)}%`,
                          background: nextBadge.progress.color,
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: nextBadge.progress.color,
                      }}
                    >
                      {nextBadge.progress.current}/{nextBadge.progress.total} · keep going!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Float animation keyframes injected via a style tag */}
        <style>{`
          @keyframes badgeFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
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

// ─── Single badge card ────────────────────────────────────────────────────────

function BadgeCard({
  badge,
  onSelect,
  isSelected,
}: {
  badge: Badge;
  onSelect: (b: Badge) => void;
  isSelected: boolean;
}) {
  const catColor = CATEGORY_BORDER[badge.category];
  const progressPct =
    badge.progress
      ? Math.round((badge.progress.current / badge.progress.total) * 100)
      : null;

  // Determine card style
  let bg = badge.earned ? CATEGORY_BG[badge.category] : "#1a1060";
  let border = badge.earned ? catColor : "#2a2060";
  if (badge.progress && !badge.earned) {
    border = catColor;
    bg = "rgba(26,16,96,0.8)";
  }
  if (isSelected) border = "#fff";

  return (
    <div
      onClick={() => badge.earned || badge.progress ? onSelect(badge) : undefined}
      style={{
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: "20px",
        padding: "18px 14px",
        textAlign: "center",
        cursor: badge.earned || badge.progress ? "pointer" : "default",
        transition: "all 0.2s",
        position: "relative",
        opacity: badge.earned ? 1 : badge.progress ? 0.8 : 0.35,
        boxShadow: isSelected
          ? "0 0 0 3px rgba(255,255,255,0.3)"
          : badge.earned
          ? `0 0 20px ${catColor}33`
          : "none",
        transform: isSelected ? "translateY(-3px)" : "none",
      }}
    >
      {/* Shimmer overlay for earned */}
      {badge.earned && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* NEW dot */}
      {badge.isNew && (
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
          fontSize: "44px",
          display: "block",
          marginBottom: "10px",
          animation: badge.earned ? "badgeFloat 3s ease-in-out infinite" : "none",
        }}
      >
        {badge.emoji}
      </span>

      {/* Name */}
      <div
        style={{
          fontSize: "13px",
          fontWeight: 900,
          color: badge.earned ? "#fff" : "#7a6090",
          marginBottom: "4px",
          lineHeight: 1.2,
        }}
      >
        {badge.name}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: "10px",
          color: badge.earned ? "#b8a0e8" : "#4a3870",
          fontWeight: 700,
          lineHeight: 1.3,
          marginBottom: badge.earnedDate ? "6px" : 0,
        }}
      >
        {badge.description}
      </div>

      {/* Earned date */}
      {badge.earnedDate && (
        <div style={{ fontSize: "10px", color: "#5a4080", fontWeight: 700 }}>
          Earned {badge.earnedDate}
        </div>
      )}

      {/* Progress bar for close-to-unlock */}
      {progressPct !== null && !badge.earned && (
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
                background: badge.progress!.color,
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: badge.progress!.color,
            }}
          >
            {badge.progress!.current}/{badge.progress!.total}
          </div>
        </div>
      )}

      {/* Locked label */}
      {!badge.earned && !badge.progress && (
        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#3a3060",
            marginTop: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Locked
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

export default function ChildBadgesPage() {
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [gateState, setGateState] = useState<PinGateState>({ status: "idle" });

  // Check for an existing session cookie first
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

  if (gateState.status === "authed") {
    return <BadgeCollection />;
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
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🏅</div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#fff",
              marginBottom: "6px",
            }}
          >
            Badge Collection
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#7a6090",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            Enter your username and PIN to see your badges
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
                    background: pin.length > i ? "#9b72ff" : "#2a2060",
                    border: `2px solid ${pin.length > i ? "#9b72ff" : "#3a3070"}`,
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
              disabled={!username || pin.length !== 4 || gateState.status === "submitting"}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background:
                  username && pin.length === 4 ? "#9b72ff" : "#2a2060",
                color: username && pin.length === 4 ? "#fff" : "#5a4080",
                fontFamily: "inherit",
                fontSize: "16px",
                fontWeight: 900,
                cursor: username && pin.length === 4 ? "pointer" : "default",
                transition: "background 0.2s",
              }}
            >
              {gateState.status === "submitting" ? "Checking..." : "See My Badges 🏅"}
            </button>
          </form>

          <div style={{ marginTop: "16px" }}>
            <Link
              href="/child"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#5a4080",
                textDecoration: "none",
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
