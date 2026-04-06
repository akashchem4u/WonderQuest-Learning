"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type TrophyTier = "gold" | "silver" | "bronze" | "locked";
type FilterTab = "all" | "earned" | "gold" | "bronze";

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

// ─── Stub data ────────────────────────────────────────────────────────────────

const TROPHIES: Trophy[] = [
  {
    id: "forest-champion",
    emoji: "🏆",
    name: "Forest Champion",
    world: "Enchanted Forest",
    worldEmoji: "🌲",
    description: "You explored every single node in the Enchanted Forest — all 12! That takes skill, bravery, and a love of adventure!",
    earnCondition: "Complete the Enchanted Forest world",
    tier: "gold",
    earned: true,
    earnedDate: "5 days ago",
    stars: 30,
    isNew: false,
  },
  {
    id: "ocean-hero",
    emoji: "🌊",
    name: "Ocean Hero",
    world: "Ocean Kingdom",
    worldEmoji: "🌊",
    description: "You dove deep and conquered the Ocean Kingdom — every wave, every challenge!",
    earnCondition: "Complete the Ocean Kingdom world",
    tier: "gold",
    earned: true,
    earnedDate: "4 days ago",
    stars: 28,
    isNew: false,
  },
  {
    id: "boss-slayer",
    emoji: "🥉",
    name: "Boss Slayer",
    world: "Any World",
    worldEmoji: "⚔️",
    description: "You defeated your very first legendary boss node!",
    earnCondition: "Defeat a boss node",
    tier: "bronze",
    earned: true,
    earnedDate: "3 days ago",
    isNew: true,
  },
  {
    id: "star-collector",
    emoji: "🥉",
    name: "Star Collector",
    world: "Any World",
    worldEmoji: "⭐",
    description: "You gathered 25 stars across your adventures — shining bright!",
    earnCondition: "Collect 25 stars",
    tier: "bronze",
    earned: true,
    earnedDate: "Today",
    isNew: true,
  },
  {
    id: "crystal-master",
    emoji: "💎",
    name: "Crystal Master",
    world: "Crystal Caverns",
    worldEmoji: "💎",
    description: "The Crystal Caverns await a true master. Will it be you?",
    earnCondition: "Complete Crystal Caverns",
    tier: "locked",
    earned: false,
  },
  {
    id: "volcano-victor",
    emoji: "🌋",
    name: "Volcano Victor",
    world: "Volcano Island",
    worldEmoji: "🌋",
    description: "Conquer the Volcano Island and prove you can handle the heat!",
    earnCondition: "Complete Volcano Island",
    tier: "locked",
    earned: false,
  },
  {
    id: "peak-climber",
    emoji: "🏔️",
    name: "Peak Climber",
    world: "Frozen Peaks",
    worldEmoji: "🏔️",
    description: "Scale the Frozen Peaks to earn this icy achievement.",
    earnCondition: "Complete Frozen Peaks",
    tier: "locked",
    earned: false,
  },
  {
    id: "world-champion",
    emoji: "🥇",
    name: "World Champion",
    world: "All Worlds",
    worldEmoji: "🌍",
    description: "Complete 3 full worlds to claim the legendary World Champion trophy!",
    earnCondition: "Complete 3 worlds",
    tier: "locked",
    earned: false,
  },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "earned", label: "Earned" },
  { key: "gold", label: "Gold" },
  { key: "bronze", label: "Bronze" },
];

// ─── Tier colors ──────────────────────────────────────────────────────────────

function tierBorder(tier: TrophyTier) {
  if (tier === "gold") return "#ffd166";
  if (tier === "silver") return "#aaaaaa";
  if (tier === "bronze") return "#c07040";
  return "#2a2060";
}

function tierNameColor(tier: TrophyTier) {
  if (tier === "gold") return "#ffd166";
  if (tier === "silver") return "#aaa";
  if (tier === "bronze") return "#c07040";
  return "#5a4080";
}

