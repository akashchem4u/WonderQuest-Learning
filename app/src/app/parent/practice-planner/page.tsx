"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  violetDim: "rgba(155,114,255,0.14)",
  violetBorder: "rgba(155,114,255,0.28)",
  mint: "#22c55e",
  mintDim: "rgba(34,197,94,0.12)",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  faint: "rgba(255,255,255,0.08)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────
type Subject = "reading" | "math" | "all";
type Tab = "planner" | "checklist";

interface SkillRow {
  skillId: string;
  skillName: string;
  subject: string;
  masteryPct: number;
  sessionCount: number;
}

interface HeatmapDay {
  dayLabel: string;
  date: string;
  sessionCount: number;
}

interface ReportData {
  displayName: string;
  launchBandCode: string;
  weekLabel: string;
  skills: SkillRow[];
  heatmap: HeatmapDay[];
  stats: {
    sessions: number;
    starsEarned: number;
    streakDays: number;
  };
}

function getChildId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/wonderquest-child-id=([^;]+)/);
  return match?.[1] ?? null;
}

function subjectIconBg(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("math")) return "rgba(155,114,255,0.14)";
  if (s.includes("read")) return "rgba(34,197,94,0.14)";
  return "rgba(245,158,11,0.14)";
}

function subjectIcon(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("math")) return "➗";
  if (s.includes("read")) return "📖";
  return "🎯";
}

function masteryBar(pct: number): { color: string; label: string } {
  if (pct >= 75) return { color: C.mint, label: "Strong" };
  if (pct >= 50) return { color: C.amber, label: "Building" };
  return { color: "#f87171", label: "Needs practice" };
}

