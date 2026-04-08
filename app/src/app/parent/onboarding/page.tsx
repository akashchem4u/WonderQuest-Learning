"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  error: "#ff6b6b",
  errorBg: "rgba(255,107,107,0.1)",
  errorBorder: "rgba(255,107,107,0.25)",
  mint: "#58e8c1",
  mintBg: "rgba(88,232,193,0.1)",
  mintBorder: "rgba(88,232,193,0.25)",
} as const;

// ─── Step Dots ────────────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            borderRadius: 99,
            background: i <= current ? C.violet : "rgba(255,255,255,0.15)",
            transition: "width 0.2s, background 0.2s",
          }}
        />
      ))}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: "rgba(255,255,255,0.05)",
  color: C.text,
  font: "400 0.9rem system-ui",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  font: "500 0.78rem system-ui",
  color: C.muted,
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 12,
  border: "none",
  background: C.violet,
  color: "#fff",
  font: "600 0.95rem system-ui",
  cursor: "pointer",
  marginTop: 4,
};

const cardStyle: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "18px 20px",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
};

const cardActiveStyle: React.CSSProperties = {
  ...cardStyle,
  border: `1.5px solid ${C.violet}`,
  background: "rgba(155,114,255,0.08)",
};

// ─── Step 0: Welcome ──────────────────────────────────────────────────────────
function Step0({ onNew, onExisting }: { onNew: () => void; onExisting: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ font: "700 1.6rem system-ui", color: C.text, margin: 0, marginBottom: 8 }}>
          Welcome to Family Hub 👋
        </h1>
        <p style={{ font: "400 0.9rem system-ui", color: C.muted, margin: 0, lineHeight: 1.5 }}>
          Set up takes 2 minutes. We&apos;ll connect your account to your child&apos;s learning.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        <button
          onClick={onNew}
          style={{
            ...cardStyle,
            textAlign: "left",
            border: `1px solid rgba(155,114,255,0.3)`,
            background: "rgba(155,114,255,0.06)",
          }}
        >
          <div style={{ font: "600 1rem system-ui", color: C.text, marginBottom: 4 }}>
            I&apos;m a new parent ✨
          </div>
          <div style={{ font: "400 0.82rem system-ui", color: C.muted }}>
            Create your free Family Hub account
          </div>
        </button>

        <button
          onClick={onExisting}
          style={{ ...cardStyle, textAlign: "left" }}
        >
          <div style={{ font: "600 1rem system-ui", color: C.text, marginBottom: 4 }}>
            I already have an account
          </div>
          <div style={{ font: "400 0.82rem system-ui", color: C.muted }}>
            Sign in to your existing account
          </div>
        </button>
      </div>

      <div style={{ marginTop: 8, textAlign: "center" }}>
        <span style={{ font: "400 0.78rem system-ui", color: C.muted }}>
          🔒 COPPA-safe · 📵 No ads · ✅ Teacher-guided
        </span>
      </div>
    </div>
  );
}

// ─── Step 1: Create Account ───────────────────────────────────────────────────
type Step1Props = {
  onSuccess: () => void;
};

