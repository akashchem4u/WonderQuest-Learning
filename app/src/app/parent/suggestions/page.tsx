"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  green: "#22c55e",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type Recommendation = {
  skillCode: string;
  skillName: string;
  subject: "math" | "reading" | "science" | "logic";
  priority: "must-have" | "should-have" | "nice-to-have" | "could-have";
  complexity: 1 | 2 | 3;
  activityType: "drill" | "story" | "explore" | "puzzle";
  description: string;
  masteryScore: number;
  sessionCount: number;
  isProficient: boolean;
  status: "not_started" | "in_progress" | "proficient";
  recommendationRank: number;
};

type PendingPushed = {
  activityId: string;
  skillCode: string;
  pushedAt: string;
  note?: string;
  priority: "normal" | "urgent";
};

type SuggestionsResponse = {
  bandCode: string;
  recommendations: Recommendation[];
  pendingPushed: PendingPushed[];
};

type LinkedChild = {
  id: string;
  username: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
};

type ParentSession = {
  linkedChild: LinkedChild | null;
  linkedChildren: LinkedChild[];
};

type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function subjectIcon(subject: string) {
  if (subject === "math") return "📐";
  if (subject === "reading") return "📖";
  if (subject === "science") return "🔬";
  if (subject === "logic") return "🧩";
  return "📚";
}

function activityLabel(type: string) {
  if (type === "drill") return "Drill";
  if (type === "story") return "Story";
  if (type === "explore") return "Explore";
  if (type === "puzzle") return "Puzzle";
  return type;
}

function activityColor(type: string) {
  if (type === "drill") return C.coral;
  if (type === "story") return C.mint;
  if (type === "explore") return C.violet;
  if (type === "puzzle") return C.gold;
  return C.muted;
}

