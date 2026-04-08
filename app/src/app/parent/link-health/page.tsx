"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  blue: "#38bdf8",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.52)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

type LinkHealthLink = {
  linkId: string;
  studentId: string | null;
  username: string | null;
  displayName: string | null;
  launchBandCode: string | null;
  hasStudentProfile: boolean;
  dashboardReady: boolean;
  issue: string | null;
};

type LinkHealthResponse = {
  guardianId: string;
  repairedBrokenLinks: number;
  linkedChildren: number;
  healthy: boolean;
  links: LinkHealthLink[];
};

function bandLabel(code: string | null): string {
  if (!code) return "Unknown band";
  const upper = code.trim().toUpperCase();
  if (upper === "PREK" || upper === "P0") return "Pre-K";
  if (upper === "K1" || upper === "P1") return "K–1";
  if (upper === "G23" || upper === "P2") return "G2–3";
  if (upper === "G45" || upper === "P3") return "G4–5";
  return code;
}

function bandTone(code: string | null) {
  const upper = code?.trim().toUpperCase() ?? "";
  if (upper === "PREK" || upper === "P0") return { bg: "rgba(255,209,102,0.12)", color: C.gold };
  if (upper === "K1" || upper === "P1") return { bg: "rgba(155,114,255,0.12)", color: C.violet };
  if (upper === "G23" || upper === "P2") return { bg: "rgba(88,232,193,0.12)", color: C.mint };
  if (upper === "G45" || upper === "P3") return { bg: "rgba(56,189,248,0.12)", color: C.blue };
  return { bg: "rgba(255,255,255,0.08)", color: C.text };
}

function issueMeta(link: LinkHealthLink) {
  if (!link.studentId || !link.hasStudentProfile) {
    return {
      label: "Missing student profile",
      copy: "The guardian-child link exists, but the child profile could not be found. Recovery can create or reconnect the child record.",
      tone: "rgba(245,158,11,0.14)",
      color: C.gold,
      icon: "⚠️",
    };
  }

  if (!link.dashboardReady) {
    return {
      label: "Dashboard sync needed",
      copy: "The child profile exists, but the dashboard data could not be fetched yet. The recovery flow can re-check the connection.",
      tone: "rgba(255,123,107,0.12)",
      color: C.coral,
      icon: "🛟",
    };
  }

  return {
    label: "Healthy",
    copy: "The child profile and dashboard are both reachable.",
    tone: "rgba(88,232,193,0.12)",
    color: C.mint,
    icon: "✅",
  };
}

function StatusPill({ healthy, loading }: { healthy: boolean; loading: boolean }) {
  if (loading) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(56,189,248,0.12)",
          color: C.blue,
          border: "1px solid rgba(56,189,248,0.22)",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: ".06em",
          textTransform: "uppercase",
        }}
      >
        <span aria-hidden="true">⏳</span>
        Checking
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        background: healthy ? "rgba(88,232,193,0.12)" : "rgba(245,158,11,0.14)",
        color: healthy ? C.mint : C.gold,
        border: `1px solid ${healthy ? "rgba(88,232,193,0.22)" : "rgba(245,158,11,0.25)"}`,
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: ".06em",
        textTransform: "uppercase",
      }}
    >
      <span aria-hidden="true">{healthy ? "💚" : "⚠️"}</span>
      {healthy ? "All clear" : "Needs attention"}
    </span>
  );
}

function SummaryCard({
  value,
  label,
  icon,
  tone,
}: {
  value: string;
  label: string;
  icon: string;
  tone: string;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 18,
        minHeight: 104,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: tone,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          marginBottom: 14,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 950, color: C.text, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>
        {label}
      </div>
    </div>
  );
}