function tierBg(tier: TrophyTier) {
  if (tier === "gold") return "linear-gradient(135deg, #3a2a10, #2a2010)";
  if (tier === "silver") return "linear-gradient(135deg, #2a2a2a, #1a1a1a)";
  if (tier === "bronze") return "linear-gradient(135deg, #2a1a08, #1a1060)";
  return "#1a1060";
}

// ─── Trophy Card ──────────────────────────────────────────────────────────────

function TrophyCard({
  trophy,
  animDelay,
  onSelect,
}: {
  trophy: Trophy;
  animDelay?: number;
  onSelect: (t: Trophy) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = !trophy.earned;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !locked && onSelect(trophy)}
      onKeyDown={(e) => e.key === "Enter" && !locked && onSelect(trophy)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: locked ? "#1a1060" : tierBg(trophy.tier),
        border: `2px ${locked ? "dashed" : "solid"} ${tierBorder(trophy.tier)}`,
        borderRadius: 18,
        padding: "18px 14px",
        textAlign: "center",
        cursor: locked ? "default" : "pointer",
        opacity: locked ? 0.32 : 1,
        transform: hovered && !locked ? "translateY(-4px)" : "none",
        transition: "transform 0.2s, opacity 0.2s",
        position: "relative",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      {trophy.isNew && !locked && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "#ff7b6b",
            color: "#fff",
            fontSize: 9,
            fontWeight: 900,
            borderRadius: 6,
            padding: "2px 6px",
            letterSpacing: 0.5,
          }}
        >
          NEW
        </div>
      )}
      <div
        style={{
          fontSize: 40,
          marginBottom: 8,
          display: "block",
          animation: locked ? "none" : `trophy-bob 3s ${animDelay ?? 0}s ease-in-out infinite`,
        }}
      >
        {trophy.emoji}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: tierNameColor(trophy.tier),
          marginBottom: 4,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {trophy.name}
      </div>
      <div
        style={{
          fontSize: 10,
          color: locked ? "#3a2a60" : "#6a5030",
          fontWeight: 700,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {trophy.earned ? trophy.earnedDate : trophy.earnCondition}
      </div>
    </div>
  );
}

// ─── Trophy Detail Modal ──────────────────────────────────────────────────────

