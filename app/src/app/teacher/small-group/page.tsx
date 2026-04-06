"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base: "#0d1117",
  surface: "#161b22",
  surface2: "#1c2230",
  border: "rgba(255,255,255,0.06)",
  blue: "#38bdf8",
  teal: "#2dd4bf",
  violet: "#a78bfa",
  gold: "#fbbf24",
  green: "#50e890",
  danger: "#f87171",
  text: "#f0f6ff",
  muted: "#8b949e",
};

// ── Stub data ────────────────────────────────────────────────────────────────
type GroupColor = "teal" | "violet" | "gold";

const COLOR_MAP: Record<GroupColor, { hex: string; chipBg: string; chipBorder: string; chipText: string }> = {
  teal:   { hex: C.teal,   chipBg: "rgba(45,212,191,.15)",  chipBorder: "rgba(45,212,191,.3)",   chipText: C.teal   },
  violet: { hex: C.violet, chipBg: "rgba(167,139,250,.15)", chipBorder: "rgba(167,139,250,.3)",  chipText: C.violet },
  gold:   { hex: C.gold,   chipBg: "rgba(251,191,36,.15)",  chipBorder: "rgba(251,191,36,.3)",   chipText: C.gold   },
};

const GROUPS = [
  {
    id: "A",
    name: "A — Quest Explorers",
    color: "teal" as GroupColor,
    students: ["Amara", "Ben", "Cleo", "Daniel", "Eva", "Felix"],
    assignment: "P1 Reading Batch",
    engagementLabel: "5/6 started",
    engagementColor: C.green,
    engagementBg: "rgba(80,232,144,.15)",
    engagementBorder: "rgba(80,232,144,.3)",
  },
  {
    id: "B",
    name: "B — Star Builders",
    color: "violet" as GroupColor,
    students: ["Grace", "Henry", "Isla", "Juno", "Kai"],
    assignment: "P0 Maths Batch",
    engagementLabel: "4/5 started",
    engagementColor: C.gold,
    engagementBg: "rgba(251,191,36,.15)",
    engagementBorder: "rgba(251,191,36,.3)",
  },
  {
    id: "C",
    name: "C — Adventure Squad",
    color: "gold" as GroupColor,
    students: ["Lena", "Marco", "Nina", "Omar"],
    assignment: "Free Explore",
    engagementLabel: "4/4 started",
    engagementColor: C.blue,
    engagementBg: "rgba(56,189,248,.15)",
    engagementBorder: "rgba(56,189,248,.3)",
  },
];

const ENGAGEMENT_DATA = {
  A: {
    stats: [
      { val: "5/6",                      lbl: "Students Started",    color: C.teal  },
      { val: "12",                        lbl: "Sessions This Week",  color: C.green },
      { val: "18 min",                    lbl: "Avg Session Length",  color: C.blue  },
    ],
    students: [
      { initial: "A", name: "Amara",  band: "Explorer",   active: true  },
      { initial: "B", name: "Ben",    band: "Explorer",   active: true  },
      { initial: "C", name: "Cleo",   band: "Adventurer", active: true  },
      { initial: "D", name: "Daniel", band: "Explorer",   active: true  },
      { initial: "E", name: "Eva",    band: "Explorer",   active: true  },
      { initial: "F", name: "Felix",  band: "Adventurer", active: false },
    ],
    color: C.teal,
  },
  B: {
    stats: [
      { val: "4/5",   lbl: "Students Started",   color: C.violet },
      { val: "9",     lbl: "Sessions This Week",  color: C.green  },
      { val: "14 min",lbl: "Avg Session Length",  color: C.blue   },
    ],
    students: [
      { initial: "G", name: "Grace", band: "Navigator", active: true  },
      { initial: "H", name: "Henry", band: "Navigator", active: true  },
      { initial: "I", name: "Isla",  band: "Explorer",  active: true  },
      { initial: "J", name: "Juno",  band: "Navigator", active: true  },
      { initial: "K", name: "Kai",   band: "Explorer",  active: false },
    ],
    color: C.violet,
  },
  C: {
    stats: [
      { val: "4/4",   lbl: "Students Started",   color: C.gold  },
      { val: "7",     lbl: "Sessions This Week",  color: C.green },
      { val: "21 min",lbl: "Avg Session Length",  color: C.blue  },
    ],
    students: [
      { initial: "L", name: "Lena",  band: "Voyager", active: true },
      { initial: "M", name: "Marco", band: "Voyager", active: true },
      { initial: "N", name: "Nina",  band: "Voyager", active: true },
      { initial: "O", name: "Omar",  band: "Voyager", active: true },
    ],
    color: C.gold,
  },
};

