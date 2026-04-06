import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  mint: "#58e8c1",
  violet: "#9b72ff",
  gold: "#ffd166",
  coral: "#ff7b6b",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  faint: "rgba(255,255,255,0.12)",
} as const;

// ── Stubbed data ───────────────────────────────────────────────────────────
const STATS = [
  { label: "Questions Live", value: "1,847", color: C.mint },
  { label: "Explainers", value: "94", color: C.violet },
  { label: "Bands Covered", value: "6 / 6", color: C.gold },
  { label: "Coverage", value: "78%", color: C.coral },
];

type BandCoverage = {
  code: string;
  label: string;
  color: string;
  skills: number;
  target: number;
  density: number; // 0–1 question density bar
  status: "good" | "warn" | "alert";
};

const BANDS: BandCoverage[] = [
  { code: "P0", label: "P0 Pre-K", color: C.gold, skills: 22, target: 24, density: 0.92, status: "good" },
  { code: "P1", label: "P1 Kindergarten", color: C.mint, skills: 31, target: 32, density: 0.97, status: "good" },
  { code: "P2", label: "P2 G2–3", color: C.mint, skills: 28, target: 36, density: 0.78, status: "warn" },
  { code: "P3", label: "P3 G4–5", color: C.violet, skills: 19, target: 36, density: 0.53, status: "alert" },
  { code: "P4", label: "P4 G6–7", color: C.violet, skills: 12, target: 30, density: 0.40, status: "alert" },
  { code: "P5", label: "P5 G8+", color: C.coral, skills: 6, target: 24, density: 0.25, status: "alert" },
];

type ExplainerCoverage = {
  subject: string;
  covered: number;
  total: number;
};

const EXPLAINERS: ExplainerCoverage[] = [
  { subject: "Maths", covered: 38, total: 44 },
  { subject: "Reading", covered: 22, total: 28 },
  { subject: "Science", covered: 14, total: 22 },
  { subject: "Writing", covered: 10, total: 18 },
  { subject: "Phonics", covered: 10, total: 10 },
];

type ContentGap = {
  id: string;
  band: string;
  bandColor: string;
  subject: string;
  title: string;
  severity: "p0" | "p1" | "p2";
  note: string;
};

const GAPS: ContentGap[] = [
  {
    id: "GAP-001",
    band: "P3",
    bandColor: C.violet,
    subject: "Maths",
    title: "Long Division — no explainer",
    severity: "p0",
    note: "11 skills with no explainer asset. High skip rate expected.",
  },
  {
    id: "GAP-002",
    band: "P4",
    bandColor: C.violet,
    subject: "Science",
    title: "Chemistry Basics — 0 questions",
    severity: "p0",
    note: "Skill stubs exist but question bank is empty. Blocked from delivery.",
  },
  {
    id: "GAP-003",
    band: "P5",
    bandColor: C.coral,
    subject: "Maths",
    title: "Algebra — partial coverage (6 / 20 skills)",
    severity: "p1",
    note: "Only 30% of target skills have ≥10 questions. Remaining authored but unpublished.",
  },
  {
    id: "GAP-004",
    band: "P2",
    bandColor: C.mint,
    subject: "Writing",
    title: "Grammar — explainer images missing",
    severity: "p1",
    note: "Text content live but image assets not uploaded. 8 explainers affected.",
  },
  {
    id: "GAP-005",
    band: "P0",
    bandColor: C.gold,
    subject: "Reading",
    title: "Sight Words — below question density target",
    severity: "p2",
    note: "Average 7 questions/skill. Target is 10+. Easy to fill.",
  },
];

const severityColor: Record<ContentGap["severity"], string> = {
  p0: C.coral,
  p1: C.gold,
  p2: C.violet,
};

