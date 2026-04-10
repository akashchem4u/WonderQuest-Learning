"use client";
import { useState } from "react";
import Link from "next/link";

const T = {
  bg: "#06071a",
  surface: "#0e1029",
  violet: "#9b72ff",
  teal: "#2dd4bf",
  text: "#f0f2ff",
  muted: "#8892b0",
  dim: "#4a5568",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(255,255,255,0.14)",
  gold: "#fbbf24",
  goldDim: "#78540a",
  error: "#f87171",
};

const ROLES = [
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Teacher" },
  { value: "other", label: "Just curious" },
];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role: role || null,
          rating: rating || null,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeStars = hoverRating || rating;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px 48px",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(155,114,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${T.violet}, ${T.teal})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              ✦
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: T.text,
                letterSpacing: "-0.01em",
              }}
            >
              WonderQuest Learning
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.text,
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Help us make it better
          </h1>
          <p style={{ fontSize: 15, color: T.muted, margin: 0 }}>
            Your feedback shapes what we build next.
          </p>
        </div>

        {done ? (
          /* ── Success state ── */
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.borderHi}`,
              borderRadius: 20,
              padding: "48px 32px",
              textAlign: "center",
              animation: "fadeUp 0.4s ease",
            }}
          >
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🙌</div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: T.text,
                margin: "0 0 12px",
              }}
            >
              Thank you!
            </h2>
            <p
              style={{
                fontSize: 15,
                color: T.muted,
                lineHeight: 1.6,
                margin: "0 0 32px",
              }}
            >
              Your feedback means the world to us — we read every single one
              and use it to build a better experience for kids and families.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                borderRadius: 10,
                background: `linear-gradient(135deg, ${T.violet}, ${T.teal})`,
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              Back to WonderQuest →
            </Link>
          </div>
        ) : (
          /* ── Feedback form ── */
          <form
            onSubmit={handleSubmit}
            style={{
              background: T.surface,
              border: `1px solid ${T.borderHi}`,
              borderRadius: 20,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <style>{`
              @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
              .wq-input{
                width:100%;box-sizing:border-box;
                background:rgba(255,255,255,0.04);
                border:1px solid ${T.border};
                border-radius:10px;
                padding:11px 14px;
                color:${T.text};
                font-size:15px;
                font-family:inherit;
                outline:none;
                transition:border-color 0.15s;
              }
              .wq-input:focus{border-color:${T.violet};}
              .wq-input::placeholder{color:${T.dim};}
              .wq-pill{
                padding:8px 16px;
                border-radius:999px;
                border:1px solid ${T.border};
                background:transparent;
                color:${T.muted};
                font-size:13.5px;
                font-family:inherit;
                font-weight:500;
                cursor:pointer;
                transition:all 0.15s;
              }
              .wq-pill:hover{border-color:${T.borderHi};color:${T.text};}
              .wq-pill-active{
                border-color:${T.violet}!important;
                background:rgba(155,114,255,0.15)!important;
                color:${T.violet}!important;
              }
              .wq-star{
                font-size:32px;
                cursor:pointer;
                transition:transform 0.1s,filter 0.1s;
                user-select:none;
                line-height:1;
              }
              .wq-star:hover{transform:scale(1.15);}
            `}</style>

            {/* Star rating */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.muted,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Overall rating
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className="wq-star"
                    role="button"
                    aria-label={`${s} star${s > 1 ? "s" : ""}`}
                    style={{
                      color: s <= activeStars ? T.gold : T.dim,
                      filter:
                        s <= activeStars
                          ? "drop-shadow(0 0 6px rgba(251,191,36,0.5))"
                          : "none",
                    }}
                    onClick={() => setRating(s === rating ? 0 : s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                ))}
                {activeStars > 0 && (
                  <span
                    style={{ fontSize: 13, color: T.muted, alignSelf: "center", marginLeft: 6 }}
                  >
                    {["", "Poor", "Fair", "Good", "Great", "Amazing!"][activeStars]}
                  </span>
                )}
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.muted,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                I am a…
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className={`wq-pill${role === r.value ? " wq-pill-active" : ""}`}
                    onClick={() => setRole(role === r.value ? "" : r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <input
                className="wq-input"
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <input
                className="wq-input"
                type="email"
                placeholder="Email — only if you'd like a reply"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Message */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.muted,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Your feedback{" "}
                <span style={{ color: T.violet }}>*</span>
              </label>
              <textarea
                className="wq-input"
                placeholder="What did you think? What worked well? What could be better?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                style={{ minHeight: 120, resize: "vertical" }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  color: T.error,
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: submitting
                  ? T.dim
                  : `linear-gradient(135deg, ${T.violet}, ${T.teal})`,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: submitting ? "not-allowed" : "pointer",
                letterSpacing: "-0.01em",
                transition: "opacity 0.15s, transform 0.1s",
                boxShadow: submitting
                  ? "none"
                  : "0 4px 20px rgba(155,114,255,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!submitting)
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
            >
              {submitting ? "Sending…" : "Send Feedback →"}
            </button>

            {/* Back link */}
            <p style={{ textAlign: "center", margin: 0 }}>
              <Link
                href="/"
                style={{ fontSize: 13, color: T.dim, textDecoration: "none" }}
              >
                ← Back to WonderQuest
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
