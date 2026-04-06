"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type PinState = "idle" | "partial" | "complete" | "checking" | "wrong" | "locked";

// ─── Numpad layout ────────────────────────────────────────────────────────────

const NUMPAD_KEYS = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "", letters: "" }, // empty cell
  { digit: "0", letters: "" },
  { digit: "backspace", letters: "" },
];

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30_000;

// ─── Component ────────────────────────────────────────────────────────────────

// Inner component — must be inside <Suspense> because it calls useSearchParams
function ChildPinInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState<string[]>([]);
  const [pinState, setPinState] = useState<PinState>("idle");
  const [wrongCount, setWrongCount] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
  const [bouncing, setBouncing] = useState(true);

  // Get username from URL params or stored in localStorage
  const username = searchParams.get("username") ??
    (typeof window !== "undefined" ? localStorage.getItem("wonderquest-last-username") ?? "" : "");

  // Locked countdown timer
  useEffect(() => {
    if (pinState !== "locked" || lockUntil === null) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setPinState("idle");
        setPin([]);
        setWrongCount(0);
        setLockUntil(null);
        setLockSecondsLeft(0);
        clearInterval(interval);
      } else {
        setLockSecondsLeft(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [pinState, lockUntil]);

  // Auto-check when 4 digits entered — call real API
  useEffect(() => {
    if (pin.length === 4 && pinState !== "checking") {
      if (!username) {
        // No username available — redirect to full login
        router.push("/child");
        return;
      }
      setPinState("checking");
      setBouncing(false);
      fetch("/api/child/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin: pin.join(""), launchBandCode: "" }),
      })
        .then((r) => r.json())
        .then((data: { error?: string }) => {
          if (data.error) throw new Error(data.error);
          setPinState("complete");
          setTimeout(() => router.push("/play?sessionMode=guided-quest&entry=returning"), 600);
        })
        .catch(() => {
          const next = wrongCount + 1;
          setWrongCount(next);
          if (next >= MAX_ATTEMPTS) {
            const until = Date.now() + LOCK_DURATION_MS;
            setLockUntil(until);
            setLockSecondsLeft(LOCK_DURATION_MS / 1000);
            setPinState("locked");
          } else {
            setPinState("wrong");
            setTimeout(() => {
              setPin([]);
              setPinState("idle");
              setBouncing(true);
            }, 1200);
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function handleKey(digit: string) {
    if (pinState === "checking" || pinState === "complete" || pinState === "locked") return;
    if (digit === "backspace") {
      setPin((prev) => {
        const next = prev.slice(0, -1);
        if (next.length === 0) setPinState("idle");
        else setPinState("partial");
        return next;
      });
      return;
    }
    if (digit === "") return;
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const next = [...prev, digit];
      if (next.length < 4) setPinState("partial");
      return next;
    });
  }

  // ─── Derived visuals ────────────────────────────────────────────────────────

  const mascotEmoji = pinState === "locked" ? "😔" : pinState === "wrong" ? "😬" : "🦋";

  const dotColor = (idx: number): React.CSSProperties => {
    const filled = idx < pin.length;
    if (pinState === "complete") return { background: "#50e890", borderColor: "#50e890", transform: "scale(1.15)" };
    if (pinState === "wrong") return { background: "#ff7b6b", borderColor: "#ff7b6b", transform: "scale(1.15)" };
    if (pinState === "checking" && filled) return { background: "#9b72ff", borderColor: "#9b72ff", transform: "scale(1.15)" };
    if (filled) return { background: "#9b72ff", borderColor: "#9b72ff", transform: "scale(1.15)" };
    return { background: "#2a2060", borderColor: "#4a30b0" };
  };

  const subText = () => {
    if (pinState === "locked") return `Locked — try again in ${lockSecondsLeft}s`;
    if (pinState === "complete") return "✨ Entering your world…";
    if (pinState === "checking") return "Checking…";
    if (pinState === "wrong") return `Wrong code. ${MAX_ATTEMPTS - wrongCount} tries left`;
    return "Enter your 4-digit magic code";
  };

  const subColor = () => {
    if (pinState === "complete" || pinState === "checking") return "#50e890";
    if (pinState === "wrong") return "#ff7b6b";
    if (pinState === "locked") return "#ff7b6b";
    return "#b8a0e8";
  };

  const padDisabled = pinState === "checking" || pinState === "complete" || pinState === "locked";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0820",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Nunito', system-ui, sans-serif",
          padding: "0 0 48px",
        }}
      >
        {/* Back nav */}
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "16px 20px 0",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link
            href="/child"
            style={{
              color: "#9b72ff",
              fontWeight: 900,
              fontSize: 14,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← Back
          </Link>
        </div>

        {/* PIN card */}
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            margin: "24px 16px 0",
            background: "#100b2e",
            borderRadius: 32,
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 0 0 2px #2a2060",
            padding: "32px 28px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Mascot */}
          <div
            style={{
              fontSize: 56,
              marginBottom: 12,
              animation: bouncing && pinState !== "checking" ? "mascot-bounce 2s ease-in-out infinite" : "none",
              display: "inline-block",
            }}
          >
            {mascotEmoji}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 4,
              textAlign: "center",
              fontFamily: "'Nunito', system-ui, sans-serif",
            }}
          >
            Hi, Zara! 👋
          </div>

          {/* Sub */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: subColor(),
              textAlign: "center",
              marginBottom: 28,
              transition: "color 0.3s",
              fontFamily: "'Nunito', system-ui, sans-serif",
              animation: pinState === "complete" ? "blink 1s ease-in-out infinite" : "none",
            }}
          >
            {subText()}
          </div>

          {/* PIN dots */}
          <div style={{ display: "flex", gap: 14, marginBottom: 32 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "2px solid #4a30b0",
                  transition: "all 0.2s",
                  ...dotColor(i),
                }}
              />
            ))}
          </div>

          {/* Numpad */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              width: "100%",
              maxWidth: 280,
              opacity: padDisabled ? 0.4 : 1,
              pointerEvents: padDisabled ? "none" : "auto",
              transition: "opacity 0.3s",
            }}
          >
            {NUMPAD_KEYS.map((key, idx) => {
              const isEmpty = key.digit === "";
              const isBackspace = key.digit === "backspace";

              return (
                <button
                  key={idx}
                  onClick={() => handleKey(key.digit)}
                  disabled={padDisabled || isEmpty}
                  aria-label={isBackspace ? "Backspace" : key.digit === "" ? undefined : key.digit}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 20,
                    background: isEmpty
                      ? "transparent"
                      : isBackspace
                      ? "#1a1060"
                      : "#1a1460",
                    border: isEmpty ? "2px solid transparent" : "2px solid #2a2060",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isEmpty ? "default" : "pointer",
                    transition: "all 0.12s",
                    WebkitTapHighlightColor: "transparent",
                    padding: 0,
                    fontFamily: "'Nunito', system-ui, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isEmpty && !padDisabled) {
                      (e.currentTarget as HTMLButtonElement).style.background = "#2a1880";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#9b72ff";
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEmpty) {
                      (e.currentTarget as HTMLButtonElement).style.background = isBackspace ? "#1a1060" : "#1a1460";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2060";
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!isEmpty && !padDisabled) {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.94)";
                      (e.currentTarget as HTMLButtonElement).style.background = "#3a28a0";
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!isEmpty) {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                      (e.currentTarget as HTMLButtonElement).style.background = isBackspace ? "#1a1060" : "#1a1460";
                    }
                  }}
                >
                  {isBackspace ? (
                    <span style={{ fontSize: 22, color: "#fff", fontWeight: 900, lineHeight: 1 }}>⌫</span>
                  ) : !isEmpty ? (
                    <>
                      <span
                        style={{
                          fontSize: 28,
                          fontWeight: 900,
                          color: "#fff",
                          lineHeight: 1,
                          fontFamily: "'Nunito', system-ui, sans-serif",
                        }}
                      >
                        {key.digit}
                      </span>
                      {key.letters && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#6a5090",
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            marginTop: 2,
                            fontFamily: "'Nunito', system-ui, sans-serif",
                          }}
                        >
                          {key.letters}
                        </span>
                      )}
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Help / locked messaging */}
          {pinState === "locked" ? (
            <div
              style={{
                marginTop: 20,
                fontSize: 13,
                fontWeight: 700,
                color: "#ff7b6b",
                textAlign: "center",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Too many wrong tries 😔
              <br />
              <span style={{ color: "#6a5090" }}>Ask a parent to help unlock</span>
            </div>
          ) : (
            <div
              style={{
                marginTop: 20,
                fontSize: 12,
                fontWeight: 700,
                color: "#6a5090",
                textAlign: "center",
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              Forgot your code? Ask a parent 💙
            </div>
          )}
        </div>

        {/* Keyframe styles injected via style tag */}
        <style>{`
          @keyframes mascot-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
    </div>
  );
}

export default function ChildPinPage() {
  return (
    <AppFrame audience="kid" currentPath="/child">
      <Suspense fallback={
        <div style={{
          minHeight: "100vh",
          background: "#0a0820",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9b72ff",
          fontSize: 18,
          fontFamily: "system-ui",
        }}>
          🔑 Loading…
        </div>
      }>
        <ChildPinInner />
      </Suspense>
    </AppFrame>
  );
}
