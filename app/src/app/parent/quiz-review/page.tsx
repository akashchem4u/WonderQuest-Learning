"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { getActiveChildId } from "@/lib/active-child";

// ─── Types ────────────────────────────────────────────────────────────────────

type LinkedChild = { id: string; displayName: string; avatarKey: string };

type Session = {
  id: string;
  started_at: string;
  ended_at: string;
  session_mode: string;
  total_questions: number;
  theme_code: string | null;
  answered: number;
  correct_count: number;
  hints_used: number;
  first_try_correct: number;
};

type Question = {
  correct: boolean;
  first_try: boolean;
  hint_used: boolean;
  remediation_triggered: boolean;
  time_spent_ms: number;
  points_earned: number;
  skill_name: string | null;
  subject_code: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const C = {
  base:    "#100b2e",
  text:    "#f0f6ff",
  muted:   "rgba(255,255,255,0.45)",
  surface: "rgba(255,255,255,0.04)",
  border:  "rgba(255,255,255,0.07)",
  mint:    "#58e8c1",
  violet:  "#9b72ff",
  gold:    "#ffd166",
  coral:   "#ff7b6b",
  blue:    "#38bdf8",
} as const;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function formatDuration(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const min = Math.round(ms / 60000);
  return min < 1 ? "<1 min" : `${min} min`;
}
function scorePct(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}
function scoreColor(pct: number) {
  if (pct >= 80) return C.mint;
  if (pct >= 60) return C.gold;
  return C.coral;
}
function subjectEmoji(code: string | null) {
  if (!code) return "📚";
  if (code.includes("math")) return "🔢";
  if (code.includes("lit") || code.includes("read") || code.includes("early")) return "📖";
  return "📚";
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({ session, onExpand, expanded }: { session: Session; onExpand: () => void; expanded: boolean }) {
  const pct = scorePct(session.correct_count, session.answered);
  const sc = scoreColor(pct);
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
      <button
        onClick={onExpand}
        style={{
          width: "100%", padding: "16px 18px", background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          display: "flex", alignItems: "center", gap: 14,
        }}
      >
        {/* Score circle */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
          background: `${sc}18`, border: `2px solid ${sc}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
        }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: sc, lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: 9, color: C.muted }}>score</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>
            {formatDate(session.started_at)} · {formatTime(session.started_at)}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: C.muted }}>{session.answered} questions</span>
            <span style={{ fontSize: 11, color: C.muted }}>⏱ {formatDuration(session.started_at, session.ended_at)}</span>
            {session.hints_used > 0 && (
              <span style={{ fontSize: 11, color: C.gold }}>💡 {session.hints_used} hints</span>
            )}
            <span style={{ fontSize: 11, color: C.mint }}>✓ {session.correct_count}/{session.answered} correct</span>
          </div>
        </div>
        <span style={{ fontSize: 14, color: C.muted, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
    </div>
  );
}

// ─── Question row ─────────────────────────────────────────────────────────────

function QuestionRow({ q, index }: { q: Question; index: number }) {
  const bg = q.correct ? "rgba(88,232,193,0.06)" : "rgba(255,123,107,0.06)";
  const borderC = q.correct ? "rgba(88,232,193,0.2)" : "rgba(255,123,107,0.2)";
  const icon = q.correct ? "✅" : "❌";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: bg, border: `1px solid ${borderC}`, borderRadius: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
          {subjectEmoji(q.subject_code)} {q.skill_name ?? "Unknown skill"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
          {!q.first_try && q.correct && <span style={{ fontSize: 10, color: C.gold, fontWeight: 600 }}>Took a few tries</span>}
          {q.hint_used && <span style={{ fontSize: 10, color: C.gold, fontWeight: 600 }}>💡 Used hint</span>}
          {q.remediation_triggered && <span style={{ fontSize: 10, color: C.coral, fontWeight: 600 }}>Needed extra help</span>}
          <span style={{ fontSize: 10, color: C.muted }}>{Math.round((q.time_spent_ms ?? 0) / 1000)}s</span>
        </div>
      </div>
      {q.correct && q.first_try && <span style={{ fontSize: 10, fontWeight: 700, color: C.mint, background: "rgba(88,232,193,0.12)", padding: "2px 8px", borderRadius: 999 }}>First try! ⭐</span>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function QuizReviewPage() {
  const [childId, setChildId] = useState<string | null>(null);
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [loadingSession, setLoadingSession] = useState<string | null>(null);

  // Load children list and set active child
  useEffect(() => {
    fetch("/api/parent/session")
      .then((r) => r.ok ? r.json() : null)
      .then((data: { linkedChildren?: LinkedChild[] } | null) => {
        if (!data?.linkedChildren?.length) return;
        setChildren(data.linkedChildren);
        const stored = getActiveChildId();
        const active = data.linkedChildren.find((c) => c.id === stored) ?? data.linkedChildren[0];
        if (active) setChildId(active.id);
      })
      .catch(() => null);
  }, []);

  // Load sessions when childId changes
  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    setSessions([]);
    fetch(`/api/parent/quiz-review?childId=${childId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { sessions: Session[] } | null) => { if (data) setSessions(data.sessions); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [childId]);

  async function toggleSession(sessionId: string) {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sessionId);
    if (questions[sessionId]) return; // already loaded
    setLoadingSession(sessionId);
    try {
      const r = await fetch(`/api/parent/quiz-review?childId=${childId}&sessionId=${sessionId}`);
      const data = (await r.json()) as { questions: Question[] };
      setQuestions((prev) => ({ ...prev, [sessionId]: data.questions }));
    } finally {
      setLoadingSession(null);
    }
  }

  return (
    <AppFrame audience="parent" currentPath="/parent/quiz-review">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 60px" }}>
        {/* Back link */}
        <div style={{ marginBottom: 16 }}>
          <Link href="/parent" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>← Family Hub</Link>
        </div>

        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.text, marginBottom: 4 }}>Quiz Review</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
          See exactly what your child practiced — question by question, right or wrong.
        </p>

        {/* Child selector */}
        {children.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => { setChildId(c.id); setExpandedId(null); }}
                style={{
                  padding: "6px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                  border: childId === c.id ? "1.5px solid #9b72ff" : "1.5px solid rgba(255,255,255,0.12)",
                  background: childId === c.id ? "rgba(155,114,255,0.15)" : "rgba(255,255,255,0.04)",
                  color: childId === c.id ? "#9b72ff" : C.muted,
                  fontSize: 13, fontWeight: 700,
                }}
              >
                {c.displayName}
              </button>
            ))}
          </div>
        )}

        {/* Sessions list */}
        {loading && (
          <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "40px 0" }}>Loading sessions…</div>
        )}

        {!loading && sessions.length === 0 && childId && (
          <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "48px 0" }}>
            No completed sessions yet.
          </div>
        )}

        {sessions.map((session) => (
          <div key={session.id} style={{ marginBottom: 10 }}>
            <SessionCard
              session={session}
              expanded={expandedId === session.id}
              onExpand={() => void toggleSession(session.id)}
            />

            {/* Expanded question breakdown */}
            {expandedId === session.id && (
              <div style={{ padding: "12px 16px 4px", background: "rgba(0,0,0,0.15)", borderRadius: "0 0 16px 16px", marginTop: -2 }}>
                {loadingSession === session.id && (
                  <div style={{ color: C.muted, fontSize: 12, padding: "8px 0" }}>Loading questions…</div>
                )}
                {(questions[session.id] ?? []).map((q, i) => (
                  <QuestionRow key={i} q={q} index={i + 1} />
                ))}
                {questions[session.id]?.length === 0 && (
                  <div style={{ color: C.muted, fontSize: 12, padding: "8px 0" }}>No question data for this session.</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </AppFrame>
  );
}
