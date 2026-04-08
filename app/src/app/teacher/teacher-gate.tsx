"use client";

import { useState } from "react";

type TeacherGateProps = {
  configured: boolean;
};

const GRADE_OPTIONS = ["K", "1", "2", "3", "4", "5"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 14,
  fontFamily: "system-ui,-apple-system,sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

export default function TeacherGate({ configured }: TeacherGateProps) {
  // ── State A — sign in ──────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 5;
  const lockedOut = attemptCount >= maxAttempts;

  // ── State B — profile completion ──────────────────────────────────────────
  const [isNew, setIsNew] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState("");

  function toggleGrade(grade: string) {
    setGradeLevels((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  }

  async function handleGoogleSignIn(role: "parent" | "teacher") {
    const redirectTo = `${window.location.origin}/auth/callback?role=${role}`;
    await import("@/lib/supabase-browser").then(({ supabaseBrowser }) =>
      supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })
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

      if (!response.ok) {
        throw new Error(payload.error ?? "Teacher access failed.");
      }

      if (payload.isNew) {
        // New account — show profile completion step
        setIsNew(true);
        setDisplayName(username);
      } else {
        window.location.reload();
      }
    } catch (caughtError) {
      const nextAttemptCount = attemptCount + 1;
      setAttemptCount(nextAttemptCount);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Teacher access failed.",
      );
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
          schoolName: schoolName.trim() || null,
          gradeLevels,
          email: email.trim() || null,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Profile update failed.");
      }

      window.location.reload();
    } catch (caughtError) {
      setProfileError(
        caughtError instanceof Error
          ? caughtError.message
          : "Profile update failed.",
      );
    } finally {
      setProfileSubmitting(false);
    }
  }

  // ── State B — profile completion form ─────────────────────────────────────
  if (isNew) {
    return (
      <form className="gate-form gate-form-teacher" onSubmit={handleProfileSubmit}>
        <div className="gate-role-badge gate-role-badge-teacher">Welcome</div>
        <div className="gate-heading">
          <strong>Complete your profile</strong>
          <p>Help us personalise your dashboard — you can always update these later.</p>
        </div>

        <div className="gate-entry-row">
          <label className="gate-entry-label" htmlFor="profile-display-name">
            What should we call you? <span style={{ color: "#9b72ff" }}>*</span>
          </label>
          <input
            id="profile-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Ms Johnson"
            required
            style={inputStyle}
          />
        </div>

        <div className="gate-entry-row">
          <label className="gate-entry-label" htmlFor="profile-school">
            School name
          </label>
          <input
            id="profile-school"
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="e.g. Lincoln Elementary"
            style={inputStyle}
          />
        </div>

        <div className="gate-entry-row">
          <label className="gate-entry-label">
            Grade levels you teach
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {GRADE_OPTIONS.map((grade) => {
              const selected = gradeLevels.includes(grade);
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => toggleGrade(grade)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 20,
                    border: selected
                      ? "1px solid #9b72ff"
                      : "1px solid rgba(255,255,255,0.18)",
                    background: selected ? "#9b72ff" : "rgba(255,255,255,0.04)",
                    color: selected ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "system-ui,-apple-system,sans-serif",
                    transition: "all .15s",
                  }}
                >
                  {grade}
                </button>
              );
            })}
          </div>
        </div>

        <div className="gate-entry-row">
          <label className="gate-entry-label" htmlFor="profile-email">
            Email (for notifications)
          </label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@school.edu"
            style={inputStyle}
          />
        </div>

        {profileError ? (
          <div className="gate-error-card">
            <strong>Profile update failed.</strong>
            <p>{profileError}</p>
          </div>
        ) : null}

        <div className="form-actions">
          <button
            className="primary-link button-link"
            disabled={profileSubmitting || !displayName.trim()}
            type="submit"
          >
            {profileSubmitting ? "Saving..." : "Start teaching →"}
          </button>
          <button
            className="secondary-link button-link"
            type="button"
            disabled={profileSubmitting}
            onClick={() => window.location.reload()}
          >
            Skip for now
          </button>
        </div>
      </form>
    );
  }

  // ── State A — sign in form ─────────────────────────────────────────────────
  return (
    <form className="gate-form gate-form-teacher" onSubmit={handleSignIn}>
      <div className="gate-role-badge gate-role-badge-teacher">Classroom</div>
      <div className="gate-heading">
        <strong>Sign in to Classroom</strong>
        <p>
          {lockedOut
            ? "Too many attempts. Please wait before trying again."
            : "Enter your teacher access code to continue."}
        </p>
      </div>

      <div className="gate-entry-row">
        <label className="gate-entry-label" htmlFor="teacher-username-input">
          Username
        </label>
        <input
          autoComplete="username"
          className="gate-entry-input"
          disabled={lockedOut}
          id="teacher-username-input"
          name="teacherUsername"
          onChange={(e) => { setUsername(e.target.value); setError(""); }}
          placeholder="Enter username"
          type="text"
          value={username}
        />
      </div>

      <div className="gate-entry-row">
        <label className="gate-entry-label" htmlFor="teacher-password-input">
          Access code
        </label>
        <input
          autoComplete="current-password"
          className="gate-entry-input"
          disabled={lockedOut}
          id="teacher-password-input"
          name="teacherPassword"
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          placeholder="Enter access code"
          type="password"
          value={password}
        />
      </div>

      {error ? (
        <div className="gate-error-card">
          <strong>{lockedOut ? "Teacher access paused." : "Sign in failed."}</strong>
          <p>
            {lockedOut
              ? "Too many tries. Contact the school admin for assistance."
              : `${Math.max(maxAttempts - attemptCount, 0)} attempt${maxAttempts - attemptCount === 1 ? "" : "s"} remaining before this gate pauses.`}
          </p>
        </div>
      ) : null}

      <div className="form-actions">
        <button
          className="primary-link button-link"
          disabled={lockedOut || submitting || !username || !password}
          type="submit"
        >
          {submitting ? "Checking..." : "Sign in"}
        </button>
        <button
          className="secondary-link button-link"
          disabled={submitting}
          onClick={() => { setUsername(""); setPassword(""); setError(""); }}
          type="button"
        >
          Clear
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>
      <button
        type="button"
        onClick={() => handleGoogleSignIn("teacher")}
        style={{
          width: "100%", background: "#fff", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10, color: "#1a1a2e", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 10,
          fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 14, fontWeight: 600,
          minHeight: 44, padding: "10px 16px", touchAction: "manipulation",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 6 }}>
        Your school email must already be registered by your admin.
      </div>
    </form>
  );
}
