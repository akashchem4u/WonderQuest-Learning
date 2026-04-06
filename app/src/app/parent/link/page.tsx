"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = "#100b2e";
const SURFACE = "#1a1340";
const SURFACE_RAISED = "#221952";
const BORDER = "#2e2260";
const MINT = "#58e8c1";
const VIOLET = "#9b72ff";
const GOLD = "#ffd166";
const CORAL = "#ff7b6b";
const TEXT_PRIMARY = "#e8e0ff";
const TEXT_MUTED = "#7a6aaa";
const TEXT_DIM = "#4a3880";

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Username" },
    { n: 2, label: "PIN" },
    { n: 3, label: "Linked!" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        marginBottom: 36,
      }}
    >
      {steps.map((step, idx) => {
        const isDone = step.n < current;
        const isActive = step.n === current;

        return (
          <div
            key={step.n}
            style={{ display: "flex", alignItems: "center", flex: idx < steps.length - 1 ? 1 : "initial" }}
          >
            {/* Circle */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  border: `2px solid ${isDone ? MINT : isActive ? VIOLET : BORDER}`,
                  background: isDone
                    ? `${MINT}22`
                    : isActive
                    ? `${VIOLET}22`
                    : SURFACE,
                  color: isDone ? MINT : isActive ? VIOLET : TEXT_DIM,
                  transition: "all 0.25s",
                }}
              >
                {isDone ? "✓" : step.n}
              </div>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: isDone ? MINT : isActive ? VIOLET : TEXT_DIM,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 22,
                  marginLeft: 6,
                  marginRight: 6,
                  borderRadius: 1,
                  background: isDone ? MINT : BORDER,
                  transition: "background 0.25s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Flow Card Shell ──────────────────────────────────────────────────────────

function FlowCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        background: SURFACE,
        borderRadius: 20,
        border: `1px solid ${BORDER}`,
        padding: "40px 36px",
        boxShadow: `0 12px 60px rgba(0,0,0,0.5), 0 0 0 1px ${BORDER}`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Shared Input ─────────────────────────────────────────────────────────────

function DarkInput({
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  maxLength,
  inputMode,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      maxLength={maxLength}
      inputMode={inputMode}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "14px 18px",
        background: BASE,
        border: `1.5px solid ${focused ? VIOLET : BORDER}`,
        borderRadius: 12,
        color: TEXT_PRIMARY,
        fontSize: "1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        outline: "none",
        boxShadow: focused ? `0 0 0 3px ${VIOLET}22` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    />
  );
}

// ─── CTA Button ───────────────────────────────────────────────────────────────

function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "15px 24px",
        background: disabled
          ? SURFACE_RAISED
          : `linear-gradient(135deg, ${VIOLET}, #5a30d0)`,
        color: disabled ? TEXT_DIM : "#fff",
        border: "none",
        borderRadius: 12,
        fontSize: "0.95rem",
        fontWeight: 700,
        fontFamily: "system-ui, -apple-system, sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.2s, transform 0.1s",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.target as HTMLButtonElement).style.opacity = "0.88";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}

function BackBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 24px",
        background: "transparent",
        color: TEXT_MUTED,
        border: `1.5px solid ${BORDER}`,
        borderRadius: 12,
        fontSize: "0.88rem",
        fontWeight: 600,
        fontFamily: "system-ui, -apple-system, sans-serif",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.background = SURFACE_RAISED;
        (e.target as HTMLButtonElement).style.color = TEXT_PRIMARY;
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.background = "transparent";
        (e.target as HTMLButtonElement).style.color = TEXT_MUTED;
      }}
    >
      {children}
    </button>
  );
}

// ─── Step 1: Enter Username ───────────────────────────────────────────────────

