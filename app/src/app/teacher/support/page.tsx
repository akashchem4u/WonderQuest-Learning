"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  bg: "#0f172a",
  surface: "#1e2a3a",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#f1f5f9",
  muted: "rgba(148,163,184,0.85)",
  subtle: "rgba(100,116,139,0.7)",
  mint: "#58e8c1",
  blue: "#3b82f6",
  blueBg: "rgba(59,130,246,0.12)",
  blueBorder: "rgba(59,130,246,0.30)",
};

const FAQ_DATA = [
  {
    q: "How do students join my class?",
    a: "Share your class code (found on your Class page) with parents. They enter it from the parent dashboard to link their child to your class.",
  },
  {
    q: "How is mastery measured?",
    a: "A student has mastered a skill when they achieve 70%+ accuracy across at least 3 practice attempts.",
  },
  {
    q: "How do I reset a student's band?",
    a: "Ask the parent to update the child's learning band from the parent dashboard, or contact support.",
  },
  {
    q: "What do intervention alerts mean?",
    a: "Interventions are auto-triggered when a student shows signs of struggle: low accuracy, inactivity, or a specific skill gap.",
  },
  {
    q: "How often is data updated?",
    a: "Student progress updates after each completed play session, usually within a few minutes.",
  },
];

const QUICK_LINKS = [
  {
    icon: "📧",
    label: "Contact support",
    href: "mailto:support@wonderquest.io",
    description: "Email us directly at support@wonderquest.io",
  },
  {
    icon: "📚",
    label: "How it works",
    href: "https://docs.wonderquest.io",
    description: "Read the full teacher documentation",
  },
  {
    icon: "🐛",
    label: "Report a bug",
    href: "https://github.com/wonderquest/wonderquest/issues",
    description: "Open a GitHub issue for technical problems",
  },
];

export default function TeacherSupportPage() {
  const [authed, setAuthed] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  if (!authed) {
    return (
      <AppFrame audience="teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  function toggleFaq(idx: number) {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/support">
      <main
        style={{
          minHeight: "100vh",
          background: C.bg,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
          padding: "28px 20px 80px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>
              🛟 Help &amp; Support
            </h1>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Quick links, answers to common questions, and ways to get in touch.
            </p>
          </div>

          <section>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.10em",
              textTransform: "uppercase", color: C.mint, marginBottom: 12,
            }}>
              Quick Links
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "14px 18px",
                    textDecoration: "none",
                    color: C.text,
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{link.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{link.label}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{link.description}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 14, color: C.subtle }}>→</span>
                </a>
              ))}
            </div>
          </section>

          <section>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.10em",
              textTransform: "uppercase", color: C.mint, marginBottom: 12,
            }}>
              Frequently Asked Questions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {FAQ_DATA.map((item, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      background: C.surface,
                      border: `1px solid ${isOpen ? C.blueBorder : C.border}`,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "14px 18px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        color: C.text,
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "system-ui",
                        minHeight: 48,
                        gap: 12,
                      }}
                    >
                      <span style={{ flex: 1 }}>{item.q}</span>
                      <span style={{
                        fontSize: 16, color: C.muted, flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                        display: "inline-block",
                      }}>▾</span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: "12px 18px 16px",
                        fontSize: 13,
                        color: C.muted,
                        lineHeight: 1.6,
                        borderTop: `1px solid ${C.border}`,
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <footer style={{
            textAlign: "center",
            fontSize: 12,
            color: C.subtle,
            paddingTop: 8,
            borderTop: `1px solid ${C.border}`,
          }}>
            WonderQuest Learning · Beta · Built with ❤️ for educators
          </footer>
        </div>
      </main>
    </AppFrame>
  );
}
