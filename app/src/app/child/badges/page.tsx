"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeCategory = "quest" | "streak" | "star" | "world" | "special";

type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  category: BadgeCategory;
  earned: boolean;
  earnedDate?: string;
  isNew?: boolean;
  progress?: { current: number; total: number; color: string; label: string };
};

// ─── Stub data ────────────────────────────────────────────────────────────────

const ALL_BADGES: Badge[] = [
  // Earned
  {
    id: "first-quest",
    emoji: "🌟",
    name: "First Quest!",
    description: "Completed your very first quest",
    category: "quest",
    earned: true,
    earnedDate: "3 days ago",
    isNew: true,
  },
  {
    id: "forest-explorer",
    emoji: "🌲",
    name: "Forest Explorer",
    description: "Completed the Enchanted Forest",
    category: "world",
    earned: true,
    earnedDate: "5 days ago",
  },
  {
    id: "on-fire",
    emoji: "🔥",
    name: "On Fire!",
    description: "Reached a 5-day quest streak",
    category: "streak",
    earned: true,
    earnedDate: "today",
    isNew: true,
  },
  // Close-to-unlock
  {
    id: "star-collector",
    emoji: "⭐",
    name: "Star Collector",
    description: "Collect 50 stars",
    category: "star",
    earned: false,
    progress: { current: 42, total: 50, color: "#ffd166", label: "42/50 stars ✨ so close!" },
  },
  {
    id: "crystal-master",
    emoji: "💎",
    name: "Crystal Master",
    description: "Complete Crystal Caverns",
    category: "quest",
    earned: false,
    progress: { current: 7, total: 12, color: "#50e890", label: "7/12 nodes · keep going!" },
  },
  // Locked
  {
    id: "world-champion",
    emoji: "🏆",
    name: "World Champion",
    description: "Complete 3 worlds",
    category: "world",
    earned: false,
  },
  {
    id: "ten-day-streak",
    emoji: "🔟",
    name: "10-Day Streak",
    description: "Quest 10 days in a row",
    category: "streak",
    earned: false,
  },
  {
    id: "hundred-stars",
    emoji: "💯",
    name: "100 Stars!",
    description: "Collect 100 total stars",
    category: "star",
    earned: false,
  },
  {
    id: "butterfly-effect",
    emoji: "🦋",
    name: "Butterfly Effect",
    description: "Pick Flutter as your explorer",
    category: "special",
    earned: false,
  },
  {
    id: "dragon-tamer",
    emoji: "🐉",
    name: "Dragon Tamer",
    description: "Complete a boss node",
    category: "quest",
    earned: false,
  },
  {
    id: "rainbow-seeker",
    emoji: "🌈",
    name: "Rainbow Seeker",
    description: "Play in 3 different worlds in one day",
    category: "world",
    earned: false,
  },
  {
    id: "night-owl",
    emoji: "🌙",
    name: "Night Owl",
    description: "Complete a quest after 8pm",
    category: "special",
    earned: false,
  },
  {
    id: "speed-quester",
    emoji: "⚡",
    name: "Speed Quester",
    description: "Complete 5 quests in one day",
    category: "quest",
    earned: false,
  },
  {
    id: "ocean-hero",
    emoji: "🌊",
    name: "Ocean Hero",
    description: "Complete Ocean Kingdom",
    category: "world",
    earned: false,
  },
  {
    id: "grand-champion",
    emoji: "👑",
    name: "Grand Champion",
    description: "Earn every other badge!",
    category: "special",
    earned: false,
  },
];

// ─── Style tokens ─────────────────────────────────────────────────────────────

const BASE_BG = "#100b2e";
const VIOLET = "#9b72ff";
const MUTED = "#9b8ec4";

const CAT_STYLES: Record<BadgeCategory, { bg: string; border: string }> = {
  quest: {
    bg: "linear-gradient(135deg, #1a1060, #2a1880)",
    border: "#9b72ff",
  },
  streak: {
    bg: "linear-gradient(135deg, #2a1808, #1a1060)",
    border: "#ff9d3b",
  },
  star: {
    bg: "linear-gradient(135deg, #2a2010, #1a1060)",
    border: "#ffd166",
  },
  world: {
    bg: "linear-gradient(135deg, #0a2a15, #1a1060)",
    border: "#50e890",
  },
  special: {
    bg: "linear-gradient(135deg, #2a1010, #1a1060)",
    border: "#ff7b6b",
  },
};

const CAT_LABELS: Record<BadgeCategory, string> = {
  quest: "⚡ Quest",
  streak: "🔥 Streak",
  star: "⭐ Star",
  world: "🌍 World",
  special: "✨ Special",
};

type FilterKey = "all" | BadgeCategory;

// ─── Badge card ───────────────────────────────────────────────────────────────

