"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base:    "#0f0c28",
  surface: "rgba(255,255,255,0.05)",
  border:  "rgba(255,255,255,0.10)",
  text:    "#f0f6ff",
  muted:   "rgba(255,255,255,0.50)",
  violet:  "#9b72ff",
  mint:    "#58e8c1",
  gold:    "#ffd166",
  coral:   "#ff7b6b",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
const FEEDBACK_TYPES = [
  { id: "bug",         icon: "🐛", label: "Bug",             desc: "Something is broken or not working",          color: C.coral  },
  { id: "enhancement", icon: "💡", label: "Enhancement",     desc: "An existing feature could be better",         color: C.gold   },
  { id: "feature",     icon: "✨", label: "Feature Request",  desc: "Something new you'd like to see",             color: C.violet },
  { id: "praise",      icon: "🎉", label: "Praise",           desc: "Something that works great — keep it!",       color: C.mint   },
  { id: "content",     icon: "📖", label: "Content Issue",    desc: "Wrong answer, confusing question, or error",  color: "#38bdf8" },
  { id: "general",     icon: "💬", label: "General",          desc: "Anything else on your mind",                  color: C.muted  },
] as const;

const SCREENS = [
  "Child gameplay / quiz",
  "Parent dashboard",
  "Parent — Learning Plan",
  "Parent — Reports",
  "Parent — Quiz Review",
  "Teacher dashboard",
  "Sign-in / registration",
  "Child home page",
  "Settings / profile",
  "Mobile layout",
  "Other / not sure",
];

type FeedbackType = (typeof FEEDBACK_TYPES)[number]["id"];

