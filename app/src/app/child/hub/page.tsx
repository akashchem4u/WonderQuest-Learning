"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

const font = "'Nunito', system-ui, sans-serif";
const bg = "#100b2e";
const bgDark = "#0d0924";
const violet = "#9b72ff";
const gold = "#ffd166";
const mint = "#58e8c1";
const coral = "#ff7b6b";
const textPrimary = "#e8e0ff";
const textMuted = "#9b8ec4";
const panel = "#1a1460";
const panelBorder = "#2a2060";
const green = "#50e890";

type Tab = "home" | "band" | "worlds";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionData = {
  student: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    preferredThemeCode: string | null;
    streakCount?: number;
  };
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
};

// ─── Avatar emoji helper ──────────────────────────────────────────────────────

function getAvatarEmoji(avatarKey: string) {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "🦋";
}

// ─── World data derived from band ────────────────────────────────────────────

function getWorldForBand(bandCode: string) {
  switch (bandCode) {
    case "PREK":
      return {
        name: "Rainbow Meadows 🌈",
        totalNodes: 10,
        completedNodes: 2,
        nodes: ["🌸", "🌻", "🌈", "🦋", "🍀", "⭐", "🌙", "🌊", "🌺", "🎈"],
        quests: [
          { icon: "🔤", name: "Letter Match", world: "Rainbow Meadows", stars: "⭐⭐⭐ earn up to 3" },
          { icon: "🔢", name: "Count & Go", world: "Rainbow Meadows", stars: "⭐⭐ earn up to 2" },
          { icon: "🎨", name: "Shape Hunt", world: "Rainbow Meadows", stars: "⭐⭐⭐ earn up to 3" },
        ],
      };
    case "G23":
      return {
        name: "Starship Academy 🚀",
        totalNodes: 14,
        completedNodes: 5,
        nodes: ["🚀", "🌍", "🌙", "⭐", "🛸", "🪐", "☄️", "🌌", "🔭", "🛰️", "🌠", "🌟", "💫", "👾"],
        quests: [
          { icon: "📖", name: "Story Missions", world: "Starship Academy", stars: "⭐⭐⭐ earn up to 3" },
          { icon: "➗", name: "Math Blasters", world: "Starship Academy", stars: "⭐⭐⭐ earn up to 3" },
          { icon: "🔬", name: "Lab Puzzles", world: "Starship Academy", stars: "⭐⭐ earn up to 2" },
        ],
      };
    case "G45":
      return {
        name: "Engineer's Forge 🏗️",
        totalNodes: 16,
        completedNodes: 4,
        nodes: ["🔧", "⚙️", "🏗️", "🧱", "🔩", "💡", "🛠️", "🔌", "📐", "🧮", "🪛", "⚡", "🏆", "🎯", "🌐", "👑"],
        quests: [
          { icon: "📚", name: "Word Craft", world: "Engineer's Forge", stars: "⭐⭐⭐ earn up to 3" },
          { icon: "🧮", name: "Equation Lab", world: "Engineer's Forge", stars: "⭐⭐⭐ earn up to 3" },
          { icon: "🧩", name: "Logic Bridge", world: "Engineer's Forge", stars: "⭐⭐ earn up to 2" },
        ],
      };
    default: // K1
      return {
        name: "Crystal Caverns 💎",
        totalNodes: 12,
        completedNodes: 6,
        nodes: ["🌟", "🔮", "💎", "🗝️", "🌈", "🔥", "🏔️", "🌙", "⚡", "🦋", "🌟", "👑"],
        quests: [
          { icon: "🔤", name: "Word Builders", world: "Crystal Caverns", stars: "⭐⭐⭐ earn up to 3" },
          { icon: "🔢", name: "Number Tower", world: "Crystal Caverns", stars: "⭐⭐ earn up to 2" },
          { icon: "🎵", name: "Sound Hunt", world: "Crystal Caverns", stars: "⭐⭐⭐ earn up to 3" },
        ],
      };
  }
}

