import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  mint: "#58e8c1",
  violet: "#9b72ff",
  gold: "#ffd166",
  coral: "#ff7b6b",
  blue: "#60a5fa",
  amber: "#f59e0b",
  surface: "#161b22",
  surface2: "#0d1117",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  faint: "rgba(255,255,255,0.07)",
} as const;

// ── Roadmap data ───────────────────────────────────────────────────────────
type Tag = { label: string; color: string; bg: string };
type Card = {
  title: string;
  tags: Tag[];
  effort: string;
  source: string;
  evidence: number; // 0–1
  evidenceColor: string;
  dim?: boolean;
};
type Column = { id: string; label: string; color: string; cards: Card[] };

const TAGS: Record<string, Tag> = {
  teacher:  { label: "Teacher",  color: C.blue,   bg: "rgba(37,99,235,0.15)" },
  parent:   { label: "Parent",   color: C.violet, bg: "rgba(155,114,255,0.12)" },
  child:    { label: "Child",    color: C.gold,   bg: "rgba(255,209,102,0.1)" },
  owner:    { label: "Owner",    color: C.mint,   bg: "rgba(80,232,144,0.1)" },
  infra:    { label: "Infra",    color: C.amber,  bg: "rgba(245,158,11,0.1)" },
  content:  { label: "Content",  color: C.mint,   bg: "rgba(88,232,193,0.1)" },
  admin:    { label: "Admin",    color: C.blue,   bg: "rgba(37,99,235,0.15)" },
};

const COLUMNS: Column[] = [
  {
    id: "now", label: "Now", color: C.mint,
    cards: [
      { title: "Bulk assignment tool for teachers", tags: [TAGS.teacher, TAGS.infra], effort: "M", source: "23 feedback requests", evidence: 0.92, evidenceColor: C.mint },
      { title: "Parent weekly report PDF export", tags: [TAGS.parent], effort: "S", source: "17 requests", evidence: 0.68, evidenceColor: C.mint },
      { title: "P3 G4–5 content expansion (+40 skills)", tags: [TAGS.child, TAGS.content], effort: "L", source: "Internal: retention data", evidence: 0.80, evidenceColor: "#58e8c1" },
      { title: "Class-level assignment analytics for teachers", tags: [TAGS.teacher], effort: "M", source: "11 requests", evidence: 0.44, evidenceColor: C.mint },
    ],
  },
  {
    id: "next", label: "Next", color: "#58e8c1",
    cards: [
      { title: "Calendar integration (parent-teacher scheduling)", tags: [TAGS.parent, TAGS.teacher], effort: "M", source: "19 requests", evidence: 0.76, evidenceColor: "#58e8c1" },
      { title: "District-level admin dashboard", tags: [TAGS.owner, TAGS.admin], effort: "L", source: "4 district prospects", evidence: 0.40, evidenceColor: C.mint },
      { title: "Adaptive engine difficulty personalisation V2", tags: [TAGS.child, TAGS.infra], effort: "XL", source: "Retention metric gap", evidence: 0.60, evidenceColor: C.violet },
      { title: "Push notification for parent inactivity alerts", tags: [TAGS.parent], effort: "S", source: "8 requests", evidence: 0.32, evidenceColor: C.violet },
      { title: "Content error self-service for curriculum team", tags: [TAGS.content], effort: "M", source: "Internal ops", evidence: 0.50, evidenceColor: "#58e8c1" },
    ],
  },
  {
    id: "later", label: "Later", color: C.muted,
    cards: [
      { title: "Interactive achievement showcase for students", tags: [TAGS.child], effort: "M", source: "6 requests", evidence: 0.24, evidenceColor: C.violet },
      { title: "Teacher-to-teacher resource sharing", tags: [TAGS.teacher], effort: "L", source: "4 requests", evidence: 0.16, evidenceColor: C.violet },
      { title: "Offline mode for tablets (schools with poor WiFi)", tags: [TAGS.child, TAGS.infra], effort: "XL", source: "3 school requests", evidence: 0.12, evidenceColor: C.violet },
      { title: "Multi-language content (Spanish pilot)", tags: [TAGS.content, TAGS.child], effort: "XL", source: "Market research", evidence: 0.20, evidenceColor: C.violet },
      { title: "API for SIS integration (Clever/ClassLink)", tags: [TAGS.infra, TAGS.admin], effort: "L", source: "5 district asks", evidence: 0.20, evidenceColor: C.violet },
      { title: "Subscription gifting / family referral program", tags: [TAGS.parent], effort: "S", source: "Growth strategy", evidence: 0.10, evidenceColor: C.violet },
    ],
  },
  {
    id: "wont", label: "Won't Build", color: "rgba(255,255,255,0.2)",
    cards: [
      { title: "Built-in video calling (teacher-parent)", tags: [TAGS.teacher, TAGS.parent], effort: "XL", source: "COPPA/FERPA complexity", evidence: 0, evidenceColor: C.muted, dim: true },
      { title: "Social leaderboards (student vs student)", tags: [TAGS.child], effort: "M", source: "Not aligned with mission", evidence: 0, evidenceColor: C.muted, dim: true },
      { title: "In-app purchases for cosmetic items", tags: [TAGS.child], effort: "M", source: "COPPA: under-13 purchases", evidence: 0, evidenceColor: C.muted, dim: true },
    ],
  },
];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export default async function OwnerRoadmapPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px 60px" }}>
        {!allowed ? (
          <OwnerGate configured={configured} />
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 4 }}>Owner</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>🗺 Roadmap</h1>
              </div>
              {/* Quarter selector */}
              <div style={{ display: "flex", gap: 6 }}>
                {QUARTERS.map((q) => (
                  <div
                    key={q}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: 700,
                      background: q === "Q2" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                      color: q === "Q2" ? C.text : "rgba(255,255,255,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    {q}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.mint, cursor: "pointer" }}>+ Add Item</div>
            </div>

            {/* Kanban board */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {COLUMNS.map((col) => (
                <div
                  key={col.id}
                  style={{ background: C.surface, borderRadius: 10, minHeight: 400, border: `1px solid ${C.border}` }}
                >
                  {/* Column header */}
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: col.color }}>
                      {col.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.07)", padding: "1px 7px", borderRadius: 10 }}>
                      {col.cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ padding: 10 }}>
                    {col.cards.map((card, i) => (
                      <div
                        key={i}
                        style={{
                          background: C.surface2,
                          borderRadius: 8,
                          padding: "10px 12px",
                          marginBottom: 7,
                          border: `1px solid ${col.id === "now" ? "rgba(80,232,144,0.2)" : col.id === "next" ? "rgba(88,232,193,0.15)" : C.border}`,
                          cursor: "grab",
                          opacity: card.dim ? 0.6 : 1,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{card.title}</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 5 }}>
                          {card.tags.map((tag, j) => (
                            <span key={j} style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: tag.bg, color: tag.color }}>
                              {tag.label}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: 3 }}>
                            {card.effort}
                          </span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{card.source}</span>
                        </div>
                        {card.evidence > 0 && (
                          <div style={{ height: 2, borderRadius: 1, marginTop: 5, background: "rgba(255,255,255,0.06)" }}>
                            <div style={{ height: 2, borderRadius: 1, width: `${card.evidence * 100}%`, background: card.evidenceColor }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer nav */}
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { href: "/owner", label: "← Dashboard" },
                { href: "/owner/triage/1", label: "Triage" },
                { href: "/owner/content", label: "Content" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
