"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "cabinet" | "milestones";

type RewardType = "badge" | "trophy" | "world" | "locked";

type RewardItem = {
  id: string;
  emoji: string;
  name: string;
  type: RewardType;
  isNew?: boolean;
  progress?: number; // 0–100, for in-progress worlds
};

type MilestoneItem = {
  stars: number;
  label: string;
  reward: string;
  status: "done" | "current" | "locked";
};

type SessionData = {
  student: {
    displayName: string;
    launchBandCode: string;
  };
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
};

// ─── Static reward shelves ────────────────────────────────────────────────────

const BADGES: RewardItem[] = [
  { id: "first-quest", emoji: "🌟", name: "First Quest!", type: "badge", isNew: true },
  { id: "forest-exp", emoji: "🌲", name: "Forest Explorer", type: "world" },
  { id: "on-fire", emoji: "🔥", name: "On Fire!", type: "trophy", isNew: true },
  { id: "crystal-master", emoji: "💎", name: "Crystal Master", type: "locked" },
  { id: "world-champ", emoji: "🏆", name: "World Champ", type: "locked" },
  { id: "100-stars", emoji: "💯", name: "100 Stars", type: "locked" },
];

const TROPHIES: RewardItem[] = [
  { id: "forest-trophy", emoji: "🏆", name: "Enchanted Forest Trophy", type: "trophy" },
  { id: "ocean-trophy", emoji: "🌊", name: "Ocean Kingdom Trophy", type: "trophy" },
  { id: "crystal-trophy", emoji: "💎", name: "Crystal Caverns Trophy", type: "locked" },
  { id: "volcano-trophy", emoji: "🌋", name: "Volcano Island Trophy", type: "locked" },
];

const WORLDS: RewardItem[] = [
  { id: "forest-world", emoji: "🌲", name: "Enchanted Forest", type: "world" },
  { id: "ocean-world", emoji: "🌊", name: "Ocean Kingdom", type: "world" },
  { id: "crystal-world", emoji: "💎", name: "Crystal Caverns", type: "badge", progress: 58 },
  { id: "volcano-world", emoji: "🌋", name: "Volcano Island", type: "locked" },
];

// ─── Milestones builder ───────────────────────────────────────────────────────

function buildMilestones(totalPoints: number): MilestoneItem[] {
  const thresholds = [
    { stars: 10, reward: "Beginner Explorer badge" },
    { stars: 25, reward: "Silver Star frame for your avatar" },
    { stars: 50, reward: "Gold Star Collector badge" },
    { stars: 100, reward: "Diamond Star Champion badge" },
    { stars: 200, reward: "Legendary Quester title!" },
  ];

  let foundCurrent = false;
  return thresholds.map(({ stars, reward }) => {
    if (totalPoints >= stars) {
      return { stars, label: `${stars}⭐`, reward, status: "done" as const };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { stars, label: `${stars}⭐`, reward, status: "current" as const };
    }
    return { stars, label: `${stars}⭐`, reward, status: "locked" as const };
  });
}

// ─── Reward item card ─────────────────────────────────────────────────────────

