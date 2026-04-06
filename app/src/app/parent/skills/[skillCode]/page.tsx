"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type LiveSkill = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  launchBandCode: string;
  correctCount: number;
  totalCount: number;
  masteryPct: number;
  lastPracticed: string | null;
};

type ReportSession = {
  sessionId: string;
  startedAt: string;
  sessionMode: string;
  starsEarned: number;
  correctCount: number;
  totalQuestions: number;
  durationMinutes: number | null;
};

type ReportSkill = {
  skillId: string;
  skillName: string;
  subject: string;
  correctCount: number;
  totalCount: number;
  masteryPct: number;
  sessionCount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSkillName(code: string): string {
  return code
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

function skillStatus(pct: number, total: number): "strong" | "building" | "started" {
  if (total <= 2 && pct < 50) return "started";
  if (pct >= 70) return "strong";
  return "building";
}

function statusLabel(s: "strong" | "building" | "started"): string {
  if (s === "strong") return "Strong";
  if (s === "building") return "Building";
  return "Just started";
}

function statusColor(s: "strong" | "building" | "started"): string {
  if (s === "strong") return "#50e890";
  if (s === "building") return "#ffd166";
  return "#c4a8ff";
}

function statusBg(s: "strong" | "building" | "started"): string {
  if (s === "strong") return "rgba(80,232,144,0.14)";
  if (s === "building") return "rgba(255,209,102,0.14)";
  return "rgba(155,114,255,0.14)";
}

function statusBorder(s: "strong" | "building" | "started"): string {
  if (s === "strong") return "rgba(80,232,144,0.28)";
  if (s === "building") return "rgba(255,209,102,0.28)";
  return "rgba(155,114,255,0.28)";
}

function barColor(pct: number): string {
  if (pct >= 70) return "#9b72ff";
  if (pct >= 40) return "#ffd166";
  return "rgba(155,114,255,0.35)";
}

function formatLastPracticed(iso: string | null): string {
  if (!iso) return "Not yet practiced";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function accuracyPct(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  label, value, sub, color,
}: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(155,114,255,0.16)",
      borderRadius: "14px",
      padding: "16px 14px",
      textAlign: "center",
      flex: "1 1 110px",
    }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.38)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: sub ? 3 : 0 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.26)" }}>{sub}</div>
      )}
    </div>
  );
}

// ─── Session row ──────────────────────────────────────────────────────────────

