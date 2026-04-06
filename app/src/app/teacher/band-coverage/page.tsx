"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  blue: "#38bdf8",
  text: "#f0f6ff",
  muted: "#8b949e",
} as const;

interface Band {
  id: string;
  label: string;
  range: string;
  color: string;
  count: number;
  pct: number;
  students: Student[];
}

interface Student {
  name: string;
  stars: number;
  status: "Active" | "Queue" | "Ceiling";
}

const BANDS: Band[] = [
  {
    id: "P0", label: "P0", range: "Pre-K", color: "#ffd166", count: 2, pct: 7,
    students: [
      { name: "Fiona", stars: 12, status: "Active" },
      { name: "George", stars: 9, status: "Active" },
    ],
  },
  {
    id: "P1", label: "P1", range: "K–1", color: "#9b72ff", count: 7, pct: 25,
    students: [
      { name: "Divya", stars: 22, status: "Active" },
      { name: "Hassan", stars: 18, status: "Active" },
      { name: "Isabel", stars: 15, status: "Queue" },
      { name: "+4 more", stars: 0, status: "Active" },
    ],
  },
  {
    id: "P2", label: "P2", range: "G2–3", color: "#58e8c1", count: 14, pct: 50,
    students: [
      { name: "Aarav", stars: 38, status: "Active" },
      { name: "Carlos", stars: 28, status: "Active" },
      { name: "Ethan", stars: 34, status: "Active" },
      { name: "Jordan", stars: 14, status: "Queue" },
      { name: "Marcus", stars: 48, status: "Ceiling" },
      { name: "+9 more", stars: 0, status: "Active" },
    ],
  },
  {
    id: "P3", label: "P3", range: "G4–5", color: "#ff7b6b", count: 5, pct: 18,
    students: [
      { name: "Bella", stars: 52, status: "Active" },
      { name: "Luna", stars: 44, status: "Active" },
      { name: "Noah", stars: 41, status: "Active" },
      { name: "+2 more", stars: 0, status: "Active" },
    ],
  },
];

const WIDE_STUDENTS: Record<string, { name: string; initial: string; color: string }[]> = {
  P0: [
    { name: "Fiona", initial: "F", color: "#ffd166" },
    { name: "George", initial: "G", color: "#e0a800" },
  ],
  P1: [
    { name: "Divya", initial: "D", color: "#9b72ff" },
    { name: "Hassan", initial: "H", color: "#7c3aed" },
    { name: "Isabel", initial: "I", color: "#6d28d9" },
  ],
  P2: [
    { name: "Aarav", initial: "A", color: "#58e8c1" },
    { name: "Carlos", initial: "C", color: "#10b981" },
    { name: "Ethan", initial: "E", color: "#059669" },
  ],
  P3: [
    { name: "Bella", initial: "B", color: "#ff7b6b" },
    { name: "Luna", initial: "L", color: "#ef4444" },
    { name: "Noah", initial: "N", color: "#dc2626" },
  ],
};

const WIDE_MORE: Record<string, number> = { P0: 0, P1: 4, P2: 11, P3: 2 };
const WIDE_LABEL_COLOR: Record<string, string> = { P0: "#b8860b", P1: "#6d3fcf", P2: "#0d9065", P3: "#c0392b" };
const WIDE_BG: Record<string, string> = { P0: "rgba(255,209,102,0.06)", P1: "rgba(155,114,255,0.06)", P2: "rgba(88,232,193,0.05)", P3: "rgba(255,123,107,0.06)" };

function statusStyle(s: Student["status"]): React.CSSProperties {
  if (s === "Active") return { background: "rgba(34,197,94,0.12)", color: "#15803d" };
  if (s === "Queue") return { background: "rgba(254,243,199,0.8)", color: "#92400e" };
  return { background: "rgba(56,189,248,0.12)", color: "#0369a1" };
}

function statusLabel(s: Student["status"]) {
  if (s === "Active") return "Active";
  if (s === "Queue") return "⚠ Queue";
  return "💙 Ceiling";
}

