"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

// ── API types ──────────────────────────────────────────────────────────────

type SkillProgress = {
  skillCode: string;
  skillName: string;
  subjectCode: string;
  launchBandCode: string;
  correctCount: number;
  totalCount: number;
  masteryPct: number;
  lastPracticed: string | null;
};

// ── Derived types ──────────────────────────────────────────────────────────

type Subject = "reading" | "math" | "general";

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

type ChecklistItem = {
  id: string;
  name: string;
  subject: string;
  duration: string;
  done: boolean;
  doneDay?: string;
};

type FilterChip = "all" | "reading" | "math" | "5min" | "10min";

// ── Activity templates (keyed by skill name patterns) ─────────────────────

const READING_ACTIVITIES: Activity[] = [
  {
    id: "r1",
    icon: "📖",
    iconBg: "rgba(88,232,193,0.18)",
    name: "Sound safari walk",
    desc: 'On your next walk, point to 5 things and sound out the first letter together: "tree → /t/". Then blend: "t-r-ee!"',
    skill: "Phonics · Reading",
    subject: "reading",
    duration: "5 min",
  },
  {
    id: "r2",
    icon: "📚",
    iconBg: "rgba(88,232,193,0.18)",
    name: "Read-aloud pause game",
    desc: "Read any picture book and pause on unfamiliar words. Ask them what sound it starts with before reading it aloud.",
    skill: "Blending · Reading",
    subject: "reading",
    duration: "10 min",
  },
  {
    id: "r3",
    icon: "🎵",
    iconBg: "rgba(88,232,193,0.18)",
    name: "Rhyme game in the car",
    desc: 'Play "I say cat, you say a word that rhymes!" Nursery rhymes at bedtime also reinforce these patterns naturally.',
    skill: "Rhyming · Reading",
    subject: "reading",
    duration: "5 min",
  },
];

const MATH_ACTIVITIES: Activity[] = [
  {
    id: "m1",
    icon: "🔢",
    iconBg: "rgba(155,114,255,0.18)",
    name: "Skip count the stairs",
    desc: 'Every time you climb stairs together, count by 2s: "2, 4, 6, 8…" — race to 20. Mix in 5s when ready.',
    skill: "Skip counting · Math",
    subject: "math",
    duration: "2 min",
  },
  {
    id: "m2",
    icon: "🛒",
    iconBg: "rgba(155,114,255,0.18)",
    name: "Grocery skip count",
    desc: 'At the shop, ask them to count items in groups of 2 or 5. "How many apples? Count by 2s!"',
    skill: "Skip counting · Math",
    subject: "math",
    duration: "5 min",
  },
  {
    id: "m3",
    icon: "🎲",
    iconBg: "rgba(155,114,255,0.18)",
    name: "Dice addition game",
    desc: "Roll two dice and race to add the numbers first. Keep score with tally marks — great real-world addition practice.",
    skill: "Addition · Math",
    subject: "math",
    duration: "10 min",
  },
];