function Step1({
  username,
  setUsername,
  onNext,
  loading,
  error,
}: {
  username: string;
  setUsername: (v: string) => void;
  onNext: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <FlowCard>
      <StepIndicator current={1} />

      {/* Icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `${VIOLET}22`,
          border: `2px solid ${VIOLET}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          margin: "0 auto 20px",
        }}
      >
        👶
      </div>

      {/* Eyebrow */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: VIOLET,
          marginBottom: 8,
        }}
      >
        Link a child
      </p>

      {/* Title */}
      <h2
        style={{
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: 700,
          color: TEXT_PRIMARY,
          marginBottom: 8,
          lineHeight: 1.25,
        }}
      >
        Enter child username
      </h2>

      {/* Sub-copy */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          lineHeight: 1.6,
          color: TEXT_MUTED,
          marginBottom: 28,
        }}
      >
        Ask your child for the username they created when setting up their
        WonderQuest account.
      </p>

      {/* Input */}
      <div style={{ marginBottom: 8 }}>
        <label
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: TEXT_MUTED,
            marginBottom: 8,
            letterSpacing: "0.04em",
          }}
        >
          Child&apos;s username
        </label>
        <DarkInput
          type="text"
          placeholder="e.g. starlion42"
          value={username}
          onChange={setUsername}
          autoComplete="off"
          maxLength={32}
        />
        {error && (
          <p
            style={{
              fontSize: "0.78rem",
              color: CORAL,
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Hint */}
      <p
        style={{
          fontSize: "0.72rem",
          color: TEXT_DIM,
          marginBottom: 28,
          lineHeight: 1.5,
        }}
      >
        The child account must already exist. Usernames are case-insensitive.
      </p>

      <PrimaryBtn onClick={onNext} disabled={!username.trim() || loading}>
        {loading ? "Looking up…" : "Continue →"}
      </PrimaryBtn>
    </FlowCard>
  );
}

// ─── Step 2: Enter PIN ────────────────────────────────────────────────────────

function Step2({
  childDisplayName,
  pin,
  setPin,
  onNext,
  onBack,
  loading,
  error,
}: {
  childDisplayName: string;
  pin: string;
  setPin: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <FlowCard>
      <StepIndicator current={2} />

      {/* Icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `${GOLD}22`,
          border: `2px solid ${GOLD}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          margin: "0 auto 20px",
        }}
      >
        🔑
      </div>

      {/* Eyebrow */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: GOLD,
          marginBottom: 8,
        }}
      >
        Confirm identity
      </p>

      {/* Title */}
      <h2
        style={{
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: 700,
          color: TEXT_PRIMARY,
          marginBottom: 8,
          lineHeight: 1.25,
        }}
      >
        Enter{" "}
        <span style={{ color: GOLD }}>{childDisplayName || "child"}&apos;s</span>{" "}
        PIN
      </h2>

      {/* Sub-copy */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          lineHeight: 1.6,
          color: TEXT_MUTED,
          marginBottom: 28,
        }}
      >
        Ask your child for their 4-digit PIN. This confirms they&apos;re happy
        to be linked to your account.
      </p>

      {/* PIN input */}
      <div style={{ marginBottom: 8 }}>
        <label
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: TEXT_MUTED,
            marginBottom: 8,
            letterSpacing: "0.04em",
          }}
        >
          4-digit PIN
        </label>
        <DarkInput
          type="password"
          placeholder="••••"
          value={pin}
          onChange={(v) => {
            if (/^\d{0,4}$/.test(v)) setPin(v);
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
        />
        {error && (
          <p
            style={{
              fontSize: "0.78rem",
              color: CORAL,
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Hint */}
      <p
        style={{
          fontSize: "0.72rem",
          color: TEXT_DIM,
          marginBottom: 28,
          lineHeight: 1.5,
        }}
      >
        The PIN was set when the child account was created. Ask your child to
        enter it themselves if needed.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryBtn onClick={onNext} disabled={pin.length !== 4 || loading}>
          {loading ? "Linking…" : "Link account →"}
        </PrimaryBtn>
        <BackBtn onClick={onBack}>← Back</BackBtn>
      </div>
    </FlowCard>
  );
}

// ─── Step 3: Success ──────────────────────────────────────────────────────────

function Step3({ childDisplayName }: { childDisplayName: string }) {
  return (
    <FlowCard>
      <StepIndicator current={3} />

      {/* Celebration icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `${MINT}18`,
          border: `2px solid ${MINT}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.4rem",
          margin: "0 auto 20px",
          boxShadow: `0 0 40px ${MINT}22`,
        }}
      >
        🎉
      </div>

      {/* Eyebrow */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: MINT,
          marginBottom: 8,
        }}
      >
        Account linked
      </p>

      {/* Title */}
      <h2
        style={{
          textAlign: "center",
          fontSize: "1.6rem",
          fontWeight: 700,
          color: TEXT_PRIMARY,
          marginBottom: 8,
          lineHeight: 1.25,
        }}
      >
        {childDisplayName} is connected!
      </h2>

      {/* Sub-copy */}
      <p
        style={{
          textAlign: "center",
          fontSize: "0.88rem",
          lineHeight: 1.6,
          color: TEXT_MUTED,
          marginBottom: 32,
        }}
      >
        You can now track{" "}
        <span style={{ color: TEXT_PRIMARY, fontWeight: 600 }}>
          {childDisplayName}&apos;s
        </span>{" "}
        progress, sessions, and achievements from your Family Hub.
      </p>

      {/* Summary card */}
      <div
        style={{
          background: BASE,
          border: `1px solid ${MINT}33`,
          borderRadius: 14,
          padding: "18px 20px",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `${MINT}22`,
              border: `2px solid ${MINT}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              flexShrink: 0,
            }}
          >
            ✨
          </div>
          <div>
            <p
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: TEXT_PRIMARY,
                marginBottom: 2,
              }}
            >
              {childDisplayName}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: MINT,
                fontWeight: 500,
              }}
            >
              Linked to your Family Hub
            </p>
          </div>
          <div
            style={{
              marginLeft: "auto",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `${MINT}22`,
              border: `1.5px solid ${MINT}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              color: MINT,
            }}
          >
            ✓
          </div>
        </div>
      </div>

      {/* What's next hint */}
      <div
        style={{
          background: `${VIOLET}12`,
          border: `1px solid ${VIOLET}33`,
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontSize: "0.78rem",
            lineHeight: 1.6,
            color: TEXT_MUTED,
            margin: 0,
          }}
        >
          <span style={{ color: VIOLET, fontWeight: 700 }}>What&apos;s next? </span>
          Head to your Family Hub to see {childDisplayName}&apos;s sessions,
          skills, and progress. You can link more children from there too.
        </p>
      </div>

      {/* CTA */}
      <Link href="/parent" style={{ textDecoration: "none" }}>
        <PrimaryBtn>Go to Family Hub →</PrimaryBtn>
      </Link>
    </FlowCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentLinkPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [username, setUsername] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2 state
  const [pin, setPin] = useState("");
  const [step2Loading, setStep2Loading] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Resolved child name after step 1
  const [childDisplayName, setChildDisplayName] = useState("");

  // ── Step 1 → 2: look up username ──────────────────────────────────────────
  async function handleStep1() {
    if (!username.trim()) return;
    setStep1Loading(true);
    setStep1Error(null);

    try {
      const res = await fetch(
        `/api/parent/link/lookup?username=${encodeURIComponent(username.trim())}`,
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setStep1Error(
          (json as { error?: string }).error ??
            "No child account found with that username.",
        );
        return;
      }
      const json = (await res.json()) as { displayName: string };
      setChildDisplayName(json.displayName ?? username.trim());
      setStep(2);
    } catch {
      setStep1Error("Something went wrong. Please try again.");
    } finally {
      setStep1Loading(false);
    }
  }

  // ── Step 2 → 3: verify PIN and link ───────────────────────────────────────
  async function handleStep2() {
    if (pin.length !== 4) return;
    setStep2Loading(true);
    setStep2Error(null);

    try {
      const res = await fetch("/api/parent/link/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setStep2Error(
          (json as { error?: string }).error ??
            "Incorrect PIN. Ask your child to double-check.",
        );
        return;
      }
      setStep(3);
    } catch {
      setStep2Error("Something went wrong. Please try again.");
    } finally {
      setStep2Loading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "48px 24px 80px",
          background: BASE,
        }}
      >
        {/* Page heading */}
        <div style={{ width: "100%", maxWidth: 480, marginBottom: 32 }}>
          <h1
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: TEXT_PRIMARY,
              marginBottom: 4,
              letterSpacing: "0.01em",
            }}
          >
            Link a Child Account
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: TEXT_MUTED,
              lineHeight: 1.5,
            }}
          >
            Connect your child&apos;s existing WonderQuest account to your Family Hub.
          </p>
        </div>

        {/* Steps */}
        {step === 1 && (
          <Step1
            username={username}
            setUsername={setUsername}
            onNext={handleStep1}
            loading={step1Loading}
            error={step1Error}
          />
        )}
        {step === 2 && (
          <Step2
            childDisplayName={childDisplayName}
            pin={pin}
            setPin={setPin}
            onNext={handleStep2}
            onBack={() => {
              setStep(1);
              setPin("");
              setStep2Error(null);
            }}
            loading={step2Loading}
            error={step2Error}
          />
        )}
        {step === 3 && <Step3 childDisplayName={childDisplayName} />}
      </div>
    </AppFrame>
  );
}
