"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Theme ────────────────────────────────────────────────────────────────────

const BASE    = "#100b2e";
const SURFACE = "#161b22";
const VIOLET  = "#9b72ff";
const TEXT    = "#f0f6ff";
const GOLD    = "#ffd166";
const MUTED   = "rgba(240,246,255,0.5)";
const BORDER  = "rgba(255,255,255,0.06)";
const GREEN   = "#50e890";

const LS_KEY = "wonderquest-quiet-hours";

// ─── Types ────────────────────────────────────────────────────────────────────

type DayId = "M" | "T" | "W" | "Th" | "F" | "Sa" | "Su";

type QuietHoursSettings = {
  notifQuietEnabled: boolean;
  notifQuietStart: string; // "HH:MM" 24h
  notifQuietEnd: string;
  playQuietEnabled: boolean;
  playQuietStart: string;
  playQuietEnd: string;
  playQuietDays: DayId[];
  blockDevice: boolean; // block child device during play quiet hours
};

// ─── Stub defaults ────────────────────────────────────────────────────────────

const ALL_DAYS: DayId[] = ["M", "T", "W", "Th", "F", "Sa", "Su"];
const DAY_LABELS: Record<DayId, string> = {
  M: "M", T: "T", W: "W", Th: "T", F: "F", Sa: "S", Su: "S",
};
const DAY_FULL: Record<DayId, string> = {
  M: "Mon", T: "Tue", W: "Wed", Th: "Thu", F: "Fri", Sa: "Sat", Su: "Sun",
};

