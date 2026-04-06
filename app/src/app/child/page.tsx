"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvatarsForBand } from "@/lib/launch-data";
import { launchBands } from "@/lib/launch-plan";

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
    <main className="home-launcher">
      <div className="home-glow home-glow-violet" aria-hidden="true" />
      <div className="home-glow home-glow-teal" aria-hidden="true" />

      <header className="home-topbar">
        <Link className="home-logo" href="/">
          Wonder<span>Quest</span>
        </Link>
        <nav className="home-topbar-links" aria-label="Primary">
          <Link href="/parent">For families</Link>
          <Link href="/teacher">For teachers</Link>
        </nav>
        <div className="home-topbar-actions">
          <Link className="home-start-btn" href="/?manual=1">
            Home
          </Link>
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

// ─── Hub — shown after sign-in ────────────────────────────────────────────────

function ChildHub({ result }: { result: ChildAccessResponse }) {
  const router = useRouter();
  const { student, progression } = result;
  const avatarEmoji = getAvatarSymbol(student.avatarKey);
  const bandProfile = getBandProfile(student.launchBandCode);

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

      {/* Play CTA */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
        <button
          onClick={() => router.push("/play?sessionMode=guided-quest&entry=returning")}
          style={{
            padding: "16px 52px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 18,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(155,114,255,0.4)",
            letterSpacing: "-0.2px",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
        >
          ▶ Continue Adventure
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: 520,
          margin: "0 auto 48px",
          padding: "0 20px",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              flex: "1 1 100px",
              minWidth: 100,
              padding: "18px 12px",
              borderRadius: 20,
              background: "rgba(155,114,255,0.08)",
              border: "1px solid rgba(155,114,255,0.18)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }} aria-hidden="true">
              {s.icon}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              {s.value}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 4,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Sign out / switch child */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Link
          href="/child?manual=1"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.3)",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
        >
          Switch child →
        </Link>
      </div>
    </PageShell>
  );
}

// ─── Access gate ──────────────────────────────────────────────────────────────

export default function ChildAccessPage() {
  const router = useRouter();
  const [accessMode, setAccessMode] = useState<"new" | "returning">("new");
  const [selectedBand, setSelectedBand] = useState("K1");
  const [fixSavedBand, setFixSavedBand] = useState(false);
  const [selectedMode, setSelectedMode] = useState("guided-quest");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [recoveryHint, setRecoveryHint] = useState("");
  const [result, setResult] = useState<ChildAccessResponse | null>(null);

  const avatars = useMemo(() => getAvatarsForBand(selectedBand), [selectedBand]);
  const returningMode = accessMode === "returning";
  const selectedBandIsEarlyLearner = selectedBand === "PREK" || selectedBand === "K1";
  const earlyLearnerBand = returningMode
    ? fixSavedBand
      ? selectedBandIsEarlyLearner
      : false
    : selectedBandIsEarlyLearner;
  const guidedOnlyMode = earlyLearnerBand || returningMode;

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
        if (cancelled) return;
        router.push("/play?sessionMode=guided-quest&entry=returning");
      } catch {
        // no valid session — stay on form
      }
    }
    void trySessionRestore();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!avatars.some((item) => item.avatar_key === selectedAvatar)) {
      setSelectedAvatar(avatars[0]?.avatar_key ?? "");
    }
  }, [avatars, selectedAvatar]);

  useEffect(() => {
    if (guidedOnlyMode) setSelectedMode("guided-quest");
  }, [guidedOnlyMode]);

  useEffect(() => {
    if (!returningMode) setFixSavedBand(false);
  }, [returningMode]);

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
          displayName,
          avatarKey: selectedAvatar,
          launchBandCode: returningMode && !fixSavedBand ? "" : selectedBand,
        }),
      });
      const payload = (await response.json()) as ChildAccessResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Child access failed.");
      setResult(payload);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Child access failed.";
      if (returningMode && message === "Wrong username or PIN.") {
        setError("Oops, that PIN did not match.");
        setRecoveryHint("Try the same 4 digits again, or switch to new adventurer for first-time setup.");
      } else if (returningMode && message === "Display name and avatar are required for first-time setup.") {
        setError("We couldn't find that adventurer yet.");
        setRecoveryHint("Check the username, or switch to new adventurer to create the profile.");
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
  };

  return (
    <PageShell>
      {/* Hero */}
      <section className="home-hero" style={{ paddingBottom: 0 }}>
        <span className="home-badge">Ages 2–10 · Early access</span>
        <h1 className="home-title">
          Start your <span>adventure</span>
        </h1>
        <p className="home-sub">Set up in seconds, then straight into quests.</p>
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

          {/* ── New / Returning ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(
              [
                { mode: "new" as const, icon: "🌟", label: "New adventurer" },
                { mode: "returning" as const, icon: "⚡", label: "Sign in" },
              ] as const
            ).map(({ mode, icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setAccessMode(mode); setError(""); setRecoveryHint(""); }}
                style={{
                  padding: "18px 12px",
                  borderRadius: 18,
                  border: `2px solid ${accessMode === mode ? "#9b72ff" : "rgba(255,255,255,0.08)"}`,
                  background: accessMode === mode ? "rgba(155,114,255,0.14)" : "rgba(255,255,255,0.03)",
                  color: accessMode === mode ? "#c4a0ff" : "rgba(255,255,255,0.5)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 30 }} aria-hidden="true">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* ── Band selector ── */}
          {(!returningMode || fixSavedBand) && (
            <div>
              <div style={sectionLabel}>
                {returningMode ? "Fix band" : "Choose band"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {launchBands.map((band) => {
                  const profile = getBandProfile(band.code);
                  const isSelected = selectedBand === band.code;
                  return (
                    <button
                      key={band.code}
                      type="button"
                      onClick={() => setSelectedBand(band.code)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 16,
                        border: `2px solid ${isSelected ? "#9b72ff" : "rgba(255,255,255,0.08)"}`,
                        background: isSelected ? "rgba(155,114,255,0.12)" : "rgba(255,255,255,0.03)",
                        color: "#fff",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 6 }} aria-hidden="true">{profile.emoji}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? "#c4a0ff" : "#fff" }}>
                        {profile.title}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginTop: 2 }}>
                        {profile.ageLabel}
                      </div>
                    </button>
                  );
                })}
              </div>
              {returningMode && (
                <button
                  type="button"
                  onClick={() => setFixSavedBand(false)}
                  style={{
                    marginTop: 10,
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: 0,
                  }}
                >
                  ← Keep saved band
                </button>
              )}
            </div>
          )}

          {/* Fix band toggle for returning */}
          {returningMode && !fixSavedBand && (
            <button
              type="button"
              onClick={() => setFixSavedBand(true)}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "inherit",
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
                fontWeight: 600,
              }}
            >
              🛠️ Fix saved band (optional)
            </button>
          )}

          {/* ── Username + Display name ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              autoComplete="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={inputStyle}
            />
            {!returningMode && (
              <input
                name="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name (what we call you)"
                style={inputStyle}
              />
            )}
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

          {/* ── Avatar (new only) ── */}
          {!returningMode && (
            <div>
              <div style={sectionLabel}>Choose your guide</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {avatars.map((avatar) => {
                  const symbol = getAvatarSymbol(avatar.avatar_key);
                  const isSelected = selectedAvatar === avatar.avatar_key;
                  return (
                    <button
                      key={avatar.avatar_key}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.avatar_key)}
                      style={{
                        padding: "14px 8px",
                        borderRadius: 16,
                        border: `2px solid ${isSelected ? "#ffd166" : "rgba(255,255,255,0.08)"}`,
                        background: isSelected ? "rgba(255,209,102,0.12)" : "rgba(255,255,255,0.04)",
                        color: "#fff",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 28 }} aria-hidden="true">{symbol}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isSelected ? "#ffd166" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {avatar.display_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Mode (non-guided bands only) ── */}
          {!guidedOnlyMode && (
            <div>
              <div style={sectionLabel}>Session style</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { id: "guided-quest", label: "Guided Quest", desc: "Automatically picks the right questions for your level." },
                  { id: "self-directed-challenge", label: "Self-Directed", desc: "More control — ask for harder or easier items." },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: `2px solid ${selectedMode === mode.id ? "#9b72ff" : "rgba(255,255,255,0.08)"}`,
                      background: selectedMode === mode.id ? "rgba(155,114,255,0.12)" : "rgba(255,255,255,0.03)",
                      color: "#fff",
                      fontFamily: "inherit",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: selectedMode === mode.id ? "#c4a0ff" : "#fff",
                        marginBottom: 3,
                      }}
                    >
                      {mode.label}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                      {mode.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
            }}
          >
            {submitting
              ? "Starting…"
              : returningMode
                ? "▶ Sign In & Play"
                : "✨ Create & Play"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
