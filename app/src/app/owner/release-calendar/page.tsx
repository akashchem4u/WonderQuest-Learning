"use client";

import { AppFrame } from "@/components/app-frame";
import { useState } from "react";

const BASE    = "#100b2e";
const SURFACE = "#161b22";
const SURFACE2 = "#010409";
const BORDER  = "rgba(255,255,255,0.06)";
const VIOLET  = "#9b72ff";
const MINT    = "#50e890";
const AMBER   = "#f59e0b";
const RED     = "#f85149";
const TEAL    = "#58e8c1";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(255,255,255,0.4)";

// ── Stub calendar data ─────────────────────────────────────────────────────

type EventType = "release" | "hotfix" | "freeze" | "review" | "postmortem";

interface CalEvent {
  label: string;
  type: EventType;
}

interface CalDay {
  day: number;
  otherMonth?: boolean;
  today?: boolean;
  events: CalEvent[];
}

const EVENT_STYLES: Record<EventType, { bg: string; color: string }> = {
  release:    { bg: "rgba(80,232,144,0.2)",  color: MINT },
  hotfix:     { bg: "rgba(248,81,73,0.15)",  color: RED },
  freeze:     { bg: "rgba(155,114,255,0.15)", color: VIOLET },
  review:     { bg: "rgba(245,158,11,0.12)", color: AMBER },
  postmortem: { bg: "rgba(88,232,193,0.1)",  color: TEAL },
};

const CALENDAR_DAYS: CalDay[] = [
  // Week 1
  { day: 31, otherMonth: true, events: [] },
  { day: 1,  events: [{ label: "❄ Code Freeze v2.6", type: "freeze" }] },
  { day: 2,  events: [] },
  { day: 3,  events: [] },
  { day: 4,  events: [{ label: "📋 Curriculum review", type: "review" }] },
  { day: 5,  otherMonth: true, events: [] },
  { day: 6,  otherMonth: true, events: [] },
  // Week 2
  { day: 7,  events: [] },
  { day: 8,  events: [] },
  { day: 9,  events: [] },
  { day: 10, events: [{ label: "🔍 Post-mortem PD-4412", type: "postmortem" }] },
  { day: 11, events: [{ label: "📋 Gate review: Q cat", type: "review" }] },
  { day: 12, otherMonth: true, events: [] },
  { day: 13, otherMonth: true, events: [] },
  // Week 3
  { day: 14, events: [{ label: "❄ Feature freeze", type: "freeze" }] },
  { day: 15, events: [] },
  { day: 16, today: true, events: [{ label: "🔧 Hotfix v2.5.2?", type: "hotfix" }] },
  { day: 17, events: [] },
  { day: 18, events: [] },
  { day: 19, otherMonth: true, events: [] },
  { day: 20, otherMonth: true, events: [] },
  // Week 4
  { day: 21, events: [{ label: "📋 Release gate run", type: "review" }] },
  { day: 22, events: [{ label: "📋 Gate review", type: "review" }] },
  { day: 23, events: [] },
  { day: 24, events: [] },
  { day: 25, events: [{ label: "🚀 v2.6 Planned", type: "release" }] },
  { day: 26, otherMonth: true, events: [] },
  { day: 27, otherMonth: true, events: [] },
  // Week 5
  { day: 28, events: [] },
  { day: 29, events: [] },
  { day: 30, events: [] },
  { day: 1,  otherMonth: true, events: [] },
  { day: 2,  otherMonth: true, events: [] },
  { day: 3,  otherMonth: true, events: [] },
  { day: 4,  otherMonth: true, events: [] },
];

