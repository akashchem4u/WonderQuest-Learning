"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#0d1117",
  card: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  green: "#50e890",
  greenBg: "rgba(80,232,144,0.12)",
  amber: "#f0a030",
  amberBg: "rgba(240,160,48,0.12)",
  violet: "#a78bfa",
  violetBg: "rgba(167,139,250,0.12)",
  gray: "#8b949e",
  grayBg: "rgba(139,148,158,0.12)",
  red: "#f87171",
  redBg: "rgba(248,113,113,0.12)",
};

interface ContentEvent {
  id: string;
  title: string;
  content_type: string;
  status: string;
  statusLabel: string;
  statusColor: "green" | "amber" | "violet" | "gray";
  scheduled_at: string;
  assigned_to: string;
  release_version: string;
  notes: string;
  calDay: number;
}

const EVENTS: ContentEvent[] = [
  {
    id: "evt-1",
    title: "Space Pack — Planet Patrol",
    content_type: "theme_pack",
    status: "scheduled",
    statusLabel: "Scheduled",
    statusColor: "green",
    scheduled_at: "Apr 1, 2026 09:00",
    assigned_to: "Maya Chen",
    release_version: "v2.5.1",
    notes: "Includes 8 new planet-themed activities. Child safety sign-off completed 2026-03-18.",
    calDay: 1,
  },
  {
    id: "evt-2",
    title: "P3 Social Studies Quest Batch",
    content_type: "quest_batch",
    status: "in_review",
    statusLabel: "In Review",
    statusColor: "amber",
    scheduled_at: "Apr 7, 2026 10:00",
    assigned_to: "Jordan Lee",
    release_version: "v2.5.2",
    notes: "P3 batch — community helpers unit. Awaiting curriculum review.",
    calDay: 7,
  },
  {
    id: "evt-3",
    title: "v2.6 System Update",
    content_type: "system_update",
    status: "approved",
    statusLabel: "Approved",
    statusColor: "violet",
    scheduled_at: "Apr 10, 2026 02:00",
    assigned_to: "Sam Rivera",
    release_version: "v2.6.0",
    notes: "Maintenance window 2–4 AM. Performance improvements + new teacher command center features.",
    calDay: 10,
  },
  {
    id: "evt-4",
    title: "Ocean Adventure — Deep Sea Pack",
    content_type: "theme_pack",
    status: "draft",
    statusLabel: "Draft",
    statusColor: "gray",
    scheduled_at: "Apr 15, 2026 09:00",
    assigned_to: "Priya Nair",
    release_version: "v2.5.3",
    notes: "Deep sea theme. Child safety review not yet started.",
    calDay: 15,
  },
  {
    id: "evt-5",
    title: "P0 Reading Quest Batch Q2",
    content_type: "quest_batch",
    status: "scheduled",
    statusLabel: "Scheduled",
    statusColor: "green",
    scheduled_at: "Apr 22, 2026 09:00",
    assigned_to: "Maya Chen",
    release_version: "v2.5.4",
    notes: "P0 priority — requires Owner approval before advancing. Owner sign-off received 2026-04-01.",
    calDay: 22,
  },
  {
    id: "evt-6",
    title: "Arts Pack — Sketch Lab",
    content_type: "theme_pack",
    status: "in_review",
    statusLabel: "In Review",
    statusColor: "amber",
    scheduled_at: "Apr 28, 2026 09:00",
    assigned_to: "Jordan Lee",
    release_version: "v2.5.5",
    notes: "Creative arts theme — Sketch Lab activities. Awaiting child safety review.",
    calDay: 28,
  },
];

// April 2026: starts on Wednesday (index 2 in Mon-Sun week)
const MONTH_OFFSET = 2; // Mon=0, so Wed=2
const MONTH_DAYS = 30;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type TabType = "calendar" | "list";

