"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#0a0820",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  surface: "#1a1540",
  border: "#2a2060",
} as const;

const font: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif" };

type BandCode = "PREK" | "K1" | "G23" | "G45";

type PlacementQuestion = {
  id: string;
  band: BandCode;
  prompt: string;
  options: string[];
  correct: number;
  emoji: string;
};

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // PREK
  { id: "p1", band: "PREK", prompt: "Which picture shows a circle?", options: ["🔺 Triangle", "⭕ Circle", "⬛ Square", "⬟ Diamond"], correct: 1, emoji: "⭕" },
  { id: "p2", band: "PREK", prompt: "Count the stars: ⭐⭐⭐", options: ["1", "2", "3", "4"], correct: 2, emoji: "⭐" },
  { id: "p3", band: "PREK", prompt: "Which animal says 'moo'?", options: ["🐱 Cat", "🐶 Dog", "🐮 Cow", "🐷 Pig"], correct: 2, emoji: "🐮" },
  // K1
  { id: "k1", band: "K1", prompt: "What letter does 'Apple' start with?", options: ["B", "A", "C", "D"], correct: 1, emoji: "🍎" },
  { id: "k2", band: "K1", prompt: "What is 3 + 2?", options: ["4", "5", "6", "7"], correct: 1, emoji: "➕" },
  { id: "k3", band: "K1", prompt: "Which word rhymes with 'cat'?", options: ["Dog", "Hat", "Bus", "Car"], correct: 1, emoji: "🎵" },
  // G23
  { id: "g1", band: "G23", prompt: "What is 15 - 7?", options: ["6", "7", "8", "9"], correct: 2, emoji: "➖" },
  { id: "g2", band: "G23", prompt: "Which word is spelled correctly?", options: ["Frend", "Friend", "Freind", "Freiend"], correct: 1, emoji: "📝" },
  { id: "g3", band: "G23", prompt: "How many sides does a hexagon have?", options: ["4", "5", "6", "8"], correct: 2, emoji: "⬡" },
  // G45
  { id: "a1", band: "G45", prompt: "What is 7 × 8?", options: ["54", "56", "58", "64"], correct: 1, emoji: "✖️" },
  { id: "a2", band: "G45", prompt: "What is the main idea of a paragraph?", options: ["The first sentence", "The longest sentence", "What the paragraph is mostly about", "The last sentence"], correct: 2, emoji: "📖" },
  { id: "a3", band: "G45", prompt: "Which fraction is equivalent to 1/2?", options: ["2/3", "3/4", "4/8", "5/9"], correct: 2, emoji: "½" },
];

const BAND_ORDER: BandCode[] = ["PREK", "K1", "G23", "G45"];

const BAND_META: Record<BandCode, { name: string; desc: string; icon: string; color: string }> = {
  PREK: { name: "Seedling Grove",  desc: "Pre-K · Ages 3–5",     icon: "🌱", color: "#fbbf24" },
  K1:   { name: "Star Valley",     desc: "K–1 · Ages 5–7",       icon: "⭐", color: "#9b72ff" },
  G23:  { name: "Explorer Ridge",  desc: "Grades 2–3 · Ages 7–9", icon: "🚀", color: "#2dd4bf" },
  G45:  { name: "Lightning Peak",  desc: "Grades 4–5 · Ages 9–11", icon: "⚡", color: "#60a5fa" },
};

const TOTAL_QUESTIONS = 5;

/** Pick a random unused question from the given band. Falls back to any unused question. */
function pickQuestion(
  band: BandCode,
  used: Set<string>,
  allQuestions: PlacementQuestion[],
): PlacementQuestion | null {
  const preferred = allQuestions.filter((q) => q.band === band && !used.has(q.id));
  if (preferred.length > 0) return preferred[Math.floor(Math.random() * preferred.length)];
  const fallback = allQuestions.filter((q) => !used.has(q.id));
  if (fallback.length > 0) return fallback[Math.floor(Math.random() * fallback.length)];
  return null;
}

/** Determine result band from score map */
function computeResultBand(scores: Record<BandCode, number>): BandCode {
  // Place in highest band where child got >= 1 correct
  for (let i = BAND_ORDER.length - 1; i >= 0; i--) {
    if (scores[BAND_ORDER[i]] >= 1) return BAND_ORDER[i];
  }
  return "PREK";
}

type Phase = "welcome" | "question" | "feedback" | "result";

