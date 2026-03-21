import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/child", label: "Child" },
  { href: "/parent", label: "Parent" },
  { href: "/teacher", label: "Teacher" },
  { href: "/owner", label: "Owner" },
];

const audienceMeta = {
  home: {
    label: "Platform home",
    shortLabel: "Home",
    title: "Adaptive learning that feels like a favorite game.",
    detail: "Multi-device prototype with separate child, parent, teacher, and owner paths.",
  },
  kid: {
    label: "Kid journey",
    shortLabel: "Child",
    title: "Play-first learning with quick rewards and fast recovery loops.",
    detail: "Designed to feel energetic, visual, and easy to re-enter on any device.",
  },
  parent: {
    label: "Parent view",
    shortLabel: "Parent",
    title: "Calmer household visibility with time, effectiveness, and next-step signals.",
    detail: "Fast access now, stronger family account controls later.",
  },
  teacher: {
    label: "Teacher view",
    shortLabel: "Teacher",
    title: "Aggregate instructional visibility without exposing peer-to-peer child interactions.",
    detail: "Built for classroom and school insight, not public comparison.",
  },
  owner: {
    label: "Owner view",
    shortLabel: "Owner",
    title: "Prototype command center for traction, content coverage, and product signal quality.",
    detail: "Operational visibility for launch, testing, and backlog shaping.",
  },
} as const;

const audienceRoutes = {
  home: [
    { href: "/child", label: "Start child" },
    { href: "/parent", label: "Parent setup" },
    { href: "/teacher", label: "Teacher view" },
  ],
  kid: [
    { href: "/child", label: "Child setup" },
    { href: "/play", label: "Play loop" },
    { href: "/parent", label: "Parent link" },
  ],
  parent: [
    { href: "/parent", label: "Parent setup" },
    { href: "/child", label: "Child access" },
    { href: "/owner", label: "Owner route" },
  ],
  teacher: [
    { href: "/teacher", label: "Teacher dashboard" },
    { href: "/child", label: "Child path" },
    { href: "/owner", label: "Owner route" },
  ],
  owner: [
    { href: "/owner", label: "Owner console" },
    { href: "/teacher", label: "Teacher route" },
    { href: "/parent", label: "Parent path" },
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
            <span className="app-signal-pill">Audience mode: {meta.shortLabel}</span>
            <span className="app-signal-pill">Mobile-first UI</span>
            <span className="app-signal-pill">Supabase live flows</span>
          </div>
        </div>

        <div className="app-utility">
          <div className="app-utility-copy">
            <span>Web-first prototype</span>
            <strong>Ready across phone, tablet, and laptop screens.</strong>
          </div>
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
