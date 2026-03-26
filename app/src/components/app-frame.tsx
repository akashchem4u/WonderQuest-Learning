import Link from "next/link";
import type { ReactNode } from "react";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

const navItems = [
  { href: "/", label: "Launchpad", icon: "🏠" },
  { href: "/child", label: "Child", icon: "👶" },
  { href: "/parent", label: "Family", icon: "👨‍👩‍👧" },
  { href: "/teacher", label: "Classroom", icon: "🎓" },
  { href: "/owner", label: "Ops", icon: "🔑" },
  { href: "/design-system", label: "Design System", icon: "🎨" },
];

const audienceMeta = {
  home: {
    label: "Platform launchpad",
    shortLabel: "Launchpad",
    title: "One product, five clear routes, and a child-first center of gravity.",
    detail: "Child, family, classroom, and ops experiences stay distinct while sharing the same product language.",
  },
  kid: {
    label: "Child journey",
    shortLabel: "Child",
    title: "Play-first learning with bold visuals, soft recovery, and instant re-entry.",
    detail: "The child route should feel alive before any adult dashboard asks for attention.",
  },
  parent: {
    label: "Family view",
    shortLabel: "Family",
    title: "A calmer family hub for progress, celebration, and next-step guidance.",
    detail: "Built to support the child route without turning home into a report card.",
  },
  teacher: {
    label: "Classroom view",
    shortLabel: "Classroom",
    title: "Instructional visibility for class momentum, support lanes, and guided next moves.",
    detail: "Designed for classroom action, not public comparison or noisy admin clutter.",
  },
  owner: {
    label: "Ops view",
    shortLabel: "Ops",
    title: "A product operations console for launch signal, feedback flow, and content readiness.",
    detail: "Operational visibility first, wiring depth second.",
  },
} as const;

const audienceRoutes = {
  home: [
    { href: "/child", label: "Launch child route" },
    { href: "/parent", label: "Open family hub" },
    { href: "/teacher", label: "Open classroom view" },
  ],
  kid: [
    { href: "/child", label: "Setup" },
    { href: "/play", label: "Play loop" },
    { href: "/parent", label: "Family support" },
  ],
  parent: [
    { href: "/parent", label: "Family hub" },
    { href: "/child", label: "Child route" },
    { href: "/owner", label: "Ops view" },
  ],
  teacher: [
    { href: "/teacher", label: "Classroom board" },
    { href: "/child", label: "Child path" },
    { href: "/owner", label: "Ops view" },
  ],
  owner: [
    { href: "/owner", label: "Ops console" },
    { href: "/teacher", label: "Classroom route" },
    { href: "/parent", label: "Family route" },
  ],
} as const;

type AppFrameProps = {
  children: ReactNode;
  currentPath?: string;
  audience?: keyof typeof audienceMeta;
};

export function AppFrame({
  children,
  currentPath,
  audience = "home",
}: AppFrameProps) {
  const meta = audienceMeta[audience];
  const routeHints = audienceRoutes[audience];
  const isAdultShell =
    audience === "parent" || audience === "teacher" || audience === "owner";

  if (isAdultShell) {
    return (
      <div className={`adult-shell theme-${audience}`}>
        <aside className="adult-sidebar">
          <div className="adult-sidebar-brand">
            <Link className="adult-brand-mark" href="/">
              Wonder<span>Quest</span>
            </Link>
            <p>{meta.label}</p>
          </div>

          <div className="adult-sidebar-section-label">Routes</div>
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
                  <code>{item.href}</code>
                </Link>
              );
            })}
          </nav>

          <div className="adult-sidebar-section-label">Mode</div>
          <div className="adult-sidebar-panel">
            <strong>{meta.shortLabel}</strong>
            <p>{meta.detail}</p>
          </div>
        </aside>

        <div className="adult-main">
          <header className="adult-topbar">
            <div>
              <span className="adult-topbar-kicker">{meta.label}</span>
              <strong>{meta.title}</strong>
            </div>
            <div className="adult-topbar-actions">
              <DisplayModeToggle />
            </div>
          </header>

          <div className="adult-context-row">
            {routeHints.map((item) => {
              const isCurrent = currentPath === item.href;

              return (
                <Link
                  aria-current={isCurrent ? "page" : undefined}
                  className={`adult-context-chip ${isCurrent ? "is-current" : ""}`}
                  href={item.href}
                  key={`${audience}-${item.href}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`app-frame theme-${audience}`}>
      <div className="app-backdrop" />
      <header className="app-chrome">
          <div className="app-brand">
            <Link className="app-brand-mark" href="/">
              WonderQuest Learning
            </Link>
            <div className="app-brand-copy">
              <div className="app-copy-topline">
                <strong>{meta.title}</strong>
                <span className="app-audience-pill">{meta.label}</span>
              </div>
              <span>{meta.detail}</span>
            </div>
            <div className="app-signal-row">
              <span className="app-signal-pill">Mode: {meta.shortLabel}</span>
              <span className="app-signal-pill">UI-first rebuild</span>
              <span className="app-signal-pill">Real route data</span>
            </div>
          </div>

          <div className="app-utility">
            <div className="app-utility-copy">
              <span>Shipped app shell</span>
              <strong>Shared route chrome across phone, tablet, and desktop.</strong>
            </div>
            <DisplayModeToggle />
            <nav aria-label="Primary" className="app-nav">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`app-nav-link ${isActive ? "is-active" : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="app-context-bar">
        {routeHints.map((item) => {
          const isCurrent = currentPath === item.href;

          return (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              className={`app-context-link ${isCurrent ? "is-current" : ""}`}
              href={item.href}
              key={`${audience}-${item.href}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
