"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  violetDim: "rgba(155,114,255,0.15)",
  violetBorder: "rgba(155,114,255,0.28)",
  mint: "#58e8c1",
  gold: "#ffd166",
  green: "#22c55e",
  surface: "rgba(255,255,255,0.05)",
  surfaceHover: "rgba(155,114,255,0.08)",
  surfaceSelected: "rgba(155,114,255,0.14)",
  border: "rgba(155,114,255,0.18)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  faint: "rgba(255,255,255,0.12)",
} as const;

// ── Stub data ──────────────────────────────────────────────────────────────
type Subject = "reading" | "math";

type Activity = {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  desc: string;
  skill: string;
  subject: Subject;
  duration: string;
};

const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    icon: "📖",
    iconBg: "rgba(88,232,193,0.18)",
    name: "Sound safari walk",
    desc: 'On your next walk, point to 5 things and sound out the first letter together: "tree → /t/". Then blend: "t-r-ee!"',
    skill: "Blending sounds · Reading",
    subject: "reading",
    duration: "5 min",
  },
  {
    id: "a2",
    icon: "📚",
    iconBg: "rgba(88,232,193,0.18)",
    name: "Read-aloud pause game",
    desc: 'Read any picture book and pause on unfamiliar words. Ask Maya "what sound does it start with?" before reading it aloud.',
    skill: "Blending sounds · Reading",
    subject: "reading",
    duration: "10 min",
  },
  {
    id: "a3",
    icon: "🔢",
    iconBg: "rgba(155,114,255,0.18)",
    name: "Skip count the stairs",
    desc: 'Every time you climb stairs together, count by 2s: "2, 4, 6, 8…" — first race to 20. Mix in 5s when she\'s ready.',
    skill: "Skip counting · Math",
    subject: "math",
    duration: "2 min",
  },
  {
    id: "a4",
    icon: "🛒",
    iconBg: "rgba(155,114,255,0.18)",
    name: "Grocery skip count",
    desc: 'At the shop, ask Maya to count items in groups of 2 or 5. "How many apples? Count by 2s!"',
    skill: "Skip counting · Math",
    subject: "math",
    duration: "5 min",
  },
  {
    id: "a5",
    icon: "🎵",
    iconBg: "rgba(255,209,102,0.18)",
    name: "Skip count song",
    desc: 'Look up a "skip counting by 2s" song on YouTube (Numberblocks, etc.) — 3 minutes of silly singing beats a worksheet any day!',
    skill: "Skip counting · Math",
    subject: "math",
    duration: "3 min",
  },
];

type ChecklistItem = {
  id: string;
  name: string;
  subject: string;
  duration: string;
  done: boolean;
  doneDay?: string;
};

const CHECKLIST: ChecklistItem[] = [
  { id: "c1", name: "Sound safari walk", subject: "Reading", duration: "5 min", done: true, doneDay: "Mon" },
  { id: "c2", name: "Skip count the stairs", subject: "Math", duration: "2 min", done: true, doneDay: "Tue" },
  { id: "c3", name: "Read-aloud pause game", subject: "Reading", duration: "10 min", done: false },
];

type FilterChip = "all" | "reading" | "math" | "5min" | "10min";

