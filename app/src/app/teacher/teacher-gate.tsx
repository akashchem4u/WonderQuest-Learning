"use client";

import { useState } from "react";

type TeacherGateProps = {
  configured: boolean;
};

export default function TeacherGate({ configured }: TeacherGateProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 5;
  const lockedOut = attemptCount >= maxAttempts;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lockedOut) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/teacher/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Teacher access failed.");
      }

      window.location.reload();
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

  return (
    <form className="gate-form gate-form-teacher" onSubmit={handleSubmit}>
      <div className="gate-role-badge gate-role-badge-teacher">Teacher access</div>
      <div className="gate-heading">
        <strong>Sign in to teacher dashboard</strong>
        <p>
          {lockedOut
            ? "Too many attempts. Please wait before trying again."
            : "Enter your teacher username and password."}
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
          Password
        </label>
        <input
          autoComplete="current-password"
          className="gate-entry-input"
          disabled={lockedOut}
          id="teacher-password-input"
          name="teacherPassword"
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          placeholder="Enter password"
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
          {submitting ? "Checking..." : "Sign in to dashboard"}
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
