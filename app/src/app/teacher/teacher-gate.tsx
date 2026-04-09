"use client";

import { useState } from "react";

type TeacherGateProps = {
  configured: boolean;
};

const GRADE_OPTIONS = ["K", "1", "2", "3", "4", "5"];

// ── Shared style tokens (matches parent/page.tsx) ─────────────────────────────
const C = {
  base:    "#100b2e",
  violet:  "#9b72ff",
  mint:    "#58e8c1",
  blue:    "#38bdf8",
  text:    "#f0f6ff",
  muted:   "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border:  "rgba(255,255,255,0.06)",
  red:     "#ff7b6b",
} as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid rgba(155,114,255,0.3)",
  borderRadius: "10px",
  font: "400 0.92rem system-ui",
  color: C.text,
  background: "rgba(155,114,255,0.08)",
  outline: "none",
  fontFamily: "system-ui",
  fontSize: 16,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  font: "600 0.78rem system-ui",
  color: "rgba(255,255,255,0.6)",
  marginBottom: "6px",
  fontFamily: "system-ui",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  background: "linear-gradient(135deg, #38bdf8, #0e7ab0)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  font: "700 0.95rem system-ui",
  cursor: "pointer",
  fontFamily: "system-ui",
  minHeight: 44,
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function TeacherGate({ configured }: TeacherGateProps) {
  // ── Sign-in state ──────────────────────────────────────────────────────────
  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 5;
  const lockedOut = attemptCount >= maxAttempts;

  // ── Profile completion state ───────────────────────────────────────────────
  const [isNew,             setIsNew]             = useState(false);
  const [displayName,       setDisplayName]       = useState("");
  const [schoolName,        setSchoolName]        = useState("");
  const [gradeLevels,       setGradeLevels]       = useState<string[]>([]);
  const [email,             setEmail]             = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError,      setProfileError]      = useState("");

  function toggleGrade(grade: string) {
    setGradeLevels((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  }

  async function handleGoogleSignIn() {
    localStorage.setItem("oauth_redirect_role", "teacher");
    const redirectTo = `${window.location.origin}/auth/callback`;
    await import("@/lib/supabase-browser").then(({ supabaseBrowser }) =>
      supabaseBrowser.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })
    );
  }

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lockedOut) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/teacher/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as { error?: string; isNew?: boolean };
      if (!response.ok) throw new Error(payload.error ?? "Teacher access failed.");
      if (payload.isNew) {
        setIsNew(true);
        setDisplayName(username);
      } else {
        window.location.reload();
      }
    } catch (err) {
      setAttemptCount((n) => n + 1);
      setError(err instanceof Error ? err.message : "Teacher access failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSubmitting(true);
    setProfileError("");
    try {
      const response = await fetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || username,
          schoolName:  schoolName.trim() || null,
          gradeLevels,
          email: email.trim() || null,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Profile update failed.");
      window.location.reload();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Profile update failed.");
    } finally {
      setProfileSubmitting(false);
    }
  }

  // ── Right-side card shared wrapper style ─────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "40px 36px",
    boxShadow: "0 8px 40px rgba(56,189,248,0.10)",
    border: "1px solid rgba(56,189,248,0.18)",
  };

  // ── Profile completion step ───────────────────────────────────────────────
  if (isNew) {
    return (
      <div style={cardStyle}>
        <div style={{ font: "600 0.75rem system-ui", color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
          Welcome
        </div>
        <div style={{ font: "700 1.5rem system-ui", color: C.text, marginBottom: "20px" }}>
          Complete your profile
        </div>

        <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>What should we call you? *</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Ms Johnson" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>School name</label>
            <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Lincoln Elementary" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Grade levels you teach</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {GRADE_OPTIONS.map((grade) => {
                const selected = gradeLevels.includes(grade);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    style={{
                      padding: "6px 14px", borderRadius: 20,
                      border: selected ? `1.5px solid ${C.blue}` : "1.5px solid rgba(255,255,255,0.18)",
                      background: selected ? "rgba(56,189,248,0.15)" : C.surface,
                      color: selected ? C.blue : C.muted,
                      fontSize: 13, fontWeight: 700,
                      cursor: "pointer", fontFamily: "system-ui", transition: "all .15s", minHeight: 36,
                    }}
                  >{grade}</button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email for notifications</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.edu" style={inputStyle} />
          </div>

          {profileError && (
            <p style={{ font: "500 0.82rem system-ui", color: C.red, background: "rgba(255,123,107,0.1)", border: "1px solid rgba(255,123,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>
              {profileError}
            </p>
          )}

          <button type="submit" disabled={profileSubmitting || !displayName.trim()} style={{ ...primaryBtnStyle, opacity: profileSubmitting || !displayName.trim() ? 0.7 : 1, cursor: profileSubmitting || !displayName.trim() ? "not-allowed" : "pointer", marginTop: 4 }}>
            {profileSubmitting ? "Saving…" : "Start teaching →"}
          </button>
          <button
            type="button"
            disabled={profileSubmitting}
            onClick={() => window.location.reload()}
            style={{ background: "none", border: "none", cursor: "pointer", font: "500 0.8rem system-ui", color: C.muted, fontFamily: "system-ui", minHeight: 44, touchAction: "manipulation" }}
          >
            Skip for now
          </button>
        </form>
      </div>
    );
  }

  // ── Main sign-in card ─────────────────────────────────────────────────────
  return (
    <div style={cardStyle}>
      <div style={{ font: "600 0.75rem system-ui", color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
        Classroom
      </div>
      <div style={{ font: "700 1.5rem system-ui", color: C.text, marginBottom: "20px" }}>
        {lockedOut ? "Access paused" : "Welcome back"}
      </div>

      <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={labelStyle} htmlFor="teacher-username-input">Username</label>
          <input
            autoComplete="username"
            disabled={lockedOut}
            id="teacher-username-input"
            name="teacherUsername"
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            placeholder="Enter your username"
            type="text"
            value={username}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="teacher-password-input">Access code</label>
          <input
            autoComplete="current-password"
            disabled={lockedOut}
            id="teacher-password-input"
            name="teacherPassword"
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Enter your access code"
            type="password"
            value={password}
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ font: "500 0.82rem system-ui", color: C.red, background: "rgba(255,123,107,0.1)", border: "1px solid rgba(255,123,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>
            {lockedOut
              ? "Too many attempts. Contact your school admin for assistance."
              : `Sign in failed. ${Math.max(maxAttempts - attemptCount, 0)} attempt${maxAttempts - attemptCount === 1 ? "" : "s"} remaining.`}
          </p>
        )}

        <button
          type="submit"
          disabled={lockedOut || submitting || !username || !password}
          style={{ ...primaryBtnStyle, opacity: lockedOut || submitting || !username || !password ? 0.7 : 1, cursor: lockedOut || submitting || !username || !password ? "not-allowed" : "pointer", marginTop: "4px" }}
        >
          {submitting ? "Signing in…" : "Sign in →"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          style={{
            width: "100%", background: "#fff", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10, color: "#1a1a2e", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 10,
            fontFamily: "system-ui", fontSize: 14, fontWeight: 600,
            minHeight: 44, padding: "10px 16px", touchAction: "manipulation",
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      {/* Footer note */}
      <div style={{ marginTop: "20px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: `1px solid ${C.border}`, font: "400 0.71rem/1.6 system-ui", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
        🏫 Classroom access is set up by your school admin. Contact them if you need credentials.
      </div>
    </div>
  );
}
