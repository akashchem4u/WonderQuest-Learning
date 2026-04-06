import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  bg: "#0d1117",
  bgDeep: "#010409",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
  // Band accent colours per design spec
  bandP0: "#ffd166",
  bandP1: "#9b72ff",
  bandP2: "#58e8c1",
  bandP3: "#ff7b6b",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  borderFaint: "rgba(255,255,255,0.04)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  faint: "rgba(255,255,255,0.07)",
} as const;

// ── Stubbed data ──────────────────────────────────────────────────────────────
const TOP_STATS = [
  { label: "Total Skills", value: "284", delta: "+12 this month", deltaColor: C.mint },
  { label: "Published Live", value: "278", delta: "97.9%", deltaColor: C.mint },
  { label: "Under Review", value: "3", delta: "+2 vs last month", deltaColor: C.amber },
  { label: "Blocked", value: "3", delta: "Locked from delivery", deltaColor: C.amber },
  { label: "Error Reports", value: "14", delta: "7d rolling", deltaColor: C.amber },
];

type BandSummary = {
  code: string;
  label: string;
  color: string;
  skills: number;
  live: number;
  review: number;
  blocked: number;
};

const BANDS: BandSummary[] = [
  { code: "P0", label: "P0 Pre-K", color: C.bandP0, skills: 42, live: 41, review: 1, blocked: 0 },
  { code: "P1", label: "P1 K-1", color: C.bandP1, skills: 68, live: 66, review: 2, blocked: 0 },
  { code: "P2", label: "P2 G2-3", color: C.bandP2, skills: 96, live: 93, review: 0, blocked: 3 },
  { code: "P3", label: "P3 G4-5", color: C.bandP3, skills: 78, live: 78, review: 0, blocked: 0 },
];

type ReviewItem = {
  priority: "HIGH" | "MED";
  title: string;
  meta: string;
  band: string;
  bandColor: string;
  status: "Blocked" | "Review";
  statusColor: string;
};

const REVIEW_QUEUE: ReviewItem[] = [
  {
    priority: "HIGH",
    title: "Fractions: Mixed Numbers — wrong answer marked correct",
    meta: "Reported by: Teacher, Maplewood School · 2d ago · 8 teacher reports + auto-flag",
    band: "P2 G2-3",
    bandColor: C.bandP2,
    status: "Blocked",
    statusColor: C.red,
  },
  {
    priority: "HIGH",
    title: "Division: Remainders — unclear question wording",
    meta: "Reported by: 3 teachers, multiple schools · 5d ago",
    band: "P2 G2-3",
    bandColor: C.bandP2,
    status: "Blocked",
    statusColor: C.red,
  },
  {
    priority: "MED",
    title: "Phonics: Consonant Blends — image asset broken on iOS",
    meta: "Auto-detected: asset 404 · CDN issue · 1d ago",
    band: "P1 K-1",
    bandColor: C.bandP1,
    status: "Review",
    statusColor: C.amber,
  },
  {
    priority: "MED",
    title: "Subtraction: Borrowing — difficulty calibration off (skip rate 78%)",
    meta: "Auto-flag: skip rate >60% threshold triggered · 3d ago",
    band: "P0 Pre-K",
    bandColor: C.bandP0,
    status: "Review",
    statusColor: C.amber,
  },
  {
    priority: "MED",
    title: "Reading Comprehension: Main Idea — locked per release gate warning",
    meta: "Release gate: v2.5 warning item. Locked at launch. Curriculum review pending.",
    band: "P1 K-1",
    bandColor: C.bandP1,
    status: "Blocked",
    statusColor: C.red,
  },
];

type ErrorSubject = {
  subject: string;
  reports: string;
  pct: number;
  color: string;
};

const ERROR_BY_SUBJECT: ErrorSubject[] = [
  { subject: "Mathematics", reports: "8 reports", pct: 68, color: C.red },
  { subject: "Reading", reports: "3 reports", pct: 25, color: C.amber },
  { subject: "Phonics", reports: "2 reports", pct: 20, color: C.amber },
  { subject: "Vocabulary", reports: "1 report", pct: 8, color: C.mint },
  { subject: "Spelling", reports: "0 reports", pct: 0, color: C.mint },
];

