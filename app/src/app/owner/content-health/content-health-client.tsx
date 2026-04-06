"use client";

import { useState } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const BASE    = "#100b2e";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";
const BORDER2 = "rgba(255,255,255,0.04)";
const SHELL   = "#0d1117";
const SHELL2  = "#010409";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(255,255,255,0.3)";
const MUTED2  = "rgba(255,255,255,0.25)";
const MUTED3  = "rgba(255,255,255,0.5)";
const MUTED4  = "rgba(255,255,255,0.4)";
const MINT    = "#50e890";
const AMBER   = "#f59e0b";
const RED     = "#f85149";
const GOLD    = "#ffd166";
const VIOLET  = "#9b72ff";
const TEAL    = "#58e8c1";
const CORAL   = "#ff7b6b";

// ── Stub Data ─────────────────────────────────────────────────────────────────

const STATS = [
  { n: "284", label: "Total Skills",    delta: "↑12 this month",       deltaGood: true  },
  { n: "278", label: "Published Live",  delta: "97.9%",                deltaGood: true  },
  { n: "3",   label: "Under Review",    delta: "↑2 vs last month",     deltaGood: false },
  { n: "3",   label: "Blocked",         delta: "Locked from delivery", deltaGood: false },
  { n: "14",  label: "Error Reports",   delta: "7d rolling",           deltaGood: false },
];

const BANDS = [
  { id: "p0", label: "P0 Pre-K", color: GOLD,   skills: 42, chips: [{ text: "41 Live", type: "pass" }, { text: "1 Review", type: "warn" }] },
  { id: "p1", label: "P1 K–1",  color: VIOLET, skills: 68, chips: [{ text: "66 Live", type: "pass" }, { text: "2 Review", type: "warn" }] },
  { id: "p2", label: "P2 G2–3", color: TEAL,   skills: 96, chips: [{ text: "93 Live", type: "pass" }, { text: "3 Blocked", type: "fail" }] },
  { id: "p3", label: "P3 G4–5", color: CORAL,  skills: 78, chips: [{ text: "78 Live", type: "pass" }] },
];

const REVIEW_QUEUE = [
  { prio: "HIGH", title: "Fractions: Mixed Numbers — wrong answer marked correct",              meta: "Reported by: Teacher, Maplewood School · 2d ago · 8 teacher reports + auto-flag", band: "P2 G2–3", bandColor: TEAL,  bandBg: "rgba(88,232,193,.12)",  status: "Blocked", statusType: "fail" as const },
  { prio: "HIGH", title: "Division: Remainders — unclear question wording",                     meta: "Reported by: 3 teachers, multiple schools · 5d ago",                               band: "P2 G2–3", bandColor: TEAL,  bandBg: "rgba(88,232,193,.12)",  status: "Blocked", statusType: "fail" as const },
  { prio: "MED",  title: "Phonics: Consonant Blends — image asset broken on iOS",               meta: "Auto-detected: asset 404 · CDN issue · 1d ago",                                    band: "P1 K–1",  bandColor: VIOLET,bandBg: "rgba(155,114,255,.12)", status: "Review",  statusType: "warn" as const },
  { prio: "MED",  title: "Subtraction: Borrowing — difficulty calibration off (skip rate 78%)", meta: "Auto-flag: skip rate >60% threshold triggered · 3d ago",                           band: "P0 Pre-K",bandColor: GOLD,  bandBg: "rgba(255,209,102,.15)", status: "Review",  statusType: "warn" as const },
  { prio: "MED",  title: "Reading Comprehension: Main Idea — locked per release gate warning",  meta: "Release gate: v2.5 warning item. Locked at launch. Curriculum review pending.",    band: "P1 K–1",  bandColor: VIOLET,bandBg: "rgba(155,114,255,.12)", status: "Blocked", statusType: "fail" as const },
];

const ERROR_BARS = [
  { label: "Mathematics", pct: 68, n: "8 reports", color: RED   },
  { label: "Reading",     pct: 25, n: "3 reports", color: AMBER },
  { label: "Phonics",     pct: 20, n: "2 reports", color: AMBER },
  { label: "Vocabulary",  pct: 8,  n: "1 report",  color: MINT  },
  { label: "Spelling",    pct: 0,  n: "0 reports", color: MINT  },
];

