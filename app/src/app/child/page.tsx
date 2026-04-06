"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { FieldBlock, ShellCard, StatTile } from "@/components/ui";
import { getAvatarsForBand } from "@/lib/launch-data";
import { launchBands } from "@/lib/launch-plan";
import { ChildBetaPanel } from "./child-beta-panel";

type ChildAccessResponse = {
  created: boolean;
  student: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    preferredThemeCode: string | null;
  };
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
};

function getBandSymbol(bandCode: string) {
  switch (bandCode) {
    case "PREK":
      return "🌈";
    case "K1":
      return "⚽";
    case "G23":
      return "🚀";
    case "G45":
      return "🧱";
    default:
      return "⭐";
  }
}

function getBandProfile(bandCode: string) {
  switch (bandCode) {
    case "PREK":
      return { emoji: "🐣", title: "Tiny Explorer", ageLabel: "Ages 2–5" };
    case "K1":
      return { emoji: "⚽", title: "Super Starter", ageLabel: "Kinder – Grade 1" };
    case "G23":
      return { emoji: "🚀", title: "Space Adventurer", ageLabel: "Grades 2–3" };
    case "G45":
      return { emoji: "🏗️", title: "Master Builder", ageLabel: "Grades 4–5" };
    default:
      return { emoji: getBandSymbol(bandCode), title: bandCode, ageLabel: bandCode };
  }
}

function getAvatarSymbol(avatarKey: string) {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "✨";
}

// ─── World / quest data derived from band ───────────────────────────────────
function getWorldForBand(bandCode: string) {
  switch (bandCode) {
    case "PREK":
      return {
        name: "Rainbow Meadows 🌈",
        tagline: "Discover letters, shapes, and colors!",
        totalNodes: 10,
        completedNodes: 2,
        nodes: ["🌸", "🌻", "🌈", "🦋", "🍀", "⭐", "🌙", "🌊", "🌺", "🎈"],
        quests: [
          { icon: "🔤", name: "Letter Match", world: "Rainbow Meadows", stars: 3 },
          { icon: "🔢", name: "Count & Go", world: "Rainbow Meadows", stars: 2 },
          { icon: "🎨", name: "Shape Hunt", world: "Rainbow Meadows", stars: 3 },
        ],
      };
    case "K1":
      return {
        name: "Crystal Caverns 💎",
        tagline: "Unlock the secrets of the shining gems!",
        totalNodes: 12,
        completedNodes: 6,
        nodes: ["🌟", "🔮", "💎", "🗝️", "🌈", "🔥", "🏔️", "🌙", "⚡", "🦋", "🌟", "👑"],
        quests: [
          { icon: "🔤", name: "Word Builders", world: "Crystal Caverns", stars: 3 },
          { icon: "🔢", name: "Number Tower", world: "Crystal Caverns", stars: 2 },
          { icon: "🎵", name: "Sound Hunt", world: "Crystal Caverns", stars: 3 },
        ],
      };
    case "G23":
      return {
        name: "Starship Academy 🚀",
        tagline: "Blast off through reading and math missions!",
        totalNodes: 14,
        completedNodes: 5,
        nodes: ["🚀", "🌍", "🌙", "⭐", "🛸", "🪐", "☄️", "🌌", "🔭", "🛰️", "🌠", "🌟", "💫", "👾"],
        quests: [
          { icon: "📖", name: "Story Missions", world: "Starship Academy", stars: 3 },
          { icon: "➗", name: "Math Blasters", world: "Starship Academy", stars: 3 },
          { icon: "🔬", name: "Lab Puzzles", world: "Starship Academy", stars: 2 },
        ],
      };
    case "G45":
      return {
        name: "Engineer's Forge 🏗️",
        tagline: "Build, solve, and master every challenge!",
        totalNodes: 16,
        completedNodes: 4,
        nodes: ["🔧", "⚙️", "🏗️", "🧱", "🔩", "💡", "🛠️", "🔌", "📐", "🧮", "🪛", "⚡", "🏆", "🎯", "🌐", "👑"],
        quests: [
          { icon: "📚", name: "Word Craft", world: "Engineer's Forge", stars: 3 },
          { icon: "🧮", name: "Equation Lab", world: "Engineer's Forge", stars: 3 },
          { icon: "🧩", name: "Logic Bridge", world: "Engineer's Forge", stars: 2 },
        ],
      };
    default:
      return {
        name: "Crystal Caverns 💎",
        tagline: "Unlock the secrets of the shining gems!",
        totalNodes: 12,
        completedNodes: 6,
        nodes: ["🌟", "🔮", "💎", "🗝️", "🌈", "🔥", "🏔️", "🌙", "⚡", "🦋", "🌟", "👑"],
        quests: [
          { icon: "🔤", name: "Word Builders", world: "Crystal Caverns", stars: 3 },
          { icon: "🔢", name: "Number Tower", world: "Crystal Caverns", stars: 2 },
          { icon: "🎵", name: "Sound Hunt", world: "Crystal Caverns", stars: 3 },
        ],
      };
  }
}

