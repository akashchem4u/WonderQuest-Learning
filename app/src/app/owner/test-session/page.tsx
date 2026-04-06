import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

const C = {
  base: "#0d1117",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  accent: "#50e890",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  red: "#f85149",
  amber: "#f0a030",
  blue: "#38bdf8",
  violet: "#a78bfa",
};

interface TestSession {
  sessionId: string;
  tester: string;
  band: string;
  questionsSeen: number;
  lastAction: string;
  status: "active" | "paused" | "complete";
}

interface Observation {
  id: string;
  severity: "blocker" | "major" | "minor" | "info";
  text: string;
  context: string;
  band: string;
  timestamp: string;
  tags: string[];
}

interface CoverageCell {
  band: string;
  skills: string[];
  lastTested: string;
  status: "recent" | "stale" | "untested";
}

const SESSIONS: TestSession[] = [
  { sessionId: "QA-1024", tester: "Jordan Lee", band: "P0 (Pre-K)", questionsSeen: 12, lastAction: "Answered Q12 — correct", status: "active" },
  { sessionId: "QA-1023", tester: "Priya Nair", band: "P2 (Grade 2)", questionsSeen: 28, lastAction: "Triggered hint on Q22", status: "active" },
  { sessionId: "QA-1022", tester: "Sam Rivera", band: "P3 (Grade 3)", questionsSeen: 40, lastAction: "Session complete — submitted report", status: "complete" },
  { sessionId: "QA-1021", tester: "Maya Chen", band: "P1 (Grade 1)", questionsSeen: 15, lastAction: "Paused — battery low", status: "paused" },
];

const OBSERVATIONS: Observation[] = [
  {
    id: "OBS-047",
    severity: "major",
    text: "Voice coach Orbit not audible on iPad mini with volume at 50% — audio floor too low",
    context: "iPad mini (6th gen)",
    band: "P0 (Pre-K)",
    timestamp: "Today, 2:32 PM",
    tags: ["audio", "voice-coach", "device"],
  },
  {
    id: "OBS-046",
    severity: "blocker",
    text: "Hint button tap target registers miss ~35% of attempts on iPhone SE — touch area too small",
    context: "iPhone SE (3rd gen)",
    band: "P1 (Grade 1)",
    timestamp: "Today, 11:15 AM",
    tags: ["touch-target", "ux"],
  },
  {
    id: "OBS-045",
    severity: "minor",
    text: "Theme transition causes ~1.5s blank flash on Android 11 tablet during P2 reading quest",
    context: "Android tablet (Samsung A7)",
    band: "P2 (Grade 2)",
    timestamp: "Yesterday, 3:47 PM",
    tags: ["animation", "android"],
  },
  {
    id: "OBS-044",
    severity: "info",
    text: "5 of 6 students completed P3 Social Studies quest without using hint — engagement strong",
    context: "Classroom B (School pilot)",
    band: "P3 (Grade 3)",
    timestamp: "Yesterday, 9:47 AM",
    tags: ["engagement", "classroom"],
  },
  {
    id: "OBS-043",
    severity: "major",
    text: "Incorrect answer accepted for 'community helpers' Q3 — content bug in P3 Social Studies batch",
    context: "Device test — Chromebook",
    band: "P3 (Grade 3)",
    timestamp: "2 days ago",
    tags: ["content-bug", "answer-validation"],
  },
  {
    id: "OBS-042",
    severity: "minor",
    text: "Progress bar % label overflows card container on 320px viewport width",
    context: "Chrome DevTools — 320px",
    band: "P1 (Grade 1)",
    timestamp: "2 days ago",
    tags: ["layout", "responsive"],
  },
];

const COVERAGE: CoverageCell[] = [
  { band: "P0 (Pre-K)", skills: ["Phonics", "Numbers", "Colors", "Shapes"], lastTested: "Today", status: "recent" },
  { band: "P1 (Grade 1)", skills: ["Reading", "Addition", "Patterns"], lastTested: "Today", status: "recent" },
  { band: "P2 (Grade 2)", skills: ["Subtraction", "Sight Words", "Sequencing"], lastTested: "Yesterday", status: "recent" },
  { band: "P3 (Grade 3)", skills: ["Multiplication", "Social Studies", "Writing"], lastTested: "Yesterday", status: "recent" },
  { band: "P4 (Grade 4)", skills: ["Division", "Science", "Grammar"], lastTested: "8 days ago", status: "stale" },
  { band: "P5 (Grade 5)", skills: ["Fractions", "History", "Composition"], lastTested: "Never", status: "untested" },
];

const severityColor: Record<Observation["severity"], string> = {
  blocker: C.red,
  major: C.amber,
  minor: C.blue,
  info: C.accent,
};

