"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117",
  surface: "#161b22",
  surfaceHover: "#1c2330",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  coral: "#ff7b6b",
  amber: "#f59e0b",
  red: "#ef4444",
  redMuted: "rgba(239,68,68,0.15)",
  redBorder: "rgba(239,68,68,0.35)",
};

type Experiment = {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  trafficPercent: number;
  killSwitchAt: string | null;
  updatedAt: string | null;
};

function statusInfo(exp: Experiment): { label: string; color: string; bg: string; border: string } {
  if (exp.killSwitchAt) {
    return { label: "Killed", color: C.coral, bg: "rgba(255,123,107,0.12)", border: "rgba(255,123,107,0.3)" };
  }
  if (!exp.enabled) {
    return { label: "Paused", color: C.muted, bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" };
  }
  if (exp.trafficPercent < 100) {
    return { label: `${exp.trafficPercent}% Live`, color: C.gold, bg: "rgba(255,209,102,0.12)", border: "rgba(255,209,102,0.3)" };
  }
  return { label: "Live", color: C.mint, bg: "rgba(80,232,144,0.12)", border: "rgba(80,232,144,0.3)" };
}

function fmt(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function Toggle({ on, disabled, onChange }: { on: boolean; disabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 36, height: 20, borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: on ? "rgba(80,232,144,0.25)" : "rgba(255,255,255,0.1)",
        outline: `1px solid ${on ? "rgba(80,232,144,0.4)" : "rgba(255,255,255,0.15)"}`,
        position: "relative", flexShrink: 0, transition: "background 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
      title={on ? "Disable experiment" : "Enable experiment"}
    >
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        background: on ? C.mint : "rgba(255,255,255,0.35)",
        position: "absolute", top: 3, left: on ? 19 : 3,
        transition: "left 0.15s, background 0.15s",
      }} />
    </button>
  );
}

