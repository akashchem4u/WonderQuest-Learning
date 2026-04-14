"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DegradedBanner } from "@/components/degraded-banner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChildAccessResponse = {
  created: boolean;
  student: {
    id: string;
    username: string;
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
};

type AvailableQuest = {
  id: string;
  source: "parent" | "teacher";
  skillCode: string;
  label: string;
  subject: "math" | "reading" | "literacy";
  priority: string;
  note: string | null;
  pushedAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBandProfile(bandCode: string) {
  switch (bandCode) {
    case "PREK":
      return { emoji: "🐣", title: "Tiny Explorer", ageLabel: "Ages 2–5" };
    case "K1":
      return { emoji: "⚽", title: "Super Starter", ageLabel: "Kinder – Grade 1" };
    case "G23":
      return { emoji: "🚀", title: "Space Adventurer", ageLabel: "Grades 2–3" };
    case "G45":
      return { emoji: "🏗️", title: "Master Builder", ageLabel: "Grades 4–5" };
    default:
      return { emoji: "⭐", title: bandCode, ageLabel: bandCode };
  }
}

function getAvatarSymbol(avatarKey: string) {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "✨";
}

// ─── Shared page shell ────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="home-launcher" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
      <DegradedBanner />
      <div className="home-glow home-glow-violet" aria-hidden="true" />
      <div className="home-glow home-glow-teal" aria-hidden="true" />

      <header className="home-topbar">
        <Link className="home-logo" href="/">
          Wonder<span>Quest</span>
        </Link>
        <nav className="home-topbar-links" aria-label="Primary">
          <Link href="/parent" style={{ minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center" }}>For families</Link>
          <Link href="/teacher" style={{ minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center" }}>For teachers</Link>
        </nav>
        <div className="home-topbar-actions">
          <Link className="home-start-btn" href="/?manual=1" style={{ minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center" }}>
            Home
          </Link>
          <button
            onClick={() => { fetch("/api/child/logout").then(() => { window.location.href = "/child"; }); }}
            style={{
              padding: "6px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              minHeight: 44, minWidth: 44,
              touchAction: "manipulation",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {children}

      <div className="home-trust-strip">
        <span className="home-trust-item">🔒 COPPA-safe</span>
        <span className="home-trust-item">🚫 No chat</span>
        <span className="home-trust-item">👁️ No rankings</span>
        <span className="home-trust-item">📱 Any device</span>
      </div>
    </main>
  );
}

// ─── Subject icon helper ──────────────────────────────────────────────────────

function subjectIcon(subject: string) {
  if (subject === "math") return "🔢";
  if (subject === "literacy") return "🔤";
  return "📖";
}

function subjectColor(subject: string) {
  if (subject === "math") return "#ffd166";
  if (subject === "literacy") return "#9b72ff";
  return "#58e8c1";
}

// ─── Quest card ───────────────────────────────────────────────────────────────

function QuestCard({ quest, onStart }: { quest: AvailableQuest; onStart: () => void }) {
  const urgent = quest.priority === "urgent";
  const sourceLabel = quest.source === "teacher" ? "From Teacher" : "From Family";
  const sourceColor = quest.source === "teacher" ? "#38bdf8" : "#58e8c1";
  const sc = subjectColor(quest.subject);
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1.5px solid ${urgent ? "#ff7b6b55" : "rgba(155,114,255,0.2)"}`,
      borderRadius: 16, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: `${sc}18`, border: `1.5px solid ${sc}40`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
      }}>
        {subjectIcon(quest.subject)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#e8e0ff", marginBottom: 2 }}>
          {quest.label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: sourceColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {sourceLabel}
          </span>
          {urgent && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#ff7b6b", background: "rgba(255,123,107,0.12)", borderRadius: 6, padding: "1px 6px" }}>
              Urgent
            </span>
          )}
        </div>
        {quest.note && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {quest.note}
          </div>
        )}
      </div>
      <button
        onClick={onStart}
        style={{
          padding: "8px 16px", borderRadius: 999, border: "none",
          background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
          color: "#fff", fontSize: 12, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
          minHeight: 36, touchAction: "manipulation",
        }}
      >
        Start
      </button>
    </div>
  );
}

// ─── Hub — shown after sign-in ────────────────────────────────────────────────

function ChildHub({ result }: { result: ChildAccessResponse }) {
  const router = useRouter();
  const { student, progression } = result;
  const avatarEmoji = getAvatarSymbol(student.avatarKey);
  const bandProfile = getBandProfile(student.launchBandCode);

  const [quests, setQuests] = useState<{ parentQuests: AvailableQuest[]; teacherQuests: AvailableQuest[] } | null>(null);

  useEffect(() => {
    fetch("/api/child/available-quests")
      .then((r) => r.ok ? r.json() : null)
      .then((data: { parentQuests: AvailableQuest[]; teacherQuests: AvailableQuest[] } | null) => {
        if (data) setQuests(data);
      })
      .catch(() => null);
  }, []);

  function startQuest(quest: AvailableQuest) {
    const table = quest.source === "teacher" ? "teacher_pushed_sessions" : "guardian_pushed_activities";
    router.push(`/play?sessionMode=guided-quest&chosenQuestId=${quest.id}&chosenQuestTable=${table}`);
  }

  const allAssignedQuests = [...(quests?.teacherQuests ?? []), ...(quests?.parentQuests ?? [])];
  const mathQuests = allAssignedQuests.filter((q) => q.subject === "math");
  const literacyQuests = allAssignedQuests.filter((q) => q.subject !== "math");

  const stats = [
    { icon: "⭐", label: "Stars", value: progression.totalPoints },
    { icon: "📈", label: "Level", value: progression.currentLevel },
    { icon: "🏅", label: "Badges", value: progression.badgeCount },
    { icon: "🏆", label: "Trophies", value: progression.trophyCount },
  ];

  return (
    <PageShell>
      {/* Avatar hero */}
      <section className="home-hero" style={{ paddingBottom: 8 }}>
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 16 }} aria-hidden="true">
          {avatarEmoji}
        </div>
        <span className="home-badge">
          {bandProfile.emoji} {bandProfile.title} · {bandProfile.ageLabel}
        </span>
        <h1 className="home-title" style={{ fontSize: "clamp(2rem, 6vw, 3.2rem)" }}>
          Hi, {student.displayName}! ✨
        </h1>
        <p className="home-sub">Ready to continue your adventure?</p>
      </section>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", maxWidth: 520, margin: "0 auto 32px", padding: "0 20px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ flex: "1 1 100px", minWidth: 100, padding: "18px 12px", borderRadius: 20, background: "rgba(155,114,255,0.08)", border: "1px solid rgba(155,114,255,0.18)", textAlign: "center" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }} aria-hidden="true">{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Quest Selection ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 560, margin: "0 auto 40px", padding: "0 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.2, textAlign: "center", marginBottom: 16 }}>
          Choose Your Quest
        </div>

        {/* Assigned quests — by subject */}
        {allAssignedQuests.length > 0 && (
          <>
            {mathQuests.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ffd166", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  🔢 Math
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mathQuests.map((q) => <QuestCard key={q.id} quest={q} onStart={() => startQuest(q)} />)}
                </div>
              </div>
            )}
            {literacyQuests.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9b72ff", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  📖 Reading & Literacy
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {literacyQuests.map((q) => <QuestCard key={q.id} quest={q} onStart={() => startQuest(q)} />)}
                </div>
              </div>
            )}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
          </>
        )}

        {/* Free-choice explore quests */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
          🌟 Explore on your own
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {([
            { label: "Math Quest",          emoji: "🔢", color: "#ffd166", url: "/play?sessionMode=guided-quest&subject=math" },
            { label: "Reading Quest",        emoji: "📖", color: "#58e8c1", url: "/play?sessionMode=guided-quest&subject=reading" },
            { label: "Mixed Adventure",      emoji: "⚡", color: "#9b72ff", url: "/play?sessionMode=guided-quest" },
            { label: "Quick Practice",       emoji: "🎯", color: "#fb7185", url: "/play?sessionMode=practice" },
          ] as { label: string; emoji: string; color: string; url: string }[]).map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.url)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "16px 12px", borderRadius: 16,
                background: "rgba(255,255,255,0.04)", border: `1.5px solid ${item.color}30`,
                cursor: "pointer", fontFamily: "inherit",
                minHeight: 44, touchAction: "manipulation",
              }}
            >
              <span style={{ fontSize: 28 }}>{item.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#e8e0ff" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick access portals */}
      <div style={{ maxWidth: 480, margin: "0 auto 8px", padding: "0 16px" }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase", letterSpacing: 1.2,
          textAlign: "center", marginBottom: 12,
        }}>
          Your Adventure
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
          maxWidth: 480,
          margin: "0 auto",
        }}>
          {([
            { href: "/child/world",    emoji: "🗺️", label: "World Map",   desc: "See your progress",   color: "#9b72ff" },
            { href: "/play",           emoji: "⚡",  label: "Quick Quest", desc: "3-min practice",       color: "#ffd166" },
            { href: "/child/badges",   emoji: "🏅",  label: "My Badges",  desc: "Earned rewards",       color: "#50e890" },
            { href: "/child/trophies", emoji: "🏆",  label: "Trophies",   desc: "Special achievements", color: "#ff9f43" },
            { href: "/child/streak",   emoji: "🔥",  label: "Streak",     desc: "Daily habit",          color: "#fb7185" },
            { href: "/child/missed",   emoji: "🎯",  label: "Practice",   desc: "Skills to improve",    color: "#60a5fa" },
          ] as { href: string; emoji: string; label: string; desc: string; color: string }[]).map(item => (
            <a key={item.href} href={item.href} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "18px 12px", borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${item.color}30`,
              textDecoration: "none",
              gap: 6,
              minHeight: 44,
              touchAction: "manipulation",
            }}>
              <span style={{ fontSize: 32 }}>{item.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#e8e0ff" }}>{item.label}</span>
              <span style={{ fontSize: 11, color: "#9b8ec4", textAlign: "center" }}>{item.desc}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Settings quick links */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", padding: "16px 16px 24px" }}>
        {([
          { href: "/child/theme",           label: "🎨 Theme" },
          { href: "/child/voice-preferences", label: "🔊 Audio" },
          { href: "/child/high-contrast",   label: "♿ Accessibility" },
        ] as { href: string; label: string }[]).map(item => (
          <a key={item.href} href={item.href} style={{
            fontSize: 12, fontWeight: 700, color: "#9b8ec4",
            textDecoration: "none", padding: "6px 12px",
            borderRadius: 8, background: "rgba(255,255,255,0.04)",
            minHeight: 44, minWidth: 44,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            touchAction: "manipulation",
          }}>
            {item.label}
          </a>
        ))}
      </div>

      {/* Sign out / switch child */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <Link
          href="/child?manual=1"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
            transition: "color 0.15s",
            minHeight: 44,
            minWidth: 44,
            display: "inline-flex",
            alignItems: "center",
            touchAction: "manipulation",
          }}
        >
          Switch child →
        </Link>
        <a
          href="/api/child/logout"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
            transition: "color 0.15s",
            minHeight: 44,
            minWidth: 44,
            display: "inline-flex",
            alignItems: "center",
            touchAction: "manipulation",
          }}
        >
          Sign out →
        </a>
      </div>
    </PageShell>
  );
}

// ─── Access gate ──────────────────────────────────────────────────────────────

const PIN_ATTEMPTS_KEY = "wonderquest-pin-attempts";
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export default function ChildAccessPage() {
  const router = useRouter();
  const accessMode = "returning" as const;
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [recoveryHint, setRecoveryHint] = useState("");
  const [result, setResult] = useState<ChildAccessResponse | null>(null);
  const [failCount, setFailCount] = useState(0);

  // On mount: check for existing fail count
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = parseInt(localStorage.getItem(PIN_ATTEMPTS_KEY) ?? "0", 10);
      if (stored >= MAX_PIN_ATTEMPTS) {
        router.push(`/child/pin-lockout?seconds=${LOCKOUT_SECONDS}`);
      } else {
        setFailCount(stored);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    async function trySessionRestore() {
      const manualChildSwitch =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("manual") === "1";
      if (manualChildSwitch) return;
      try {
        const response = await fetch("/api/child/session", { method: "GET" });
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as ChildAccessResponse;
        if (!cancelled) setResult(payload);
      } catch {
        // no valid session — stay on form
      }
    }
    void trySessionRestore();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function appendPinDigit(digit: string) {
    setPin((cur) => (cur.length >= 4 ? cur : `${cur}${digit}`));
  }
  function removePinDigit() {
    setPin((cur) => cur.slice(0, -1));
  }
  function clearPin() {
    setPin("");
  }
  function handlePinFieldChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setRecoveryHint("");
    try {
      const response = await fetch("/api/child/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          pin,
          launchBandCode: "",
        }),
      });
      const payload = (await response.json()) as ChildAccessResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Child access failed.");
      // Success — clear fail count
      if (typeof window !== "undefined") localStorage.removeItem(PIN_ATTEMPTS_KEY);
      setResult(payload);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Child access failed.";
      if (message === "Wrong username or PIN." || message.toLowerCase().includes("pin")) {
        // Increment fail counter
        const newCount = failCount + 1;
        setFailCount(newCount);
        if (typeof window !== "undefined") localStorage.setItem(PIN_ATTEMPTS_KEY, String(newCount));
        if (newCount >= MAX_PIN_ATTEMPTS) {
          router.push(`/child/pin-lockout?seconds=${LOCKOUT_SECONDS}`);
          return;
        }
        const remaining = MAX_PIN_ATTEMPTS - newCount;
        setError("Oops, that PIN did not match.");
        setRecoveryHint(`${remaining} attempt${remaining === 1 ? "" : "s"} left before lockout. Ask a parent if you need help.`);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result) return <ChildHub result={result} />;

  // ── Shared input style ──────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 600,
    outline: "none",
    boxSizing: "border-box",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  };

  const numpadBtn: React.CSSProperties = {
    padding: "15px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.1s",
    minHeight: 44,
    minWidth: 44,
    touchAction: "manipulation",
  };

  // suppress unused variable warning
  void accessMode;

  return (
    <PageShell>
      {/* Hero */}
      <section className="home-hero" style={{ paddingBottom: 0 }}>
        <span className="home-badge">Ages 4–11 · Early access</span>
        <h1 className="home-title">
          Start your <span>adventure</span>
        </h1>
        <p className="home-sub">Sign in to continue your quests.</p>
      </section>

      {/* Form */}
      <div
        style={{
          maxWidth: 480,
          margin: "32px auto 0",
          padding: "0 20px 80px",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Username ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              autoComplete="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={inputStyle}
            />
          </div>

          {/* ── PIN ── */}
          <div>
            <div style={sectionLabel}>4-digit PIN</div>

            {/* Dots */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    border: `2px solid ${pin[i] ? "#9b72ff" : "rgba(255,255,255,0.1)"}`,
                    background: pin[i] ? "rgba(155,114,255,0.18)" : "rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: "#9b72ff",
                    transition: "all 0.1s",
                  }}
                  aria-hidden="true"
                >
                  {pin[i] ? "★" : ""}
                </div>
              ))}
            </div>

            {/* Keyboard input (accessible) */}
            <input
              autoComplete="one-time-code"
              id="child-pin-input"
              inputMode="numeric"
              maxLength={4}
              name="pin"
              onChange={handlePinFieldChange}
              pattern="[0-9]*"
              placeholder="Type PIN here"
              type="password"
              value={pin}
              style={{
                ...inputStyle,
                textAlign: "center",
                letterSpacing: 10,
                marginBottom: 12,
              }}
              aria-label="PIN input"
            />

            {/* Numpad */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button key={digit} type="button" onClick={() => appendPinDigit(digit)} style={numpadBtn}>
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={clearPin}
                style={{ ...numpadBtn, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", fontSize: 13 }}
              >
                Clear
              </button>
              <button type="button" onClick={() => appendPinDigit("0")} style={numpadBtn}>
                0
              </button>
              <button
                type="button"
                onClick={removePinDigit}
                style={{ ...numpadBtn, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", fontSize: 15 }}
              >
                ⌫
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
                fontSize: 13,
                fontWeight: 700,
              }}
              role="alert"
            >
              {error}
              {recoveryHint && (
                <p style={{ marginTop: 6, marginBottom: 0, fontWeight: 600, color: "rgba(252,165,165,0.65)" }}>
                  {recoveryHint}
                </p>
              )}
              {!recoveryHint && (
                <p style={{ marginTop: 8, marginBottom: 0, fontWeight: 500, color: "rgba(252,165,165,0.5)", fontSize: 12 }}>
                  {error.includes("parent dashboard")
                    ? "Child usernames start with 'explorer_' — check the credentials screen from the parent sign-up."
                    : "Tip: Your username and PIN were set up by your parent."}
                </p>
              )}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "16px",
              borderRadius: 999,
              border: "none",
              background: submitting
                ? "rgba(155,114,255,0.35)"
                : "linear-gradient(135deg, #9b72ff, #7c4ddb)",
              color: "#fff",
              fontFamily: "inherit",
              fontSize: 17,
              fontWeight: 900,
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting ? "none" : "0 8px 28px rgba(155,114,255,0.38)",
              letterSpacing: "-0.2px",
              transition: "all 0.15s",
              minHeight: 44,
              touchAction: "manipulation",
            }}
          >
            {submitting ? "Starting…" : "▶ Sign In & Play"}
          </button>

          {/* Forgot username help */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              Don&apos;t know your username?{" "}
              <a href="/parent" style={{ color: "#9b72ff", textDecoration: "none", fontWeight: 600 }}>
                Ask a parent →
              </a>
            </span>
          </div>

          {/* Helper text */}
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.35)",
              margin: 0,
            }}
          >
            Don&apos;t have an account? Ask a parent to set one up for you.
          </p>
        </form>
      </div>
    </PageShell>
  );
}