function BadgeCard({
  badge,
  onClick,
  animDelay,
}: {
  badge: Badge;
  onClick?: () => void;
  animDelay?: number;
}) {
  const cat = CAT_STYLES[badge.category];
  const isClose = !badge.earned && !!badge.progress;

  return (
    <div
      onClick={badge.earned || isClose ? onClick : undefined}
      style={{
        background: badge.earned ? cat.bg : "#1a1060",
        border: `2px solid ${badge.earned ? cat.border : isClose ? cat.border : "#2a2060"}`,
        borderRadius: 20,
        padding: "20px 16px",
        textAlign: "center",
        cursor: badge.earned || isClose ? "pointer" : "default",
        position: "relative",
        opacity: !badge.earned && !isClose ? 0.35 : isClose ? 0.8 : 1,
        transition: "all 0.2s",
      }}
    >
      {badge.earned && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            background:
              "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}
      {badge.isNew && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 10,
            height: 10,
            background: "#ff7b6b",
            borderRadius: "50%",
            border: "2px solid #100b2e",
            animation: "newBlink 1.5s ease-in-out infinite",
          }}
        />
      )}
      <span
        style={{
          fontSize: 48,
          marginBottom: 10,
          display: "block",
          animation:
            badge.earned
              ? `badgeFloat 3s ease-in-out ${animDelay ?? 0}s infinite`
              : undefined,
        }}
      >
        {badge.emoji}
      </span>
      <div
        style={{
          fontSize: 14,
          fontWeight: 900,
          color: "#fff",
          marginBottom: 4,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {badge.name}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#7a6090",
          fontWeight: 700,
          lineHeight: 1.3,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {badge.description}
      </div>
      {badge.earnedDate && (
        <div
          style={{
            fontSize: 10,
            color: "#5a4080",
            marginTop: 6,
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          Earned {badge.earnedDate}
        </div>
      )}
      {badge.progress && (
        <>
          <div
            style={{
              height: 6,
              background: "#2a2060",
              borderRadius: 4,
              marginTop: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(badge.progress.current / badge.progress.total) * 100}%`,
                background: badge.progress.color,
                borderRadius: 4,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: badge.progress.color,
              marginTop: 4,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            {badge.progress.label}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildBadgesPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const earned = ALL_BADGES.filter((b) => b.earned);
  const totalCount = ALL_BADGES.length;

  const catCounts: Record<BadgeCategory, number> = {
    quest: ALL_BADGES.filter((b) => b.category === "quest").length,
    streak: ALL_BADGES.filter((b) => b.category === "streak").length,
    star: ALL_BADGES.filter((b) => b.category === "star").length,
    world: ALL_BADGES.filter((b) => b.category === "world").length,
    special: ALL_BADGES.filter((b) => b.category === "special").length,
  };

  const filtered =
    filter === "all" ? ALL_BADGES : ALL_BADGES.filter((b) => b.category === filter);

  // Sort: earned first, then close-to-unlock, then locked
  const sorted = [...filtered].sort((a, b) => {
    const rank = (x: Badge) =>
      x.earned ? 0 : x.progress ? 1 : 2;
    return rank(a) - rank(b);
  });

  const filterBtns: { key: FilterKey; label: string }[] = [
    { key: "all", label: `All (${totalCount})` },
    { key: "quest", label: `${CAT_LABELS.quest} (${catCounts.quest})` },
    { key: "streak", label: `${CAT_LABELS.streak} (${catCounts.streak})` },
    { key: "star", label: `${CAT_LABELS.star} (${catCounts.star})` },
    { key: "world", label: `${CAT_LABELS.world} (${catCounts.world})` },
    { key: "special", label: `${CAT_LABELS.special} (${catCounts.special})` },
  ];

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes newBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes modalPop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .badge-card-hover:hover {
          border-color: #9b72ff !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(155,114,255,0.2);
        }
      `}</style>

      <div
        style={{
          background: BASE_BG,
          minHeight: "100vh",
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: 32,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Link
                href="/child"
                style={{
                  color: MUTED,
                  fontWeight: 900,
                  fontSize: 14,
                  textDecoration: "none",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                ← Home
              </Link>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                My Badge Collection 🏅
              </div>
            </div>
            <div
              style={{
                background: "#1a1060",
                border: `2px solid ${VIOLET}`,
                borderRadius: 12,
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 700,
                color: VIOLET,
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              {earned.length} earned · {totalCount - earned.length} to unlock
            </div>
          </div>

          {/* Category filter */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            {filterBtns.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: `2px solid ${filter === key ? VIOLET : "#2a2060"}`,
                  background: filter === key ? VIOLET : "#1a1060",
                  color: filter === key ? "#fff" : "#7a6090",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Badge grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {sorted.map((badge, i) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                animDelay={i * 0.5}
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>
        </div>

        {/* Badge detail modal overlay */}
        {selectedBadge && (
          <div
            onClick={() => setSelectedBadge(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,8,32,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 24,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#1a1060",
                border: `2px solid ${CAT_STYLES[selectedBadge.category].border}`,
                borderRadius: 24,
                padding: 28,
                textAlign: "center",
                maxWidth: 480,
                width: "100%",
                animation: "modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              <span
                style={{
                  fontSize: 80,
                  display: "block",
                  marginBottom: 14,
                  animation: "badgeFloat 3s ease-in-out infinite",
                }}
              >
                {selectedBadge.emoji}
              </span>
              <div
                style={{
                  display: "inline-block",
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 14,
                  background: CAT_STYLES[selectedBadge.category].bg,
                  border: `2px solid ${CAT_STYLES[selectedBadge.category].border}`,
                  color: CAT_STYLES[selectedBadge.category].border,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {CAT_LABELS[selectedBadge.category]} Badge
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: 8,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {selectedBadge.name}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#b8a0e8",
                  fontWeight: 700,
                  lineHeight: 1.5,
                  marginBottom: 16,
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                {selectedBadge.description}
              </div>
              {selectedBadge.earned && selectedBadge.earnedDate && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#5a4080",
                    fontWeight: 700,
                    marginBottom: 16,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  Earned {selectedBadge.earnedDate}
                </div>
              )}
              {selectedBadge.progress && (
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      height: 8,
                      background: "#2a2060",
                      borderRadius: 4,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(selectedBadge.progress.current / selectedBadge.progress.total) * 100}%`,
                        background: selectedBadge.progress.color,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: selectedBadge.progress.color,
                      fontFamily: "'Nunito', system-ui, sans-serif",
                    }}
                  >
                    {selectedBadge.progress.label}
                  </div>
                </div>
              )}
              <button
                onClick={() => setSelectedBadge(null)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: VIOLET,
                  color: "#fff",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