function SessionRow({ session, isLast }: { session: ReportSession; isLast: boolean }) {
  const perfect = session.totalQuestions > 0 && session.correctCount === session.totalQuestions;
  const acc = accuracyPct(session.correctCount, session.totalQuestions);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 0",
      borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: perfect ? "rgba(80,232,144,0.14)" : "rgba(155,114,255,0.12)",
        border: `1px solid ${perfect ? "rgba(80,232,144,0.3)" : "rgba(155,114,255,0.2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1rem", flexShrink: 0,
      }}>
        {perfect ? "🔥" : "⭐"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f0f6ff", marginBottom: 2 }}>
          {formatSessionDate(session.startedAt)}
        </div>
        <div style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.38)" }}>
          {session.totalQuestions > 0
            ? `${acc}% accuracy · ${session.correctCount}/${session.totalQuestions} correct`
            : "Session completed"}
          {session.durationMinutes != null ? ` · ${session.durationMinutes} min` : ""}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffd166" }}>
          ⭐ {session.starsEarned}
        </div>
        {perfect && (
          <div style={{ fontSize: "0.62rem", color: "#50e890", fontWeight: 600 }}>Perfect</div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentSkillDetailPage() {
  const params = useParams();
  const skillCode = typeof params?.skillCode === "string"
    ? decodeURIComponent(params.skillCode)
    : "";

  const [skill, setSkill] = useState<LiveSkill | null>(null);
  const [reportSkill, setReportSkill] = useState<ReportSkill | null>(null);
  const [recentSessions, setRecentSessions] = useState<ReportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!skillCode) return;

    const studentId =
      typeof window !== "undefined"
        ? (new URLSearchParams(window.location.search).get("studentId") ??
            localStorage.getItem("wq_active_student_id"))
        : null;

    if (!studentId) {
      setError("No child selected. Please go back and select a child.");
      setLoading(false);
      return;
    }

    // Fetch skills list, latest report, and per-skill sessions in parallel
    Promise.all([
      fetch(`/api/parent/skills?studentId=${encodeURIComponent(studentId)}`)
        .then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/parent/report?studentId=${encodeURIComponent(studentId)}&weekOffset=0`)
        .then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/parent/activity?studentId=${encodeURIComponent(studentId)}&skillCode=${encodeURIComponent(skillCode)}&limit=10`)
        .then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([skillsData, reportData, activityData]) => {
        // Match skill
        const skills: LiveSkill[] = skillsData?.skills ?? [];
        const matched = skills.find((s) => s.skillCode === skillCode);
        setSkill(matched ?? null);

        // Match skill in report
        const rSkills: ReportSkill[] = reportData?.report?.skills ?? [];
        const rMatch = rSkills.find(
          (s) => s.skillName?.toLowerCase().replace(/\s+/g, "-") === skillCode ||
                 s.skillName === formatSkillName(skillCode)
        );
        setReportSkill(rMatch ?? null);

        // Per-skill sessions from activity API, fall back to report session log
        const liveSessions: ReportSession[] = (activityData?.sessions ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any) => ({
            sessionId: s.sessionId,
            startedAt: s.startedAt,
            sessionMode: s.sessionMode,
            starsEarned: s.starsEarned ?? 0,
            correctCount: s.correctCount ?? 0,
            totalQuestions: s.totalQuestions ?? 0,
            durationMinutes: s.durationMinutes ?? null,
          })
        );
        setRecentSessions(
          liveSessions.length > 0
            ? liveSessions
            : (reportData?.report?.sessionLog?.slice(0, 8) ?? []),
        );
      })
      .catch(() => setError("Failed to load skill data."))
      .finally(() => setLoading(false));
  }, [skillCode]);

  const skillName = skill?.skillName ?? formatSkillName(skillCode);
  const status = skill ? skillStatus(skill.masteryPct, skill.totalCount) : null;
  const icon = subjectIcon(skill?.subjectCode ?? "");
  const subject = subjectLabel(skill?.subjectCode ?? "");

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppFrame audience="parent" currentPath="/parent/skills">
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #100b2e 0%, #1a1248 55%, #0e1a38 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36,
            border: "3px solid rgba(155,114,255,0.2)",
            borderTop: "3px solid #9b72ff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.82rem" }}>Loading…</span>
        </div>
      </AppFrame>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (error || !skill) {
    return (
      <AppFrame audience="parent" currentPath="/parent/skills">
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #100b2e 0%, #1a1248 55%, #0e1a38 100%)",
          fontFamily: "system-ui, sans-serif", color: "#f0f6ff",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 16, padding: "40px 24px", textAlign: "center",
        }}>
          <span style={{ fontSize: "2.5rem" }}>📚</span>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
            {error ?? `"${formatSkillName(skillCode)}" hasn't been practiced yet`}
          </div>
          <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", maxWidth: 280 }}>
            Once your child practices this skill, progress will appear here.
          </div>
          <Link href="/parent/skills" style={{
            padding: "10px 22px",
            background: "rgba(155,114,255,0.18)",
            border: "1px solid rgba(155,114,255,0.35)",
            borderRadius: "10px",
            color: "#c4a8ff", fontWeight: 700, fontSize: "0.82rem",
            textDecoration: "none",
          }}>
            ← All Skills
          </Link>
        </div>
      </AppFrame>
    );
  }

  const st = status!;

  return (
    <AppFrame audience="parent" currentPath="/parent/skills">
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #100b2e 0%, #1a1248 55%, #0e1a38 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#f0f6ff",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 60px" }}>

          {/* ── Breadcrumb ── */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
            <Link href="/parent" style={{
              fontSize: "13px", fontWeight: 700, color: "#9b72ff",
              padding: "6px 12px", background: "rgba(155,114,255,0.1)",
              borderRadius: "8px", border: "1px solid rgba(155,114,255,0.22)",
              textDecoration: "none",
            }}>← Home</Link>
            <Link href="/parent/skills" style={{
              fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.45)",
              padding: "6px 12px", background: "rgba(255,255,255,0.04)",
              borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)",
              textDecoration: "none",
            }}>All Skills</Link>
          </div>

          {/* ── Hero card ── */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(155,114,255,0.2)",
            borderRadius: "20px",
            padding: "28px 24px 24px",
            marginBottom: "20px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Glow */}
            <div style={{
              position: "absolute", top: -60, right: -60, width: 200, height: 200,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${statusBg(st)} 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
              <span style={{ fontSize: "2.2rem", lineHeight: 1, flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: "0 0 4px", fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontWeight: 900, color: "#f0f6ff" }}>
                  {skillName}
                </h1>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.42)", fontWeight: 500 }}>
                    {subject}
                  </span>
                  <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>·</span>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.42)" }}>
                    Band {skill.launchBandCode}
                  </span>
                </div>
              </div>
              <span style={{
                flexShrink: 0, fontSize: "0.72rem", fontWeight: 700,
                padding: "5px 12px", borderRadius: "20px",
                color: statusColor(st), background: statusBg(st),
                border: `1px solid ${statusBorder(st)}`,
              }}>
                {statusLabel(st)}
              </span>
            </div>

            {/* Mastery bar */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.42)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Mastery
                </span>
                <span style={{ fontSize: "1rem", fontWeight: 900, color: barColor(skill.masteryPct) }}>
                  {skill.masteryPct}%
                </span>
              </div>
              <div style={{ height: "10px", background: "rgba(255,255,255,0.07)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  width: `${skill.masteryPct}%`, height: "100%",
                  background: barColor(skill.masteryPct), borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>

            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.30)", textAlign: "right" }}>
              Last practiced: {formatLastPracticed(skill.lastPracticed)}
            </div>
          </div>

          {/* ── Stats row ── */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            <StatTile label="Questions" value={String(skill.totalCount)} color="#9b72ff" sub="total answered" />
            <StatTile
              label="Accuracy"
              value={`${accuracyPct(skill.correctCount, skill.totalCount)}%`}
              color="#50e890"
              sub={`${skill.correctCount} correct`}
            />
            {reportSkill && (
              <StatTile label="Sessions" value={String(reportSkill.sessionCount)} color="#ffd166" sub="this week" />
            )}
          </div>

          {/* ── Insight card ── */}
          <div style={{
            background: st === "strong"
              ? "rgba(80,232,144,0.07)"
              : st === "building"
              ? "rgba(255,209,102,0.07)"
              : "rgba(155,114,255,0.07)",
            border: `1px solid ${statusBorder(st)}`,
            borderRadius: "14px",
            padding: "16px 18px",
            marginBottom: "20px",
          }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: statusColor(st), marginBottom: "4px" }}>
              {st === "strong" ? "🌟 Keep it up!" : st === "building" ? "📈 Making progress" : "🌱 Just getting started"}
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
              {st === "strong"
                ? `Mastery is at ${skill.masteryPct}% — your child has a solid grasp of ${skillName}. Keep practicing to lock it in.`
                : st === "building"
                ? `At ${skill.masteryPct}% mastery, your child is getting comfortable with ${skillName}. A few more sessions should push them over the line.`
                : `This skill is new for your child. Early sessions are the most important — try to practice ${skillName} a few times this week.`}
            </div>
          </div>

          {/* ── Recent sessions ── */}
          {recentSessions.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              padding: "20px 20px 8px",
              marginBottom: "20px",
            }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Recent Sessions
              </h2>
              <p style={{ margin: "0 0 14px", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
                Sessions that included this skill · most recent first
              </p>
              {recentSessions.map((s, i) => (
                <SessionRow key={s.sessionId} session={s} isLast={i === recentSessions.length - 1} />
              ))}
            </div>
          )}

          {/* ── No sessions yet ── */}
          {recentSessions.length === 0 && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              padding: "28px 20px",
              textAlign: "center",
              color: "rgba(255,255,255,0.35)",
              fontSize: "0.84rem",
              marginBottom: "20px",
            }}>
              No sessions this week yet. <br />
              <span style={{ fontSize: "0.75rem" }}>Check back after your child plays!</span>
            </div>
          )}

          {/* ── Tips ── */}
          <div style={{
            background: "rgba(155,114,255,0.06)",
            border: "1px solid rgba(155,114,255,0.15)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#c4a8ff", marginBottom: "6px" }}>
              💡 How to support at home
            </div>
            <div style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Practice in short bursts of 5–10 minutes. Point out real-world examples of {skillName.toLowerCase()} during everyday moments — meals, walks, or bedtime reading all count!
            </div>
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