function formatBandLabel(bandCode: string) {
  const upper = bandCode.toUpperCase();
  if (upper.startsWith("PREK")) return "Pre-K";
  if (upper.startsWith("K1")) return "K–1";
  if (upper === "G23" || upper.startsWith("G2") || upper.startsWith("G3")) return "G2–3";
  if (upper === "G45" || upper.startsWith("G4") || upper.startsWith("G5")) return "G4–5";
  return bandCode;
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const PRIORITY_CONFIG = {
  "must-have": {
    label: "Must Have",
    emoji: "🔴",
    color: C.red,
    description: "Core standards for this grade",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  "should-have": {
    label: "Should Have",
    emoji: "🟡",
    color: C.gold,
    description: "Important for grade success",
    bg: "rgba(255,209,102,0.08)",
    border: "rgba(255,209,102,0.2)",
  },
  "nice-to-have": {
    label: "Nice to Have",
    emoji: "🟢",
    color: C.green,
    description: "Enrichment skills",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
  },
  "could-have": {
    label: "Could Have",
    emoji: "⚪",
    color: C.muted,
    description: "Extension challenges",
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.1)",
  },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ComplexityDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
      {[1, 2, 3].map((d) => (
        <div
          key={d}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: d <= level ? C.violet : "rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>
  );
}

function StatusChip({ rec }: { rec: Recommendation }) {
  if (rec.status === "proficient") {
    return (
      <span
        style={{
          font: "600 0.7rem system-ui",
          color: C.green,
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: "20px",
          padding: "2px 9px",
        }}
      >
        Proficient ✓
      </span>
    );
  }
  if (rec.status === "in_progress") {
    return (
      <span
        style={{
          font: "600 0.7rem system-ui",
          color: "#60a5fa",
          background: "rgba(96,165,250,0.12)",
          border: "1px solid rgba(96,165,250,0.25)",
          borderRadius: "20px",
          padding: "2px 9px",
        }}
      >
        {rec.masteryScore}% done
      </span>
    );
  }
  return (
    <span
      style={{
        font: "600 0.7rem system-ui",
        color: C.muted,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "2px 9px",
      }}
    >
      Not Started
    </span>
  );
}

function SkillCard({
  rec,
  childName,
  studentId,
  onPush,
  pushing,
}: {
  rec: Recommendation;
  childName: string;
  studentId: string;
  onPush: (skillCode: string, studentId: string) => Promise<void>;
  pushing: boolean;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div
          style={{
            fontSize: "1.4rem",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(155,114,255,0.1)",
            borderRadius: "10px",
            flexShrink: 0,
          }}
        >
          {subjectIcon(rec.subject)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              font: "600 0.88rem system-ui",
              color: C.text,
              marginBottom: "4px",
              lineHeight: 1.3,
            }}
          >
            {rec.skillName}
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Activity type badge */}
            <span
              style={{
                font: "600 0.65rem system-ui",
                color: activityColor(rec.activityType),
                background: `${activityColor(rec.activityType)}18`,
                border: `1px solid ${activityColor(rec.activityType)}30`,
                borderRadius: "20px",
                padding: "2px 7px",
              }}
            >
              {activityLabel(rec.activityType)}
            </span>
            <ComplexityDots level={rec.complexity} />
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          font: "400 0.75rem/1.5 system-ui",
          color: C.muted,
          margin: 0,
        }}
      >
        {rec.description}
      </p>

      {/* Progress bar (in_progress only) */}
      {rec.status === "in_progress" && (
        <div
          style={{
            height: "4px",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${rec.masteryScore}%`,
              background: "linear-gradient(90deg, #9b72ff, #58e8c1)",
              borderRadius: "4px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      )}

      {/* Status + sessions row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StatusChip rec={rec} />
        {rec.sessionCount > 0 && (
          <span style={{ font: "400 0.68rem system-ui", color: C.muted }}>
            {rec.sessionCount} session{rec.sessionCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Push button */}
      {rec.status !== "proficient" && (
        <button
          onClick={() => void onPush(rec.skillCode, studentId)}
          disabled={pushing}
          style={{
            width: "100%",
            padding: "9px 12px",
            background: pushing
              ? "rgba(155,114,255,0.15)"
              : "linear-gradient(135deg, rgba(155,114,255,0.25), rgba(88,232,193,0.15))",
            border: "1px solid rgba(155,114,255,0.3)",
            borderRadius: "9px",
            color: pushing ? C.muted : C.violet,
            font: "600 0.8rem system-ui",
            cursor: pushing ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {pushing ? "Pushing…" : `Push to ${childName} →`}
        </button>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {[80, 55, 100, 70].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 0 ? "36px" : "12px",
            borderRadius: "8px",
            width: `${w}%`,
            background: "rgba(255,255,255,0.06)",
            animation: "pulse 1.6s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

function ToastNotification({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "320px",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === "success"
              ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(88,232,193,0.15))"
              : "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(255,123,107,0.15))",
            border: `1px solid ${t.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <span>{t.type === "success" ? "✅" : "❌"}</span>
          <span style={{ font: "500 0.82rem system-ui", color: C.text, flex: 1 }}>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              cursor: "pointer",
              fontSize: "1rem",
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SuggestionsPage() {
  const [session, setSession] = useState<ParentSession | null>(null);
  const [data, setData] = useState<SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pushing, setPushing] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [localPending, setLocalPending] = useState<PendingPushed[]>([]);

  // Load child name from session; load suggestions when session is ready
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/parent/session");
        if (!res.ok) throw new Error("Not authenticated");
        const s = (await res.json()) as ParentSession;
        setSession(s);
        const childId = s.linkedChild?.id ?? s.linkedChildren[0]?.id;
        if (!childId) {
          setError("No child linked yet. Add a child from the Family Hub.");
          setLoading(false);
          return;
        }
        const sugRes = await fetch(`/api/parent/suggested-sessions?studentId=${childId}`);
        if (!sugRes.ok) throw new Error("Could not load suggestions");
        const sugData = (await sugRes.json()) as SuggestionsResponse;
        setData(sugData);
        setLocalPending(sugData.pendingPushed ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushSession = useCallback(
    async (skillCode: string, studentId: string, note?: string) => {
      setPushing((prev) => new Set(prev).add(skillCode));
      try {
        const res = await fetch("/api/parent/push-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, skillCode, note }),
        });
        if (!res.ok) {
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error ?? "Push failed");
        }
        const result = (await res.json()) as { activityId?: string };
        const childName =
          session?.linkedChild?.displayName ??
          session?.linkedChildren[0]?.displayName ??
          "your child";
        addToast(`Pushed! ${childName} will see this next session`, "success");
        // Optimistically add to local pending
        const newEntry: PendingPushed = {
          activityId: result.activityId ?? `local-${Date.now()}`,
          skillCode,
          pushedAt: new Date().toISOString(),
          priority: "normal",
          note,
        };
        setLocalPending((prev) => [newEntry, ...prev]);
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Could not push session", "error");
      } finally {
        setPushing((prev) => {
          const next = new Set(prev);
          next.delete(skillCode);
          return next;
        });
      }
    },
    [session, addToast]
  );

  function toggleSection(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function removeFromPending(activityId: string) {
    setLocalPending((prev) => prev.filter((p) => p.activityId !== activityId));
  }

  const activeChild = session?.linkedChild ?? session?.linkedChildren[0] ?? null;
  const childName = activeChild?.displayName ?? "your child";
  const studentId = activeChild?.id ?? "";

  const priorityGroups: Array<keyof typeof PRIORITY_CONFIG> = [
    "must-have",
    "should-have",
    "nice-to-have",
    "could-have",
  ];

  const mustHaveUnstarted = (data?.recommendations ?? []).filter(
    (r) => r.priority === "must-have" && r.status === "not_started"
  );

  return (
    <AppFrame audience="parent" currentPath="/parent/suggestions">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui",
          padding: "32px 28px 80px",
          maxWidth: "960px",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px", animation: "fadeSlideIn 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Link
              href="/parent"
              style={{ font: "500 0.8rem system-ui", color: C.muted, textDecoration: "none" }}
            >
              ← Family Hub
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1
                style={{
                  font: "800 1.8rem system-ui",
                  color: C.text,
                  margin: 0,
                  marginBottom: "6px",
                }}
              >
                🎯 Learning Plan
              </h1>
              <p style={{ font: "400 0.9rem system-ui", color: C.muted, margin: 0 }}>
                Activities recommended for{" "}
                <span style={{ color: C.violet, fontWeight: 600 }}>{childName}</span>&apos;s grade band
              </p>
            </div>

            {data && (
              <span
                style={{
                  font: "700 0.8rem system-ui",
                  color: C.gold,
                  background: "rgba(255,209,102,0.12)",
                  border: "1px solid rgba(255,209,102,0.25)",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  alignSelf: "flex-start",
                }}
              >
                Band: {formatBandLabel(data.bandCode)}
              </span>
            )}
          </div>
        </div>

        {/* ── Error state ─────────────────────────────────────────────────────── */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "14px",
              padding: "20px",
              color: C.red,
              font: "500 0.9rem system-ui",
              marginBottom: "24px",
            }}
          >
            {error}{" "}
            {error.includes("authenticated") && (
              <Link href="/parent" style={{ color: C.violet }}>
                Sign in →
              </Link>
            )}
          </div>
        )}

        {/* ── Loading skeleton ────────────────────────────────────────────────── */}
        {loading && !error && (
          <div>
            <div
              style={{
                height: "72px",
                borderRadius: "14px",
                background: "rgba(255,209,102,0.07)",
                border: "1px solid rgba(255,209,102,0.15)",
                marginBottom: "24px",
                animation: "pulse 1.6s ease-in-out infinite",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "14px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Must-have attention banner ──────────────────────────────────────── */}
        {!loading && data && mustHaveUnstarted.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,123,107,0.12), rgba(255,209,102,0.08))",
              border: "1px solid rgba(255,123,107,0.3)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              animation: "fadeSlideIn 0.45s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ fontSize: "1.3rem" }}>⚠️</span>
              <div>
                <div style={{ font: "700 0.95rem system-ui", color: C.gold }}>
                  {mustHaveUnstarted.length} must-have skill{mustHaveUnstarted.length !== 1 ? "s" : ""} need attention
                </div>
                <div style={{ font: "400 0.78rem system-ui", color: C.muted }}>
                  These core standards haven&apos;t been started yet
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {mustHaveUnstarted.slice(0, 3).map((rec) => (
                <div
                  key={rec.skillCode}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flex: "1 1 200px",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{subjectIcon(rec.subject)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "600 0.8rem system-ui", color: C.text }}>{rec.skillName}</div>
                    <div style={{ font: "400 0.68rem system-ui", color: C.muted }}>{activityLabel(rec.activityType)}</div>
                  </div>
                  <button
                    onClick={() => void pushSession(rec.skillCode, studentId, "Assigned from must-have list")}
                    disabled={pushing.has(rec.skillCode)}
                    style={{
                      padding: "6px 12px",
                      background: "linear-gradient(135deg, #ff7b6b, #ffd166)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#1a0f00",
                      font: "700 0.72rem system-ui",
                      cursor: pushing.has(rec.skillCode) ? "not-allowed" : "pointer",
                      opacity: pushing.has(rec.skillCode) ? 0.6 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {pushing.has(rec.skillCode) ? "…" : "Start Practicing"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Curriculum sections ─────────────────────────────────────────────── */}
        {!loading && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {priorityGroups.map((priority) => {
              const cfg = PRIORITY_CONFIG[priority];
              const recs = data.recommendations.filter((r) => r.priority === priority);
              if (recs.length === 0) return null;
              const isCollapsed = collapsed.has(priority);

              return (
                <div
                  key={priority}
                  style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    borderRadius: "18px",
                    overflow: "hidden",
                    animation: "fadeSlideIn 0.45s ease",
                  }}
                >
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(priority)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "18px 22px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>{cfg.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ font: "700 1rem system-ui", color: cfg.color }}>
                        {cfg.label}
                      </div>
                      <div style={{ font: "400 0.75rem system-ui", color: C.muted }}>
                        {cfg.description} · {recs.length} skill{recs.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        font: "600 0.85rem system-ui",
                        color: C.muted,
                        transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        display: "inline-block",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Skill grid */}
                  {!isCollapsed && (
                    <div
                      style={{
                        padding: "0 18px 18px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "14px",
                      }}
                    >
                      {recs.map((rec) => (
                        <SkillCard
                          key={rec.skillCode}
                          rec={rec}
                          childName={childName}
                          studentId={studentId}
                          onPush={pushSession}
                          pushing={pushing.has(rec.skillCode)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pending queue ───────────────────────────────────────────────────── */}
        {!loading && localPending.length > 0 && (
          <div
            style={{
              marginTop: "32px",
              background: "rgba(155,114,255,0.06)",
              border: "1px solid rgba(155,114,255,0.15)",
              borderRadius: "18px",
              padding: "22px",
              animation: "fadeSlideIn 0.5s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "1.1rem" }}>📬</span>
              <div>
                <div style={{ font: "700 1rem system-ui", color: C.text }}>In the Queue</div>
                <div style={{ font: "400 0.75rem system-ui", color: C.muted }}>
                  Sessions pushed to {childName} that haven&apos;t been played yet
                </div>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  font: "700 0.75rem system-ui",
                  color: C.violet,
                  background: "rgba(155,114,255,0.15)",
                  borderRadius: "20px",
                  padding: "3px 10px",
                }}
              >
                {localPending.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {localPending.map((item) => {
                const rec = data?.recommendations.find((r) => r.skillCode === item.skillCode);
                return (
                  <div
                    key={item.activityId}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: "12px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {rec && (
                      <span style={{ fontSize: "1.1rem" }}>{subjectIcon(rec.subject)}</span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: "600 0.85rem system-ui", color: C.text }}>
                        {rec?.skillName ?? item.skillCode}
                      </div>
                      <div style={{ font: "400 0.72rem system-ui", color: C.muted }}>
                        Pushed {formatTimeAgo(item.pushedAt)}
                        {item.priority === "urgent" && (
                          <span
                            style={{
                              marginLeft: "8px",
                              color: C.coral,
                              font: "600 0.68rem system-ui",
                            }}
                          >
                            · Urgent
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <div
                          style={{
                            font: "400 0.72rem/1.4 system-ui",
                            color: "rgba(255,255,255,0.4)",
                            marginTop: "3px",
                          }}
                        >
                          &ldquo;{item.note}&rdquo;
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromPending(item.activityId)}
                      style={{
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: C.muted,
                        font: "500 0.72rem system-ui",
                        cursor: "pointer",
                        padding: "5px 10px",
                        flexShrink: 0,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────────── */}
        {!loading && !error && data && data.recommendations.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: C.muted,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎉</div>
            <div style={{ font: "700 1.1rem system-ui", color: C.text, marginBottom: "8px" }}>
              All caught up!
            </div>
            <p style={{ font: "400 0.85rem system-ui", margin: 0 }}>
              No recommendations at this time. Check back after more sessions.
            </p>
          </div>
        )}
      </div>

      <ToastNotification toasts={toasts} dismiss={dismissToast} />
    </AppFrame>
  );
}