const CONTENT_STATUS = [
  { label: "Published live",            val: "278", valColor: MINT  },
  { label: "Under review (skill live)", val: "3",   valColor: AMBER },
  { label: "Blocked (delivery locked)", val: "3",   valColor: RED   },
  { label: "Draft / unreleased",        val: "32",  valColor: TEXT  },
  { label: "Total in catalogue",        val: "316", valColor: TEXT  },
];

const RECENT_ACTIONS = [
  { title: "Fractions: Equivalent — Review resolved, published",  meta: "3d ago · Curriculum team" },
  { title: "Addition: 3-digit — New skill published",             meta: "5d ago · v2.5 release"    },
  { title: "Phonics: Long Vowels — Asset update (image replaced)", meta: "6d ago · Content team"   },
];

const THRESHOLDS = [
  { label: "Skip rate",                  val: "> 60%"        },
  { label: "Wrong-as-correct",           val: "> 2 reports"  },
  { label: "Asset 404",                  val: "Instant"      },
  { label: "Avg session abort mid-skill",val: "> 40%"        },
];

const SKILLS_TABLE = [
  { name: "Fractions: Mixed Numbers",  band: "P2 G2–3", bandColor: TEAL,  subject: "Maths",      sessions: "1,240", skipRate: "12%", skipBad: false, errors: "8 reports", errorsBad: true,  status: "Blocked",      statusType: "blocked" as const },
  { name: "Division: Remainders",      band: "P2 G2–3", bandColor: TEAL,  subject: "Maths",      sessions: "880",   skipRate: "18%", skipBad: false, errors: "3 reports", errorsBad: true,  status: "Blocked",      statusType: "blocked" as const },
  { name: "Reading: Main Idea",        band: "P1 K–1",  bandColor: VIOLET,subject: "Reading",    sessions: "—",     skipRate: "—",   skipBad: false, errors: "0",         errorsBad: false, status: "Blocked",      statusType: "blocked" as const },
  { name: "Phonics: Consonant Blends", band: "P1 K–1",  bandColor: VIOLET,subject: "Phonics",    sessions: "460",   skipRate: "9%",  skipBad: false, errors: "2 reports", errorsBad: true,  status: "Under Review", statusType: "review" as const  },
  { name: "Subtraction: Borrowing",    band: "P0 Pre-K",bandColor: GOLD,  subject: "Maths",      sessions: "320",   skipRate: "78%", skipBad: true,  errors: "1 report",  errorsBad: false, status: "Under Review", statusType: "review" as const  },
  { name: "Vocabulary: Context Clues", band: "P3 G4–5", bandColor: CORAL, subject: "Vocabulary", sessions: "580",   skipRate: "35%", skipBad: false, errors: "1 report",  errorsBad: false, status: "Under Review", statusType: "review" as const  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function chipStyle(type: "pass" | "warn" | "fail"): { background: string; color: string } {
  if (type === "pass") return { background: "rgba(80,232,144,.12)",  color: MINT  };
  if (type === "warn") return { background: "rgba(245,158,11,.12)",  color: AMBER };
  return                      { background: "rgba(248,81,73,.12)",   color: RED   };
}

function statusStyle(type: "blocked" | "review"): { background: string; color: string } {
  if (type === "blocked") return { background: "rgba(248,81,73,.12)",  color: RED   };
  return                         { background: "rgba(245,158,11,.12)", color: AMBER };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContentHealthClient() {
  const [tab, setTab] = useState<"overview" | "skills">("overview");

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", background: BASE, minHeight: "100vh", padding: "24px", color: TEXT }}>

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px", maxWidth: "1100px" }}>
        {(["overview", "skills"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "system-ui", background: tab === t ? "#2563eb" : "rgba(255,255,255,0.08)", color: tab === t ? "#fff" : "rgba(255,255,255,0.55)", transition: "all .18s" }}>
            {t === "overview" ? "Content Health" : "Skills Table"}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === "overview" && (
        <div style={{ maxWidth: "1100px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#8a7a6a", marginBottom: "16px" }}>Owner content health — overview</p>

          <div style={{ background: SHELL, borderRadius: "16px", overflow: "hidden", border: `1px solid ${BORDER}` }}>

            {/* Shell header */}
            <div style={{ background: SHELL2, padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: TEXT }}>📚 Content Health</span>
                <span style={{ fontSize: "11px", color: MUTED }}>Skills · Questions · Reviews</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: AMBER, cursor: "pointer" }}>3 Under Review</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: MINT, cursor: "pointer" }}>↓ Export</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "1px", background: BORDER, borderBottom: `1px solid ${BORDER}` }}>
              {STATS.map((s) => (
                <div key={s.label} style={{ background: SHELL, padding: "16px 20px" }}>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: TEXT }}>{s.n}</div>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED, marginTop: "2px" }}>{s.label}</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, marginTop: "4px", color: s.deltaGood ? MINT : AMBER }}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Body */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px" }}>

              {/* Main column */}
              <div style={{ padding: "20px 24px", borderRight: `1px solid ${BORDER}` }}>

                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: "12px", paddingBottom: "6px", borderBottom: `1px solid ${BORDER}` }}>Content Health by Band</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "14px" }}>
                  {BANDS.map((b) => (
                    <div key={b.id} style={{ background: SURFACE, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: b.color, marginBottom: "6px" }}>{b.label}</div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: TEXT }}>{b.skills}</div>
                      <div style={{ fontSize: "9px", color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>Skills</div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                        {b.chips.map((c) => {
                          const cs = chipStyle(c.type as "pass" | "warn" | "fail");
                          return <span key={c.text} style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", ...cs }}>{c.text}</span>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: "12px", paddingBottom: "6px", borderBottom: `1px solid ${BORDER}` }}>Content Review Queue</div>
                <div style={{ background: SURFACE, borderRadius: "12px", padding: "16px 18px", marginBottom: "14px", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: MUTED2, letterSpacing: ".06em", marginBottom: "12px" }}>Items requiring review (curriculum team)</div>
                  {REVIEW_QUEUE.map((item, i) => {
                    const ss = chipStyle(item.statusType);
                    return (
                      <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < REVIEW_QUEUE.length - 1 ? `1px solid ${BORDER2}` : "none" }}>
                        <span style={{ fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "3px", flexShrink: 0, marginTop: "1px", background: item.prio === "HIGH" ? "rgba(248,81,73,.15)" : "rgba(245,158,11,.12)", color: item.prio === "HIGH" ? RED : AMBER }}>{item.prio}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,.7)" }}>{item.title}</div>
                          <div style={{ fontSize: "10px", color: MUTED, marginTop: "1px" }}>{item.meta}</div>
                          <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", display: "inline-block", marginTop: "2px", background: item.bandBg, color: item.bandColor }}>{item.band}</span>
                        </div>
                        <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", flexShrink: 0, alignSelf: "flex-start", marginTop: "2px", ...ss }}>{item.status}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: MUTED, marginBottom: "12px", paddingBottom: "6px", borderBottom: `1px solid ${BORDER}` }}>Error Rate by Subject Area</div>
                <div style={{ background: SURFACE, borderRadius: "12px", padding: "16px 18px", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: MUTED2, letterSpacing: ".06em", marginBottom: "12px" }}>Skip rate / error report density by subject (7d)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {ERROR_BARS.map((b) => (
                      <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ fontSize: "11px", color: MUTED3, width: "140px" }}>{b.label}</div>
                        <div style={{ flex: 1, background: "rgba(255,255,255,.07)", borderRadius: "3px", height: "6px" }}>
                          <div style={{ width: `${b.pct}%`, height: "6px", borderRadius: "3px", background: b.color }} />
                        </div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: b.color }}>{b.n}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ padding: "18px 20px" }}>
                <div style={{ background: SURFACE, borderRadius: "10px", padding: "14px 16px", marginBottom: "12px", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: "10px" }}>Content Status Summary</div>
                  {CONTENT_STATUS.map((row, i) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "11px", borderBottom: i < CONTENT_STATUS.length - 1 ? `1px solid ${BORDER2}` : "none" }}>
                      <span style={{ color: MUTED4 }}>{row.label}</span>
                      <span style={{ color: row.valColor, fontWeight: 600 }}>{row.val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: SURFACE, borderRadius: "10px", padding: "14px 16px", marginBottom: "12px", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: "10px" }}>Recent Content Actions</div>
                  {RECENT_ACTIONS.map((a, i) => (
                    <div key={i} style={{ padding: "5px 0", borderBottom: i < RECENT_ACTIONS.length - 1 ? `1px solid ${BORDER2}` : "none" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,.7)" }}>{a.title}</div>
                      <div style={{ fontSize: "10px", color: MUTED, marginTop: "1px" }}>{a.meta}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: SURFACE, borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: MUTED, letterSpacing: ".06em", marginBottom: "10px" }}>Auto-Flag Thresholds</div>
                  {THRESHOLDS.map((t, i) => (
                    <div key={t.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "11px", borderBottom: i < THRESHOLDS.length - 1 ? `1px solid ${BORDER2}` : "none" }}>
                      <span style={{ color: MUTED4 }}>{t.label}</span>
                      <span style={{ color: TEXT, fontWeight: 600 }}>{t.val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Skills Table Tab ── */}
      {tab === "skills" && (
        <div style={{ maxWidth: "1100px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#8a7a6a", marginBottom: "16px" }}>Owner content health — full skills table (filtered to flagged)</p>
          <div style={{ background: SHELL, borderRadius: "16px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
            <div style={{ background: SHELL2, padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: TEXT }}>📚 Skills — Flagged / Blocked</span>
                <span style={{ fontSize: "11px", color: MUTED }}>Showing 6 of 284</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: MINT, cursor: "pointer" }}>Show All Skills</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: MINT, cursor: "pointer" }}>↓ Export CSV</span>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Skill", "Band", "Subject", "Sessions (7d)", "Skip rate", "Error reports", "Status"].map((h) => (
                      <th key={h} style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: MUTED2, padding: "5px 10px", textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SKILLS_TABLE.map((row, i) => {
                    const isBlock = row.statusType === "blocked";
                    const ss = statusStyle(row.statusType);
                    return (
                      <tr key={i} style={{ background: isBlock ? "rgba(248,81,73,.04)" : "rgba(245,158,11,.03)" }}>
                        <td style={{ padding: "7px 10px", borderBottom: `1px solid ${BORDER2}`, verticalAlign: "middle" }}><span style={{ fontSize: "11px", fontWeight: 700, color: TEXT }}>{row.name}</span></td>
                        <td style={{ padding: "7px 10px", borderBottom: `1px solid ${BORDER2}`, verticalAlign: "middle" }}><span style={{ fontSize: "9px", fontWeight: 700, color: row.bandColor }}>{row.band}</span></td>
                        <td style={{ fontSize: "11px", padding: "7px 10px", borderBottom: `1px solid ${BORDER2}`, verticalAlign: "middle", color: "rgba(255,255,255,.6)" }}>{row.subject}</td>
                        <td style={{ fontSize: "11px", padding: "7px 10px", borderBottom: `1px solid ${BORDER2}`, verticalAlign: "middle", color: "rgba(255,255,255,.5)" }}>{row.sessions}</td>
                        <td style={{ fontSize: "11px", padding: "7px 10px", borderBottom: `1px solid ${BORDER2}`, verticalAlign: "middle", color: row.skipBad ? AMBER : "rgba(255,255,255,.5)", fontWeight: row.skipBad ? 700 : 400 }}>{row.skipRate}</td>
                        <td style={{ fontSize: "11px", padding: "7px 10px", borderBottom: `1px solid ${BORDER2}`, verticalAlign: "middle", color: row.errorsBad ? AMBER : "rgba(255,255,255,.6)", fontWeight: row.errorsBad ? 700 : 400 }}>{row.errors}</td>
                        <td style={{ padding: "7px 10px", borderBottom: `1px solid ${BORDER2}`, verticalAlign: "middle" }}><span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "4px", ...ss }}>{row.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