const bands = [
  {
    key: "PREK",
    icon: "🌈",
    name: "Pre-K Explorers",
    ages: "Ages 3\u20135 \u00b7 Early learners",
    desc: "Letters, counting, shapes, and colors. Big pictures, voice-first.",
    bg: "linear-gradient(135deg, #2a2010, #1a1408)",
    border: gold,
    nameColor: gold,
  },
  {
    key: "K1",
    icon: "⚡",
    name: "K\u20131 Adventurers",
    ages: "Ages 5\u20137 \u00b7 Kindergarten\u2013Grade 1",
    desc: "Phonics, first words, simple addition. Where the magic begins!",
    bg: "linear-gradient(135deg, #1a1060, #0d0830)",
    border: violet,
    nameColor: violet,
  },
  {
    key: "G23",
    icon: "🌊",
    name: "G2\u20133 Questers",
    ages: "Ages 7\u20139 \u00b7 Grades 2\u20133",
    desc: "Reading, multiplication, problem solving. More challenge unlocked.",
    bg: "linear-gradient(135deg, #0a2a28, #061a18)",
    border: mint,
    nameColor: mint,
  },
  {
    key: "G45",
    icon: "🔥",
    name: "G4\u20135 Champions",
    ages: "Ages 9\u201311 \u00b7 Grades 4\u20135",
    desc: "Complex math, reading comprehension, reasoning. For the bold.",
    bg: "linear-gradient(135deg, #2a1010, #1a0808)",
    border: coral,
    nameColor: coral,
  },
];

const worlds = [
  { emoji: "🌲", name: "Enchanted Forest", nodes: "12/12 nodes complete", prog: 100, state: "done" },
  { emoji: "🌊", name: "Ocean Kingdom", nodes: "12/12 nodes complete", prog: 100, state: "done" },
  { emoji: "💎", name: "Crystal Caverns", nodes: "7/12 nodes done", prog: 58, state: "current" },
  { emoji: "🌋", name: "Volcano Island", nodes: "0/12 nodes", prog: 0, state: "open" },
  { emoji: "🏔️", name: "Frozen Peaks", nodes: "\uD83D\uDD12 Unlock after Volcano", prog: 0, state: "locked" },
  { emoji: "🌌", name: "Galaxy Station", nodes: "\uD83D\uDD12 Coming soon", prog: 0, state: "locked" },
];

const sidebarItems = [
  { icon: "🏠", label: "Home", key: "home" },
  { icon: "🗺️", label: "World Map", key: "worlds" },
  { icon: "⭐", label: "My Stars", key: "stars" },
  { icon: "🏅", label: "Badges", key: "badges" },
  { icon: "🏆", label: "Trophies", key: "trophies" },
  { icon: "🎯", label: "Daily Quest", key: "daily" },
];

type AssignmentItem = {
  id: string;
  title: string;
  description: string | null;
  skillCodes: string[];
  sessionMode: string;
  dueDate: string | null;
  createdAt: string;
  teacherName: string;
};

type StatsData = {
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
  streakDays: number;
  masteredSkillsCount: number;
  lastSession: {
    correctAnswers: number;
    totalQuestions: number;
    pointsEarned: number;
  } | null;
};

