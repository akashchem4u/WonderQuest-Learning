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
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, padding: "0 clamp(16px,4vw,48px)",
      height: 64,
      background: "rgba(6,7,26,0.88)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: "-0.03em" }}>
          Wonder<span style={{ color: T.teal }}>Quest</span>
        </span>
      </Link>

      <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[
          { href: "/parent", label: "For families" },
          { href: "/teacher", label: "For teachers" },
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

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* Sign In dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              padding: "9px 16px", borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${T.borderHi}`,
              color: T.text, fontSize: 14, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
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
                { href: "/child", label: "👦 Child portal" },
                { href: "/parent", label: "👨‍👩‍👧 Parent hub" },
                { href: "/teacher", label: "🏫 Teacher dashboard" },
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

        <Link href="/child" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 20px", borderRadius: 12,
          background: `linear-gradient(135deg, ${T.violet}, #6d4fc2)`,
          color: "#fff", fontSize: 14, fontWeight: 800,
          textDecoration: "none",
          boxShadow: "0 4px 24px rgba(155,114,255,0.35)",
        }}>
          Start learning →
        </Link>
      </div>
    </header>
  );
}