const STATUS_SUMMARY = [
  { label: "Published live", value: "278", color: C.mint },
  { label: "Under review (skill live)", value: "3", color: C.amber },
  { label: "Blocked (delivery locked)", value: "3", color: C.red },
  { label: "Draft / unreleased", value: "32", color: C.muted },
  { label: "Total in catalogue", value: "316", color: C.text },
];

const RECENT_ACTIONS = [
  { title: "Fractions: Equivalent — Review resolved, published", meta: "3d ago · Curriculum team" },
  { title: "Addition: 3-digit — New skill published", meta: "5d ago · v2.5 release" },
  { title: "Phonics: Long Vowels — Asset update (image replaced)", meta: "6d ago · Content team" },
];

const AUTO_FLAGS = [
  { label: "Skip rate", value: "> 60%" },
  { label: "Wrong-as-correct", value: "> 2 reports" },
  { label: "Asset 404", value: "Instant" },
  { label: "Avg session abort mid-skill", value: "> 40%" },
];

export default async function OwnerContentPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  if (!allowed) {
    return <OwnerGate configured={configured} />;
  }

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "grid",
          gap: "0",
        }}
      >
        {/* ── Shell ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: C.bg,
            borderRadius: "16px",
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >
          {/* ── Header bar ──────────────────────────────────────────────── */}
          <div
            style={{
              background: C.bgDeep,
              padding: "0 24px",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link
                href="/owner"
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: C.mint,
                  textDecoration: "none",
                }}
              >
                ← Owner Console
              </Link>
              <span style={{ fontSize: "12px", color: C.muted }}>/</span>
              <div style={{ fontSize: "14px", fontWeight: 800, color: C.text }}>
                📚 Content Health
              </div>
              <div style={{ fontSize: "11px", color: C.muted }}>Skills · Questions · Reviews</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: C.amber }}>3 Under Review</span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: C.mint,
                  border: `1px solid rgba(80,232,144,0.25)`,
                  padding: "4px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ↓ Export
              </span>
            </div>
          </div>

          {/* ── Top stats strip ─────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: "1px",
              background: C.border,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {TOP_STATS.map((stat) => (
              <div key={stat.label} style={{ background: C.bg, padding: "16px 20px" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: C.text }}>{stat.value}</div>
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginTop: "2px" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: stat.deltaColor, marginTop: "4px" }}>
                  {stat.delta}
                </div>
              </div>
            ))}
          </div>

          {/* ── Body layout ─────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 0 }}>

            {/* ── Main column ─────────────────────────────────────────── */}
            <div style={{ padding: "20px 24px", borderRight: `1px solid ${C.border}` }}>

              {/* Band health grid */}
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: C.muted,
                  marginBottom: "12px",
                  paddingBottom: "6px",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Content Health by Band
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                {BANDS.map((band) => (
                  <div
                    key={band.code}
                    style={{
                      background: C.surface,
                      borderRadius: "10px",
                      padding: "12px 14px",
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: band.color, marginBottom: "6px" }}>
                      {band.label}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 900, color: C.text }}>{band.skills}</div>
                    <div style={{ fontSize: "9px", color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Skills</div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "1px 5px",
                          borderRadius: "3px",
                          background: "rgba(80,232,144,0.12)",
                          color: C.mint,
                        }}
                      >
                        {band.live} Live
                      </span>
                      {band.review > 0 ? (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "3px",
                            background: "rgba(245,158,11,0.12)",
                            color: C.amber,
                          }}
                        >
                          {band.review} Review
                        </span>
                      ) : null}
                      {band.blocked > 0 ? (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "3px",
                            background: "rgba(248,81,73,0.12)",
                            color: C.red,
                          }}
                        >
                          {band.blocked} Blocked
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Review queue */}
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: C.muted,
                  marginBottom: "12px",
                  paddingBottom: "6px",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Content Review Queue
              </div>
              <div
                style={{
                  background: C.surface,
                  borderRadius: "12px",
                  padding: "16px 18px",
                  marginBottom: "14px",
                  border: `1px solid rgba(255,255,255,0.05)`,
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: C.muted, letterSpacing: "0.06em", marginBottom: "12px" }}>
                  Items requiring review (curriculum team)
                </div>
                {REVIEW_QUEUE.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "8px 0",
                      borderBottom: i < REVIEW_QUEUE.length - 1 ? `1px solid ${C.borderFaint}` : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "3px",
                        flexShrink: 0,
                        marginTop: "1px",
                        background: item.priority === "HIGH" ? "rgba(248,81,73,0.15)" : "rgba(245,158,11,0.12)",
                        color: item.priority === "HIGH" ? C.red : C.amber,
                      }}
                    >
                      {item.priority}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "10px", color: C.muted, marginTop: "1px" }}>
                        {item.meta}
                      </div>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "1px 5px",
                          borderRadius: "3px",
                          display: "inline-block",
                          marginTop: "4px",
                          background: `rgba(${item.bandColor === C.bandP2 ? "88,232,193" : item.bandColor === C.bandP1 ? "155,114,255" : "255,209,102"},.12)`,
                          color: item.bandColor,
                        }}
                      >
                        {item.band}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "4px",
                        flexShrink: 0,
                        alignSelf: "flex-start",
                        background: item.status === "Blocked" ? "rgba(248,81,73,0.12)" : "rgba(245,158,11,0.12)",
                        color: item.statusColor,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Error rate by subject */}
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: C.muted,
                  marginBottom: "12px",
                  paddingBottom: "6px",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Error Rate by Subject Area
              </div>
              <div
                style={{
                  background: C.surface,
                  borderRadius: "12px",
                  padding: "16px 18px",
                  border: `1px solid rgba(255,255,255,0.05)`,
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: C.muted, letterSpacing: "0.06em", marginBottom: "12px" }}>
                  Skip rate / error report density by subject (7d)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {ERROR_BY_SUBJECT.map((row) => (
                    <div key={row.subject} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ fontSize: "11px", color: C.muted, width: "140px" }}>{row.subject}</div>
                      <div style={{ flex: 1, background: C.faint, borderRadius: "3px", height: "6px" }}>
                        <div
                          style={{
                            width: `${row.pct}%`,
                            height: "6px",
                            borderRadius: "3px",
                            background: row.color,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: row.color, width: "62px", textAlign: "right" }}>
                        {row.reports}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Side column ─────────────────────────────────────────── */}
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Status summary */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "10px",
                  padding: "14px 16px",
                  border: `1px solid rgba(255,255,255,0.05)`,
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: C.muted, letterSpacing: "0.06em", marginBottom: "10px" }}>
                  Content Status Summary
                </div>
                {STATUS_SUMMARY.map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      fontSize: "11px",
                      borderBottom: i < STATUS_SUMMARY.length - 1 ? `1px solid ${C.borderFaint}` : "none",
                    }}
                  >
                    <span style={{ color: C.muted }}>{row.label}</span>
                    <span style={{ color: row.color, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Recent content actions */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "10px",
                  padding: "14px 16px",
                  border: `1px solid rgba(255,255,255,0.05)`,
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: C.muted, letterSpacing: "0.06em", marginBottom: "10px" }}>
                  Recent Content Actions
                </div>
                {RECENT_ACTIONS.map((action, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "5px 0",
                      borderBottom: i < RECENT_ACTIONS.length - 1 ? `1px solid ${C.borderFaint}` : "none",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: "10px", color: C.muted, marginTop: "1px" }}>
                      {action.meta}
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto-flag thresholds */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: "10px",
                  padding: "14px 16px",
                  border: `1px solid rgba(255,255,255,0.05)`,
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: C.muted, letterSpacing: "0.06em", marginBottom: "10px" }}>
                  Auto-Flag Thresholds
                </div>
                {AUTO_FLAGS.map((flag, i) => (
                  <div
                    key={flag.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      fontSize: "11px",
                      borderBottom: i < AUTO_FLAGS.length - 1 ? `1px solid ${C.borderFaint}` : "none",
                    }}
                  >
                    <span style={{ color: C.muted }}>{flag.label}</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>{flag.value}</span>
                  </div>
                ))}
              </div>

              {/* Nav links */}
              <div style={{ paddingTop: "4px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link
                  href="/owner"
                  style={{ fontSize: "12px", fontWeight: 700, color: C.mint, textDecoration: "none" }}
                >
                  ← Back to Owner Console
                </Link>
                <Link
                  href="/teacher"
                  style={{ fontSize: "12px", fontWeight: 700, color: C.muted, textDecoration: "none" }}
                >
                  Classroom view
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
