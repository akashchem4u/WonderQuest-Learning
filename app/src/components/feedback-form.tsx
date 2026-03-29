"use client";

import { useMemo, useState } from "react";

type FeedbackFormProps = {
  submittedByRole: "parent" | "teacher";
  sourceChannel: string;
  guardianId?: string | null;
  studentId?: string | null;
  title?: string;
  helper?: string;
};

type FeedbackResponse = {
  feedbackId: string;
  triage: {
    category: string;
    confidence: number;
    urgency: string;
    routingTarget: string;
  };
};

function detectDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/ipad|tablet/.test(userAgent)) {
    return "tablet";
  }

  if (/iphone|android|mobile/.test(userAgent)) {
    return "phone";
  }

  return "desktop";
}

function detectBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("edg")) {
    return "edge";
  }

  if (userAgent.includes("chrome")) {
    return "chrome";
  }

  if (userAgent.includes("safari")) {
    return "safari";
  }

  if (userAgent.includes("firefox")) {
    return "firefox";
  }

  return "other";
}

export function FeedbackForm({
  submittedByRole,
  sourceChannel,
  guardianId,
  studentId,
  title = "Share feedback",
  helper = "Tell us what is broken, confusing, missing, or worth improving.",
}: FeedbackFormProps) {
  const [reportedType, setReportedType] = useState("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FeedbackResponse | null>(null);

  const context = useMemo(
    () => ({
      screen: sourceChannel,
      deviceType: typeof window === "undefined" ? "unknown" : detectDeviceType(),
      browser: typeof window === "undefined" ? "unknown" : detectBrowser(),
      path: typeof window === "undefined" ? sourceChannel : window.location.pathname,
    }),
    [sourceChannel],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submittedByRole,
          guardianId,
          studentId,
          sourceChannel,
          reportedType,
          message,
          context,
        }),
      });

      const payload = (await response.json()) as FeedbackResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save feedback.");
      }

      setResult(payload);
      setMessage("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save feedback.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="field-grid" onSubmit={handleSubmit}>
      <div className="feedback-heading">
        <strong>{title}</strong>
        <p className="soft-copy">{helper}</p>
      </div>
      <label className="field-block">
        <span>Feedback type</span>
        <select
          onChange={(event) => setReportedType(event.target.value)}
          value={reportedType}
        >
          <option value="bug">Bug or something broken</option>
          <option value="enhancement">Feature or improvement idea</option>
          <option value="content">Question, explainer, or content issue</option>
          <option value="safety">Safety or appropriateness concern</option>
          <option value="general">General product feedback</option>
        </select>
      </label>
      <label className="field-block">
        <span>What happened?</span>
        <textarea
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What happened? e.g. The quiz didn't load after I answered the first question."
          rows={5}
          value={message}
        />
      </label>
      {error ? <p className="status-banner status-error">{error}</p> : null}
      {result ? (
        <div className="status-panel status-success">
          <strong>Thanks — feedback sent.</strong>
          <p>
            Filed as <strong>{result.triage.category}</strong> and sent to
            the {result.triage.routingTarget} team.
          </p>
        </div>
      ) : null}
      <div className="form-actions">
        <button
          className="primary-link button-link"
          disabled={submitting || !message.trim()}
          type="submit"
        >
          {submitting ? "Saving..." : "Send feedback"}
        </button>
      </div>
    </form>
  );
}