export default function PlannerPage() {
  const [tab, setTab] = useState<"planner" | "checklist" | "empty">("planner");
  const [filter, setFilter] = useState<FilterChip>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(["a1", "a3"]));
  const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST);

  const toggleActivity = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const filteredActivities = ACTIVITIES.filter((a) => {
    if (filter === "reading") return a.subject === "reading";
    if (filter === "math") return a.subject === "math";
    if (filter === "5min") return a.duration === "5 min" || a.duration === "2 min";
    if (filter === "10min") return a.duration === "10 min";
    return true;
  });

  const savedCount = selected.size;
  const notSavedCount = ACTIVITIES.length - savedCount;
  const totalMinutes = Array.from(selected).reduce((sum, id) => {
    const act = ACTIVITIES.find((a) => a.id === id);
    if (!act) return sum;
    return sum + parseInt(act.duration);
  }, 0);

  const doneCount = checklist.filter((i) => i.done).length;

  const chips: { id: FilterChip; label: string }[] = [
    { id: "all", label: "All" },
    { id: "reading", label: "🌿 Reading" },
    { id: "math", label: "➗ Math" },
    { id: "5min", label: "⏱ 5 min" },
    { id: "10min", label: "⏱ 10 min" },
  ];

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, padding: "28px 24px", maxWidth: 640, margin: "0 auto" }}>

        {/* Back nav */}
        <div style={{ marginBottom: 20 }}>
          <Link href="/parent" style={{ color: C.violet, fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
            ← Home
          </Link>
        </div>

        {/* Page title */}
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>At-home planner</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Offline activity suggestions for Maya — no prep needed</p>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {(["planner", "checklist", "empty"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "system-ui",
                background: tab === t ? C.violet : C.surface,
                color: tab === t ? "#fff" : C.muted,
                transition: "all .18s",
              }}
            >
              {t === "planner" ? "Home Planner" : t === "checklist" ? "Saved Checklist" : "No Activities"}
            </button>
          ))}
        </div>

        {/* ── PLANNER TAB ─────────────────────────────────────────────────── */}
        {tab === "planner" && (
          <div>
            {/* Info banner */}
            <div style={{ background: "rgba(155,114,255,0.12)", borderLeft: "4px solid " + C.violet, borderRadius: "0 10px 10px 0", padding: "12px 16px", fontSize: 13, color: "#c4aaff", lineHeight: 1.5, marginBottom: 20 }}>
              These suggestions are tied to <strong style={{ color: C.violet }}>Blending sounds</strong> and <strong style={{ color: C.violet }}>Skip counting</strong> — skills Maya is building toward this week.
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setFilter(chip.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                    cursor: "pointer",
                    border: filter === chip.id ? "1.5px solid " + C.violet : "1.5px solid " + C.border,
                    background: filter === chip.id ? C.violet : "transparent",
                    color: filter === chip.id ? "#fff" : C.muted,
                    transition: "all .15s",
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Activity list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {filteredActivities.map((act) => {
                const isSel = selected.has(act.id);
                return (
                  <div
                    key={act.id}
                    onClick={() => toggleActivity(act.id)}
                    style={{
                      border: isSel ? "2px solid " + C.violet : "2px solid " + C.border,
                      borderRadius: 14,
                      padding: 16,
                      cursor: "pointer",
                      background: isSel ? C.surfaceSelected : C.surface,
                      transition: "border-color .15s, background .15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      {/* Icon */}
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: act.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {act.icon}
                      </div>
                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{act.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{act.desc}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.violet, marginTop: 4 }}>{act.skill}</div>
                      </div>
                      {/* Duration */}
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, flexShrink: 0 }}>{act.duration}</div>
                      {/* Check circle */}
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: isSel ? "none" : "2px solid " + C.faint, background: isSel ? C.violet : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", flexShrink: 0, marginLeft: 6, transition: "all .15s" }}>
                        {isSel && "✓"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary row */}
            <div style={{ display: "flex", gap: 8, background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 16px", marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>✅ {savedCount} saved · {notSavedCount} not saved</span>
              <span style={{ fontSize: 12, color: C.faint }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>⏱ ~{totalMinutes} min total</span>
            </div>

            {/* CTA */}
            <button
              onClick={() => setTab("checklist")}
              style={{ width: "100%", padding: "14px", background: C.violet, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "system-ui", cursor: "pointer", transition: "opacity .15s" }}
            >
              Save selected to checklist
            </button>
          </div>
        )}

        {/* ── CHECKLIST TAB ───────────────────────────────────────────────── */}
        {tab === "checklist" && (
          <div>
            <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>This week's checklist</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Mar 17–23 · For Maya</div>

              <div style={{ marginBottom: 16 }}>
                {checklist.map((item, i) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 0",
                      borderBottom: i < checklist.length - 1 ? "1px solid " + C.border : "none",
                      cursor: "pointer",
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: item.done ? C.green : "transparent", border: item.done ? "none" : "2px solid " + C.faint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", flexShrink: 0, transition: "all .15s" }}>
                      {item.done && "✓"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.5 : 1 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        {item.subject} · {item.duration} · {item.done ? `Done ${item.doneDay}` : "Not done yet"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Celebratory note */}
              <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#4ade80", lineHeight: 1.5 }}>
                🎉 {doneCount} of {checklist.length} activities done this week! Great support for Maya's learning.
              </div>

              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setTab("planner")}
                  style={{ background: "none", border: "none", color: C.violet, fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0, fontFamily: "system-ui" }}
                >
                  + Add more activities
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EMPTY TAB ───────────────────────────────────────────────────── */}
        {tab === "empty" && (
          <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>At-home practice</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Suggestions based on support areas</div>
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Maya's looking strong this week!</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>No specific support areas to suggest activities for right now. Check back as Maya explores new skills.</div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
