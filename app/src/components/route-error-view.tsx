"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AppFrame } from "@/components/app-frame";

type RouteErrorViewProps = {
  audience: "parent" | "kid";
  currentPath: string;
  title: string;
  message: string;
  homeHref: string;
  homeLabel: string;
  icon: string;
  accent: string;
  retryLabel?: string;
  children?: ReactNode;
  onRetry: () => void;
};

export function RouteErrorView({
  audience,
  currentPath,
  title,
  message,
  homeHref,
  homeLabel,
  icon,
  accent,
  retryLabel = "Try again",
  children,
  onRetry,
}: RouteErrorViewProps) {
  return (
    <AppFrame audience={audience} currentPath={currentPath}>
      <main
        className="page-shell"
        style={{
          minHeight: "calc(100vh - 96px)",
          display: "grid",
          placeItems: "center",
          paddingTop: 24,
          paddingBottom: 32,
        }}
      >
        <section
          aria-labelledby="route-error-title"
          style={{
            width: "min(100%, 720px)",
            borderRadius: 28,
            padding: "clamp(28px, 5vw, 44px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "auto -80px -100px auto",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: accent,
              filter: "blur(60px)",
              opacity: 0.18,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              display: "grid",
              placeItems: "center",
              fontSize: 36,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              marginBottom: 20,
            }}
          >
            {icon}
          </div>

          <p
            style={{
              margin: "0 0 10px",
              color: "rgba(255,255,255,0.62)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Something went wrong
          </p>
          <h1
            id="route-error-title"
            style={{
              margin: "0 0 14px",
              color: "#f0f6ff",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              maxWidth: 56 * 10,
              color: "rgba(255,255,255,0.72)",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>

          {children}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
            <button
              type="button"
              onClick={onRetry}
              style={{
                padding: "14px 20px",
                borderRadius: 999,
                border: "none",
                background: accent,
                color: "#0f1020",
                fontSize: "0.95rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 12px 30px ${accent}33`,
              }}
            >
              {retryLabel}
            </button>
            <Link
              href={homeHref}
              style={{
                padding: "14px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#f0f6ff",
                fontSize: "0.95rem",
                fontWeight: 700,
                textDecoration: "none",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {homeLabel}
            </Link>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