// ─── Hub view after successful login ────────────────────────────────────────
function ChildHub({ result }: { result: ChildAccessResponse }) {
  const router = useRouter();
  const { student, progression } = result;
  const band = getWorldForBand(student.launchBandCode);
  const avatarEmoji = getAvatarSymbol(student.avatarKey);
  const progressPct = Math.round((band.completedNodes / band.totalNodes) * 100);

  // Fallback stats (backend doesn't expose streak yet)
  const streak = 0;
  const stars = progression.totalPoints;

  const badges = [
    { icon: "🌟", earned: true },
    { icon: "🔥", earned: progression.currentLevel > 1 },
    { icon: "💎", earned: progression.badgeCount > 0 },
    { icon: "🏆", earned: progression.trophyCount > 0 },
    { icon: "👑", earned: false },
    { icon: "🦋", earned: false },
    { icon: "⚡", earned: false },
    { icon: "🌈", earned: false },
  ];

  const recentWins = [
    { icon: "⭐", text: "Profile created", meta: "just now" },
    { icon: "🎮", text: "First login!", meta: "today" },
    ...(progression.badgeCount > 0
      ? [{ icon: "🏅", text: "Badge unlocked", meta: "today" }]
      : []),
  ];

  const sidebarItems = [
    { icon: "🏠", label: "Home", active: true, badge: null },
    { icon: "🗺️", label: "World Map", active: false, badge: null },
    { icon: "⭐", label: "My Stars", active: false, badge: null },
    {
      icon: "🏅",
      label: "Badges",
      active: false,
      badge: progression.badgeCount > 0 ? String(progression.badgeCount) : null,
    },
    { icon: "🏆", label: "Trophies", active: false, badge: null },
    { icon: "🎯", label: "Daily Quest", active: false, badge: null },
  ];

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 280px",
          gridTemplateRows: "64px 1fr",
          minHeight: "100vh",
          gap: 0,
          background: "#100b2e",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#fff",
        }}
      >
        {/* ── Top nav ─────────────────────────────────────── */}
        <div
          style={{
            gridColumn: "1 / -1",
            background: "#0d0924",
            borderBottom: "2px solid #1e1860",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#9b72ff",
              letterSpacing: "-0.5px",
            }}
          >
            Wonder<span style={{ color: "#ffd166" }}>Quest</span>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#ff9d3b",
            }}
          >
            🔥 {streak} days
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "16px",
              fontWeight: 900,
              color: "#ffd166",
            }}
          >
            ⭐ {stars}
          </div>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "radial-gradient(circle at 35% 35%, #c4a0ff, #7c4ddb)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            {avatarEmoji}
          </div>
        </div>

        {/* ── Left sidebar ────────────────────────────────── */}
        <nav
          style={{
            background: "#0d0924",
            borderRight: "1px solid #1e1860",
            padding: "20px 0",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 18px",
                fontSize: "15px",
                fontWeight: 700,
                color: item.active ? "#9b72ff" : "#7a6090",
                cursor: "pointer",
                borderLeft: item.active
                  ? "3px solid #9b72ff"
                  : "3px solid transparent",
                background: item.active ? "#1a1460" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "20px", width: "24px", textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
              {item.badge ? (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#9b72ff",
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

        {/* ── Main content ─────────────────────────────────── */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            background: "#100b2e",
          }}
        >
          {/* Hero world card */}
          <div
            style={{
              padding: "28px",
              borderRadius: "28px",
              background:
                "radial-gradient(circle at top right, rgba(155,114,255,0.2), transparent 40%), linear-gradient(145deg, rgba(20,14,50,0.98), rgba(12,8,30,0.94))",
              border: "1px solid rgba(155,114,255,0.2)",
              marginBottom: "18px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                width: "120px",
                height: "120px",
                background:
                  "radial-gradient(circle, rgba(155,114,255,0.2) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "6px",
              }}
            >
              Current World
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              {band.name}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#b8a0e8",
                marginBottom: "14px",
              }}
            >
              {band.tagline}
            </div>
            {/* Progress bar */}
            <div
              style={{
                height: "12px",
                background: "#2a1880",
                borderRadius: "7px",
                overflow: "hidden",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  borderRadius: "7px",
                  background: "linear-gradient(90deg, #9b72ff, #c4a0ff)",
                  position: "relative",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                fontWeight: 700,
                color: "#9b72ff",
                marginBottom: "14px",
              }}
            >
              <span>Node {band.completedNodes} of {band.totalNodes}</span>
              <span>{progressPct}% explored</span>
            </div>
            <button
              onClick={() => router.push("/play?sessionMode=guided-quest&entry=returning")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "18px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
            >
              ▶ Continue Adventure
            </button>
          </div>

          {/* Today's Nodes */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 900,
              color: "#9b72ff",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "10px",
            }}
          >
            Today's Nodes
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {band.nodes.map((emoji, i) => {
              const done = i < band.completedNodes;
              const active = i === band.completedNodes;
              const locked = i > band.completedNodes;
              return (
                <div
                  key={i}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    border: done
                      ? "2px solid #50e890"
                      : active
                        ? "2px solid #9b72ff"
                        : "2px solid #2a2060",
                    background: done
                      ? "#0a2a15"
                      : active
                        ? "#2a1880"
                        : "#1a1060",
                    cursor: locked ? "default" : "pointer",
                    opacity: locked ? 0.35 : 1,
                    position: "relative",
                    transition: "transform 0.15s",
                  }}
                  title={`Node ${i + 1}`}
                >
                  {emoji}
                  {done ? (
                    <div
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        width: "18px",
                        height: "18px",
                        background: "#50e890",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: "#0a2a15",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </div>
                  ) : null}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      fontSize: "9px",
                      fontWeight: 900,
                      color: "#6a5090",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#1a1060",
                border: "2px solid #2a2060",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "28px" }}>🔥</span>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  {streak}
                </div>
                <div style={{ fontSize: "11px", color: "#7a6090", fontWeight: 700, marginTop: "2px" }}>
                  Day quest streak
                </div>
              </div>
            </div>
            <div
              style={{
                background: "#1a1060",
                border: "2px solid #2a2060",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "28px" }}>⭐</span>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  {stars}
                </div>
                <div style={{ fontSize: "11px", color: "#7a6090", fontWeight: 700, marginTop: "2px" }}>
                  Stars collected
                </div>
              </div>
            </div>
          </div>

          {/* Jump into a quest */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 900,
              color: "#9b72ff",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "10px",
            }}
          >
            Jump Into a Quest
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: "14px",
            }}
          >
            {band.quests.map((quest) => (
              <article
                key={quest.name}
                onClick={() => router.push("/play?sessionMode=guided-quest&entry=returning")}
                style={{
                  padding: "18px",
                  borderRadius: "22px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(155,114,255,0.18)",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "6px" }}>{quest.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>
                  {quest.name}
                </div>
                <div style={{ fontSize: "11px", color: "#7a6090", fontWeight: 700 }}>
                  {quest.world}
                </div>
                <div style={{ fontSize: "11px", color: "#ffd166", fontWeight: 700, marginTop: "4px" }}>
                  {"⭐".repeat(quest.stars)} earn up to {quest.stars}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── Right rail ───────────────────────────────────── */}
        <div
          style={{
            background: "#0d0924",
            borderLeft: "1px solid #1e1860",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            overflowY: "auto",
          }}
        >
          {/* Recent wins */}
          <div
            style={{
              padding: "16px",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Recent Wins 🎉
            </div>
            {recentWins.map((win, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 0",
                  borderBottom:
                    i < recentWins.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                  fontSize: "13px",
                  color: "#c4a0ff",
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: "18px" }}>{win.icon}</span>
                <span style={{ flex: 1 }}>{win.text}</span>
                <span style={{ fontSize: "11px", color: "#6a5090" }}>{win.meta}</span>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div
            style={{
              padding: "16px",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              My Badges 🏅
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {badges.map((badge, i) => (
                <div
                  key={i}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: badge.earned
                      ? "rgba(255,209,102,0.16)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${badge.earned ? "rgba(255,209,102,0.3)" : "rgba(255,255,255,0.08)"}`,
                    display: "grid",
                    placeItems: "center",
                    fontSize: "1.4rem",
                    opacity: badge.earned ? 1 : 0.35,
                    cursor: badge.earned ? "pointer" : "default",
                    transition: "transform 0.15s",
                  }}
                  title={badge.earned ? "Earned!" : "Locked"}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Daily challenge */}
          <div
            style={{
              padding: "16px",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: "#9b72ff",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Daily Challenge ⚡
            </div>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎯</div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#ffd166",
                  marginBottom: "4px",
                }}
              >
                Mystery Quest
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#7a6090",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                New challenge available!
              </div>
              <button
                onClick={() => router.push("/play?sessionMode=guided-quest&entry=returning")}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#9b72ff",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Try It! ⚡
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}

// ─── Main page — gate + hub ───────────────────────────────────────────────────
export default function ChildAccessPage() {
  const router = useRouter();
  const [accessMode, setAccessMode] = useState<"new" | "returning">("new");
  const [selectedBand, setSelectedBand] = useState("K1");
  const [fixSavedBand, setFixSavedBand] = useState(false);
  const [selectedMode, setSelectedMode] = useState("guided-quest");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [recoveryHint, setRecoveryHint] = useState("");
  const [result, setResult] = useState<ChildAccessResponse | null>(null);

  const avatars = useMemo(() => getAvatarsForBand(selectedBand), [selectedBand]);
  const returningMode = accessMode === "returning";
  const selectedBandIsEarlyLearner = selectedBand === "PREK" || selectedBand === "K1";
  const earlyLearnerBand = returningMode
    ? fixSavedBand
      ? selectedBandIsEarlyLearner
      : false
    : selectedBandIsEarlyLearner;
  const guidedOnlyMode = earlyLearnerBand || returningMode;
  const pinDigits = [0, 1, 2, 3];
  const selectedBandProfile = getBandProfile(selectedBand);
  const launchBandTitle =
    returningMode && !fixSavedBand ? "Saved child band" : selectedBandProfile.title;
  const launchBandLabel =
    returningMode && !fixSavedBand
      ? "Use the band already attached to this child"
      : selectedBandProfile.ageLabel;
  const selectedAvatarSymbol = getAvatarSymbol(selectedAvatar);
  const selectedAvatarLabel =
    avatars.find((item) => item.avatar_key === selectedAvatar)?.display_name ?? "";

  useEffect(() => {
    let cancelled = false;
    async function trySessionRestore() {
      const manualChildSwitch =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("manual") === "1";
      if (manualChildSwitch) return;
      try {
        const response = await fetch("/api/child/session", { method: "GET" });
        if (!response.ok || cancelled) return;
        if (cancelled) return;
        router.push("/play?sessionMode=guided-quest&entry=returning");
      } catch {
        // no valid session — stay on credential form
      }
    }
    void trySessionRestore();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!avatars.some((item) => item.avatar_key === selectedAvatar)) {
      setSelectedAvatar(avatars[0]?.avatar_key ?? "");
    }
  }, [avatars, selectedAvatar]);

  useEffect(() => {
    if (guidedOnlyMode) setSelectedMode("guided-quest");
  }, [guidedOnlyMode]);

  useEffect(() => {
    if (!returningMode) setFixSavedBand(false);
  }, [returningMode]);

  function appendPinDigit(digit: string) {
    setPin((current) => (current.length >= 4 ? current : `${current}${digit}`));
  }

  function removePinDigit() {
    setPin((current) => current.slice(0, -1));
  }

  function clearPin() {
    setPin("");
  }

  function handlePinFieldChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPin(event.target.value.replace(/\D/g, "").slice(0, 4));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setRecoveryHint("");

    try {
      const response = await fetch("/api/child/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          pin,
          displayName,
          avatarKey: selectedAvatar,
          launchBandCode: returningMode && !fixSavedBand ? "" : selectedBand,
        }),
      });

      const payload = (await response.json()) as ChildAccessResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Child access failed.");
      }

      setResult(payload);
      // Don't auto-redirect — show the hub instead
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Child access failed.";

      if (returningMode && message === "Wrong username or PIN.") {
        setError("Oops, that PIN did not match.");
        setRecoveryHint(
          "Try the same 4 digits again, or switch to new adventurer if this is a first-time setup.",
        );
      } else if (
        returningMode &&
        message === "Display name and avatar are required for first-time setup."
      ) {
        setError("We could not find that adventurer yet.");
        setRecoveryHint(
          "Check the username again, or switch to new adventurer to create the child profile.",
        );
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // After successful login, show the gamified hub
  if (result) {
    return <ChildHub result={result} />;
  }

  // ── Access gate ────────────────────────────────────────────────────────────
  return (
    <AppFrame audience="kid" currentPath="/child">
      <main className="page-shell page-shell-split">
        <section className="page-hero child-hero child-hero-quickstart">
          <div>
            <div className="child-hero-brand">
              <span>Wonder</span>Quest
            </div>
            <span className="eyebrow">Child setup</span>
            <h1>
              {earlyLearnerBand
                ? "One big tap to start, one calm setup, then straight into play."
                : "Fast child setup now, real quest momentum right after."}
            </h1>
            <div className="summary-chip-row">
              <span className="summary-chip">
                {earlyLearnerBand ? "Quick grown-up setup" : "1 minute setup"}
              </span>
              <span className="summary-chip">Saved progression</span>
              <span className="summary-chip">
                {earlyLearnerBand ? "Voice + visual help" : "Explainers on misses"}
              </span>
            </div>
          </div>
          <div className="hero-route-summary hero-route-summary-kid">
            <StatTile label="Access" value="Quick" />
            <StatTile label="Progress" value="Saved" />
            <StatTile label="Support" value="Adaptive" />
          </div>
        </section>

        <ChildBetaPanel
          accessMode={accessMode}
          earlyLearnerBand={earlyLearnerBand}
          guidedOnlyMode={guidedOnlyMode}
          pinLength={pin.length}
          returningMode={returningMode}
          selectedAvatarLabel={selectedAvatarLabel}
          selectedAvatarSymbol={selectedAvatarSymbol}
          selectedBandProfile={selectedBandProfile}
          username={username}
          displayName={displayName}
        />

        <form className="route-grid route-grid-child" onSubmit={handleSubmit}>
          <ShellCard
            className="shell-card-soft"
            eyebrow="Access"
            title="Create a profile or sign in"
          >
            <span className="step-chip">Step 1 · New child or existing child?</span>
            <div className="child-entry-grid">
              <button
                className={`child-entry-card child-entry-card-new ${accessMode === "new" ? "is-selected" : ""}`}
                onClick={() => {
                  setAccessMode("new");
                  setError("");
                  setRecoveryHint("");
                }}
                type="button"
              >
                <span className="child-entry-icon" aria-hidden="true">🌟</span>
                <span className="child-entry-copy">
                  <strong>New adventurer</strong>
                </span>
                <span className="child-entry-arrow" aria-hidden="true">→</span>
              </button>
              <button
                className={`child-entry-card child-entry-card-returning ${accessMode === "returning" ? "is-selected" : ""}`}
                onClick={() => {
                  setAccessMode("returning");
                  setError("");
                  setRecoveryHint("");
                }}
                type="button"
              >
                <span className="child-entry-icon" aria-hidden="true">⚡</span>
                <span className="child-entry-copy">
                  <strong>Existing child sign-in</strong>
                </span>
                <span className="child-entry-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </ShellCard>

          <ShellCard
            className="shell-card-soft"
            eyebrow="Band"
            title={
              returningMode
                ? "Check the saved age or grade band"
                : "Choose your age or grade band"
            }
          >
            <span className="step-chip">
              {returningMode ? "Optional · Correct the saved band" : "Step 2 · Band"}
            </span>
            {returningMode ? (
              <>
                <button
                  className={`child-band-toggle ${fixSavedBand ? "is-selected" : ""}`}
                  onClick={() => setFixSavedBand((current) => !current)}
                  type="button"
                >
                  <span aria-hidden="true">{fixSavedBand ? "✅" : "🛠️"}</span>
                  <strong>
                    {fixSavedBand
                      ? `Switch to ${selectedBandProfile.ageLabel}`
                      : "Fix the band?"}
                  </strong>
                </button>
                {fixSavedBand ? (
                  <>
                    <div className="child-band-grid">
                      {launchBands.map((band) => {
                        const profile = getBandProfile(band.code);
                        return (
                          <button
                            key={band.code}
                            className={`child-band-card ${selectedBand === band.code ? "is-selected" : ""}`}
                            onClick={() => setSelectedBand(band.code)}
                            type="button"
                          >
                            <span className="child-band-check" aria-hidden="true">✓</span>
                            <span className="child-band-emoji" aria-hidden="true">{profile.emoji}</span>
                            <strong>{profile.title}</strong>
                            <small>{profile.ageLabel}</small>
                            <span className="child-band-theme">{band.primaryTheme}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="status-banner">
                      {selectedBandProfile.emoji}{" "}
                      <strong>{selectedBandProfile.title}</strong> ·{" "}
                      {selectedBandProfile.ageLabel}
                    </div>
                  </>
                ) : (
                  <div className="child-band-helper">
                    Keep the saved band if the questions already feel right.
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="child-band-grid">
                  {launchBands.map((band) => {
                    const profile = getBandProfile(band.code);
                    return (
                      <button
                        key={band.code}
                        className={`child-band-card ${selectedBand === band.code ? "is-selected" : ""}`}
                        onClick={() => setSelectedBand(band.code)}
                        type="button"
                      >
                        <span className="child-band-check" aria-hidden="true">✓</span>
                        <span className="child-band-emoji" aria-hidden="true">{profile.emoji}</span>
                        <strong>{profile.title}</strong>
                        <small>{profile.ageLabel}</small>
                        <span className="child-band-theme">{band.primaryTheme}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="status-banner">
                  {selectedBandProfile.emoji}{" "}
                  <strong>{selectedBandProfile.title}</strong> ·{" "}
                  {selectedBandProfile.ageLabel}
                </div>
              </>
            )}
          </ShellCard>

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Identity"
            title={returningMode ? "Sign in to an existing child profile" : "Set up the child profile"}
          >
            <span className="step-chip">
              {returningMode
                ? "Step 2 · Sign in"
                : earlyLearnerBand
                  ? "Step 3 · Name + PIN"
                  : "Step 3 · Identity"}
            </span>
            {returningMode ? (
              <div className="child-returning-card">
                <span className="child-returning-icon" aria-hidden="true">
                  {username ? "👋" : "✨"}
                </span>
                <div className="child-returning-copy">
                  <strong>
                    {username ? `Sign in as ${username}` : "Existing child sign-in"}
                  </strong>
                  <small>
                    {fixSavedBand ? `Band → ${selectedBandProfile.ageLabel}` : "Username + PIN"}
                  </small>
                </div>
              </div>
            ) : null}
            {earlyLearnerBand && !returningMode ? (
              <div className="child-guided-note">
                <strong>🐣 Quick start · guided questions throughout</strong>
              </div>
            ) : null}
            <div className="field-grid">
              <FieldBlock
                autoComplete="username"
                label="Username"
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="quest name"
                value={username}
              />
              {!returningMode ? (
                <FieldBlock
                  label="Display name"
                  name="displayName"
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="what we call you"
                  value={displayName}
                />
              ) : null}
            </div>
            <div className="pin-panel">
              <div className="pin-panel-header">
                <strong>4-digit PIN</strong>
              </div>
              <div className="pin-display" aria-label="PIN display">
                {pinDigits.map((index) => (
                  <span className={`pin-cell ${pin[index] ? "has-value" : ""}`} key={index}>
                    {pin[index] ? "★" : ""}
                  </span>
                ))}
              </div>
              <div className="pin-entry-row">
                <label className="pin-entry-label" htmlFor="child-pin-input">
                  Type PIN with keyboard or use the keypad
                </label>
                <input
                  autoComplete="one-time-code"
                  className="pin-entry-input"
                  id="child-pin-input"
                  inputMode="numeric"
                  maxLength={4}
                  name="pin"
                  onChange={handlePinFieldChange}
                  pattern="[0-9]*"
                  placeholder="1234"
                  type="password"
                  value={pin}
                />
              </div>
              <div className="numpad">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                  <button
                    className="numpad-btn"
                    key={digit}
                    onClick={() => appendPinDigit(digit)}
                    type="button"
                  >
                    {digit}
                  </button>
                ))}
                <button className="numpad-btn numpad-btn-quiet" onClick={clearPin} type="button">
                  Clear
                </button>
                <button className="numpad-btn" onClick={() => appendPinDigit("0")} type="button">
                  0
                </button>
                <button
                  className="numpad-btn numpad-btn-quiet"
                  onClick={removePinDigit}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
            {recoveryHint ? (
              <div className="child-recovery-card">
                <strong>Need help?</strong>
                <p>{recoveryHint}</p>
              </div>
            ) : null}
          </ShellCard>

          {!returningMode ? (
            <ShellCard className="shell-card-soft" eyebrow="Avatar" title="Pick your guide">
              <span className="step-chip">
                {earlyLearnerBand ? "Step 4 · Pick the picture" : "Step 4 · Avatar"}
              </span>
              <div className="child-avatar-preview">
                <span className="child-avatar-preview-icon" aria-hidden="true">
                  {selectedAvatarSymbol}
                </span>
                <div className="child-avatar-preview-copy">
                  <strong>You picked {selectedAvatarSymbol}</strong>
                  <span>
                    {avatars.find((avatar) => avatar.avatar_key === selectedAvatar)
                      ?.display_name ?? "Choose a guide"}
                  </span>
                </div>
              </div>
              <div className="selection-card-grid selection-card-grid-avatars">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.avatar_key}
                    className={`selection-card ${selectedAvatar === avatar.avatar_key ? "is-selected" : ""}`}
                    onClick={() => setSelectedAvatar(avatar.avatar_key)}
                    type="button"
                  >
                    <span className="selection-card-icon" aria-hidden="true">
                      {getAvatarSymbol(avatar.avatar_key)}
                    </span>
                    <span className="selection-card-copy">
                      <strong>{avatar.display_name}</strong>
                      <small>{avatar.theme.replace("-", " ")}</small>
                    </span>
                  </button>
                ))}
              </div>
            </ShellCard>
          ) : null}

          {!guidedOnlyMode ? (
            <ShellCard
              className="shell-card-emphasis"
              eyebrow="Mode"
              title="Choose how the next session feels"
            >
              <span className="step-chip">Step 5 · Choose your quest style</span>
              <div className="choice-column">
                <button
                  className={`mode-card ${selectedMode === "guided-quest" ? "is-selected" : ""}`}
                  onClick={() => setSelectedMode("guided-quest")}
                  type="button"
                >
                  Guided Quest
                  <span>Automatically picks the right questions to match your child's level.</span>
                </button>
                <button
                  className={`mode-card ${selectedMode === "self-directed-challenge" ? "is-selected" : ""}`}
                  onClick={() => setSelectedMode("self-directed-challenge")}
                  type="button"
                >
                  Self-Directed Challenge
                  <span>Start with more control and ask for harder or easier items.</span>
                </button>
              </div>
            </ShellCard>
          ) : null}

          <ShellCard
            className="shell-card-spotlight"
            eyebrow="Launch"
            title="Start the next adventure"
          >
            <span className="step-chip">
              {returningMode
                ? "Step 3 · Launch"
                : guidedOnlyMode
                  ? "Step 5 · Launch"
                  : "Step 6 · Launch"}
            </span>
            {guidedOnlyMode ? (
              <div className="child-launch-strip">
                <div className="child-launch-pill">
                  <span aria-hidden="true">
                    {returningMode && !fixSavedBand ? "🗂️" : selectedBandProfile.emoji}
                  </span>
                  <strong>{launchBandTitle}</strong>
                  <small>{launchBandLabel}</small>
                </div>
                <div className="child-launch-pill">
                  <span aria-hidden="true">{returningMode ? "🔐" : selectedAvatarSymbol}</span>
                  <strong>{returningMode ? "Same PIN" : "Same picture"}</strong>
                  <small>{returningMode ? "Fast sign-in" : "Easy to spot next time"}</small>
                </div>
                <div className="child-launch-pill">
                  <span aria-hidden="true">🧭</span>
                  <strong>Guided quest</strong>
                  <small>One calm question at a time</small>
                </div>
              </div>
            ) : null}
            <div className="summary-chip-row">
              <span className="summary-chip">
                {returningMode ? "Existing child sign-in" : selectedBandProfile.title}
              </span>
              {!returningMode ? (
                <span className="summary-chip">{selectedAvatarSymbol} guide</span>
              ) : null}
              <span className="summary-chip">
                {selectedMode === "guided-quest" ? "Guided Quest" : "Self-Directed Challenge"}
              </span>
            </div>
            {guidedOnlyMode ? (
              <div className="status-banner child-launch-banner">
                🧭 Guided Quest · auto-selected
              </div>
            ) : null}
            {error ? <p className="status-banner status-error">{error}</p> : null}
            <div className="form-actions">
              <button
                className="primary-link button-link"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? "Starting..."
                  : returningMode
                    ? "Sign in and play"
                    : `Start as ${selectedBandProfile.title}`}
              </button>
              <Link className="secondary-link" href="/parent">
                Parent setup
              </Link>
            </div>
          </ShellCard>
        </form>
      </main>
    </AppFrame>
  );
}
