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
    </form>
  );
}
