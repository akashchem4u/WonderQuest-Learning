"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type TrophyTier = "gold" | "silver" | "bronze" | "locked";
type FilterTab = "all" | "earned" | "gold" | "silver" | "bronze";

type Trophy = {
  id: string;
  emoji: string;
  name: string;
  world: string;
  worldEmoji: string;
  description: string;
  earnCondition: string;
  tier: TrophyTier;
  earned: boolean;
  earnedDate?: string;
  stars?: number;
  isNew?: boolean;
};

type ApiTrophy = {
  id: string;
  trophyKey: string;
  displayName: string;
  description: string;
  iconKey: string | null;
  tier: string;
  earned: boolean;
  earnedAt: string | null;
};

// ─── API trophy conversion ─────────────────────────────────────────────────────

function getTrophyEmoji(tier: string, key: string): string {
  if (key.includes("mastery") || key.includes("champion") || tier === "gold") return "🏆";
  if (key.includes("ocean")) return "🌊";
  if (key.includes("crystal")) return "💎";
  if (key.includes("volcano")) return "🌋";
  if (key.includes("peak") || key.includes("frozen")) return "🏔️";
  if (tier === "silver") return "🥈";
  if (tier === "bronze") return "🥉";
  return "🏆";
}

function getTrophyTier(t: string): TrophyTier {
  if (t === "gold") return "gold";
  if (t === "silver") return "silver";
  if (t === "bronze") return "bronze";
  return "locked";
}

