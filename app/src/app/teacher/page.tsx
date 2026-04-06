"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

// ── Design tokens ───────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  surfaceHover: "rgba(255,255,255,0.04)",
  red: "#ff7b6b",
};

// ── Class overview data ──────────────────────────────────────────────────────
const STATS = [
  { val: "18", lbl: "Active today", delta: "+3 vs yesterday", up: true },
  { val: "⭐ 284", lbl: "Class stars", delta: "+62 this week", up: true },
  { val: "67", lbl: "Sessions today", delta: "→ Typical", up: null },
  { val: "4", lbl: "Need check-in", delta: "⚠ Support queue", up: false },
  { val: "3", lbl: "Bands covered", delta: "P0 / P1 / P2", up: null },
];

const ACTIVE_STUDENTS = [
  { initial: "A", name: "Aaliya", band: "Mint Band · Sight words", stars: 7, color: C.mint },
  { initial: "B", name: "Ben", band: "Violet Band · Addition facts", stars: 5, color: C.violet },
  { initial: "C", name: "Chloe", band: "Mint Band · Blending", stars: 9, color: C.mint },
  { initial: "D", name: "Daniel", band: "Pre-K Band · Letters", stars: 4, color: C.gold },
];

const SUPPORT_QUEUE = [
  { name: "Emma", issue: "Hit confidence floor 4x on blending sounds — same question type each time", action: "Check in" },
  { name: "Marcus", issue: "No sessions in 5 days — streak broken", action: "Reach out" },
  { name: "Priya", issue: "Repeated hint requests on skip counting — may need a different approach", action: "Check in" },
  { name: "Tommy", issue: "Band placement may need review — consistently above ceiling", action: "Review band" },
];

const BANDS = [
  { name: "Pre-K (P0)", count: 5, pct: 21, color: C.gold },
  { name: "K–1 (P1)", count: 9, pct: 38, color: C.violet },
  { name: "G2–3 (P2)", count: 10, pct: 42, color: C.mint },
  { name: "G4–5 (P3)", count: 0, pct: 0, color: C.red },
];

const SKILL_GAPS = [
  { label: "Blending sounds", count: 6 },
  { label: "Skip counting", count: 4 },
  { label: "CVC spelling", count: 3 },
];

const WEEK_STATS = [
  { lbl: "Sessions completed", val: "187" },
  { lbl: "Stars earned (class)", val: "⭐ 284" },
  { lbl: "Badges earned", val: "🏅 7" },
  { lbl: "Students not active", val: "6", warn: true },
];

