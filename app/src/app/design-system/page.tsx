import fs from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

type FileEntry = { name: string; href: string; source: "ui" | "parallel" };

function getFiles(source: "ui" | "parallel"): FileEntry[] {
  const dir = path.join(process.cwd(), "public", "design-system", source);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".html"))
      .sort()
      .map((name) => ({
        name: name.replace(".html", ""),
        href: `/design-system/${source}/${name}`,
        source,
      }));
  } catch {
    return [];
  }
}

function categoryFromName(name: string): string {
  if (name.startsWith("child-")) return "Child";
  if (name.startsWith("parent-")) return "Parent";
  if (name.startsWith("teacher-")) return "Teacher";
  if (name.startsWith("owner-")) return "Owner";
  if (name.startsWith("play-")) return "Play";
  if (name.startsWith("beta-")) return "Beta";
  if (name.startsWith("content-")) return "Content";
  if (name.startsWith("system-")) return "System";
  if (name.startsWith("voice-")) return "Voice";
  if (name.startsWith("theme-")) return "Theme";
  if (name.startsWith("personalized-") || name.startsWith("learner-") || name.startsWith("adaptive-") || name.startsWith("favorite-") || name.startsWith("dislikes-")) return "Personalization";
  if (name.startsWith("benchmark-") || name.startsWith("comparison-") || name.startsWith("growth-")) return "Analytics";
  if (name.startsWith("adult-") || name.startsWith("audience-")) return "Shared";
  return "Other";
}

const CATEGORY_ORDER = ["Child", "Parent", "Teacher", "Owner", "Play", "Voice", "Theme", "Personalization", "Content", "Beta", "Analytics", "System", "Shared", "Other"];
const CATEGORY_COLORS: Record<string, string> = {
  Child: "#50e890",
  Parent: "#a78bfa",
  Teacher: "#38bdf8",
  Owner: "#f59e0b",
  Play: "#58e8c1",
  Voice: "#9b72ff",
  Theme: "#ffd166",
  Personalization: "#fb923c",
  Content: "#ff7b6b",
  Beta: "#34d399",
  Analytics: "#60a5fa",
  System: "#8b949e",
  Shared: "#c084fc",
  Other: "#6b7280",
};

export default async function DesignSystemPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sourceFilter = params.source ?? "all";
  const categoryFilter = params.category ?? "all";
  const query = (params.q ?? "").toLowerCase();

  const uiFiles = getFiles("ui");
  const parallelFiles = getFiles("parallel");

  let allFiles: FileEntry[] =
    sourceFilter === "ui"
      ? uiFiles
      : sourceFilter === "parallel"
      ? parallelFiles
      : [...uiFiles, ...parallelFiles];

  if (categoryFilter !== "all") {
    allFiles = allFiles.filter((f) => categoryFromName(f.name) === categoryFilter);
  }
  if (query) {
    allFiles = allFiles.filter((f) => f.name.includes(query));
  }

  // Group by category
  const grouped: Record<string, FileEntry[]> = {};
  for (const f of allFiles) {
    const cat = categoryFromName(f.name);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(f);
  }

  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length > 0);

  return (
    <main style={{ background: "#0d1117", minHeight: "100vh", color: "#f0f6ff", fontFamily: "'Inter', sans-serif", padding: "0" }}>
      {/* Header */}
      <header style={{ background: "#161b22", borderBottom: "1px solid rgba(255,255,255,.08)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ color: "#50e890", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>WonderQuest</Link>
          <span style={{ color: "#8b949e", fontSize: "13px" }}>/</span>
          <span style={{ color: "#f0f6ff", fontWeight: 600, fontSize: "15px" }}>Design System</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ background: "rgba(80,232,144,.15)", color: "#50e890", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
            {allFiles.length} / {uiFiles.length + parallelFiles.length} files
          </span>
          <span style={{ background: "rgba(56,189,248,.15)", color: "#38bdf8", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
            {uiFiles.length} UI
          </span>
          <span style={{ background: "rgba(155,114,255,.15)", color: "#9b72ff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
            {parallelFiles.length} Parallel
          </span>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {/* Search + Filters */}
        <form method="GET" style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search components..."
            style={{ flex: "1", minWidth: "200px", background: "#161b22", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px", padding: "10px 14px", color: "#f0f6ff", fontSize: "14px", outline: "none" }}
          />
          <select name="source" defaultValue={sourceFilter} style={{ background: "#161b22", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px", padding: "10px 14px", color: "#f0f6ff", fontSize: "14px", cursor: "pointer" }}>
            <option value="all">All sources</option>
            <option value="ui">UI Agent (v1)</option>
            <option value="parallel">Parallel Agent (v2)</option>
          </select>
          <select name="category" defaultValue={categoryFilter} style={{ background: "#161b22", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px", padding: "10px 14px", color: "#f0f6ff", fontSize: "14px", cursor: "pointer" }}>
            <option value="all">All categories</option>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" style={{ background: "#50e890", color: "#0d1117", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 700, fontSize: "14px", cursor: "pointer", minHeight: "44px" }}>
            Search
          </button>
          {(query || categoryFilter !== "all" || sourceFilter !== "all") && (
            <Link href="/design-system" style={{ background: "rgba(255,255,255,.06)", color: "#8b949e", border: "1px solid rgba(255,255,255,.08)", borderRadius: "8px", padding: "10px 16px", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center" }}>
              Clear
            </Link>
          )}
        </form>

        {/* Category quick-nav */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/design-system?category=${cat}${sourceFilter !== "all" ? `&source=${sourceFilter}` : ""}`}
              style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, textDecoration: "none", background: `${CATEGORY_COLORS[cat]}22`, color: CATEGORY_COLORS[cat], border: `1px solid ${CATEGORY_COLORS[cat]}44` }}
            >
              {cat} ({grouped[cat]?.length ?? 0})
            </Link>
          ))}
        </div>

        {allFiles.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", color: "#8b949e" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>No components found</div>
            <div style={{ fontSize: "14px" }}>Try a different search or filter</div>
          </div>
        )}

        {/* Component grid by category */}
        {categories.map((cat) => (
          <section key={cat} style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: CATEGORY_COLORS[cat] }}>{cat}</h2>
              <span style={{ fontSize: "12px", color: "#8b949e" }}>{grouped[cat].length} components</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,.06)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
              {grouped[cat].map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#161b22", border: "1px solid rgba(255,255,255,.06)", borderRadius: "8px", padding: "14px", textDecoration: "none", transition: "border-color .15s", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = CATEGORY_COLORS[cat] + "66")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.06)")}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#f0f6ff", lineHeight: 1.4, wordBreak: "break-word" }}>
                    {f.name.replace(/-v[23]$/, "").replace(/-/g, " ")}
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", background: `${CATEGORY_COLORS[cat]}22`, color: CATEGORY_COLORS[cat] }}>
                      {cat}
                    </span>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: f.source === "ui" ? "rgba(56,189,248,.12)" : "rgba(155,114,255,.12)", color: f.source === "ui" ? "#38bdf8" : "#9b72ff", fontWeight: 600 }}>
                      {f.source === "ui" ? "UI" : "v2"}
                    </span>
                    {f.name.endsWith("-v3") && (
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: "rgba(80,232,144,.12)", color: "#50e890", fontWeight: 600 }}>v3</span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8b949e", fontFamily: "monospace" }}>{f.name}.html</div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
