"use client";

import { useState } from "react";

type TeacherGateProps = {
  configured: boolean;
};

export default function TeacherGate({ configured }: TeacherGateProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configured) {
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
        body: JSON.stringify({ code }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Teacher access failed.");
      }

      window.location.reload();
    } catch (caughtError) {
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
    <form className="field-grid" onSubmit={handleSubmit}>
      <label className="field-block">
        <span>Teacher or school access code</span>
        <input
          disabled={!configured}
          onChange={(event) => setCode(event.target.value)}
          placeholder={
            configured
              ? "Enter teacher access code"
              : "Configure TEACHER_ACCESS_CODE first"
          }
          type="password"
          value={code}
        />
        <small>
          {configured
            ? "This protects the teacher and school dashboard."
            : "Add TEACHER_ACCESS_CODE to the local or Render environment before using this route."}
        </small>
      </label>
      {error ? <p className="status-banner status-error">{error}</p> : null}
      <div className="form-actions">
        <button className="primary-link button-link" disabled={!configured || submitting} type="submit">
          {submitting ? "Checking..." : "Enter teacher dashboard"}
        </button>
      </div>
    </form>
  );
}
