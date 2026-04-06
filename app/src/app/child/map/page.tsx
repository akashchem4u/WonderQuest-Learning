"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeState = "done" | "active" | "locked";

interface WorldNode {
  emoji: string;
  label: string;
  stars: number; // 0–3
  state: NodeState;
  isBoss?: boolean;
}

interface World {
  id: string;
  emoji: string;
  name: string;
  status: "complete" | "current" | "locked";
  lockReason?: string;
  completedNodes: number;
  totalNodes: number;
  nodes: WorldNode[];
}

// ─── Stub data ────────────────────────────────────────────────────────────────

const WORLDS: World[] = [
  {
    id: "enchanted-forest",
    emoji: "🌲",
    name: "Enchanted Forest",
    status: "complete",
    completedNodes: 7,
    totalNodes: 7,
    nodes: [
      { emoji: "🌱", label: "Start", stars: 3, state: "done" },
      { emoji: "🌿", label: "Sprout", stars: 3, state: "done" },
      { emoji: "🦋", label: "Flutter", stars: 2, state: "done" },
      { emoji: "🌸", label: "Bloom", stars: 3, state: "done" },
      { emoji: "🍄", label: "Shroom", stars: 2, state: "done" },
      { emoji: "🌺", label: "Petal", stars: 3, state: "done" },
      { emoji: "🏆", label: "Boss!", stars: 3, state: "done", isBoss: true },
    ],
  },
  {
    id: "ocean-kingdom",
    emoji: "🌊",
    name: "Ocean Kingdom",
    status: "complete",
    completedNodes: 7,
    totalNodes: 7,
    nodes: [
      { emoji: "🐠", label: "Start", stars: 3, state: "done" },
      { emoji: "🐚", label: "Shell", stars: 3, state: "done" },
      { emoji: "🦀", label: "Crab", stars: 2, state: "done" },
      { emoji: "🐬", label: "Dolphin", stars: 3, state: "done" },
      { emoji: "🐙", label: "Octopus", stars: 3, state: "done" },
      { emoji: "🦈", label: "Shark", stars: 2, state: "done" },
      { emoji: "🏆", label: "Boss!", stars: 3, state: "done", isBoss: true },
    ],
  },
  {
    id: "crystal-caverns",
    emoji: "💎",
    name: "Crystal Caverns",
    status: "current",
    completedNodes: 7,
    totalNodes: 12,
    nodes: [
      { emoji: "💎", label: "Start", stars: 3, state: "done" },
      { emoji: "🔮", label: "Crystal", stars: 3, state: "done" },
      { emoji: "🗝️", label: "Key", stars: 2, state: "done" },
      { emoji: "🌈", label: "Rainbow", stars: 3, state: "done" },
      { emoji: "🔥", label: "Flame", stars: 2, state: "done" },
      { emoji: "⚡", label: "Spark", stars: 3, state: "done" },
      { emoji: "🏔️", label: "You!", stars: 0, state: "active" },
      { emoji: "🌙", label: "Moon", stars: 0, state: "locked" },
      { emoji: "⭐", label: "Star", stars: 0, state: "locked" },
      { emoji: "🌌", label: "Galaxy", stars: 0, state: "locked" },
      { emoji: "👑", label: "Crown", stars: 0, state: "locked" },
      { emoji: "🏆", label: "Boss!", stars: 0, state: "locked", isBoss: true },
    ],
  },
  {
    id: "volcano-island",
    emoji: "🌋",
    name: "Volcano Island",
    status: "locked",
    lockReason: "Finish Crystal Caverns first",
    completedNodes: 0,
    totalNodes: 6,
    nodes: [
      { emoji: "🌋", label: "Start", stars: 0, state: "locked" },
      { emoji: "🔴", label: "Ember", stars: 0, state: "locked" },
      { emoji: "🟠", label: "Lava", stars: 0, state: "locked" },
      { emoji: "🌡️", label: "Heat", stars: 0, state: "locked" },
      { emoji: "🏔️", label: "Summit", stars: 0, state: "locked" },
      { emoji: "🏆", label: "Boss!", stars: 0, state: "locked", isBoss: true },
    ],
  },
];

type SessionData = {
  student: { displayName: string; avatarKey: string; launchBandCode: string };
  progression: { totalPoints: number; currentLevel: number; badgeCount: number; trophyCount: number };
};

const STATS = {
  totalStars: 42,
  nodesExplored: 31,
  badgesEarned: 3,
  dayStreak: 5,
};

