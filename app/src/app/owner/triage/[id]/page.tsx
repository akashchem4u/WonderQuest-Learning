import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { getOwnerOverview, getOwnerTriageDetail } from "@/lib/prototype-service";
import OwnerGate from "../../owner-gate";

export const dynamic = "force-dynamic";

type OwnerTriageDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

// ── Color helpers ──────────────────────────────────────────────────────────

function urgencyColor(urgency: string): string {
  const u = urgency.toLowerCase();
  if (u === "critical") return "#ff7b6b";
  if (u === "high") return "#ffd166";
  if (u === "medium") return "#9b72ff";
  return "#58e8c1";
}

function urgencyBg(urgency: string): string {
  const u = urgency.toLowerCase();
  if (u === "critical") return "rgba(255,123,107,0.12)";
  if (u === "high") return "rgba(255,209,102,0.12)";
  if (u === "medium") return "rgba(155,114,255,0.12)";
  return "rgba(88,232,193,0.12)";
}

function urgencyBorder(urgency: string): string {
  const u = urgency.toLowerCase();
  if (u === "critical") return "rgba(255,123,107,0.3)";
  if (u === "high") return "rgba(255,209,102,0.3)";
  if (u === "medium") return "rgba(155,114,255,0.3)";
  return "rgba(88,232,193,0.3)";
}

function routeEmoji(target: string): string {
  if (target === "content") return "📚";
  if (target === "engineering") return "⚙️";
  return "🧭";
}

function nextStepText(target: string): string {
  if (target === "content")
    return "Review the related content pack first, then decide whether this needs a content fix or a backlog note.";
  if (target === "engineering")
    return "Verify the affected area and decide whether this is a bug fix, regression, or launch blocker.";
  return "Confirm the details, capture an owner note, and assign the next action clearly.";
}

// ── Shared inline-style tokens ─────────────────────────────────────────────

const BASE = "#100b2e";
const CARD_BG = "rgba(255,255,255,0.05)";
const CARD_BORDER = "rgba(255,255,255,0.1)";
const CARD_BORDER_EM = "rgba(255,255,255,0.14)";
const TEXT = "#ffffff";
const TEXT_MUTED = "rgba(216,240,234,0.6)";
const TEXT_DIM = "rgba(216,240,234,0.35)";
const MINT = "#58e8c1";
const VIOLET = "#9b72ff";
const GOLD = "#ffd166";

