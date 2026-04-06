"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  violet: "#9b72ff",
  coral: "#ff7b6b",
  text: "#f0f6ff",
  muted: "#8b949e",
  growing: "#f0c040",
} as const;

type Mastery = 0 | 1 | 2 | 3;

interface Skill {
  name: string;
  subject: string;
  band: string;
  color: string;
}

const SKILLS: Skill[] = [
  { name: "Counting to 20", subject: "Maths", band: "P0", color: C.gold },
  { name: "Shapes", subject: "Maths", band: "P0", color: C.gold },
  { name: "Phonics B", subject: "Literacy", band: "P1", color: C.violet },
  { name: "Short Vowels", subject: "Literacy", band: "P1", color: C.violet },
  { name: "Animals", subject: "Science", band: "P2", color: "#58e8c1" },
  { name: "Plants", subject: "Science", band: "P2", color: "#58e8c1" },
  { name: "Community Helpers", subject: "Social Studies", band: "P3", color: C.coral },
  { name: "My Neighbourhood", subject: "Social Studies", band: "P3", color: C.coral },
];

const STUDENTS = ["Aiden", "Bella", "Carlos", "Diya", "Ethan", "Fiona", "George", "Hana", "Ivan", "Jasmine"];

// 10 columns × 8 rows: 3=strong 2=growing 1=exploring 0=not-started
const GRID: Mastery[][] = [
  [3, 3, 2, 3, 2, 3, 2, 1, 3, 2],
  [3, 3, 3, 2, 3, 3, 2, 3, 2, 1],
  [3, 2, 3, 2, 2, 3, 1, 2, 3, 2],
  [2, 3, 2, 2, 1, 2, 3, 2, 2, 3],
  [2, 2, 1, 3, 2, 2, 1, 2, 3, 2],
  [1, 2, 2, 2, 1, 3, 2, 1, 2, 2],
  [0, 1, 0, 0, 2, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 2, 1, 0, 0, 0, 0],
];

const ENGAGEMENT = [
  { label: "Student 1", depth: 95, level: 3 },
  { label: "Student 2", depth: 88, level: 3 },
  { label: "Student 3", depth: 82, level: 3 },
  { label: "Student 4", depth: 75, level: 3 },
  { label: "Student 5", depth: 70, level: 3 },
  { label: "Student 6", depth: 60, level: 2 },
  { label: "Student 7", depth: 52, level: 2 },
  { label: "Student 8", depth: 38, level: 1 },
  { label: "Student 9", depth: 24, level: 1 },
  { label: "Student 10", depth: 2, level: 0 },
];

function dotStyle(level: Mastery): React.CSSProperties {
  const base: React.CSSProperties = { display: "inline-block", width: 18, height: 18, borderRadius: "50%", verticalAlign: "middle" };
  if (level === 3) return { ...base, background: C.mint, boxShadow: "0 0 6px rgba(34,197,94,0.45)" };
  if (level === 2) return { ...base, background: C.growing, boxShadow: "0 0 5px rgba(240,192,64,0.35)" };
  if (level === 1) return { ...base, background: "rgba(240,246,255,0.25)", border: "1.5px solid rgba(240,246,255,0.2)" };
  return { ...base, background: "transparent", border: "1.5px dashed rgba(255,255,255,0.12)" };
}

function barColor(level: Mastery) {
  if (level === 3) return "linear-gradient(90deg,#22c55e,#4ade80)";
  if (level === 2) return "linear-gradient(90deg,#f0c040,#fde047)";
  if (level === 1) return "rgba(240,246,255,0.25)";
  return "rgba(255,255,255,0.08)";
}

function tagStyle(level: Mastery): React.CSSProperties {
  if (level === 3) return { background: "rgba(34,197,94,0.15)", color: C.mint };
  if (level === 2) return { background: "rgba(240,192,64,0.12)", color: C.growing };
  if (level === 1) return { background: "rgba(240,246,255,0.08)", color: "rgba(240,246,255,0.45)" };
  return { background: "transparent", color: "rgba(240,246,255,0.2)", border: "1px dashed rgba(255,255,255,0.1)" };
}

const TAG_LABELS = ["Not started", "Exploring", "Growing", "Strong"];

