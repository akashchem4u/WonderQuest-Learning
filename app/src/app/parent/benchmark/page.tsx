"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const VIOLET  = "#9b72ff";
const MINT    = "#50e890";
const GOLD    = "#ffd166";
const AMBER   = "#f59e0b";
const TEXT    = "#f0f6ff";
const MUTED   = "#8b949e";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";
const VBORDER = "rgba(155,114,255,0.2)";

// ─── Types ────────────────────────────────────────────────────────────────────

type LinkedChild = {
  id: string;
  displayName: string;
  avatarKey?: string;
  launchBandCode?: string;
};

type ParentSession = {
  linkedChildren: LinkedChild[];
  linkedChild?: LinkedChild;
};

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

// ─── Band definitions ─────────────────────────────────────────────────────────

type BandDef = {
  code: string;
  label: string;
  grades: string;
  color: string;
  bg: string;
  border: string;
  domains: DomainDef[];
};

type DomainDef = {
  name: string;
  icon: string;
  expectedSkills: string[];
};

const BANDS: BandDef[] = [
  {
    code: "PREK",
    label: "Pre-K",
    grades: "Ages 4–5",
    color: GOLD,
    bg: "rgba(255,209,102,0.08)",
    border: "rgba(255,209,102,0.3)",
    domains: [
      { name: "Reading", icon: "📖", expectedSkills: ["Letter recognition", "Phonics foundations", "Rhyming words", "Print concepts"] },
      { name: "Math", icon: "🔢", expectedSkills: ["Counting to 20", "Number recognition", "Shape identification", "Comparing sizes"] },
    ],
  },
  {
    code: "K1",
    label: "Kindergarten–Grade 1",
    grades: "Ages 5–7",
    color: VIOLET,
    bg: "rgba(155,114,255,0.08)",
    border: "rgba(155,114,255,0.3)",
    domains: [
      { name: "Reading", icon: "📖", expectedSkills: ["Sight words (Dolch list)", "Blending CVC words", "Decoding consonant blends", "Basic spelling patterns"] },
      { name: "Math", icon: "🔢", expectedSkills: ["Addition facts to 10", "Subtraction facts", "Place value (tens/ones)", "Measurement basics"] },
    ],
  },
  {
    code: "G23",
    label: "Grades 2–3",
    grades: "Ages 7–9",
    color: MINT,
    bg: "rgba(80,232,144,0.07)",
    border: "rgba(80,232,144,0.25)",
    domains: [
      { name: "Reading", icon: "📖", expectedSkills: ["Reading fluency", "Vocabulary expansion", "Comprehension strategies", "Multi-syllabic words"] },
      { name: "Math", icon: "🔢", expectedSkills: ["Multi-digit addition/subtraction", "Multiplication facts", "Division basics", "Fractions intro"] },
    ],
  },
  {
    code: "G45",
    label: "Grades 4–5",
    grades: "Ages 9–11",
    color: AMBER,
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.3)",
    domains: [
      { name: "Reading", icon: "📖", expectedSkills: ["Deep comprehension", "Inferencing", "Complex spelling patterns", "Literary analysis"] },
      { name: "Math", icon: "🔢", expectedSkills: ["Fractions & decimals", "Long division", "Geometry basics", "Word problems"] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MASTERY_TARGET = 65;

function masteryStatus(pct: number): "Strong" | "Building" | "Just started" {
  if (pct >= MASTERY_TARGET) return "Strong";
  if (pct >= 40) return "Building";
  return "Just started";
}

function statusStyle(status: ReturnType<typeof masteryStatus>) {
  const map = {
    Strong:         { bg: "rgba(34,197,94,0.15)",    color: "#4ade80", bar: MINT   },
    Building:       { bg: "rgba(255,209,102,0.15)",  color: GOLD,      bar: GOLD   },
    "Just started": { bg: "rgba(155,114,255,0.15)",  color: "#c4a8ff", bar: VIOLET },
  };
  return map[status];
}

function subjectFromCode(code: string): string {
  const c = code?.toLowerCase() ?? "";
  if (c.includes("read") || c.includes("phonics") || c.includes("spell") || c.includes("vocab") || c.includes("literacy")) return "Reading";
  if (c.includes("math") || c.includes("number") || c.includes("arithm")) return "Math";
  return "Other";
}

// Group skills by domain
function groupByDomain(skills: SkillProgress[]): Record<string, SkillProgress[]> {
  const out: Record<string, SkillProgress[]> = { Reading: [], Math: [], Other: [] };
  for (const sk of skills) {
    const d = subjectFromCode(sk.subjectCode ?? "");
    (out[d] = out[d] ?? []).push(sk);
  }
  return out;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MasteryBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 9, background: "rgba(255,255,255,0.08)", borderRadius: 5, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: `linear-gradient(90deg, ${color}, ${MINT})`, borderRadius: 5, transition: "width 0.5s ease" }} />
    </div>
  );
}

