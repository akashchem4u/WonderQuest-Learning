"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#58e8c1",
  gold: "#ffd166",
  green: "#22c55e",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(155,114,255,0.18)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
} as const;

// ── Activity data ──────────────────────────────────────────────────────────
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
    id: "sound-safari",
    icon: "📖",
    iconBg: "rgba(88,232,193,0.15)",
    name: "Sound safari walk",
    desc: "On your next walk, point to 5 things and sound out the first letter together: "tree → /t/". Then blend: "t-r-ee!"",
    skill: "Blending sounds · Reading",
    subject: "reading",
    duration: "5 min",
  },
  {
    id: "read-aloud",
    icon: "📚",
    iconBg: "rgba(88,232,193,0.15)",
    name: "Read-aloud pause game",
    desc: "Read any picture book and pause on unfamiliar words. Ask "what sound does it start with?" before reading it aloud.",
    skill: "Blending sounds · Reading",
    subject: "reading",
    duration: "10 min",
  },
  {
    id: "skip-stairs",
    icon: "🔢",
    iconBg: "rgba(155,114,255,0.15)",
    name: "Skip count the stairs",
    desc: "Every time you climb stairs together, count by 2s: "2, 4, 6, 8…" — first race to 20. Mix in 5s when she's ready.",
    skill: "Skip counting · Math",
    subject: "math",
    duration: "2 min",
  },
  {
    id: "grocery",
    icon: "🛒",
    iconBg: "rgba(155,114,255,0.15)",
    name: "Grocery skip count",
    desc: "At the shop, ask Maya to count items in groups of 2 or 5. "How many apples? Count by 2s!"",
    skill: "Skip counting · Math",
    subject: "math",
    duration: "5 min",
  },
  {
    id: "skip-song",
    icon: "🎵",
    iconBg: "rgba(255,209,102,0.12)",
    name: "Skip count song",
    desc: "Look up a "skip counting by 2s" song on YouTube (Numberblocks, etc.) — 3 minutes of silly singing beats a worksheet any day!",
    skill: "Skip counting · Math",
    subject: "math",
    duration: "3 min",
  },
];

type FilterChip = { id: string; label: string };
const FILTERS: FilterChip[] = [
  { id: "all", label: "All" },
  { id: "reading", label: "🌿 Reading" },
  { id: "math", label: "➗ Math" },
  { id: "5min", label: "⏱ 5 min" },
  { id: "10min", label: "⏱ 10 min" },
];

export default function ParentPracticePage() {
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState<Set<string>>(new Set(["sound-safari", "skip-stairs"]));
  const [tab, setTab] = useState<"planner" | "checklist">("planner");

  const filtered = ACTIVITIES.filter((a) => {
    if (filter === "all") return true;
    if (filter === "reading") return a.subject === "reading";
    if (filter === "math") return a.subject === "math";
    if (filter === "5min") return a.duration === "5 min";
    if (filter === "10min") return a.duration === "10 min";
    return true;
  });

  const savedActivities = ACTIVITIES.filter((a) => saved.has(a.id));
  const totalMins = [...saved].reduce((sum, id) => {
    const a = ACTIVITIES.find((x) => x.id === id);
    return sum + (a ? parseInt(a.duration) : 0);
  }, 0);

  function toggleSaved(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px 60px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 4 }}>
            Parent
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>At-home Practice</h1>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["planner", "checklist"] as const).map((t) => (
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
                background: tab === t ? C.violet : "rgba(255,255,255,0.06)",
                color: tab === t ? "#fff" : C.muted,
                transition: "all .18s",
              }}
            >
              {t === "planner" ? "Activity Suggestions" : "Saved Checklist"}
            </button>
          ))}
        </div>

        {tab === "planner" && (
          <div style={{ maxWidth: 520 }}>
            {/* Info box */}
            <div style={{ background: "rgba(155,114,255,0.1)", borderLeft: `4px solid ${C.violet}`, borderRadius: "0 10px 10px 0", padding: "12px 14px", fontSize: 12, color: "#c4a0ff", lineHeight: 1.5, marginBottom: 16 }}>
              These suggestions are tied to <strong>Blending sounds</strong> and <strong>Skip counting</strong> — skills Maya is building toward this week.
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: `1.5px solid ${filter === f.id ? C.violet : "rgba(155,114,255,0.2)"}`,
                    background: filter === f.id ? C.violet : "transparent",
                    color: filter === f.id ? "#fff" : C.muted,
                    fontFamily: "system-ui",
                    transition: "all .15s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Activity cards */}
            {filtered.map((a) => {
              const isSaved = saved.has(a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => toggleSaved(a.id)}
                  style={{
                    border: `2px solid ${isSaved ? C.violet : "rgba(155,114,255,0.2)"}`,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 10,
                    cursor: "pointer",
                    background: isSaved ? "rgba(155,114,255,0.06)" : "transparent",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: a.iconBg }}>
                      {a.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{a.desc}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.violet, marginTop: 4 }}>{a.skill}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, flexShrink: 0 }}>{a.duration}</div>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${isSaved ? C.violet : "rgba(255,255,255,0.2)"}`,
                      flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11,
                      background: isSaved ? C.violet : "transparent",
                      color: "#fff",
                      transition: "all .15s",
                    }}>
                      {isSaved && "✓"}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div style={{ display: "flex", gap: 8, background: "rgba(155,114,255,0.08)", borderRadius: 12, padding: "12px 14px", marginTop: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>✅ {saved.size} saved · {ACTIVITIES.length - saved.size} not saved</span>
              <span style={{ fontSize: 12, color: C.muted }}>·</span>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>⏱ ~{totalMins} min total</span>
            </div>

            <button
              onClick={() => setTab("checklist")}
              style={{
                width: "100%", padding: 14, background: C.violet, color: "#fff",
                border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                fontFamily: "system-ui", cursor: "pointer", marginTop: 14,
              }}
            >
              Save selected to checklist
            </button>
          </div>
        )}

        {tab === "checklist" && (
          <div style={{ maxWidth: 440 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 22, border: `1px solid rgba(155,114,255,0.15)` }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>This week&apos;s checklist</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Apr 7–13 · For Maya</div>

              {savedActivities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px", color: C.muted }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No activities saved yet</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>Go to Activity Suggestions and tap activities to save them here.</div>
                </div>
              ) : (
                <div style={{ marginBottom: 10 }}>
                  {savedActivities.map((a, i) => (
                    <div
                      key={a.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 0",
                        borderBottom: i < savedActivities.length - 1 ? "1px solid rgba(155,114,255,0.12)" : "none",
                      }}
                    >
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0, cursor: "pointer" }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{a.skill} · {a.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {savedActivities.length > 0 && (
                <div style={{ background: "rgba(88,232,193,0.08)", border: "1px solid rgba(88,232,193,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.mint, lineHeight: 1.5 }}>
                  🎉 {saved.size} {saved.size === 1 ? "activity" : "activities"} saved for this week — great support for Maya!
                </div>
              )}

              <button
                onClick={() => setTab("planner")}
                style={{ marginTop: 14, fontSize: 12, color: C.violet, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                + Add more activities
              </button>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { href: "/parent", label: "← Dashboard" },
            { href: "/parent/report", label: "Weekly Report" },
            { href: "/parent/skills/phonics-blending", label: "Skills" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
