import Link from "next/link";
import type { ReactNode } from "react";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

const navItems = [
  { href: "/", label: "Launchpad", icon: "🏠" },
  { href: "/child", label: "Child", icon: "👶" },
  { href: "/parent", label: "Family", icon: "👨‍👩‍👧" },
  { href: "/teacher", label: "Classroom", icon: "🎓" },
  { href: "/owner", label: "Ops", icon: "🔑" },
];

const audienceMeta = {
  home: {
    label: "WonderQuest Learning",
    shortLabel: "Home",
    title: "Learning that meets every child where they are.",
    detail: "A platform built for children, families, and classrooms — with the tools teachers and operators need.",
  },
  kid: {
    label: "WonderQuest",
    shortLabel: "Play",
    title: "Your learning adventure starts here.",
    detail: "Answer questions, earn rewards, and keep your streak alive.",
  },
  parent: {
    label: "Family Hub",
    shortLabel: "Family",
    title: "See how your child is growing.",
    detail: "Progress, recent sessions, and what to celebrate next.",
  },
  teacher: {
    label: "Classroom",
    shortLabel: "Classroom",
    title: "Your class at a glance.",
    detail: "Track momentum, spot support needs early, and act with confidence.",
  },
  owner: {
    label: "Ops Console",
    shortLabel: "Ops",
    title: "Platform health and launch readiness.",
    detail: "Content coverage, feedback flow, and release signals in one place.",
  },
} as const;

const audienceRoutes = {
  home: [
    { href: "/child", label: "Start learning" },
    { href: "/parent", label: "Open family hub" },
    { href: "/teacher", label: "Open classroom view" },
  ],
  kid: [
    { href: "/child", label: "Setup" },
    { href: "/play", label: "Play" },
    { href: "/parent", label: "Family hub" },
  ],
  parent: [
    { href: "/parent", label: "Family hub" },
    { href: "/child", label: "Child" },
    { href: "/owner", label: "Ops view" },
  ],
  teacher: [
    { href: "/teacher", label: "Classroom board" },
    { href: "/child", label: "Child" },
    { href: "/owner", label: "Ops view" },
  ],
  owner: [
    { href: "/owner", label: "Ops console" },
    { href: "/teacher", label: "Classroom" },
    { href: "/parent", label: "Family hub" },
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

          <div className="adult-sidebar-section-label">Navigate</div>
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
              <span className="app-signal-pill">{meta.shortLabel}</span>
              <span className="app-signal-pill">Alpha</span>
            </div>
          </div>

          <div className="app-utility">
            <div className="app-utility-copy">
              <span>WonderQuest Learning</span>
              <strong>Alpha</strong>
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