const UPCOMING = [
  {
    date: "Apr 16",
    type: "hotfix" as EventType,
    typeLabel: "Hotfix?",
    title: "Hotfix v2.5.2 — Assignment engine edge case",
    sub: "Tentative — depends on investigation. Will be confirmed or cancelled by Apr 15.",
  },
  {
    date: "Apr 21",
    type: "review" as EventType,
    typeLabel: "Review",
    title: "v2.6 Release Gate Run #1",
    sub: "First full gate check. Expected score: 82/100 (1 blocker: P3 content). Resolve by Apr 22.",
  },
  {
    date: "Apr 25",
    type: "release" as EventType,
    typeLabel: "Release",
    title: "v2.6 \"Band Expansion\" — Planned Launch",
    sub: "P3 G4–5 content expansion (+40 skills). Bulk assignment tool. Parent PDF export. Gate required ≥ 90.",
  },
];

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function OwnerReleaseCalendarPage() {
  const [month, setMonth] = useState("April 2026");

  return (
    <AppFrame audience="owner">
      <div style={{ background: BASE, minHeight: "100vh", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: TEXT, marginBottom: 24 }}>
            📅 Release Calendar
          </h1>

          <div style={{
            background: "#0d1117",
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${BORDER}`,
          }}>
            {/* Header */}
            <div style={{
              background: SURFACE2,
              padding: "0 24px",
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    color: MUTED,
                    padding: "4px 9px",
                    borderRadius: 5,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                  }}>‹</button>
                  <button style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    color: MUTED,
                    padding: "4px 9px",
                    borderRadius: 5,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                  }}>›</button>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{month}</span>
                <button style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  color: MUTED,
                  padding: "4px 9px",
                  borderRadius: 5,
                  fontSize: 10,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                }}>Today</button>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: MINT, cursor: "pointer" }}>+ Add Event</div>
            </div>

            {/* Calendar grid */}
            <div style={{ padding: "16px 24px" }}>
              {/* Day of week headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0, marginBottom: 4 }}>
                {DOW.map((d) => (
                  <div key={d} style={{
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "rgba(255,255,255,0.25)",
                    padding: "4px 0",
                  }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
                {CALENDAR_DAYS.map((day, i) => (
                  <div key={i} style={{
                    minHeight: 80,
                    background: day.today ? "rgba(80,232,144,0.04)" : SURFACE,
                    borderRadius: 6,
                    padding: 6,
                    border: day.today
                      ? "1px solid rgba(80,232,144,0.3)"
                      : "1px solid rgba(255,255,255,0.04)",
                    opacity: day.otherMonth ? 0.3 : 1,
                  }}>
                    <div style={{
                      fontSize: day.today ? 12 : 11,
                      fontWeight: day.today ? 900 : 700,
                      color: day.today ? MINT : MUTED,
                      marginBottom: 4,
                    }}>{day.day}</div>
                    {day.events.map((ev, j) => (
                      <div key={j} style={{
                        borderRadius: 4,
                        padding: "2px 5px",
                        fontSize: 9,
                        fontWeight: 700,
                        marginBottom: 2,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        background: EVENT_STYLES[ev.type].bg,
                        color: EVENT_STYLES[ev.type].color,
                      }}>{ev.label}</div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 10,
                paddingTop: 10,
                borderTop: `1px solid ${BORDER}`,
              }}>
                {[
                  { label: "Release",        color: "rgba(80,232,144,0.5)" },
                  { label: "Hotfix",         color: "rgba(248,81,73,0.5)" },
                  { label: "Code Freeze",    color: "rgba(155,114,255,0.5)" },
                  { label: "Review / Gate",  color: "rgba(245,158,11,0.5)" },
                  { label: "Post-Mortem",    color: "rgba(88,232,193,0.5)" },
                ].map((lg) => (
                  <div key={lg.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: MUTED }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: lg.color, flexShrink: 0 }} />
                    {lg.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming list */}
            <div style={{ padding: "0 24px 20px" }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: MUTED,
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: `1px solid ${BORDER}`,
              }}>Upcoming Events</div>
              {UPCOMING.map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < UPCOMING.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, minWidth: 80, flexShrink: 0 }}>{item.date}</div>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 1,
                    background: EVENT_STYLES[item.type].bg,
                    color: EVENT_STYLES[item.type].color,
                  }}>{item.typeLabel}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