export default function SkillMasteryPage() {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [activeSubject, setActiveSubject] = useState("All");
  const subjects = ["All", "Maths", "Literacy", "Science", "Social Studies"];

  const filteredSkills = activeSubject === "All" ? SKILLS : SKILLS.filter((s) => s.subject === activeSubject);
  const filteredIndices = SKILLS.map((s, i) => ({ s, i })).filter(({ s }) => activeSubject === "All" || s.subject === activeSubject).map(({ i }) => i);

  return (
    <AppFrame audience="teacher">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 0 48px" }}>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {([1, 2, 3] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "9px 22px", borderRadius: 22,
                border: `1.5px solid ${activeTab === t ? C.blue : "rgba(255,255,255,0.12)"}`,
                cursor: "pointer", fontSize: 13, fontWeight: 700,
                background: activeTab === t ? C.blue : "transparent",
                color: activeTab === t ? C.base : "rgba(240,246,255,0.55)",
                transition: "all 0.18s",
              }}
            >
              {t === 1 ? "Skill Mastery Board" : t === 2 ? "Skill Detail" : "Spec"}
            </button>
          ))}
        </div>

        {/* TAB 1: Skill Mastery Board */}
        {activeTab === 1 && (
          <div>
            {/* Board header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 6 }}>Skill Mastery Board — Class 4B</h1>
                <p style={{ fontSize: 13, color: "rgba(240,246,255,0.45)" }}>Updated daily from analytics snapshot · Last updated: 23 Mar 2026</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {["Export CSV", "Export PDF"].map((label) => (
                  <button key={label} style={{
                    padding: "8px 18px", borderRadius: 10,
                    border: "1.5px solid rgba(255,255,255,0.1)", background: "transparent",
                    color: "rgba(240,246,255,0.6)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 22 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(240,246,255,0.35)", marginRight: 4 }}>Subject</span>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  style={{
                    padding: "6px 16px", borderRadius: 16,
                    border: `1.5px solid ${activeSubject === s ? C.blue : "rgba(255,255,255,0.1)"}`,
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: activeSubject === s ? C.blue : "transparent",
                    color: activeSubject === s ? C.base : "rgba(240,246,255,0.55)",
                    transition: "all 0.15s",
                  }}
                >{s}</button>
              ))}
              <select style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.1)", background: C.surface, color: C.text, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <option>Term 1, 2026</option>
                <option>Term 4, 2025</option>
                <option>Term 3, 2025</option>
              </select>
            </div>

            {/* Board layout */}
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

              {/* Heatmap */}
              <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", overflowX: "auto" }}>
                  <table style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 680, width: "100%" }}>
                    <thead>
                      <tr>
                        <th style={{ width: 160, minWidth: 160 }}></th>
                        {STUDENTS.map((name) => (
                          <th key={name} style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,246,255,0.45)", textAlign: "center", padding: "0 4px 12px", whiteSpace: "nowrap", verticalAlign: "bottom" }}>{name}</th>
                        ))}
                        <th style={{ fontSize: 11, fontWeight: 700, color: C.blue, textAlign: "center", padding: "0 4px 12px", whiteSpace: "nowrap", verticalAlign: "bottom", cursor: "pointer" }}>+8 more</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIndices.map((ri) => {
                        const skill = SKILLS[ri];
                        const row = GRID[ri];
                        return (
                          <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td
                              onClick={() => setActiveTab(2)}
                              style={{ fontSize: 12, fontWeight: 700, color: C.text, padding: "10px 16px 10px 0", whiteSpace: "nowrap", verticalAlign: "middle", cursor: "pointer" }}
                            >
                              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: skill.color, marginRight: 7, verticalAlign: "middle" }} />
                              {skill.name}
                              <span style={{ fontSize: 10, color: "rgba(240,246,255,0.25)", marginLeft: 6, fontWeight: 600 }}>{skill.subject}</span>
                            </td>
                            {row.map((level, ci) => (
                              <td key={ci} style={{ textAlign: "center", padding: "6px 4px", verticalAlign: "middle" }}>
                                <span style={dotStyle(level as Mastery)} title={TAG_LABELS[level]} />
                              </td>
                            ))}
                            <td style={{ textAlign: "center", padding: "6px 4px" }}></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Legend */}
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    {[
                      { label: "Strong (6+ sessions)", style: { background: C.mint } },
                      { label: "Growing (3–5 sessions)", style: { background: C.growing } },
                      { label: "Exploring (1–2 sessions)", style: { background: "rgba(240,246,255,0.25)", border: "1.5px solid rgba(240,246,255,0.2)" } },
                      { label: "Not started", style: { background: "transparent", border: "1.5px dashed rgba(255,255,255,0.3)" } },
                    ].map((l) => (
                      <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(240,246,255,0.5)" }}>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, display: "inline-block", ...l.style }} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy note */}
                <div style={{ marginTop: 14, fontSize: 11, color: "rgba(240,246,255,0.35)", fontStyle: "italic", padding: "10px 14px", background: "rgba(56,189,248,0.05)", borderLeft: "3px solid rgba(56,189,248,0.3)", borderRadius: 4 }}>
                  Student names are first name only. This data is for classroom planning, not grading.
                </div>
              </div>

              {/* Summary sidebar */}
              <div style={{ width: 280, flexShrink: 0 }}>
                {/* Highlights card */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,246,255,0.35)", marginBottom: 14 }}>Class Highlights</div>
                  {[
                    { skill: "Shapes", body: "8/10 students at Growing or Strong ✨", positive: true },
                    { skill: "Phonics B", body: "7/10 students at Growing or Strong — strong momentum", positive: true },
                    { skill: "Community Helpers", body: "2/10 students started — consider introducing this skill to the class", positive: false },
                    { skill: "My Neighbourhood", body: "3/10 students started — may need a classroom introduction activity", positive: false },
                  ].map((item) => (
                    <div key={item.skill} style={{
                      padding: "12px 14px", borderRadius: 10, marginBottom: 10, fontSize: 12, lineHeight: 1.5,
                      background: item.positive ? "rgba(80,232,144,0.08)" : "rgba(240,192,64,0.08)",
                      border: `1px solid ${item.positive ? "rgba(80,232,144,0.18)" : "rgba(240,192,64,0.2)"}`,
                      color: item.positive ? "#50e890" : C.growing,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{item.skill}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(240,246,255,0.65)" }}>{item.body}</div>
                    </div>
                  ))}
                </div>

                {/* Overview card */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,246,255,0.35)", marginBottom: 14 }}>Class Overview</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      { count: 38, label: "Strong", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", color: C.mint },
                      { count: 29, label: "Growing", bg: "rgba(240,192,64,0.08)", border: "rgba(240,192,64,0.2)", color: C.growing },
                      { count: 13, label: "Exploring", bg: "rgba(240,246,255,0.04)", border: "rgba(255,255,255,0.08)", color: "rgba(240,246,255,0.5)" },
                    ].map((item) => (
                      <div key={item.label} style={{ flex: 1, minWidth: 100, background: item.bg, border: `1px solid ${item.border}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: item.color }}>{item.count}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(240,246,255,0.35)", marginTop: 4 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 11, color: "rgba(240,246,255,0.35)" }}>Across 8 skills · 10 students shown</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Skill Detail */}
        {activeTab === 2 && (
          <div>
            {/* Skill header card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,209,102,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🧮</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: C.text }}>Counting to 20</span>
                    <span style={{ padding: "4px 12px", borderRadius: 16, fontSize: 11, fontWeight: 800, background: "rgba(80,232,144,0.15)", color: "#50e890", border: "1px solid rgba(80,232,144,0.3)" }}>Published ✓</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ padding: "4px 12px", borderRadius: 14, fontSize: 11, fontWeight: 700, background: "rgba(255,209,102,0.12)", color: C.gold, border: "1px solid rgba(255,209,102,0.25)" }}>P0 Priority</span>
                    <span style={{ padding: "4px 12px", borderRadius: 14, fontSize: 11, fontWeight: 700, background: "rgba(56,189,248,0.1)", color: C.blue, border: "1px solid rgba(56,189,248,0.2)" }}>Maths</span>
                    <span style={{ padding: "4px 12px", borderRadius: 14, fontSize: 11, fontWeight: 700, background: "rgba(155,114,255,0.1)", color: C.violet, border: "1px solid rgba(155,114,255,0.2)" }}>Early Numeracy</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 4 }}>
                {[
                  { val: 9, label: "Started", color: C.blue },
                  { val: 7, label: "Growing", color: C.growing },
                  { val: 5, label: "Strong", color: C.mint },
                  { val: 1, label: "Not Started", color: "rgba(240,246,255,0.35)" },
                ].map((s) => (
                  <div key={s.label} style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.val}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(240,246,255,0.35)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "flex-start" }}>

              {/* Left column */}
              <div>
                {/* Engagement chart */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,246,255,0.35)", marginBottom: 6 }}>Class Engagement Depth</div>
                  <div style={{ fontSize: 11, color: "rgba(240,246,255,0.3)", marginBottom: 18 }}>Relative session depth per student — for planning, not assessment</div>
                  {ENGAGEMENT.map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,246,255,0.5)", width: 56, textAlign: "right", flexShrink: 0 }}>{s.label}</span>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 20, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 6, background: barColor(s.level as Mastery), width: `${Math.max(s.depth, 2)}%`, transition: "width 0.5s ease" }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, flexShrink: 0, whiteSpace: "nowrap", ...tagStyle(s.level as Mastery) }}>{TAG_LABELS[s.level]}</span>
                    </div>
                  ))}
                </div>

                {/* Recommended actions */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,246,255,0.35)", marginBottom: 16 }}>Recommended Actions</div>
                  {[
                    { icon: "🚀", text: "<strong>5 students</strong> are ready for the next skill in sequence — see Suggested Next Skills below" },
                    { icon: "📋", text: "<strong>2 students</strong> are still exploring — a short in-class activity or paired practice could help consolidate understanding" },
                    { icon: "👋", text: "<strong>1 student</strong> hasn't started — consider a gentle nudge or a classroom introduction to build familiarity" },
                  ].map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, marginBottom: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
                      <div style={{ fontSize: 13, color: "rgba(240,246,255,0.8)", lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: a.text.replace(/<strong>/g, `<strong style="color:${C.blue}">`).replace(/<\/strong>/g, "</strong>") }} />
                    </div>
                  ))}
                </div>

                {/* Suggested next skills */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,246,255,0.35)", marginBottom: 16 }}>Suggested Next Skills</div>
                  {[
                    { icon: "🧮", name: "Counting to 50", tag: "Maths" },
                    { icon: "➕", name: "Adding to 10", tag: "Maths" },
                  ].map((ns) => (
                    <div key={ns.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, cursor: "pointer", marginBottom: 10 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{ns.icon}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text }}>{ns.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: "rgba(56,189,248,0.1)", color: C.blue, border: "1px solid rgba(56,189,248,0.2)" }}>{ns.tag}</span>
                      <span style={{ fontSize: 14, color: "rgba(240,246,255,0.25)" }}>›</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,246,255,0.35)", marginBottom: 12 }}>Skill Info</div>
                  {[
                    { label: "Skill ID", value: "SKL-0041", mono: true },
                    { label: "Band", value: "P0 Foundation", special: C.gold },
                    { label: "Subject", value: "Maths" },
                    { label: "Avg sessions", value: "5.2 per student" },
                    { label: "Snapshot date", value: "23 Mar 2026" },
                    { label: "Board refresh", value: "Daily (not real-time)" },
                  ].map((r, i, arr) => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none", fontSize: 12 }}>
                      <span style={{ color: "rgba(240,246,255,0.45)" }}>{r.label}</span>
                      <span style={{ color: r.special ?? C.text, fontWeight: 700, fontFamily: r.mono ? "monospace" : "inherit", fontSize: r.mono ? 11 : 12 }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,246,255,0.35)", marginBottom: 12 }}>Mastery Scale</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { color: C.mint, label: "Strong", desc: "6+ sessions with progression signals" },
                      { color: C.growing, label: "Growing", desc: "3–5 sessions" },
                      { color: "rgba(240,246,255,0.25)", border: "1.5px solid rgba(240,246,255,0.2)", label: "Exploring", desc: "1–2 sessions" },
                      { color: "transparent", border: "1.5px dashed rgba(255,255,255,0.3)", label: "Not started", desc: "0 sessions recorded" },
                    ].map((m) => (
                      <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", flexShrink: 0, display: "inline-block", background: m.color, border: m.border }} />
                        <span style={{ fontWeight: 700, color: C.text, minWidth: 80 }}>{m.label}</span>
                        <span style={{ color: "rgba(240,246,255,0.4)", fontSize: 11 }}>{m.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,246,255,0.35)", marginBottom: 12 }}>Privacy Reminder</div>
                  <div style={{ fontSize: 12, color: "rgba(240,246,255,0.55)", lineHeight: 1.6 }}>
                    This chart shows session depth only — not accuracy or correct/incorrect responses. First names are shown for your own class only. No per-student accuracy is displayed.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Spec */}
        {activeTab === 3 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 6 }}>Item 247 — Spec Reference</h2>
              <p style={{ fontSize: 13, color: "rgba(240,246,255,0.4)" }}>teacher-skill-mastery-board-v2 · WonderQuest Learning Platform</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {[
                {
                  icon: "📊", title: "Mastery Levels", rows: [
                    { k: "Strong", v: "6+ sessions with progression signals detected" },
                    { k: "Growing", v: "3–5 sessions recorded" },
                    { k: "Exploring", v: "1–2 sessions recorded" },
                    { k: "Not started", v: "0 sessions — no engagement recorded" },
                  ]
                },
                {
                  icon: "🔒", title: "Privacy", rows: [
                    { k: "Names shown", v: "First names only for teacher's own class; no surnames" },
                    { k: "Accuracy data", v: "No per-question accuracy; no individual accuracy shown to other teachers" },
                    { k: "Chart data", v: "Engagement depth only — not correctness or score" },
                  ]
                },
                {
                  icon: "🏫", title: "Teacher Access Scope", rows: [
                    { k: "Teacher", v: "Own class only — full read access" },
                    { k: "School admin", v: "Read-only across school; no cross-school data" },
                    { k: "Cross-school", v: "Not permitted at any role level" },
                  ]
                },
                {
                  icon: "🔄", title: "Refresh & Export", rows: [
                    { k: "Board refresh", v: "Updated daily (analytics snapshot); not real-time" },
                    { k: "CSV export", v: "student_first_name, skill_name, mastery_level — no accuracy data" },
                    { k: "PDF export", v: "Includes benchmark disclaimer on every page" },
                  ]
                },
              ].map((card) => (
                <div key={card.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.blue, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{card.icon}</span>{card.title}
                  </div>
                  {card.rows.map((r, i, arr) => (
                    <div key={r.k} style={{ padding: "9px 0", borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none", fontSize: 12, display: "flex", gap: 12 }}>
                      <span style={{ fontWeight: 800, color: "rgba(240,246,255,0.55)", minWidth: 130, flexShrink: 0 }}>{r.k}</span>
                      <span style={{ color: "rgba(240,246,255,0.75)", lineHeight: 1.5 }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* DB schema – full width */}
              <div style={{ gridColumn: "1 / -1", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.blue, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🗄️</span>Database Schema
                </div>
                <div style={{ background: "rgba(88,232,193,0.05)", border: "1px solid rgba(88,232,193,0.2)", borderRadius: 10, padding: "14px 16px" }}>
                  {[
                    "skill_mastery_snapshots (",
                    "  class_id        UUID,",
                    "  student_id      UUID,",
                    "  skill_id        UUID,",
                    "  mastery_level   ENUM('not_started','exploring','growing','strong'),",
                    "  sessions_count  INT,",
                    "  snapshot_date   DATE",
                    ")",
                  ].map((line, i) => (
                    <code key={i} style={{ fontFamily: "monospace", fontSize: 12, color: "#58e8c1", lineHeight: 1.8, display: "block" }}>{line}</code>
                  ))}
                </div>
              </div>

              {/* FERPA – full width */}
              <div style={{ gridColumn: "1 / -1", background: "rgba(255,123,107,0.06)", border: "1px solid rgba(255,123,107,0.25)", borderRadius: 10, padding: "14px 16px", fontSize: 12, color: "rgba(240,246,255,0.65)", lineHeight: 1.6 }}>
                <strong style={{ color: "#ff7b6b" }}>FERPA Notice:</strong> Skill mastery data constitutes an education record under FERPA (20 U.S.C. § 1232g). Access is restricted to the teacher of record for the class. School administrators may view aggregate school-level data in read-only mode. Parents have the right to request their child's own data. No individual student data may be shared across schools or with unauthorised third parties.
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
