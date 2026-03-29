"use client";

import { useState } from "react";

type OwnerGateProps = {
  configured: boolean;
};

export default function OwnerGate({ configured }: OwnerGateProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 3;
  const lockedOut = attemptCount >= maxAttempts;
  const slotCount = Math.min(Math.max(code.length + 1, 6), 10);

  function appendDigit(digit: string) {
    if (lockedOut) {
      return;
    }

    setCode((current) => (current.length >= 10 ? current : `${current}${digit}`));
    setError("");
  }

  function removeDigit() {
    setCode((current) => current.slice(0, -1));
    setError("");
  }

  function clearDigits() {
    setCode("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configured || lockedOut) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/owner/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Owner access failed.");
      }

      window.location.reload();
    } catch (caughtError) {
      const nextAttemptCount = attemptCount + 1;

      setAttemptCount(nextAttemptCount);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Owner access failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="gate-form gate-form-owner" onSubmit={handleSubmit}>
      <div className="gate-role-badge">Owner access</div>
      <div className="gate-heading">
        <strong>Enter access code</strong>
        <p>
          {configured
            ? "Use the owner code to unlock the product and ops console."
            : "This feature is not set up yet. Contact your administrator."}
        </p>
      </div>

      <div className={`gate-code-display ${error ? "is-error" : ""} ${lockedOut ? "is-locked" : ""}`}>
        {Array.from({ length: slotCount }, (_, index) => (
          <span className={`gate-code-cell ${code[index] ? "has-value" : ""}`} key={index}>
            {code[index] ?? ""}
          </span>
        ))}
      </div>

      {error ? (
        <div className="gate-error-card">
          <strong>{lockedOut ? "Owner access locked." : "That code did not match."}</strong>
          <p>
            {lockedOut
              ? "Too many tries. Ask the owner admin for a fresh code before trying again."
              : `${Math.max(maxAttempts - attemptCount, 0)} attempt${maxAttempts - attemptCount === 1 ? "" : "s"} remaining.`}
          </p>
        </div>
      ) : null}

      {configured && !lockedOut ? (
        <div className="gate-keypad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              className="gate-key"
              key={digit}
              onClick={() => appendDigit(digit)}
              type="button"
            >
              {digit}
            </button>
          ))}
          <button className="gate-key gate-key-quiet" onClick={clearDigits} type="button">
            Clear
          </button>
          <button className="gate-key" onClick={() => appendDigit("0")} type="button">
            0
          </button>
          <button className="gate-key gate-key-quiet" onClick={removeDigit} type="button">
            Delete
          </button>
        </div>
      ) : null}

      {!configured ? (
        <p className="soft-copy">
          Ops console access is not available right now.
        </p>
      ) : null}

      <div className="form-actions">
        <button
          className="primary-link button-link"
          disabled={!configured || lockedOut || submitting || code.length === 0}
          type="submit"
        >
          {submitting ? "Checking..." : "Enter owner console"}
        </button>
        <button
          className="secondary-link button-link"
          disabled={!configured || submitting}
          onClick={clearDigits}
          type="button"
        >
          Clear code
        </button>
      </div>
    </form>
  );
}
