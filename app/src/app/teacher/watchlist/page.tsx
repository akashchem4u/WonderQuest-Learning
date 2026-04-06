"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Design tokens ───────────────────────────────────────────────────────────
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

// ── Types ───────────────────────────────────────────────────────────────────
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

type WatchlistStudent = {
  id: string;
  initial: string;
  color: string;
  name: string;
  reason: string;
  hasNote: boolean;
  chips: { label: string; type: "manual" | "band" | "violet" | "advance" }[];
};

function chipStyle(type: WatchlistStudent["chips"][0]["type"]): React.CSSProperties {
  if (type === "manual") return { background: C.blue + "22", color: C.blue };
  if (type === "band") return { background: C.mint + "22", color: C.mint };
  if (type === "violet") return { background: C.violet + "22", color: C.violet };
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
    initial: inv.studentName.charAt(0).toUpperCase(),
    color,
    name: inv.studentName,
    reason: inv.reason,
    hasNote: !!inv.teacherNote,
    chips,
  };
}

// ── Page component ──────────────────────────────────────────────────────────
export default function TeacherWatchlistPage() {
  const [students, setStudents] = useState<WatchlistStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState("");
  const [activeTab, setActiveTab] = useState<"watchlist" | "empty">("watchlist");

  useEffect(() => {
    const teacherId = localStorage.getItem("wq_teacher_id") ?? "demo-teacher";
    fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=active`)
      .then((r) => r.json())
      .then((data: { interventions?: ApiIntervention[] }) => {
        if (data.interventions) {
          setStudents(data.interventions.map((inv, i) => interventionToWatchlist(inv, i)));
        }
      })
      .catch(() => {/* leave empty */})
      .finally(() => setLoading(false));
  }, []);

  function removeStudent(id: string) {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAdd() {
    const name = addInput.trim();
    if (!name) return;
    if (students.length >= 10) return;
    const newStudent: WatchlistStudent = {
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
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

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "system-ui",
    background: activeTab === tab ? C.blue : C.surface,
    color: activeTab === tab ? "#0b1622" : C.muted,
    transition: "all .18s",
  });

  const displayStudents = activeTab === "empty" ? [] : students;

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px" }}>

        {/* Back nav */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/teacher"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: C.blue,
              textDecoration: "none",
            }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>👁 Watchlist</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {loading ? "Loading…" : "Students you are keeping a close eye on. Private to you — not visible to students or parents."}
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          <button style={tabStyle("watchlist")} onClick={() => setActiveTab("watchlist")}>
            Watchlist {!loading && students.length > 0 && `(${students.length})`}
          </button>
          <button style={tabStyle("empty")} onClick={() => setActiveTab("empty")}>
            Empty State
          </button>
        </div>

        {/* Privacy note */}
        <div style={{
          background: C.violet + "15",
          border: `1px solid ${C.violet}44`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          color: C.muted,
          marginBottom: 20,
          lineHeight: 1.5,
          maxWidth: 560,
        }}>
          <strong style={{ color: C.violet }}>Privacy:</strong> First names only. Your watchlist and notes are private — not shared with parents, students, or other teachers.
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ color: C.muted, fontSize: 14, padding: "40px 0", textAlign: "center" }}>
            Loading interventions…
          </div>
        )}

        {/* Watchlist panel */}
        {!loading && (
          <div style={{
            background: C.surface,
            borderRadius: 16,
            padding: "20px 22px",
            border: `1px solid ${C.border}`,
            maxWidth: 560,
          }}>
            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.text }}>
                  👁 Watchlist
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: "rgba(255,255,255,0.08)",
                  color: C.muted,
                  padding: "2px 8px",
                  borderRadius: 8,
                }}>{displayStudents.length}</span>
              </div>
              <button style={{
                fontSize: 11, fontWeight: 700, color: C.blue, background: "none",
                border: "none", cursor: "pointer", fontFamily: "system-ui",
              }}>Manage</button>
            </div>

            {/* Hint */}
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>
              Students you are keeping a close eye on. Private to you — not visible to students or parents.
            </p>

            {/* Capacity warning */}
            {students.length >= 10 && (
              <div style={{
                background: C.amber + "22",
                border: `1px solid ${C.amber}44`,
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 11,
                color: C.amber,
                marginBottom: 12,
              }}>
                ⚠ Review your watchlist — remove students you no longer need to monitor.
              </div>
            )}

            {/* Student rows or empty state */}
            {displayStudents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 16px" }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>👁</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 5 }}>No students on your watchlist</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                  Add students you want to monitor closely. Your watchlist is private — not visible to students or parents.
                </div>
              </div>
            ) : (
              displayStudents.map((s, i) => (
                <div key={s.id} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: i < displayStudents.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: s.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0, marginTop: 2,
                  }}>{s.initial}</div>

                  {/* Body */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
                      {s.name}
                      {s.hasNote && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          background: C.gold + "33",
                          color: C.gold,
                          padding: "1px 6px",
                          borderRadius: 5,
                          marginLeft: 6,
                        }}>📝 Note</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{s.reason}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
                      {s.chips.map((chip) => (
                        <span key={chip.label} style={{
                          fontSize: 10, fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 8,
                          ...chipStyle(chip.type),
                        }}>{chip.label}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 2 }}>
                    <button style={{
                      padding: "5px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "system-ui",
                      border: `1.5px solid ${C.blue}44`,
                      color: C.blue,
                      background: "transparent",
                    }}>View</button>
                    <button
                      onClick={() => removeStudent(s.id)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "system-ui",
                        border: `1.5px solid ${C.border}`,
                        color: C.muted,
                        background: "transparent",
                      }}>✕</button>
                  </div>
                </div>
              ))
            )}

            {/* Add row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${C.border}`,
            }}>
              <input
                value={addInput}
                onChange={(e) => setAddInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                placeholder={students.length >= 10 ? "Watchlist full — remove a student first" : "Add student to watchlist…"}
                disabled={students.length >= 10}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "system-ui",
                  outline: "none",
                  color: C.text,
                  background: "rgba(255,255,255,0.04)",
                }}
              />
              <button
                onClick={handleAdd}
                disabled={students.length >= 10 || !addInput.trim()}
                style={{
                  padding: "7px 14px",
                  background: students.length >= 10 || !addInput.trim() ? C.muted : C.blue,
                  color: students.length >= 10 || !addInput.trim() ? C.base : "#0b1622",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: students.length >= 10 || !addInput.trim() ? "not-allowed" : "pointer",
                  fontFamily: "system-ui",
                  whiteSpace: "nowrap",
                  transition: "background .15s",
                }}
              >+ Add</button>
            </div>
          </div>
        )}

        {/* Distinction note */}
        {!loading && (
          <div style={{
            marginTop: 24,
            maxWidth: 560,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "14px 18px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 8 }}>Watchlist vs. Support Queue</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Support Queue", desc: "System-triggered flags (algorithm). Auto-resolves when trigger clears." },
                { label: "Watchlist", desc: "Teacher-curated manual list. Never auto-resolves — you remove manually." },
              ].map((item) => (
                <div key={item.label} style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.blue, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppFrame>
  );
}
