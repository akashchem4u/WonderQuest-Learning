"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  blue: "#38bdf8",
  text: "#f0f6ff",
  muted: "#8b949e",
} as const;

// ── Static band config (colours, labels, wide-grid colours) ──────────────────

interface BandConfig {
  id: string;
  label: string;
  range: string;
  color: string;
  labelColor: string;
  bg: string;
}

const BAND_CONFIG: BandConfig[] = [
  { id: "P0", label: "P0", range: "Pre-K",  color: "#ffd166", labelColor: "#b8860b", bg: "rgba(255,209,102,0.06)" },
  { id: "P1", label: "P1", range: "K–1",    color: "#9b72ff", labelColor: "#6d3fcf", bg: "rgba(155,114,255,0.06)" },
  { id: "P2", label: "P2", range: "G2–3",   color: "#22c55e", labelColor: "#15803d", bg: "rgba(34,197,94,0.06)"   },
  { id: "P3", label: "P3", range: "G4–5",   color: "#ff7b6b", labelColor: "#c0392b", bg: "rgba(255,123,107,0.06)" },
];

// ── Band code normalisation ───────────────────────────────────────────────────

function normaliseBand(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const up = raw.toUpperCase().replace(/[-_\s]/g, "");
  if (up === "PREK" || up === "P0") return "P0";
  if (up === "K1"   || up === "P1") return "P1";
  if (up === "G23"  || up === "P2") return "P2";
  if (up === "G45"  || up === "P3") return "P3";
  return null;
}

// ── Data shape for a live band row ───────────────────────────────────────────

interface LiveBand extends BandConfig {
  count: number;
  pct: number;
}

function buildLiveBands(roster: { launchBandCode?: string }[]): LiveBand[] {
  const counts: Record<string, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const s of roster) {
    const band = normaliseBand(s.launchBandCode);
    if (band) counts[band]++;
  }
  const total = roster.length || 1;
  return BAND_CONFIG.map((bc) => ({
    ...bc,
    count: counts[bc.id],
    pct: Math.round((counts[bc.id] / total) * 100),
  }));
}

// ── Status helpers (expanded view) ───────────────────────────────────────────

type Status = "Active" | "Queue" | "Ceiling";

function statusStyle(s: Status): React.CSSProperties {
  if (s === "Active")  return { background: "rgba(34,197,94,0.12)",  color: "#15803d" };
  if (s === "Queue")   return { background: "rgba(254,243,199,0.8)", color: "#92400e" };
  return { background: "rgba(56,189,248,0.12)", color: "#0369a1" };
}

function statusLabel(s: Status) {
  if (s === "Active")  return "Active";
  if (s === "Queue")   return "⚠ Queue";
  return "💙 Ceiling";
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BandCoveragePage() {
  const [activeView, setActiveView] = useState<"standard" | "expanded" | "wide">("standard");
  const [expandedBand, setExpandedBand] = useState<string | null>(null);
  const [bands, setBands] = useState<LiveBand[]>(buildLiveBands([]));
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherId = getTeacherId();
    fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`)
      .then((r) => r.json())
      .then((data) => {
        const roster: { launchBandCode?: string }[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.students)
          ? data.students
          : [];
        setBands(buildLiveBands(roster));
        setTotalStudents(roster.length);
      })
      .catch(() => {
        // Keep zeroed-out bands on error
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleBand(id: string) {
    setExpandedBand((prev) => (prev === id ? null : id));
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/band-coverage">
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 0 48px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Band Coverage</h1>
          <p style={{ fontSize: 13, color: C.muted }}>
            {loading
              ? "Loading student data…"
              : `Distribution of ${totalStudents} student${totalStudents !== 1 ? "s" : ""} across P0–P3 learning bands`}
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
          {(["standard", "expanded", "wide"] as const).map((v) => (
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
              {v === "standard" ? "Standard" : v === "expanded" ? "Expanded Band" : "Wide Grid"}
            </button>
          ))}
        </div>

        {/* STANDARD VIEW */}
        {activeView === "standard" && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>
              Standard — horizontal bar distribution
            </p>
            <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 440, display: "inline-block" }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1440", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                Band coverage
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "none", letterSpacing: 0, cursor: "pointer" }}>Details →</span>
              </div>
              {bands.map((band, i) => (
                <div key={band.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderBottom: i < bands.length - 1 ? "1px solid #f5f7fa" : "none", borderRadius: 6, margin: "0 -6px" }}>
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
                {bands.map((b) => (
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
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>
              Click any band row to expand and see students in that band
            </p>
            <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 480 }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1440", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                Band coverage
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "none", letterSpacing: 0, cursor: "pointer" }}>Details →</span>
              </div>
              {bands.map((band) => {
                const isExpanded = expandedBand === band.id;
                // Expanded view shows a placeholder student list derived from count
                const placeholderStudents: { name: string; stars: number; status: Status }[] = [];
                if (band.count > 0) {
                  placeholderStudents.push({ name: `${band.label} Student 1`, stars: 0, status: "Active" });
                  if (band.count > 1) placeholderStudents.push({ name: `${band.label} Student 2`, stars: 0, status: "Active" });
                }
                const extraCount = Math.max(0, band.count - placeholderStudents.length);

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
                        {placeholderStudents.map((st) => (
                          <div key={st.name} style={{ background: "#f0f4f8", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#444", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: band.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                              {st.name[0]}
                            </div>
                            <span style={{ fontWeight: 700, flex: 1 }}>{st.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 6, ...statusStyle(st.status) }}>{statusLabel(st.status)}</span>
                          </div>
                        ))}
                        {extraCount > 0 && (
                          <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, padding: "2px 0 0 28px", cursor: "pointer" }}>+{extraCount} more students</div>
                        )}
                        {band.count === 0 && (
                          <div style={{ fontSize: 11, color: "#aaa", padding: "4px 0 0 28px" }}>No students in this band yet</div>
                        )}
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
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 16 }}>
              Wide grid variant — 4-quadrant layout with student counts
            </p>
            <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", maxWidth: 700 }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1440", marginBottom: 14 }}>
                Band coverage — {totalStudents} student{totalStudents !== 1 ? "s" : ""}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {bands.map((band) => (
                  <div key={band.id} style={{ padding: 12, borderRadius: 10, background: band.bg }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: band.color }} />
                      <div style={{ fontSize: 13, fontWeight: 800, color: band.labelColor }}>{band.label} — {band.range}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#1a1440", marginBottom: 4 }}>{band.count}</div>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>
                      student{band.count !== 1 ? "s" : ""} · {band.pct}%
                    </div>
                    <div style={{ height: 6, background: "#e8eaf0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: band.color, width: `${band.pct}%`, transition: "width 0.4s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