const RECENT_WINS = [
  { icon: "⭐", text: "Earned 3 stars · Word Builders", meta: "today" },
  { icon: "🏅", text: "Crystal Explorer badge", meta: "today" },
  { icon: "🔥", text: "5-day streak!", meta: "today" },
  { icon: "🌊", text: "Ocean Kingdom complete", meta: "4d ago" },
];

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  base: "#100b2e",
  baseDark: "#0d0924",
  card: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.10)",
  panelBg: "#12103a",
  panelBorder: "#2a2060",
  mint: "#58e8c1",
  mintDim: "#0a2a20",
  violet: "#9b72ff",
  violetDim: "#2a1880",
  gold: "#ffd166",
  goldDim: "#1a1408",
  coral: "#ff7b6b",
  textMuted: "#7a6090",
  textSub: "#b8a0e8",
  textLavender: "#c4a0ff",
};

// ─── Node component ───────────────────────────────────────────────────────────

function MapNode({ node }: { node: WorldNode }) {
  const isDone = node.state === "done";
  const isActive = node.state === "active";
  const isLocked = node.state === "locked";
  const isBossNode = node.isBoss;

  const borderColor = isBossNode && isDone
    ? C.gold
    : isDone
    ? C.mint
    : isActive
    ? C.violet
    : C.panelBorder;

  const bgColor = isBossNode && isDone
    ? C.goldDim
    : isDone
    ? C.mintDim
    : isActive
    ? C.violetDim
    : "#1a1060";

  const stars = isDone && node.stars > 0
    ? "⭐".repeat(node.stars)
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
          border: `3px solid ${borderColor}`,
          background: bgColor,
          cursor: isLocked ? "default" : "pointer",
          opacity: isLocked ? 0.3 : 1,
          position: "relative",
          transition: "transform 0.15s",
          animation: isActive ? "nd-pulse 1.5s ease-in-out infinite" : "none",
          boxShadow: isActive ? "0 0 16px rgba(155,114,255,0.4)" : "none",
          flexShrink: 0,
        }}
      >
        {node.emoji}
        {isDone && (
          <div
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              width: "20px",
              height: "20px",
              background: isBossNode ? C.gold : C.mint,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              color: isBossNode ? "#1a1000" : "#0a2a15",
              fontWeight: 900,
            }}
          >
            ✓
          </div>
        )}
      </div>
      {stars && (
        <div style={{ marginTop: "3px", fontSize: "9px", letterSpacing: "1px" }}>
          {stars}
        </div>
      )}
      <div
        style={{
          marginTop: stars ? "1px" : "4px",
          fontSize: "9px",
          fontWeight: 700,
          color: isActive ? C.violet : C.textMuted,
          whiteSpace: "nowrap",
          maxWidth: "64px",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {node.label}
      </div>
    </div>
  );
}

// ─── Connector component ──────────────────────────────────────────────────────

function Connector({ fromState, toState }: { fromState: NodeState; toState: NodeState }) {
  const isDone = fromState === "done" && (toState === "done" || toState === "active");
  const isActive = fromState === "done" && toState === "active";

  return (
    <div
      style={{
        width: "24px",
        height: "4px",
        borderRadius: "2px",
        flexShrink: 0,
        marginTop: "-24px", // vertically align with node center
        background: isActive
          ? `linear-gradient(90deg, ${C.mint}, ${C.violet})`
          : isDone
          ? C.mint
          : C.panelBorder,
      }}
    />
  );
}

// ─── World row component ──────────────────────────────────────────────────────

