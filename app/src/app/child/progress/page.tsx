"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

type SessionData = {
  student: { displayName: string; avatarKey: string; launchBandCode: string };
  progression: { totalPoints: number; currentLevel: number; badgeCount: number; trophyCount: number };
};

type StatsData = {
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
  streakDays: number;
  masteredSkillsCount: number;
  lastSession: { correctAnswers: number; totalQuestions: number; pointsEarned: number } | null;
};

const font = "'Nunito', system-ui, sans-serif";
const bg = "#100b2e";
const violet = "#9b72ff";
const gold = "#ffd166";
const textMuted = "#9b8ec4";
const panelBorder = "#2a2060";
const green = "#50e890";

// ── Band config ────────────────────────────────────────────────────────────────
type BandId = "PREK" | "K1" | "G23" | "G45" | "G6";

interface BandConfig {
  id: BandId;
  code: string;
  emoji: string;
  name: string;
  range: string;
  color: string;
  bandBg: string;
  maxLevel: number;
  skills: string[];
}

const BANDS: BandConfig[] = [
  {
    id: "PREK",
    code: "prek",
    emoji: "🌈",
    name: "Pre-K Explorers",
    range: "Ages 3–5 · Pre-K",
    color: "#ffd166",
    bandBg: "#2a2010",
    maxLevel: 5,
    skills: ["Counting 1–5", "Letter recognition", "Basic shapes", "Colors", "Patterns"],
  },
  {
    id: "K1",
    code: "k1",
    emoji: "⭐",
    name: "K–1 Adventurers",
    range: "Ages 5–7 · K–Grade 1",
    color: "#9b72ff",
    bandBg: "#1e1470",
    maxLevel: 10,
    skills: ["Counting to 20", "Sight words", "Adding to 10", "Subtracting", "Phonics"],
  },
  {
    id: "G23",
    code: "g23",
    emoji: "🌊",
    name: "G2–3 Questers",
    range: "Ages 7–9 · Grades 2–3",
    color: "#58e8c1",
    bandBg: "#0a2a28",
    maxLevel: 15,
    skills: ["Multiplication intro", "Reading fluency", "Fractions", "Place value", "Writing"],
  },
  {
    id: "G45",
    code: "g45",
    emoji: "🔥",
    name: "G4–5 Champions",
    range: "Ages 9–11 · Grades 4–5",
    color: "#ff7b6b",
    bandBg: "#2a1010",
    maxLevel: 20,
    skills: ["Long division", "Decimals", "Geometry", "Reading comprehension", "Algebra intro"],
  },
  {
    id: "G6",
    code: "g6",
    emoji: "🚀",
    name: "Grade 6+ Legends",
    range: "Ages 11+ · Grade 6+",
    color: "#c084fc",
    bandBg: "#1a0a2e",
    maxLevel: 25,
    skills: ["Ratios", "Pre-algebra", "Advanced reading", "Statistics intro", "Geometry"],
  },
];

function resolveBand(code: string): BandConfig {
  const lower = (code ?? "").toLowerCase();
  return (
    BANDS.find((b) => b.code === lower) ??
    BANDS.find((b) => lower.includes(b.code)) ??
    BANDS[1]
  );
}

function buildSkillPills(
  band: BandConfig,
  masteredCount: number,
  currentLevel: number,
): { label: string; mastered: boolean }[] {
  return band.skills.map((label, i) => ({
    label,
    mastered:
      i < Math.min(masteredCount, band.skills.length) ||
      currentLevel >= band.maxLevel * ((i + 1) / band.skills.length),
  }));
}

type Tab = "band" | "map" | "stats";

// ── Node path data ─────────────────────────────────────────
type NodeState = "done" | "active" | "locked";
type ConnState = "done" | "active" | "empty";

interface PathNode {
  emoji: string;
  state: NodeState;
  stars?: number;
  label?: string;
  boss?: boolean;
}

interface World {
  emoji: string;
  name: string;
  status: "done" | "current" | "locked";
  nodesText: string;
  lockMsg?: string;
  pathNodes: PathNode[];
  connectors: ConnState[];
  opacity?: number;
}