export default function ChildHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedBand, setSelectedBand] = useState("K1");
  const [sidebarActive, setSidebarActive] = useState("home");
  const [session, setSession] = useState<SessionData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);

  useEffect(() => {
    fetch("/api/child/session")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: SessionData) => {
        setSession(data);
        setSelectedBand(data.student.launchBandCode);
      })
      .catch(() => setSessionError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/child/assignments")
      .then((res) => (res.ok ? res.json() : { assignments: [] }))
      .then((data: { assignments?: AssignmentItem[] }) => {
        setAssignments(data.assignments ?? []);
      })
      .catch(() => {/* non-fatal */});
  }, []);

  useEffect(() => {
    fetch("/api/child/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StatsData | null) => { if (data) setStats(data); })
      .catch(() => {/* non-fatal */});
  }, []);

  const streak = session?.student?.streakCount ?? stats?.streakDays ?? 0;
  const stars = session?.progression.totalPoints ?? stats?.totalPoints ?? 0;
  const badgeCount = session?.progression.badgeCount ?? stats?.badgeCount ?? 0;
  const currentLevel = session?.progression.currentLevel ?? stats?.currentLevel ?? 1;
  const masteredSkillsCount = stats?.masteredSkillsCount ?? 0;
  const lastSession = stats?.lastSession ?? null;
  const avatarEmoji = session ? getAvatarEmoji(session.student.avatarKey) : "🦋";
  const world = getWorldForBand(session?.student.launchBandCode ?? "K1");
  const activeNodes = world.nodes;
  // Derive completedNodes from real level: each level ≈ 1 node, capped at totalNodes-1
  const completedNodes = session
    ? Math.min(currentLevel - 1, world.totalNodes - 1)
    : world.completedNodes;
  const totalNodes = world.totalNodes;
  const progressPct = Math.round((completedNodes / totalNodes) * 100);
  const activeNodeIndex = completedNodes; // 0-based index of active node

  const recentWins = session
    ? [
        { icon: "🎮", text: "Session started", meta: "today" },
        ...(badgeCount > 0 ? [{ icon: "🏅", text: "Badge unlocked", meta: "today" }] : []),
        ...(stars > 0 ? [{ icon: "⭐", text: `${stars} stars collected`, meta: "today" }] : []),
      ]
    : [
        { icon: "⭐", text: "Earned 3 stars!", meta: "today" },
        { icon: "🏅", text: "New badge unlocked", meta: "today" },
        { icon: "🔥", text: "5-day streak!", meta: "today" },
        { icon: "🗝️", text: "Node 6 complete", meta: "yesterday" },
      ];

  const badges = [
    { emoji: "🌟", locked: false },
    { emoji: "🔥", locked: badgeCount < 1 },
    { emoji: "💎", locked: badgeCount < 2 },
    { emoji: "🏆", locked: true },
    { emoji: "👑", locked: true },
    { emoji: "🦋", locked: true },
  ];

  const sidebarItemsWithBadge = sidebarItems.map((item) =>
    item.key === "badges" && badgeCount > 0
      ? { ...item, badge: String(badgeCount) }
      : { ...item, badge: null as string | null },
  );

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, color: textPrimary, fontSize: 18, fontWeight: 700 }}>
          Loading your quest hub…
        </div>
      </AppFrame>
    );
  }

  if (sessionError) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, color: textPrimary, gap: 16, padding: 24 }}>
          <div style={{ fontSize: 48 }}>🌟</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>Oops, something went wrong!</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: 280 }}>We couldn&apos;t load your quest hub. Check your connection and try again.</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: "12px 28px", background: violet, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>Try again</button>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes node-active-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(155,114,255,0); }
        }
        @keyframes shimmer-right {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .hub-node-active {
          animation: node-active-pulse 1.5s ease-in-out infinite;
        }
        .hub-shimmer::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 16px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
          animation: shimmer-right 1.5s ease-in-out infinite;
        }
      `}</style>

      <div style={{ fontFamily: font, background: bg, minHeight: "100vh", color: textPrimary }}>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "16px 16px 0" }}>
          {(["home", "band", "worlds"] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = { home: "Home Hub", band: "Band Select", worlds: "World Map" };
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "8px 16px",
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
          {/* Nav links */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/child" style={{ padding: "8px 14px", background: "#1e1a40", border: "2px solid #2e2a50", borderRadius: 8, color: textMuted, fontFamily: font, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Back
            </Link>
            <a href="/api/child/logout" style={{ padding: "8px 14px", background: "transparent", border: "2px solid #2e2a50", borderRadius: 8, color: "rgba(155,142,196,0.5)", fontFamily: font, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              Sign out
            </a>
            <Link href="/play" style={{ padding: "8px 14px", background: violet, border: `2px solid ${violet}`, borderRadius: 8, color: "#fff", fontFamily: font, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Play
            </Link>
          </div>
        </div>

        {/* ── TAB: HOME HUB ── */}
        {activeTab === "home" && (
          <div
            style={{
              maxWidth: 1280,
              margin: "16px auto 0",
              display: "grid",
              gridTemplateColumns: "220px 1fr 280px",
              gridTemplateRows: "64px 1fr",
              minHeight: "calc(100vh - 120px)",
            }}
          >
            {/* Top nav */}
            <div
              style={{
                gridColumn: "1 / -1",
                background: bgDark,
                borderBottom: "2px solid #1e1860",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                gap: 16,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: violet, letterSpacing: -0.5, fontFamily: font }}>
                Wonder<span style={{ color: gold }}>Quest</span>
              </div>
              {session && (
                <div style={{ fontSize: 14, fontWeight: 700, color: textMuted, fontFamily: font }}>
                  Hi, {session.student.displayName}!
                </div>
              )}
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 700, color: "#ff9d3b", fontFamily: font }}>
                🔥 {streak} days
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 900, color: gold, fontFamily: font }}>
                ⭐ {stars}
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "radial-gradient(circle at 35% 35%, #c4a0ff, #7c4ddb)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                {avatarEmoji}
              </div>
            </div>

            {/* Left sidebar */}
            <div
              style={{
                background: bgDark,
                borderRight: "1px solid #1e1860",
                padding: "20px 0",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {sidebarItemsWithBadge.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setSidebarActive(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 18px",
                    fontSize: 15,
                    fontWeight: 700,
                    color: sidebarActive === item.key ? violet : "#7a6090",
                    cursor: "pointer",
                    borderLeft: `3px solid ${sidebarActive === item.key ? violet : "transparent"}`,
                    background: sidebarActive === item.key ? "#1a1460" : "transparent",
                    fontFamily: font,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 20, width: 24, textAlign: "center" }}>{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span
                      style={{
                        marginLeft: "auto",
                        background: violet,
                        color: "#fff",
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "2px 7px",
                        minWidth: 20,
                        textAlign: "center",
                        fontFamily: font,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div style={{ padding: "20px 24px", overflowY: "auto" }}>
              {/* Streak flame display */}
              {streak > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>🔥</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#ffd166", fontFamily: font }}>{streak} day streak</span>
                </div>
              )}

              {/* Quick stats pill row */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,209,102,0.1)", border: "1.5px solid rgba(255,209,102,0.3)", borderRadius: 20, padding: "6px 14px" }}>
                  <span style={{ fontSize: 16 }}>⭐</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: gold, fontFamily: font }}>{stars}</span>
                  <span style={{ fontSize: 11, color: textMuted, fontFamily: font }}>Stars</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(155,114,255,0.1)", border: "1.5px solid rgba(155,114,255,0.3)", borderRadius: 20, padding: "6px 14px" }}>
                  <span style={{ fontSize: 16 }}>📈</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: violet, fontFamily: font }}>Lv.{currentLevel}</span>
                  <span style={{ fontSize: 11, color: textMuted, fontFamily: font }}>Level</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(88,232,193,0.1)", border: "1.5px solid rgba(88,232,193,0.3)", borderRadius: 20, padding: "6px 14px" }}>
                  <span style={{ fontSize: 16 }}>🏅</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: mint, fontFamily: font }}>{badgeCount}</span>
                  <span style={{ fontSize: 11, color: textMuted, fontFamily: font }}>Badges</span>
                </div>
              </div>

              {/* Hero world card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1a1060 0%, #2a1880 100%)",
                  border: "2px solid #4a30b0",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 20,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle, rgba(155,114,255,0.2) 0%, transparent 70%)", borderRadius: "50%" }} />
                <div style={{ fontSize: 11, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: font }}>Current World</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4, fontFamily: font }}>{world.name}</div>
                <div style={{ height: 12, background: "#2a1880", borderRadius: 7, overflow: "hidden", marginBottom: 6 }}>
                  <div
                    className="hub-shimmer"
                    style={{
                      height: "100%",
                      width: `${progressPct}%`,
                      borderRadius: 7,
                      background: "linear-gradient(90deg, #9b72ff, #c4a0ff)",
                      position: "relative",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: violet, fontFamily: font }}>
                  <span>Node {completedNodes + 1} of {totalNodes}</span>
                  <span>{progressPct}% explored</span>
                </div>
                {assignments.length > 0 && (
                  <Link
                    href="/play"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255,209,102,0.12)",
                      border: "1.5px solid rgba(255,209,102,0.4)",
                      color: gold,
                      fontFamily: font,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      marginTop: 14,
                      textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>📋</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      {assignments.length === 1
                        ? `Assignment: ${assignments[0].title}`
                        : `You have ${assignments.length} assignment${assignments.length > 1 ? "s" : ""}`}
                    </span>
                    <span style={{ fontSize: 11, opacity: 0.7 }}>Play →</span>
                  </Link>
                )}
                {/* Play mode buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <Link
                    href="/play?sessionMode=guided-quest&entry=returning"
                    style={{
                      flex: 2,
                      display: "block",
                      padding: 14,
                      borderRadius: 14,
                      border: "none",
                      background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
                      color: "#fff",
                      fontFamily: font,
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    ▶ Start Quest
                  </Link>
                  <Link
                    href="/play?sessionMode=challenge&entry=returning"
                    style={{
                      flex: 1,
                      display: "block",
                      padding: 14,
                      borderRadius: 14,
                      border: `2px solid ${violet}`,
                      background: "transparent",
                      color: violet,
                      fontFamily: font,
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: "pointer",
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    ⚡ Challenge
                  </Link>
                </div>
                {/* Last session teaser */}
                {lastSession && lastSession.totalQuestions > 0 && (
                  <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, color: textMuted, fontFamily: font, fontWeight: 700 }}>
                    Last session: {lastSession.correctAnswers}/{lastSession.totalQuestions} correct · +{lastSession.pointsEarned} ⭐
                  </div>
                )}
              </div>

              {/* Node map */}
              <div style={{ fontSize: 13, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: font }}>
                Quest Nodes
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                {activeNodes.map((emoji, idx) => {
                  const state = idx < completedNodes ? "done" : idx === activeNodeIndex ? "active" : "locked";
                  return (
                    <div
                      key={idx}
                      className={state === "active" ? "hub-node-active" : ""}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 16,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                        border: `2px solid ${state === "done" ? green : state === "active" ? violet : "#2a2060"}`,
                        background: state === "done" ? "#0a2a15" : state === "active" ? "#2a1880" : "#1a1060",
                        cursor: state === "locked" ? "default" : "pointer",
                        position: "relative",
                        opacity: state === "locked" ? 0.35 : 1,
                      }}
                    >
                      {emoji}
                      {state === "done" && (
                        <div
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            width: 18,
                            height: 18,
                            background: green,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            color: "#0a2a15",
                            fontWeight: 900,
                          }}
                        >
                          ✓
                        </div>
                      )}
                      <div style={{ position: "absolute", bottom: 2, fontSize: 9, fontWeight: 900, color: "#6a5090", fontFamily: font }}>
                        {idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { icon: "🔥", val: String(streak), label: "Day quest streak" },
                  { icon: "⭐", val: String(stars), label: "Stars collected" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "#1a1060", border: "2px solid #2a2060", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: font }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: "#7a6090", fontWeight: 700, marginTop: 2, fontFamily: font }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick quests */}
              <div style={{ fontSize: 13, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: font }}>
                Jump Into a Quest
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {world.quests.map((q) => (
                  <div
                    key={q.name}
                    style={{
                      background: "#1a1060",
                      border: "2px solid #2a2060",
                      borderRadius: 14,
                      padding: 14,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{q.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 4, fontFamily: font }}>{q.name}</div>
                    <div style={{ fontSize: 11, color: "#7a6090", fontWeight: 700, fontFamily: font }}>{q.world}</div>
                    <div style={{ fontSize: 11, color: gold, fontWeight: 700, marginTop: 4, fontFamily: font }}>{q.stars}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right rail */}
            <div
              style={{
                background: bgDark,
                borderLeft: "1px solid #1e1860",
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Recent wins */}
              <div style={{ background: panel, border: "1px solid #2a2060", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: font }}>
                  Recent Wins
                </div>
                {recentWins.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 0",
                      borderBottom: i < recentWins.length - 1 ? `1px solid ${panelBorder}` : "none",
                      fontSize: 13,
                      color: "#c4a0ff",
                      fontWeight: 700,
                      fontFamily: font,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{w.icon}</span>
                    <span style={{ flex: 1 }}>{w.text}</span>
                    <span style={{ fontSize: 11, color: "#6a5090" }}>{w.meta}</span>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div style={{ background: panel, border: "1px solid #2a2060", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: font }}>
                  My Badges
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {badges.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "#1e1a40",
                        border: "2px solid #3a2a60",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        cursor: b.locked ? "default" : "pointer",
                        opacity: b.locked ? 0.3 : 1,
                      }}
                    >
                      {b.emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily challenge */}
              <div style={{ background: panel, border: "1px solid #2a2060", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: font }}>
                  Daily Challenge
                </div>
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: gold, marginBottom: 4, fontFamily: font }}>Mystery Quest</div>
                  <div style={{ fontSize: 12, color: "#7a6090", fontWeight: 700, marginBottom: 12, fontFamily: font }}>New challenge available!</div>
                  <button
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 10,
                      border: "none",
                      background: violet,
                      color: "#fff",
                      fontFamily: font,
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Try It!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: BAND SELECT ── */}
        {activeTab === "band" && (
          <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6, fontFamily: font }}>Choose Your Adventure Level</div>
              <div style={{ fontSize: 14, color: "#7a6090", fontWeight: 700, fontFamily: font }}>Pick the one that feels right — you can always change it</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 700, margin: "0 auto" }}>
              {bands.map((b) => (
                <div
                  key={b.key}
                  onClick={() => setSelectedBand(b.key)}
                  style={{
                    borderRadius: 20,
                    padding: 24,
                    cursor: "pointer",
                    border: `3px solid ${selectedBand === b.key ? "#fff" : b.border}`,
                    background: b.bg,
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.2s",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 10 }}>{b.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: b.nameColor, marginBottom: 4, fontFamily: font }}>{b.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 700, fontFamily: font }}>{b.ages}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, lineHeight: 1.4, fontFamily: font }}>{b.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                style={{
                  padding: "14px 40px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
                  color: "#fff",
                  fontFamily: font,
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
                }}
              >
                Start Questing!
              </button>
              <div style={{ fontSize: 12, color: "#5a4080", fontWeight: 700, marginTop: 10, fontFamily: font }}>Your parent can adjust this any time</div>
            </div>
          </div>
        )}

        {/* ── TAB: WORLD MAP ── */}
        {activeTab === "worlds" && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: font }}>Choose Your World</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#7a6090", fontFamily: font }}>
                {session ? session.student.launchBandCode : "K1"} band
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {worlds.map((w) => (
                <div
                  key={w.name}
                  style={{
                    background: w.state === "current" ? "#2a1880" : "#1a1060",
                    border: `2px solid ${w.state === "current" ? violet : "#2a2060"}`,
                    borderRadius: 16,
                    padding: 18,
                    cursor: w.state === "locked" ? "default" : "pointer",
                    textAlign: "center",
                    opacity: w.state === "locked" ? 0.4 : 1,
                  }}
                >
                  {w.state === "current" && (
                    <div
                      style={{
                        display: "inline-block",
                        background: violet,
                        color: "#fff",
                        borderRadius: 8,
                        fontSize: 9,
                        fontWeight: 900,
                        padding: "2px 8px",
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontFamily: font,
                      }}
                    >
                      current
                    </div>
                  )}
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{w.emoji}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 4, fontFamily: font }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: "#7a6090", fontWeight: 700, fontFamily: font }}>{w.nodes}</div>
                  <div style={{ height: 6, background: "#2a2060", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${w.prog}%`,
                        borderRadius: 4,
                        background: w.prog === 100 ? green : violet,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