function LinkRow({ link }: { link: LinkHealthLink }) {
  const meta = issueMeta(link);
  const tone = bandTone(link.launchBandCode);

  return (
    <article
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: C.text }}>
              {link.displayName ?? link.username ?? "Linked child"}
            </h3>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: tone.bg,
                color: tone.color,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {bandLabel(link.launchBandCode)}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.6, color: C.muted, maxWidth: 640 }}>
            {meta.copy}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px",
              borderRadius: 999,
              background: meta.tone,
              color: meta.color,
              fontSize: 11,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            <span aria-hidden="true">{meta.icon}</span>
            {meta.label}
          </span>
          {link.studentId ? (
            <span style={{ fontSize: 11, color: C.muted }}>
              Student ID {link.studentId.slice(0, 8)}…
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {link.dashboardReady ? (
          <Link
            href="/parent/family"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: `1px solid rgba(88,232,193,0.22)`,
              background: "rgba(88,232,193,0.1)",
              color: C.mint,
              fontSize: 13,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Open Family Hub
          </Link>
        ) : null}
        <Link
          href="/parent/linking-recovery"
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: `1px solid rgba(155,114,255,0.28)`,
            background: "rgba(155,114,255,0.12)",
            color: C.violet,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Open recovery flow
        </Link>
      </div>
    </article>
  );
}

