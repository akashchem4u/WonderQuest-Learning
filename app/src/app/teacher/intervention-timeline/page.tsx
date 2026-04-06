"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type EventType = "trigger" | "note" | "mastery" | "system" | "resolve";

type MasteryBar = {
  label: string;
  pct: number;
  color: string;
  score: string;
};

type TimelineEvent = {
  type: EventType;
  icon: string;
  dotBg: string;
  dotBorder: string;
  chipBg: string;
  chipColor: string;
  chipLabel: string;
  date: string;
  title: string;
  detail?: string;
  noteText?: string;
  masteryBars?: MasteryBar[];
};

// ── API shape ─────────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function mapInterventionToEvents(iv: ApiIntervention): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Trigger event
  events.push({
    type: "trigger",
    icon: "⚠️",
    dotBg: "#fef3c7",
    dotBorder: C.amber,
    chipBg: "rgba(245,158,11,0.15)",
    chipColor: "#92400e",
    chipLabel: "⚠️ Trigger",
    date: formatDate(iv.createdAt),
    title: `Support queue triggered — ${iv.reason}`,
    detail: iv.skillCode
      ? `Skill: ${iv.skillCode}. Intervention type: ${iv.interventionType}.`
      : `Intervention type: ${iv.interventionType}.`,
  });

  // Teacher note (if present)
  if (iv.teacherNote) {
    events.push({
      type: "note",
      icon: "🗒️",
      dotBg: "rgba(56,189,248,0.15)",
      dotBorder: C.blue,
      chipBg: "rgba(56,189,248,0.15)",
      chipColor: C.blue,
      chipLabel: "🗒️ Teacher note",
      date: formatDate(iv.createdAt),
      title: "Teacher note logged",
      noteText: iv.teacherNote,
    });
  }

  // Resolution event (if resolved)
  if (iv.status === "resolved" && iv.resolvedAt) {
    events.push({
      type: "resolve",
      icon: "✅",
      dotBg: "rgba(34,197,94,0.15)",
      dotBorder: C.mint,
      chipBg: "rgba(34,197,94,0.15)",
      chipColor: C.mint,
      chipLabel: "✅ Resolved",
      date: formatDate(iv.resolvedAt),
      title: "Intervention resolved",
      detail: iv.resolutionNote ?? "Marked resolved by teacher.",
    });
  }

  return events;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function InterventionTimelinePage() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<"full" | "resolved">("full");
  const [activeInterventions, setActiveInterventions] = useState<ApiIntervention[]>([]);
  const [resolvedInterventions, setResolvedInterventions] = useState<ApiIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  useEffect(() => {
    if (!authed) return;
    const teacherId = getTeacherId();

    const url = `/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=all`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { interventions: ApiIntervention[] }) => {
        const all = data.interventions ?? [];
        setActiveInterventions(all.filter((iv) => iv.status === "active"));
        setResolvedInterventions(all.filter((iv) => iv.status === "resolved"));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) {
    return (
      <AppFrame audience="teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  const currentInterventions =
    activeTab === "full" ? activeInterventions : resolvedInterventions;

  // Build flat event list from all interventions for the current tab
  const events: (TimelineEvent & { studentName: string; interventionId: string })[] =
    currentInterventions.flatMap((iv) =>
      mapInterventionToEvents(iv).map((ev) => ({
        ...ev,
        studentName: iv.studentName,
        interventionId: iv.id,
      }))
    );

  return (
    <AppFrame audience="teacher">
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Page heading */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.blue, letterSpacing: "-0.3px", marginBottom: 4 }}>Intervention Timeline</div>
            <div style={{ fontSize: 13, color: C.muted }}>
              {loading
                ? "Loading interventions…"
                : error
                ? "Could not load interventions"
                : `${activeInterventions.length} active · ${resolvedInterventions.length} resolved`}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
            {(["full", "resolved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === tab ? C.blue : C.muted,
                  borderBottom: activeTab === tab ? `2px solid ${C.blue}` : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {tab === "full" ? "Active Timeline" : "Resolved History"}
              </button>
            ))}
          </div>

          {/* Loading spinner */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.muted, padding: "20px 0" }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                border: `2px solid ${C.blue}`, borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
              }} />
              Loading…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "20px 24px", color: C.muted, fontSize: 13,
            }}>
              ⚠️ Could not load intervention data. Please refresh and try again.
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && events.length === 0 && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "32px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>
                {activeTab === "full" ? "✅" : "📂"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                {activeTab === "full" ? "No active interventions" : "No resolved interventions"}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {activeTab === "full"
                  ? "All students are on track. Nice work!"
                  : "Resolved interventions will appear here once closed."}
              </div>
            </div>
          )}

          {/* Timeline cards — one per intervention */}
          {!loading && !error && currentInterventions.map((iv) => {
            const ivEvents = mapInterventionToEvents(iv);
            const isActive = iv.status === "active";
            const statusLabel = isActive ? "⚠️ Active" : "✅ Resolved";
            const statusBg = isActive ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)";
            const statusColor = isActive ? "#92400e" : C.mint;
            const subtitle = isActive
              ? `Started ${formatDate(iv.createdAt)}`
              : `Resolved ${iv.resolvedAt ? formatDate(iv.resolvedAt) : "—"}`;

            return (
              <div
                key={iv.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: "22px 24px",
                  maxWidth: 620,
                  marginBottom: 20,
                }}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>
                      {iv.studentName}{iv.skillCode ? ` — ${iv.skillCode}` : ""}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{subtitle}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: statusBg, color: statusColor, flexShrink: 0 }}>
                    {statusLabel}
                  </span>
                </div>

                {/* Timeline events */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {ivEvents.map((ev, idx) => (
                    <div key={`${iv.id}-${ev.date}-${ev.title}`} style={{ display: "flex", gap: 14, paddingBottom: idx < ivEvents.length - 1 ? 20 : 0, position: "relative" }}>
                      {idx < ivEvents.length - 1 && (
                        <div style={{ position: "absolute", left: 17, top: 34, bottom: 0, width: 2, background: C.border }} />
                      )}
                      {/* Dot */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, zIndex: 1, position: "relative",
                          background: ev.dotBg, border: `2px solid ${ev.dotBorder}`,
                        }}>
                          {ev.icon}
                        </div>
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{ev.date}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: ev.detail || ev.noteText || ev.masteryBars ? 5 : 0 }}>{ev.title}</div>
                        {ev.detail && (
                          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: ev.noteText || ev.masteryBars ? 8 : 0 }}>{ev.detail}</div>
                        )}
                        {ev.noteText && (
                          <div style={{ background: "rgba(56,189,248,0.06)", borderRadius: 8, padding: "9px 11px", fontSize: 11, color: C.muted, lineHeight: 1.5, marginTop: 8, borderLeft: `3px solid ${C.blue}` }}>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: C.blue, letterSpacing: "0.06em", marginBottom: 4 }}>Teacher note</div>
                            {ev.noteText}
                          </div>
                        )}
                        {ev.masteryBars && ev.masteryBars.map((bar) => (
                          <div key={bar.label} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                            <div style={{ fontSize: 11, color: C.muted, minWidth: 36 }}>{bar.label}</div>
                            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${bar.pct}%`, height: "100%", background: bar.color, borderRadius: 3 }} />
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 800, minWidth: 38, color: bar.color }}>{bar.score}</div>
                          </div>
                        ))}
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, marginTop: 5, background: ev.chipBg, color: ev.chipColor }}>
                          {ev.chipLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div style={{ marginTop: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 12 }}>Timeline Event Types</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { icon: "⚠️", label: "Trigger", bg: "rgba(245,158,11,0.15)", color: "#92400e" },
                { icon: "🗒️", label: "Teacher note", bg: "rgba(56,189,248,0.15)", color: C.blue },
                { icon: "📈", label: "Mastery transition", bg: "rgba(34,197,94,0.15)", color: C.mint },
                { icon: "⚙️", label: "System adjustment", bg: "rgba(255,255,255,0.06)", color: C.muted },
                { icon: "✅", label: "Resolution", bg: "rgba(34,197,94,0.15)", color: C.mint },
              ].map((leg) => (
                <span key={leg.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px", borderRadius: 20, background: leg.bg, color: leg.color, fontWeight: 600 }}>
                  {leg.icon} {leg.label}
                </span>
              ))}
            </div>
          </div>

          {/* Privacy note */}
          <div style={{ marginTop: 16, fontSize: 12, color: C.muted, background: "rgba(56,189,248,0.05)", border: `1px solid rgba(56,189,248,0.12)`, borderRadius: 8, padding: "10px 14px", lineHeight: 1.6 }}>
            🔒 Teacher notes are private to you. No accuracy %, wrong answers, or session-level data is shown in this timeline.
            Resolved interventions are archived for 90 days, then anonymised.
          </div>

          {/* Back link */}
          <div style={{ marginTop: 20 }}>
            <a href="/teacher/support" style={{ fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: "none" }}>← Back to Support</a>
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