const worlds: World[] = [
  {
    emoji: "🌲",
    name: "Enchanted Forest",
    status: "done",
    nodesText: "12/12 nodes",
    pathNodes: [
      { emoji: "🌱", state: "done", stars: 3, label: "Start" },
      { emoji: "🌿", state: "done", stars: 3 },
      { emoji: "🦋", state: "done", stars: 2 },
      { emoji: "🌸", state: "done", stars: 3 },
      { emoji: "🍄", state: "done", stars: 2 },
      { emoji: "🌺", state: "done", stars: 3 },
      { emoji: "🏆", state: "done", stars: 3, label: "Boss!", boss: true },
    ],
    connectors: ["done", "done", "done", "done", "done", "done"],
  },
  {
    emoji: "🌊",
    name: "Ocean Kingdom",
    status: "done",
    nodesText: "12/12 nodes",
    pathNodes: [
      { emoji: "🐠", state: "done", stars: 3, label: "Start" },
      { emoji: "🐚", state: "done", stars: 3 },
      { emoji: "🦀", state: "done", stars: 2 },
      { emoji: "🐬", state: "done", stars: 3 },
      { emoji: "🐙", state: "done", stars: 3 },
      { emoji: "🦈", state: "done", stars: 2 },
      { emoji: "🏆", state: "done", stars: 3, label: "Boss!", boss: true },
    ],
    connectors: ["done", "done", "done", "done", "done", "done"],
  },
  {
    emoji: "💎",
    name: "Crystal Caverns",
    status: "current",
    nodesText: "7/12 nodes",
    pathNodes: [
      { emoji: "💎", state: "done", stars: 3, label: "Start" },
      { emoji: "🔮", state: "done", stars: 3 },
      { emoji: "🗝️", state: "done", stars: 2 },
      { emoji: "🌈", state: "done", stars: 3 },
      { emoji: "🔥", state: "done", stars: 2 },
      { emoji: "⚡", state: "done", stars: 3 },
      { emoji: "🏔️", state: "active", label: "You!" },
      { emoji: "🌙", state: "locked" },
      { emoji: "⭐", state: "locked" },
      { emoji: "🌌", state: "locked" },
      { emoji: "👑", state: "locked" },
      { emoji: "🏆", state: "locked" },
    ],
    connectors: ["done", "done", "done", "done", "done", "active", "empty", "empty", "empty", "empty", "empty"],
  },
  {
    emoji: "🌋",
    name: "Volcano Island",
    status: "locked",
    nodesText: "",
    lockMsg: "🔒 Finish Crystal Caverns first",
    opacity: 0.3,
    pathNodes: [
      { emoji: "🌋", state: "locked" },
      { emoji: "🔴", state: "locked" },
      { emoji: "🟠", state: "locked" },
      { emoji: "🌡️", state: "locked" },
      { emoji: "🏔️", state: "locked" },
      { emoji: "🏆", state: "locked" },
    ],
    connectors: ["empty", "empty", "empty", "empty", "empty"],
  },
];

const worldProgress = [
  { emoji: "🌲", name: "Enchanted Forest", pct: 100, color: green },
  { emoji: "🌊", name: "Ocean Kingdom", pct: 100, color: green },
  { emoji: "💎", name: "Crystal Caverns", pct: 58, color: violet },
  { emoji: "🌋", name: "Volcano Island", pct: 0, color: violet, locked: true },
];

function StarRow({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: 1, position: "absolute", bottom: -16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ fontSize: 10 }}>⭐</span>
      ))}
    </div>
  );
}