export default function ParentLinkHealthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LinkHealthResponse | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/parent/link-health");
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/parent");
            return;
          }
          throw new Error(
            typeof payload?.error === "string" && payload.error.trim()
              ? payload.error
              : "Link health lookup failed.",
          );
        }

        if (!cancelled) {
          setData(payload as LinkHealthResponse);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Link health lookup failed.");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshNonce, router]);

  const healthy = data?.healthy ?? false;
  const links = data?.links ?? [];
  const brokenCount = links.filter((link) => !link.hasStudentProfile || !link.dashboardReady).length;
  const dashboardReadyCount = links.filter((link) => link.dashboardReady).length;

  return (
    <AppFrame audience="parent" currentPath="/parent/link-health">
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(155,114,255,0.16), transparent 24%), radial-gradient(circle at top right, rgba(88,232,193,0.11), transparent 20%), linear-gradient(180deg, #100b2e 0%, #0d0a22 100%)",
          padding: "28px 24px 56px",
          color: C.text,
        }}
      >
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.6fr)",
              gap: 16,
              marginBottom: 16,
              alignItems: "stretch",
            }}
          >
            <section
              style={{
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, rgba(155,114,255,0.16), rgba(88,232,193,0.08))",
                border: `1px solid ${C.border}`,
                borderRadius: 22,
                padding: 24,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: "auto -50px -40px auto",
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid rgba(255,255,255,0.08)`,
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                  }}
                >
                  <span aria-hidden="true">🔗</span>
                  Parent link health
                </div>
                <h1 style={{ margin: "14px 0 10px", fontSize: 30, lineHeight: 1.1, fontWeight: 950, color: C.text }}>
                  See whether every child profile is linked, reachable, and ready to open.
                </h1>
                <p style={{ margin: 0, maxWidth: 720, fontSize: 14, lineHeight: 1.7, color: "rgba(240,246,255,0.8)" }}>
                  We check the guardian-child links already stored on your account, verify that each child
                  profile still exists, and confirm the dashboard can load. If anything is broken, use the
                  recovery flow right away.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
                  <StatusPill healthy={healthy} loading={loading} />
                  {data?.repairedBrokenLinks ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: "rgba(88,232,193,0.12)",
                        color: C.mint,
                        border: "1px solid rgba(88,232,193,0.22)",
                        fontSize: 11,
                        fontWeight: 900,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Auto-repaired {data.repairedBrokenLinks} broken link{data.repairedBrokenLinks === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <Link
                    href="/parent/linking-recovery"
                    style={{
                      padding: "11px 15px",
                      borderRadius: 12,
                      border: `1px solid rgba(155,114,255,0.28)`,
                      background: "rgba(155,114,255,0.12)",
                      color: C.violet,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Open recovery flow
                  </Link>
                  <Link
                    href="/parent/link"
                    style={{
                      padding: "11px 15px",
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      background: "rgba(255,255,255,0.04)",
                      color: C.text,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Add a child
                  </Link>
                </div>
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <SummaryCard
                value={loading ? "…" : String(data?.linkedChildren ?? 0)}
                label="Linked children"
                icon="👧"
                tone="rgba(56,189,248,0.12)"
              />
              <SummaryCard
                value={loading ? "…" : String(dashboardReadyCount)}
                label="Dashboard-ready"
                icon="✅"
                tone="rgba(88,232,193,0.12)"
              />
              <SummaryCard
                value={loading ? "…" : String(brokenCount)}
                label="Needs recovery"
                icon="🛟"
                tone="rgba(245,158,11,0.12)"
              />
              <SummaryCard
                value={loading ? "…" : String(data?.repairedBrokenLinks ?? 0)}
                label="Auto-repaired"
                icon="🔧"
                tone="rgba(155,114,255,0.12)"
              />
            </section>
          </div>

          {error ? (
            <div
              style={{
                background: "rgba(255,123,107,0.09)",
                border: "1px solid rgba(255,123,107,0.22)",
                borderRadius: 18,
                padding: "14px 16px",
                marginBottom: 16,
                color: C.coral,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              <strong>Could not load link health.</strong> {error}
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setRefreshNonce((current) => current + 1)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,123,107,0.35)",
                    background: "rgba(255,123,107,0.12)",
                    color: C.coral,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.7fr)",
              gap: 16,
              alignItems: "start",
            }}
          >
            <section
              style={{
                background: "rgba(22,27,34,0.96)",
                border: `1px solid ${C.border}`,
                borderRadius: 22,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>
                    Linked children
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: C.muted }}>
                    {loading ? "Checking link state…" : healthy ? "Everything is ready to open." : "Some children need recovery."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRefreshNonce((current) => current + 1)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    background: "rgba(255,255,255,0.04)",
                    color: C.text,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      style={{
                        minHeight: 124,
                        borderRadius: 18,
                        border: `1px solid ${C.border}`,
                        background: C.surface,
                        opacity: 0.75,
                      }}
                    />
                  ))}
                </div>
              ) : links.length > 0 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {links.map((link) => (
                    <LinkRow key={link.linkId} link={link} />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 18,
                    padding: "32px 24px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 42, marginBottom: 12 }}>🌱</div>
                  <div style={{ fontSize: 18, fontWeight: 950, color: C.text }}>
                    No linked children yet
                  </div>
                  <p style={{ margin: "10px auto 0", maxWidth: 470, fontSize: 13, lineHeight: 1.7, color: C.muted }}>
                    Add a child to your account or use the recovery flow if you expected a child to already
                    be linked.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                    <Link
                      href="/parent/link"
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        background: "rgba(255,255,255,0.04)",
                        color: C.text,
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      Add a child
                    </Link>
                    <Link
                      href="/parent/linking-recovery"
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: `1px solid rgba(155,114,255,0.28)`,
                        background: "rgba(155,114,255,0.12)",
                        color: C.violet,
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      Open recovery flow
                    </Link>
                  </div>
                </div>
              )}
            </section>

            <aside style={{ display: "grid", gap: 16 }}>
              <section
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 22,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 12 }}>
                  What to do next
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    {
                      icon: "🔍",
                      title: "Broken profile",
                      text: "The guardian-child link exists, but the child profile is missing. Use recovery to reconnect or create the child record.",
                    },
                    {
                      icon: "🛟",
                      title: "Dashboard sync issue",
                      text: "The child profile is present, but the dashboard could not load. The recovery flow rechecks the link and access path.",
                    },
                    {
                      icon: "👨‍👩‍👧",
                      title: "No linked children",
                      text: "Add a child to this account, then come back here to confirm the link is healthy.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: "10px 0",
                        borderTop: `1px solid ${C.border}`,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{item.title}</div>
                        <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.6, color: C.muted }}>
                          {item.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 22,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 12 }}>
                  Recovery shortcuts
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { href: "/parent/linking-recovery", label: "Open recovery flow" },
                    { href: "/parent/link", label: "Add a child" },
                    { href: "/parent/family", label: "Family Hub" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: `1px solid ${C.border}`,
                        background: "rgba(255,255,255,0.03)",
                        color: C.text,
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {item.label}
                      <span aria-hidden="true" style={{ color: C.violet }}>
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