function Step1({ onSuccess }: Step1Props) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameManual, setUsernameManual] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  function deriveUsername(e: string) {
    return e.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase();
  }

  function handleEmailChange(val: string) {
    setEmail(val);
    if (!usernameManual) setUsername(deriveUsername(val));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Name is required.";
    if (!email.trim() || !email.includes("@")) e.email = "A valid email is required.";
    if (!username.trim() || username.length < 3) e.username = "Username must be at least 3 characters.";
    if (!password || password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/parent/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", displayName, email, username, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setServerError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      onSuccess();
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ font: "700 1.4rem system-ui", color: C.text, margin: 0, marginBottom: 4 }}>
          Create your account
        </h2>
        <p style={{ font: "400 0.85rem system-ui", color: C.muted, margin: 0 }}>
          Step 1 of 3 — Your parent account
        </p>
      </div>

      <div>
        <label style={labelStyle}>Display name</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Sarah"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
        />
        {errors.displayName && (
          <p style={{ font: "400 0.78rem system-ui", color: C.error, margin: "4px 0 0" }}>
            {errors.displayName}
          </p>
        )}
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input
          style={inputStyle}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          autoComplete="email"
        />
        {errors.email && (
          <p style={{ font: "400 0.78rem system-ui", color: C.error, margin: "4px 0 0" }}>
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label style={labelStyle}>Username</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="auto-derived from email"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setUsernameManual(true); }}
          autoComplete="username"
        />
        {errors.username && (
          <p style={{ font: "400 0.78rem system-ui", color: C.error, margin: "4px 0 0" }}>
            {errors.username}
          </p>
        )}
      </div>

      <div>
        <label style={labelStyle}>Password</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        {errors.password && (
          <p style={{ font: "400 0.78rem system-ui", color: C.error, margin: "4px 0 0" }}>
            {errors.password}
          </p>
        )}
      </div>

      {serverError && (
        <p style={{ font: "500 0.82rem system-ui", color: C.error, background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 8, padding: "10px 14px", margin: 0 }}>
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Creating account…" : "Continue →"}
      </button>

      <div style={{ textAlign: "center" }}>
        <Link href="/parent" style={{ font: "500 0.8rem system-ui", color: C.muted, textDecoration: "underline" }}>
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
}

// ─── Step 2: Link Child ───────────────────────────────────────────────────────
function Step2({ onNext }: { onNext: () => void }) {
  const [classCode, setClassCode] = useState("");
  const [childUsername, setChildUsername] = useState("");
  const [classSubmitting, setClassSubmitting] = useState(false);
  const [classError, setClassError] = useState("");
  const [classSuccess, setClassSuccess] = useState("");
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");

  async function handleJoinClass(e: React.FormEvent) {
    e.preventDefault();
    if (!classCode.trim()) return;
    setClassSubmitting(true);
    setClassError("");
    setClassSuccess("");
    try {
      const res = await fetch("/api/parent/join-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode: classCode.trim() }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setClassError(data.error ?? "Could not join class. Please check the code.");
        return;
      }
      setClassSuccess(data.message ?? "Successfully joined class!");
    } catch {
      setClassError("Something went wrong. Please try again.");
    } finally {
      setClassSubmitting(false);
    }
  }

  async function handleLinkChild(e: React.FormEvent) {
    e.preventDefault();
    if (!childUsername.trim()) return;
    setLinkSubmitting(true);
    setLinkError("");
    setLinkSuccess("");
    try {
      const res = await fetch("/api/parent/link-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childUsername: childUsername.trim() }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setLinkError(data.error ?? "Could not link child. Please check the username.");
        return;
      }
      setLinkSuccess(data.message ?? "Child linked successfully!");
    } catch {
      setLinkError("Something went wrong. Please try again.");
    } finally {
      setLinkSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ font: "700 1.4rem system-ui", color: C.text, margin: 0, marginBottom: 4 }}>
          Connect your child&apos;s account
        </h2>
        <p style={{ font: "400 0.85rem system-ui", color: C.muted, margin: 0 }}>
          Step 2 of 3 — Link your child
        </p>
      </div>

      {/* Class code card */}
      <div style={{ ...cardStyle, cursor: "default" }}>
        <div style={{ font: "600 0.95rem system-ui", color: C.text, marginBottom: 4 }}>
          Enter class code
        </div>
        <div style={{ font: "400 0.8rem system-ui", color: C.muted, marginBottom: 12 }}>
          Your child&apos;s teacher gave you a code
        </div>
        <form onSubmit={handleJoinClass} style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            type="text"
            placeholder="e.g. ABC-1234"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
          />
          <button
            type="submit"
            disabled={classSubmitting || !classCode.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: C.violet,
              color: "#fff",
              font: "600 0.85rem system-ui",
              cursor: classSubmitting || !classCode.trim() ? "not-allowed" : "pointer",
              opacity: classSubmitting || !classCode.trim() ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {classSubmitting ? "…" : "Join class →"}
          </button>
        </form>
        {classError && (
          <p style={{ font: "400 0.78rem system-ui", color: C.error, margin: "8px 0 0" }}>
            {classError}
          </p>
        )}
        {classSuccess && (
          <p style={{ font: "400 0.78rem system-ui", color: C.mint, margin: "8px 0 0" }}>
            {classSuccess}
          </p>
        )}
      </div>

      {/* Child username card */}
      <div style={{ ...cardStyle, cursor: "default" }}>
        <div style={{ font: "600 0.95rem system-ui", color: C.text, marginBottom: 4 }}>
          Has your child already set up their WonderQuest account?
        </div>
        <div style={{ font: "400 0.8rem system-ui", color: C.muted, marginBottom: 12 }}>
          Enter their username to link accounts
        </div>
        <form onSubmit={handleLinkChild} style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            type="text"
            placeholder="Child's username"
            value={childUsername}
            onChange={(e) => setChildUsername(e.target.value)}
          />
          <button
            type="submit"
            disabled={linkSubmitting || !childUsername.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "rgba(255,255,255,0.08)",
              color: C.text,
              font: "600 0.85rem system-ui",
              cursor: linkSubmitting || !childUsername.trim() ? "not-allowed" : "pointer",
              opacity: linkSubmitting || !childUsername.trim() ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {linkSubmitting ? "…" : "Link child"}
          </button>
        </form>
        {linkError && (
          <p style={{ font: "400 0.78rem system-ui", color: C.error, margin: "8px 0 0" }}>
            {linkError}
          </p>
        )}
        {linkSuccess && (
          <p style={{ font: "400 0.78rem system-ui", color: C.mint, margin: "8px 0 0" }}>
            {linkSuccess}
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        style={{ ...primaryBtnStyle, background: "rgba(255,255,255,0.08)", color: C.muted }}
      >
        I&apos;ll link later →
      </button>
    </div>
  );
}

// ─── Step 3: Preferences ──────────────────────────────────────────────────────
function Step3({ onFinish }: { onFinish: () => void }) {
  const router = useRouter();
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [milestoneNotifs, setMilestoneNotifs] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleFinish() {
    setSubmitting(true);
    setError("");
    try {
      await fetch("/api/parent/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyDigest,
          milestoneNotifications: milestoneNotifs,
          quietHoursEnabled: quietHours,
        }),
      });
      onFinish();
      router.push("/parent");
    } catch {
      setError("Could not save preferences. You can update them in settings.");
      onFinish();
      router.push("/parent");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ font: "700 1.4rem system-ui", color: C.text, margin: 0, marginBottom: 4 }}>
          How should we reach you?
        </h2>
        <p style={{ font: "400 0.85rem system-ui", color: C.muted, margin: 0 }}>
          Step 3 of 3 — Notification preferences
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { key: "weekly", label: "📧 Weekly learning digest", sub: "A summary of your child's progress each week", value: weeklyDigest, set: setWeeklyDigest },
          { key: "milestone", label: "🔔 Milestone notifications", sub: "Get notified when your child hits a new achievement", value: milestoneNotifs, set: setMilestoneNotifs },
          { key: "quiet", label: "⏰ Quiet hours (9pm–7am)", sub: "Pause notifications during evening and early morning", value: quietHours, set: setQuietHours },
        ].map(({ key, label, sub, value, set }) => (
          <button
            key={key}
            onClick={() => set(!value)}
            style={{
              ...cardStyle,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              border: value ? `1.5px solid ${C.violet}` : `1px solid ${C.border}`,
              background: value ? "rgba(155,114,255,0.08)" : C.surface,
              textAlign: "left",
            }}
          >
            <div>
              <div style={{ font: "600 0.9rem system-ui", color: C.text, marginBottom: 2 }}>{label}</div>
              <div style={{ font: "400 0.78rem system-ui", color: C.muted }}>{sub}</div>
            </div>
            <div style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              background: value ? C.violet : "rgba(255,255,255,0.12)",
              position: "relative",
              flexShrink: 0,
              transition: "background 0.2s",
            }}>
              <div style={{
                position: "absolute",
                top: 3,
                left: value ? 21 : 3,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
              }} />
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p style={{ font: "500 0.82rem system-ui", color: C.error, background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 8, padding: "10px 14px", margin: 0 }}>
          {error}
        </p>
      )}

      <button
        onClick={handleFinish}
        disabled={submitting}
        style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Saving…" : "Finish setup →"}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ParentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 0 is the welcome screen (not counted in the dots)
  // Steps 1–3 map to dots 0–2 (3 total dots)
  const TOTAL_DOTS = 3;
  const dotIndex = step - 1; // step 1 → dot 0, step 2 → dot 1, step 3 → dot 2

  return (
    <div style={{
      minHeight: "100vh",
      background: C.base,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 16px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: "28px 24px",
        boxSizing: "border-box",
      }}>
        {/* Step dots (only for steps 1–3) */}
        {step > 0 && (
          <StepDots current={dotIndex} total={TOTAL_DOTS} />
        )}

        {step === 0 && (
          <Step0
            onNew={() => setStep(1)}
            onExisting={() => router.push("/parent")}
          />
        )}

        {step === 1 && (
          <Step1 onSuccess={() => setStep(2)} />
        )}

        {step === 2 && (
          <Step2 onNext={() => setStep(3)} />
        )}

        {step === 3 && (
          <Step3 onFinish={() => {}} />
        )}
      </div>
    </div>
  );
}
