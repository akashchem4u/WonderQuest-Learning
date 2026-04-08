"use client";
import Link from "next/link";
import { useState } from "react";

const T = {
  bg: "#06071a", surface: "#0e1029", border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.13)", violet: "#9b72ff", teal: "#2dd4bf",
  text: "#f1f5f9", muted: "rgba(241,245,249,0.52)",
} as const;

export function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="home-nav" style={{
      position: "sticky", top: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: "0 clamp(16px,4vw,48px)",
      height: 60,
      background: "rgba(6,7,26,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${T.border}`,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: "-0.03em" }}>
          Wonder<span style={{ color: T.teal }}>Quest</span>
        </span>
      </Link>

      {/* Desktop nav links */}
      <nav className="home-nav-links" style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[
          { href: "/parent", label: "Family Hub" },
          { href: "/teacher", label: "Classroom" },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={{
            padding: "8px 14px", borderRadius: 10,
            fontSize: 14, fontWeight: 600, color: T.muted,
            textDecoration: "none",
          }}>
            {label}
          </Link>
        ))}
      </nav>

      {/* Right actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        {/* Sign In dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              padding: "8px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${T.borderHi}`,
              color: T.text, fontSize: 13, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              whiteSpace: "nowrap",
            }}
          >
            Sign in {open ? "▲" : "▾"}
          </button>
          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "#0e1029",
              border: `1px solid ${T.borderHi}`,
              borderRadius: 12, padding: 6,
              minWidth: 180,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              zIndex: 100,
            }}>
              {[
                { href: "/child",   label: "👦 Child portal" },
                { href: "/parent",  label: "👨‍👩‍👧 Family Hub" },
                { href: "/teacher", label: "🏫 Classroom" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 14px", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, color: T.text,
                    textDecoration: "none",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/child" className="home-nav-cta" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 18px", borderRadius: 12,
          background: `linear-gradient(135deg, ${T.violet}, #6d4fc2)`,
          color: "#fff", fontSize: 14, fontWeight: 800,
          textDecoration: "none",
          boxShadow: "0 4px 24px rgba(155,114,255,0.35)",
          whiteSpace: "nowrap",
        }}>
          <span className="home-nav-cta-full">Start learning →</span>
          <span className="home-nav-cta-short">Start →</span>
        </Link>
      </div>
    </header>
  );
}