// ── Helper components (inline) ─────────────────────────────────────────────
function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "18px 20px",
        flex: "1 1 160px",
      }}
    >
      <div
        style={{
          fontSize: "1.9rem",
          fontWeight: 900,
          lineHeight: 1,
          color,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.68rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: C.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function DensityBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      style={{
        height: "6px",
        borderRadius: "999px",
        background: C.faint,
        marginTop: "8px",
      }}
      aria-hidden="true"
    >
      <span
        style={{
          display: "block",
          height: "100%",
          borderRadius: "inherit",
          background: color,
          width: `${Math.round(value * 100)}%`,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "0.65rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: C.muted,
        paddingBottom: "8px",
        borderBottom: `1px solid ${C.border}`,
        marginBottom: "14px",
      }}
    >
      {children}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function OwnerContentPage() {
  const configured = isOwnerAccessConfigured();
  const unlocked = await hasOwnerAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Operations</span>
              <h1>Sign in to the owner console.</h1>
              <small>Protected console. Sign in with an existing owner code.</small>
            </div>
          </section>

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Owner"
            title="Existing owner sign-in"
          >
            <OwnerGate configured={configured} />
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  const totalExplainerTarget = EXPLAINERS.reduce((s, e) => s + e.total, 0);
  const totalExplainerCovered = EXPLAINERS.reduce((s, e) => s + e.covered, 0);
  const explainerPct = Math.round((totalExplainerCovered / totalExplainerTarget) * 100);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main
        style={{
          padding: "24px",
          display: "grid",
          gap: "24px",
          background: C.base,
          minHeight: "100vh",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#010409",
            border: `1px solid ${C.border}`,
            borderRadius: "14px",
            padding: "0 22px",
            height: "52px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
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
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: C.muted,
              }}
            >
              Content Health
            </div>
            <div
              style={{ fontSize: "14px", fontWeight: 800, color: C.text }}
            >
              Learning bank coverage &amp; gaps
            </div>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: C.mint,
              border: `1px solid rgba(88,232,193,0.25)`,
              padding: "4px 12px",
              borderRadius: "6px",
            }}
          >
            ↓ Export
          </span>
        </div>

        {/* ── Stat tiles ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {STATS.map((s) => (
            <StatTile key={s.label} label={s.label} value={s.value} color={s.color} />
          ))}
        </div>

        {/* ── 3-column body ───────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,320px) minmax(0,300px)",
            gap: "18px",
            alignItems: "start",
          }}
        >
          {/* ── LEFT: Band-by-band coverage cards ──────────────────── */}
          <div style={{ display: "grid", gap: "12px" }}>
            <SectionLabel>Band-by-Band Coverage</SectionLabel>
            {BANDS.map((band) => {
              const skillPct = Math.round((band.skills / band.target) * 100);
              const statusColor =
                band.status === "good"
                  ? C.mint
                  : band.status === "warn"
                  ? C.gold
                  : C.coral;
              return (
                <div
                  key={band.code}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "16px 18px",
                  }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "5px",
                          background: `rgba(${band.color === C.gold ? "255,209,102" : band.color === C.mint ? "88,232,193" : band.color === C.violet ? "155,114,255" : "255,123,107"},.14)`,
                          color: band.color,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {band.code}
                      </span>
                      <span
                        style={{ fontSize: "13px", fontWeight: 700, color: C.text }}
                      >
                        {band.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        color: statusColor,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {band.status === "good" ? "On track" : band.status === "warn" ? "Partial" : "Gap"}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "24px",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 900,
                          color: C.text,
                          lineHeight: 1,
                        }}
                      >
                        {band.skills}
                      </div>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: C.muted,
                          marginTop: "2px",
                        }}
                      >
                        Skills live
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 900,
                          color: C.muted,
                          lineHeight: 1,
                        }}
                      >
                        {band.target}
                      </div>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: C.muted,
                          marginTop: "2px",
                        }}
                      >
                        Target
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 900,
                          color: statusColor,
                          lineHeight: 1,
                        }}
                      >
                        {skillPct}%
                      </div>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: C.muted,
                          marginTop: "2px",
                        }}
                      >
                        Coverage
                      </div>
                    </div>
                  </div>

                  {/* Question density bar */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: C.muted,
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      <span>Question density</span>
                      <span>{Math.round(band.density * 100)}%</span>
                    </div>
                    <DensityBar value={band.density} color={statusColor} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── CENTER: Explainer coverage ──────────────────────────── */}
          <div style={{ display: "grid", gap: "12px", alignContent: "start" }}>
            <SectionLabel>Explainer Coverage</SectionLabel>

            {/* Summary card */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: 900,
                    color: C.violet,
                    lineHeight: 0.9,
                  }}
                >
                  {explainerPct}%
                </span>
                <span style={{ fontSize: "0.82rem", color: C.muted, lineHeight: 1.4 }}>
                  explainer<br />coverage
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  borderRadius: "999px",
                  background: C.faint,
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    borderRadius: "inherit",
                    background: explainerPct >= 80 ? C.mint : explainerPct >= 60 ? C.gold : C.coral,
                    width: `${explainerPct}%`,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: C.muted,
                }}
              >
                {totalExplainerCovered} of {totalExplainerTarget} skills have explainer assets
              </div>
            </div>

            {/* Per-subject breakdown */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: C.muted,
                  marginBottom: "14px",
                }}
              >
                By subject
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                {EXPLAINERS.map((ex) => {
                  const pct = Math.round((ex.covered / ex.total) * 100);
                  const barColor =
                    pct >= 90 ? C.mint : pct >= 70 ? C.gold : C.coral;
                  return (
                    <div key={ex.subject}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.82rem",
                          color: C.text,
                          marginBottom: "5px",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{ex.subject}</span>
                        <span style={{ fontWeight: 800, color: barColor }}>
                          {ex.covered}/{ex.total}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "5px",
                          borderRadius: "999px",
                          background: C.faint,
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            borderRadius: "inherit",
                            background: barColor,
                            width: `${pct}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explainer health note */}
            <div
              style={{
                background: "rgba(155,114,255,0.07)",
                border: `1px solid rgba(155,114,255,0.2)`,
                borderRadius: "10px",
                padding: "13px 16px",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: C.violet, display: "block", marginBottom: "4px" }}>
                Explainer gate
              </strong>
              Skills without an explainer show a fallback text card. Image and video assets must be uploaded to the content CMS before a skill can show a rich explainer. Stubs without assets count as uncovered.
            </div>
          </div>

          {/* ── RIGHT: Gaps / missing content list ──────────────────── */}
          <div style={{ display: "grid", gap: "12px", alignContent: "start" }}>
            <SectionLabel>Gaps &amp; Missing Content ({GAPS.length})</SectionLabel>

            {GAPS.map((gap) => (
              <div
                key={gap.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                }}
              >
                {/* Top row */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: `rgba(${gap.severity === "p0" ? "255,123,107" : gap.severity === "p1" ? "255,209,102" : "155,114,255"},.15)`,
                      color: severityColor[gap.severity],
                      flexShrink: 0,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {gap.severity.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: `rgba(${gap.bandColor === C.gold ? "255,209,102" : gap.bandColor === C.mint ? "88,232,193" : gap.bandColor === C.violet ? "155,114,255" : "255,123,107"},.12)`,
                      color: gap.bandColor,
                      flexShrink: 0,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {gap.band}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: C.muted,
                      flexShrink: 0,
                    }}
                  >
                    {gap.subject}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: "5px",
                  }}
                >
                  {gap.title}
                </div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.45,
                  }}
                >
                  {gap.note}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {gap.id}
                </div>
              </div>
            ))}

            {/* Summary note */}
            <div
              style={{
                background: "rgba(255,123,107,0.06)",
                border: `1px solid rgba(255,123,107,0.18)`,
                borderRadius: "10px",
                padding: "13px 16px",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: C.coral, display: "block", marginBottom: "4px" }}>
                2 P0 gaps require immediate action
              </strong>
              P0 gaps block delivery for affected skill nodes. Resolve by adding question bank entries or uploading explainer assets in the content CMS. P1 / P2 gaps do not block delivery but degrade learning quality.
            </div>
          </div>
        </div>

        {/* ── Footer nav ──────────────────────────────────────────────── */}
        <section
          style={{
            display: "flex",
            gap: "14px",
            paddingTop: "8px",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <Link
            href="/owner"
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: C.mint,
              textDecoration: "none",
            }}
          >
            ← Back to Owner Console
          </Link>
          <Link
            href="/teacher"
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: C.muted,
              textDecoration: "none",
            }}
          >
            Classroom view
          </Link>
        </section>
      </main>
    </AppFrame>
  );
}
