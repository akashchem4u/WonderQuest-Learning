"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type MissedQuestion = {
  id: string;
  subject: string;
  subjectEmoji: string;
  preview: string;
  missedCount: number;
};

type MissedData = {
  questions?: MissedQuestion[];
};

// ─── Missed Questions View ────────────────────────────────────────────────────

function MissedQuestionsView({
  questions,
  loading,
}: {
  questions: MissedQuestion[] | null;
  loading: boolean;
}) {
  const hasMissed = questions !== null && questions.length > 0;

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes card-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0820",
          fontFamily: "'Nunito', system-ui, sans-serif",
          color: "#f0f6ff",
          padding: "24px 16px 60px",
        }}
      >
        {/* Nav */}
        <div
          style={{
            maxWidth: 520,
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Link
            href="/child"
            style={{ fontSize: 14, fontWeight: 900, color: "#9b72ff", textDecoration: "none" }}
          >
            ← Home
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 16, fontWeight: 900, color: "#f0f6ff" }}>
            Practice Questions 📚
          </div>
        </div>

        {/* Main card */}
        <div
          style={{
            maxWidth: 520,
            margin: "0 auto",
            background: "#161b22",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
            animation: "card-in 0.4s ease both",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "28px 24px 22px",
              background: "radial-gradient(ellipse at 50% 0%, rgba(155,114,255,0.14) 0%, transparent 65%)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 56, lineHeight: 1, display: "block", marginBottom: 12 }}>🎯</span>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#f0f6ff",
                margin: 0,
                marginBottom: 8,
              }}
            >
              Review Tricky Questions
            </h1>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#8b949e",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Questions you found tricky recently.
              <br />
              Practice makes perfect!
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px 24px" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#8b949e",
                }}
              >
                Loading your questions…
              </div>
            ) : hasMissed ? (
              <>
                {/* Question list */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#8b949e",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                  }}
                >
                  Recent challenges
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 14,
                        padding: "12px 14px",
                        animation: `card-in 0.35s ease ${i * 0.06}s both`,
                      }}
                    >
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{q.subjectEmoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#c4b0ff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {q.preview}
                        </div>
                        <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>
                          {q.subject} · missed {q.missedCount}×
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/play?sessionMode=guided-quest&entry=review"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                    minHeight: 56,
                    background: "linear-gradient(135deg, #9b72ff, #7c4dff)",
                    color: "#fff",
                    borderRadius: 16,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                    fontSize: 17,
                    fontWeight: 900,
                    textDecoration: "none",
                    textAlign: "center",
                    boxShadow: "0 6px 20px rgba(155,114,255,0.3)",
                  }}
                >
                  Start Review Session 🚀
                </Link>
              </>
            ) : (
              /* Empty state */
              <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
                <span style={{ fontSize: 52, display: "block", marginBottom: 16 }}>✨</span>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#f0f6ff",
                    marginBottom: 8,
                  }}
                >
                  Nothing here yet!
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#8b949e",
                    lineHeight: 1.55,
                    margin: "0 0 24px",
                  }}
                >
                  Play more sessions and we&rsquo;ll track the
                  <br />
                  questions you found tricky!
                </p>
                <Link
                  href="/play"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px 28px",
                    background: "linear-gradient(135deg, #9b72ff, #7c4dff)",
                    color: "#fff",
                    borderRadius: 14,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                    fontSize: 16,
                    fontWeight: 900,
                    textDecoration: "none",
                    boxShadow: "0 6px 20px rgba(155,114,255,0.3)",
                  }}
                >
                  Start Playing ▶
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ─── Page with auth check ─────────────────────────────────────────────────────

export default function ChildMissedPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<MissedQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const sessionRes = await fetch("/api/child/session", { method: "GET" });
        if (!sessionRes.ok) {
          if (!cancelled) router.replace("/child");
          return;
        }

        // Try to load missed questions
        try {
          const missedRes = await fetch("/api/child/missed-questions");
          if (missedRes.ok) {
            const data = (await missedRes.json()) as MissedData;
            if (!cancelled) setQuestions(data.questions ?? []);
          } else {
            // API not available — show empty state
            if (!cancelled) setQuestions([]);
          }
        } catch {
          if (!cancelled) setQuestions([]);
        }
      } catch {
        if (!cancelled) router.replace("/child");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return <MissedQuestionsView questions={questions} loading={loading} />;
}
