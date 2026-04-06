"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillProgress = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  launchBandCode: string;
  correctCount: number;
  totalCount: number;
  masteryPct: number;
  lastPracticed: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function skillStatus(pct: number, total: number): "Strong" | "Building" | "Just started" {
  if (total <= 2 && pct < 50) return "Just started";
  if (pct >= 70) return "Strong";
  return "Building";
}

function statusStyle(status: "Strong" | "Building" | "Just started"): React.CSSProperties {
  if (status === "Strong")
    return { background: "rgba(80,232,144,0.14)", color: "#50e890", border: "1px solid rgba(80,232,144,0.25)" };
  if (status === "Building")
    return { background: "rgba(255,209,102,0.14)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.25)" };
  return { background: "rgba(155,114,255,0.14)", color: "#c4a8ff", border: "1px solid rgba(155,114,255,0.25)" };
}

function barColor(pct: number): string {
  if (pct >= 70) return "#9b72ff";
  if (pct >= 40) return "#ffd166";
  return "rgba(155,114,255,0.35)";
}

function subjectIcon(code: string): string {
  const c = (code ?? "").toLowerCase();
  if (c.includes("read") || c.includes("ela") || c.includes("literacy")) return "📖";
  if (c.includes("math")) return "➕";
  if (c.includes("science")) return "🔬";
  if (c.includes("social")) return "🌍";
  return "📚";
}

function subjectLabel(code: string): string {
  const c = (code ?? "").toLowerCase();
  if (c.includes("read") || c.includes("ela")) return "Reading";
  if (c.includes("literacy")) return "Literacy";
  if (c.includes("math")) return "Math";
  if (c.includes("science")) return "Science";
  return code ?? "General";
}

function formatLastPracticed(iso: string | null): string {
  if (!iso) return "Not yet practiced";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Skill card ───────────────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: SkillProgress }) {
  const status = skillStatus(skill.masteryPct, skill.totalCount);
  const color = barColor(skill.masteryPct);

  return (
    <Link
      href={`/parent/skills/${encodeURIComponent(skill.skillCode)}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(155,114,255,0.18)",
          borderRadius: "16px",
          padding: "18px 18px 16px",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(155,114,255,0.45)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(155,114,255,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(155,114,255,0.18)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
        }}
      >
        {/* Subject icon + name */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
          <span style={{ fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 }}>
            {subjectIcon(skill.subjectCode)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#f0f6ff",
              lineHeight: 1.3,
              marginBottom: "3px",
            }}>
              {skill.skillName}
            </div>
            <div style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>
              {subjectLabel(skill.subjectCode)}
            </div>
          </div>
          <span style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "20px",
            flexShrink: 0,
            ...statusStyle(status),
          }}>
            {status}
          </span>
        </div>

        {/* Mastery bar */}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.38)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Mastery
            </span>
            <span style={{ fontSize: "0.80rem", fontWeight: 800, color }}>
              {skill.masteryPct}%
            </span>
          </div>
          <div style={{
            height: "6px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "999px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${skill.masteryPct}%`,
              height: "100%",
              background: color,
              borderRadius: "999px",
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.30)" }}>
            {formatLastPracticed(skill.lastPracticed)}
          </span>
          <span style={{ fontSize: "0.68rem", color: "rgba(155,114,255,0.7)", fontWeight: 600 }}>
            {skill.totalCount} questions →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "320px",
      gap: "12px",
      color: "rgba(255,255,255,0.4)",
      textAlign: "center",
    }}>
      <span style={{ fontSize: "3rem" }}>📚</span>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>
        No skills practiced yet
      </div>
      <div style={{ fontSize: "0.82rem", maxWidth: 280 }}>
        Once your child completes sessions, their skill progress will appear here.
      </div>
      <Link href="/child" style={{
        marginTop: "8px",
        padding: "10px 22px",
        background: "rgba(155,114,255,0.18)",
        border: "1px solid rgba(155,114,255,0.35)",
        borderRadius: "10px",
        color: "#c4a8ff",
        fontWeight: 700,
        fontSize: "0.82rem",
        textDecoration: "none",
      }}>
        Start learning →
      </Link>
    </div>
  );
}

// ─── Subject group ────────────────────────────────────────────────────────────