function CheckBadge({ mastered }: { mastered: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: mastered ? "rgba(80,232,144,0.2)" : "rgba(255,255,255,0.06)",
        border: mastered ? "1.5px solid rgba(80,232,144,0.4)" : `1.5px solid ${BORDER}`,
        fontSize: "0.7rem",
        color: mastered ? MINT : MUTED,
        flexShrink: 0,
      }}
    >
      {mastered ? "✓" : ""}
    </span>
  );
}

function LoginPrompt() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: TEXT, marginBottom: 8 }}>
        Parent sign-in required
      </div>
      <div style={{ fontSize: "0.85rem", color: MUTED, marginBottom: 24 }}>
        Sign in to your parent account to view skill benchmarks.
      </div>
      <Link
        href="/parent"
        style={{ display: "inline-block", padding: "12px 28px", background: VIOLET, color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}
      >
        Sign in →
      </Link>
    </div>
  );
}

// Domain section showing expected skills + live progress
function DomainSection({
  domain,
  icon,
  expectedSkills,
  practisedSkills,
  bandColor,
}: {
  domain: string;
  icon: string;
  expectedSkills: string[];
  practisedSkills: SkillProgress[];
  bandColor: string;
}) {
  // Map practised skills by normalized name for matching
  const practisedNames = new Set(practisedSkills.map((s) => s.skillName?.toLowerCase() ?? ""));
  const masteredCount = practisedSkills.filter((s) => s.masteryPct >= MASTERY_TARGET).length;
  const totalExpected = expectedSkills.length;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Domain header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.1rem" }}>{icon}</span>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: TEXT }}>{domain}</span>
        </div>
        {practisedSkills.length > 0 && (
          <span style={{ fontSize: "0.72rem", color: MUTED }}>
            {masteredCount}/{practisedSkills.length} mastered
          </span>
        )}
      </div>

      {/* Live skill progress */}
      {practisedSkills.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {practisedSkills.map((sk) => {
            const status = masteryStatus(sk.masteryPct);
            const ss = statusStyle(status);
            const mastered = sk.masteryPct >= MASTERY_TARGET;
            return (
              <div
                key={sk.skillCode}
                style={{
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <CheckBadge mastered={mastered} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.84rem", fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sk.skillName}
                    </span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: ss.color, flexShrink: 0, marginLeft: 10 }}>
                      {sk.masteryPct}%
                    </span>
                  </div>
                  <MasteryBar pct={sk.masteryPct} color={ss.bar} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.64rem", color: MUTED }}>
                    <span style={{ background: ss.bg, color: ss.color, padding: "1px 8px", borderRadius: 10, fontWeight: 700 }}>{status}</span>
                    <span>Target: {MASTERY_TARGET}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expected benchmark skills (not yet practiced) */}
      <div>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: MUTED, marginBottom: 8 }}>
          Expected for this band
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {expectedSkills.map((skillName) => {
            const practiced = practisedNames.has(skillName.toLowerCase());
            const matchedSk = practisedSkills.find((s) => s.skillName?.toLowerCase() === skillName.toLowerCase());
            const mastered = matchedSk ? matchedSk.masteryPct >= MASTERY_TARGET : false;
            return (
              <span
                key={skillName}
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  background: mastered
                    ? "rgba(80,232,144,0.12)"
                    : practiced
                    ? `rgba(${bandColor === VIOLET ? "155,114,255" : bandColor === GOLD ? "255,209,102" : bandColor === MINT ? "80,232,144" : "245,158,11"},0.1)`
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${mastered ? "rgba(80,232,144,0.25)" : practiced ? "rgba(155,114,255,0.2)" : BORDER}`,
                  color: mastered ? MINT : practiced ? "#c4a8ff" : MUTED,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {mastered && <span>✓</span>}
                {skillName}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentBenchmarkPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<LinkedChild | null>(null);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Step 1: session
  useEffect(() => {
    fetch("/api/parent/session")
      .then((r) => {
        if (!r.ok) { setAuthed(false); setLoading(false); return null; }
        return r.json() as Promise<ParentSession>;
      })
      .then((data) => {
        if (!data) return;
        const list = data.linkedChildren ?? [];
        setChildren(list);
        const stored = typeof localStorage !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;
        const chosen = stored && list.some((c) => c.id === stored) ? stored : (list[0]?.id ?? null);
        setActiveChildId(chosen);
        setActiveChild(list.find((c) => c.id === chosen) ?? list[0] ?? null);
        setAuthed(true);
      })
      .catch(() => { setAuthed(false); setLoading(false); });
  }, []);

  // Step 2: skills
  useEffect(() => {
    if (!activeChildId || authed !== true) return;
    setLoading(true);
    fetch(`/api/parent/skills?childId=${encodeURIComponent(activeChildId)}`)
      .then((r) => r.json())
      .then((data) => { setSkills(data.skills ?? []); })
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, [activeChildId, authed]);

  // Sync activeChild when selection changes
  useEffect(() => {
    setActiveChild(children.find((c) => c.id === activeChildId) ?? null);
  }, [activeChildId, children]);

  const bandCode = activeChild?.launchBandCode ?? "K1";
  const bandDef = BANDS.find((b) => b.code === bandCode) ?? BANDS[1];
  const groupedSkills = groupByDomain(skills);

  return (
    <AppFrame audience="parent" currentPath="/parent/benchmark">
      <div
        style={{
          minHeight: "100vh",
          background: BASE,
          color: TEXT,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ background: "rgba(22,27,34,0.95)", borderBottom: `1px solid ${BORDER}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link href="/parent" style={{ fontSize: "0.8rem", fontWeight: 600, color: MUTED, textDecoration: "none" }}>
            ← Dashboard
          </Link>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: TEXT }}>Skill Benchmarks</div>
          {children.length > 1 && (
            <select
              value={activeChildId ?? ""}
              onChange={(e) => {
                setActiveChildId(e.target.value);
                if (e.target.value) localStorage.setItem("wq_active_student_id", e.target.value);
              }}
              style={{ background: SURFACE, border: `1px solid ${VBORDER}`, borderRadius: 8, color: TEXT, fontSize: "0.8rem", padding: "5px 10px", cursor: "pointer" }}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          )}
          {children.length <= 1 && <div style={{ width: 80 }} />}
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 80px" }}>

          {authed === false && <LoginPrompt />}

          {authed !== false && loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: MUTED }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: "0.9rem" }}>Loading benchmark data…</div>
            </div>
          )}

          {authed === true && !loading && (
            <>
              {/* Page heading */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, marginBottom: 6 }}>
                  📐 Skill Benchmark
                </h1>
                <p style={{ fontSize: "0.85rem", color: MUTED, margin: 0 }}>
                  {activeChild ? `${activeChild.displayName}'s` : "Your child's"} progress toward age/grade expectations
                </p>
              </div>

              {/* Band badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  background: bandDef.bg,
                  border: `2px solid ${bandDef.border}`,
                  borderRadius: 14,
                  marginBottom: 28,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: bandDef.color, flexShrink: 0, display: "inline-block" }} />
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: TEXT }}>{bandDef.label}</div>
                  <div style={{ fontSize: "0.72rem", color: MUTED }}>{bandDef.grades}</div>
                </div>
              </div>

              {/* All 4 bands overview */}
              <div
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 28,
                }}
              >
                <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: MUTED, marginBottom: 14 }}>
                  Learning bands
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                  {BANDS.map((band) => (
                    <div
                      key={band.code}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: band.bg,
                        border: `1.5px solid ${band.code === bandCode ? band.border : "transparent"}`,
                        position: "relative",
                        opacity: band.code === bandCode ? 1 : 0.55,
                      }}
                    >
                      {band.code === bandCode && (
                        <span style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: band.color, display: "inline-block" }} />
                      )}
                      <div style={{ fontSize: "0.84rem", fontWeight: 800, color: TEXT }}>{band.label}</div>
                      <div style={{ fontSize: "0.7rem", color: MUTED, marginTop: 2 }}>{band.grades}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domain breakdown */}
              <div
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: "24px",
                  marginBottom: 24,
                }}
              >
                <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT, marginBottom: 20 }}>
                  {bandDef.label} — expected skills &amp; progress
                </div>

                {bandDef.domains.map((domain) => {
                  const domainKey = domain.name === "Reading" ? "Reading" : domain.name === "Math" ? "Math" : "Other";
                  const practised = groupedSkills[domainKey] ?? [];
                  return (
                    <DomainSection
                      key={domain.name}
                      domain={domain.name}
                      icon={domain.icon}
                      expectedSkills={domain.expectedSkills}
                      practisedSkills={practised}
                      bandColor={bandDef.color}
                    />
                  );
                })}

                {/* Other skills not in defined domains */}
                {(groupedSkills["Other"] ?? []).length > 0 && !bandDef.domains.find((d) => d.name === "Other") && (
                  <DomainSection
                    domain="Other skills"
                    icon="✨"
                    expectedSkills={[]}
                    practisedSkills={groupedSkills["Other"] ?? []}
                    bandColor={bandDef.color}
                  />
                )}

                {skills.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: MUTED, fontSize: "0.88rem" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 10 }}>🌱</div>
                    No skills practiced yet. Skill progress will appear here after the first sessions.
                  </div>
                )}
              </div>

              {/* How mastery works callout */}
              <div
                style={{
                  padding: "18px 22px",
                  background: "rgba(155,114,255,0.08)",
                  border: `1px solid rgba(155,114,255,0.2)`,
                  borderRadius: 14,
                  marginBottom: 24,
                  fontSize: "0.84rem",
                  color: "#c4a8ff",
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: TEXT }}>Why no percentages for your child?</strong>
                <br />
                Research shows showing accuracy scores to young learners can reduce motivation. They see stars and progress cues — you see the full mastery data here because context helps you support, not judge.
              </div>

              {/* Footer nav */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link href="/parent/practice" style={{ fontSize: "0.84rem", fontWeight: 700, color: VIOLET, textDecoration: "none" }}>
                  Practice today →
                </Link>
                <Link href="/parent/weekly" style={{ fontSize: "0.84rem", fontWeight: 700, color: MUTED, textDecoration: "none" }}>
                  Weekly report →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
