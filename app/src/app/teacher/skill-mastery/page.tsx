"use client";

import { useState, useEffect, useMemo } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  blue: "#38bdf8",
  mint: "#50e890",
  gold: "#ffd166",
  coral: "#ff7b6b",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  faint: "rgba(255,255,255,0.05)",
} as const;

type SkillTrend = {
  skillCode: string;
  displayName: string;
  launchBandCode: string;
  launchBandLabel: string;
  totalAttempts: number;
  totalCorrectAttempts: number;
  accuracyRate: number;
};

type RosterStudent = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
};

function masteryColor(rate: number): string {
  if (rate >= 70) return C.mint;
  if (rate >= 40) return C.gold;
  return C.coral;
}

function masteryLabel(rate: number): string {
  if (rate >= 70) return "Mastered";
  if (rate >= 40) return "Developing";
  return "Needs work";
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 14,
        padding: "16px 18px",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ height: 13, width: "60%", background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
      <div style={{ height: 8, width: "100%", background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
      <div style={{ height: 10, width: "40%", background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
    </div>
  );
}

function SkillCard({ skill, totalStudents }: { skill: SkillTrend; totalStudents: number }) {
  const color = masteryColor(skill.accuracyRate);
  const label = masteryLabel(skill.accuracyRate);
  // Estimate mastered students: students who contributed to the accuracy above 70%
  // Use accuracy rate to approximate — students whose ratio >= 70%
  // We only have aggregate data, so we report "based on accuracy rate" context
  const approxMastered = totalStudents > 0
    ? Math.round((skill.accuracyRate / 100) * totalStudents)
    : 0;

  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 14,
        padding: "16px 18px",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Skill name + band + label */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2, lineHeight: 1.3 }}>
            {skill.displayName}
          </div>
          <div style={{ fontSize: 10, color: C.muted }}>
            {skill.launchBandLabel} · {skill.totalAttempts} attempt{skill.totalAttempts !== 1 ? "s" : ""}
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 8,
            background: `${color}18`,
            color,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            height: 8,
            borderRadius: 6,
            background: "rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, skill.accuracyRate)}%`,
              borderRadius: 6,
              background: color,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
            fontSize: 10,
            color: C.muted,
          }}
        >
          <span style={{ color, fontWeight: 700 }}>{skill.accuracyRate.toFixed(0)}% accuracy</span>
          {totalStudents > 0 && (
            <span>
              ~{approxMastered} of {totalStudents} students
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

type SortMode = "mastery-desc" | "mastery-asc" | "name";
type FilterMode = "all" | "needs-attention";

export default function SkillMasteryPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(!!getTeacherId());
  }, []);

  const [skills, setSkills] = useState<SkillTrend[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortMode, setSortMode] = useState<SortMode>("mastery-desc");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  useEffect(() => {
    if (!authed) return;
    const teacherId = getTeacherId();

    const skillsReq = fetch(
      `/api/teacher/skill-trends?teacherId=${encodeURIComponent(teacherId)}&days=30`,
    ).then((r) => {
      if (!r.ok) throw new Error(`skill-trends HTTP ${r.status}`);
      return r.json() as Promise<{ skills: SkillTrend[] }>;
    });

    const rosterReq = fetch(
      `/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`,
    ).then((r) => {
      if (!r.ok) throw new Error(`class HTTP ${r.status}`);
      return r.json() as Promise<{ roster: RosterStudent[] }>;
    });

    Promise.all([skillsReq, rosterReq])
      .then(([skillData, rosterData]) => {
        setSkills(skillData.skills ?? []);
        setTotalStudents((rosterData.roster ?? []).length);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load skill data. Please try again.");
        setLoading(false);
      });
  }, [authed]);

  const filtered = useMemo(() => {
    let list = [...skills];
    if (filterMode === "needs-attention") {
      list = list.filter((s) => s.accuracyRate < 50);
    }
    if (sortMode === "mastery-desc") {
      list.sort((a, b) => b.accuracyRate - a.accuracyRate);
    } else if (sortMode === "mastery-asc") {
      list.sort((a, b) => a.accuracyRate - b.accuracyRate);
    } else {
      list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
    return list;
  }, [skills, sortMode, filterMode]);

  // Summary stats
  const trackedCount = skills.length;
  const masteredCount = skills.filter((s) => s.accuracyRate >= 70).length;
  const attentionCount = skills.filter((s) => s.accuracyRate < 50).length;

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/skill-mastery">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
          }}
        >
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/skill-mastery">
      <div
        style={{
          padding: "28px 20px 72px",
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui,-apple-system,sans-serif",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>
            Skill Mastery
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Class-wide accuracy per skill · last 30 days
          </div>
        </div>

        {/* Summary stats */}
        {!loading && !error && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 22,
              padding: "14px 18px",
              background: C.surface,
              borderRadius: 14,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontSize: 13, color: C.muted }}>
              <span style={{ fontWeight: 800, color: C.text }}>{trackedCount}</span> skill{trackedCount !== 1 ? "s" : ""} tracked
            </div>
            <span style={{ color: C.border }}>·</span>
            <div style={{ fontSize: 13, color: C.muted }}>
              <span style={{ fontWeight: 800, color: C.mint }}>{masteredCount}</span> mastered by most
            </div>
            <span style={{ color: C.border }}>·</span>
            <div style={{ fontSize: 13, color: C.muted }}>
              <span style={{ fontWeight: 800, color: C.coral }}>{attentionCount}</span> need attention
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          {/* Sort controls */}
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Sort:
          </span>
          {(
            [
              { key: "mastery-desc", label: "Mastery ↓" },
              { key: "mastery-asc", label: "Mastery ↑" },
              { key: "name", label: "Skill name" },
            ] as { key: SortMode; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortMode(key)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1.5px solid ${sortMode === key ? C.blue : "rgba(255,255,255,0.1)"}`,
                background: sortMode === key ? C.blue : "transparent",
                color: sortMode === key ? C.base : "rgba(240,246,255,0.6)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Filter toggle */}
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Filter:
          </span>
          {(
            [
              { key: "all", label: "Show all" },
              { key: "needs-attention", label: "Needs attention (<50%)" },
            ] as { key: FilterMode; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterMode(key)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1.5px solid ${
                  filterMode === key
                    ? key === "needs-attention"
                      ? C.coral
                      : C.blue
                    : "rgba(255,255,255,0.1)"
                }`,
                background:
                  filterMode === key
                    ? key === "needs-attention"
                      ? C.coral
                      : C.blue
                    : "transparent",
                color:
                  filterMode === key
                    ? C.base
                    : "rgba(240,246,255,0.6)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: C.surface,
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid rgba(239,68,68,0.3)",
              textAlign: "center",
              marginBottom: 20,
              color: "#ef4444",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {error}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginLeft: 12,
                padding: "5px 14px",
                borderRadius: 8,
                background: "transparent",
                border: "1.5px solid rgba(239,68,68,0.4)",
                color: "#ef4444",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Skill grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: C.muted,
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            {skills.length === 0
              ? "No skill data yet — skills will appear once students complete sessions."
              : "No skills match the current filter."}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {filtered.map((skill) => (
              <SkillCard key={skill.skillCode} skill={skill} totalStudents={totalStudents} />
            ))}
          </div>
        )}

        {/* Legend */}
        {!loading && !error && filtered.length > 0 && (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
              fontSize: 11,
              color: C.muted,
            }}
          >
            <span style={{ fontWeight: 700, color: C.muted }}>Legend:</span>
            {[
              { color: C.mint, label: "≥70% — Mastered" },
              { color: C.gold, label: "40–69% — Developing" },
              { color: C.coral, label: "<40% — Needs work" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