export default function PlacementPage() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [currentBand, setCurrentBand] = useState<BandCode>("K1");
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [answered, setAnswered] = useState(0);
  const [scores, setScores] = useState<Record<BandCode, number>>({ PREK: 0, K1: 0, G23: 0, G45: 0 });
  const [currentQuestion, setCurrentQuestion] = useState<PlacementQuestion | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [resultBand, setResultBand] = useState<BandCode>("K1");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const startAssessment = useCallback(() => {
    const q = pickQuestion("K1", new Set(), PLACEMENT_QUESTIONS);
    setCurrentQuestion(q);
    setUsedIds(q ? new Set([q.id]) : new Set());
    setPhase("question");
  }, []);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (!currentQuestion || selectedIdx !== null) return;
      const correct = idx === currentQuestion.correct;
      const newScores = { ...scores };
      if (correct) newScores[currentQuestion.band] = (newScores[currentQuestion.band] ?? 0) + 1;
      setScores(newScores);
      setSelectedIdx(idx);
      setWasCorrect(correct);
      setPhase("feedback");

      const newAnswered = answered + 1;
      setAnswered(newAnswered);

      if (newAnswered >= TOTAL_QUESTIONS) {
        // Done — compute result
        const result = computeResultBand(newScores);
        setResultBand(result);
        setTimeout(() => {
          setSaving(true);
          fetch("/api/child/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ launchBandCode: result }),
          })
            .catch(() => setSaveError(true))
            .finally(() => {
              setSaving(false);
              setPhase("result");
            });
        }, 1400);
        return;
      }

      // Adaptive next band
      const curIdx = BAND_ORDER.indexOf(currentQuestion.band);
      let nextBandIdx = correct ? Math.min(curIdx + 1, BAND_ORDER.length - 1) : Math.max(curIdx - 1, 0);
      const nextBand = BAND_ORDER[nextBandIdx];

      const newUsed = new Set([...usedIds, currentQuestion.id]);
      const next = pickQuestion(nextBand, newUsed, PLACEMENT_QUESTIONS);
      setCurrentBand(nextBand);

      setTimeout(() => {
        if (next) {
          setCurrentQuestion(next);
          setUsedIds(new Set([...newUsed, next.id]));
        }
        setSelectedIdx(null);
        setPhase("question");
      }, 1400);
    },
    [currentQuestion, selectedIdx, scores, answered, usedIds],
  );

  // ── Welcome ──────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`@keyframes placement-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
        <div style={{ ...font, minHeight: "100vh", background: C.base, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
          <div style={{ width: "100%", maxWidth: 480, background: "linear-gradient(135deg, #1a1060 0%, #140e50 100%)", border: `2px solid ${C.border}`, borderRadius: 24, padding: "40px 32px", textAlign: "center" }}>
            <span style={{ fontSize: 80, display: "block", marginBottom: 20, animation: "placement-bounce 2s ease-in-out infinite" }}>🌟</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 12, lineHeight: 1.2 }}>
              Let&apos;s find your perfect level!
            </div>
            <div style={{ fontSize: 16, color: "#b8a0e8", fontWeight: 700, marginBottom: 32, lineHeight: 1.5 }}>
              Answer 5 quick questions — no pressure, just do your best! 🌟
            </div>
            <button
              onClick={startAssessment}
              style={{ ...font, width: "100%", padding: "16px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.violet}, #7c4ddb)`, color: "#fff", fontSize: 18, fontWeight: 900, cursor: "pointer", boxShadow: "0 6px 20px rgba(155,114,255,0.4)" }}
            >
              Let&apos;s go! →
            </button>
          </div>
        </div>
      </AppFrame>
    );
  }

  // ── Question / Feedback ───────────────────────────────────────────────────
  if ((phase === "question" || phase === "feedback") && currentQuestion) {
    const dots = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i);
    const completedCount = phase === "feedback" ? answered : answered;

    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`
          @keyframes pop-in { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes correct-flash { 0% { background: #1e1470; } 50% { background: #0e3020; } 100% { background: #0e3020; } }
          @keyframes wrong-flash  { 0% { background: #1e1470; } 50% { background: #2a0a10; } 100% { background: #2a0a10; } }
        `}</style>
        <div style={{ ...font, minHeight: "100vh", background: C.base, display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px 40px" }}>
          <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {dots.map((i) => {
                const filled = i < completedCount;
                const active = i === completedCount - 1 && phase === "feedback";
                return (
                  <div
                    key={i}
                    style={{
                      width: active ? 28 : 16,
                      height: 16,
                      borderRadius: 8,
                      background: filled ? C.violet : C.border,
                      transition: "all 0.3s ease",
                      boxShadow: active ? `0 0 8px ${C.violet}` : "none",
                    }}
                  />
                );
              })}
            </div>

            {/* Question card */}
            <div style={{ background: "linear-gradient(135deg, #1a1060, #140e50)", border: `2px solid ${C.border}`, borderRadius: 24, padding: "28px 24px", textAlign: "center", animation: "pop-in 0.25s ease" }}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>{currentQuestion.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>
                {currentQuestion.prompt}
              </div>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>
                Question {Math.min(answered + (phase === "question" ? 1 : 0), TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}
              </div>
            </div>

            {/* Answer options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentQuestion.options.map((opt, i) => {
                let bg = "#1e1470";
                let borderCol: string = C.border;
                let textColor: string = C.text;

                if (phase === "feedback" && selectedIdx !== null) {
                  if (i === currentQuestion.correct) {
                    bg = "#0e3020"; borderCol = C.mint; textColor = C.mint;
                  } else if (i === selectedIdx && !wasCorrect) {
                    bg = "#2a0a10"; borderCol = "#ff6b6b"; textColor = "#ff9b9b";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={phase === "feedback"}
                    style={{
                      ...font,
                      width: "100%",
                      padding: "16px 20px",
                      borderRadius: 16,
                      border: `2px solid ${borderCol}`,
                      background: bg,
                      color: textColor,
                      fontSize: 17,
                      fontWeight: 800,
                      cursor: phase === "feedback" ? "default" : "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                  >
                    <span style={{ display: "inline-block", width: 28, height: 28, borderRadius: 8, background: phase === "feedback" && i === currentQuestion.correct ? C.mint : phase === "feedback" && i === selectedIdx && !wasCorrect ? "#ff6b6b" : C.border, color: phase === "feedback" && i === currentQuestion.correct ? "#0a2a15" : "#fff", fontSize: 13, fontWeight: 900, textAlign: "center", lineHeight: "28px", marginRight: 12, flexShrink: 0 }}>
                      {["A", "B", "C", "D"][i]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Encouragement after answer */}
            {phase === "feedback" && (
              <div style={{ textAlign: "center", fontSize: 18, fontWeight: 900, color: C.gold, animation: "pop-in 0.2s ease" }}>
                {wasCorrect ? "Great job! ⭐" : "Good try! Keep going! 💪"}
              </div>
            )}
          </div>
        </div>
      </AppFrame>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (phase === "result") {
    const meta = BAND_META[resultBand];
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`@keyframes result-pop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }`}</style>
        <div style={{ ...font, minHeight: "100vh", background: C.base, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
          <div style={{ width: "100%", maxWidth: 480, background: "linear-gradient(135deg, #1a1060 0%, #140e50 100%)", border: `2px solid ${meta.color}`, borderRadius: 24, padding: "40px 32px", textAlign: "center", boxShadow: `0 0 40px ${meta.color}33` }}>
            <span style={{ fontSize: 88, display: "block", marginBottom: 16, animation: "result-pop 0.5s ease" }}>
              {meta.icon}
            </span>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
              Your perfect level is
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: meta.color, marginBottom: 6, lineHeight: 1.1 }}>
              {meta.name}
            </div>
            <div style={{ fontSize: 16, color: "#b8a0e8", fontWeight: 700, marginBottom: 8 }}>
              {meta.desc}
            </div>
            <div style={{ fontSize: 15, color: C.text, fontWeight: 700, marginBottom: 32, lineHeight: 1.5 }}>
              You&apos;re a {meta.name} learner! 🎉<br />Your adventure starts here!
            </div>

            {saving && (
              <div style={{ fontSize: 13, color: C.muted, fontWeight: 700, marginBottom: 16 }}>
                Saving your level...
              </div>
            )}
            {saveError && (
              <div style={{ fontSize: 12, color: "#ff9b9b", fontWeight: 700, marginBottom: 16 }}>
                Couldn&apos;t save — you can still continue!
              </div>
            )}

            <Link
              href="/play"
              style={{ display: "block", width: "100%", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${C.violet}, #7c4ddb)`, color: "#fff", fontSize: 18, fontWeight: 900, textDecoration: "none", boxShadow: "0 6px 20px rgba(155,114,255,0.4)", boxSizing: "border-box" }}
            >
              Start your adventure →
            </Link>

            <div style={{ marginTop: 20 }}>
              <Link href="/child" style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}>
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </AppFrame>
    );
  }

  // Fallback — shouldn't reach here
  return null;
}