function detectDeviceType() {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/iphone|android|mobile/.test(ua)) return "phone";
  return "desktop";
}
function detectBrowser() {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("edg")) return "edge";
  if (ua.includes("chrome")) return "chrome";
  if (ua.includes("safari")) return "safari";
  if (ua.includes("firefox")) return "firefox";
  return "other";
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BetaFeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [screen, setScreen]   = useState("");
  const [message, setMessage] = useState("");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");
  const [submitted, setSubmitted] = useState<{ id: string; category: string } | null>(null);

  const context = useMemo(() => ({
    screen: screen || "beta-feedback",
    area: screen,
    deviceType: detectDeviceType(),
    browser: detectBrowser(),
    path: typeof window !== "undefined" ? window.location.pathname : "/beta-feedback",
    testerName: name.trim() || null,
    testerEmail: email.trim() || null,
  }), [screen, name, email]);

  const selectedType = FEEDBACK_TYPES.find((t) => t.id === feedbackType)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedByRole: "beta-tester",
          sourceChannel: "beta-feedback-portal",
          reportedType: feedbackType,
          message: message.trim(),
          context,
        }),
      });
      const data = await res.json() as { feedbackId?: string; triage?: { category: string }; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      setSubmitted({ id: data.feedbackId ?? "—", category: data.triage?.category ?? feedbackType });
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: C.text, fontSize: 14,
    fontFamily: "system-ui", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #130f34 0%, #0c0a22 100%)", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
            }}>🌟</div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: C.violet }}>WonderQuest</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: C.gold, padding: "2px 8px",
              background: "rgba(255,209,102,0.15)", border: "1px solid rgba(255,209,102,0.3)",
              borderRadius: 999,
            }}>BETA</span>
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: C.text, margin: "0 0 8px" }}>
            Beta Feedback
          </h1>
          <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Found a bug? Have an idea? Your feedback directly shapes what we build next.
            <br />No login needed — just tell us what you think.
          </p>
        </div>

        {/* ── Success state ── */}
        {submitted ? (
          <div style={{
            background: "rgba(88,232,193,0.08)",
            border: "1.5px solid rgba(88,232,193,0.3)",
            borderRadius: 20, padding: "36px 32px", textAlign: "center",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
              Thanks — feedback received!
            </h2>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px", lineHeight: 1.6 }}>
              Filed as <strong style={{ color: C.mint }}>{submitted.category}</strong>.
              Reference ID: <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 7px", borderRadius: 4, color: C.text, fontSize: 12 }}>{submitted.id.slice(0, 8)}</code>
            </p>
            <p style={{ fontSize: 12, color: C.muted, margin: "0 0 24px" }}>
              Our team reviews every submission. High-urgency bugs are addressed within 24 hours.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setSubmitted(null)}
                style={{
                  padding: "10px 22px", borderRadius: 10, cursor: "pointer",
                  background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                  color: "#fff", border: "none", fontSize: 13, fontWeight: 700, fontFamily: "system-ui",
                }}
              >
                Submit another →
              </button>
              <Link href="/" style={{
                display: "inline-flex", alignItems: "center", padding: "10px 22px", borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: C.muted, textDecoration: "none", fontSize: 13, fontWeight: 600,
              }}>
                Back to home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Type picker ── */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                What kind of feedback?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                {FEEDBACK_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFeedbackType(t.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      fontFamily: "system-ui",
                      background: feedbackType === t.id ? `${t.color}18` : "rgba(255,255,255,0.03)",
                      border: feedbackType === t.id ? `2px solid ${t.color}70` : "1.5px solid rgba(255,255,255,0.08)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{t.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: feedbackType === t.id ? t.color : C.text }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Screen / area ── */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Where in the app? <span style={{ fontSize: 11, fontWeight: 400, textTransform: "none" }}>(optional)</span>
              </label>
              <select
                value={screen}
                onChange={(e) => setScreen(e.target.value)}
                style={{ ...inputStyle, color: screen ? C.text : C.muted }}
              >
                <option value="">Select a screen or area…</option>
                {SCREENS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* ── Message ── */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                {feedbackType === "bug" ? "What happened?" : feedbackType === "praise" ? "What's working great?" : "Describe your idea"}
                <span style={{ color: C.coral, marginLeft: 2 }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                placeholder={
                  feedbackType === "bug"
                    ? "e.g. The hint button doesn't respond on mobile. I tapped it 3 times and nothing happened."
                    : feedbackType === "feature"
                      ? "e.g. It would be great to get a weekly email summary of my child's progress with the top 3 skills to focus on."
                      : feedbackType === "enhancement"
                        ? "e.g. The quiz review page is useful but hard to scan — grouping by subject would make it much faster."
                        : feedbackType === "praise"
                          ? "e.g. The adaptive difficulty is fantastic — my daughter didn't even realize she was being challenged."
                          : "Tell us what you experienced or what you'd like to see…"
                }
                style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
              />
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                Be as specific as possible — steps to reproduce, which device, what you expected vs. what happened.
              </div>
            </div>

            {/* ── Optional contact ── */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 14, padding: "16px 18px",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Want us to follow up? <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 180px" }}>
                  <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 5 }}>Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah"
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: "1 1 220px" }}>
                  <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 5 }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                We only use this to follow up on your specific report. Never shared or used for marketing.
              </div>
            </div>

            {/* ── Device info (auto-detected) ── */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Device", val: detectDeviceType() },
                { label: "Browser", val: detectBrowser() },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", gap: 6, alignItems: "center",
                  padding: "4px 10px", borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  fontSize: 11, color: C.muted,
                }}>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{item.val}</span>
                </div>
              ))}
              <div style={{
                padding: "4px 10px", borderRadius: 999,
                background: `${selectedType.color}12`,
                border: `1px solid ${selectedType.color}40`,
                fontSize: 11, fontWeight: 600, color: selectedType.color,
              }}>
                {selectedType.icon} {selectedType.label}
              </div>
            </div>

            {/* ── Error ── */}
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,123,107,0.1)", border: "1px solid rgba(255,123,107,0.3)",
                fontSize: 13, color: C.coral,
              }}>
                {error}
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              style={{
                padding: "14px",
                background: message.trim() ? "linear-gradient(135deg, #9b72ff, #5a30d0)" : "rgba(155,114,255,0.25)",
                color: message.trim() ? "#fff" : "rgba(255,255,255,0.4)",
                border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: submitting || !message.trim() ? "not-allowed" : "pointer",
                fontFamily: "system-ui", transition: "all 0.15s",
              }}
            >
              {submitting ? "Sending…" : `Send ${selectedType.icon} ${selectedType.label}`}
            </button>

          </form>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 40, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          WonderQuest Learning · Beta Program ·{" "}
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
