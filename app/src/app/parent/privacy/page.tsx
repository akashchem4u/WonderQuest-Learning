"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Theme ──────────────────────────────────────────────────────────────────────
const C = {
  base:    "#100b2e",
  surface: "rgba(255,255,255,0.04)",
  surface2:"rgba(255,255,255,0.07)",
  border:  "rgba(255,255,255,0.06)",
  violet:  "#9b72ff",
  mint:    "#58e8c1",
  red:     "#f85149",
  amber:   "#f59e0b",
  text:    "#f0f6ff",
  muted:   "rgba(255,255,255,0.5)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────────
interface DataSummaryResponse {
  student: {
    id: string;
    displayName: string;
    username: string;
    createdAt: string;
  };
  dataSummary: {
    sessionsCount: number;
    questionsAnswered: number;
    badgesEarned: number;
    lastActiveAt: string | null;
    dataCategories: string[];
  };
}

interface SessionChild {
  id: string;
  username: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string | null) {
  if (!iso) return "No activity recorded";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ParentPrivacyPage() {
  const router = useRouter();

  const [linkedChild, setLinkedChild] = useState<SessionChild | null | undefined>(undefined);
  const [summary, setSummary] = useState<DataSummaryResponse | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  // Load parent session to get the linked child
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/parent/session");
        if (!res.ok) {
          setLinkedChild(null);
          return;
        }
        const data = await res.json();
        const child: SessionChild | null = data.linkedChild ?? data.linkedChildren?.[0] ?? null;
        setLinkedChild(child);
      } catch {
        setLinkedChild(null);
      } finally {
        setLoadingSession(false);
      }
    }
    loadSession();
  }, []);

  // Once we have a child, fetch the data summary
  useEffect(() => {
    if (!linkedChild) return;
    setLoadingSummary(true);
    setSummaryError(null);

    fetch(`/api/parent/child-data-summary?studentId=${linkedChild.id}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setSummaryError(json.error ?? "Failed to load data summary.");
        } else {
          setSummary(json as DataSummaryResponse);
        }
      })
      .catch(() => setSummaryError("Failed to load data summary."))
      .finally(() => setLoadingSummary(false));
  }, [linkedChild]);

  async function handleDelete() {
    if (!linkedChild || !confirmed || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/parent/delete-child", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: linkedChild.id, confirmDelete: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDeleteError(json.error ?? "Deletion failed. Please try again.");
      } else {
        setDeleted(true);
        setTimeout(() => router.push("/parent"), 3000);
      }
    } catch {
      setDeleteError("A network error occurred. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingSession) {
    return (
      <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: C.muted, fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (!linkedChild) {
    return (
      <div style={{ minHeight: "100vh", background: C.base, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 20px" }}>
        <p style={{ color: C.text, fontSize: 16, textAlign: "center" }}>
          Please sign in to Family Hub first to view privacy settings.
        </p>
        <Link
          href="/parent"
          style={{ color: C.violet, fontSize: 14, textDecoration: "underline" }}
        >
          Go to Family Hub
        </Link>
      </div>
    );
  }

  // ── Deleted success ───────────────────────────────────────────────────────
  if (deleted) {
    return (
      <div style={{ minHeight: "100vh", background: C.base, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 20px" }}>
        <div style={{ fontSize: 40 }}>✓</div>
        <p style={{ color: C.mint, fontSize: 18, fontWeight: 600, textAlign: "center" }}>
          Account deleted successfully.
        </p>
        <p style={{ color: C.muted, fontSize: 14, textAlign: "center" }}>
          All of {linkedChild.displayName}&apos;s data has been permanently removed.
          Redirecting to Family Hub...
        </p>
      </div>
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.base, color: C.text, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Back link */}
        <Link
          href="/parent"
          style={{ color: C.violet, fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 24 }}
        >
          ← Family Hub
        </Link>

        {/* Header */}
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>
          Data &amp; Privacy
        </h1>
        <p style={{ color: C.muted, fontSize: 14, margin: "0 0 32px" }}>
          COPPA transparency — what WonderQuest holds for {linkedChild.displayName}
        </p>

        {/* Child identity card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Child account</p>
          <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 600 }}>{linkedChild.displayName}</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: C.muted }}>@{linkedChild.username}</p>
          {summary && (
            <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>
              Account created: {formatDate(summary.student.createdAt)}
            </p>
          )}
        </div>

        {/* Data summary */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600 }}>Data on file</p>

          {loadingSummary && (
            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Loading data summary...</p>
          )}

          {summaryError && (
            <p style={{ color: C.amber, fontSize: 13, margin: 0 }}>{summaryError}</p>
          )}

          {summary && !loadingSummary && (
            <>
              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.violet }}>{summary.dataSummary.sessionsCount}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Sessions</p>
                </div>
                <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.mint }}>{summary.dataSummary.questionsAnswered}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Questions answered</p>
                </div>
                <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 14px" }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.amber }}>{summary.dataSummary.badgesEarned}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Badges earned</p>
                </div>
              </div>

              <p style={{ margin: "0 0 8px", fontSize: 12, color: C.muted }}>
                Last active: {formatDate(summary.dataSummary.lastActiveAt)}
              </p>

              {/* Data categories */}
              <p style={{ margin: "14px 0 8px", fontSize: 13, fontWeight: 600 }}>Data categories stored</p>
              <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                {summary.dataSummary.dataCategories.map((cat) => (
                  <li key={cat} style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{cat}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Data retention policy */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px", marginTop: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
            📋 Data Retention Policy
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            We retain your child&apos;s learning data for as long as your account is active.
            Accounts with no activity for <strong style={{ color: "rgba(255,255,255,0.7)" }}>12 months</strong> are flagged for deletion.
            You can request full deletion at any time using the button below —
            all data is permanently removed within 30 days.
          </div>
        </div>

        {/* COPPA rights notice */}
        <div style={{ background: "rgba(155, 114, 255, 0.06)", border: `1px solid rgba(155, 114, 255, 0.18)`, borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            Under COPPA (Children&apos;s Online Privacy Protection Act), you have the right to review
            the personal information collected from your child and to request its deletion at any time.
            For questions or manual requests, contact us at{" "}
            <a href="mailto:privacy@wonderquestlearning.com" style={{ color: C.violet, textDecoration: "none" }}>
              privacy@wonderquestlearning.com
            </a>.
          </p>
        </div>

        {/* Deletion section */}
        <div style={{ background: "rgba(248, 81, 73, 0.05)", border: `1px solid rgba(248, 81, 73, 0.2)`, borderRadius: 10, padding: "20px" }}>
          <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: C.red }}>
            Request Account Deletion
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            This permanently deletes all of{" "}
            <strong style={{ color: C.text }}>{linkedChild.displayName}&apos;s</strong>{" "}
            data — sessions, quiz answers, badges, and account information.{" "}
            <strong style={{ color: C.red }}>This cannot be undone.</strong>
          </p>

          {/* Confirmation checkbox */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 18 }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ marginTop: 2, accentColor: C.red, cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>
              I understand this is permanent and cannot be reversed
            </span>
          </label>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            style={{
              background: confirmed && !deleting ? C.red : "rgba(248,81,73,0.2)",
              color: confirmed && !deleting ? "#fff" : "rgba(248,81,73,0.5)",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: confirmed && !deleting ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            {deleting ? "Deleting..." : `Delete ${linkedChild.displayName}\u2019s Account`}
          </button>

          {deleteError && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: C.red }}>{deleteError}</p>
          )}
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 32, fontSize: 12, color: C.muted, textAlign: "center" }}>
          Contact us at{" "}
          <a href="mailto:privacy@wonderquestlearning.com" style={{ color: C.muted, textDecoration: "underline" }}>
            privacy@wonderquestlearning.com
          </a>{" "}
          for COPPA requests or questions.
        </p>
      </div>
    </div>
  );
}
