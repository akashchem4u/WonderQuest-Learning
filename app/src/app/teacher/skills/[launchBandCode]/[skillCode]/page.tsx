import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import { getTeacherSkillDetail } from "@/lib/prototype-service";
import TeacherGate from "@/app/teacher/teacher-gate";

export const dynamic = "force-dynamic";

type TeacherSkillDetailPageProps = {
  params?: Promise<{
    launchBandCode: string;
    skillCode: string;
  }>;
};

function formatSessionMode(value: string) {
  return value === "self-directed-challenge" ? "Self-directed" : "Guided";
}

function formatLastSeen(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  mint: "#58e8c1",
  violet: "#9b72ff",
  gold: "#ffd166",
  coral: "#ff7b6b",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.1)",
  text: "#ffffff",
  muted: "rgba(216,240,234,0.6)",
};

// ── Shared style objects ──────────────────────────────────────────────────────
const glassCard: React.CSSProperties = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 16,
  padding: "20px 24px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: C.mint,
  marginBottom: 6,
};

const chipStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
  background: "rgba(255,255,255,0.08)",
  border: `1px solid ${C.cardBorder}`,
  color: C.muted,
};

export default async function TeacherSkillDetailPage({
  params,
}: TeacherSkillDetailPageProps) {
  const configured = isTeacherAccessConfigured();
  const unlocked = await hasTeacherAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <main
          style={{
            minHeight: "100vh",
            background: C.base,
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxWidth: 560,
            }}
          >
            <span style={eyebrowStyle}>Classroom</span>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1.2 }}>
              Unlock dashboard access.
            </h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
              This dashboard shows class-level insights only — it is separate from
              individual student and family views.
            </p>
          </section>

          <div style={{ ...glassCard, maxWidth: 480 }}>
            <ShellCard
              className="shell-card-emphasis"
              eyebrow="Teacher"
              title="Unlock teacher dashboard"
            >
              <TeacherGate configured={configured} />
            </ShellCard>
          </div>
        </main>
      </AppFrame>
    );
  }

  const resolvedParams = params ? await params : undefined;
  const requestedSkillCode = resolvedParams?.skillCode ?? "";

  let detail: Awaited<ReturnType<typeof getTeacherSkillDetail>> | null = null;
  let error = "";

  try {
    detail = await getTeacherSkillDetail(requestedSkillCode);
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Teacher skill detail is not available.";
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <main
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "28px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* ── Header ── */}
        <section style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Link
            href="/teacher"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.mint,
              textDecoration: "none",
              marginBottom: 8,
              display: "inline-block",
            }}
          >
            ← Teacher Dashboard
          </Link>
          <span style={eyebrowStyle}>Skill Drilldown</span>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: C.text,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            {detail ? detail.skill.displayName : "Skill Overview"}
          </h1>

          {/* Stat tiles row */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {/* Accuracy */}
            <div
              style={{
                ...glassCard,
                padding: "16px 20px",
                minWidth: 130,
                flex: "1 1 130px",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: C.mint,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {detail ? `${detail.skill.masteryRate}%` : "n/a"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                Accuracy
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>Class mastery</div>
            </div>

            {/* First try */}
            <div
              style={{
                ...glassCard,
                padding: "16px 20px",
                minWidth: 130,
                flex: "1 1 130px",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: C.violet,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {detail ? `${detail.firstTryRate}%` : "n/a"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                First Try
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>Without support</div>
            </div>

            {/* Remediation */}
            <div
              style={{
                ...glassCard,
                padding: "16px 20px",
                minWidth: 130,
                flex: "1 1 130px",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: C.coral,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {detail ? `${detail.skill.remediationCount}` : "n/a"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                Remediation
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>Support triggers</div>
            </div>
          </div>
        </section>

        {/* ── Error state ── */}
        {error ? (
          <div style={{ ...glassCard, borderColor: `${C.coral}44` }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.coral, marginBottom: 8 }}>
              Error
            </div>
            <p style={{ fontSize: 14, color: C.muted }}>{error}</p>
          </div>
        ) : null}

        {/* ── Main content ── */}
        {detail ? (
          <>
            {/* Row 1: Skill overview + Tier distribution */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
                gap: 20,
              }}
            >
              {/* ── Skill overview card ── */}
              <div style={glassCard}>
                <div style={eyebrowStyle}>Skill Overview</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Band chip */}
                  <span
                    style={{
                      ...chipStyle,
                      background: `${C.mint}22`,
                      border: `1px solid ${C.mint}44`,
                      color: C.mint,
                    }}
                  >
                    {detail.skill.launchBandCode}
                  </span>
                </div>

                {/* Mastery % large */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 52,
                      fontWeight: 900,
                      color: C.mint,
                      lineHeight: 1,
                    }}
                  >
                    {detail.skill.masteryRate}%
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.muted,
                      marginTop: 4,
                    }}
                  >
                    {detail.trendLabel}
                  </div>
                </div>

                {/* Response time + correct count chips */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  <span style={chipStyle}>
                    {detail.skill.averageSeconds.toFixed(1)}s avg response
                  </span>
                  <span style={chipStyle}>
                    {detail.skill.correctAttempts} correct
                  </span>
                </div>

                {/* Suggested next move banner */}
                <div
                  style={{
                    background: `${C.gold}15`,
                    border: `1px solid ${C.gold}44`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }} aria-hidden="true">
                    🎯
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: C.gold,
                        marginBottom: 4,
                      }}
                    >
                      Suggested next move
                    </div>
                    <p style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>
                      {detail.recommendedAction}
                    </p>
                  </div>
                </div>

                {/* Peer skill links */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.muted,
                      marginBottom: 8,
                    }}
                  >
                    Change focus
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {detail.peerSkills.map((skill) => {
                      const isCurrent =
                        skill.skillCode === detail.skill.skillCode;
                      return (
                        <Link
                          key={skill.skillCode}
                          href={`/teacher/skills/${skill.launchBandCode}/${skill.skillCode}`}
                          style={{
                            ...chipStyle,
                            textDecoration: "none",
                            background: isCurrent
                              ? `${C.violet}33`
                              : "rgba(255,255,255,0.06)",
                            border: isCurrent
                              ? `1px solid ${C.violet}88`
                              : `1px solid ${C.cardBorder}`,
                            color: isCurrent ? C.violet : C.muted,
                          }}
                        >
                          {skill.displayName}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Tier distribution card ── */}
              <div style={glassCard}>
                <div style={eyebrowStyle}>Class Distribution</div>
                <p
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    marginBottom: 20,
                    lineHeight: 1.5,
                  }}
                >
                  Where learners are landing on this skill
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {/* Needs Support */}
                  <div
                    style={{
                      background: `${C.coral}15`,
                      border: `1px solid ${C.coral}44`,
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: C.coral,
                        marginBottom: 6,
                      }}
                    >
                      Needs Support
                    </div>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: C.coral,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {detail.tierCounts.support}
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                      Lower-confidence learners who likely need teacher-led
                      examples.
                    </p>
                  </div>

                  {/* Watch Closely */}
                  <div
                    style={{
                      background: `${C.gold}15`,
                      border: `1px solid ${C.gold}44`,
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: C.gold,
                        marginBottom: 6,
                      }}
                    >
                      Watch Closely
                    </div>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: C.gold,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {detail.tierCounts.watch}
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                      Mixed performance that still needs short guided practice.
                    </p>
                  </div>

                  {/* On Track */}
                  <div
                    style={{
                      background: `${C.mint}15`,
                      border: `1px solid ${C.mint}44`,
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: C.mint,
                        marginBottom: 6,
                      }}
                    >
                      On Track
                    </div>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: C.mint,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {detail.tierCounts.onTrack}
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                      Learners showing enough consistency to keep moving.
                    </p>
                  </div>

                  {/* Building Confidence */}
                  <div
                    style={{
                      background: `${C.violet}15`,
                      border: `1px solid ${C.violet}44`,
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: C.violet,
                        marginBottom: 6,
                      }}
                    >
                      Building Confidence
                    </div>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: C.violet,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {detail.tierCounts.strong}
                    </div>
                    <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                      Students who can be used as a confidence reference in class.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Recent activity card ── */}
            <div style={glassCard}>
              <div style={eyebrowStyle}>Recent Movement</div>
              <p
                style={{
                  fontSize: 12,
                  color: C.muted,
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                Latest class activity on this skill
              </p>

              {detail.recentSkillActivity.length ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {detail.recentSkillActivity.map((item) => (
                    <article
                      key={`${item.id}-${item.startedAt}`}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 10,
                        padding: "12px 16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <strong
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.text,
                          }}
                        >
                          {formatSessionMode(item.sessionMode)}
                        </strong>
                        <span style={{ fontSize: 12, color: C.muted }}>
                          {formatLastSeen(item.startedAt)}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span
                          style={{
                            ...chipStyle,
                            background: `${C.mint}22`,
                            border: `1px solid ${C.mint}44`,
                            color: C.mint,
                          }}
                        >
                          {item.launchBandCode}
                        </span>
                        <span
                          style={{
                            ...chipStyle,
                            background: item.correct
                              ? `${C.mint}15`
                              : `${C.coral}15`,
                            border: `1px solid ${item.correct ? C.mint : C.coral}44`,
                            color: item.correct ? C.mint : C.coral,
                          }}
                        >
                          {item.correct ? "Correct" : "Needs retry"}
                        </span>
                        <span
                          style={{
                            ...chipStyle,
                            background: item.firstTry
                              ? `${C.violet}15`
                              : "rgba(255,255,255,0.06)",
                            border: `1px solid ${item.firstTry ? C.violet : C.cardBorder}`,
                            color: item.firstTry ? C.violet : C.muted,
                          }}
                        >
                          {item.firstTry ? "First try" : "After support"}
                        </span>
                        <span style={chipStyle}>
                          {Math.round(item.timeSpentMs / 1000)}s
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      marginBottom: 12,
                    }}
                  >
                    📭
                  </div>
                  <strong
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: C.text,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    No activity yet
                  </strong>
                  <p
                    style={{
                      fontSize: 13,
                      color: C.muted,
                      lineHeight: 1.6,
                      maxWidth: 380,
                      margin: "0 auto",
                    }}
                  >
                    Students will appear here once they have attempted this skill.
                    Assign a session or run a guided quest to get started.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </AppFrame>
  );
}
