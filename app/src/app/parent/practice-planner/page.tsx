"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  violetDim: "rgba(155,114,255,0.14)",
  violetBorder: "rgba(155,114,255,0.28)",
  mint: "#22c55e",
  mintDim: "rgba(34,197,94,0.12)",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  faint: "rgba(255,255,255,0.08)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────
type Subject = "reading" | "math" | "all";

type Activity = {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  desc: string;
  skill: string;
  subject: "reading" | "math";
  duration: string;
};

// ── Stub Data ──────────────────────────────────────────────────────────────
const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    icon: "📖",
    iconBg: "rgba(34,197,94,0.14)",
    name: "Sound safari walk",
    desc: "On your next walk, point to 5 things and sound out the first letter together: \"tree → /t/\". Then blend: \"t-r-ee!\"",
    skill: "Blending sounds · Reading",
    subject: "reading",
    duration: "5 min",
  },
  {
    id: "a2",
    icon: "📚",
    iconBg: "rgba(34,197,94,0.14)",
    name: "Read-aloud pause game",
    desc: "Read any picture book and pause on unfamiliar words. Ask Maya \"what sound does it start with?\" before reading it aloud.",
    skill: "Blending sounds · Reading",
    subject: "reading",
    duration: "10 min",
  },
  {
    id: "a3",
    icon: "🔢",
    iconBg: "rgba(155,114,255,0.14)",
    name: "Skip count the stairs",
    desc: "Every time you climb stairs together, count by 2s: \"2, 4, 6, 8…\" — first race to 20. Mix in 5s when she's ready.",
    skill: "Skip counting · Math",
    subject: "math",
    duration: "2 min",
  },
  {
    id: "a4",
    icon: "🛒",
    iconBg: "rgba(155,114,255,0.14)",
    name: "Grocery skip count",
    desc: "At the shop, ask Maya to count items in groups of 2 or 5. \"How many apples? Count by 2s!\"",
    skill: "Skip counting · Math",
    subject: "math",
    duration: "5 min",
  },
  {
    id: "a5",
    icon: "🎵",
    iconBg: "rgba(245,158,11,0.14)",
    name: "Skip count song",
    desc: "Look up a \"skip counting by 2s\" song on YouTube (Numberblocks, etc.) — 3 minutes of silly singing beats a worksheet any day!",
    skill: "Skip counting · Math",
    subject: "math",
    duration: "3 min",
  },
];

const CHECKLIST = [
  { name: "Sound safari walk", subject: "Reading", duration: "5 min", done: true, doneDay: "Mon" },
  { name: "Skip count the stairs", subject: "Math", duration: "2 min", done: true, doneDay: "Tue" },
  { name: "Read-aloud pause game", subject: "Reading", duration: "10 min", done: false, doneDay: "" },
];

type Tab = "planner" | "checklist" | "empty";