// ── Shared sub-components ───────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.surface,
      borderRadius: 14,
      padding: 18,
      border: `1px solid ${C.border}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, link, href }: { title: React.ReactNode; link?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{title}</span>
      {link && href && (
        <Link href={href} style={{ fontSize: 12, color: C.blue, fontWeight: 600, textDecoration: "none" }}>
          {link}
        </Link>
      )}
    </div>
  );
}

// ── Page component ──────────────────────────────────────────────────────────
export default function TeacherPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "support">("overview");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileSchool, setProfileSchool] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    const teacherId = getTeacherId();
    if (!teacherId || teacherId === "demo-teacher") return;
    fetch("/api/teacher/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { profile?: { displayName: string; schoolName: string | null } } | null) => {
        if (data?.profile?.displayName === "Teacher") {
          setShowProfileSetup(true);
        }
      })
      .catch(() => {/* ignore */});
  }, []);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profileName.trim()) return;
    setProfileSaving(true);
    fetch("/api/teacher/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: profileName.trim(), schoolName: profileSchool.trim() || null }),
    })
      .then(() => setShowProfileSetup(false))
      .catch(() => {/* ignore */})
      .finally(() => setProfileSaving(false));
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "system-ui",
    background: activeTab === tab ? C.blue : C.surface,
    color: activeTab === tab ? "#0b1622" : C.muted,
    transition: "all .18s",
  });

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      {showProfileSetup && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: "32px 36px",
            width: "100%",
            maxWidth: 440,
          }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 6 }}>Welcome to WonderQuest</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, lineHeight: 1.5 }}>
              Set up your teacher profile to get started.
            </div>
            <form onSubmit={handleProfileSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                  Your name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Ms Johnson"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                  School name (optional)
                </label>
                <input
                  type="text"
                  value={profileSchool}
                  onChange={(e) => setProfileSchool(e.target.value)}
                  placeholder="e.g. Lincoln Elementary"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: C.blue,
                  border: "none",
                  borderRadius: 10,
                  color: "#0b1622",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: profileSaving ? "default" : "pointer",
                  fontFamily: "system-ui,-apple-system,sans-serif",
                  opacity: profileSaving ? 0.7 : 1,
                }}
              >
                {profileSaving ? "Saving…" : "Save and continue"}
              </button>
            </form>
          </div>
        </div>
      )}
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, minHeight: "100vh", padding: "24px 28px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Good morning, Ms Johnson 👋</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Tuesday, March 24 · Grade 2 class · 24 students</p>
        </div>

        {/* Quick nav links */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, marginTop: 16 }}>
          {[
            { label: "⚡ Command Centre", href: "/teacher/command" },
            { label: "👥 Class", href: "/teacher/class" },
            { label: "📋 Assignments", href: "/teacher/assignment" },
            { label: "🔧 Support Queue", href: "/teacher/support" },
          ].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                padding: "8px 16px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: C.blue,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "background .15s",
              }}
            >
              {n.label}
            </Link>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {(["overview", "students", "support"] as const).map((t) => (
            <button key={t} style={tabStyle(t)} onClick={() => setActiveTab(t)}>
              {t === "overview" ? "Class Overview" : t === "students" ? "Student List" : "Support Queue"}
            </button>
          ))}
        </div>

        {/* ── TAB: Overview ── */}
        {activeTab === "overview" && (
          <>
            {/* Stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
              {STATS.map((s) => (
                <div key={s.lbl} style={{
                  background: C.surface,
                  borderRadius: 12,
                  padding: "14px 16px",
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 2, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.lbl}</div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 3,
                    color: s.up === true ? C.mint : s.up === false ? C.amber : C.muted,
                  }}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Two-col: active students + support queue preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Active students */}
              <Card>
                <CardHeader title="🟢 Active right now (9)" link="View all →" href="/teacher/class" />
                {ACTIVE_STUDENTS.map((s) => (
                  <div key={s.name} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: s.color + "33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: s.color, flexShrink: 0,
                    }}>{s.initial}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.name}
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          background: C.mint + "22", color: C.mint,
                          padding: "2px 8px", borderRadius: 20, marginLeft: 6,
                        }}>Active</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{s.band}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>⭐ {s.stars}</span>
                  </div>
                ))}
                <div style={{ fontSize: 12, color: C.blue, cursor: "pointer", marginTop: 10, fontWeight: 700 }}>+ 5 more active →</div>
              </Card>

              {/* Support queue preview */}
              <Card>
                <CardHeader title="⚠️ Needs check-in (4)" link="View queue →" href="/teacher/support" />
                {SUPPORT_QUEUE.map((q) => (
                  <div key={q.name} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: C.amber + "15",
                    borderLeft: `3px solid ${C.amber}`,
                    marginBottom: 8,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: C.amber + "33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, flexShrink: 0,
                    }}>💛</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{q.name}</div>
                      <div style={{ fontSize: 11, color: C.amber, lineHeight: 1.4, marginTop: 2 }}>{q.issue}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.blue, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginTop: 2 }}>{q.action}</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Three-col: band coverage + skill gaps + week summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {/* Band coverage */}
              <Card>
                <CardHeader title="🎯 Band coverage" />
                {BANDS.map((b) => (
                  <div key={b.name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0", borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, flex: 1 }}>{b.name}</div>
                    <div style={{ flex: 2, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: b.count === 0 ? C.muted : C.text, minWidth: 24, textAlign: "right" }}>{b.count}</div>
                  </div>
                ))}
              </Card>

              {/* Skill gaps */}
              <Card>
                <CardHeader title="⚡ Common skill gaps" />
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.4 }}>Skills where 3+ students are struggling. Tap to drilldown.</div>
                <div>
                  {SKILL_GAPS.map((g) => (
                    <span key={g.label} style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: C.amber + "22",
                      border: `1px solid ${C.amber}44`,
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.amber,
                      margin: 4,
                      cursor: "pointer",
                    }}>
                      {g.label} ({g.count})
                    </span>
                  ))}
                </div>
              </Card>

              {/* Week summary */}
              <Card>
                <CardHeader title="📅 Week to date" />
                {WEEK_STATS.map((w) => (
                  <div key={w.lbl} style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 0",
                    borderTop: `1px solid ${C.border}`,
                  }}>
                    <div style={{ flex: 1, fontSize: 12, color: C.muted, fontWeight: 600 }}>{w.lbl}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: w.warn ? C.amber : C.text }}>{w.val}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {/* ── TAB: Students ── */}
        {activeTab === "students" && (
          <Card>
            <CardHeader title="👥 All Students (24)" link="Class settings →" href="/teacher/class" />
            {[
              { initial: "A", name: "Aaliya", band: "G2–3 (P2)", stars: 32, color: C.mint, status: "Active" },
              { initial: "B", name: "Ben", band: "K–1 (P1)", stars: 28, color: C.violet, status: "Active" },
              { initial: "C", name: "Chloe", band: "G2–3 (P2)", stars: 41, color: C.mint, status: "Active" },
              { initial: "D", name: "Daniel", band: "Pre-K (P0)", stars: 17, color: C.gold, status: "Idle" },
              { initial: "E", name: "Emma", band: "K–1 (P1)", stars: 12, color: C.violet, status: "Support" },
              { initial: "M", name: "Marcus", band: "G2–3 (P2)", stars: 0, color: C.muted, status: "Support" },
              { initial: "P", name: "Priya", band: "K–1 (P1)", stars: 8, color: C.violet, status: "Support" },
              { initial: "T", name: "Tommy", band: "G2–3 (P2)", stars: 55, color: C.mint, status: "Active" },
            ].map((s) => (
              <div key={s.name} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: s.color + "33",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900, color: s.color, flexShrink: 0,
                }}>{s.initial}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{s.band}</div>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background:
                    s.status === "Active" ? C.mint + "22" :
                    s.status === "Support" ? C.amber + "22" :
                    "rgba(255,255,255,0.06)",
                  color:
                    s.status === "Active" ? C.mint :
                    s.status === "Support" ? C.amber :
                    C.muted,
                }}>{s.status}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 60, textAlign: "right" }}>⭐ {s.stars}</span>
              </div>
            ))}
          </Card>
        )}

        {/* ── TAB: Support Queue ── */}
        {activeTab === "support" && (
          <Card>
            <CardHeader title="🔧 Support Queue (4)" link="Full view →" href="/teacher/support" />
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
              System-flagged students who may need a teacher check-in. Different from your personal watchlist.
            </p>
            {SUPPORT_QUEUE.map((q, i) => (
              <div key={q.name} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                background: C.amber + "15",
                borderLeft: `3px solid ${C.amber}`,
                marginBottom: i < SUPPORT_QUEUE.length - 1 ? 10 : 0,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: C.amber + "33",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, flexShrink: 0, fontWeight: 900, color: C.amber,
                }}>!</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{q.name}</div>
                  <div style={{ fontSize: 12, color: C.amber, lineHeight: 1.4 }}>{q.issue}</div>
                </div>
                <button style={{
                  padding: "6px 14px",
                  background: "transparent",
                  border: `1.5px solid ${C.blue}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.blue,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                  flexShrink: 0,
                }}>{q.action}</button>
              </div>
            ))}
          </Card>
        )}

      </div>
    </AppFrame>
  );
}