function RewardCard({ item, delay }: { item: RewardItem; delay: number }) {
  const [hovered, setHovered] = useState(false);
  const isLocked = item.type === "locked";

  function cardBg() {
    if (isLocked) return "#1a1060";
    if (item.type === "badge") return "linear-gradient(135deg, #1a1060, #2a1880)";
    if (item.type === "trophy") return "linear-gradient(135deg, #2a1808, #1a1060)";
    if (item.type === "world") return "linear-gradient(135deg, #0a2a15, #1a1060)";
    return "#1a1060";
  }

  function cardBorder() {
    if (isLocked) return "2px dashed #2a2060";
    if (item.type === "badge") return "2px solid #9b72ff";
    if (item.type === "trophy") return "2px solid #ff9d3b";
    if (item.type === "world") return "2px solid #50e890";
    return "2px solid #2a2060";
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 100,
        height: 110,
        borderRadius: 18,
        background: cardBg(),
        border: cardBorder(),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: isLocked ? "default" : "pointer",
        opacity: isLocked ? 0.35 : 1,
        transform: hovered && !isLocked ? "translateY(-4px) scale(1.04)" : "none",
        transition: "transform 0.2s",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* shine overlay */}
      {!isLocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.06) 55%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* new dot */}
      {item.isNew && !isLocked && (
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            background: "#ff7b6b",
            borderRadius: "50%",
            animation: "blink 1.5s ease-in-out infinite",
          }}
        />
      )}

      {/* emoji */}
      <span
        style={{
          fontSize: 38,
          marginBottom: 8,
          display: "block",
          animation: isLocked
            ? "none"
            : `ri-float 3s ${delay}s ease-in-out infinite`,
        }}
      >
        {item.emoji}
      </span>

      {/* name */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: isLocked ? "#5a4080" : "#fff",
          textAlign: "center",
          lineHeight: 1.2,
          padding: "0 6px",
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {item.name}
        {item.progress !== undefined && (
          <span style={{ color: "#9b72ff", fontSize: 10 }}>
            <br />{item.progress}% done
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildRewardCabinetPage() {
  const [activeTab, setActiveTab] = useState<TabId>("cabinet");
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => r.json())
      .then((data: SessionData) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPoints = session?.progression.totalPoints ?? 0;
  const badgeCount = session?.progression.badgeCount ?? 0;
  const trophyCount = session?.progression.trophyCount ?? 0;

  const MILESTONES = buildMilestones(totalPoints);
  const nextMilestone = MILESTONES.find((m) => m.status === "current");
  const starsNextMilestone = nextMilestone?.stars ?? 50;
  const starsProgress = Math.round((totalPoints / starsNextMilestone) * 100);

  return (
    <AppFrame audience="kid" currentPath="/child">
      <div
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#fff",
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
        <div style={{ padding: "20px 28px 0" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 4,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            Your Reward Cabinet ✨
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
            Everything you've collected on your adventure — every single item stays here forever!
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9b8ec4", fontSize: 16, fontWeight: 700, fontFamily: "'Nunito', system-ui, sans-serif" }}>
            Loading your rewards...
          </div>
        )}

        {!loading && (
          <>
            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                padding: "0 16px",
                marginBottom: 20,
              }}
            >
              {(["cabinet", "milestones"] as TabId[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 14px",
                    background: activeTab === tab ? "#9b72ff" : "#1e1a40",
                    border: `2px solid ${activeTab === tab ? "#9b72ff" : "#2e2a50"}`,
                    borderRadius: 8,
                    color: activeTab === tab ? "#fff" : "#aaa",
                    fontFamily: "'Nunito', system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "cabinet" ? "Cabinet" : "Star Milestones"}
                </button>
              ))}
            </div>

            {/* Cabinet Tab */}
            {activeTab === "cabinet" && (
              <div style={{ padding: "0 28px", maxWidth: 1000 }}>
                {/* Totals bar */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 28,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { icon: "⭐", val: totalPoints, label: "Stars total" },
                    { icon: "🏅", val: badgeCount, label: "Badges earned" },
                    { icon: "🏆", val: trophyCount, label: "Trophies" },
                    { icon: "🌍", val: 2, label: "Worlds complete" },
                  ].map((pill) => (
                    <div
                      key={pill.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#1a1060",
                        border: "2px solid #2a2060",
                        borderRadius: 14,
                        padding: "12px 18px",
                      }}
                    >
                      <span style={{ fontSize: 28 }}>{pill.icon}</span>
                      <div>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 900,
                            color: "#fff",
                            lineHeight: 1,
                            fontFamily: "'Nunito', system-ui, sans-serif",
                          }}
                        >
                          {pill.val}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#7a6090",
                            fontWeight: 700,
                            marginTop: 2,
                            fontFamily: "'Nunito', system-ui, sans-serif",
                          }}
                        >
                          {pill.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stars shelf */}
                <div style={{ marginBottom: 28 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#9b72ff",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "'Nunito', system-ui, sans-serif",
                    }}
                  >
                    ⭐ Stars{" "}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#5a4080",
                        fontFamily: "'Nunito', system-ui, sans-serif",
                      }}
                    >
                      {totalPoints} collected
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#1a1060",
                      border: "2px solid #ffd166",
                      borderRadius: 16,
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div style={{ fontSize: 48 }}>⭐</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          color: "#ffd166",
                          fontFamily: "'Nunito', system-ui, sans-serif",
                        }}
                      >
                        {totalPoints} Stars
                      </div>
                      <div
                        style={{
                          height: 10,
                          background: "#2a2060",
                          borderRadius: 6,
                          overflow: "hidden",
                          margin: "8px 0",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(starsProgress, 100)}%`,
                            background: "linear-gradient(90deg, #ffd166, #ffb020)",
                            borderRadius: 6,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#b8a060",
                          fontFamily: "'Nunito', system-ui, sans-serif",
                        }}
                      >
                        {starsNextMilestone - totalPoints > 0
                          ? `${starsNextMilestone - totalPoints} more to reach the ${starsNextMilestone}-star milestone!`
                          : "All milestones complete! 🏆"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges shelf */}
                <ShelfSection title="🏅 Badges" count={`${badgeCount} earned`}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {BADGES.map((item, i) => (
                      <RewardCard key={item.id} item={item} delay={i * 0.4} />
                    ))}
                  </div>
                </ShelfSection>

                {/* Trophies shelf */}
                <ShelfSection title="🏆 Trophies" count={`${trophyCount} earned`}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {TROPHIES.map((item, i) => (
                      <RewardCard key={item.id} item={item} delay={i * 0.4} />
                    ))}
                  </div>
                </ShelfSection>

                {/* Worlds shelf */}
                <ShelfSection title="🌍 Worlds Explored" count="2 of 4">
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {WORLDS.map((item, i) => (
                      <RewardCard key={item.id} item={item} delay={i * 0.4} />
                    ))}
                  </div>
                </ShelfSection>
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === "milestones" && (
              <div style={{ padding: "0 28px", maxWidth: 1000 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "#fff",
                    marginBottom: 6,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  Star Milestones ⭐
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#b8a0e8",
                    fontWeight: 700,
                    marginBottom: 24,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                >
                  Collect stars to unlock milestone rewards!
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    background: "#1a1060",
                    border: "1px solid #2a2060",
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#ffd166",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 12,
                      fontFamily: "'Nunito', system-ui, sans-serif",
                    }}
                  >
                    ⭐ Your Star Journey · {totalPoints} collected
                  </div>

                  {/* Milestone track */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 0 28px",
                      position: "relative",
                    }}
                  >
                    {MILESTONES.map((ms, idx) => (
                      <>
                        <MilestoneDot key={ms.stars} ms={ms} />
                        {idx < MILESTONES.length - 1 && (
                          <div
                            key={`line-${ms.stars}`}
                            style={{
                              flex: 1,
                              height: 4,
                              background:
                                ms.status === "done" ? "#ffd166" : "#2a2060",
                            }}
                          />
                        )}
                      </>
                    ))}
                  </div>
                </div>

                {/* Milestone cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {MILESTONES.map((ms) => (
                    <MilestoneCard key={ms.stars} ms={ms} totalPoints={totalPoints} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Keyframes */}
        <style>{`
          @keyframes ri-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
          @keyframes ms-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,209,102,0.4); }
            50% { box-shadow: 0 0 0 6px rgba(255,209,102,0); }
          }
          @keyframes ms-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,209,102,0); }
            50% { box-shadow: 0 0 12px rgba(255,209,102,0.2); }
          }
        `}</style>
      </div>
    </AppFrame>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ShelfSection({
  title,
  count,
  children,
}: {
  title: string;
  count: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: "#9b72ff",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {title}{" "}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#5a4080",
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function MilestoneDot({ ms }: { ms: MilestoneItem }) {
  const isDone = ms.status === "done";
  const isCurrent = ms.status === "current";

  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: isDone ? "#ffd166" : isCurrent ? "#2a2010" : "#2a2060",
        border: `2px solid ${isDone ? "#ffd166" : isCurrent ? "#ffd166" : "#4a3010"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isDone ? 9 : 12,
        fontWeight: 900,
        color: isDone ? "#1a1000" : isCurrent ? "#ffd166" : "#6a5030",
        flexShrink: 0,
        position: "relative",
        animation: isCurrent ? "ms-pulse 1.5s ease-in-out infinite" : "none",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      {isDone ? "✓" : "★"}
      <div
        style={{
          position: "absolute",
          bottom: -18,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          fontWeight: 700,
          color: isDone ? "#ffd166" : "#6a5030",
          whiteSpace: "nowrap",
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {ms.label}
      </div>
    </div>
  );
}

function MilestoneCard({ ms, totalPoints }: { ms: MilestoneItem; totalPoints: number }) {
  const isDone = ms.status === "done";
  const isCurrent = ms.status === "current";

  if (isDone) {
    return (
      <div
        style={{
          background: "#1a2a15",
          border: "2px solid #50e890",
          borderRadius: 16,
          padding: 16,
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 32 }}>✓</span>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: "#50e890",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            {ms.stars} Stars — EARNED!
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#80c8a0",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            Unlocked: {ms.reward}
          </div>
        </div>
      </div>
    );
  }

  if (isCurrent) {
    return (
      <div
        style={{
          background: "#2a2010",
          border: "2px solid #ffd166",
          borderRadius: 16,
          padding: 16,
          display: "flex",
          gap: 14,
          alignItems: "center",
          animation: "ms-glow 2s ease-in-out infinite",
        }}
      >
        <span style={{ fontSize: 32 }}>🎯</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              color: "#ffd166",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            {ms.stars} Stars — SO CLOSE!
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#c8a050",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            Unlocks: {ms.reward}
          </div>
          <div
            style={{
              height: 6,
              background: "#2a2060",
              borderRadius: 4,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(Math.round((totalPoints / ms.stars) * 100), 100)}%`,
                background: "#ffd166",
                borderRadius: 4,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#ffd166",
              marginTop: 4,
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            {totalPoints}/{ms.stars} · {ms.stars - totalPoints} more!
          </div>
        </div>
      </div>
    );
  }

  // locked
  return (
    <div
      style={{
        background: "#1a1060",
        border: "2px solid #2a2060",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        gap: 14,
        alignItems: "center",
        opacity: 0.5,
      }}
    >
      <span style={{ fontSize: 32 }}>⭐</span>
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            color: "#c4a0ff",
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          {ms.stars} Stars
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#7a6090",
            fontFamily: "'Nunito', system-ui, sans-serif",
          }}
        >
          Unlocks: {ms.reward}
        </div>
      </div>
    </div>
  );
}