export default function BandCoveragePage() {
  const [activeView, setActiveView] = useState<"standard" | "expanded" | "wide" | "spec">("standard");
  const [expandedBand, setExpandedBand] = useState<string | null>(null);

  function toggleBand(id: string) {
    setExpandedBand((prev) => (prev === id ? null : id));
  }

  return (
    <AppFrame audience="teacher">
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 0 48px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Band Coverage</h1>
          <p style={{ fontSize: 13, color: C.muted }}>Distribution of students across P0–P3 learning bands</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
          {(["standard", "expanded", "wide", "spec"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              style={{
                padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: activeView === v ? C.blue : C.surface,
                color: activeView === v ? C.base : C.muted,
                transition: "all 0.18s",
              }}
            >
              {v === "standard" ? "Standard" : v === "expanded" ? "Expanded Band" : v === "wide" ? "Wide Grid" : "Spec"}
            </button>
          ))}
        </div>

        {/* STANDARD VIEW */}
        {activeView === "standard" && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>Standard — horizontal bar distribution</p>
            <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 440, display: "inline-block" }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1440", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                Band coverage
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "none", letterSpacing: 0, cursor: "pointer" }}>Details →</span>
              </div>
              {BANDS.map((band, i) => (
                <div key={band.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderBottom: i < BANDS.length - 1 ? "1px solid #f5f7fa" : "none", borderRadius: 6, margin: "0 -6px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: band.color, flexShrink: 0 }} />
                  <div style={{ minWidth: 80 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1440" }}>{band.label}</div>
                    <div style={{ fontSize: 10, color: "#aaa" }}>{band.range}</div>
                  </div>
                  <div style={{ flex: 1, height: 8, background: "#f0f4f8", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, background: band.color, width: `${band.pct}%`, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1440", minWidth: 32, textAlign: "right" }}>{band.count}</div>
                  <div style={{ fontSize: 10, color: "#aaa", minWidth: 32, textAlign: "right" }}>{band.pct}%</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14, paddingTop: 12, borderTop: "1px solid #f5f7fa" }}>
                {BANDS.map((b) => (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555", fontWeight: 600 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color }} />
                    {b.label} {b.range}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EXPANDED VIEW */}
        {activeView === "expanded" && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>Click any band row to expand and see students in that band</p>
            <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 480 }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1440", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                Band coverage
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "none", letterSpacing: 0, cursor: "pointer" }}>Details →</span>
              </div>
              {BANDS.map((band) => {
                const isExpanded = expandedBand === band.id;
                return (
                  <div key={band.id}>
                    <div
                      onClick={() => toggleBand(band.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 6px",
                        borderBottom: "1px solid #f5f7fa", borderRadius: 6, margin: "0 -6px",
                        cursor: "pointer", background: isExpanded ? "#f8faff" : "transparent",
                      }}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: band.color, flexShrink: 0 }} />
                      <div style={{ minWidth: 80 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1440" }}>{band.label}{isExpanded ? " ▾" : ""}</div>
                        <div style={{ fontSize: 10, color: "#aaa" }}>{band.range}</div>
                      </div>
                      <div style={{ flex: 1, height: 8, background: "#f0f4f8", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 4, background: band.color, width: `${band.pct}%` }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#1a1440", minWidth: 32, textAlign: "right" }}>{band.count}</div>
                      <div style={{ fontSize: 10, color: "#aaa", minWidth: 32, textAlign: "right" }}>{band.pct}%</div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "6px 10px 8px 26px", display: "flex", flexDirection: "column", gap: 3 }}>
                        {band.students.filter((s) => !s.name.startsWith("+")).map((st) => (
                          <div key={st.name} style={{ background: "#f0f4f8", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#444", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: band.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                              {st.name[0]}
                            </div>
                            <span style={{ fontWeight: 700, flex: 1 }}>{st.name}</span>
                            <span style={{ color: "#888" }}>⭐ {st.stars}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 6, ...statusStyle(st.status) }}>{statusLabel(st.status)}</span>
                          </div>
                        ))}
                        {band.students.filter((s) => s.name.startsWith("+")).map((st) => (
                          <div key={st.name} style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, padding: "2px 0 0 28px", cursor: "pointer" }}>{st.name} students</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WIDE GRID VIEW */}
        {activeView === "wide" && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>Wide grid variant — 4-quadrant layout with student names</p>
            <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 700 }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1440", marginBottom: 14 }}>Band coverage — Class 4B (28 students)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {BANDS.map((band) => {
                  const wideStudents = WIDE_STUDENTS[band.id] || [];
                  const moreCount = WIDE_MORE[band.id];
                  const labelColor = WIDE_LABEL_COLOR[band.id];
                  const bg = WIDE_BG[band.id];
                  return (
                    <div key={band.id} style={{ padding: 12, borderRadius: 10, background: bg }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: band.color }} />
                        <div style={{ fontSize: 13, fontWeight: 800, color: labelColor }}>{band.label} — {band.range}</div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#1a1440", marginBottom: 4 }}>{band.count}</div>
                      <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>students · {band.pct}%</div>
                      {wideStudents.map((st) => (
                        <div key={st.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: 11 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: st.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                            {st.initial}
                          </div>
                          {st.name}
                        </div>
                      ))}
                      {moreCount > 0 && (
                        <div style={{ fontSize: 11, color: labelColor, fontWeight: 700, marginTop: 4, cursor: "pointer" }}>+{moreCount} more</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SPEC VIEW */}
        {activeView === "spec" && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 18 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.blue, marginBottom: 14 }}>Component Info</h2>
              <div style={{ fontSize: 12, color: "rgba(240,246,255,0.65)", lineHeight: 1.7 }}>
                <p style={{ marginBottom: 8 }}><strong style={{ color: C.text }}>Component:</strong> teacher-band-coverage-card-v2</p>
                <p style={{ marginBottom: 8 }}><strong style={{ color: C.text }}>Data source:</strong> /api/teacher/band-coverage — returns counts per band for class</p>
                <p style={{ marginBottom: 8 }}><strong style={{ color: C.text }}>Placement:</strong> Embedded in teacher home (right col), command center, analytics pages</p>
                <p style={{ marginBottom: 8 }}><strong style={{ color: C.text }}>Variants:</strong> Standard (horizontal bar list) | Expanded drill (click band → shows students) | Wide grid (4-quadrant with student names)</p>
                <p><strong style={{ color: C.text }}>Interaction:</strong> Click any band row to expand and see which students are in that band (first names only, FERPA). Only one band expanded at a time.</p>
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 18 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.blue, marginBottom: 14 }}>Band Definitions</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Band", "Grade range", "Colour"].map((h) => (
                        <th key={h} style={{ background: "rgba(255,255,255,0.03)", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BANDS.map((b, i, arr) => (
                      <tr key={b.id} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <td style={{ padding: "8px 12px", color: C.text, fontWeight: 700 }}>{b.label}</td>
                        <td style={{ padding: "8px 12px", color: C.text }}>{b.range}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 12, height: 12, borderRadius: "50%", background: b.color, display: "inline-block" }} />
                            <span style={{ color: C.muted }}>{b.color}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.blue, marginBottom: 14 }}>Privacy</h2>
              <div style={{ fontSize: 12, color: "rgba(240,246,255,0.65)", lineHeight: 1.7 }}>
                Expanded student list: first names only, stars count (whole number), status dot/chip. No accuracy %, no mastery scores, no parent info. Queue indicator (⚠) is acceptable — teacher needs this to cross-reference.
              </div>
              <div style={{ marginTop: 14, background: "rgba(255,123,107,0.06)", border: "1px solid rgba(255,123,107,0.25)", borderRadius: 10, padding: "14px 16px", fontSize: 12, color: "rgba(240,246,255,0.65)", lineHeight: 1.6 }}>
                <strong style={{ color: "#ff7b6b" }}>FERPA: </strong>Student data visible to teacher of own class only. First names only in expanded views.
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