const DEFAULT_SETTINGS: QuietHoursSettings = {
  notifQuietEnabled: true,
  notifQuietStart: "21:00",
  notifQuietEnd: "07:00",
  playQuietEnabled: false,
  playQuietStart: "20:00",
  playQuietEnd: "07:00",
  playQuietDays: [...ALL_DAYS],
  blockDevice: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function to12h(time24: string): { hours: string; minutes: string; ampm: "AM" | "PM" } {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  return {
    hours: String(h === 0 ? 12 : h > 12 ? h - 12 : h).padStart(2, "0"),
    minutes: mStr,
    ampm: h < 12 ? "AM" : "PM",
  };
}

function to24h(hours: string, minutes: string, ampm: "AM" | "PM"): string {
  let h = parseInt(hours, 10);
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minutes}`;
}

function minutesFromMidnight(time24: string): number {
  const [h, m] = time24.split(":").map(Number);
  return h * 60 + m;
}

// Compute visual timeline: returns [{left%,width%}] for quiet block
function timelineBlock(start: string, end: string) {
  const startMin = minutesFromMidnight(start);
  const endMin   = minutesFromMidnight(end);
  const total    = 24 * 60;
  if (startMin < endMin) {
    return [{ left: (startMin / total) * 100, width: ((endMin - startMin) / total) * 100 }];
  }
  // Overnight
  return [
    { left: (startMin / total) * 100, width: ((total - startMin) / total) * 100 },
    { left: 0,                         width: (endMin / total) * 100              },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? VIOLET : "rgba(255,255,255,0.14)",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 22 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

function TimePicker({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: string;
}) {
  const parsed = to12h(value);
  const [hours, setHours]   = useState(parsed.hours);
  const [minutes, setMins]  = useState(parsed.minutes);
  const [ampm, setAmpm]     = useState<"AM" | "PM">(parsed.ampm);

  function commit(h: string, m: string, a: "AM" | "PM") {
    onChange(to24h(h, m, a));
  }

  function toggleAmPm() {
    const next = ampm === "AM" ? "PM" : "AM";
    setAmpm(next);
    commit(hours, minutes, next);
  }

  function cycleHour(dir: 1 | -1) {
    let h = parseInt(hours, 10) + dir;
    if (h > 12) h = 1;
    if (h < 1) h = 12;
    const s = String(h).padStart(2, "0");
    setHours(s);
    commit(s, minutes, ampm);
  }

  function cycleMinute(dir: 1 | -1) {
    let m = parseInt(minutes, 10) + dir * 5;
    if (m >= 60) m = 0;
    if (m < 0) m = 55;
    const s = String(m).padStart(2, "0");
    setMins(s);
    commit(hours, s, ampm);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 12,
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, flex: 1 }}>
        {icon} {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Hours */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center" }}>
          <button
            onClick={() => cycleHour(1)}
            style={{
              background: "none", border: "none", color: MUTED,
              fontSize: 10, cursor: "pointer", padding: "2px 6px",
            }}
          >
            ▲
          </button>
          <div
            style={{
              fontSize: 16, fontWeight: 800, color: TEXT,
              background: SURFACE, border: `1.5px solid ${BORDER}`,
              borderRadius: 8, padding: "6px 12px", minWidth: 44, textAlign: "center" as const,
            }}
          >
            {hours}
          </div>
          <button
            onClick={() => cycleHour(-1)}
            style={{
              background: "none", border: "none", color: MUTED,
              fontSize: 10, cursor: "pointer", padding: "2px 6px",
            }}
          >
            ▼
          </button>
        </div>

        <span style={{ fontSize: 16, fontWeight: 800, color: MUTED }}>:</span>

        {/* Minutes */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center" }}>
          <button
            onClick={() => cycleMinute(1)}
            style={{
              background: "none", border: "none", color: MUTED,
              fontSize: 10, cursor: "pointer", padding: "2px 6px",
            }}
          >
            ▲
          </button>
          <div
            style={{
              fontSize: 16, fontWeight: 800, color: TEXT,
              background: SURFACE, border: `1.5px solid ${BORDER}`,
              borderRadius: 8, padding: "6px 12px", minWidth: 44, textAlign: "center" as const,
            }}
          >
            {minutes}
          </div>
          <button
            onClick={() => cycleMinute(-1)}
            style={{
              background: "none", border: "none", color: MUTED,
              fontSize: 10, cursor: "pointer", padding: "2px 6px",
            }}
          >
            ▼
          </button>
        </div>

        {/* AM/PM */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
          {(["AM", "PM"] as const).map((a) => (
            <button
              key={a}
              onClick={() => {
                setAmpm(a);
                commit(hours, minutes, a);
              }}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: `1.5px solid ${a === ampm ? VIOLET : BORDER}`,
                background: a === ampm ? VIOLET : "transparent",
                color: a === ampm ? "#fff" : MUTED,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: VIOLET,
        textTransform: "uppercase" as const,
        letterSpacing: "0.07em",
        marginBottom: 10,
        marginTop: 20,
      }}
    >
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentQuietHoursPage() {
  const [s, setS] = useState<QuietHoursSettings>({ ...DEFAULT_SETTINGS });
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount, then sync from server
  useEffect(() => {
    // Load localStorage first as fast default
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setS(JSON.parse(raw) as QuietHoursSettings);
    } catch { /* ignore */ }

    // Then sync from server
    fetch("/api/parent/quiet-hours")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          setS(data.settings as QuietHoursSettings);
          localStorage.setItem(LS_KEY, JSON.stringify(data.settings));
        }
      })
      .catch(() => { /* offline — use local */ });
  }, []);

  function update(patch: Partial<QuietHoursSettings>) {
    setS((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  function toggleDay(day: DayId) {
    const days = s.playQuietDays.includes(day)
      ? s.playQuietDays.filter((d) => d !== day)
      : [...s.playQuietDays, day];
    update({ playQuietDays: days });
  }

  function handleSave() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
    // Sync to server
    fetch("/api/parent/quiet-hours", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: s }),
    }).catch(() => { /* offline — localStorage already saved */ });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const notifBlocks = timelineBlock(s.notifQuietStart, s.notifQuietEnd);

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: BASE,
          padding: "32px 24px 80px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          color: TEXT,
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0, marginBottom: 6 }}>
              🌙 Quiet Hours
            </h1>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
              Control when notifications are sent and when your child can start new sessions
            </p>
          </div>

          {/* ── NOTIFICATION QUIET HOURS ── */}
          <SectionLabel>🔔 Notification Quiet Hours</SectionLabel>

          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "20px 20px 6px",
              marginBottom: 20,
            }}
          >
            {/* Toggle row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                paddingBottom: 14,
                borderBottom: `1px solid ${BORDER}`,
                marginBottom: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
                  Pause notifications at night
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                  No pings to your device during quiet hours
                </div>
              </div>
              <Toggle
                checked={s.notifQuietEnabled}
                onChange={(v) => update({ notifQuietEnabled: v })}
              />
            </div>

            {/* Time pickers */}
            <div
              style={{
                opacity: s.notifQuietEnabled ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: s.notifQuietEnabled ? "auto" : "none",
              }}
            >
              <TimePicker
                icon="🌙"
                label="Quiet from"
                value={s.notifQuietStart}
                onChange={(v) => update({ notifQuietStart: v })}
              />
              <TimePicker
                icon="🌅"
                label="Quiet until"
                value={s.notifQuietEnd}
                onChange={(v) => update({ notifQuietEnd: v })}
              />

              {/* Timeline visualisation */}
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginBottom: 6 }}>
                  Quiet period visualisation
                </div>
                <div
                  style={{
                    height: 20,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 10,
                    overflow: "hidden",
                    position: "relative",
                    marginBottom: 4,
                  }}
                >
                  {notifBlocks.map((block, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: `${block.left}%`,
                        width: `${block.width}%`,
                        height: "100%",
                        background: VIOLET,
                        borderRadius: 4,
                        opacity: 0.5,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    color: MUTED,
                  }}
                >
                  <span>12am</span>
                  <span>6am</span>
                  <span>12pm</span>
                  <span>6pm</span>
                  <span>12am</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SESSION QUIET HOURS ── */}
          <SectionLabel>🎮 Session Quiet Hours (child's device)</SectionLabel>

          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "20px 20px 10px",
              marginBottom: 20,
            }}
          >
            {/* Toggle row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                paddingBottom: 14,
                borderBottom: `1px solid ${BORDER}`,
                marginBottom: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
                  Limit session start times
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                  Your child won't be able to start a new session during these hours
                </div>
              </div>
              <Toggle
                checked={s.playQuietEnabled}
                onChange={(v) => update({ playQuietEnabled: v })}
              />
            </div>

            {s.playQuietEnabled ? (
              <>
                <TimePicker
                  icon="🌙"
                  label="Quiet from"
                  value={s.playQuietStart}
                  onChange={(v) => update({ playQuietStart: v })}
                />
                <TimePicker
                  icon="🌅"
                  label="Quiet until"
                  value={s.playQuietEnd}
                  onChange={(v) => update({ playQuietEnd: v })}
                />

                {/* Day selector */}
                <div style={{ marginTop: 14, marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: MUTED,
                      marginBottom: 8,
                    }}
                  >
                    Apply quiet hours on
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {ALL_DAYS.map((day) => {
                      const active = s.playQuietDays.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          title={DAY_FULL[day]}
                          style={{
                            flex: 1,
                            padding: "8px 0",
                            borderRadius: 8,
                            border: `1.5px solid ${active ? VIOLET : BORDER}`,
                            background: active ? VIOLET : "transparent",
                            color: active ? "#fff" : MUTED,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            textAlign: "center" as const,
                            transition: "all 0.15s",
                          }}
                        >
                          {DAY_LABELS[day]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: 12,
                  color: MUTED,
                  lineHeight: 1.5,
                  fontStyle: "italic",
                  marginBottom: 10,
                }}
              >
                Turn on to set play quiet hours. Sessions in progress when quiet hours begin are
                allowed to finish.
              </div>
            )}

            {/* Block device toggle */}
            {s.playQuietEnabled && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 0",
                  borderTop: `1px solid ${BORDER}`,
                  marginTop: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
                    Block device during quiet hours
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    Your child will see a lock screen instead of the app
                  </div>
                </div>
                <Toggle
                  checked={s.blockDevice}
                  onChange={(v) => update({ blockDevice: v })}
                />
              </div>
            )}

            {/* COPPA info box */}
            <div
              style={{
                background: "rgba(155,114,255,0.08)",
                border: `1px solid rgba(155,114,255,0.2)`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 12,
                color: "#b8a4ff",
                lineHeight: 1.5,
                marginBottom: 6,
              }}
            >
              ℹ️ This only controls WonderQuest session starts — it&#39;s not a device-level lock. Your
              child can still use other apps during quiet hours.
            </div>
          </div>

          {/* ── Preview card ── */}
          {s.playQuietEnabled && (
            <div
              style={{
                background: "rgba(16,11,46,0.95)",
                border: `1.5px solid rgba(155,114,255,0.25)`,
                borderRadius: 16,
                padding: "20px 22px",
                marginBottom: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative stars */}
              <div style={{ position: "absolute", top: 10, right: 16, fontSize: 18, opacity: 0.3 }}>✨</div>
              <div style={{ position: "absolute", top: 30, right: 40, fontSize: 10, opacity: 0.2 }}>★</div>

              <div style={{ fontSize: 11, fontWeight: 700, color: VIOLET, textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 12 }}>
                Preview — What your child sees
              </div>

              {/* Mock lock screen */}
              <div
                style={{
                  background: "linear-gradient(160deg, #0e0b2a 0%, #1a0f3c 100%)",
                  border: `1px solid rgba(155,114,255,0.15)`,
                  borderRadius: 12,
                  padding: "24px 16px",
                  textAlign: "center" as const,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>🌙</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 6 }}>
                  Rest time!
                </div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                  WonderQuest is taking a break right now.
                  <br />Come back in the morning!
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(155,114,255,0.15)",
                    border: `1px solid rgba(155,114,255,0.2)`,
                    borderRadius: 20,
                    padding: "5px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: VIOLET,
                  }}
                >
                  Quiet hours: {to12h(s.playQuietStart).hours}:{to12h(s.playQuietStart).minutes} {to12h(s.playQuietStart).ampm} – {to12h(s.playQuietEnd).hours}:{to12h(s.playQuietEnd).minutes} {to12h(s.playQuietEnd).ampm}
                </div>
              </div>
            </div>
          )}

          {/* ── Save button ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
            <button
              onClick={handleSave}
              style={{
                width: "100%",
                maxWidth: 320,
                padding: 14,
                background: VIOLET,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              Save quiet hours
            </button>
            {saved && (
              <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>✓ Saved!</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>
            Settings sync across all your devices.
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
