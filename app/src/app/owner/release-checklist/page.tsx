"use client";

import { useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
};

type CheckItem = { id: number; category: string; label: string; done: boolean; required: boolean };

const INITIAL_ITEMS: CheckItem[] = [
  { id: 1, category: "Content", label: "All K-1 band skills reviewed and approved", done: true, required: true },
  { id: 2, category: "Content", label: "Audio files present for all Pre-K questions", done: true, required: true },
  { id: 3, category: "Content", label: "Grade 4-5 coverage gaps documented", done: false, required: false },
  { id: 4, category: "Safety", label: "COPPA compliance checklist signed off", done: true, required: true },
  { id: 5, category: "Safety", label: "Child data handling audit complete", done: true, required: true },
  { id: 6, category: "Safety", label: "Parental consent flow tested end-to-end", done: false, required: true },
  { id: 7, category: "Technical", label: "All routes return 200 in staging", done: true, required: true },
  { id: 8, category: "Technical", label: "DB migration script tested on staging clone", done: false, required: true },
  { id: 9, category: "Technical", label: "Error monitoring alerts configured", done: true, required: false },
  { id: 10, category: "Beta", label: "5 pilot families onboarded and tested", done: false, required: true },
  { id: 11, category: "Beta", label: "Teacher pilot feedback reviewed", done: false, required: false },
  { id: 12, category: "Beta", label: "Beta exit criteria met (3+ days clean)", done: false, required: true },
];

const CATEGORIES = ["Content", "Safety", "Technical", "Beta"];

export default function ReleaseChecklistPage() {
  const [items, setItems] = useState<CheckItem[]>(INITIAL_ITEMS);

  const toggle = (id: number) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it));

  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const requiredTotal = items.filter((i) => i.required).length;
  const requiredDone = items.filter((i) => i.required && i.done).length;
  const readyToRelease = requiredDone === requiredTotal;

  return (
    <AppFrame audience="owner" currentPath="/owner/release-checklist">
      <OwnerGate configured={true} />
      <div style={{ minHeight: "100vh", background: C.base, color: C.text, fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "14px 28px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/owner" style={{ fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none" }}>&#8592; Owner</Link>
          <span style={{ color: C.border, fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Release Checklist</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: done === total ? C.mint : C.muted }}>{done}/{total} complete</span>
            <div style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
              background: readyToRelease ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.12)",
              color: readyToRelease ? C.mint : C.amber,
              border: `1px solid ${readyToRelease ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
            }}>
              {readyToRelease ? "Ready to Release" : "Not Ready"}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "20px 28px 0" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Required items: {requiredDone}/{requiredTotal}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Optional: {done - requiredDone}/{total - requiredTotal}</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${(done / total) * 100}%`, height: "100%", background: readyToRelease ? C.mint : C.violet, borderRadius: 4, transition: "width 0.3s ease" }} />
            </div>
          </div>
        </div>

        {/* Checklist by category */}
        <div style={{ padding: "20px 28px 0", display: "flex", flexDirection: "column", gap: 16 }}>
          {CATEGORIES.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            const catDone = catItems.filter((i) => i.done).length;
            return (
              <div key={cat} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted }}>{cat}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: catDone === catItems.length ? C.mint : C.muted }}>{catDone}/{catItems.length}</span>
                </div>
                {catItems.map((item, i) => (
                  <div
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 20px",
                      borderBottom: i < catItems.length - 1 ? `1px solid ${C.border}` : "none",
                      cursor: "pointer",
                      background: item.done ? "rgba(34,197,94,0.04)" : "transparent",
                    }}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `2px solid ${item.done ? C.mint : "rgba(255,255,255,0.2)"}`,
                      background: item.done ? C.mint : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 11,
                      color: "#000",
                      fontWeight: 900,
                    }}>
                      {item.done ? "✓" : ""}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: item.done ? C.muted : C.text, textDecoration: item.done ? "line-through" : "none" }}>
                      {item.label}
                    </span>
                    {item.required && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.12)", color: C.red, border: "1px solid rgba(239,68,68,0.3)", textTransform: "uppercase" }}>
                        Required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </AppFrame>
  );
}
