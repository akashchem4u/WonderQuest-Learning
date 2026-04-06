import Link from "next/link";
import type { ReactNode } from "react";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { href: "/", label: "Launchpad", icon: "🏠" },
  { href: "/child", label: "Child", icon: "👶" },
  { href: "/parent", label: "Family", icon: "👨‍👩‍👧" },
  { href: "/teacher", label: "Classroom", icon: "🎓" },
  { href: "/owner", label: "Ops", icon: "🔑" },
];

// ─── Audience meta ────────────────────────────────────────────────────────────

const audienceMeta = {
  home: {
    label: "WonderQuest Learning",
    shortLabel: "Home",
    title: "Learning that meets every child where they are.",
    topLinks: [
      { href: "/parent", label: "For families" },
      { href: "/teacher", label: "For teachers" },
      { href: "/owner", label: "Platform ops" },
    ],
  },
  kid: {
    label: "WonderQuest",
    shortLabel: "Play",
    title: "Your learning adventure starts here.",
    topLinks: [
      { href: "/parent", label: "For families" },
      { href: "/teacher", label: "For teachers" },
    ],
  },
  parent: {
    label: "Family Hub",
    shortLabel: "Family",
    title: "Family Hub",
  },
  teacher: {
    label: "Classroom",
    shortLabel: "Classroom",
    title: "Classroom",
  },
  owner: {
    label: "Ops Console",
    shortLabel: "Ops",
    title: "Ops Console",
  },
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

type AppFrameProps = {
  children: ReactNode;
  currentPath?: string;
  audience?: keyof typeof audienceMeta;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AppFrame({
  children,
  currentPath,
  audience = "home",
}: AppFrameProps) {
  const meta = audienceMeta[audience];
  const isAdultShell =
    audience === "parent" || audience === "teacher" || audience === "owner";

  // ── Adult shell (teacher / parent / owner) ──────────────────────────────────
  if (isAdultShell) {
    return (
      <div className={`adult-shell theme-${audience}`}>
        {/* Sidebar */}
        <aside className="adult-sidebar">
          {/* Brand */}
          <div className="adult-sidebar-brand">
            <Link className="adult-brand-mark" href="/">
              Wonder<span>Quest</span>
            </Link>
            <p>{meta.label}</p>
          </div>

          {/* Nav */}
          <nav aria-label="Primary" className="adult-sidebar-nav">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`adult-nav-link ${isActive ? "is-active" : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  <span className="adult-nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <div className="adult-main">
          <header className="adult-topbar">
            <strong className="adult-topbar-title">{meta.title}</strong>
            <div className="adult-topbar-actions">
              <DisplayModeToggle />
            </div>
          </header>

          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="adult-mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`adult-mobile-nav-item${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="adult-mobile-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  // ── Light shell (home / kid) — matches home page topbar style ───────────────
  const topLinks = "topLinks" in meta ? meta.topLinks : [];

  return (
    <div className={`app-frame theme-${audience}`}>
      <div className="app-backdrop" aria-hidden="true" />

      <header className="home-topbar" style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(8,6,28,0.8)", marginBottom: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link className="home-logo" href="/">
          Wonder<span>Quest</span>
        </Link>

        {topLinks.length > 0 && (
          <nav className="home-topbar-links" aria-label="Primary">
            {topLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={currentPath === link.href ? "page" : undefined}
                style={currentPath === link.href ? { color: "#fff" } : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="home-topbar-actions">
          <DisplayModeToggle />
          <Link className="home-start-btn" href="/child">
            Start learning
          </Link>
        </div>
      </header>

      {children}
    </div>
  );
}