export default function PracticePlannerPage() {
  const [tab, setTab] = useState<Tab>("planner");
  const [subject, setSubject] = useState<Subject>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(["a1", "a3"]));

  const tabs: { id: Tab; label: string }[] = [
    { id: "planner", label: "Activity Suggestions" },
    { id: "checklist", label: "Saved Checklist" },
    { id: "empty", label: "All Skills Strong" },
  ];

  const subjectFilters: { id: Subject; label: string }[] = [
    { id: "all", label: "All" },
    { id: "reading", label: "🌿 Reading" },
    { id: "math", label: "➗ Math" },
  ];

  const filteredActivities = ACTIVITIES.filter((a) => subject === "all" || a.subject === subject);

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalMins = Array.from(selected).reduce((acc, id) => {
    const act = ACTIVITIES.find((a) => a.id === id);
    if (!act) return acc;
    return acc + parseInt(act.duration, 10);
  }, 0);

  return (
    <AppFrame audience="parent">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        {/* Page header */}
        <div style={{ marginBottom: 24, maxWidth: 680 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>At-Home Practice</div>
          <div style={{ fontSize: 14, color: C.muted }}>Ideas to support Maya's learning this week — no prep needed</div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", maxWidth: 680 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: tab === t.id ? `1.5px solid ${C.violet}` : `1.5px solid ${C.border}`,
                background: tab === t.id ? C.violetDim : C.surfaceAlt,
                color: tab === t.id ? C.violet : C.muted,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui",
                transition: "all .15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Planner tab ───────────────────────────────────────────── */}
        {tab === "planner" && (
          <div style={{ maxWidth: 560 }}>
            {/* Info banner */}
            <div style={{ background: C.violetDim, borderLeft: `4px solid ${C.violet}`, borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#c4b5fd", lineHeight: 1.55 }}>
              These suggestions are tied to <strong style={{ color: C.violet }}>Blending sounds</strong> and <strong style={{ color: C.violet }}>Skip counting</strong> — skills Maya is building toward this week.
            </div>

            {/* Subject filter chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {subjectFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSubject(f.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: subject === f.id ? `1.5px solid ${C.violet}` : `1.5px solid ${C.border}`,
                    background: subject === f.id ? C.violetDim : C.surfaceAlt,
                    color: subject === f.id ? C.violet : C.muted,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                    transition: "all .15s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Activity cards */}
            {filteredActivities.map((act) => {
              const isSel = selected.has(act.id);
              return (
                <div
                  key={act.id}
                  onClick={() => toggleSelected(act.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    background: isSel ? C.violetDim : C.surface,
                    border: `1.5px solid ${isSel ? C.violetBorder : C.border}`,
                    borderRadius: 14,
                    padding: "16px 18px",
                    marginBottom: 10,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: act.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{act.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{act.name}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{act.desc}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.violet, marginTop: 5 }}>{act.skill}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{act.duration}</span>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      border: `2px solid ${isSel ? C.violet : C.faint}`,
                      background: isSel ? C.violet : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#fff",
                      transition: "all .15s",
                    }}>
                      {isSel ? "✓" : ""}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Summary row */}
            <div style={{ display: "flex", gap: 14, background: C.violetDim, borderRadius: 12, padding: "12px 16px", marginTop: 4, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>✅ {selected.size} saved · {ACTIVITIES.length - selected.size} not saved</span>
              <span style={{ fontSize: 12, color: C.muted }}>·</span>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>⏱ ~{totalMins} min total</span>
            </div>

            <button style={{ width: "100%", padding: "14px 16px", background: C.violet, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>
              Save selected to checklist
            </button>
          </div>
        )}

        {/* ── Checklist tab ─────────────────────────────────────────── */}
        {tab === "checklist" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: C.surface, borderRadius: 16, padding: 22, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>This week's checklist</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Mar 17–23 · For Maya</div>

              {CHECKLIST.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < CHECKLIST.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    background: item.done ? C.mint : "transparent",
                    border: item.done ? "none" : `2px solid ${C.faint}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: "#fff", flexShrink: 0, cursor: "pointer",
                  }}>
                    {item.done ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.55 : 1 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {item.subject} · {item.duration} {item.done ? `· Done ${item.doneDay}` : "· Not done yet"}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ background: C.mintDim, borderRadius: 10, padding: "10px 14px", marginTop: 16, fontSize: 12, color: "#4ade80", lineHeight: 1.55 }}>
                🎉 2 of 3 activities done this week! Great support for Maya's learning.
              </div>

              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 12, color: C.violet, fontWeight: 700, cursor: "pointer" }}>+ Add more activities</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty tab ─────────────────────────────────────────────── */}
        {tab === "empty" && (
          <div style={{ maxWidth: 420 }}>
            <div style={{ background: C.surface, borderRadius: 16, padding: 22, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>At-home practice</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Suggestions based on support areas</div>

              <div style={{ textAlign: "center", padding: "24px 16px" }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🌟</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>Maya's looking strong this week!</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>No specific support areas to suggest activities for right now. Check back as Maya explores new skills.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