export default async function OwnerTriageDetailPage({
  params,
}: OwnerTriageDetailPageProps) {
  const configured = isOwnerAccessConfigured();
  const unlocked = await hasOwnerAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <main
          style={{
            minHeight: "100vh",
            background: BASE,
            padding: "32px 24px",
            fontFamily: "'Sora', system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: MINT,
                }}
              >
                Owner console
              </span>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: TEXT,
                  marginTop: 8,
                  lineHeight: 1.3,
                }}
              >
                Owner access required.
              </h1>
              <p style={{ color: TEXT_MUTED, marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
                Triage detail is behind the same owner gate as the main console.
              </p>
            </div>
            <ShellCard className="shell-card-emphasis" eyebrow="Owner" title="Unlock owner console">
              <OwnerGate configured={configured} />
            </ShellCard>
          </div>
        </main>
      </AppFrame>
    );
  }

  const { id } = await params;
  let detail: Awaited<ReturnType<typeof getOwnerTriageDetail>> | null = null;
  let overview: Awaited<ReturnType<typeof getOwnerOverview>> | null = null;
  let error = "";

  try {
    [detail, overview] = await Promise.all([
      getOwnerTriageDetail(id),
      getOwnerOverview(),
    ]);
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Owner triage detail is not available.";
  }

  const routeContext =
    detail && overview
      ? [
          {
            label: "Assigned to",
            value: detail.routingTarget,
            detail:
              detail.routingTarget === "content"
                ? `${overview.counts.exampleItems} example items · ${overview.counts.explainers} explainers live`
                : `${overview.counts.sessions} sessions recorded`,
          },
          {
            label: "Review status",
            value: detail.reviewStatus,
            detail: detail.reviewerNote
              ? detail.reviewerNote
              : "No reviewer note has been captured yet.",
          },
        ]
      : [];

  // ── Stat tile component (inline) ─────────────────────────────────────────
  const StatTileInline = ({
    label,
    value,
    detail: tileDetail,
    accent,
  }: {
    label: string;
    value: string;
    detail: string;
    accent?: string;
  }) => (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 12,
        padding: "16px 20px",
        minWidth: 120,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          color: TEXT_MUTED,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: accent ?? TEXT,
          marginBottom: 4,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: TEXT_DIM }}>{tileDetail}</div>
    </div>
  );

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main
        style={{
          minHeight: "100vh",
          background: BASE,
          padding: "32px 24px 48px",
          fontFamily: "'Sora', system-ui, sans-serif",
          color: TEXT,
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* ── Back link ── */}
          <div style={{ marginBottom: 24 }}>
            <Link
              href="/owner"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: TEXT_MUTED,
                textDecoration: "none",
              }}
            >
              ← Owner Console
            </Link>
          </div>

          {/* ── Hero header ── */}
          <div style={{ marginBottom: 32 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                color: MINT,
                display: "block",
                marginBottom: 8,
              }}
            >
              Owner Triage
            </span>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: TEXT,
                lineHeight: 1.25,
                marginBottom: 12,
              }}
            >
              Review issue, assign next steps
            </h1>

            {/* ── 3 stat tiles ── */}
            {detail ? (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap" as const,
                  marginTop: 20,
                }}
              >
                <StatTileInline
                  label="Urgency"
                  value={detail.urgency}
                  detail={detail.category}
                  accent={urgencyColor(detail.urgency)}
                />
                <StatTileInline
                  label="Route"
                  value={detail.routingTarget}
                  detail={detail.impactedArea ?? "General product flow"}
                  accent={VIOLET}
                />
                <StatTileInline
                  label={detail.confidence === null ? "Confidence" : "Confidence"}
                  value={detail.confidence === null ? "manual" : `${detail.confidence}%`}
                  detail={formatShortDate(detail.createdAt)}
                  accent={GOLD}
                />
              </div>
            ) : null}
          </div>

          {/* ── Error state ── */}
          {error ? (
            <div
              style={{
                background: "rgba(255,123,107,0.08)",
                border: "1px solid rgba(255,123,107,0.25)",
                borderRadius: 12,
                padding: "24px 28px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ff7b6b",
                  marginBottom: 8,
                }}
              >
                Triage detail is not available
              </div>
              <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 16 }}>
                {error}
              </p>
              <Link
                href="/owner"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: MINT,
                  textDecoration: "none",
                }}
              >
                ← Back to owner console
              </Link>
            </div>
          ) : null}

          {/* ── Main content ── */}
          {detail && overview ? (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>

              {/* ── Issue summary card (full width) ── */}
              <div
                style={{
                  background: CARD_BG,
                  border: `1px solid ${CARD_BORDER_EM}`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    padding: "14px 22px",
                    borderBottom: `1px solid ${CARD_BORDER}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: TEXT_MUTED,
                    }}
                  >
                    Issue summary
                  </span>
                </div>

                <div style={{ padding: "20px 22px" }}>
                  {/* Category badge + chips */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap" as const,
                      marginBottom: 14,
                    }}
                  >
                    {/* Category chip */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: 99,
                        background: "rgba(155,114,255,0.15)",
                        border: "1px solid rgba(155,114,255,0.3)",
                        color: VIOLET,
                      }}
                    >
                      {detail.category}
                    </span>
                    {/* Urgency chip */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: 99,
                        background: urgencyBg(detail.urgency),
                        border: `1px solid ${urgencyBorder(detail.urgency)}`,
                        color: urgencyColor(detail.urgency),
                      }}
                    >
                      {detail.urgency}
                    </span>
                    {/* Status chip */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: 99,
                        background: CARD_BG,
                        border: `1px solid ${CARD_BORDER}`,
                        color: TEXT_MUTED,
                      }}
                    >
                      {detail.reviewStatus}
                    </span>
                  </div>

                  {/* Student name */}
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: TEXT,
                      marginBottom: 10,
                    }}
                  >
                    {detail.studentDisplayName ?? "Student name not available"}
                  </div>

                  {/* Message */}
                  <p
                    style={{
                      fontSize: 14,
                      color: TEXT_MUTED,
                      lineHeight: 1.65,
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${CARD_BORDER}`,
                      borderRadius: 8,
                      padding: "12px 16px",
                      marginBottom: 14,
                    }}
                  >
                    {detail.message}
                  </p>

                  {/* Source / impacted area chips */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap" as const,
                      marginBottom: 20,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: 99,
                        background: CARD_BG,
                        border: `1px solid ${CARD_BORDER}`,
                        color: TEXT_MUTED,
                      }}
                    >
                      {detail.sourceChannel}
                    </span>
                    {detail.impactedArea ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 12px",
                          borderRadius: 99,
                          background: "rgba(88,232,193,0.08)",
                          border: "1px solid rgba(88,232,193,0.2)",
                          color: MINT,
                        }}
                      >
                        {detail.impactedArea}
                      </span>
                    ) : null}
                  </div>

                  {/* Recommended next step banner */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      background: "rgba(155,114,255,0.08)",
                      border: "1px solid rgba(155,114,255,0.2)",
                      borderRadius: 10,
                      padding: "14px 18px",
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden="true">
                      🧭
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: VIOLET,
                          marginBottom: 5,
                        }}
                      >
                        Recommended next step
                      </div>
                      <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>
                        {nextStepText(detail.routingTarget)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Bottom row: 3 cards ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Platform health context */}
                <div
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "13px 18px",
                      borderBottom: `1px solid ${CARD_BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase" as const,
                        color: TEXT_MUTED,
                        marginBottom: 2,
                      }}
                    >
                      Context
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                      Related platform health
                    </div>
                  </div>
                  <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
                    {routeContext.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${CARD_BORDER}`,
                          borderRadius: 8,
                          padding: "10px 14px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase" as const,
                            color: TEXT_DIM,
                            marginBottom: 4,
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: TEXT,
                            marginBottom: 3,
                            textTransform: "capitalize" as const,
                          }}
                        >
                          {item.value}
                        </div>
                        <div style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5 }}>
                          {item.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content health card */}
                <div
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "13px 18px",
                      borderBottom: `1px solid ${CARD_BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase" as const,
                        color: TEXT_MUTED,
                        marginBottom: 2,
                      }}
                    >
                      Content context
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                      Current content health
                    </div>
                  </div>
                  <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column" as const, gap: 14 }}>
                    {/* Example items meter */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                          Example items
                        </span>
                        <span style={{ fontSize: 12, color: TEXT_MUTED }}>
                          {overview.counts.exampleItems} live
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                        aria-hidden="true"
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 99,
                            background:
                              overview.counts.exampleItems >= 12 ? MINT : GOLD,
                            width: `${Math.min(
                              (overview.counts.exampleItems / 12) * 100,
                              100,
                            )}%`,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                    {/* Explainers meter */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                          Explainers
                        </span>
                        <span style={{ fontSize: 12, color: TEXT_MUTED }}>
                          {overview.counts.explainers} live
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                        aria-hidden="true"
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 99,
                            background:
                              overview.counts.explainers >= 8 ? MINT : GOLD,
                            width: `${Math.min(
                              (overview.counts.explainers / 8) * 100,
                              100,
                            )}%`,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution notes card */}
                <div
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "13px 18px",
                      borderBottom: `1px solid ${CARD_BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase" as const,
                        color: TEXT_MUTED,
                        marginBottom: 2,
                      }}
                    >
                      Resolution notes
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                      How this item should close
                    </div>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color:
                          detail.reviewStatus === "resolved" ? MINT : GOLD,
                        marginBottom: 10,
                      }}
                    >
                      {detail.reviewStatus === "resolved"
                        ? "Resolved item"
                        : "Ready for owner note"}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: TEXT_MUTED,
                        lineHeight: 1.65,
                      }}
                    >
                      {detail.reviewerNote
                        ? detail.reviewerNote
                        : "Add a note with what changed, who owns the next action, and current status — fixed, deferred, or still in review."}
                    </p>
                  </div>
                  {/* Routing emoji accent */}
                  <div
                    style={{
                      padding: "12px 18px",
                      borderTop: `1px solid ${CARD_BORDER}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }} aria-hidden="true">
                      {routeEmoji(detail.routingTarget)}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: TEXT_DIM,
                        fontWeight: 600,
                        textTransform: "capitalize" as const,
                      }}
                    >
                      Routed to {detail.routingTarget}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── Bottom nav ── */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 40,
              paddingTop: 24,
              borderTop: `1px solid ${CARD_BORDER}`,
            }}
          >
            <Link
              href="/owner"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: BASE,
                textDecoration: "none",
                background: MINT,
                borderRadius: 8,
                padding: "10px 20px",
                display: "inline-block",
              }}
            >
              Owner Console
            </Link>
            <Link
              href="/teacher"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: TEXT_MUTED,
                textDecoration: "none",
                background: CARD_BG,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: 8,
                padding: "10px 20px",
                display: "inline-block",
              }}
            >
              Classroom Board
            </Link>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
