"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChildPicker } from "@/components/child-picker";
import { getActiveChildId, setActiveChildId } from "@/lib/active-child";

// ─── Types ────────────────────────────────────────────────────────────────────

type LinkedChild = {
  id: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
};

type ParentSession = {
  linkedChildren: LinkedChild[];
};

type SkillSummaryItem = {
  skillCode: string;
  displayName: string;
  subjectCode: string;
  masteryScore: number;
  sessionCount: number;
  avgTimeMs: number;
  proficientAt: string | null;
  proficiencyEvidence: {
    masteryScore?: number;
    sessionCount?: number;
    avgTimeMs?: number;
    correctAttempts?: number;
    totalAttempts?: number;
    achievedAt?: string;
  } | null;
  attempts: number;
  correctAttempts: number;
};

type ApiResponse = {
  studentId: string;
  displayName: string;
  bandCode: string;
  summary: {
    proficientCount: number;
    inProgressCount: number;
    notStartedCount: number;
    total: number;
  };
  skills: SkillSummaryItem[];
  error?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BAND_THRESHOLDS: Record<string, number> = {
  PREK: 72,
  K1: 78,
  G23: 82,
  G45: 85,
};

const BAND_MIN_SESSIONS: Record<string, number> = {
  PREK: 2,
  K1: 3,
  G23: 3,
  G45: 4,
};

const BAND_LABELS: Record<string, string> = {
  PREK: "Pre-K",
  K1: "K–1",
  G23: "Grades 2–3",
  G45: "Grades 4–5",
};

function subjectColor(subjectCode: string): { bg: string; text: string } {
  const s = (subjectCode ?? "").toLowerCase();
  if (s.includes("math")) return { bg: "rgba(91,130,255,0.18)", text: "#7da4ff" };
  if (s.includes("phon") || s.includes("read") || s.includes("ela") || s.includes("literacy"))
    return { bg: "rgba(255,180,80,0.18)", text: "#ffb450" };
  if (s.includes("science") || s.includes("life") || s.includes("eco"))
    return { bg: "rgba(88,232,193,0.18)", text: "#58e8c1" };
  if (s.includes("social") || s.includes("history") || s.includes("geo"))
    return { bg: "rgba(255,123,107,0.18)", text: "#ff7b6b" };
  return { bg: "rgba(155,114,255,0.18)", text: "#9b72ff" };
}

function subjectLabel(subjectCode: string): string {
  const s = (subjectCode ?? "").toLowerCase();
  if (s.includes("math")) return "Math";
  if (s.includes("phon")) return "Phonics";
  if (s.includes("read") || s.includes("ela") || s.includes("literacy")) return "Reading";
  if (s.includes("science") || s.includes("life") || s.includes("eco")) return "Science";
  if (s.includes("social") || s.includes("history")) return "Social Studies";
  if (s.includes("geo")) return "Geography";
  return subjectCode ?? "General";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function msToSec(ms: number): string {
  return (ms / 1000).toFixed(1) + "s";
}

function accuracyPct(correct: number, total: number): string {
  if (total === 0) return "—";
  return Math.round((correct / total) * 100) + "%";
}

// ─── Skill Card: Proficient ───────────────────────────────────────────────────

function ProficientCard({ skill }: { skill: SkillSummaryItem }) {
  const { bg, text } = subjectColor(skill.subjectCode);
  const ev = skill.proficiencyEvidence;
  const sessions = ev?.sessionCount ?? skill.sessionCount;
  const acc = ev
    ? accuracyPct(ev.correctAttempts ?? 0, ev.totalAttempts ?? 0)
    : accuracyPct(skill.correctAttempts, skill.attempts);
  const avgSec = ev?.avgTimeMs != null ? msToSec(ev.avgTimeMs) : msToSec(skill.avgTimeMs);
  const achievedDate = formatDate(ev?.achievedAt ?? skill.proficientAt);

  return (
    <div
      style={{
        background: "rgba(88,232,193,0.07)",
        border: "1px solid rgba(88,232,193,0.25)",
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            padding: "3px 8px",
            borderRadius: 20,
            background: bg,
            color: text,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {subjectLabel(skill.subjectCode)}
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
          {skill.displayName}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 18, flexShrink: 0 }} title="Proficient">
          ✅
        </span>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
        <span style={{ fontSize: 12, color: "#58e8c1", fontWeight: 600 }}>
          Achieved {achievedDate}
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          {sessions} session{sessions !== 1 ? "s" : ""} &middot; {acc} accuracy &middot; {avgSec} avg
        </span>
      </div>
    </div>
  );
}

// ─── Skill Card: In Progress ──────────────────────────────────────────────────

function InProgressCard({
  skill,
  bandCode,
}: {
  skill: SkillSummaryItem;
  bandCode: string;
}) {
  const { bg, text } = subjectColor(skill.subjectCode);
  const threshold = BAND_THRESHOLDS[bandCode] ?? 78;
  const minSessions = BAND_MIN_SESSIONS[bandCode] ?? 3;
  const progressPct = Math.min(100, Math.round((skill.masteryScore / threshold) * 100));
  const sessionProgressPct = Math.min(100, Math.round((skill.sessionCount / minSessions) * 100));
  const acc = accuracyPct(skill.correctAttempts, skill.attempts);

  return (
    <div
      style={{
        background: "rgba(155,114,255,0.07)",
        border: "1px solid rgba(155,114,255,0.22)",
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            padding: "3px 8px",
            borderRadius: 20,
            background: bg,
            color: text,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {subjectLabel(skill.subjectCode)}
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
          {skill.displayName}
        </span>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 5,
          }}
        >
          <span>Mastery score</span>
          <span>
            {Math.round(skill.masteryScore)} / {threshold}
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 4,
            background: "rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              borderRadius: 4,
              background: "linear-gradient(90deg, #9b72ff, #c47fff)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          {skill.sessionCount} of {minSessions} sessions done ({sessionProgressPct}%)
        </span>
        {skill.attempts > 0 && (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            {acc} accuracy
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Skill Card: Not Started ──────────────────────────────────────────────────

function NotStartedCard({ skill }: { skill: SkillSummaryItem }) {
  const { bg, text } = subjectColor(skill.subjectCode);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.5,
          padding: "3px 8px",
          borderRadius: 20,
          background: bg,
          color: text,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {subjectLabel(skill.subjectCode)}
      </span>
      <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
        {skill.displayName}
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
          fontStyle: "italic",
        }}
      >
        Not started yet
      </span>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          padding: "2px 10px",
          borderRadius: 20,
          background: `${color}22`,
          color,
        }}
      >
        {count}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProficiencyPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ParentSession | null>(null);
  const [activeCid, setActiveCid] = useState<string>("");

  function fetchProficiency(childId: string) {
    setLoading(true);
    setData(null);
    fetch(`/api/parent/skill-proficiency?childId=${encodeURIComponent(childId)}`)
      .then((r) => r.json())
      .then((json: ApiResponse) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      })
      .catch(() => setError("Failed to load proficiency data."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // Load session to get children list, then fetch proficiency for first child
    fetch("/api/parent/session")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Not authenticated"))))
      .then((s: ParentSession) => {
        setSession(s);
        const persisted = getActiveChildId();
        const defaultChild = s.linkedChildren.find(c => c.id === persisted) ?? s.linkedChildren[0];
        const firstId = defaultChild?.id ?? "";
        if (firstId) {
          setActiveCid(firstId);
          setActiveChildId(firstId);
          fetchProficiency(firstId);
        } else {
          setError("No child linked yet.");
          setLoading(false);
        }
      })
      .catch(() => {
        // Fallback: try without childId (API picks first linked child)
        fetch("/api/parent/skill-proficiency")
          .then((r) => r.json())
          .then((json: ApiResponse) => {
            if (json.error) setError(json.error);
            else setData(json);
          })
          .catch(() => setError("Failed to load proficiency data."))
          .finally(() => setLoading(false));
      });
  }, []);

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#100b2e",
    fontFamily: "system-ui, sans-serif",
    color: "#fff",
    padding: "0 0 80px",
  };

  const headerStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    padding: "20px 24px 18px",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Link
            href="/parent/report"
            style={{ fontSize: 13, color: "#9b72ff", textDecoration: "none" }}
          >
            &larr; Back to Report
          </Link>
          <h1 style={{ margin: "12px 0 0", fontSize: 22, fontWeight: 700 }}>
            Skill Proficiency
          </h1>
        </div>
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.45)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <Link
            href="/parent/report"
            style={{ fontSize: 13, color: "#9b72ff", textDecoration: "none" }}
          >
            &larr; Back to Report
          </Link>
          <h1 style={{ margin: "12px 0 0", fontSize: 22, fontWeight: 700 }}>
            Skill Proficiency
          </h1>
        </div>
        <div
          style={{
            margin: 24,
            padding: 20,
            background: "rgba(255,107,107,0.12)",
            border: "1px solid rgba(255,107,107,0.3)",
            borderRadius: 12,
            color: "#ff7b6b",
          }}
        >
          {error ?? "No data available."}
        </div>
      </div>
    );
  }

  const proficientSkills = data.skills.filter((s) => s.proficientAt);
  const inProgressSkills = data.skills.filter((s) => !s.proficientAt && s.sessionCount > 0);
  const notStartedSkills = data.skills.filter((s) => s.sessionCount === 0);
  const bandLabel = BAND_LABELS[data.bandCode] ?? data.bandCode;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <Link
          href="/parent/report"
          style={{ fontSize: 13, color: "#9b72ff", textDecoration: "none" }}
        >
          &larr; Back to Report
        </Link>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            {data.displayName}&apos;s Skill Proficiency
          </h1>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              background: "rgba(155,114,255,0.18)",
              color: "#9b72ff",
            }}
          >
            {bandLabel}
          </span>
        </div>

        {/* Summary chips */}
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(88,232,193,0.12)",
              border: "1px solid rgba(88,232,193,0.3)",
              fontSize: 13,
              fontWeight: 600,
              color: "#58e8c1",
            }}
          >
            {data.summary.proficientCount} Proficient
          </div>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(155,114,255,0.12)",
              border: "1px solid rgba(155,114,255,0.3)",
              fontSize: 13,
              fontWeight: 600,
              color: "#9b72ff",
            }}
          >
            {data.summary.inProgressCount} In Progress
          </div>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {data.summary.notStartedCount} Not Started
          </div>
        </div>
      </div>

      {/* Child picker */}
      {session && session.linkedChildren.length > 1 && (
        <div style={{ padding: "16px 24px 0" }}>
          <ChildPicker
            children={session.linkedChildren}
            activeChildId={activeCid}
            onSelect={(id) => {
              setActiveCid(id);
              setActiveChildId(id);
              fetchProficiency(id);
            }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "24px 20px", maxWidth: 720, margin: "0 auto" }}>

        {/* Proficient section */}
        {proficientSkills.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <SectionHeader
              label="Proficient"
              count={proficientSkills.length}
              color="#58e8c1"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {proficientSkills.map((skill) => (
                <ProficientCard key={skill.skillCode} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {/* In Progress section */}
        {inProgressSkills.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <SectionHeader
              label="In Progress"
              count={inProgressSkills.length}
              color="#9b72ff"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {inProgressSkills.map((skill) => (
                <InProgressCard
                  key={skill.skillCode}
                  skill={skill}
                  bandCode={data.bandCode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Not Started section */}
        {notStartedSkills.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <SectionHeader
              label="Not Yet Started"
              count={notStartedSkills.length}
              color="rgba(255,255,255,0.38)"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {notStartedSkills.map((skill) => (
                <NotStartedCard key={skill.skillCode} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {data.skills.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <div style={{ fontSize: 16 }}>No curriculum skills found for this band.</div>
          </div>
        )}
      </div>
    </div>
  );
}