function SubjectSection({
  label,
  icon,
  skills,
}: {
  label: string;
  icon: string;
  skills: SkillProgress[];
}) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "14px",
      }}>
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        <h2 style={{
          margin: 0,
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          {label}
        </h2>
        <span style={{
          marginLeft: "auto",
          fontSize: "0.70rem",
          color: "rgba(255,255,255,0.28)",
          fontWeight: 600,
        }}>
          {skills.length} skill{skills.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "12px",
      }}>
        {skills.map((s) => (
          <SkillCard key={s.skillCode} skill={s} />
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentSkillsPage() {
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "strong" | "building" | "started">("all");

  useEffect(() => {
    const studentId =
      typeof window !== "undefined"
        ? (new URLSearchParams(window.location.search).get("studentId") ??
            localStorage.getItem("wq_active_student_id"))
        : null;

    if (!studentId) {
      setError("No child selected. Please go back to Family Hub and select a child.");
      setLoading(false);
      return;
    }

    fetch(`/api/parent/skills?studentId=${encodeURIComponent(studentId)}`)
      .then(async (res) => {
        if (res.status === 401) throw new Error("Session expired. Please sign in again.");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? "Failed to load skills.");
        }
        return res.json() as Promise<{ skills: SkillProgress[] }>;
      })
      .then(({ skills: s }) => {
        setSkills(s);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load skills.");
        setLoading(false);
      });
  }, []);

  // Filter + group
  const filtered = skills.filter((s) => {
    if (filter === "all") return true;
    const st = skillStatus(s.masteryPct, s.totalCount);
    if (filter === "strong") return st === "Strong";
    if (filter === "building") return st === "Building";
    if (filter === "started") return st === "Just started";
    return true;
  });

  // Group by subject
  const grouped = new Map<string, SkillProgress[]>();
  for (const s of filtered) {
    const label = subjectLabel(s.subjectCode);
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)!.push(s);
  }

  const strongCount = skills.filter((s) => skillStatus(s.masteryPct, s.totalCount) === "Strong").length;
  const buildingCount = skills.filter((s) => skillStatus(s.masteryPct, s.totalCount) === "Building").length;
  const startedCount = skills.filter((s) => skillStatus(s.masteryPct, s.totalCount) === "Just started").length;

  const FILTER_TABS = [
    { id: "all" as const, label: "All", count: skills.length },
    { id: "strong" as const, label: "💜 Strong", count: strongCount },
    { id: "building" as const, label: "🌟 Building", count: buildingCount },
    { id: "started" as const, label: "🌱 New", count: startedCount },
  ];

  return (
    <AppFrame audience="parent" currentPath="/parent/skills">
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #100b2e 0%, #1a1248 55%, #0e1a38 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f0f6ff",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 60px" }}>

          {/* ── Top bar ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <Link href="/parent" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "#9b72ff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "13px",
              padding: "6px 12px",
              background: "rgba(155,114,255,0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(155,114,255,0.22)",
            }}>
              ← Home
            </Link>
            <Link href="/parent/report" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "13px",
              padding: "6px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              Weekly Report
            </Link>
          </div>

          {/* ── Header ── */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{
              margin: "0 0 6px",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 900,
              color: "#f0f6ff",
              letterSpacing: "-0.01em",
            }}>
              Skills Progress
            </h1>
            {!loading && !error && (
              <p style={{ margin: 0, fontSize: "0.84rem", color: "rgba(255,255,255,0.42)" }}>
                {skills.length} skill{skills.length !== 1 ? "s" : ""} practiced ·{" "}
                {strongCount} strong · {buildingCount} building · {startedCount} just started
              </p>
            )}
          </div>

          {/* ── Filter tabs ── */}
          {!loading && !error && skills.length > 0 && (
            <div style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}>
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "20px",
                    border: filter === tab.id
                      ? "1px solid rgba(155,114,255,0.55)"
                      : "1px solid rgba(255,255,255,0.1)",
                    background: filter === tab.id
                      ? "rgba(155,114,255,0.18)"
                      : "rgba(255,255,255,0.04)",
                    color: filter === tab.id ? "#c4a8ff" : "rgba(255,255,255,0.45)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{
                      marginLeft: "6px",
                      background: filter === tab.id ? "rgba(155,114,255,0.3)" : "rgba(255,255,255,0.08)",
                      color: filter === tab.id ? "#c4a8ff" : "rgba(255,255,255,0.35)",
                      borderRadius: "20px",
                      padding: "1px 7px",
                      fontSize: "0.70rem",
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              flexDirection: "column",
              gap: "12px",
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(155,114,255,0.2)",
                borderTop: "3px solid #9b72ff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>Loading skills…</span>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={{
              background: "rgba(255,123,107,0.1)",
              border: "1px solid rgba(255,123,107,0.25)",
              borderRadius: "12px",
              padding: "20px",
              color: "#ff7b6b",
              fontSize: "0.88rem",
              fontWeight: 600,
              textAlign: "center",
            }}>
              {error}
              <br />
              <Link href="/parent" style={{ color: "#9b72ff", marginTop: "8px", display: "inline-block" }}>
                ← Go back to Family Hub
              </Link>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && skills.length === 0 && <EmptyState />}

          {/* ── Skill groups ── */}
          {!loading && !error && filtered.length > 0 && (
            <div>
              {Array.from(grouped.entries()).map(([label, groupSkills]) => (
                <SubjectSection
                  key={label}
                  label={label}
                  icon={subjectIcon(groupSkills[0].subjectCode)}
                  skills={groupSkills}
                />
              ))}
            </div>
          )}

          {/* ── No results after filter ── */}
          {!loading && !error && skills.length > 0 && filtered.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "60px 0",
              color: "rgba(255,255,255,0.38)",
              fontSize: "0.88rem",
            }}>
              No skills match this filter yet.
            </div>
          )}

        </div>
      </div>
    </AppFrame>
  );
}