function ExperimentCard({
  exp,
  onToggle,
  onTraffic,
  onKill,
  onReset,
  loading,
}: {
  exp: Experiment;
  onToggle: () => void;
  onTraffic: (v: number) => void;
  onKill: () => void;
  onReset: () => void;
  loading: boolean;
}) {
  const status = statusInfo(exp);
  const isKilled = Boolean(exp.killSwitchAt);

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${isKilled ? C.redBorder : C.border}`,
      borderRadius: 12,
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      opacity: loading ? 0.7 : 1,
      transition: "opacity 0.15s",
    }}>
      {/* Toggle */}
      <Toggle on={exp.enabled && !isKilled} disabled={loading || isKilled} onChange={onToggle} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{exp.name}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
            color: status.color, background: status.bg,
            border: `1px solid ${status.border}`,
            borderRadius: 5, padding: "1px 6px",
          }}>{status.label}</span>
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{exp.description}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "rgba(155,114,255,0.55)", fontFamily: "monospace" }}>{exp.key}</span>
          {isKilled && (
            <span style={{ fontSize: 10, color: C.coral }}>killed {fmt(exp.killSwitchAt)}</span>
          )}
          {exp.updatedAt && !isKilled && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>updated {fmt(exp.updatedAt)}</span>
          )}
          <button
            onClick={onReset}
            disabled={loading}
            style={{
              fontSize: 10, color: "rgba(155,114,255,0.5)", background: "none",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              padding: 0, textDecoration: "underline", textDecorationColor: "rgba(155,114,255,0.25)",
            }}
          >reset</button>
        </div>
      </div>

      {/* Traffic slider */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0, width: 80 }}>
        <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Traffic</div>
        <input
          type="range" min={0} max={100} step={5}
          value={exp.trafficPercent}
          disabled={loading || isKilled}
          onChange={(e) => onTraffic(Number(e.target.value))}
          style={{ width: "100%", accentColor: C.violet, cursor: isKilled ? "not-allowed" : "pointer" }}
        />
        <div style={{ fontSize: 11, fontWeight: 700, color: isKilled ? C.muted : C.violet }}>
          {exp.trafficPercent}%
        </div>
      </div>

      {/* Kill switch */}
      {!isKilled ? (
        <button
          onClick={onKill}
          disabled={loading}
          style={{
            flexShrink: 0,
            fontSize: 11, fontWeight: 700,
            color: C.coral, background: C.redMuted,
            border: `1px solid ${C.redBorder}`,
            borderRadius: 7, padding: "5px 10px",
            cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
          }}
          title="Immediately disable this experiment and record timestamp"
        >
          Kill
        </button>
      ) : (
        <div style={{
          flexShrink: 0, fontSize: 10, color: C.coral,
          fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
        }}>KILLED</div>
      )}
    </div>
  );
}

export default function OwnerExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiments = useCallback(async () => {
    try {
      const r = await fetch("/api/owner/experiments");
      if (!r.ok) throw new Error("Failed to load experiments");
      const data: { experiments: Experiment[] } = await r.json();
      setExperiments(data.experiments);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading experiments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExperiments(); }, [fetchExperiments]);

  const patch = useCallback(async (key: string, payload: Record<string, unknown>) => {
    setSaving(key);
    setError(null);
    try {
      const r = await fetch("/api/owner/experiments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, ...payload }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Failed to save");
      }
      await fetchExperiments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }, [fetchExperiments]);

  const liveCount = experiments.filter((e) => e.enabled && !e.killSwitchAt).length;
  const killedCount = experiments.filter((e) => Boolean(e.killSwitchAt)).length;
  const pausedCount = experiments.filter((e) => !e.enabled && !e.killSwitchAt).length;

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{
        minHeight: "100vh", background: C.bg,
        padding: "28px 28px 60px",
        fontFamily: "system-ui,-apple-system,sans-serif",
        color: C.text,
      }}>
        <div style={{ marginBottom: 14 }}>
          <Link href="/owner" style={{ fontSize: 12, color: "rgba(155,114,255,0.7)", textDecoration: "none", fontWeight: 600 }}>
            ← Owner
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Experiment Guardrails</h1>
          <button
            onClick={fetchExperiments}
            style={{
              fontSize: 11, color: C.violet, background: "none", border: "none",
              cursor: "pointer", padding: 0, fontWeight: 600,
            }}
          >↻ Refresh</button>
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 18px" }}>
          Kill switches and traffic controls for runtime feature flags
        </p>

        {/* Summary row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {[
            { val: experiments.length, lbl: "Total", color: C.violet },
            { val: liveCount, lbl: "Live", color: C.mint },
            { val: pausedCount, lbl: "Paused", color: C.gold },
            { val: killedCount, lbl: "Killed", color: C.coral },
          ].map(({ val, lbl, color }) => (
            <div key={lbl} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "10px 16px", flex: "1 1 70px",
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: C.redMuted, border: `1px solid ${C.redBorder}`,
            borderRadius: 8, padding: "8px 14px", marginBottom: 14,
            fontSize: 12, color: C.coral,
          }}>
            {error}
          </div>
        )}

        {/* Experiment cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 13 }}>
            Loading experiments…
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {experiments.map((exp) => (
              <ExperimentCard
                key={exp.key}
                exp={exp}
                loading={saving === exp.key}
                onToggle={() => patch(exp.key, { enabled: !exp.enabled, trafficPercent: exp.trafficPercent })}
                onTraffic={(v) => patch(exp.key, { enabled: exp.enabled, trafficPercent: v })}
                onKill={() => {
                  if (confirm(`Kill "${exp.name}"? This will immediately disable it.`)) {
                    patch(exp.key, { killSwitch: true });
                  }
                }}
                onReset={async () => {
                  // Delete override row to reset to defaults
                  setSaving(exp.key);
                  setError(null);
                  try {
                    // Use PATCH with default values to effectively reset
                    const r = await fetch("/api/owner/experiments", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ key: exp.key, enabled: true, trafficPercent: 100, killSwitch: false }),
                    });
                    // For a true reset, just set enabled=true, traffic=100, no kill switch
                    // The API handles this via the upsert
                    if (!r.ok) {
                      const d = await r.json().catch(() => ({})) as { error?: string };
                      throw new Error(d.error ?? "Reset failed");
                    }
                    await fetchExperiments();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Reset failed");
                  } finally {
                    setSaving(null);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Note */}
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 20 }}>
          Changes apply on next request. Kill switch timestamps are permanent until manually reset.
        </p>
      </div>
    </AppFrame>
  );
}
