"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

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
type ChipColor = "teal" | "violet" | "gold" | "blue" | "green" | "coral";
type EngLevel = "high" | "med" | "full";

type RosterStudent = {
  studentId: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  sessionsLast7d: number;
  correctLast7d: number;
  totalLast7d: number;
  lastSessionAt: string | null;
  inInterventionQueue: boolean;
  streak: number;
};

// Custom group stored in localStorage
type CustomGroup = {
  id: string;
  name: string;
  color: string; // hex
  colorKey: ChipColor;
  studentIds: string[]; // studentId values
  createdAt: number;
};

// Smart group (read-only, derived)
type SmartGroup = {
  id: string;
  label: string;
  description: string;
  color: string;
  colorKey: ChipColor;
  students: RosterStudent[];
};

// ── Band config ───────────────────────────────────────────────────────────────
const BAND_CONFIG: Record<string, {
  label: string; color: string; chipColor: ChipColor;
}> = {
  P0: { label: "Pre-K",  color: C.gold,   chipColor: "gold"   },
  P1: { label: "K–1",    color: C.violet, chipColor: "violet" },
  P2: { label: "G2–3",   color: C.teal,   chipColor: "teal"   },
  P3: { label: "G4–5",   color: C.green,  chipColor: "green"  },
};

// ── Chip styles ───────────────────────────────────────────────────────────────
const CHIP_STYLES: Record<ChipColor, React.CSSProperties> = {
  teal:   { background: "rgba(45,212,191,0.15)",  color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.3)" },
  violet: { background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" },
  gold:   { background: "rgba(255,209,102,0.15)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.3)" },
  blue:   { background: "rgba(56,189,248,0.15)",  color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" },
  green:  { background: "rgba(80,232,144,0.15)",  color: "#50e890", border: "1px solid rgba(80,232,144,0.3)" },
  coral:  { background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" },
};

const ENG_STYLES: Record<EngLevel, React.CSSProperties> = {
  high: { background: "rgba(80,232,144,0.15)",  color: "#50e890", border: "1px solid rgba(80,232,144,0.3)" },
  med:  { background: "rgba(255,209,102,0.15)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.3)" },
  full: { background: "rgba(56,189,248,0.15)",  color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" },
};

const COLOR_SWATCHES: { key: ChipColor; hex: string }[] = [
  { key: "teal",   hex: "#2dd4bf" },
  { key: "violet", hex: "#a78bfa" },
  { key: "gold",   hex: "#ffd166" },
  { key: "blue",   hex: "#38bdf8" },
  { key: "coral",  hex: "#f87171" },
  { key: "green",  hex: "#50e890" },
];

const AVATAR_EMOJIS: Record<string, string> = {
  owl: "🦉", fox: "🦊", bear: "🐻", dragon: "🐲",
  cat: "🐱", dog: "🐶", rabbit: "🐰", penguin: "🐧",
};
function avatarEmoji(key: string): string {
  return AVATAR_EMOJIS[key] ?? "🌟";
}

// ── Derive smart groups from roster ──────────────────────────────────────────
function buildSmartGroups(roster: RosterStudent[]): SmartGroup[] {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const activeThisWeek = roster.filter((s) => {
    if (!s.lastSessionAt) return false;
    return now - new Date(s.lastSessionAt).getTime() < sevenDays;
  });

  const needsAttention = roster.filter((s) => {
    if (!s.lastSessionAt) return true;
    return now - new Date(s.lastSessionAt).getTime() >= sevenDays;
  });

  const groups: SmartGroup[] = [];

  if (activeThisWeek.length > 0) {
    groups.push({
      id: "smart_active",
      label: "Active This Week",
      description: "Students who had a session in the last 7 days",
      color: C.green,
      colorKey: "green",
      students: activeThisWeek,
    });
  }

  if (needsAttention.length > 0) {
    groups.push({
      id: "smart_attention",
      label: "Needs Attention",
      description: "Students inactive for 7+ days",
      color: C.coral,
      colorKey: "coral",
      students: needsAttention,
    });
  }

  const bandOrder = ["P0", "P1", "P2", "P3"];
  for (const code of bandOrder) {
    const cfg = BAND_CONFIG[code];
    if (!cfg) continue;
    const members = roster.filter((s) => s.launchBandCode === code);
    if (members.length === 0) continue;
    groups.push({
      id: `smart_band_${code}`,
      label: `${cfg.label} Learners`,
      description: `Students in the ${cfg.label} learning band`,
      color: cfg.color,
      colorKey: cfg.chipColor,
      students: members,
    });
  }

  return groups;
}

// ── Engagement stats from band groups (legacy) ────────────────────────────────
type BandGroup = {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  chipColor: ChipColor;
  students: { name: string; initial: string; band: string; bandColor: ChipColor; active: boolean }[];
  engLabel: string;
  engLevel: EngLevel;
  stats: { started: string; sessions: number; avgMin: number };
};

function buildBandGroups(roster: RosterStudent[]): BandGroup[] {
  const bandOrder = ["P0", "P1", "P2", "P3"];
  return bandOrder
    .map((code) => {
      const cfg = BAND_CONFIG[code];
      const members = roster.filter((s) => s.launchBandCode === code);
      if (members.length === 0) return null;

      const activeCount = members.filter((s) => s.sessionsLast7d > 0).length;
      const totalSessions = members.reduce((a, s) => a + s.sessionsLast7d, 0);
      const engLevel: EngLevel =
        activeCount === members.length ? "full" :
        activeCount >= members.length * 0.5 ? "high" : "med";

      return {
        id: code,
        name: `${cfg.label} Learners`,
        color: cfg.color,
        accentColor: cfg.color,
        chipColor: cfg.chipColor,
        students: members.map((s) => ({
          name: s.displayName,
          initial: s.displayName.charAt(0),
          band: cfg.label,
          bandColor: cfg.chipColor,
          active: s.sessionsLast7d > 0,
        })),
        engLabel: `${activeCount}/${members.length} started`,
        engLevel,
        stats: { started: `${activeCount}/${members.length}`, sessions: totalSessions, avgMin: 0 },
      } as BandGroup;
    })
    .filter((g): g is BandGroup => g !== null);
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadCustomGroups(teacherId: string): CustomGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`wq_teacher_groups_${teacherId}`);
    if (!raw) return [];
    return JSON.parse(raw) as CustomGroup[];
  } catch {
    return [];
  }
}

function saveCustomGroups(teacherId: string, groups: CustomGroup[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`wq_teacher_groups_${teacherId}`, JSON.stringify(groups));
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeacherGroupsPage() {
  const [authed, setAuthed] = useState(false);
  const [teacherId, setTeacherId] = useState("");

  useEffect(() => {
    fetchTeacherId().then(id => { setTeacherId(id); setAuthed(!!id); });
  }, []);

  const [mainTab, setMainTab] = useState<"groups" | "engagement">("groups");
  const [engGroupId, setEngGroupId] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>([]);
  const [smartGroups, setSmartGroups] = useState<SmartGroup[]>([]);
  const [bandGroups, setBandGroups] = useState<BandGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState<ChipColor>("teal");
  const [newGroupStudents, setNewGroupStudents] = useState<string[]>([]);

  // Edit state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<ChipColor>("teal");
  const [editStudents, setEditStudents] = useState<string[]>([]);

  // Confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authed || !teacherId) return;
    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => r.json())
      .then((data: { roster?: RosterStudent[] }) => {
        if (data.roster) {
          setRoster(data.roster);
          setSmartGroups(buildSmartGroups(data.roster));
          const bands = buildBandGroups(data.roster);
          setBandGroups(bands);
          if (bands.length > 0) setEngGroupId(bands[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    setCustomGroups(loadCustomGroups(teacherId));
  }, [authed, teacherId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // ── Custom group CRUD ─────────────────────────────────────────────────────
  function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    const swatch = COLOR_SWATCHES.find((s) => s.key === newGroupColor);
    const group: CustomGroup = {
      id: `cg_${Date.now()}`,
      name: newGroupName.trim(),
      color: swatch?.hex ?? "#2dd4bf",
      colorKey: newGroupColor,
      studentIds: newGroupStudents,
      createdAt: Date.now(),
    };
    const updated = [...customGroups, group];
    setCustomGroups(updated);
    saveCustomGroups(teacherId, updated);
    setNewGroupName("");
    setNewGroupColor("teal");
    setNewGroupStudents([]);
    setShowCreateForm(false);
    showToast(`Group "${group.name}" created`);
  }

  function handleDeleteGroup(id: string) {
    const updated = customGroups.filter((g) => g.id !== id);
    setCustomGroups(updated);
    saveCustomGroups(teacherId, updated);
    setConfirmDeleteId(null);
    showToast("Group deleted");
  }

  function startEdit(grp: CustomGroup) {
    setEditingGroupId(grp.id);
    setEditName(grp.name);
    setEditColor(grp.colorKey);
    setEditStudents([...grp.studentIds]);
  }

  function handleSaveEdit() {
    if (!editName.trim() || !editingGroupId) return;
    const swatch = COLOR_SWATCHES.find((s) => s.key === editColor);
    const updated = customGroups.map((g) =>
      g.id === editingGroupId
        ? { ...g, name: editName.trim(), color: swatch?.hex ?? g.color, colorKey: editColor, studentIds: editStudents }
        : g
    );
    setCustomGroups(updated);
    saveCustomGroups(teacherId, updated);
    setEditingGroupId(null);
    showToast("Group updated");
  }

  function toggleStudentInSet(studentId: string, set: string[], setter: (v: string[]) => void) {
    setter(set.includes(studentId) ? set.filter((id) => id !== studentId) : [...set, studentId]);
  }

  // ── Shared styles ────────────────────────────────────────────────────────
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

  const btnDanger: React.CSSProperties = {
    background: "transparent",
    color: C.coral,
    border: "1.5px solid rgba(248,113,113,0.35)",
    borderRadius: 8,
    padding: "7px 13px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const inputStyle: React.CSSProperties = {
    background: C.base,
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    padding: "10px 14px",
    color: C.text,
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    minHeight: 44,
  };

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/groups">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  const activeEngGroup = bandGroups.find((g) => g.id === engGroupId) ?? bandGroups[0];
  const totalCustomStudents = customGroups.reduce((a, g) => a + g.studentIds.length, 0);

  // ── Student picker sub-component ─────────────────────────────────────────
  function StudentPicker({
    selected,
    onToggle,
  }: {
    selected: string[];
    onToggle: (id: string) => void;
  }) {
    return (
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
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        {roster.length === 0 && (
          <span style={{ color: C.muted, fontSize: 13, padding: "8px 4px" }}>
            No students on roster yet
          </span>
        )}
        {roster.map((s) => {
          const isSelected = selected.includes(s.studentId);
          return (
            <button
              key={s.studentId}
              onClick={() => onToggle(s.studentId)}
              style={{
                padding: "5px 11px",
                borderRadius: 20,
                border: isSelected ? "1.5px solid #50e890" : `1.5px solid ${C.border}`,
                background: isSelected ? "rgba(80,232,144,0.15)" : "rgba(28,34,48,0.9)",
                color: isSelected ? C.green : C.muted,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                minHeight: 32,
                transition: "all 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>{avatarEmoji(s.avatarKey)}</span>
              {s.displayName}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Color picker sub-component ────────────────────────────────────────────
  function ColorPicker({
    selected,
    onChange,
  }: {
    selected: ChipColor;
    onChange: (k: ChipColor) => void;
  }) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {COLOR_SWATCHES.map((sw) => (
          <button
            key={sw.key}
            onClick={() => onChange(sw.key)}
            aria-label={sw.key}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: sw.hex,
              border: selected === sw.key ? "2.5px solid #fff" : "2.5px solid transparent",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/groups">
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
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.blue, marginBottom: 4 }}>
              Groups
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1.15, display: "flex", alignItems: "center", gap: 12 }}>
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
              {loading
                ? "Loading…"
                : `${customGroups.length} custom group${customGroups.length !== 1 ? "s" : ""} · ${smartGroups.length} smart groups · ${roster.length} students`}
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

          {/* Loading */}
          {loading && (
            <div style={{ color: C.muted, fontSize: 14, padding: "40px 0", textAlign: "center" }}>
              Loading class groups…
            </div>
          )}

          {/* ══════ TAB: GROUPS ══════ */}
          {!loading && mainTab === "groups" && (
            <div>

              {/* ── Custom Groups section ── */}
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
                    {customGroups.length} group{customGroups.length !== 1 ? "s" : ""} · {totalCustomStudents} student assignments
                  </div>
                </div>
                <button onClick={() => { setShowCreateForm((v) => !v); setEditingGroupId(null); }} style={btnPrimary}>
                  <span>+</span> Create Group
                </button>
              </div>

              {/* localStorage note */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(155,114,255,0.07)",
                  border: "1px solid rgba(155,114,255,0.2)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  marginBottom: 20,
                  fontSize: 12,
                  color: C.muted,
                }}
              >
                <span>💾</span>
                Groups are saved on this device. Use the same browser to access them again.
              </div>

              {/* ── Create group form ── */}
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
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: C.green }}>
                    New Group
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Group Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Reading Circle"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Color Tag
                      </div>
                      <ColorPicker selected={newGroupColor} onChange={setNewGroupColor} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Add Students ({newGroupStudents.length} selected)
                      </div>
                      <StudentPicker
                        selected={newGroupStudents}
                        onToggle={(id) => toggleStudentInSet(id, newGroupStudents, setNewGroupStudents)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                    <button
                      onClick={handleCreateGroup}
                      disabled={!newGroupName.trim()}
                      style={{ ...btnPrimary, opacity: newGroupName.trim() ? 1 : 0.5 }}
                    >
                      Save Group
                    </button>
                    <button onClick={() => setShowCreateForm(false)} style={btnGhost}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* ── Custom group cards ── */}
              {customGroups.length === 0 && !showCreateForm && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    background: C.surface,
                    border: `1.5px dashed ${C.border}`,
                    borderRadius: 12,
                    color: C.muted,
                    fontSize: 14,
                    marginBottom: 32,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>👥</div>
                  <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Create your first group to organize students for targeted instruction.
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Groups let you assign quests and track progress for specific sets of students.
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 16,
                  marginBottom: customGroups.length > 0 ? 32 : 0,
                }}
              >
                {customGroups.map((grp) => {
                  const swatch = COLOR_SWATCHES.find((s) => s.key === grp.colorKey);
                  const borderColor = swatch ? `${swatch.hex}38` : C.border;
                  const groupStudents = roster.filter((s) => grp.studentIds.includes(s.studentId));
                  const isEditing = editingGroupId === grp.id;

                  return (
                    <div
                      key={grp.id}
                      style={{
                        background: C.cardBg,
                        border: `1.5px solid ${borderColor}`,
                        borderRadius: 12,
                        padding: 20,
                        transition: "transform 0.2s",
                      }}
                    >
                      {/* Edit form inline */}
                      {isEditing ? (
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
                            Edit Group
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              style={inputStyle}
                            />
                            <div>
                              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600 }}>COLOR</div>
                              <ColorPicker selected={editColor} onChange={setEditColor} />
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600 }}>
                                STUDENTS ({editStudents.length} selected)
                              </div>
                              <StudentPicker
                                selected={editStudents}
                                onToggle={(id) => toggleStudentInSet(id, editStudents, setEditStudents)}
                              />
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                            <button onClick={handleSaveEdit} disabled={!editName.trim()} style={{ ...btnPrimary, opacity: editName.trim() ? 1 : 0.5 }}>
                              Save
                            </button>
                            <button onClick={() => setEditingGroupId(null)} style={btnGhost}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Card header */}
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: grp.color,
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{grp.name}</div>
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
                              {groupStudents.length} student{groupStudents.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Student chips */}
                          {groupStudents.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                              {groupStudents.map((s) => (
                                <span key={s.studentId} style={{ ...chipBase, ...CHIP_STYLES[grp.colorKey] }}>
                                  {avatarEmoji(s.avatarKey)} {s.displayName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, fontStyle: "italic" }}>
                              No students added yet — click Edit to add some.
                            </div>
                          )}

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
                            <Link
                              href={`/teacher/assignment?groupId=${grp.id}`}
                              style={{
                                ...btnSecondary,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Assign Quest
                            </Link>
                            <button onClick={() => startEdit(grp)} style={btnGhost}>
                              Edit
                            </button>
                            {confirmDeleteId === grp.id ? (
                              <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
                                <span style={{ fontSize: 11, color: C.muted }}>Delete?</span>
                                <button onClick={() => handleDeleteGroup(grp.id)} style={{ ...btnDanger, padding: "5px 10px" }}>
                                  Yes
                                </button>
                                <button onClick={() => setConfirmDeleteId(null)} style={{ ...btnGhost, padding: "5px 10px" }}>
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(grp.id)}
                                style={{ ...btnDanger, marginLeft: "auto" }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Smart Groups section ── */}
              <div style={{ marginTop: customGroups.length > 0 ? 8 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Smart Groups</div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: "rgba(255,209,102,0.15)",
                      color: C.gold,
                      border: "1px solid rgba(255,209,102,0.3)",
                    }}
                  >
                    ⚡ Auto-derived
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                  Read-only groups automatically derived from your class roster.
                </div>

                {smartGroups.length === 0 && (
                  <div style={{ color: C.muted, fontSize: 13 }}>
                    Smart groups will appear once students are enrolled in your class.
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 16,
                  }}
                >
                  {smartGroups.map((sg) => {
                    const borderColor = `${sg.color}38`;
                    return (
                      <div
                        key={sg.id}
                        style={{
                          background: C.cardBg,
                          border: `1.5px solid ${borderColor}`,
                          borderRadius: 12,
                          padding: 20,
                        }}
                      >
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: sg.color, flexShrink: 0 }} />
                            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{sg.label}</div>
                            <span style={{ fontSize: 10, color: sg.color, fontWeight: 700 }}>⚡</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(28,34,48,0.9)", color: C.muted, whiteSpace: "nowrap" }}>
                            {sg.students.length} student{sg.students.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{sg.description}</div>

                        {/* Student chips */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                          {sg.students.map((s) => (
                            <span key={s.studentId} style={{ ...chipBase, ...CHIP_STYLES[sg.colorKey] }}>
                              {avatarEmoji(s.avatarKey)} {s.displayName}
                            </span>
                          ))}
                        </div>

                        {/* Action */}
                        <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                          <Link
                            href={`/teacher/assignment?smartGroup=${sg.id}`}
                            style={{
                              ...btnSecondary,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            Assign Quest to Group
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════ TAB: ENGAGEMENT ══════ */}
          {!loading && mainTab === "engagement" && (
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

              {bandGroups.length === 0 ? (
                <div style={{ color: C.muted, fontSize: 14, padding: "40px 0", textAlign: "center" }}>
                  No students on your roster yet. Engagement data will appear here once students are enrolled.
                </div>
              ) : (
                <>
                  {/* Group selector tabs */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                    {bandGroups.map((grp) => {
                      const isActive = engGroupId === grp.id;
                      return (
                        <button
                          key={grp.id}
                          onClick={() => setEngGroupId(grp.id)}
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
                          {grp.name}
                        </button>
                      );
                    })}
                  </div>

                  {activeEngGroup && (
                    <>
                      {/* Stats row */}
                      <div className="stat-grid-3" style={{ gap: 12, marginBottom: 24 }}>
                        {[
                          { val: activeEngGroup.stats.started, label: "Students Started", color: activeEngGroup.accentColor },
                          { val: String(activeEngGroup.stats.sessions), label: "Sessions This Week", color: C.green },
                          { val: activeEngGroup.stats.avgMin > 0 ? `${activeEngGroup.stats.avgMin} min` : "—", label: "Avg Session Length", color: C.blue },
                        ].map((st, i) => (
                          <div
                            key={i}
                            style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 16, textAlign: "center" }}
                          >
                            <div style={{ fontSize: 28, fontWeight: 800, color: st.color, lineHeight: 1, marginBottom: 4 }}>
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
                                background: s.active ? `${activeEngGroup.color}2e` : "rgba(139,148,158,0.12)",
                                color: s.active ? activeEngGroup.color : C.muted,
                              }}
                            >
                              {s.initial}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, flex: 1, minWidth: 80 }}>{s.name}</div>
                            <span style={{ ...chipBase, fontSize: 11, fontWeight: 700, ...CHIP_STYLES[s.bandColor] }}>
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
                          Send Encouragement
                        </button>
                      </div>
                    </>
                  )}

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
                    <span>🔒</span>
                    First names only · No accuracy data shown · Messages routed through platform · Group composition visible to teacher only
                  </div>
                </>
              )}
            </div>
          )}
        </div>

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
