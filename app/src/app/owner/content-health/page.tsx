"use client";

import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
};

const BANDS = [
  { band: "Pre-K", skills: 18, coverage: 94, quality: 88, gaps: 1 },
  { band: "K-1", skills: 34, coverage: 91, quality: 92, gaps: 3 },
  { band: "G2-3", skills: 42, coverage: 86, quality: 89, gaps: 6 },
  { band: "G4-5", skills: 38, coverage: 79, quality: 84, gaps: 8 },
];

const ISSUES = [
  { skill: "Fractions: Division", band: "G4-5", type: "Coverage gap", severity: "high" },
  { skill: "Phonics: Blends", band: "K-1", type: "Audio missing", severity: "medium" },
  { skill: "Geometry: Area", band: "G4-5", type: "Difficulty spike", severity: "medium" },
  { skill: "Counting: 20-100", band: "Pre-K", type: "Outdated script", severity: "low" },
];

function severityColor(s: string) {
  if (s === "high") return C.red;
  if (s === "medium") return C.amber;
  return C.muted;
}

export default function ContentHealthPage() {
  return (
    <AppFrame audience="owner" currentPath="/owner/content-health">
      <OwnerGate configured={true} />
      <div style={{ minHeight: "100vh", background: C.base, color: C.text, fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Content Health</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Coverage, quality, and gap analysis across all skill bands</div>
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>Last updated: 5 min ago</div>
        </div>

        {/* Summary KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: "24px 32px 0" }}>
          {[
            { label: "Total Skills", value: "132", color: C.text },
            { label: "Avg Coverage", value: "87%", color: C.mint },
            { label: "Avg Quality", value: "88%", color: C.blue },
            { label: "Open Gaps", value: "18", color: C.amber },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Band breakdown */}
        <div style={{ padding: "24px 32px 0" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted }}>Band Coverage &amp; Quality</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Band", "Skills", "Coverage", "Quality Score", "Gaps"].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 10, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BANDS.map((b) => (
                  <tr key={b.band} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, color: C.text }}>{b.band}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: C.muted }}>{b.skills}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${b.coverage}%`, height: "100%", background: b.coverage >= 90 ? C.mint : b.coverage >= 80 ? C.amber : C.red, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: b.coverage >= 90 ? C.mint : b.coverage >= 80 ? C.amber : C.red }}>{b.coverage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${b.quality}%`, height: "100%", background: C.blue, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{b.quality}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, color: b.gaps > 5 ? C.amber : C.muted }}>{b.gaps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open issues */}
        <div style={{ padding: "20px 32px 0" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted }}>Open Issues</span>
            </div>
            {ISSUES.map((issue, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < ISSUES.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: severityColor(issue.severity), flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text }}>{issue.skill}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(155,114,255,0.15)", color: C.violet }}>{issue.band}</span>
                <span style={{ fontSize: 12, color: C.muted }}>{issue.type}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: `${severityColor(issue.severity)}22`, color: severityColor(issue.severity), border: `1px solid ${severityColor(issue.severity)}44` }}>{issue.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
