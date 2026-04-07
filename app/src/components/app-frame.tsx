import Link from "next/link";
import type { ReactNode } from "react";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

// ─── Section-specific nav ─────────────────────────────────────────────────────

const sectionNav = {
  parent: [
    { href: "/parent",                label: "Family Hub",     icon: "🏠" },
    { href: "/parent/family",         label: "Children",       icon: "👧" },
    { href: "/parent/skills",         label: "Skills",         icon: "🧠" },
    { href: "/parent/report",         label: "Reports",        icon: "📊" },
    { href: "/parent/suggestions",      label: "Learning Plan",  icon: "🎯" },
    { href: "/parent/practice-planner", label: "Planner",      icon: "📅" },
    { href: "/parent/notifications",  label: "Notifications",  icon: "🔔" },
    { href: "/parent/account",        label: "Account",        icon: "⚙️" },
  ],
  teacher: [
    { href: "/teacher",               label: "Dashboard",      icon: "🏠" },
    { href: "/teacher/class-health",  label: "Class Health",   icon: "💚" },
    { href: "/teacher/intervention-overview", label: "Interventions", icon: "🎯" },
    { href: "/teacher/recent-wins",   label: "Recent Wins",    icon: "🌟" },
    { href: "/teacher/band-coverage", label: "Band Coverage",  icon: "📐" },
    { href: "/teacher/feedback-panel", label: "Feedback",      icon: "📝" },
    { href: "/teacher/profile",        label: "Profile",        icon: "⚙️" },
  ],
  owner: [
    { href: "/owner",                 label: "Overview",       icon: "🏠" },
    { href: "/owner/kpi",             label: "KPIs",           icon: "📊" },
    { href: "/owner/content",         label: "Content",        icon: "📚" },
    { href: "/owner/adoption",        label: "Adoption",       icon: "📈" },
    { href: "/owner/feedback-resolution", label: "Feedback",   icon: "💬" },
    { href: "/owner/incident",        label: "Incidents",      icon: "🚨" },
  ],
} as const;

// Mobile bottom nav — top-level audience switcher
const mobileNav = [
  { href: "/",        label: "Home",      icon: "🏠" },
  { href: "/child",   label: "Child",     icon: "👶" },
  { href: "/parent",  label: "Family",    icon: "👨‍👩‍👧" },
  { href: "/teacher", label: "Classroom", icon: "🎓" },
  { href: "/owner",   label: "Ops",       icon: "🔑" },
];

// Switch-to links shown at sidebar footer
const switchLinks = {
  parent:  [{ href: "/teacher", label: "Classroom" }, { href: "/child", label: "Child" }],
  teacher: [{ href: "/parent",  label: "Family Hub" }, { href: "/owner", label: "Ops" }],
  owner:   [{ href: "/teacher", label: "Classroom" }, { href: "/parent", label: "Family Hub" }],
} as const;

// ─── Audience meta ────────────────────────────────────────────────────────────

const audienceMeta = {
  home: {
    label: "WonderQuest Learning",
    shortLabel: "Home",
    title: "Learning that meets every child where they are.",
    topLinks: [
      { href: "/parent",  label: "For families" },
      { href: "/teacher", label: "For teachers" },
      { href: "/owner",   label: "Platform ops" },
    ],
  },
  kid: {
    label: "WonderQuest",
    shortLabel: "Play",
    title: "Your learning adventure starts here.",
    topLinks: [
      { href: "/parent",  label: "For families" },
      { href: "/teacher", label: "For teachers" },
    ],
  },
  parent:  { label: "Family Hub",   shortLabel: "Family",    title: "Family Hub"   },
  teacher: { label: "Classroom",    shortLabel: "Classroom", title: "Classroom"    },
  owner:   { label: "Ops Console",  shortLabel: "Ops",       title: "Ops Console"  },
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

type AppFrameProps = {
  children: ReactNode;
  currentPath?: string;
  audience?: keyof typeof audienceMeta;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AppFrame({ children, currentPath, audience = "home" }: AppFrameProps) {
  const meta = audienceMeta[audience];
  const isAdultShell = audience === "parent" || audience === "teacher" || audience === "owner";

  // ── Adult shell (teacher / parent / owner) ──────────────────────────────────
  if (isAdultShell) {
    const navLinks = sectionNav[audience];
    const footer   = switchLinks[audience];

    return (
      <div className={`adult-shell theme-${audience}`}>

        {/* ── Sidebar ── */}
        <aside className="adult-sidebar">

          {/* Brand */}
          <div className="adult-sidebar-brand">
            <Link className="adult-brand-mark" href="/">
              Wonder<span>Quest</span>
            </Link>
            <p>{meta.shortLabel}</p>
          </div>

          {/* Section nav */}
          <nav aria-label="Primary" className="adult-sidebar-nav">
            {navLinks.map((item) => {
              const isActive = currentPath === item.href ||
                (item.href !== "/parent" && item.href !== "/teacher" && item.href !== "/owner" &&
                  currentPath?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`adult-nav-link${isActive ? " is-active" : ""}`}
                >
                  <span className="adult-nav-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer switch links */}
          <div className="adult-sidebar-footer">
            <span className="adult-sidebar-footer-label">Switch to</span>
            {footer.map((link) => (
              <Link key={link.href} href={link.href} className="adult-sidebar-switch">
                {link.label} →
              </Link>
            ))}
            {audience === "parent" && (
              <a href="/api/parent/logout" className="adult-sidebar-switch" style={{ marginTop: 8, color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
                Sign out →
              </a>
            )}
            {audience === "teacher" && (
              <a href="/api/teacher/logout" className="adult-sidebar-switch" style={{ marginTop: 8, color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
                Sign out →
              </a>
            )}
          </div>

        </aside>

        {/* ── Main ── */}
        <div className="adult-main">
          <header className="adult-topbar">
            <strong className="adult-topbar-title">{meta.title}</strong>
            <div className="adult-topbar-actions">
              <DisplayModeToggle />
            </div>
          </header>
          {children}
        </div>

        {/* ── Mobile bottom nav ── */}
        <nav className="adult-mobile-nav" aria-label="Mobile navigation">
          {mobileNav.map((item) => {
            const isActive = item.href === "/"
              ? currentPath === "/"
              : currentPath === item.href || currentPath?.startsWith(item.href + "/") || false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`adult-mobile-nav-item${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="adult-mobile-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </div>
    );
  }

  // ── Light shell (home / kid) ─────────────────────────────────────────────────
  const topLinks = "topLinks" in meta ? meta.topLinks : [];

  return (
    <div className={`app-frame theme-${audience}`}>
      <div className="app-backdrop" aria-hidden="true" />

      <header
        className="home-topbar"
        style={{
          position: "sticky", top: 0, zIndex: 50,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          background: "rgba(8,6,28,0.8)", marginBottom: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
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
