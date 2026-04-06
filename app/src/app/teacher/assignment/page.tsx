"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
} as const;

type Step = 1 | 2 | 3 | 4;

const SKILLS = [
  { id: "blending", name: "Blending sounds", subject: "Reading", band: "K-1" },
  { id: "skip-counting", name: "Skip counting", subject: "Math", band: "K-1" },
  { id: "sight-words", name: "Sight words", subject: "Reading", band: "K-1" },
  { id: "addition", name: "Single-digit addition", subject: "Math", band: "G2-3" },
  { id: "fractions", name: "Fractions", subject: "Math", band: "G4-5" },
  { id: "main-idea", name: "Main idea & details", subject: "Reading", band: "G2-3" },
];

const STUDENTS = ["Bella", "Marcus", "Luna", "Aarav", "Jordan", "Priya", "Sam", "Tyler", "Zoe", "Alex"];

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  skillCodes: string[];
  launchBandCode: string | null;
  sessionMode: string;
  dueDate: string | null;
  createdAt: string;
  assignedCount: number;
  completedCount: number;
};

export default function TeacherAssignmentPage() {
  const [step, setStep] = useState<Step>(1);
  const [assignmentType, setAssignmentType] = useState<"quest" | "skill" | "free">("skill");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set(STUDENTS));
  const [dueDate, setDueDate] = useState("2026-04-13");
  const [title, setTitle] = useState("");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const STEPS = [
    { n: 1, label: "Type" },
    { n: 2, label: "Content" },
    { n: 3, label: "Students" },
    { n: 4, label: "Review" },
  ];

  // Fetch existing assignments on mount
  function fetchAssignments() {
    setLoadingList(true);
    fetch("/api/teacher/assignments?teacherId=demo-teacher")
      .then((r) => r.json())
      .then((data: { assignments?: Assignment[] }) => {
        setAssignments(data.assignments ?? []);
      })
      .catch(() => {
        // Non-fatal — keep empty list
      })
      .finally(() => setLoadingList(false));
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

  function toggleSkill(id: string) {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleStudent(name: string) {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  async function handlePublish() {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const assignmentTitle =
      title.trim() ||
      (assignmentType === "skill"
        ? `Skill Practice — ${[...selectedSkills].map((id) => SKILLS.find((s) => s.id === id)?.name).join(", ") || "Mixed"}`
        : assignmentType === "quest"
        ? "Quest Assignment"
        : "Free Practice");

    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: "demo-teacher",
          title: assignmentTitle,
          skillCodes: [...selectedSkills],
          dueDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to create assignment");
      }

      setSubmitSuccess(true);
      // Reset wizard
      setStep(1);
      setAssignmentType("skill");
      setSelectedSkills(new Set());
      setSelectedStudents(new Set(STUDENTS));
      setDueDate("2026-04-13");
      setTitle("");
      // Refresh list
      fetchAssignments();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div style={{ minHeight: "100vh", background: C.base, padding: "24px 24px 60px", maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ background: "rgba(56,189,248,0.12)", color: C.blue, border: "1px solid rgba(56,189,248,0.25)", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 10px", textTransform: "uppercase", marginRight: 8 }}>Teacher</span>
          <span style={{ fontSize: 11, color: C.muted, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 8px", fontFamily: "monospace" }}>/teacher/assignment/new</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginTop: 8, marginBottom: 2 }}>New Assignment</h1>
          <p style={{ color: C.muted, fontSize: 13 }}>Assign skills or quests to students in Class 4B</p>
        </div>

        {/* Success banner */}
        {submitSuccess && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(80,232,144,0.12)", border: "1px solid rgba(80,232,144,0.35)", borderRadius: 10, fontSize: 13, fontWeight: 700, color: C.mint }}>
            ✓ Assignment published successfully!
          </div>
        )}

        {/* Error banner */}
        {submitError && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13, fontWeight: 700, color: C.red }}>
            {submitError}
          </div>
        )}

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32, overflowX: "auto" }}>
          {STEPS.map((s, i) => {
            const state = step > s.n ? "done" : step === s.n ? "active" : "inactive";
            return (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: state === "done" ? C.blue : state === "active" ? C.mint : "#30363d", color: state === "inactive" ? C.muted : "#0d1117" }}>
                  {state === "done" ? "✓" : s.n}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: state === "active" ? C.mint : state === "done" ? C.blue : C.muted, whiteSpace: "nowrap" }}>{s.label}</span>
                {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: step > s.n ? C.blue : C.border, margin: "0 4px", flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Type */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>What type of assignment?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {[
                { id: "quest" as const, title: "Quest Assignment", desc: "Assign a specific quest from the world map. Students work through it in order.", icon: "🗺️", color: C.violet },
                { id: "skill" as const, title: "Skill Practice", desc: "Assign specific skills to reinforce. Students practice those skills in their next sessions.", icon: "📚", color: C.blue },
                { id: "free" as const, title: "Free Practice", desc: "Students choose their own quests. Great for exploration and building confidence.", icon: "✨", color: C.mint },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setAssignmentType(t.id)}
                  style={{ background: assignmentType === t.id ? `${t.color}18` : C.surface, border: `2px solid ${assignmentType === t.id ? t.color : C.border}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}
                >
                  <span style={{ fontSize: 24 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.desc}</div>
                  </div>
                  <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", border: `2px solid ${assignmentType === t.id ? t.color : C.border}`, background: assignmentType === t.id ? t.color : "transparent", flexShrink: 0, marginTop: 2 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <div>
            {/* Optional title field */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Assignment title (optional)</div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 3 Fractions Practice"
                style={{ width: "100%", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "system-ui", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Select skills to assign</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Students will practice these skills in their next sessions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {SKILLS.map((s) => {
                const selected = selectedSkills.has(s.id);
                return (
                  <div key={s.id} onClick={() => toggleSkill(s.id)} style={{ background: selected ? "rgba(80,232,144,0.06)" : C.surface, border: `1.5px solid ${selected ? C.mint : C.border}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.subject} · {s.band}</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected ? C.mint : C.border}`, background: selected ? C.mint : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#0a1a0a", fontWeight: 900 }}>
                      {selected && "✓"}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Due date */}
            <div style={{ background: C.surface, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Due date</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["2026-04-10", "2026-04-13", "2026-04-17", "2026-04-20"].map((d) => (
                  <button key={d} onClick={() => setDueDate(d)} style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${dueDate === d ? C.blue : C.border}`, background: dueDate === d ? "rgba(56,189,248,0.1)" : "transparent", color: dueDate === d ? C.blue : C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>
                    {new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Students */}
        {step === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Assign to students</div>
                <div style={{ fontSize: 12, color: C.muted }}>{selectedStudents.size} of {STUDENTS.length} selected</div>
              </div>
              <button onClick={() => setSelectedStudents(new Set(STUDENTS))} style={{ fontSize: 11, fontWeight: 700, color: C.blue, background: "none", border: "none", cursor: "pointer" }}>Select all</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 }}>
              {STUDENTS.map((name) => {
                const sel = selectedStudents.has(name);
                return (
                  <div key={name} onClick={() => toggleStudent(name)} style={{ background: sel ? "rgba(56,189,248,0.06)" : C.surface, border: `1.5px solid ${sel ? C.blue : C.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: sel ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: sel ? C.blue : C.muted }}>{name[0]}</div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: sel ? C.text : C.muted, flex: 1 }}>{name}</span>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? C.blue : C.border}`, background: sel ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#0d1117", fontWeight: 900 }}>{sel && "✓"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Review & publish</div>
            <div style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Assignment Summary</div>
              {[
                ["Type", assignmentType === "skill" ? "Skill Practice" : assignmentType === "quest" ? "Quest Assignment" : "Free Practice"],
                ["Skills", selectedSkills.size > 0 ? [...selectedSkills].map((id) => SKILLS.find((s) => s.id === id)?.name).join(", ") : "None selected"],
                ["Due date", new Date(dueDate).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })],
                ["Students", `${selectedStudents.size} of ${STUDENTS.length} students`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span style={{ color: C.muted, fontWeight: 600 }}>{label}</span>
                  <span style={{ color: C.text, fontWeight: 700, maxWidth: "60%", textAlign: "right" }}>{val}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handlePublish}
              disabled={submitting}
              style={{ width: "100%", padding: 14, background: submitting ? "rgba(80,232,144,0.4)" : C.mint, color: "#0a1a0a", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 900, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "system-ui" }}
            >
              {submitting ? "Publishing…" : "✓ Publish Assignment"}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button onClick={() => setStep((s) => (s - 1) as Step)} style={{ flex: 1, padding: 12, background: "rgba(255,255,255,0.06)", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>← Back</button>
          )}
          {step < 4 && (
            <button onClick={() => setStep((s) => (s + 1) as Step)} style={{ flex: 1, padding: 12, background: C.blue, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>Continue →</button>
          )}
        </div>

        {/* Existing assignments list */}
        <div style={{ marginTop: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Existing Assignments
          </div>
          {loadingList ? (
            <div style={{ fontSize: 12, color: C.muted }}>Loading assignments…</div>
          ) : assignments.length === 0 ? (
            <div style={{ fontSize: 12, color: C.muted }}>No assignments yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assignments.map((a) => (
                <div key={a.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {a.skillCodes.length > 0 ? a.skillCodes.join(", ") : "No skills"} ·
                      {a.dueDate ? ` Due ${new Date(a.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}` : " No due date"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{a.completedCount}/{a.assignedCount}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>done</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Link href="/teacher" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>← Dashboard</Link>
          <Link href="/teacher/command" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>Command Center</Link>
        </div>
      </div>
    </AppFrame>
  );
}
