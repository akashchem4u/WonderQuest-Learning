"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  parent: "#a78bfa",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  green: "#50e890",
};

const DATE_RANGES = ["This Week", "Last Week", "2 Weeks Ago"];
const LANGUAGES = ["English UK", "English US"];

interface SkillRow {
  skillName: string;
  subject: string;
  sessionCount: number;
  masteryPct: number;
}

interface ReportData {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  weekLabel: string;
  stats: {
    starsEarned: number;
    sessions: number;
    learningMinutes: number;
    newBadges: number;
    streakDays: number;
  };
  skills: SkillRow[];
}

type TabType = "preview" | "teacher";

const NOT_INCLUDED = [
  "Accuracy percentages or scores",
  "\"Correct / Incorrect\" labels on questions",
  "Individual question results",
  "Comparisons to other children",
  "Class rankings or relative performance",
  "Other students' names or data",
  "Raw teacher-written message text",
  "Individual teacher names",
];

function PillGroup({ items, active, onSelect }: { items: string[]; active: string; onSelect: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((item) => (
        <button key={item} onClick={() => onSelect(item)} style={{ background: active === item ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${active === item ? C.parent : C.border}`, color: active === item ? C.parent : C.muted, padding: "5px 12px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: active === item ? 600 : 400 }}>{item}</button>
      ))}
    </div>
  );
}

// Map week selection to offset (0 = this week, 1 = last week, etc.)
function rangeToOffset(range: string): number {
  if (range === "Last Week") return 1;
  if (range === "2 Weeks Ago") return 2;
  return 0;
}

// Derive top subjects from skills
function getSubjectRows(skills: SkillRow[]): { subject: string; sessionCount: number; label: string }[] {
  const map: Record<string, number> = {};
  for (const s of skills) {
    map[s.subject] = (map[s.subject] ?? 0) + s.sessionCount;
  }
  const entries = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const max = entries[0]?.[1] ?? 1;
  return entries.map(([subject, count]) => {
    const pct = Math.round((count / max) * 100);
    const label = pct >= 75 ? "Strong" : pct >= 50 ? "Growing" : "Exploring";
    return { subject, sessionCount: count, label };
  });
}

export default function PrintReportPage() {
  const [tab, setTab] = useState<TabType>("preview");
  const [selectedRange, setSelectedRange] = useState("This Week");
  const [selectedLang, setSelectedLang] = useState("English UK");
  const [sections, setSections] = useState({ highlights: true, subjects: true, skills: false, teacher: false });

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const studentId = typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
    if (!studentId) {
      setError("No active student selected.");
      return;
    }
    const offset = rangeToOffset(selectedRange);
    setLoading(true);
    setError(null);
    fetch(`/api/parent/report?studentId=${encodeURIComponent(studentId)}&weekOffset=${offset}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.report) {
          setReport(data.report as ReportData);
        } else {
          setError(data?.error ?? "Could not load report.");
        }
      })
      .catch(() => setError("Failed to fetch report."))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? C.parent : C.surface,
    border: `1px solid ${active ? C.parent : C.border}`,
    color: active ? "#fff" : C.muted,
    padding: "8px 18px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "inherit",
    fontWeight: active ? 600 : 400,
  });

  const displayName = report?.displayName ?? "—";
  const bandLabel = report?.launchBandCode ?? "—";
  const weekLabel = report?.weekLabel ?? selectedRange;
  const stats = report?.stats;
  const subjectRows = report ? getSubjectRows(report.skills) : [];
  const topSkills = report?.skills.slice(0, 6) ?? [];

  return (
    <AppFrame audience="parent">
      <div style={{ background: C.base, minHeight: "100vh", padding: 24, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: C.text }}>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          <button style={tabBtnStyle(tab === "preview")} onClick={() => setTab("preview")}>Print Preview</button>
          <button style={tabBtnStyle(tab === "teacher")} onClick={() => setTab("teacher")}>Teacher Message Section</button>
        </div>

        {/* ─── Tab 1: Print Preview ─── */}
        {tab === "preview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
            {/* Left: paper preview */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: loading ? C.amber : error ? "#ef4444" : C.green, display: "inline-block" }} />
                {loading ? "Loading…" : error ? error : "A4 Print Preview — white paper / dark text"}
              </div>

              {/* White paper */}
              <div style={{ background: "#fff", color: "#111", borderRadius: 4, padding: "40px 44px", maxWidth: 595, margin: "0 auto", boxShadow: "0 4px 24px rgba(0,0,0,0.5)", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 13, lineHeight: 1.6 }}>
                {/* Header */}
                <div style={{ borderBottom: "2px solid #111", paddingBottom: 10, marginBottom: 18 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#111", letterSpacing: "-0.01em" }}>WonderQuest Learning Report</div>
                  <div style={{ fontSize: 13, color: "#444", marginTop: 3, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>{displayName} &bull; {bandLabel} &bull; {weekLabel}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>Generated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>

                {/* Learning highlights */}
                {sections.highlights && (
                  <>
                    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#333", marginBottom: 10, marginTop: 18 }}>Learning Highlights This Week</div>
                    {loading ? (
                      <p style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: 13, color: "#888" }}>Loading…</p>
                    ) : stats ? (
                      <ul style={{ listStyle: "none", padding: 0 }}>
                        {[
                          { text: `${displayName} completed`, bold: `${stats.sessions} session${stats.sessions !== 1 ? "s" : ""}`, suffix: " this week" },
                          { text: "Learning time:", bold: `${stats.learningMinutes} minutes` },
                          { text: "Stars earned:", bold: `${stats.starsEarned} stars` },
                          { text: "Day streak:", bold: `${stats.streakDays} day${stats.streakDays !== 1 ? "s" : ""}` },
                        ].map((item, i) => (
                          <li key={i} style={{ padding: "3px 0", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 13, color: "#222" }}>
                            <span style={{ color: "#555", marginRight: 8 }}>✦</span>
                            {item.text} <strong>{item.bold}</strong>{item.suffix ?? ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: 13, color: "#888" }}>No data available for this period.</p>
                    )}
                    <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />
                  </>
                )}

                {/* Subject progress */}
                {sections.subjects && (
                  <>
                    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#333", marginBottom: 10, marginTop: 18 }}>Subject Highlights</div>
                    {loading ? (
                      <p style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: 13, color: "#888" }}>Loading…</p>
                    ) : subjectRows.length > 0 ? (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 12.5 }}>
                        <tbody>
                          {subjectRows.map((row) => {
                            const max = subjectRows[0]?.sessionCount ?? 1;
                            const pct = Math.round((row.sessionCount / max) * 100);
                            return (
                              <tr key={row.subject} style={{ verticalAlign: "middle" }}>
                                <td style={{ width: 120, color: "#222", padding: "4px 0" }}>{row.subject}</td>
                                <td style={{ paddingRight: 12, padding: "4px 12px 4px 0" }}>
                                  <div style={{ width: "100%", height: 10, background: "#e5e5e5", borderRadius: 5, overflow: "hidden" }}>
                                    <div style={{ height: "100%", borderRadius: 5, background: "#333", width: `${pct}%` }} />
                                  </div>
                                </td>
                                <td style={{ width: 80, color: "#555", fontSize: 11.5, padding: "4px 0" }}>{row.label}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: 13, color: "#888" }}>No subject data for this period.</p>
                    )}
                    <div style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: 11, color: "#777", marginTop: 6 }}>Progress bars show learning time engagement — no percentages shown.</div>
                    <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />
                  </>
                )}

                {/* Skill Details */}
                {sections.skills && (
                  <>
                    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#333", marginBottom: 10, marginTop: 18 }}>Skills Explored</div>
                    {topSkills.length > 0 ? (
                      <ul style={{ listStyle: "none", padding: 0 }}>
                        {topSkills.map((sk, i) => (
                          <li key={i} style={{ padding: "2px 0", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 12.5, color: "#333" }}>
                            <span style={{ color: "#888", marginRight: 6 }}>·</span>{sk.skillName} <span style={{ color: "#999", fontSize: 11 }}>({sk.subject})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: 13, color: "#888" }}>No skills data for this period.</p>
                    )}
                    <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />
                  </>
                )}

                {/* Note from team */}
                <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#333", marginBottom: 10, marginTop: 18 }}>A Note from the WonderQuest Team</div>
                <p style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 12, color: "#333", lineHeight: 1.65 }}>
                  Progress bars show where {displayName} is spending their learning time — not test scores. All children learn at their own pace and adventure style. Keep celebrating curiosity!
                </p>
                <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />

                {/* Benchmark */}
                <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#333", marginBottom: 10, marginTop: 18 }}>Benchmark Note</div>
                <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11.5, color: "#444", lineHeight: 1.6, background: "#f5f5f5", borderLeft: "3px solid #aaa", padding: "10px 12px", borderRadius: "0 4px 4px 0", marginTop: 4 }}>
                  This report reflects engagement and exploration data. It does not represent standardised test scores or predict academic outcomes. WonderQuest is a learning support tool, not an assessment instrument.
                </div>

                {/* Footer */}
                <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #ddd", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, color: "#999", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#555", fontSize: 12 }}>WonderQuest</span>
                  <span>wonderquest.app</span>
                  <span style={{ fontStyle: "italic", color: "#bbb", fontSize: 10 }}>For personal use — not for redistribution</span>
                </div>
              </div>
            </div>

            {/* Right: settings panel */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.parent, marginBottom: 0 }}>Report Settings</div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Week</label>
                <PillGroup items={DATE_RANGES} active={selectedRange} onSelect={setSelectedRange} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Sections to Include</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {([
                    { key: "highlights", label: "Learning Highlights" },
                    { key: "subjects", label: "Subject Progress" },
                    { key: "skills", label: "Skill Details" },
                    { key: "teacher", label: "Teacher Messages" },
                  ] as { key: keyof typeof sections; label: string }[]).map(({ key, label }) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.text, cursor: "pointer" }}>
                      <div onClick={() => setSections((prev) => ({ ...prev, [key]: !prev[key] }))} style={{ width: 16, height: 16, border: `1.5px solid ${sections[key] ? C.parent : "rgba(255,255,255,0.2)"}`, borderRadius: 4, background: sections[key] ? C.parent : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sections[key] && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                      </div>
                      {label}
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Benchmark disclaimer is always included and cannot be removed.</div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Language</label>
                <PillGroup items={LANGUAGES} active={selectedLang} onSelect={setSelectedLang} />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={{ flex: 1, padding: "10px 14px", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "#f0a500", color: "#1a0e00", minWidth: 110 }}>Generate PDF</button>
                <button onClick={() => window.print()} style={{ flex: 1, padding: "10px 14px", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", background: C.parent, color: "#fff", minWidth: 110 }}>Print</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab 2: Teacher Message Section ─── */}
        {tab === "teacher" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Left */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.parent, marginBottom: 16 }}>Report Section Preview — "A Note from School"</div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 22, marginBottom: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  A Note from School
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 12, background: "rgba(80,232,144,0.15)", color: C.green }}>Included when selected</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>Platform-Summarised Message</div>
                  <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.65 }}>Your child's teacher has shared that {displayName} is engaging well with maths activities this term.</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>
                  This message is <strong style={{ color: C.text }}>platform-generated and summarised</strong>. Raw teacher text is never included in exported reports. The school name may appear; individual teacher names are not shown.
                </div>
                <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 7, padding: "12px 14px", fontSize: 12, color: C.parent, display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.55 }}>
                  <span style={{ flexShrink: 0, fontSize: 14, marginTop: 1 }}>🔒</span>
                  <span>Teacher messages are platform-routed and never include other students' names. Only platform-summarised content reaches the parent report.</span>
                </div>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 22 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>What is NOT included in reports</div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                  {NOT_INCLUDED.map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.muted }}>
                      <span style={{ color: "#ff7b6b", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.parent, marginBottom: 16 }}>Teacher Message Routing Flow</div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 22, marginBottom: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>How it works</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                  {[
                    { num: "1", text: "Teacher writes message in WonderQuest teacher portal", sub: "Raw text stored securely, never exposed to report export directly" },
                    { num: "2", text: "Platform summarisation service processes the message", sub: "Output: brief, parent-friendly summary — no raw teacher text" },
                    { num: "3", text: "Parent selects 'Teacher Messages' section and generates report", sub: "Summarised text only — school name included, teacher name not shown" },
                  ].map((step) => (
                    <div key={step.num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: "50%", fontSize: 11, fontWeight: 700, color: C.parent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{step.num}</div>
                      <div>
                        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{step.text}</div>
                        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{step.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </AppFrame>
  );
}