function chipStyle(color: "green" | "amber" | "violet" | "gray" | "red"): React.CSSProperties {
  const map = {
    green: { background: C.greenBg, color: C.green },
    amber: { background: C.amberBg, color: C.amber },
    violet: { background: C.violetBg, color: C.violet },
    gray: { background: C.grayBg, color: C.gray },
    red: { background: C.redBg, color: C.red },
  };
  return { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" as const, ...map[color] };
}

function eventBtnStyle(color: "green" | "amber" | "violet" | "gray"): React.CSSProperties {
  const borderMap = { green: "rgba(80,232,144,0.2)", amber: "rgba(240,160,48,0.2)", violet: "rgba(167,139,250,0.2)", gray: "rgba(139,148,158,0.2)" };
  const bgMap = { green: C.greenBg, amber: C.amberBg, violet: C.violetBg, gray: C.grayBg };
  const textMap = { green: C.green, amber: C.amber, violet: C.violet, gray: C.gray };
  return { borderRadius: 5, padding: "4px 7px", fontSize: 11, fontWeight: 500, marginBottom: 3, cursor: "pointer", lineHeight: 1.35, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis", minHeight: 28, display: "flex", alignItems: "center", border: `1px solid ${borderMap[color]}`, background: bgMap[color], color: textMap[color], width: "100%", textAlign: "left" as const };
}

export default function ContentCalendarPage() {
  const [tab, setTab] = useState<TabType>("calendar");
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [detailNotes, setDetailNotes] = useState<Record<string, string>>({});

  const openEvent = openEventId ? EVENTS.find((e) => e.id === openEventId) : null;

  // Build calendar cells: empty prefix + days 1..30 + empty suffix
  const totalCells = MONTH_OFFSET + MONTH_DAYS;
  const rows = Math.ceil(totalCells / 7);
  const paddedCells = rows * 7;

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    background: "none",
    border: "none",
    borderBottom: `2px solid ${active ? C.green : "transparent"}`,
    padding: "10px 18px",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 500,
    color: active ? C.green : C.muted,
    cursor: "pointer",
    marginBottom: -1,
    minHeight: 44,
  });

  const filterTypes = [
    { key: "all", label: "All" },
    { key: "theme_pack", label: "Theme Packs" },
    { key: "quest_batch", label: "Quest Batches" },
    { key: "system_update", label: "System Updates" },
    { key: "band_update", label: "Band Updates" },
  ];

  const filteredEvents = filterType === "all" ? EVENTS : EVENTS.filter((e) => e.content_type === filterType);

  return (
    <AppFrame audience="owner" currentPath="/owner/content-calendar">
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.base, color: C.text, minHeight: "100vh", lineHeight: 1.5 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px 64px" }}>
          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>Content Publish Calendar</h1>
            <p style={{ fontSize: 14, color: C.muted }}>Schedule and track theme packs, quest batches, band updates, and system releases.</p>
          </div>

          {/* Tab nav */}
          <nav style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 28 }}>
            <button style={tabBtnStyle(tab === "calendar")} onClick={() => setTab("calendar")}>Calendar</button>
            <button style={tabBtnStyle(tab === "list")} onClick={() => setTab("list")}>List View</button>
          </nav>

          {/* ─── Calendar Tab ─── */}
          {tab === "calendar" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <button style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted, fontSize: 16 }}>←</button>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>April 2026</h2>
                <button style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted, fontSize: 16 }}>→</button>
              </div>

              {/* Calendar grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: C.border, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
                {/* Day labels */}
                {DAY_LABELS.map((d) => (
                  <div key={d} style={{ background: C.card, padding: "10px 8px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, textAlign: "center" }}>{d}</div>
                ))}
                {/* Cells */}
                {Array.from({ length: paddedCells }).map((_, idx) => {
                  const dayNum = idx - MONTH_OFFSET + 1;
                  const isEmpty = dayNum < 1 || dayNum > MONTH_DAYS;
                  const eventsForDay = EVENTS.filter((e) => e.calDay === dayNum);
                  return (
                    <div key={idx} style={{ background: isEmpty ? "rgba(13,17,23,0.7)" : C.card, minHeight: 100, padding: 8, verticalAlign: "top", position: "relative" }}>
                      {!isEmpty && (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{dayNum}</div>
                          {eventsForDay.map((evt) => (
                            <button key={evt.id} style={eventBtnStyle(evt.statusColor)} onClick={() => setOpenEventId(openEventId === evt.id ? null : evt.id)}>
                              {evt.title}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detail panel */}
              {openEvent && (
                <div style={{ marginTop: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{openEvent.title}</h3>
                      <span style={chipStyle(openEvent.statusColor)}>{openEvent.statusLabel}</span>
                    </div>
                    <button onClick={() => setOpenEventId(null)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>✕</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
                    {[
                      { label: "Content Type", val: openEvent.content_type.replace("_", " ") },
                      { label: "Scheduled At", val: openEvent.scheduled_at },
                      { label: "Assigned To", val: openEvent.assigned_to },
                      { label: "Release Version", val: openEvent.release_version },
                    ].map((f) => (
                      <div key={f.label}>
                        <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, display: "block", marginBottom: 5 }}>{f.label}</label>
                        <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{f.val}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 6 }}>Notes</p>
                  <textarea
                    value={detailNotes[openEvent.id] ?? openEvent.notes}
                    onChange={(e) => setDetailNotes((prev) => ({ ...prev, [openEvent.id]: e.target.value }))}
                    style={{ width: "100%", background: C.base, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontFamily: "inherit", fontSize: 14, color: C.text, resize: "vertical", minHeight: 72, marginBottom: 16 }}
                    placeholder="Add notes for this release..."
                  />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "0 20px", height: 44, borderRadius: 8, cursor: "pointer", background: C.greenBg, color: C.green, border: `1px solid rgba(80,232,144,0.25)`, display: "inline-flex", alignItems: "center", gap: 7 }}>✓ Approve</button>
                    <button style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "0 20px", height: 44, borderRadius: 8, cursor: "pointer", background: C.redBg, color: C.red, border: `1px solid rgba(248,113,113,0.25)`, display: "inline-flex", alignItems: "center", gap: 7 }}>↻ Defer</button>
                    <button onClick={() => setOpenEventId(null)} style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "0 20px", height: 44, borderRadius: 8, cursor: "pointer", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center", gap: 7 }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── List Tab ─── */}
          {tab === "list" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {filterTypes.map((f) => (
                    <button key={f.key} onClick={() => setFilterType(f.key)} style={{ background: filterType === f.key ? C.greenBg : C.card, border: `1px solid ${filterType === f.key ? "rgba(80,232,144,0.3)" : C.border}`, borderRadius: 20, padding: "6px 14px", fontFamily: "inherit", fontSize: 12, fontWeight: 500, color: filterType === f.key ? C.green : C.muted, cursor: "pointer", minHeight: 36, display: "flex", alignItems: "center" }}>{f.label}</button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${C.border}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Title", "Content Type", "Status", "Scheduled At", "Assigned To", "Release Version"].map((h) => (
                        <th key={h} style={{ background: C.card, padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((evt, i) => (
                      <tr key={evt.id} style={{ borderBottom: i < filteredEvents.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: C.text, fontWeight: 500 }}>{evt.title}</td>
                        <td style={{ padding: "13px 16px", fontSize: 11, fontWeight: 600, color: C.muted, fontFamily: "'Courier New', monospace" }}>{evt.content_type}</td>
                        <td style={{ padding: "13px 16px" }}><span style={chipStyle(evt.statusColor)}>{evt.statusLabel}</span></td>
                        <td style={{ padding: "13px 16px", fontSize: 12, color: C.muted }}>{evt.scheduled_at}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: C.text }}>{evt.assigned_to}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: C.text }}>{evt.release_version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