function WorldRow({ world }: { world: World }) {
  const isLocked = world.status === "locked";

  const statusChip =
    world.status === "complete" ? (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 900,
          color: C.mint,
          padding: "4px 10px",
          background: "#0a2a15",
          borderRadius: "20px",
          border: `1px solid ${C.mint}`,
        }}
      >
        ✓ Complete!
      </span>
    ) : world.status === "current" ? (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 900,
          color: C.violet,
          padding: "4px 10px",
          background: "#1a1060",
          borderRadius: "20px",
          border: `1px solid ${C.violet}`,
        }}
      >
        Current
      </span>
    ) : (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 900,
          color: C.textMuted,
          padding: "4px 10px",
          background: "#1a1060",
          borderRadius: "20px",
          border: "1px solid #2a2060",
        }}
      >
        🔒 {world.lockReason ?? "Locked"}
      </span>
    );

  return (
    <div style={{ marginBottom: "32px" }}>
      {/* World header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "14px",
          opacity: isLocked ? 0.5 : 1,
        }}
      >
        <span style={{ fontSize: "28px" }}>{world.emoji}</span>
        <span style={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>{world.name}</span>
        {statusChip}
        {!isLocked && (
          <span style={{ fontSize: "12px", fontWeight: 700, color: C.violet, marginLeft: "auto" }}>
            {world.completedNodes}/{world.totalNodes} nodes
          </span>
        )}
      </div>

      {/* Node path */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          paddingBottom: "32px",
          overflowX: "auto",
          opacity: isLocked ? 0.3 : 1,
        }}
      >
        {world.nodes.map((node, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <MapNode node={node} />
            {i < world.nodes.length - 1 && (
              <Connector
                fromState={node.state}
                toState={world.nodes[i + 1].state}
              />
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "#1a1060" }} />
    </div>
  );
}

// ─── Stats tab ────────────────────────────────────────────────────────────────

function StatsView({ liveStats }: { liveStats: typeof STATS }) {
  return (
    <div>
      {/* Stats bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {[
          { val: `⭐ ${liveStats.totalStars}`, label: "Stars collected" },
          { val: String(liveStats.nodesExplored), label: "Nodes explored" },
          { val: String(liveStats.badgesEarned), label: "Badges earned" },
          { val: `🔥 ${liveStats.dayStreak}`, label: "Day streak" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#1a1060",
              border: `1px solid ${C.panelBorder}`,
              borderRadius: "14px",
              padding: "14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              {s.val}
            </div>
            <div style={{ fontSize: "11px", color: C.textMuted, fontWeight: 700, marginTop: "4px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* World progress */}
        <div
          style={{
            background: "#1a1060",
            border: `1px solid ${C.panelBorder}`,
            borderRadius: "16px",
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 900,
              color: C.violet,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "14px",
            }}
          >
            Worlds
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {WORLDS.map((w) => {
              const pct = Math.round((w.completedNodes / w.totalNodes) * 100);
              const isLocked = w.status === "locked";
              return (
                <div
                  key={w.id}
                  style={{ display: "flex", alignItems: "center", gap: "10px", opacity: isLocked ? 0.4 : 1 }}
                >
                  <span style={{ fontSize: "20px" }}>{w.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "#fff" }}>{w.name}</div>
                    <div
                      style={{
                        height: "6px",
                        background: "#0a2a15",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginTop: "4px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: w.status === "complete" ? C.mint : C.violet,
                          borderRadius: "4px",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: isLocked ? C.textMuted : w.status === "complete" ? C.mint : C.violet,
                    }}
                  >
                    {isLocked ? "🔒" : `${pct}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent wins */}
        <div
          style={{
            background: "#1a1060",
            border: `1px solid ${C.panelBorder}`,
            borderRadius: "16px",
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 900,
              color: C.violet,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "14px",
            }}
          >
            Recent Wins
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {RECENT_WINS.map((win, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: C.textLavender,
                }}
              >
                <span style={{ fontSize: "18px" }}>{win.icon}</span>
                <span style={{ flex: 1 }}>{win.text}</span>
                <span style={{ fontSize: "10px", color: C.textMuted }}>{win.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PIN gate (same pattern as child/page.tsx) ────────────────────────────────

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function appendDigit(d: string) {
    setPin((p) => (p.length >= 4 ? p : p + d));
  }
  function removeDigit() {
    setPin((p) => p.slice(0, -1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4) {
      setError("Enter your 4-digit PIN.");
      return;
    }
    try {
      const res = await fetch("/api/child/session", { method: "GET" });
      if (res.ok) {
        onUnlock();
      } else {
        setError("Session not found. Please sign in from the child home page.");
      }
    } catch {
      // Graceful fallback — allow demo access
      onUnlock();
    }
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main
        style={{
          minHeight: "100vh",
          background: C.base,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            background: C.card,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: "28px",
            padding: "36px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗺️</div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#fff",
              marginBottom: "6px",
            }}
          >
            World Map
          </div>
          <div
            style={{
              fontSize: "14px",
              color: C.textSub,
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            Enter your PIN to see your adventure!
          </div>

          <form onSubmit={handleSubmit}>
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
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: i < pin.length ? C.violet : "transparent",
                    border: `2px solid ${i < pin.length ? C.violet : C.panelBorder}`,
                    transition: "all 0.15s",
                  }}
                />
              ))}
            </div>

            {/* Number pad */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"].map((k) => (
                <button
                  key={k}
                  type={k === "✓" ? "submit" : "button"}
                  onClick={k === "⌫" ? removeDigit : k === "✓" ? undefined : () => appendDigit(k)}
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    border: `1px solid ${C.panelBorder}`,
                    background: k === "✓" ? C.violet : "#1a1060",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "18px",
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {k}
                </button>
              ))}
            </div>

            {error && (
              <div
                style={{
                  fontSize: "13px",
                  color: C.coral,
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                {error}
              </div>
            )}
          </form>

          <Link
            href="/child"
            style={{
              fontSize: "13px",
              color: C.textMuted,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to home
          </Link>
        </div>
      </main>
    </AppFrame>
  );
}

// ─── Main map page ─────────────────────────────────────────────────────────────

export default function ChildMapPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "stats">("map");
  const [session, setSession] = useState<SessionData | null>(null);
  const currentWorld = WORLDS.find((w) => w.status === "current") ?? WORLDS[0];

  // Try to restore session silently
  useEffect(() => {
    async function tryRestore() {
      try {
        const res = await fetch("/api/child/session", { method: "GET" });
        if (res.ok) {
          const data: SessionData = await res.json();
          setSession(data);
          setUnlocked(true);
        }
      } catch {
        // Stay on PIN gate
      }
    }
    void tryRestore();
  }, []);

  const liveStats = {
    totalStars: session?.progression.totalPoints ?? STATS.totalStars,
    nodesExplored: STATS.nodesExplored,
    badgesEarned: session?.progression.badgeCount ?? STATS.badgesEarned,
    dayStreak: STATS.dayStreak,
  };

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      {/* Keyframe animations injected via a style tag */}
      <style>{`
        @keyframes nd-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155, 114, 255, 0.5); }
          50% { box-shadow: 0 0 0 10px rgba(155, 114, 255, 0); }
        }
      `}</style>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 280px",
          gridTemplateRows: "64px 1fr",
          minHeight: "100vh",
          background: C.base,
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* ── Top nav bar ────────────────────────────────────────── */}
        <div
          style={{
            gridColumn: "1 / -1",
            background: C.baseDark,
            borderBottom: `2px solid #1e1860`,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: "16px",
          }}
        >
          <button
            onClick={() => router.push("/child")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              color: C.textMuted,
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "8px",
              transition: "color 0.15s",
            }}
          >
            ← Home
          </button>

          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: C.violet,
              letterSpacing: "-0.5px",
            }}
          >
            Wonder<span style={{ color: C.gold }}>Quest</span>
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: 900,
              color: "#fff",
              marginLeft: "8px",
            }}
          >
            🗺️ World Map
          </div>

          <div style={{ flex: 1 }} />

          {/* Current world pill */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: C.textLavender,
              background: "rgba(155,114,255,0.12)",
              border: `1px solid rgba(155,114,255,0.2)`,
              borderRadius: "20px",
              padding: "5px 14px",
            }}
          >
            {currentWorld.emoji} {currentWorld.name}
          </div>

          {/* Progress stat */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: C.violet,
            }}
          >
            {currentWorld.completedNodes}/{currentWorld.totalNodes} nodes
          </div>

          {/* Stars */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "15px",
              fontWeight: 900,
              color: C.gold,
            }}
          >
            ⭐ {liveStats.totalStars}
          </div>

          {/* Streak */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#ff9d3b",
            }}
          >
            🔥 {liveStats.dayStreak}
          </div>
        </div>

        {/* ── Left sidebar ────────────────────────────────────────── */}
        <nav
          style={{
            background: C.baseDark,
            borderRight: "1px solid #1e1860",
            padding: "20px 0",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {[
            { icon: "🏠", label: "Home", href: "/child" },
            { icon: "🗺️", label: "World Map", active: true },
            { icon: "⭐", label: "My Stars" },
            { icon: "🏅", label: "Badges", badge: String(liveStats.badgesEarned) },
            { icon: "🏆", label: "Trophies" },
            { icon: "🎯", label: "Daily Quest" },
          ].map((item) => (
            <div
              key={item.label}
              onClick={item.href ? () => router.push(item.href!) : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 18px",
                fontSize: "15px",
                fontWeight: 700,
                color: item.active ? C.violet : C.textMuted,
                cursor: item.href || !item.active ? "pointer" : "default",
                borderLeft: item.active ? `3px solid ${C.violet}` : "3px solid transparent",
                background: item.active ? "#1a1460" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "20px", width: "24px", textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
              {"badge" in item && item.badge ? (
                <span
                  style={{
                    marginLeft: "auto",
                    background: C.violet,
                    color: "#fff",
                    borderRadius: "10px",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 7px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </div>
          ))}
        </nav>

        {/* ── Main content ────────────────────────────────────────── */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            background: C.base,
          }}
        >
          {/* Tab switcher */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {(["map", "stats"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "10px",
                  border: `2px solid ${activeTab === tab ? C.violet : C.panelBorder}`,
                  background: activeTab === tab ? C.violet : "#1e1a40",
                  color: activeTab === tab ? "#fff" : "#aaa",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                }}
              >
                {tab === "map" ? "Progress Map" : "Stats Overview"}
              </button>
            ))}
          </div>

          {activeTab === "map" ? (
            <>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: "4px",
                }}
              >
                Your Journey Map 🗺️
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: C.textSub,
                  fontWeight: 700,
                  marginBottom: "24px",
                }}
              >
                See every world you've explored — and everything still ahead!
              </div>

              {WORLDS.map((world) => (
                <WorldRow key={world.id} world={world} />
              ))}
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: "4px",
                }}
              >
                Your Journey 🌟
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: C.textSub,
                  fontWeight: 700,
                  marginBottom: "24px",
                }}
              >
                Everything you've collected on your adventure
              </div>
              <StatsView liveStats={liveStats} />
            </>
          )}
        </div>

        {/* ── Right rail ──────────────────────────────────────────── */}
        <div
          style={{
            background: C.baseDark,
            borderLeft: "1px solid #1e1860",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            overflowY: "auto",
          }}
        >
          {/* Streak card */}
          <div
            style={{
              padding: "16px",
              borderRadius: "22px",
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: C.violet,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Current Streak 🔥
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "32px" }}>🔥</span>
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {liveStats.dayStreak}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textMuted,
                    fontWeight: 700,
                    marginTop: "2px",
                  }}
                >
                  Day quest streak
                </div>
              </div>
            </div>
          </div>

          {/* Total stars card */}
          <div
            style={{
              padding: "16px",
              borderRadius: "22px",
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: C.violet,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Total Stars ⭐
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "32px" }}>⭐</span>
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    color: C.gold,
                    lineHeight: 1,
                  }}
                >
                  {liveStats.totalStars}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textMuted,
                    fontWeight: 700,
                    marginTop: "2px",
                  }}
                >
                  Stars collected
                </div>
              </div>
            </div>
          </div>

          {/* Badges earned card */}
          <div
            style={{
              padding: "16px",
              borderRadius: "22px",
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: C.violet,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Badges Earned 🏅
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "32px" }}>🏅</span>
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {liveStats.badgesEarned}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textMuted,
                    fontWeight: 700,
                    marginTop: "2px",
                  }}
                >
                  Badges unlocked
                </div>
              </div>
            </div>
          </div>

          {/* Worlds completed */}
          <div
            style={{
              padding: "16px",
              borderRadius: "22px",
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: C.violet,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
              }}
            >
              Worlds 🌍
            </div>
            {WORLDS.map((w) => {
              const pct = Math.round((w.completedNodes / w.totalNodes) * 100);
              return (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    opacity: w.status === "locked" ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{w.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: w.status === "locked" ? C.textMuted : "#fff",
                        marginBottom: "3px",
                      }}
                    >
                      {w.name}
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: C.panelBorder,
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background:
                            w.status === "complete"
                              ? C.mint
                              : w.status === "current"
                              ? C.violet
                              : C.panelBorder,
                          borderRadius: "2px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color:
                        w.status === "complete"
                          ? C.mint
                          : w.status === "current"
                          ? C.violet
                          : C.textMuted,
                    }}
                  >
                    {w.status === "locked" ? "🔒" : `${pct}%`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Recent wins */}
          <div
            style={{
              padding: "16px",
              borderRadius: "22px",
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: C.violet,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Recent Wins 🎉
            </div>
            {RECENT_WINS.map((win, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 0",
                  borderBottom:
                    i < RECENT_WINS.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                  fontSize: "12px",
                  color: C.textLavender,
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: "16px" }}>{win.icon}</span>
                <span style={{ flex: 1 }}>{win.text}</span>
                <span style={{ fontSize: "10px", color: C.textMuted }}>{win.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