function NodePath({ nodes, connectors, opacity }: { nodes: PathNode[]; connectors: ConnState[]; opacity?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "4px 0 36px", overflowX: "auto", opacity: opacity ?? 1 }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: "contents" }}>
          {/* Node */}
          <div
            className={node.state === "active" ? "progress-node-active" : ""}
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              border: `3px solid ${
                node.boss && node.state === "done"
                  ? gold
                  : node.state === "done"
                  ? green
                  : node.state === "active"
                  ? violet
                  : "#2a2060"
              }`,
              background:
                node.boss && node.state === "done"
                  ? "#1a1408"
                  : node.state === "done"
                  ? "#0a2a20"
                  : node.state === "active"
                  ? "#2a1880"
                  : "#1a1060",
              cursor: node.state === "locked" ? "default" : "pointer",
              position: "relative",
              flexShrink: 0,
              opacity: node.state === "locked" ? 0.3 : 1,
            }}
          >
            {node.emoji}

            {/* Checkmark */}
            {node.state === "done" && (
              <div
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: 20,
                  height: 20,
                  background: node.boss ? gold : green,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: node.boss ? "#1a1000" : "#0a2a15",
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
            )}

            {/* Stars below */}
            {node.state === "done" && node.stars && <StarRow count={node.stars} />}

            {/* Label */}
            {node.label && (
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#7a6090",
                  position: "absolute",
                  bottom: -28,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  fontFamily: font,
                }}
              >
                {node.label}
              </div>
            )}
          </div>

          {/* Connector (after each node except last) */}
          {i < connectors.length && (
            <div
              style={{
                width: 24,
                height: 4,
                background:
                  connectors[i] === "done"
                    ? green
                    : connectors[i] === "active"
                    ? "linear-gradient(90deg, #50e890, #9b72ff)"
                    : "#2a2060",
                flexShrink: 0,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Band Journey Map ──────────────────────────────────────────────────────────

function BandJourneyMap({ currentBandId }: { currentBandId: BandId }) {
  const currentIdx = BANDS.findIndex((b) => b.id === currentBandId);
  return (
    <div style={{ background: "#0d0a28", border: `1px solid ${panelBorder}`, borderRadius: 20, padding: "20px 24px", marginBottom: 28 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontFamily: font }}>
        Band Journey
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
        {BANDS.map((band, idx) => {
          const isCurrent = idx === currentIdx;
          const isDone = idx < currentIdx;
          const isLocked = idx > currentIdx;
          return (
            <div key={band.id} style={{ display: "contents" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 72, flexShrink: 0 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `3px solid ${isCurrent ? band.color : isDone ? green : "#2a2060"}`, background: isDone ? "#0a2a20" : isCurrent ? "#1e1470" : "#12102a", opacity: isLocked ? 0.35 : 1, position: "relative", boxShadow: isCurrent ? `0 0 18px ${band.color}55` : "none" }}>
                  {isLocked ? "🔒" : band.emoji}
                  {isDone && (
                    <div style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, background: green, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#0a2a15", fontWeight: 900 }}>✓</div>
                  )}
                  {isCurrent && (
                    <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", background: band.color, borderRadius: 4, padding: "1px 6px", fontSize: 8, fontWeight: 900, color: "#100b2e", whiteSpace: "nowrap", fontFamily: font }}>HERE</div>
                  )}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: isCurrent ? band.color : isDone ? green : "#4a3880", textAlign: "center", maxWidth: 68, lineHeight: 1.2, fontFamily: font }}>{band.id}</div>
              </div>
              {idx < BANDS.length - 1 && (
                <div style={{ width: 28, height: 3, background: isDone ? green : isCurrent ? `linear-gradient(90deg, ${band.color}, #2a2060)` : "#2a2060", flexShrink: 0, marginBottom: 22 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Current Band Card ──────────────────────────────────────────────────────────

function CurrentBandCard({ band, currentLevel, totalPoints: pts, masteredCount }: { band: BandConfig; currentLevel: number; totalPoints: number; masteredCount: number }) {
  const levelInBand = Math.max(1, currentLevel % (band.maxLevel + 1) || currentLevel);
  const levelPct = Math.min(100, Math.round((levelInBand / band.maxLevel) * 100));
  const nextMilestone = Math.ceil((pts + 1) / 100) * 100;
  const ptsToNext = nextMilestone - pts;
  const skillPills = buildSkillPills(band, masteredCount, currentLevel);
  return (
    <div style={{ background: `linear-gradient(135deg, ${band.bandBg} 0%, #100b2e 100%)`, border: `2px solid ${band.color}44`, borderRadius: 24, padding: "24px 24px 20px", marginBottom: 24, boxShadow: `0 8px 32px ${band.color}22`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 18, right: 18, background: band.color, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 900, color: "#100b2e", fontFamily: font }}>You&apos;re here!</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 44, lineHeight: 1 }}>{band.emoji}</span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: band.color, fontFamily: font }}>{band.name}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: textMuted, fontFamily: font }}>{band.range}</div>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: textMuted, fontFamily: font }}>Level progress within band</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: band.color, fontFamily: font }}>Level {levelInBand} / {band.maxLevel}</span>
        </div>
        <div style={{ height: 10, background: "#1a1060", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${levelPct}%`, background: `linear-gradient(90deg, ${band.color}99, ${band.color})`, borderRadius: 6, transition: "width 0.8s ease" }} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: textMuted, marginTop: 5, fontFamily: font }}>{ptsToNext} pts to next milestone ✨</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: "#7a6090", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: font }}>Skills in this band</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {skillPills.map(({ label, mastered }) => (
            <span key={label} style={{ padding: "5px 12px", borderRadius: 20, border: `2px solid ${mastered ? violet : "#3a2a80"}`, background: mastered ? "#2a1880" : "transparent", color: mastered ? "#d4b8ff" : "#5a4090", fontSize: 12, fontWeight: 700, fontFamily: font, display: "flex", alignItems: "center", gap: 5 }}>
              {mastered && <span style={{ fontSize: 10 }}>✓</span>}
              {label}
            </span>
          ))}
        </div>
      </div>
      <Link href="/play?sessionMode=guided-quest&entry=progress" style={{ display: "block", textAlign: "center", background: `linear-gradient(135deg, ${violet}, #7248e8)`, borderRadius: 14, padding: "14px 0", fontSize: 16, fontWeight: 900, color: "#fff", textDecoration: "none", fontFamily: font, boxShadow: "0 6px 20px rgba(155,114,255,0.4)" }}>
        Keep playing! 🎮
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ChildProgressPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("band");
  const [session, setSession] = useState<SessionData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/child/session").then((r) => {
        if (r.status === 401) { router.replace("/child"); return null; }
        return r.json() as Promise<SessionData>;
      }),
      fetch("/api/child/stats").then((r) => r.json() as Promise<StatsData>),
    ])
      .then(([sessionData, statsData]) => {
        if (sessionData) setSession(sessionData);
        setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const displayName = session?.student.displayName ?? "Explorer";
  const launchBandCode = session?.student.launchBandCode ?? "k1";
  const currentLevel = stats?.currentLevel ?? session?.progression.currentLevel ?? 1;
  const totalPoints = stats?.totalPoints ?? session?.progression.totalPoints ?? 0;
  const badgeCount = stats?.badgeCount ?? session?.progression.badgeCount ?? 0;
  const masteredCount = stats?.masteredSkillsCount ?? 0;
  const streakDays = stats?.streakDays ?? 0;
  const currentBand = resolveBand(launchBandCode);

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, color: "#9b8ec4", fontSize: 18, fontWeight: 700 }}>
          Loading your progress...
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes progress-node-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(155,114,255,0); }
        }
        .progress-node-active {
          animation: progress-node-pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div style={{ fontFamily: font, background: bg, minHeight: "100vh", color: "#fff" }}>
        {/* Nav + tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "16px 16px 0", alignItems: "center" }}>
          <Link
            href="/child"
            style={{
              padding: "8px 14px",
              background: "#1e1a40",
              border: "2px solid #2e2a50",
              borderRadius: 8,
              color: textMuted,
              fontFamily: font,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <div style={{ width: 1, height: 24, background: "#2e2a50" }} />
          {(["band", "map", "stats"] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = { band: "My Band", map: "Progress Map", stats: "Stats" };
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "8px 14px",
                  background: activeTab === t ? violet : "#1e1a40",
                  border: `2px solid ${activeTab === t ? violet : "#2e2a50"}`,
                  borderRadius: 8,
                  color: activeTab === t ? "#fff" : "#aaa",
                  fontFamily: font,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>

        {/* ── MY BAND TAB ── */}
        {activeTab === "band" && (
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 16px 60px" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4, fontFamily: font }}>{displayName}&apos;s Band 🌟</div>
            <div style={{ fontSize: 13, color: "#b8a0e8", fontWeight: 700, marginBottom: 24, fontFamily: font }}>Track your level, skills, and path through every band</div>
            <CurrentBandCard band={currentBand} currentLevel={currentLevel} totalPoints={totalPoints} masteredCount={masteredCount} />
            <BandJourneyMap currentBandId={currentBand.id} />
          </div>
        )}

        {/* ── PROGRESS MAP ── */}
        {activeTab === "map" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6, fontFamily: font }}>
              Your Journey Map 🗺️
            </div>
            <div style={{ fontSize: 14, color: "#b8a0e8", fontWeight: 700, marginBottom: 28, fontFamily: font }}>
              See every world you&apos;ve explored — and everything still ahead!
            </div>

            {worlds.map((world) => (
              <div key={world.name} style={{ marginBottom: 32 }}>
                {/* World header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 28, opacity: world.status === "locked" ? 0.4 : 1 }}>{world.emoji}</span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: world.status === "locked" ? "#5a4080" : "#fff",
                      fontFamily: font,
                    }}
                  >
                    {world.name}
                  </span>

                  {/* Status chip */}
                  {world.status === "done" && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: green,
                        padding: "4px 10px",
                        background: "#0a2a15",
                        borderRadius: 20,
                        border: `1px solid ${green}`,
                        fontFamily: font,
                      }}
                    >
                      ✓ Complete!
                    </span>
                  )}
                  {world.status === "current" && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: violet,
                        padding: "4px 10px",
                        background: "#1a1060",
                        borderRadius: 20,
                        border: `1px solid ${violet}`,
                        fontFamily: font,
                      }}
                    >
                      Current
                    </span>
                  )}
                  {world.status === "locked" && world.lockMsg && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: "#5a4080",
                        padding: "4px 10px",
                        background: "#1a1060",
                        borderRadius: 20,
                        border: "1px solid #2a2060",
                        fontFamily: font,
                      }}
                    >
                      {world.lockMsg}
                    </span>
                  )}

                  {world.nodesText && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: violet, marginLeft: "auto", fontFamily: font }}>
                      {world.nodesText}
                    </span>
                  )}
                </div>

                {/* Node path */}
                <NodePath nodes={world.pathNodes} connectors={world.connectors} opacity={world.opacity} />

                {/* Divider */}
                <div style={{ height: 1, background: "#1a1060", margin: "12px 0 24px" }} />
              </div>
            ))}

            {/* Play CTA */}
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Link href="/play?sessionMode=guided-quest&entry=progress" style={{ display: "inline-block", padding: "14px 36px", background: `linear-gradient(135deg, ${violet}, #7248e8)`, borderRadius: 16, fontSize: 16, fontWeight: 900, color: "#fff", textDecoration: "none", fontFamily: font, boxShadow: "0 6px 20px rgba(155,114,255,0.4)" }}>
                Keep playing! 🎮
              </Link>
            </div>
          </div>
        )}

        {/* ── STATS OVERVIEW ── */}
        {activeTab === "stats" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6, fontFamily: font }}>
              {displayName}&apos;s Journey 🌟
            </div>
            <div style={{ fontSize: 14, color: "#b8a0e8", fontWeight: 700, marginBottom: 28, fontFamily: font }}>
              Everything you&apos;ve collected on your adventure
            </div>

            {/* Stats bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { val: `⭐ ${totalPoints}`, label: "Stars collected" },
                { val: String(masteredCount), label: "Skills mastered" },
                { val: String(badgeCount), label: "Badges earned" },
                { val: streakDays > 0 ? `🔥 ${streakDays}` : "🔥 —", label: "Day streak" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#1a1060",
                    border: `1px solid ${panelBorder}`,
                    borderRadius: 14,
                    padding: 14,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: font }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#7a6090", fontWeight: 700, marginTop: 4, fontFamily: font }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Two-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* World progress */}
              <div style={{ background: "#1a1060", border: `1px solid ${panelBorder}`, borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, fontFamily: font }}>
                  Worlds
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {worldProgress.map((w) => (
                    <div key={w.name} style={{ display: "flex", alignItems: "center", gap: 10, opacity: w.locked ? 0.4 : 1 }}>
                      <span style={{ fontSize: 20 }}>{w.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: font }}>{w.name}</div>
                        <div style={{ height: 6, background: w.pct === 100 ? "#0a2a15" : "#2a2060", borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
                          <div style={{ height: "100%", width: `${w.pct}%`, background: w.color, borderRadius: 4 }} />
                        </div>
                      </div>
                      {w.locked ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#5a4080", fontFamily: font }}>🔒</span>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: w.color, fontFamily: font }}>{w.pct}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Last session + play CTA */}
              <div style={{ background: "#1a1060", border: `1px solid ${panelBorder}`, borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, fontFamily: font }}>Last Session</div>
                {stats?.lastSession ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: "Correct answers", val: String(stats.lastSession.correctAnswers) },
                      { label: "Questions answered", val: String(stats.lastSession.totalQuestions) },
                      { label: "Points earned", val: `⭐ ${stats.lastSession.pointsEarned}` },
                    ].map((row) => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#c4a0ff", fontFamily: font }}>
                        <span style={{ color: textMuted }}>{row.label}</span>
                        <span>{row.val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 700, color: textMuted, fontFamily: font }}>No sessions yet — start playing!</div>
                )}
                <div style={{ marginTop: "auto" }}>
                  <Link href="/play?sessionMode=guided-quest&entry=progress" style={{ display: "block", textAlign: "center", background: `linear-gradient(135deg, ${violet}, #7248e8)`, borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 900, color: "#fff", textDecoration: "none", fontFamily: font }}>
                    Keep playing! 🎮
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
