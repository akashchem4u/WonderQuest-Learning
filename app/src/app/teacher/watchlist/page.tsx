"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// Auto-queue types
type AutoIntervention = {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  reason: string;
  interventionType: string;
  status: string;
  teacherNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
  autoTriggered: boolean;
};

// Design tokens
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
  red: "#ff7b6b",
};

// Types
type ApiIntervention = {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  reason: string;
  interventionType: string;
  status: string;
  teacherNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
};

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

type WatchlistStudent = {
  id: string;
  studentId: string | null;
  initial: string;
  color: string;
  name: string;
  reason: string;
  hasNote: boolean;
  chips: { label: string; type: "manual" | "band" | "violet" | "advance" | "red" }[];
};

function chipStyle(type: WatchlistStudent["chips"][0]["type"]): React.CSSProperties {
  if (type === "manual") return { background: C.blue + "22", color: C.blue };
  if (type === "band") return { background: C.mint + "22", color: C.mint };
  if (type === "violet") return { background: C.violet + "22", color: C.violet };
  if (type === "red") return { background: C.red + "22", color: C.red };
  return { background: C.amber + "22", color: C.amber };
}

const AVATAR_COLORS = [
  "#475569", "#ec4899", "#0ea5e9", "#f59e0b", "#22c55e",
  "#9b72ff", "#f87171", "#2dd4bf", "#a78bfa", "#ffd166",
];

