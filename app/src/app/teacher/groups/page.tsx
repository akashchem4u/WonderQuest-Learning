"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  cardBg: "rgba(22,27,34,0.9)",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(255,255,255,0.14)",
  teal: "#2dd4bf",
  purple: "#a78bfa",
  coral: "#f87171",
  green: "#50e890",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type ChipColor = "teal" | "violet" | "gold" | "blue" | "green";
type EngLevel = "high" | "med" | "full";

type Student = {
  name: string;
  initial: string;
  band: string;
  bandColor: ChipColor;
  active: boolean;
};

type Group = {
  id: string;
  letter: string;
  name: string;
  color: string;
  borderColor: string;
  chipColor: ChipColor;
  students: Student[];
  assignment: string;
  engLabel: string;
  engLevel: EngLevel;
  stats: { started: string; sessions: number; avgMin: number };
  accentColor: string;
};

// ── Chip styles ───────────────────────────────────────────────────────────────
const CHIP_STYLES: Record<ChipColor, React.CSSProperties> = {
  teal:   { background: "rgba(45,212,191,0.15)",  color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.3)" },
  violet: { background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" },
  gold:   { background: "rgba(255,209,102,0.15)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.3)" },
  blue:   { background: "rgba(56,189,248,0.15)",  color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" },
  green:  { background: "rgba(80,232,144,0.15)",  color: "#50e890", border: "1px solid rgba(80,232,144,0.3)" },
};

const ENG_STYLES: Record<EngLevel, React.CSSProperties> = {
  high: { background: "rgba(80,232,144,0.15)",  color: "#50e890", border: "1px solid rgba(80,232,144,0.3)" },
  med:  { background: "rgba(255,209,102,0.15)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.3)" },
  full: { background: "rgba(56,189,248,0.15)",  color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" },
};

// ── Stub data ─────────────────────────────────────────────────────────────────
const GROUPS: Group[] = [
  {
    id: "A",
    letter: "A",
    name: "Quest Explorers",
    color: "#2dd4bf",
    borderColor: "rgba(45,212,191,0.22)",
    chipColor: "teal",
    accentColor: "#2dd4bf",
    students: [
      { name: "Amara",  initial: "A", band: "Explorer",   bandColor: "blue",  active: true },
      { name: "Ben",    initial: "B", band: "Explorer",   bandColor: "blue",  active: true },
      { name: "Cleo",   initial: "C", band: "Adventurer", bandColor: "green", active: true },
      { name: "Daniel", initial: "D", band: "Explorer",   bandColor: "blue",  active: true },
      { name: "Eva",    initial: "E", band: "Explorer",   bandColor: "blue",  active: true },
      { name: "Felix",  initial: "F", band: "Adventurer", bandColor: "green", active: false },
    ],
    assignment: "P1 Reading Batch",
    engLabel: "5/6 started",
    engLevel: "high",
    stats: { started: "5/6", sessions: 12, avgMin: 18 },
  },
  {
    id: "B",
    letter: "B",
    name: "Star Builders",
    color: "#a78bfa",
    borderColor: "rgba(167,139,250,0.22)",
    chipColor: "violet",
    accentColor: "#a78bfa",
    students: [
      { name: "Grace", initial: "G", band: "Navigator", bandColor: "violet", active: true },
      { name: "Henry", initial: "H", band: "Navigator", bandColor: "violet", active: true },
      { name: "Isla",  initial: "I", band: "Explorer",  bandColor: "blue",   active: true },
      { name: "Juno",  initial: "J", band: "Navigator", bandColor: "violet", active: true },
      { name: "Kai",   initial: "K", band: "Explorer",  bandColor: "blue",   active: false },
    ],
    assignment: "P0 Maths Batch",
    engLabel: "4/5 started",
    engLevel: "med",
    stats: { started: "4/5", sessions: 9, avgMin: 14 },
  },
  {
    id: "C",
    letter: "C",
    name: "Adventure Squad",
    color: "#ffd166",
    borderColor: "rgba(255,209,102,0.22)",
    chipColor: "gold",
    accentColor: "#ffd166",
    students: [
      { name: "Lena",  initial: "L", band: "Trailblazer", bandColor: "gold", active: true },
      { name: "Marco", initial: "M", band: "Trailblazer", bandColor: "gold", active: true },
      { name: "Nina",  initial: "N", band: "Trailblazer", bandColor: "gold", active: true },
      { name: "Omar",  initial: "O", band: "Trailblazer", bandColor: "gold", active: true },
    ],
    assignment: "Free Explore",
    engLabel: "4/4 started",
    engLevel: "full",
    stats: { started: "4/4", sessions: 11, avgMin: 22 },
  },
];

const ALL_STUDENTS = ["Amara", "Ben", "Cleo", "Daniel", "Eva", "Felix", "Grace", "Henry", "Isla", "Juno"];

const QUEST_OPTIONS = [
  { label: "P1 Reading Batch",    sub: "6 quests · Phonics & fluency" },
  { label: "P0 Maths Batch",      sub: "5 quests · Number sense" },
  { label: "Free Explore",        sub: "Adaptive — student-chosen path" },
  { label: "Shapes & Patterns",   sub: "4 quests · Geometry foundations" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeacherGroupsPage() {
  const [mainTab, setMainTab] = useState<"groups" | "engagement">("groups");
  const [engGroup, setEngGroup] = useState<string>("A");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("teal");
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeEngGroup = GROUPS.find((g) => g.id === engGroup) ?? GROUPS[0];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const toggleStudent = (name: string) => {
    setSelectedStudents((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // ── Shared inline styles ──────────────────────────────────────────────────
  const tabBtnBase: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "system-ui,-apple-system,sans-serif",
    fontSize: 13,
    fontWeight: 700,
    paddingBottom: 14,
    letterSpacing: "0.02em",
    borderBottom: "2px solid transparent",
    color: C.muted,
    transition: "color 0.15s",
  };

  const chipBase: React.CSSProperties = {
    padding: "4px 11px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  };

  const btnPrimary: React.CSSProperties = {
    background: C.green,
    color: "#0d1117",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  };

  const btnSecondary: React.CSSProperties = {
    background: "transparent",
    color: C.blue,
    border: "1.5px solid rgba(56,189,248,0.35)",
    borderRadius: 8,
    padding: "7px 13px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const btnGhost: React.CSSProperties = {
    background: "transparent",
    color: C.muted,
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    padding: "7px 13px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const COLOR_SWATCHES = [
    { key: "teal",   hex: "#2dd4bf" },
    { key: "violet", hex: "#a78bfa" },
    { key: "gold",   hex: "#ffd166" },
    { key: "blue",   hex: "#38bdf8" },
    { key: "coral",  hex: "#f87171" },
    { key: "green",  hex: "#50e890" },
  ];

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          background: C.base,
          minHeight: "100vh",
          color: C.text,
          fontFamily: "system-ui,-apple-system,sans-serif",
          paddingBottom: 60,
        }}
      >
        {/* ── Page header ── */}
        <div style={{ padding: "28px 32px 0", display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Link
              href="/teacher"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: C.muted,
                textDecoration: "none",
                marginBottom: 12,
                letterSpacing: "0.04em",
              }}
            >
              <span>&#8592;</span> Dashboard
            </Link>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.blue,
                marginBottom: 4,
              }}
            >
              Groups
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: C.text,
                margin: 0,
                lineHeight: 1.15,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              Small Group Planner
              <span
                style={{
                  background: "rgba(56,189,248,0.15)",
                  color: C.blue,
                  border: "1px solid rgba(56,189,248,0.3)",
                  borderRadius: 20,
                  padding: "4px 13px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Teacher View
              </span>
            </h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
              3 groups · 15 students total · Class 4B
            </p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          style={{
            padding: "20px 32px 0",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          {(["groups", "engagement"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMainTab(t)}
              style={{
                ...tabBtnBase,
                color: mainTab === t ? C.text : C.muted,
                borderBottom: mainTab === t ? `2px solid ${C.blue}` : "2px solid transparent",
              }}
            >
              {t === "groups" ? "Groups" : "Group Engagement"}
            </button>
          ))}
        </div>

        <div style={{ padding: "24px 32px" }}>

          {/* ══════ TAB: GROUPS ══════ */}
          {mainTab === "groups" && (
            <div>
              {/* Section header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>My Groups</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                    3 groups · 15 students total
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateForm((v) => !v)}
                  style={btnPrimary}
                >
                  <span>+</span> Create Group
                </button>
              </div>

              {/* Create group form */}
              {showCreateForm && (
                <div
                  style={{
                    background: C.surface,
                    border: "1.5px solid rgba(80,232,144,0.25)",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 16,
                      color: C.green,
                    }}
                  >
                    New Group
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.muted,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Group Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Wonder Wizards"
                        style={{
                          background: C.base,
                          border: `1.5px solid ${C.border}`,
                          borderRadius: 8,
                          padding: "10px 14px",
                          color: C.text,
                          fontFamily: "inherit",
                          fontSize: 14,
                          outline: "none",
                          minHeight: 44,
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.muted,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Group Color
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        {COLOR_SWATCHES.map((sw) => (
                          <button
                            key={sw.key}
                            onClick={() => setSelectedColor(sw.key)}
                            aria-label={sw.key}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: sw.hex,
                              border: selectedColor === sw.key
                                ? "2.5px solid #fff"
                                : "2.5px solid transparent",
                              cursor: "pointer",
                              transition: "transform 0.15s",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.muted,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Add Students
                      </div>
                      <div
                        style={{
                          background: C.base,
                          border: `1.5px solid ${C.border}`,
                          borderRadius: 8,
                          padding: 8,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          minHeight: 60,
                        }}
                      >
                        {ALL_STUDENTS.map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleStudent(s)}
                            style={{
                              padding: "5px 11px",
                              borderRadius: 20,
                              border: selectedStudents.includes(s)
                                ? "1.5px solid #50e890"
                                : `1.5px solid ${C.border}`,
                              background: selectedStudents.includes(s)
                                ? "rgba(80,232,144,0.15)"
                                : "rgba(28,34,48,0.9)",
                              color: selectedStudents.includes(s) ? C.green : C.muted,
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              minHeight: 32,
                              transition: "all 0.15s",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                    <button
                      onClick={() => { setShowCreateForm(false); showToast("Group saved!"); }}
                      style={btnPrimary}
                    >
                      Save Group
                    </button>
                    <button onClick={() => setShowCreateForm(false)} style={btnGhost}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Group cards grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {GROUPS.map((grp) => (
                  <div
                    key={grp.id}
                    style={{
                      background: C.cardBg,
                      border: `1.5px solid ${grp.borderColor}`,
                      borderRadius: 12,
                      padding: 20,
                      transition: "transform 0.2s",
                    }}
                  >
                    {/* Card header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 14,
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: grp.color,
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          flex: 1,
                          color: C.text,
                        }}
                      >
                        {grp.letter} — {grp.name}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: "rgba(28,34,48,0.9)",
                          color: C.muted,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {grp.students.length} students
                      </span>
                    </div>

                    {/* Student chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {grp.students.map((s) => (
                        <span key={s.name} style={{ ...chipBase, ...CHIP_STYLES[grp.chipColor] }}>
                          {s.name}
                        </span>
                      ))}
                    </div>

                    {/* Assignment row */}
                    <div
                      style={{
                        background: "rgba(28,34,48,0.8)",
                        borderRadius: 8,
                        padding: "10px 13px",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: C.muted,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Current Assignment
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 2 }}>
                          {grp.assignment}
                        </div>
                      </div>
                      <span
                        style={{
                          ...chipBase,
                          fontSize: 12,
                          fontWeight: 700,
                          ...ENG_STYLES[grp.engLevel],
                        }}
                      >
                        {grp.engLabel}
                      </span>
                    </div>

                    {/* Card actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: `1px solid ${C.border}`,
                        alignItems: "center",
                      }}
                    >
                      <button onClick={() => setAssignModal(grp.id)} style={btnSecondary}>
                        Assign Quest
                      </button>
                      <button onClick={() => showToast(`Edit mode — Group ${grp.letter}`)} style={btnGhost}>
                        Edit Group
                      </button>
                      <button
                        onClick={() => { setMainTab("engagement"); setEngGroup(grp.id); }}
                        style={{
                          marginLeft: "auto",
                          fontSize: 13,
                          color: C.blue,
                          fontWeight: 600,
                          textDecoration: "none",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          padding: "4px 8px",
                          borderRadius: 6,
                        }}
                      >
                        View Engagement &#8594;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════ TAB: ENGAGEMENT ══════ */}
          {mainTab === "engagement" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Group Engagement</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                    This week · first names only · no accuracy data
                  </div>
                </div>
              </div>

              {/* Group selector tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                {GROUPS.map((grp) => {
                  const isActive = engGroup === grp.id;
                  return (
                    <button
                      key={grp.id}
                      onClick={() => setEngGroup(grp.id)}
                      style={{
                        padding: "9px 20px",
                        borderRadius: 8,
                        border: isActive ? `1.5px solid ${grp.color}` : `1.5px solid ${C.border}`,
                        background: isActive ? `${grp.color}18` : "transparent",
                        color: isActive ? grp.color : C.muted,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        minHeight: 44,
                        transition: "all 0.18s",
                      }}
                    >
                      {grp.letter} — {grp.name}
                    </button>
                  );
                })}
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {[
                  { val: activeEngGroup.stats.started, label: "Students Started", color: activeEngGroup.accentColor },
                  { val: String(activeEngGroup.stats.sessions), label: "Sessions This Week", color: C.green },
                  { val: `${activeEngGroup.stats.avgMin} min`, label: "Avg Session Length", color: C.blue },
                ].map((st, i) => (
                  <div
                    key={i}
                    style={{
                      background: C.surface,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 12,
                      padding: 16,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: st.color,
                        lineHeight: 1,
                        marginBottom: 4,
                      }}
                    >
                      {st.val}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{st.label}</div>
                  </div>
                ))}
              </div>

              {/* Student rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeEngGroup.students.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      background: C.surface,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 800,
                        flexShrink: 0,
                        background: s.active
                          ? `${activeEngGroup.color}2e`
                          : "rgba(139,148,158,0.12)",
                        color: s.active ? activeEngGroup.color : C.muted,
                      }}
                    >
                      {s.initial}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, flex: 1, minWidth: 80 }}>
                      {s.name}
                    </div>
                    <span
                      style={{
                        ...chipBase,
                        fontSize: 11,
                        fontWeight: 700,
                        ...CHIP_STYLES[s.bandColor],
                      }}
                    >
                      {s.band}
                    </span>
                    <span
                      style={{
                        ...chipBase,
                        fontSize: 12,
                        fontWeight: 600,
                        ...(s.active
                          ? { background: "rgba(80,232,144,0.15)", color: "#50e890", border: "1px solid rgba(80,232,144,0.3)" }
                          : { background: "rgba(139,148,158,0.12)", color: C.muted, border: "1px solid rgba(139,148,158,0.25)" }),
                      }}
                    >
                      {s.active ? "Active this week" : "Not started yet"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Encourage button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  onClick={() => showToast("Encouragement sent through the platform!")}
                  style={btnSecondary}
                >
                  &#128140; Send Encouragement
                </button>
              </div>

              {/* Privacy note */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(56,189,248,0.07)",
                  border: "1px solid rgba(56,189,248,0.18)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginTop: 20,
                  fontSize: 12,
                  color: C.muted,
                }}
              >
                <span>&#128274;</span>
                First names only · No accuracy data shown · Messages routed through platform · Group composition visible to teacher only
              </div>
            </div>
          )}
        </div>

        {/* ══════ ASSIGN QUEST MODAL ══════ */}
        {assignModal !== null && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setAssignModal(null); }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 20,
            }}
          >
            <div
              style={{
                background: C.surface,
                border: "1.5px solid rgba(56,189,248,0.2)",
                borderRadius: 12,
                padding: 28,
                width: "100%",
                maxWidth: 440,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>
                Assign Quest — Group {assignModal}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                {QUEST_OPTIONS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setSelectedQuest(q.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: selectedQuest === q.label
                        ? `1.5px solid ${C.blue}`
                        : `1.5px solid ${C.border}`,
                      background: selectedQuest === q.label
                        ? "rgba(56,189,248,0.1)"
                        : C.base,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="radio"
                      readOnly
                      checked={selectedQuest === q.label}
                      style={{ accentColor: C.blue, width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{q.label}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{q.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setAssignModal(null);
                    showToast(selectedQuest ? `Assigned: ${selectedQuest}` : "No quest selected");
                  }}
                  style={{ ...btnPrimary, flex: 1 }}
                >
                  Assign
                </button>
                <button onClick={() => setAssignModal(null)} style={btnGhost}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ TOAST ══════ */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 28,
              right: 24,
              background: C.surface,
              border: `1.5px solid ${C.green}`,
              borderRadius: 8,
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: C.green,
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              maxWidth: 320,
            }}
          >
            <span>&#10003;</span>
            {toast}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