const FALLBACK_ACTIVITIES: Activity[] = [
  ...READING_ACTIVITIES.slice(0, 2),
  ...MATH_ACTIVITIES.slice(0, 2),
  {
    id: "g1",
    icon: "🎵",
    iconBg: "rgba(255,209,102,0.18)",
    name: "Skip count song",
    desc: 'Look up a "skip counting by 2s" song on YouTube (Numberblocks, etc.) — 3 minutes of silly singing beats a worksheet any day!',
    skill: "General · Learning",
    subject: "general",
    duration: "3 min",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function buildActivities(skills: SkillProgress[]): Activity[] {
  const needsPractice = skills.filter((s) => s.masteryPct < 70);
  if (needsPractice.length === 0) return [];

  const hasReading = needsPractice.some(
    (s) => s.subjectCode?.toLowerCase().includes("read") ||
           s.subjectCode?.toLowerCase().includes("phonics") ||
           s.subjectCode?.toLowerCase().includes("spell") ||
           s.subjectCode?.toLowerCase().includes("vocab"),
  );
  const hasMath = needsPractice.some(
    (s) => s.subjectCode?.toLowerCase().includes("math") ||
           s.subjectCode?.toLowerCase().includes("number"),
  );

  const acts: Activity[] = [];
  if (hasReading) acts.push(...READING_ACTIVITIES);
  if (hasMath) acts.push(...MATH_ACTIVITIES);
  if (acts.length === 0) acts.push(...FALLBACK_ACTIVITIES);
  return acts;
}

function buildBannerSkills(skills: SkillProgress[]): string[] {
  return skills
    .filter((s) => s.masteryPct < 70)
    .slice(0, 2)
    .map((s) => s.skillName);
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const [tab, setTab] = useState<"planner" | "checklist" | "empty">("planner");
  const [filter, setFilter] = useState<FilterChip>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bannerSkills, setBannerSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId =
      typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
    if (!studentId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/parent/skills?studentId=${encodeURIComponent(studentId)}`).then((r) => r.json()),
      fetch(`/api/parent/report?studentId=${encodeURIComponent(studentId)}&weekOffset=0`).then((r) => r.json()),
    ])
      .then(([skillData]) => {
        const skills: SkillProgress[] = skillData.skills ?? [];
        const acts = buildActivities(skills);
        const banner = buildBannerSkills(skills);
        setActivities(acts);
        setBannerSkills(banner);
        // Pre-select first two activities
        if (acts.length >= 2) {
          setSelected(new Set([acts[0].id, acts[1].id]));
        }
        // If no activities, switch to empty tab
        if (acts.length === 0) {
          setTab("empty");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const handleSaveChecklist = () => {
    const items: ChecklistItem[] = Array.from(selected)
      .map((id) => activities.find((a) => a.id === id))
      .filter((a): a is Activity => Boolean(a))
      .map((a) => ({
        id: a.id,
        name: a.name,
        subject: a.subject.charAt(0).toUpperCase() + a.subject.slice(1),
        duration: a.duration,
        done: false,
      }));
    setChecklist(items);
    setTab("checklist");
  };

  const filteredActivities = activities.filter((a) => {
    if (filter === "reading") return a.subject === "reading";
    if (filter === "math") return a.subject === "math";
    if (filter === "5min") return a.duration === "5 min" || a.duration === "2 min" || a.duration === "3 min";
    if (filter === "10min") return a.duration === "10 min";
    return true;
  });

  const savedCount = selected.size;
  const notSavedCount = activities.length - savedCount;
  const totalMinutes = Array.from(selected).reduce((sum, id) => {
    const act = activities.find((a) => a.id === id);
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
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Offline activity suggestions based on skills that need practice — no prep needed</p>

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

        {/* ── LOADING ─────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: 22, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: C.muted, padding: "32px 0" }}>Loading planner data…</div>
          </div>
        )}

        {/* ── PLANNER TAB ─────────────────────────────────────────────────── */}
        {!loading && tab === "planner" && (
          <div>
            {/* Info banner */}
            <div style={{ background: "rgba(155,114,255,0.12)", borderLeft: "4px solid " + C.violet, borderRadius: "0 10px 10px 0", padding: "12px 16px", fontSize: 13, color: "#c4aaff", lineHeight: 1.5, marginBottom: 20 }}>
              {bannerSkills.length > 0 ? (
                <>
                  These suggestions are tied to{" "}
                  {bannerSkills.map((name, i) => (
                    <span key={name}>
                      <strong style={{ color: C.violet }}>{name}</strong>
                      {i < bannerSkills.length - 1 ? " and " : ""}
                    </span>
                  ))}{" "}
                  — skills that need more practice this week.
                </>
              ) : (
                "These suggestions can help reinforce skills your child is building."
              )}
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
              onClick={handleSaveChecklist}
              style={{ width: "100%", padding: "14px", background: C.violet, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "system-ui", cursor: "pointer", transition: "opacity .15s" }}
            >
              Save selected to checklist
            </button>
          </div>
        )}

        {/* ── CHECKLIST TAB ───────────────────────────────────────────────── */}
        {!loading && tab === "checklist" && (
          <div>
            <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>This week's checklist</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Saved activities for your child</div>

              {checklist.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: C.muted, fontSize: 13 }}>
                  No activities saved yet — go to Home Planner to pick some!
                </div>
              ) : (
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
                          {item.subject} · {item.duration} · {item.done ? `Done` : "Not done yet"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Celebratory note */}
              {checklist.length > 0 && (
                <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#4ade80", lineHeight: 1.5 }}>
                  🎉 {doneCount} of {checklist.length} activities done this week! Great support for your child's learning.
                </div>
              )}

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
        {!loading && tab === "empty" && (
          <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>At-home practice</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Suggestions based on support areas</div>
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Looking strong this week!</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>No specific support areas to suggest activities for right now. Check back as new skills are explored.</div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
