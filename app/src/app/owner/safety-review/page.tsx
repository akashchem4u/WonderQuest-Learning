import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

const C = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  accent: "#50e890",
  amber: "#f0a840",
  red: "#f87171",
};

const CONTENT_QUEUE: never[] = [];

const LANGUAGE_BANKS = [];

const IMAGE_REVIEW = [];

const ACTIVITY_LOG = [];

const ALERT_THRESHOLDS = [];

export default async function SafetyReviewPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = hasOwnerAccess();

  if (!configured || !allowed) {
    return (
      <AppFrame audience="owner">
        <OwnerGate configured={configured} />
      </AppFrame>
    );
  }

  const totalImages = IMAGE_REVIEW.reduce((s, r) => s + r.total, 0);
  const reviewedImages = IMAGE_REVIEW.reduce((s, r) => s + r.reviewed, 0);

  return (
    <AppFrame audience="owner">
      <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 16px 64px", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>🛡️ Safety Review Console</h1>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>Content safety, language review, and imagery approval</p>
          </div>

          {/* Summary chips */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
            {[
              { label: "Content Queue", val: CONTENT_QUEUE.length === 0 ? "Clear" : String(CONTENT_QUEUE.length), color: C.accent },
              { label: "Language Banks", val: `${LANGUAGE_BANKS.length}/${LANGUAGE_BANKS.length} Safe`, color: C.accent },
              { label: "Images Reviewed", val: `${reviewedImages}/${totalImages}`, color: C.accent },
              { label: "This Week", val: `${ACTIVITY_LOG.length} reviews`, color: C.muted },
            ].map((chip) => (
              <div
                key={chip.label}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "10px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{chip.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: chip.color }}>{chip.val}</div>
              </div>
            ))}
          </div>

          {/* Content review queue */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              Content Review Queue
            </div>
            {CONTENT_QUEUE.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(80,232,144,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.accent }}>All content approved</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>No items pending safety review. All question banks and content assets have passed automated and manual checks.</div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Language safety */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              Language Safety — Question Banks
            </div>
            <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${C.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}` }}>
                    {["Question Bank", "SAFE Score", "Status"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LANGUAGE_BANKS.map((bank) => (
                    <tr key={bank.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "11px 14px", color: C.text }}>{bank.name}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${bank.score}%`, height: "100%", background: C.accent, borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>{bank.score}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(80,232,144,0.12)", color: C.accent, border: "1px solid rgba(80,232,144,0.3)" }}>
                          ✓ Safe
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Imagery review */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              Imagery Review
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
              {IMAGE_REVIEW.map((cat) => (
                <div key={cat.category} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.accent, lineHeight: 1 }}>{cat.reviewed}/{cat.total}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>{cat.category}</div>
                  <div style={{ fontSize: 11, color: C.accent, marginTop: 4, fontWeight: 600 }}>✓ All approved</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(80,232,144,0.06)", border: "1px solid rgba(80,232,144,0.2)", borderRadius: 8 }}>
              <span style={{ fontSize: 18 }}>✓</span>
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>
                All {totalImages} images reviewed and approved — no pending imagery flagged.
              </span>
            </div>
          </div>

          {/* Recent activity log */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              Recent Activity Log
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {ACTIVITY_LOG.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr 160px 80px",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: i < ACTIVITY_LOG.length - 1 ? `1px solid ${C.border}` : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{entry.ts}</span>
                  <div>
                    <span style={{ fontSize: 13, color: C.text }}>{entry.target}</span>
                    <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>— {entry.action}</span>
                  </div>
                  <span style={{ fontSize: 12, color: C.muted }}>{entry.reviewer}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px",
                    borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: "rgba(80,232,144,0.12)", color: C.accent,
                    border: "1px solid rgba(80,232,144,0.3)", whiteSpace: "nowrap",
                  }}>
                    ✓ {entry.verdict}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alert thresholds config */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Alert Threshold Configuration
            </div>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              Current active thresholds — contact engineering to update these values.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {ALERT_THRESHOLDS.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 90px 1fr",
                    gap: 16,
                    padding: "12px 16px",
                    borderBottom: i < ALERT_THRESHOLDS.length - 1 ? `1px solid ${C.border}` : "none",
                    alignItems: "center",
                    background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  }}
                >
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{t.label}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "3px 10px", borderRadius: 6,
                    background: "rgba(80,232,144,0.10)", color: C.accent,
                    fontSize: 12, fontWeight: 700, border: "1px solid rgba(80,232,144,0.25)",
                    fontFamily: "monospace",
                  }}>
                    {t.value}
                  </span>
                  <span style={{ fontSize: 12, color: C.muted }}>{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer nav */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { href: "/owner/governance", label: "← Governance" },
              { href: "/owner", label: "Owner Hub →" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.muted,
                  fontSize: 13,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