const severityBg: Record<Observation["severity"], string> = {
  blocker: "rgba(248,81,73,0.15)",
  major: "rgba(240,160,48,0.15)",
  minor: "rgba(56,189,248,0.12)",
  info: "rgba(80,232,144,0.12)",
};

const statusColor: Record<TestSession["status"], string> = {
  active: C.accent,
  paused: C.amber,
  complete: "rgba(255,255,255,0.3)",
};

const coverageStatusColor: Record<CoverageCell["status"], string> = {
  recent: C.accent,
  stale: C.amber,
  untested: C.red,
};

const coverageStatusBg: Record<CoverageCell["status"], string> = {
  recent: "rgba(80,232,144,0.1)",
  stale: "rgba(240,160,48,0.1)",
  untested: "rgba(248,81,73,0.1)",
};

export default async function TestSessionPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  const activeSessions = SESSIONS.filter((s) => s.status === "active").length;
  const blockers = OBSERVATIONS.filter((o) => o.severity === "blocker").length;
  const testedBands = COVERAGE.filter((c) => c.status === "recent").length;

  return (
    <AppFrame audience="owner" currentPath="/owner/test-session">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        {!allowed ? (
          <OwnerGate configured={configured} />
        ) : (
          <div style={{ maxWidth: 1100 }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>🧪 Test Session Observation</h1>
              <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>QA sessions and observation log</p>
            </div>

            {/* Stats + Quick Action */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 14, marginBottom: 28, alignItems: "stretch" }}>
              {[
                { label: "Active Sessions", value: activeSessions, color: C.accent },
                { label: "Open Blockers", value: blockers, color: blockers > 0 ? C.red : C.accent },
                { label: "Bands with Recent QA", value: `${testedBands} / ${COVERAGE.length}`, color: C.text },
              ].map((s) => (
                <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
              <a
                href="/play?test=true"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "rgba(80,232,144,0.1)",
                  border: `1px solid rgba(80,232,144,0.3)`,
                  borderRadius: 12,
                  padding: "18px 22px",
                  textDecoration: "none",
                  color: C.accent,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 22 }}>▶</span>
                Start New Test Session
              </a>
            </div>

            {/* Active Sessions Table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Active Test Sessions</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Session ID", "Tester", "Band", "Questions Seen", "Last Action", "Status"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 16px",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: C.muted,
                            textAlign: "left",
                            borderBottom: `1px solid ${C.border}`,
                            background: "rgba(255,255,255,0.02)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SESSIONS.map((s, idx) => (
                      <tr key={s.sessionId} style={{ borderBottom: idx < SESSIONS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: "monospace" }}>{s.sessionId}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.text }}>{s.tester}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{s.band}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.text, textAlign: "center" }}>{s.questionsSeen}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted, maxWidth: 280 }}>{s.lastAction}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 10,
                              background: `${statusColor[s.status]}18`,
                              color: statusColor[s.status],
                              textTransform: "capitalize",
                            }}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Observation Notes */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Observation Notes</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(248,81,73,0.15)", color: C.red, padding: "2px 8px", borderRadius: 10 }}>
                  {blockers} blocker{blockers !== 1 ? "s" : ""}
                </span>
              </div>
              {OBSERVATIONS.map((obs, idx) => (
                <div
                  key={obs.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: idx < OBSERVATIONS.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  {/* Severity badge */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: severityBg[obs.severity],
                      color: severityColor[obs.severity],
                      flexShrink: 0,
                      textTransform: "uppercase",
                      marginTop: 1,
                    }}
                  >
                    {obs.severity}
                  </span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{obs.text}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>
                      {obs.id} · {obs.band} · {obs.context}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {obs.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.06)",
                            color: C.muted,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{obs.timestamp}</div>
                </div>
              ))}
            </div>

            {/* Test Coverage Matrix */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 32, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Test Coverage Matrix</span>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {COVERAGE.map((cell) => (
                  <div key={cell.band} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* Band */}
                    <div style={{ width: 140, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{cell.band}</div>
                    </div>
                    {/* Skills chips */}
                    <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
                      {cell.skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            fontSize: 11,
                            padding: "3px 9px",
                            borderRadius: 6,
                            background: coverageStatusBg[cell.status],
                            color: coverageStatusColor[cell.status],
                            border: `1px solid ${coverageStatusColor[cell.status]}30`,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {/* Last tested */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: coverageStatusColor[cell.status] }}>
                        {cell.status === "untested" ? "Not tested" : cell.lastTested}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, textTransform: "capitalize", marginTop: 1 }}>{cell.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 20, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
              <Link href="/owner" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
                ← Owner Home
              </Link>
              <Link href="/owner/routes" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
                All Routes
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