export default function PracticePlannerPage() {
  const [tab, setTab] = useState<Tab>("planner");
  const [subject, setSubject] = useState<Subject>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [checkedDays, setCheckedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const childId = getChildId();
        if (!childId) {
          setError("No child profile linked. Please sign in again.");
          return;
        }
        const res = await fetch(`/api/parent/report?studentId=${encodeURIComponent(childId)}&weekOffset=0`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to load report (${res.status})`);
        }
        const data = await res.json();
        setReport(data.report as ReportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const practiceSkills: SkillRow[] = report
    ? [...report.skills]
        .sort((a, b) => a.masteryPct - b.masteryPct)
        .slice(0, 5)
    : [];

  const filteredSkills = practiceSkills.filter(
    (s) => subject === "all" || s.subject.toLowerCase().includes(subject),
  );

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDayCheck = (date: string) => {
    setCheckedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const activeDaysThisWeek = report ? report.heatmap.filter((d) => d.sessionCount > 0) : [];
  const checkedCount = checkedDays.size + activeDaysThisWeek.length;
  const totalDays = 7;

  const childFirstName = report ? report.displayName.split(" ")[0] : "your child";

  const tabs: { id: Tab; label: string }[] = [
    { id: "planner", label: "Activity Suggestions" },
    { id: "checklist", label: "Saved Checklist" },
  ];

  const subjectFilters: { id: Subject; label: string }[] = [
    { id: "all", label: "All" },
    { id: "reading", label: "🌿 Reading" },
    { id: "math", label: "➗ Math" },
  ];

  return (
    <AppFrame audience="parent" currentPath="/parent/practice-planner">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        {/* Page header */}
        <div style={{ marginBottom: 24, maxWidth: 680 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>At-Home Practice</div>
          <div style={{ fontSize: 14, color: C.muted }}>
            {report
              ? `Ideas to support ${childFirstName}'s learning this week — no prep needed`
              : "Ideas to support your child's learning this week — no prep needed"}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", maxWidth: 680 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: tab === t.id ? `1.5px solid ${C.violet}` : `1.5px solid ${C.border}`,
                background: tab === t.id ? C.violetDim : C.surfaceAlt,
                color: tab === t.id ? C.violet : C.muted,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui",
                transition: "all .15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0", color: C.muted, fontSize: 14, maxWidth: 560 }}>
            Loading {childFirstName}&apos;s weekly report...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 10, padding: "16px 20px", color: "#fca5a5", fontSize: 13, maxWidth: 560,
          }}>
            {error}
          </div>
        )}

        {/* ── Planner tab ───────────────────────────────────────────── */}
        {!loading && !error && tab === "planner" && (
          <div style={{ maxWidth: 560 }}>
            {report && (
              <>
                {/* Info banner */}
                <div style={{ background: C.violetDim, borderLeft: `4px solid ${C.violet}`, borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#c4b5fd", lineHeight: 1.55 }}>
                  {practiceSkills.length > 0 ? (
                    <>
                      These suggestions are tied to skills {childFirstName} is building toward this week —{" "}
                      <strong style={{ color: C.violet }}>
                        {practiceSkills.slice(0, 2).map((s) => s.skillName).join(" and ")}
                      </strong>
                      {practiceSkills.length > 2 && ` and ${practiceSkills.length - 2} more`}.
                    </>
                  ) : (
                    <>No specific practice areas this week — {childFirstName} is doing great across all skills!</>
                  )}
                </div>

                {practiceSkills.length === 0 && (
                  <div style={{
                    background: C.surface, borderRadius: 16, padding: "32px 24px",
                    border: `1px solid ${C.border}`, textAlign: "center",
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                      {childFirstName}&apos;s looking strong this week!
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                      No specific support areas to suggest activities for right now. Check back as {childFirstName} explores new skills.
                    </div>
                  </div>
                )}

                {practiceSkills.length > 0 && (
                  <>
                    {/* Subject filter chips */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                      {subjectFilters.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSubject(f.id)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 20,
                            border: subject === f.id ? `1.5px solid ${C.violet}` : `1.5px solid ${C.border}`,
                            background: subject === f.id ? C.violetDim : C.surfaceAlt,
                            color: subject === f.id ? C.violet : C.muted,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "system-ui",
                            transition: "all .15s",
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Skill practice cards */}
                    {filteredSkills.length === 0 && (
                      <div style={{ color: C.muted, fontSize: 13, padding: "16px 0" }}>
                        No skills to show for this filter.
                      </div>
                    )}

                    {filteredSkills.map((skill) => {
                      const isSel = selected.has(skill.skillId);
                      const bar = masteryBar(skill.masteryPct);
                      return (
                        <div
                          key={skill.skillId}
                          onClick={() => toggleSelected(skill.skillId)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 14,
                            background: isSel ? C.violetDim : C.surface,
                            border: `1.5px solid ${isSel ? C.violetBorder : C.border}`,
                            borderRadius: 14,
                            padding: "16px 18px",
                            marginBottom: 10,
                            cursor: "pointer",
                            transition: "all .15s",
                          }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: subjectIconBg(skill.subject), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                            {subjectIcon(skill.subject)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{skill.skillName}</div>
                            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                              Practice this skill at home — short everyday moments make a big difference for {childFirstName}.
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                              <div style={{ flex: 1, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                <div style={{ width: `${skill.masteryPct}%`, height: "100%", background: bar.color, borderRadius: 4, transition: "width 0.3s" }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: bar.color, whiteSpace: "nowrap" }}>{bar.label} ({skill.masteryPct}%)</span>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.violet, marginTop: 5 }}>{skill.skillName} · {skill.subject}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{skill.sessionCount} session{skill.sessionCount !== 1 ? "s" : ""}</span>
                            <div style={{
                              width: 22, height: 22, borderRadius: "50%",
                              border: `2px solid ${isSel ? C.violet : C.faint}`,
                              background: isSel ? C.violet : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, color: "#fff",
                              transition: "all .15s",
                            }}>
                              {isSel ? "✓" : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Summary row */}
                    <div style={{ display: "flex", gap: 14, background: C.violetDim, borderRadius: 12, padding: "12px 16px", marginTop: 4, marginBottom: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>✅ {selected.size} saved · {filteredSkills.length - selected.size < 0 ? 0 : filteredSkills.length - selected.size} not saved</span>
                      <span style={{ fontSize: 12, color: C.muted }}>·</span>
                      <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Week: {report.weekLabel}</span>
                    </div>

                    <button
                      onClick={() => { setTab("checklist"); }}
                      style={{ width: "100%", padding: "14px 16px", background: C.violet, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}
                    >
                      Save selected to checklist
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Checklist tab ─────────────────────────────────────────── */}
        {!loading && !error && tab === "checklist" && (
          <div style={{ maxWidth: 480 }}>
            {report && (
              <div style={{ background: C.surface, borderRadius: 16, padding: 22, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>This week&apos;s checklist</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{report.weekLabel} · For {childFirstName}</div>

                {/* Heatmap-based session days */}
                {report.heatmap.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                      Quest sessions this week
                    </div>
                    {report.heatmap.map((day, i) => {
                      const hasSession = day.sessionCount > 0;
                      const isManuallyChecked = checkedDays.has(day.date);
                      const isDone = hasSession || isManuallyChecked;
                      return (
                        <div
                          key={day.date}
                          onClick={() => { if (!hasSession) toggleDayCheck(day.date); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "12px 0",
                            borderBottom: i < report.heatmap.length - 1 ? `1px solid ${C.border}` : "none",
                            cursor: hasSession ? "default" : "pointer",
                          }}
                        >
                          <div style={{
                            width: 24, height: 24, borderRadius: 7,
                            background: isDone ? C.mint : "transparent",
                            border: isDone ? "none" : `2px solid ${C.faint}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, color: "#fff", flexShrink: 0,
                          }}>
                            {isDone ? "✓" : ""}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.55 : 1 }}>
                              {day.dayLabel} — Quest Session
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                              {day.date}{hasSession ? ` · ${day.sessionCount} session${day.sessionCount !== 1 ? "s" : ""} completed` : " · No sessions yet"}
                            </div>
                          </div>
                          {hasSession && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: C.mint,
                              background: C.mintDim, borderRadius: 20, padding: "2px 8px",
                            }}>WonderQuest</span>
                          )}
                        </div>
                      );
                    })}

                    <div style={{ background: C.mintDim, borderRadius: 10, padding: "10px 14px", marginTop: 16, fontSize: 12, color: "#4ade80", lineHeight: 1.55 }}>
                      {activeDaysThisWeek.length === 0
                        ? `No sessions recorded yet this week. Encourage ${childFirstName} to explore a quest today!`
                        : `${activeDaysThisWeek.length} of ${totalDays} days with WonderQuest sessions this week${activeDaysThisWeek.length >= 3 ? " — great consistency!" : " — keep the momentum going!"}`}
                    </div>
                  </>
                )}

                {/* Stats summary */}
                {(report.stats.sessions > 0 || report.stats.starsEarned > 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
                    {[
                      { label: "Sessions", value: String(report.stats.sessions) },
                      { label: "Stars earned", value: String(report.stats.starsEarned) },
                      { label: "Streak days", value: String(report.stats.streakDays) },
                    ].map((m) => (
                      <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: C.violet }}>{m.value}</div>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, marginTop: 2 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <span
                    onClick={() => setTab("planner")}
                    style={{ fontSize: 12, color: C.violet, fontWeight: 700, cursor: "pointer" }}
                  >+ Add more activities</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