const ALL_STUDENTS = ["Amara", "Ben", "Cleo", "Daniel", "Eva", "Felix", "Grace", "Henry", "Isla", "Juno"];

const QUEST_OPTIONS = [
  { id: "q1", label: "P0 Maths Batch",    sub: "Pre-K · Numbers & Counting" },
  { id: "q2", label: "P1 Reading Batch",  sub: "K–1 · Blending & Sight Words" },
  { id: "q3", label: "P1 Maths Batch",    sub: "K–1 · Addition & Subtraction" },
  { id: "q4", label: "P2 Reading Batch",  sub: "G2–3 · Comprehension & Fluency" },
  { id: "q5", label: "Free Explore",      sub: "Student-directed · Any band" },
];

// ── Sub-components ───────────────────────────────────────────────────────────
function Btn({
  children, variant = "primary", small, onClick, style,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  small?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: small ? "7px 13px" : "10px 18px",
    borderRadius: 8,
    border: "none",
    fontFamily: "system-ui,sans-serif",
    fontSize: small ? 12.5 : 13.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .18s ease",
    minHeight: small ? 36 : 44,
    textDecoration: "none",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: C.green, color: "#0d1117" },
    secondary: { background: "transparent", color: C.blue, border: `1.5px solid rgba(56,189,248,.35)` },
    ghost:     { background: "transparent", color: C.muted, border: `1.5px solid ${C.border}` },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick}>
      {children}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SmallGroupPage() {
  const [activeTab, setActiveTab] = useState<"groups" | "engagement">("groups");
  const [activeGroup, setActiveGroup] = useState<"A" | "B" | "C">("A");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assignModalGroup, setAssignModalGroup] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const toggleStudent = (name: string) => {
    setSelectedStudents((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: "9px 20px",
    borderRadius: 8,
    border: `1.5px solid ${activeTab === tab ? C.blue : C.border}`,
    background: activeTab === tab ? "rgba(56,189,248,.12)" : "transparent",
    color: activeTab === tab ? C.blue : C.muted,
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: "system-ui,sans-serif",
    cursor: "pointer",
    minHeight: 44,
  });

  const groupTabStyle = (id: string): React.CSSProperties => {
    const col = ENGAGEMENT_DATA[id as "A" | "B" | "C"].color;
    const isActive = activeGroup === id;
    return {
      padding: "9px 20px",
      borderRadius: 8,
      border: `1.5px solid ${isActive ? col : C.border}`,
      background: isActive ? col + "1a" : "transparent",
      color: isActive ? col : C.muted,
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "system-ui,sans-serif",
      cursor: "pointer",
      minHeight: 44,
      transition: "all .18s",
    };
  };

  const eng = ENGAGEMENT_DATA[activeGroup];

  return (
    <AppFrame audience="teacher" currentPath="/teacher/small-group">
      <div style={{
        fontFamily: "system-ui,-apple-system,sans-serif",
        color: C.text,
        minHeight: "100vh",
        padding: "24px 28px",
        background: C.base,
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42,
              background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>🗂</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Small Group Planner</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 1 }}>WonderQuest · Teacher View</div>
            </div>
          </div>
          <span style={{
            background: "rgba(56,189,248,.15)",
            color: C.blue,
            border: `1px solid rgba(56,189,248,.3)`,
            borderRadius: 20,
            padding: "5px 13px",
            fontSize: 12,
            fontWeight: 600,
          }}>Teacher View</span>
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          <button style={tabStyle("groups")}    onClick={() => setActiveTab("groups")}>Groups</button>
          <button style={tabStyle("engagement")} onClick={() => setActiveTab("engagement")}>Group Engagement</button>
        </div>

        {/* ── TAB: Groups ─────────────────────────────────────────────────── */}
        {activeTab === "groups" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>My Groups</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>3 groups · 15 students total</div>
              </div>
              <Btn variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                + Create Group
              </Btn>
            </div>

            {/* Create form */}
            {showCreateForm && (
              <div style={{
                background: C.surface,
                border: `1.5px solid rgba(80,232,144,.25)`,
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.green, marginBottom: 16 }}>New Group</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>Group Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Wonder Wizards"
                      style={{
                        background: C.base,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                        color: C.text,
                        fontFamily: "system-ui,sans-serif",
                        fontSize: 14,
                        minHeight: 44,
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>Group Color</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      {[C.teal, C.violet, C.gold, C.blue, C.danger, C.green].map((col) => (
                        <div key={col} style={{
                          width: 34, height: 34, borderRadius: 8, background: col,
                          border: "2.5px solid transparent", cursor: "pointer",
                        }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>Add Students</label>
                    <div style={{
                      background: C.base,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 8,
                      padding: 8,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      minHeight: 60,
                    }}>
                      {ALL_STUDENTS.map((name) => (
                        <button key={name} onClick={() => toggleStudent(name)} style={{
                          padding: "5px 11px",
                          borderRadius: 20,
                          border: `1.5px solid ${selectedStudents.includes(name) ? C.green : C.border}`,
                          background: selectedStudents.includes(name) ? "rgba(80,232,144,.15)" : C.surface2,
                          color: selectedStudents.includes(name) ? C.green : C.muted,
                          fontSize: 12.5,
                          fontWeight: 500,
                          cursor: "pointer",
                          minHeight: 32,
                          fontFamily: "system-ui,sans-serif",
                        }}>{name}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <Btn variant="primary" onClick={() => { showToast("Group saved!"); setShowCreateForm(false); }}>Save Group</Btn>
                  <Btn variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Btn>
                </div>
              </div>
            )}

            {/* Group cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {GROUPS.map((g) => {
                const col = COLOR_MAP[g.color];
                return (
                  <div key={g.id} style={{
                    background: C.surface,
                    border: `1.5px solid ${col.hex}38`,
                    borderRadius: 12,
                    padding: 20,
                    transition: "border-color .2s, transform .2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: col.hex, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ fontSize: 15.5, fontWeight: 700, color: C.text }}>{g.name}</div>
                      </div>
                      <span style={{
                        fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                        background: C.surface2, color: C.muted, whiteSpace: "nowrap",
                      }}>{g.students.length} students</span>
                    </div>

                    {/* Student chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {g.students.map((s) => (
                        <span key={s} style={{
                          padding: "4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: col.chipBg, color: col.chipText, border: `1px solid ${col.chipBorder}`,
                        }}>{s}</span>
                      ))}
                    </div>

                    {/* Assignment row */}
                    <div style={{
                      background: C.surface2, borderRadius: 8, padding: "10px 13px", marginBottom: 12,
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Current Assignment</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginTop: 2 }}>{g.assignment}</div>
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: "4px 11px", borderRadius: 20, whiteSpace: "nowrap",
                        background: g.engagementBg, color: g.engagementColor, border: `1px solid ${g.engagementBorder}`,
                      }}>{g.engagementLabel}</span>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: "flex", gap: 8, flexWrap: "wrap",
                      paddingTop: 14, borderTop: `1px solid ${C.border}`,
                      alignItems: "center",
                    }}>
                      <Btn variant="secondary" small onClick={() => setAssignModalGroup(g.id)}>Assign Quest</Btn>
                      <Btn variant="ghost" small onClick={() => showToast(`Edit mode — Group ${g.id}`)}>Edit Group</Btn>
                      <button
                        onClick={() => { setActiveTab("engagement"); setActiveGroup(g.id as "A" | "B" | "C"); }}
                        style={{
                          marginLeft: "auto",
                          fontSize: 13, color: C.blue, fontWeight: 600, textDecoration: "none",
                          background: "none", border: "none", cursor: "pointer",
                          fontFamily: "system-ui,sans-serif",
                          minHeight: 44, display: "inline-flex", alignItems: "center",
                          padding: "4px 8px", borderRadius: 6,
                        }}
                      >
                        View Engagement →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB: Group Engagement ───────────────────────────────────────── */}
        {activeTab === "engagement" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Group Engagement</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>This week · first names only · no accuracy data</div>
            </div>

            {/* Group selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {GROUPS.map((g) => (
                <button key={g.id} style={groupTabStyle(g.id)} onClick={() => setActiveGroup(g.id as "A" | "B" | "C")}>
                  {g.name}
                </button>
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {eng.stats.map((s) => (
                <div key={s.lbl} style={{
                  background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 16, textAlign: "center",
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 4, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Student rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {eng.students.map((s) => (
                <div key={s.name} style={{
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: s.active ? eng.color + "2e" : "rgba(139,148,158,.12)",
                    color: s.active ? eng.color : C.muted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, flexShrink: 0,
                  }}>{s.initial}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, flex: 1, minWidth: 80, color: C.text }}>{s.name}</div>
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: "rgba(56,189,248,.15)", color: C.blue, border: `1px solid rgba(56,189,248,.3)`,
                  }}>{s.band}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: "4px 11px", borderRadius: 20,
                    background: s.active ? "rgba(80,232,144,.15)" : "rgba(139,148,158,.12)",
                    color: s.active ? C.green : C.muted,
                    border: `1px solid ${s.active ? "rgba(80,232,144,.3)" : "rgba(139,148,158,.25)"}`,
                  }}>
                    {s.active ? "Active this week" : "Not started yet"}
                  </span>
                </div>
              ))}
            </div>

            {/* Encouragement */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <Btn variant="secondary" onClick={() => showToast("Encouragement sent through the platform!")}>
                💌 Send Encouragement
              </Btn>
            </div>

            {/* Privacy note */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(56,189,248,.07)",
              border: `1px solid rgba(56,189,248,.18)`,
              borderRadius: 8, padding: "10px 14px", marginTop: 20,
              fontSize: 12, color: C.muted,
            }}>
              <span>🔒</span>
              First names only · No accuracy data shown · Messages routed through platform · Group composition visible to teacher only
            </div>
          </div>
        )}

        {/* ── Assign Quest Modal ─────────────────────────────────────────── */}
        {assignModalGroup !== null && (
          <div style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 20,
          }}>
            <div style={{
              background: C.surface,
              border: `1.5px solid rgba(56,189,248,.2)`,
              borderRadius: 12, padding: 28,
              width: "100%", maxWidth: 440,
            }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 18 }}>
                Assign Quest — Group {assignModalGroup}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                {QUEST_OPTIONS.map((q) => (
                  <div key={q.id} onClick={() => setSelectedQuest(q.id)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 8,
                    border: `1.5px solid ${selectedQuest === q.id ? C.blue : C.border}`,
                    background: selectedQuest === q.id ? "rgba(56,189,248,.1)" : C.base,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}>
                    <input
                      type="radio"
                      readOnly
                      checked={selectedQuest === q.id}
                      style={{ accentColor: C.blue, width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{q.label}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{q.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <Btn variant="primary" onClick={() => {
                  if (selectedQuest) {
                    const quest = QUEST_OPTIONS.find((q) => q.id === selectedQuest);
                    showToast(`"${quest?.label}" assigned to Group ${assignModalGroup}`);
                  }
                  setAssignModalGroup(null);
                  setSelectedQuest(null);
                }}>Assign</Btn>
                <Btn variant="ghost" onClick={() => { setAssignModalGroup(null); setSelectedQuest(null); }}>Cancel</Btn>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast ──────────────────────────────────────────────────────── */}
        {toast !== null && (
          <div style={{
            position: "fixed", bottom: 28, right: 24,
            background: C.surface,
            border: `1.5px solid ${C.green}`,
            borderRadius: 8,
            padding: "12px 18px",
            fontSize: 13.5, fontWeight: 600, color: C.green,
            zIndex: 200,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,.45)",
            maxWidth: 320,
          }}>
            ✅ {toast}
          </div>
        )}

      </div>
    </AppFrame>
  );
}