function formatEarnedAt(earnedAt: string | null): string | undefined {
  if (!earnedAt) return undefined;
  const d = new Date(earnedAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function apiTrophiesToTrophyList(apiTrophies: ApiTrophy[]): Trophy[] {
  return apiTrophies.map((at, i) => ({
    id: at.id,
    emoji: getTrophyEmoji(at.tier, at.trophyKey),
    name: at.displayName,
    world: "Any World",
    worldEmoji: "🌍",
    description: at.description ?? "",
    earnCondition: "Keep playing to unlock",
    tier: at.earned ? getTrophyTier(at.tier) : "locked",
    earned: at.earned,
    earnedDate: formatEarnedAt(at.earnedAt),
    isNew: at.earned && i === 0,
  }));
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "earned", label: "Earned" },
  { key: "gold", label: "🏆 Gold" },
  { key: "silver", label: "🥈 Silver" },
  { key: "bronze", label: "🥉 Bronze" },
];

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<TrophyTier, { border: string; name: string; bg: string; glow: string; label: string; labelColor: string }> = {
  gold: {
    border: "#ffd166",
    name: "#ffd166",
    bg: "linear-gradient(135deg, #3a2a10, #2a2010)",
    glow: "0 0 20px rgba(255,209,102,0.3)",
    label: "GOLD",
    labelColor: "#ffd166",
  },
  silver: {
    border: "#aaaaaa",
    name: "#aaa",
    bg: "linear-gradient(135deg, #2a2a2a, #1a1a1a)",
    glow: "0 0 16px rgba(170,170,170,0.2)",
    label: "SILVER",
    labelColor: "#aaa",
  },
  bronze: {
    border: "#c07040",
    name: "#c07040",
    bg: "linear-gradient(135deg, #2a1a08, #1a1060)",
    glow: "0 0 16px rgba(192,112,64,0.2)",
    label: "BRONZE",
    labelColor: "#c07040",
  },
  locked: {
    border: "#2a2060",
    name: "#5a4080",
    bg: "#1a1060",
    glow: "none",
    label: "LOCKED",
    labelColor: "#3a2a60",
  },
};

// ─── Trophy Card ──────────────────────────────────────────────────────────────

function TrophyCard({ trophy, animDelay, onSelect }: { trophy: Trophy; animDelay?: number; onSelect: (t: Trophy) => void }) {
  const [hovered, setHovered] = useState(false);
  const locked = !trophy.earned;
  const cfg = TIER_CONFIG[trophy.tier];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !locked && onSelect(trophy)}
      onKeyDown={(e) => e.key === "Enter" && !locked && onSelect(trophy)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={locked ? "Keep playing to unlock" : undefined}
      style={{
        background: locked ? "#1a1060" : cfg.bg,
        border: `2px ${locked ? "dashed" : "solid"} ${cfg.border}`,
        borderRadius: 20,
        padding: "22px 16px 18px",
        textAlign: "center",
        cursor: locked ? "default" : "pointer",
        opacity: locked ? 0.35 : 1,
        transform: hovered && !locked ? "translateY(-5px)" : "none",
        boxShadow: !locked && trophy.earned ? cfg.glow : "none",
        transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
        position: "relative",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      {/* Tier label badge */}
      {!locked && (
        <div style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: "rgba(0,0,0,0.5)",
          color: cfg.labelColor,
          fontSize: 8,
          fontWeight: 900,
          borderRadius: 6,
          padding: "2px 6px",
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}>
          {cfg.label}
        </div>
      )}

      {trophy.isNew && !locked && (
        <div style={{ position: "absolute", top: 8, right: 8, background: "#ff7b6b", color: "#fff", fontSize: 9, fontWeight: 900, borderRadius: 6, padding: "2px 6px", letterSpacing: 0.5 }}>
          NEW
        </div>
      )}

      {/* Big emoji */}
      <div style={{
        fontSize: 52,
        marginBottom: 10,
        display: "block",
        animation: locked ? "none" : `trophy-bob 3s ${animDelay ?? 0}s ease-in-out infinite`,
        filter: locked ? "grayscale(1) brightness(0.5)" : "none",
      }}>
        {locked ? "🔒" : trophy.emoji}
      </div>

      {/* Name */}
      <div style={{ fontSize: 13, fontWeight: 900, color: locked ? "#5a4080" : cfg.name, marginBottom: 4, fontFamily: "'Nunito', system-ui, sans-serif" }}>
        {trophy.name}
      </div>

      {/* Description (brief) */}
      <div style={{ fontSize: 10, color: locked ? "#3a2060" : "#9b8ec4", fontWeight: 700, lineHeight: 1.35, marginBottom: 6, fontFamily: "'Nunito', system-ui, sans-serif" }}>
        {locked ? trophy.earnCondition : trophy.description.length > 50 ? trophy.description.slice(0, 50) + "…" : trophy.description}
      </div>

      {/* Earned date */}
      <div style={{ fontSize: 10, color: locked ? "#3a2a60" : "#50e890", fontWeight: 700, fontFamily: "'Nunito', system-ui, sans-serif" }}>
        {trophy.earned ? (trophy.earnedDate ? `Earned ${trophy.earnedDate}` : "Earned!") : ""}
      </div>
    </div>
  );
}

// ─── Trophy Detail Modal ──────────────────────────────────────────────────────

function TrophyDetailModal({ trophy, onClose }: { trophy: Trophy; onClose: () => void }) {
  const cfg = TIER_CONFIG[trophy.tier];
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10, 8, 32, 0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: cfg.bg,
          border: `2px solid ${cfg.border}`,
          borderRadius: 28,
          padding: "32px 28px",
          textAlign: "center",
          maxWidth: 380,
          width: "100%",
          fontFamily: "'Nunito', system-ui, sans-serif",
          boxShadow: `0 24px 64px rgba(0,0,0,0.7), ${cfg.glow}`,
          animation: "modal-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <div style={{ fontSize: 84, display: "block", marginBottom: 12, animation: "trophy-bob 2.5s ease-in-out infinite" }}>
          {trophy.emoji}
        </div>
        <div style={{
          display: "inline-block",
          background: "rgba(0,0,0,0.4)",
          border: `1px solid ${cfg.border}`,
          borderRadius: 20,
          padding: "4px 14px",
          fontSize: 11,
          fontWeight: 900,
          color: cfg.labelColor,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 10,
        }}>
          {cfg.label} TROPHY
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 10, fontFamily: "'Nunito', system-ui, sans-serif" }}>
          {trophy.name}
        </div>
        <div style={{ fontSize: 14, color: "#b8a0a0", fontWeight: 700, lineHeight: 1.5, marginBottom: 14, fontFamily: "'Nunito', system-ui, sans-serif" }}>
          {trophy.description}
        </div>
        {trophy.stars !== undefined && (
          <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd166", marginBottom: 8 }}>
            ⭐ {trophy.stars} stars collected
          </div>
        )}
        {trophy.earnedDate && (
          <div style={{ fontSize: 12, color: "#50e890", fontWeight: 900, marginBottom: 20, fontFamily: "'Nunito', system-ui, sans-serif" }}>
            Earned {trophy.earnedDate}
          </div>
        )}
        <button
          onClick={onClose}
          style={{ background: "#9b72ff", border: "none", borderRadius: 14, color: "#fff", fontWeight: 900, fontSize: 14, padding: "10px 28px", cursor: "pointer", fontFamily: "'Nunito', system-ui, sans-serif" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildTrophiesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);
  const [loading, setLoading] = useState(true);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [fetchError, setFetchError] = useState(false);

  function loadTrophies() {
    setLoading(true);
    setFetchError(false);
    // Auth check first
    fetch("/api/child/session")
      .then((r) => {
        if (!r.ok) { router.replace("/child"); return null; }
        return true;
      })
      .catch(() => { router.replace("/child"); return null; })
      .then((authed) => {
        if (!authed) return;
        // Fetch trophies
        return fetch("/api/child/trophies")
          .then((r) => {
            if (!r.ok) throw new Error("fetch failed");
            return r.json();
          })
          .then((data: { trophies: ApiTrophy[] }) => {
            setTrophies(apiTrophiesToTrophyList(data.trophies));
          })
          .catch(() => {
            setFetchError(true);
          });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTrophies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const earnedCount = trophies.filter((t) => t.earned).length;
  const totalCount = trophies.length;

  const filtered = trophies.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "earned") return t.earned;
    if (activeFilter === "gold") return t.tier === "gold";
    if (activeFilter === "silver") return t.tier === "silver";
    if (activeFilter === "bronze") return t.tier === "bronze";
    return true;
  });

  // Sort: earned first, then by tier (gold > silver > bronze > locked)
  const TIER_ORDER: Record<TrophyTier, number> = { gold: 0, silver: 1, bronze: 2, locked: 3 };
  const sorted = [...filtered].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
  });

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: "#0a0820", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', system-ui, sans-serif", color: "#9b8ec4", fontSize: 18, fontWeight: 700 }}>
          Loading your trophies...
        </div>
      </AppFrame>
    );
  }

  if (fetchError) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: "#0a0820", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 15, color: "#9b8ec4", fontWeight: 700, marginBottom: 20, fontFamily: "'Nunito', system-ui, sans-serif" }}>
            Could not load trophies. Check your connection and try again.
          </div>
          <button
            onClick={loadTrophies}
            style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "#9b72ff", color: "#fff", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      </AppFrame>
    );
  }

  if (!loading && trophies.length === 0) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: "#0a0820", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#e8e0ff", marginBottom: 8, fontFamily: "'Nunito', system-ui, sans-serif" }}>No trophies yet!</div>
          <div style={{ fontSize: 15, color: "#9b8ec4", marginBottom: 24, fontFamily: "'Nunito', system-ui, sans-serif" }}>Keep learning to earn your first trophy.</div>
          <a href="/play" style={{ padding: "12px 28px", borderRadius: 12, background: "#9b72ff", color: "#fff", fontWeight: 800, textDecoration: "none", fontFamily: "'Nunito', system-ui, sans-serif" }}>Start a quest →</a>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div style={{ minHeight: "100vh", background: "#0a0820", fontFamily: "'Nunito', system-ui, sans-serif", color: "#e8e0ff", paddingBottom: 60 }}>
        {/* Back nav */}
        <div style={{ padding: "16px 24px 0" }}>
          <Link href="/child" style={{ color: "#9b72ff", fontWeight: 900, fontSize: 14, textDecoration: "none" }}>
            ← Home
          </Link>
        </div>

        {/* Page header */}
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", marginBottom: 6, fontFamily: "'Nunito', system-ui, sans-serif" }}>
            🏆 Your Trophies
          </div>
          <div style={{ fontSize: 14, color: "#b8a0e8", fontWeight: 700, marginBottom: 4, fontFamily: "'Nunito', system-ui, sans-serif" }}>
            Earn trophies by reaching big milestones!
          </div>

          {/* Stats pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#1a1060",
            border: "2px solid #9b72ff",
            borderRadius: 12,
            padding: "8px 16px",
            marginTop: 8,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 18 }}>🏆</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#9b72ff", fontFamily: "'Nunito', system-ui, sans-serif" }}>
              {earnedCount} of {totalCount} trophies unlocked
            </span>
          </div>
        </div>

        {/* Tier legend */}
        <div style={{ display: "flex", gap: 10, padding: "0 16px", marginBottom: 16, flexWrap: "wrap" }}>
          {(["bronze", "silver", "gold"] as const).map((tier) => {
            const cfg = TIER_CONFIG[tier];
            const count = trophies.filter((t) => t.tier === tier && t.earned).length;
            return (
              <div key={tier} style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#1a1060",
                border: `1px solid ${cfg.border}`,
                borderRadius: 10,
                padding: "6px 12px",
              }}>
                <span style={{ fontSize: 14 }}>{tier === "gold" ? "🏆" : tier === "silver" ? "🥈" : "🥉"}</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: cfg.labelColor, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                  {cfg.label} · {count} earned
                </span>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, padding: "0 16px", marginBottom: 16, flexWrap: "wrap" }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: `2px solid ${activeFilter === tab.key ? "#9b72ff" : "#2a2060"}`,
                background: activeFilter === tab.key ? "#9b72ff" : "#1a1060",
                color: activeFilter === tab.key ? "#fff" : "#7a5ea0",
                fontWeight: 900,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'Nunito', system-ui, sans-serif",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Trophy grid — 3 columns, larger than badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, padding: "0 16px" }}>
          {sorted.map((trophy, i) => (
            <TrophyCard key={trophy.id} trophy={trophy} animDelay={(i % 3) * 0.6} onSelect={setSelectedTrophy} />
          ))}
        </div>

        {sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#7a6090", fontSize: 15, fontWeight: 700 }}>
            No trophies match this filter.
          </div>
        )}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes trophy-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes modal-pop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Detail modal */}
      {selectedTrophy && (
        <TrophyDetailModal trophy={selectedTrophy} onClose={() => setSelectedTrophy(null)} />
      )}
    </AppFrame>
  );
}