function TrophyDetailModal({
  trophy,
  onClose,
}: {
  trophy: Trophy;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 8, 32, 0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tierBg(trophy.tier),
          border: `2px solid ${tierBorder(trophy.tier)}`,
          borderRadius: 28,
          padding: "32px 28px",
          textAlign: "center",
          maxWidth: 380,
          width: "100%",
          fontFamily: "'Nunito', system-ui, sans-serif",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        }}
      >
        <div
          style={{
            fontSize: 80,
            display: "block",
            marginBottom: 12,
            animation: "trophy-bob 2.5s ease-in-out infinite",
          }}
        >
          {trophy.emoji}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: tierNameColor(trophy.tier),
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          {trophy.worldEmoji} {trophy.world}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 10,
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {trophy.name}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#b8a0a0",
            fontWeight: 700,
            lineHeight: 1.5,
            marginBottom: 14,
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {trophy.description}
        </div>
        {trophy.stars !== undefined && (
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#ffd166",
              marginBottom: 8,
            }}
          >
            {"⭐".repeat(Math.min(trophy.stars, 9))} {trophy.stars} stars collected
          </div>
        )}
        {trophy.earnedDate && (
          <div
            style={{
              fontSize: 12,
              color: "#5a4080",
              marginBottom: 20,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            Earned {trophy.earnedDate}
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            background: "#9b72ff",
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontWeight: 900,
            fontSize: 14,
            padding: "10px 28px",
            cursor: "pointer",
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildTrophiesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);

  const earnedCount = TROPHIES.filter((t) => t.earned).length;
  const totalCount = TROPHIES.length;

  const filtered = TROPHIES.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "earned") return t.earned;
    if (activeFilter === "gold") return t.tier === "gold";
    if (activeFilter === "bronze") return t.tier === "bronze";
    return true;
  });

  // Shelf trophies (gold/silver earned)
  const shelfTrophies = TROPHIES.filter((t) => t.earned && (t.tier === "gold" || t.tier === "silver"));
  const lockedShelf = TROPHIES.filter((t) => !t.earned && (t.tier === "gold" || t.tier === "silver" || t.tier === "locked")).slice(0, 4 - shelfTrophies.length);

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
        <div style={{ padding: "20px 24px 0" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 4,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            Trophy Wall 🏆
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#b8a0e8",
              fontWeight: 700,
              marginBottom: 20,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            {earnedCount} earned · {totalCount - earnedCount} more waiting for you!
          </div>
        </div>

        {/* Trophy Shelf */}
        <div style={{ padding: "0 16px", marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
              padding: "20px 16px 28px",
              background: "linear-gradient(180deg, #1a1060 0%, #0d0924 100%)",
              borderRadius: 24,
              border: "2px solid #2a2060",
              position: "relative",
            }}
          >
            {/* Shelf bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 8,
                background: "linear-gradient(90deg, #2a2060, #3a3080, #2a2060)",
                borderRadius: "0 0 22px 22px",
              }}
            />

            {/* Earned shelf items */}
            {shelfTrophies.map((trophy, i) => (
              <div
                key={trophy.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTrophy(trophy)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedTrophy(trophy)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 96,
                    height: 106,
                    borderRadius: 20,
                    background: tierBg(trophy.tier),
                    border: `2px solid ${tierBorder(trophy.tier)}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    transition: "transform 0.2s",
                  }}
                >
                  {/* shine */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 12,
                      width: 18,
                      height: 8,
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: "50%",
                      transform: "rotate(-30deg)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 44,
                      display: "block",
                      animation: `trophy-bob 3s ${i * 0.6}s ease-in-out infinite`,
                    }}
                  >
                    {trophy.emoji}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: "#c4a0ff",
                    marginTop: 8,
                    textAlign: "center",
                    maxWidth: 96,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  {trophy.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#5a4080",
                    fontWeight: 700,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  {trophy.worldEmoji} {trophy.world}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#4a3070",
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  {trophy.earnedDate}
                </div>
              </div>
            ))}

            {/* Locked shelf slots */}
            {lockedShelf.map((trophy) => (
              <div
                key={trophy.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: 0.35,
                }}
              >
                <div
                  style={{
                    width: 96,
                    height: 106,
                    background: "#1a1060",
                    border: "2px dashed #2a2060",
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 44,
                    filter: "grayscale(1) brightness(0.5)",
                  }}
                >
                  🏆
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#3a2a60",
                    marginTop: 8,
                    textAlign: "center",
                    maxWidth: 96,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  {trophy.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "0 16px",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: `2px solid ${activeFilter === tab.key ? "#9b72ff" : "#2a2060"}`,
                background: activeFilter === tab.key ? "#9b72ff" : "#1a1060",
                color: activeFilter === tab.key ? "#fff" : "#7a5ea0",
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Nunito', system-ui, sans-serif",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Trophy grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 14,
            padding: "0 16px",
          }}
        >
          {filtered.map((trophy, i) => (
            <TrophyCard
              key={trophy.id}
              trophy={trophy}
              animDelay={(i % 4) * 0.5}
              onSelect={setSelectedTrophy}
            />
          ))}
        </div>

        {/* Keyframe styles */}
        <style>{`
          @keyframes trophy-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}</style>
      </div>

      {/* Detail modal */}
      {selectedTrophy && (
        <TrophyDetailModal
          trophy={selectedTrophy}
          onClose={() => setSelectedTrophy(null)}
        />
      )}
    </AppFrame>
  );
}
