"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

type ApiBadge = {
  id: string;
  badgeKey: string;
  displayName: string;
  description: string;
  iconKey: string | null;
  earned: boolean;
  earnedAt: string | null;
};

// ─── Badge emoji mapping ───────────────────────────────────────────────────────

function getBadgeEmoji(key: string): string {
  if (key.includes("streak")) return "🔥";
  if (key.includes("perfect")) return "💯";
  if (key.includes("first")) return "🌟";
  if (key.includes("speed")) return "⚡";
  if (key.includes("mastery") || key.includes("master")) return "🏆";
  if (key.includes("count") || key.includes("session")) return "📚";
  if (key.includes("math")) return "🔢";
  if (key.includes("read") || key.includes("letter")) return "📖";
  return "🏅";
}

function getBadgeCategory(key: string): BadgeCategory {
  if (key.includes("streak")) return "streak";
  if (key.includes("star")) return "star";
  if (key.includes("world") || key.includes("forest") || key.includes("ocean") || key.includes("island")) return "world";
  if (key.includes("special") || key.includes("night") || key.includes("butterfly")) return "special";
  return "quest";
}

function formatEarnedAt(earnedAt: string | null): string | undefined {
  if (!earnedAt) return undefined;
  const d = new Date(earnedAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

// ─── All badges catalog (fallback/placeholder) ───────────────────────────────

const ALL_BADGES_CATALOG: Omit<Badge, "earned" | "earnedDate" | "isNew">[] = [
  { id: "first-quest", emoji: "🌟", name: "First Quest!", description: "Complete your very first quest", category: "quest" },
  { id: "forest-explorer", emoji: "🌲", name: "Forest Explorer", description: "Complete the Enchanted Forest", category: "world" },
  { id: "on-fire", emoji: "🔥", name: "On Fire!", description: "Reach a 5-day quest streak", category: "streak" },
  { id: "star-collector", emoji: "⭐", name: "Star Collector", description: "Collect 50 stars", category: "star" },
  { id: "crystal-master", emoji: "💎", name: "Crystal Master", description: "Complete Crystal Caverns", category: "quest" },
  { id: "world-champion", emoji: "🏆", name: "World Champion", description: "Complete 3 worlds", category: "world" },
];

const MYSTERY_BADGES: Omit<Badge, "earned" | "earnedDate" | "isNew">[] = [
  { id: "mystery-1", emoji: "❓", name: "???", description: "Keep playing to discover this badge", category: "special" },
  { id: "mystery-2", emoji: "❓", name: "???", description: "Keep playing to discover this badge", category: "special" },
  { id: "mystery-3", emoji: "❓", name: "???", description: "Keep playing to discover this badge", category: "special" },
  { id: "mystery-4", emoji: "❓", name: "???", description: "Keep playing to discover this badge", category: "special" },
  { id: "mystery-5", emoji: "❓", name: "???", description: "Keep playing to discover this badge", category: "special" },
  { id: "mystery-6", emoji: "❓", name: "???", description: "Keep playing to discover this badge", category: "special" },
];

function apiBadgesToBadgeList(apiBadges: ApiBadge[]): Badge[] {
  return apiBadges.map((ab, i) => {
    const key = ab.iconKey ?? ab.badgeKey;
    return {
      id: ab.id,
      emoji: getBadgeEmoji(key),
      name: ab.displayName,
      description: ab.description ?? "",
      category: getBadgeCategory(ab.badgeKey),
      earned: ab.earned,
      earnedDate: formatEarnedAt(ab.earnedAt),
      isNew: ab.earned && i === 0,
    };
  });
}

function buildPlaceholderBadgeList(sessionBadgeCount: number): Badge[] {
  return ALL_BADGES_CATALOG.map((b, i) => {
    if (i < sessionBadgeCount) {
      return { ...b, earned: true, earnedDate: i === sessionBadgeCount - 1 ? "today" : "recently", isNew: i === sessionBadgeCount - 1 };
    }
    return { ...b, earned: false };
  });
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const BASE_BG = "#100b2e";
const VIOLET = "#9b72ff";
const MUTED = "#9b8ec4";
const MINT = "#50e890";

const CAT_STYLES: Record<BadgeCategory, { bg: string; border: string }> = {
  quest: { bg: "linear-gradient(135deg, #1a1060, #2a1880)", border: "#9b72ff" },
  streak: { bg: "linear-gradient(135deg, #2a1808, #1a1060)", border: "#ff9d3b" },
  star: { bg: "linear-gradient(135deg, #2a2010, #1a1060)", border: "#ffd166" },
  world: { bg: "linear-gradient(135deg, #0a2a15, #1a1060)", border: "#50e890" },
  special: { bg: "linear-gradient(135deg, #2a1010, #1a1060)", border: "#ff7b6b" },
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

function BadgeCard({ badge, onClick, animDelay }: { badge: Badge; onClick?: () => void; animDelay?: number }) {
  const cat = CAT_STYLES[badge.category];
  const isClose = !badge.earned && !!badge.progress;

  return (
    <div
      onClick={badge.earned || isClose ? onClick : undefined}
      title={!badge.earned && !isClose ? "Keep playing to unlock" : undefined}
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
            background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)",
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
          animation: badge.earned ? `badgeFloat 3s ease-in-out ${animDelay ?? 0}s infinite` : undefined,
          filter: !badge.earned && !isClose ? "grayscale(1)" : undefined,
        }}
      >
        {!badge.earned && !isClose ? "🔒" : badge.emoji}
      </span>
      <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 4, fontFamily: "'Nunito', system-ui, sans-serif" }}>
        {badge.name}
      </div>
      <div style={{ fontSize: 11, color: "#7a6090", fontWeight: 700, lineHeight: 1.3, fontFamily: "'Nunito', system-ui, sans-serif" }}>
        {badge.description}
      </div>
      {badge.earned && (
        <div style={{ fontSize: 11, color: MINT, fontWeight: 900, marginTop: 6, fontFamily: "'Nunito', system-ui, sans-serif" }}>
          {badge.earnedDate ? `Earned ${badge.earnedDate}` : "Earned!"}
        </div>
      )}
      {badge.progress && (
        <>
          <div style={{ height: 6, background: "#2a2060", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(badge.progress.current / badge.progress.total) * 100}%`,
                background: badge.progress.color,
                borderRadius: 4,
              }}
            />
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: badge.progress.color, marginTop: 4, fontFamily: "'Nunito', system-ui, sans-serif" }}>
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
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [noSession, setNoSession] = useState(false);

  function loadBadges() {
    setLoading(true);
    setFetchError(false);
    fetch("/api/child/badges")
      .then((r) => {
        if (r.status === 401) {
          setNoSession(true);
          return null;
        }
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((data: { badges: ApiBadge[] } | null) => {
        if (!data) return;
        setAllBadges(apiBadgesToBadgeList(data.badges));
      })
      .catch(() => {
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBadges();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const earned = allBadges.filter((b) => b.earned);
  const totalCount = allBadges.length;

  const catCounts: Record<BadgeCategory, number> = {
    quest: allBadges.filter((b) => b.category === "quest").length,
    streak: allBadges.filter((b) => b.category === "streak").length,
    star: allBadges.filter((b) => b.category === "star").length,
    world: allBadges.filter((b) => b.category === "world").length,
    special: allBadges.filter((b) => b.category === "special").length,
  };

  const filtered = filter === "all" ? allBadges : allBadges.filter((b) => b.category === filter);
  const sorted = [...filtered].sort((a, b) => {
    const rank = (x: Badge) => (x.earned ? 0 : x.progress ? 1 : 2);
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

      <div style={{ background: BASE_BG, minHeight: "100vh", fontFamily: "'Nunito', system-ui, sans-serif", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Link href="/child" style={{ color: MUTED, fontWeight: 900, fontSize: 14, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}>
                ← Home
              </Link>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Nunito', system-ui, sans-serif" }}>
                🏅 Your Badges
              </div>
            </div>
            {!noSession && (
              <div style={{ background: "#1a1060", border: `2px solid ${VIOLET}`, borderRadius: 12, padding: "8px 16px", fontSize: 14, fontWeight: 700, color: VIOLET, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                {loading ? "Loading..." : `${earned.length} earned · ${totalCount - earned.length} to unlock`}
              </div>
            )}
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: 14, color: MUTED, fontWeight: 700, marginBottom: 24, fontFamily: "'Nunito', system-ui, sans-serif" }}>
            Collect them all by playing quests!
          </div>

          {noSession ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏅</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 8, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                Sign in to see your badges
              </div>
              <div style={{ fontSize: 14, color: MUTED, marginBottom: 24, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                You need to be signed in to view your badge collection.
              </div>
              <Link
                href="/child"
                style={{ background: VIOLET, color: "#fff", borderRadius: 12, padding: "12px 28px", fontWeight: 900, fontSize: 15, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}
              >
                Sign In
              </Link>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: MUTED, fontSize: 18, fontWeight: 700 }}>
              Loading your badges...
            </div>
          ) : fetchError ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 15, color: MUTED, fontWeight: 700, marginBottom: 16 }}>
                Could not load badges. Check your connection and try again.
              </div>
              <button
                onClick={loadBadges}
                style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: VIOLET, color: "#fff", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          ) : allBadges.length === 0 ? (
            <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🏅</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#e8e0ff", marginBottom: 8, fontFamily: "'Nunito', system-ui, sans-serif" }}>No badges yet!</div>
              <div style={{ fontSize: 15, color: MUTED, marginBottom: 24, fontFamily: "'Nunito', system-ui, sans-serif" }}>Complete quests to earn your first badge.</div>
              <a href="/play" style={{ padding: "12px 28px", borderRadius: 12, background: VIOLET, color: "#fff", fontWeight: 800, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}>Start a quest →</a>
            </div>
          ) : (
            <>
              {/* Category filter */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
                {sorted.map((badge, i) => (
                  <BadgeCard key={badge.id} badge={badge} animDelay={i * 0.5} onClick={() => setSelectedBadge(badge)} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Badge detail modal overlay */}
        {selectedBadge && (
          <div
            onClick={() => setSelectedBadge(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(10,8,32,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}
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
              <span style={{ fontSize: 80, display: "block", marginBottom: 14, animation: "badgeFloat 3s ease-in-out infinite" }}>
                {selectedBadge.earned ? selectedBadge.emoji : "🔒"}
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
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 8, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                {selectedBadge.name}
              </div>
              <div style={{ fontSize: 14, color: "#b8a0e8", fontWeight: 700, lineHeight: 1.5, marginBottom: 16, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                {selectedBadge.description}
              </div>
              {selectedBadge.earned && selectedBadge.earnedDate && (
                <div style={{ fontSize: 12, color: MINT, fontWeight: 900, marginBottom: 16, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                  Earned {selectedBadge.earnedDate}
                </div>
              )}
              {selectedBadge.progress && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 8, background: "#2a2060", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(selectedBadge.progress.current / selectedBadge.progress.total) * 100}%`,
                        background: selectedBadge.progress.color,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedBadge.progress.color, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                    {selectedBadge.progress.label}
                  </div>
                </div>
              )}
              <button
                onClick={() => setSelectedBadge(null)}
                style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: VIOLET, color: "#fff", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
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
