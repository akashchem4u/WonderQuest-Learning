"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const BASE    = "#100b2e";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.06)";
const VIOLET  = "#9b72ff";
const MINT    = "#22c55e";
const AMBER   = "#f59e0b";
const RED     = "#f85149";
const TEXT    = "#f0f6ff";
const MUTED   = "#8b949e";

type Screen = "already-linked" | "duplicate" | "plan-limit" | "network";

const TAB_ITEMS: { key: Screen; label: string }[] = [
  { key: "already-linked", label: "🔗 Already Linked" },
  { key: "duplicate",      label: "👯 Duplicate Name" },
  { key: "plan-limit",     label: "🔒 Plan Limit" },
  { key: "network",        label: "📡 Network Error" },
];

export default function ParentLinkingRecoveryPage() {
  const [screen, setScreen] = useState<Screen>("already-linked");
  const [retrying, setRetrying] = useState(false);
  const [retried, setRetried]   = useState(false);
  const [nickname, setNickname] = useState("");

  function handleRetry() {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      setRetried(true);
    }, 2000);
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "9px 18px",
    border: "none",
    background: active ? "rgba(155,114,255,0.15)" : "transparent",
    color: active ? VIOLET : MUTED,
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: "8px 8px 0 0",
    whiteSpace: "nowrap",
    transition: "all 0.18s",
    borderBottom: active ? `2px solid ${VIOLET}` : "2px solid transparent",
    fontFamily: "system-ui",
  });

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 500,
    background: SURFACE,
    borderRadius: 20,
    padding: "40px 36px",
    border: `1px solid ${BORDER}`,
    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
  };

  const iconWrapStyle = (bg: string): React.CSSProperties => ({
    width: 72,
    height: 72,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    margin: "0 auto 24px",
    background: bg,
  });

  const titleStyle: React.CSSProperties = {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: TEXT,
    textAlign: "center",
    marginBottom: 10,
  };

  const subStyle: React.CSSProperties = {
    fontSize: "0.88rem",
    lineHeight: 1.6,
    color: MUTED,
    textAlign: "center",
    marginBottom: 28,
  };

  const eyebrowStyle = (color: string): React.CSSProperties => ({
    fontSize: "0.72rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    textAlign: "center",
    marginBottom: 8,
    color,
  });

  const btnPrimaryStyle: React.CSSProperties = {
    width: "100%",
    padding: 14,
    background: `linear-gradient(135deg, ${VIOLET}, #5a30d0)`,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 12,
    fontFamily: "system-ui",
  };

  const btnSecondaryStyle: React.CSSProperties = {
    width: "100%",
    padding: 13,
    background: "rgba(255,255,255,0.04)",
    color: TEXT,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 12,
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 12,
    fontFamily: "system-ui",
  };

  const infoBoxStyle = (bg: string, borderColor: string): React.CSSProperties => ({
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 24,
    fontSize: "0.82rem",
    lineHeight: 1.5,
    background: bg,
    border: `1px solid ${borderColor}`,
    color: MUTED,
  });

  return (
    <AppFrame audience="parent">
      <div style={{ background: BASE, minHeight: "100vh" }}>
        {/* Tab bar */}
        <div style={{
          display: "flex",
          gap: 4,
          padding: "16px 24px 0",
          borderBottom: `1px solid ${BORDER}`,
          overflowX: "auto",
          background: "rgba(255,255,255,0.02)",
        }}>
          {TAB_ITEMS.map((t) => (
            <button key={t.key} style={tabBtnStyle(screen === t.key)} onClick={() => setScreen(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Screen content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 24px 80px",
        }}>

          {/* ── Already Linked ── */}
          {screen === "already-linked" && (
            <div style={cardStyle}>
              <div style={iconWrapStyle("rgba(245,158,11,0.15)")}>🔗</div>
              <div style={eyebrowStyle(AMBER)}>Hmm, a small issue</div>
              <div style={titleStyle}>This child may already be linked</div>
              <div style={subStyle}>
                It looks like a child named <strong style={{ color: TEXT }}>&ldquo;Maya&rdquo;</strong> is already linked to a different WonderQuest account. This can happen if your child was previously set up by a co-parent or family member.
              </div>
              <div style={infoBoxStyle("rgba(245,158,11,0.08)", "rgba(245,158,11,0.25)")}>
                <strong style={{ display: "block", fontSize: "0.84rem", marginBottom: 4, color: AMBER }}>What this usually means:</strong>
                A co-parent, grandparent, or caregiver created a WonderQuest account for this child first. You can join their family group, or contact us to transfer the child to your account.
              </div>
              <button style={btnPrimaryStyle}>📩 Send join request to existing account</button>
              <button style={btnSecondaryStyle}>Add a different child instead</button>
              <button style={btnSecondaryStyle}>🔄 I made a typo — go back</button>
              <a style={{ display: "block", textAlign: "center", marginTop: 14, fontSize: "0.78rem", fontWeight: 500, color: VIOLET, cursor: "pointer", textDecoration: "none" }}>
                Contact support to transfer account ownership →
              </a>
            </div>
          )}

          {/* ── Duplicate Name ── */}
          {screen === "duplicate" && (
            <div style={cardStyle}>
              <div style={iconWrapStyle("rgba(245,158,11,0.15)")}>👯</div>
              <div style={eyebrowStyle(AMBER)}>Name already in use</div>
              <div style={titleStyle}>There&#39;s already a &ldquo;Maya&rdquo; in your account</div>
              <div style={subStyle}>
                You have another child named Maya in your family. To keep their adventures separate, give this child a different name or nickname.
              </div>
              <div style={infoBoxStyle("rgba(155,114,255,0.08)", "rgba(155,114,255,0.25)")}>
                <strong style={{ display: "block", fontSize: "0.84rem", marginBottom: 8, color: VIOLET }}>Current family members named &ldquo;Maya&rdquo;:</strong>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${VIOLET}, #5a30d0)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}>🦁</div>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT }}>Maya (K–1)</div>
                    <div style={{ fontSize: "0.72rem", color: MUTED }}>Added March 2025</div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: MUTED, marginBottom: 7 }}>
                  New name or nickname for this child
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya J., Little Maya, Baby Maya…"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    border: `1.5px solid rgba(155,114,255,0.3)`,
                    borderRadius: 10,
                    fontSize: "0.95rem",
                    color: TEXT,
                    background: "rgba(255,255,255,0.04)",
                    outline: "none",
                    fontFamily: "system-ui",
                  }}
                />
              </div>
              <button style={btnPrimaryStyle}>Use this nickname →</button>
              <button style={btnSecondaryStyle}>← Go back and change name</button>
            </div>
          )}

          {/* ── Plan Limit ── */}
          {screen === "plan-limit" && (
            <div style={cardStyle}>
              <div style={iconWrapStyle("rgba(155,114,255,0.12)")}>👨‍👩‍👧‍👦</div>
              <div style={eyebrowStyle(VIOLET)}>Free plan limit</div>
              <div style={titleStyle}>Your free plan supports 1 child</div>
              <div style={subStyle}>
                Your current plan includes 1 child profile. Upgrade to add unlimited children and get extra benefits for your whole family.
              </div>

              {/* Upgrade card */}
              <div style={{
                background: `linear-gradient(135deg, rgba(155,114,255,0.15), rgba(90,48,208,0.1))`,
                borderRadius: 16,
                padding: 24,
                border: `1.5px solid rgba(155,114,255,0.3)`,
                marginBottom: 24,
              }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  background: VIOLET,
                  borderRadius: 20,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 12,
                }}>✨ WonderQuest Family</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                  Unlimited learning for every child
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  {[
                    "Unlimited child profiles",
                    "Unlimited daily sessions",
                    "Advanced weekly reports",
                    "Priority support",
                    "Early access to new features",
                  ].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: MUTED }}>
                      <span style={{ color: VIOLET, fontWeight: 700 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                  $9.99/month <span style={{ fontSize: "0.78rem", fontWeight: 400, color: MUTED }}>or $79/year (save 34%)</span>
                </div>
              </div>

              <button style={btnPrimaryStyle}>✨ Upgrade to Family plan →</button>
              <button style={btnSecondaryStyle}>Maybe later — stay on free plan</button>
              <div style={{ marginTop: 16, textAlign: "center", fontSize: "0.72rem", lineHeight: 1.5, color: MUTED }}>
                Free plan: 1 child, 3 sessions/day. All core learning features included.
              </div>
            </div>
          )}

          {/* ── Network Error ── */}
          {screen === "network" && (
            <div style={cardStyle}>
              <div style={iconWrapStyle("rgba(248,81,73,0.1)")}>📡</div>
              <div style={eyebrowStyle(RED)}>Connection issue</div>
              <div style={titleStyle}>Couldn&#39;t save right now</div>
              <div style={subStyle}>
                It looks like something interrupted the connection while we were saving Maya&#39;s profile. Your information wasn&#39;t lost — nothing was submitted yet.
              </div>
              <div style={infoBoxStyle("rgba(248,81,73,0.06)", "rgba(248,81,73,0.25)")}>
                <strong style={{ display: "block", fontSize: "0.84rem", marginBottom: 4, color: RED }}>What happened:</strong>
                Network timeout on profile save request. Error code: <code style={{ background: "rgba(248,81,73,0.1)", padding: "1px 4px", borderRadius: 3 }}>PROFILE_SAVE_TIMEOUT</code>. Your data was NOT saved to our servers.
              </div>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: "14px 16px",
                fontSize: "0.78rem",
                fontFamily: "monospace",
                color: MUTED,
                marginBottom: 20,
                wordBreak: "break-all",
              }}>
                Request: POST /api/children/create<br />
                Status: 408 Request Timeout<br />
                Time: 2026-03-24 09:41:23 UTC<br />
                Session: abc123...xyz (safe to retry)
              </div>

              <button
                style={{
                  ...btnPrimaryStyle,
                  background: retried
                    ? "linear-gradient(135deg, #22c55e, #15803d)"
                    : retrying
                    ? "rgba(155,114,255,0.3)"
                    : `linear-gradient(135deg, ${VIOLET}, #5a30d0)`,
                  cursor: retrying ? "not-allowed" : "pointer",
                  opacity: retrying ? 0.8 : 1,
                }}
                onClick={handleRetry}
                disabled={retrying || retried}
              >
                {retried ? "✓ Saved! Redirecting…" : retrying ? "↺ Retrying…" : "↺ Try again"}
              </button>
              <button style={btnSecondaryStyle}>← Go back and check my info</button>
              <div style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                fontSize: "0.75rem",
                lineHeight: 1.5,
                color: MUTED,
                textAlign: "center",
              }}>
                If this keeps happening, try a different network or{" "}
                <a style={{ color: VIOLET, cursor: "pointer" }}>contact support</a>.
              </div>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
