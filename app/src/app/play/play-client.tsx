"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShellCard, StatTile } from "@/components/ui";

type SessionQuestion = {
  questionKey: string;
  prompt: string;
  answers: string[];
  explainerKey: string;
  subject: string;
  skill: string;
  difficulty: number;
  theme: string;
};

type SessionPayload = {
  sessionId: string;
  student: {
    id: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    preferredThemeCode: string | null;
  };
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
  questions: SessionQuestion[];
};

type AnswerPayload = {
  correct: boolean;
  pointsEarned: number;
  correctAnswer: string;
  needsRetry: boolean;
  sessionCompleted: boolean;
  explainer: {
    format: string;
    script: string;
    mediaHint: string;
  } | null;
  progression: {
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  };
  milestones: {
    leveledUp: boolean;
    badgeEarned: boolean;
    trophyEarned: boolean;
  };
};

export default function PlayClient() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const sessionMode = searchParams.get("sessionMode") ?? "guided-quest";

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [progression, setProgression] = useState<SessionPayload["progression"] | null>(
    null,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [answerState, setAnswerState] = useState<AnswerPayload | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      if (!studentId) {
        setError("A child profile is required before play can start.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/play/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            sessionMode,
          }),
        });

        const payload = (await response.json()) as SessionPayload & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not start session.");
        }

        if (!active) {
          return;
        }

        setSession(payload);
        setProgression(payload.progression);
      } catch (caughtError) {
        if (!active) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not start session.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      active = false;
    };
  }, [sessionMode, studentId]);

  const currentQuestion = useMemo(
    () => session?.questions[currentIndex] ?? null,
    [currentIndex, session],
  );

  async function submitAnswer(answer: string) {
    if (!session || !currentQuestion) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/play/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          studentId: session.student.id,
          questionKey: currentQuestion.questionKey,
          answer,
          attempt,
        }),
      });

      const payload = (await response.json()) as AnswerPayload & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not submit answer.");
      }

      setAnswerState(payload);
      setProgression(payload.progression);

      if (payload.correct) {
        setAttempt(1);
      } else {
        setAttempt((value) => value + 1);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not submit answer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function moveToNextQuestion() {
    if (!session) {
      return;
    }

    const isLastQuestion = currentIndex >= session.questions.length - 1;

    if (isLastQuestion) {
      return;
    }

    setCurrentIndex((value) => value + 1);
    setAttempt(1);
    setAnswerState(null);
  }

  if (loading) {
    return (
      <main className="page-shell page-shell-split">
        <section className="page-hero">
          <div>
            <span className="eyebrow">WonderQuest Learning</span>
            <h1>Preparing your next challenge.</h1>
            <p>Loading the first playable question set from the live prototype.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <main className="page-shell page-shell-split">
        <ShellCard eyebrow="Play" title="We could not start the session">
          <p>{error || "The session could not be prepared."}</p>
          <div className="form-actions">
            <Link className="primary-link" href="/child">
              Back to child setup
            </Link>
          </div>
        </ShellCard>
      </main>
    );
  }

  const finished =
    Boolean(answerState?.sessionCompleted) &&
    currentIndex === session.questions.length - 1 &&
    Boolean(answerState?.correct);

  return (
    <main className="page-shell page-shell-split">
      <section className="page-hero play-hero">
        <div>
          <span className="eyebrow">WonderQuest Learning</span>
          <h1>{session.student.displayName}&apos;s live challenge loop.</h1>
          <p>
            This is the first playable Supabase-backed session flow with retries,
            explainers, and persistent progression.
          </p>
        </div>
        <div className="hero-route-summary">
          <StatTile
            label="Session mode"
            value={sessionMode === "guided-quest" ? "Guided" : "Challenge"}
            detail={`Question ${Math.min(currentIndex + 1, session.questions.length)} of ${session.questions.length}`}
          />
          <StatTile
            label="Level"
            value={`L${progression?.currentLevel ?? 1}`}
            detail={`${progression?.totalPoints ?? 0} points`}
          />
          <StatTile
            label="Rewards"
            value={`${progression?.badgeCount ?? 0} badges`}
            detail={`${progression?.trophyCount ?? 0} trophies`}
          />
        </div>
      </section>

      <section className="route-grid">
        <ShellCard eyebrow="Question" title={finished ? "Session complete" : currentQuestion.prompt}>
          {finished ? (
            <div className="status-panel">
              <strong>Session complete.</strong>
              <p>
                {session.student.displayName} finished the current loop with{" "}
                {progression?.totalPoints ?? 0} total points and level{" "}
                {progression?.currentLevel ?? 1}.
              </p>
            </div>
          ) : (
            <>
              <div className="summary-chip-row">
                <span className="summary-chip">{currentQuestion.subject}</span>
                <span className="summary-chip">{currentQuestion.skill}</span>
                <span className="summary-chip">
                  difficulty {currentQuestion.difficulty}
                </span>
              </div>
              <div className="choice-column">
                {currentQuestion.answers.map((answer) => (
                  <button
                    className="mode-card"
                    disabled={submitting || Boolean(answerState?.correct)}
                    key={answer}
                    onClick={() => void submitAnswer(answer)}
                    type="button"
                  >
                    {answer}
                  </button>
                ))}
              </div>
            </>
          )}
          {error ? <p className="status-banner status-error">{error}</p> : null}
          {answerState?.correct && !finished ? (
            <div className="status-panel status-success">
              <strong>Nice work.</strong>
              <p>
                +{answerState.pointsEarned} points. Correct answer locked in for
                this question.
              </p>
              <div className="form-actions">
                <button className="primary-link button-link" onClick={moveToNextQuestion} type="button">
                  Next question
                </button>
              </div>
            </div>
          ) : null}
        </ShellCard>

        <ShellCard eyebrow="Support" title="Adaptive help and recovery">
          {answerState?.needsRetry && answerState.explainer ? (
            <div className="status-panel">
              <strong>Quick explainer ready.</strong>
              <p>{answerState.explainer.script}</p>
              <p className="soft-copy">
                Format: {answerState.explainer.format} · Media hint:{" "}
                {answerState.explainer.mediaHint}
              </p>
              <p className="soft-copy">
                Retry the same question after the explanation. Second-attempt
                wins still earn recovery points.
              </p>
            </div>
          ) : (
            <ul className="route-list">
              <li>Wrong answers trigger explainers instead of dead ends.</li>
              <li>Correct retries still earn points and keep motivation up.</li>
              <li>Progression state updates immediately after each correct answer.</li>
            </ul>
          )}
          {answerState?.milestones.leveledUp ? (
            <p className="status-banner status-success">Level up unlocked.</p>
          ) : null}
          {answerState?.milestones.badgeEarned ? (
            <p className="status-banner status-success">New badge earned.</p>
          ) : null}
          {answerState?.milestones.trophyEarned ? (
            <p className="status-banner status-success">New trophy earned.</p>
          ) : null}
          <div className="form-actions">
            <Link className="secondary-link" href="/child">
              Switch child
            </Link>
            <Link className="secondary-link" href="/parent">
              Parent view
            </Link>
          </div>
        </ShellCard>
      </section>
    </main>
  );
}