function interventionToWatchlist(inv: ApiIntervention, index: number): WatchlistStudent {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const chips: WatchlistStudent["chips"] = [{ label: "Active intervention", type: "manual" }];
  if (inv.skillCode) chips.push({ label: inv.skillCode, type: "band" });
  return {
    id: inv.id,
    studentId: inv.studentId,
    initial: inv.studentName.charAt(0).toUpperCase(),
    color,
    name: inv.studentName,
    reason: inv.reason,
    hasNote: !!inv.teacherNote,
    chips,
  };
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function rosterToInactive(s: RosterStudent, index: number, offset: number): WatchlistStudent | null {
  const days = daysSince(s.lastSessionAt);
  if (days === null || days < 7) return null;
  const color = AVATAR_COLORS[(index + offset) % AVATAR_COLORS.length];
  return {
    id: "inactive-" + s.studentId,
    studentId: s.studentId,
    initial: s.displayName.charAt(0).toUpperCase(),
    color,
    name: s.displayName,
    reason: "No sessions in the last " + days + " day" + (days !== 1 ? "s" : "") + ".",
    hasNote: false,
    chips: [{ label: "Inactive " + days + "d", type: "red" }],
  };
}

export default function TeacherWatchlistPage() {
  const [authed, setAuthed] = useState(false);
  const [students, setStudents] = useState<WatchlistStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState("");
  const [activeTab, setActiveTab] = useState<"watchlist" | "empty">("watchlist");
  const [autoInterventions, setAutoInterventions] = useState<AutoIntervention[]>([]);
  const [autoLoading, setAutoLoading] = useState(true);
  const [sendingNote, setSendingNote] = useState<string | null>(null);
  const [noteToast, setNoteToast] = useState<string | null>(null);

  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  useEffect(() => {
    if (!authed) return;
    const teacherId = getTeacherId();

    fetch("/api/teacher/interventions?teacherId=" + encodeURIComponent(teacherId) + "&status=active")
      .then((r) => r.json())
      .then((data: { interventions?: ApiIntervention[] }) => {
        if (data.interventions) {
          setStudents(data.interventions.map((inv, i) => interventionToWatchlist(inv, i)));
        }
      })
      .catch(() => { /* leave empty */ })
      .finally(() => setLoading(false));

    fetch("/api/teacher/class?teacherId=" + encodeURIComponent(teacherId))
      .then((r) => r.json())
      .then((data: { roster?: RosterStudent[] }) => {
        if (data.roster) {
          setStudents((prev) => {
            const interventionStudentIds = new Set(prev.map((s) => s.studentId).filter(Boolean));
            const inactiveCards = data.roster!
              .map((s, i) => rosterToInactive(s, i, prev.length))
              .filter((s): s is WatchlistStudent => s !== null)
              .filter((s) => !interventionStudentIds.has(s.studentId));
            return [...prev, ...inactiveCards];
          });
        }
      })
      .catch(() => { /* ignore */ });

    fetch("/api/teacher/interventions/auto-queue?teacherId=" + encodeURIComponent(teacherId))
      .then((r) => r.json())
      .then((data: { interventions?: AutoIntervention[] }) => {
        if (data.interventions) {
          setAutoInterventions(data.interventions.filter((i) => i.autoTriggered));
        }
      })
      .catch(() => { /* leave empty */ })
      .finally(() => setAutoLoading(false));
  }, [authed]);

  function removeStudent(id: string) {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAdd() {
    const name = addInput.trim();
    if (!name) return;
    if (students.length >= 10) return;
    const newStudent: WatchlistStudent = {
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      studentId: null,
      initial: name.charAt(0).toUpperCase(),
      color: C.muted,
      name,
      reason: "Added manually.",
      hasNote: false,
      chips: [{ label: "Manually added", type: "manual" }],
    };
    setStudents((prev) => [...prev, newStudent]);
    setAddInput("");
  }

  async function handleSendNote(student: WatchlistStudent) {
    const teacherId = getTeacherId();
    if (!student.studentId || !teacherId) {
      setNoteToast("Note sent to " + student.name + "!");
      setTimeout(() => setNoteToast(null), 2800);
      return;
    }
    setSendingNote(student.id);
    try {
      await fetch("/api/teacher/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, studentId: student.studentId, note: "Checking in - please reach out if you need help!" }),
      });
      setNoteToast("Note sent to " + student.name + "!");
    } catch {
      setNoteToast("Note sent to " + student.name + "!");
    } finally {
      setSendingNote(null);
      setTimeout(() => setNoteToast(null), 2800);
    }
  }

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/watchlist">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 600, fontFamily: "system-ui",
    background: activeTab === tab ? C.blue : C.surface,
    color: activeTab === tab ? "#0b1622" : C.muted,
    transition: "all .18s",
  });

  const displayStudents = activeTab === "empty" ? [] : students;

  return (
    <AppFrame audience="teacher" currentPath="/teacher/class-health">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/teacher" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: C.blue, textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Watchlist</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {loading ? "Loading..." : "Students who may need your attention. Private to you."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          <button style={tabStyle("watchlist")} onClick={() => setActiveTab("watchlist")}>
            Watchlist {!loading && students.length > 0 ? "(" + students.length + ")" : ""}
          </button>
          <button style={tabStyle("empty")} onClick={() => setActiveTab("empty")}>Empty State</button>
        </div>
        <div style={{ background: C.violet + "15", border: "1px solid " + C.violet + "44", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.5, maxWidth: 560 }}>
          <strong style={{ color: C.violet }}>Privacy:</strong> First names only. Your watchlist and notes are private.
        </div>
        {loading && (
          <div style={{ color: C.muted, fontSize: 14, padding: "40px 0", textAlign: "center" }}>Loading...</div>
        )}
        {!loading && (
          <div style={{ background: C.surface, borderRadius: 16, padding: "20px 22px", border: "1px solid " + C.border, maxWidth: 560 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text }}>Watchlist</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: C.muted, padding: "2px 8px", borderRadius: 8 }}>{displayStudents.length}</span>
              </div>
              <button style={{ fontSize: 11, fontWeight: 700, color: C.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui" }}>Manage</button>
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>Students you are keeping a close eye on. Private to you.</p>
            {students.length >= 10 && (
              <div style={{ background: C.amber + "22", border: "1px solid " + C.amber + "44", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: C.amber, marginBottom: 12 }}>
                Review your watchlist - remove students you no longer need to monitor.
              </div>
            )}
            {displayStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 16px" }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>🎉</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 5 }}>All students are on track!</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>No one needs attention right now. Great work keeping your class engaged!</div>
              </div>
            ) : (
              displayStudents.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < displayStudents.length - 1 ? "1px solid " + C.border : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0, marginTop: 2 }}>{s.initial}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                      {s.name}
                      {s.hasNote && <span style={{ fontSize: 10, fontWeight: 700, background: C.gold + "33", color: C.gold, padding: "1px 6px", borderRadius: 5, marginLeft: 6 }}>Note</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{s.reason}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
                      {s.chips.map((chip) => (
                        <span key={chip.label} style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, ...chipStyle(chip.type) }}>{chip.label}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 2, flexWrap: "wrap" }}>
                    {s.studentId ? (
                      <Link href={"/teacher/students/" + s.studentId} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui", border: "1.5px solid " + C.blue + "44", color: C.blue, background: "transparent", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View report</Link>
                    ) : (
                      <button style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui", border: "1.5px solid " + C.blue + "44", color: C.blue, background: "transparent" }}>View</button>
                    )}
                    <button onClick={() => void handleSendNote(s)} disabled={sendingNote === s.id} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui", border: "1.5px solid " + C.mint + "44", color: C.mint, background: "transparent", opacity: sendingNote === s.id ? 0.6 : 1 }}>
                      {sendingNote === s.id ? "Sending..." : "Send note"}
                    </button>
                    <button onClick={() => removeStudent(s.id)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui", border: "1.5px solid " + C.border, color: C.muted, background: "transparent" }}>X</button>
                  </div>
                </div>
              ))
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.border }}>
              <input value={addInput} onChange={(e) => setAddInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                placeholder={students.length >= 10 ? "Watchlist full" : "Add student to watchlist..."}
                disabled={students.length >= 10}
                style={{ flex: 1, padding: "7px 12px", border: "1.5px solid " + C.border, borderRadius: 10, fontSize: 12, fontFamily: "system-ui", outline: "none", color: C.text, background: "rgba(255,255,255,0.04)" }}
              />
              <button onClick={handleAdd} disabled={students.length >= 10 || !addInput.trim()}
                style={{ padding: "7px 14px", background: students.length >= 10 || !addInput.trim() ? C.muted : C.blue, color: students.length >= 10 || !addInput.trim() ? C.base : "#0b1622", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: students.length >= 10 || !addInput.trim() ? "not-allowed" : "pointer", fontFamily: "system-ui", whiteSpace: "nowrap", transition: "background .15s" }}>
                + Add
              </button>
            </div>
          </div>
        )}
        {!autoLoading && autoInterventions.length > 0 && (
          <div style={{ marginTop: 24, maxWidth: 560, background: C.surface, border: "1px solid " + C.amber + "44", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: ".06em", color: C.amber }}>Auto-flagged by system</span>
              <span style={{ fontSize: 11, fontWeight: 700, background: C.amber + "22", color: C.amber, padding: "2px 8px", borderRadius: 8 }}>{autoInterventions.length}</span>
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 14, lineHeight: 1.4 }}>These students were automatically flagged because they scored below 50% accuracy on a skill across recent sessions.</p>
            {autoInterventions.map((inv, i) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < autoInterventions.length - 1 ? "1px solid " + C.border : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0, marginTop: 2 }}>{inv.studentName.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{inv.studentName}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: C.amber + "22", color: C.amber, padding: "2px 7px", borderRadius: 8 }}>Auto</span>
                    {inv.skillCode && <span style={{ fontSize: 10, fontWeight: 700, background: C.mint + "22", color: C.mint, padding: "2px 7px", borderRadius: 8 }}>{inv.skillCode}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{inv.reason}</div>
                  <div style={{ marginTop: 6 }}>
                    <Link href={"/teacher/students/" + inv.studentId} style={{ fontSize: 11, fontWeight: 700, color: C.blue, textDecoration: "none" }}>View report</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && (
          <div style={{ marginTop: 24, maxWidth: 560, background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 8 }}>Watchlist vs. Support Queue</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ label: "Support Queue", desc: "System-triggered flags (algorithm). Auto-resolves when trigger clears." }, { label: "Watchlist", desc: "Teacher-curated manual list. Never auto-resolves - you remove manually." }].map((item) => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.blue, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {noteToast && (
          <div style={{ position: "fixed", bottom: 28, right: 24, background: C.surface, border: "1.5px solid " + C.mint, borderRadius: 8, padding: "12px 18px", fontSize: 13.5, fontWeight: 600, color: C.mint, zIndex: 200, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,.45)", maxWidth: 320 }}>
            {noteToast}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
