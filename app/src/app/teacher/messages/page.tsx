"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  cardBg: "rgba(255,255,255,0.04)",
  cardBgActive: "rgba(155,114,255,0.12)",
  borderActive: "rgba(155,114,255,0.4)",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(255,255,255,0.14)",
  bubbleOut: "#9b72ff",
  bubbleIn: "rgba(255,255,255,0.07)",
  bubbleInBorder: "rgba(255,255,255,0.1)",
  sideBg: "rgba(0,0,0,0.2)",
  composeBg: "rgba(0,0,0,0.18)",
  coral: "#f87171",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Msg = {
  id: string;
  from: "teacher" | "parent";
  body: string;
  time: string;
  unread?: boolean;
};

type Conv = {
  id: string;
  parentName: string;
  parentInitial: string;
  parentColor: string;
  studentName: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  isAnnouncement?: boolean;
  messages: Msg[];
};

// ── Seed conversations ────────────────────────────────────────────────────────
const CONVS: Conv[] = [
  {
    id: "conv-jordan",
    parentName: "Alex T.",
    parentInitial: "A",
    parentColor: "#475569",
    studentName: "Jordan",
    lastMessage: "Thanks for letting me know, I'll chat with them tonight.",
    lastTime: "10:32am",
    unreadCount: 1,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi Alex — I wanted to reach out about Jordan. They've been working hard on fractions this week! I'd love to schedule a brief check-in if you have a few minutes. No concerns — just want to share some ideas that might help at home too.",
        time: "Ms. Sharma · 9:14am",
      },
      {
        id: "m2",
        from: "parent",
        body: "Thanks so much for reaching out, Ms. Sharma! Jordan mentioned they've been finding fractions tricky. I'd love to chat — does Thursday work?",
        time: "Alex T. · 9:51am",
      },
      {
        id: "m3",
        from: "teacher",
        body: "Thursday works great! I'll send a calendar invite through the school portal. In the meantime, WonderQuest is suggesting some visual models — Jordan should see those pop up in their sessions soon.",
        time: "Ms. Sharma · 10:05am",
      },
      {
        id: "m4",
        from: "parent",
        body: "Thanks for letting me know, I'll chat with them tonight.",
        time: "Alex T. · 10:32am",
        unread: true,
      },
    ],
  },
  {
    id: "conv-priya",
    parentName: "Meera P.",
    parentInitial: "M",
    parentColor: "#0f766e",
    studentName: "Priya",
    lastMessage: "She's excited to catch up! We traveled for a family wedding.",
    lastTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi Meera — just checking in on Priya. We haven't seen her on WonderQuest in about five days. Hope everything is okay! Let me know if there's anything we can do to help her get back into her streak.",
        time: "Ms. Sharma · Mar 22",
      },
      {
        id: "m2",
        from: "parent",
        body: "Oh, I'm so sorry! We traveled for a family wedding last week. She'll be back at it tonight, I promise.",
        time: "Meera P. · Mar 22",
      },
      {
        id: "m3",
        from: "teacher",
        body: "No need to apologize at all — life happens! Priya's streak will reset but her skills are all saved. She'll pick right back up.",
        time: "Ms. Sharma · Mar 22",
      },
      {
        id: "m4",
        from: "parent",
        body: "She's excited to catch up! We traveled for a family wedding last week.",
        time: "Meera P. · Mar 23",
      },
    ],
  },
  {
    id: "conv-marcus",
    parentName: "David K.",
    parentInitial: "D",
    parentColor: "#7c3aed",
    studentName: "Marcus",
    lastMessage: "That's great news about the P3 advancement! We'll celebrate tonight.",
    lastTime: "Mar 20",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi David — big news! Marcus has just met all the criteria to advance from P2 to P3 on WonderQuest. He's worked incredibly hard this term. You should be very proud.",
        time: "Ms. Sharma · Mar 20",
      },
      {
        id: "m2",
        from: "parent",
        body: "Wow, that is amazing! He's been putting in so much time. Can you tell us what P3 means in terms of what he'll be working on?",
        time: "David K. · Mar 20",
      },
      {
        id: "m3",
        from: "teacher",
        body: "P3 covers Grade 3-4 level content — multiplication, division, and early fractions. He'll find it challenging in the best possible way.",
        time: "Ms. Sharma · Mar 20",
      },
      {
        id: "m4",
        from: "parent",
        body: "That's great news about the P3 advancement! We'll celebrate tonight.",
        time: "David K. · Mar 20",
      },
    ],
  },
  {
    id: "conv-announcement",
    parentName: "Sent to all parents",
    parentInitial: "!",
    parentColor: "#1d4ed8",
    studentName: "Class announcement",
    lastMessage: "Class 4B had an amazing week — 1,800 stars total, the best this term!",
    lastTime: "Mar 17",
    unreadCount: 0,
    isAnnouncement: true,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi Class 4B families — your students had a wonderful week on WonderQuest! The class collectively earned over 1,800 stars — the best weekly total this term. Keep encouraging those daily sessions at home.",
        time: "Ms. Sharma · Mar 17",
      },
      {
        id: "m2",
        from: "parent",
        body: "Thank you for sharing this! My son has been so motivated lately.",
        time: "Parent reply · Mar 17",
      },
      {
        id: "m3",
        from: "teacher",
        body: "That is so great to hear! Keep it up everyone — another big week ahead.",
        time: "Ms. Sharma · Mar 17",
      },
    ],
  },
];

const TOTAL_UNREAD = CONVS.reduce((s, c) => s + c.unreadCount, 0);

// ── API types ─────────────────────────────────────────────────────────────────
type RosterStudent = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
};

// ── Templates data ────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    icon: "★",
    title: "Progress update",
    body: "Hi — I wanted to share a positive update on what your child mastered this week on WonderQuest!",
  },
  {
    icon: "↑",
    title: "Band advancement",
    body: "Great news — your child is ready to advance to the next WonderQuest level. They've worked incredibly hard!",
  },
  {
    icon: "★",
    title: "Check-in request",
    body: "Hi — I'd love to schedule a brief chat. No concerns at all — just want to share some ideas that might help at home.",
  },
  {
    icon: "♡",
    title: "Encourage at home",
    body: "Hi — here are a few ways you can support your child's learning at home alongside their WonderQuest sessions.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TeacherMessagesPage() {
  const [activeConvId, setActiveConvId] = useState(CONVS[0].id);
  const [tab, setTab] = useState<"inbox" | "compose" | "announce">("inbox");
  const [replyText, setReplyText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [composeBody, setComposeBody] = useState("Hi — I wanted to reach out about your child's progress this week…");
  const [announceSubject, setAnnounceSubject] = useState("Great week in Class 4B!");
  const [announceBody, setAnnounceBody] = useState(
    "Hi Class 4B families,\n\nJust wanted to share that your students have had a wonderful week on WonderQuest! The class collectively earned over 1,800 stars — the best weekly total this term.\n\nKeep encouraging those daily sessions at home. Streaks are building and skills are clicking!\n\nThanks,\nMs. Sharma"
  );

  // ── Real student roster for sidebar ──────────────────────────────────────
  const [roster, setRoster] = useState<RosterStudent[]>([]);

  useEffect(() => {
    const teacherId = getTeacherId();
    async function load() {
      try {
        const res = await fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`);
        if (!res.ok) return;
        const data = await res.json() as { roster: RosterStudent[] };
        setRoster(data.roster);
      } catch {
        // silently fail — sidebar falls back to stub CONVS
      }
    }
    void load();
  }, []);

  // Build sidebar items: seed CONVS + real students that don't have a seeded conv
  const stubStudentNames = new Set(CONVS.filter((c) => !c.isAnnouncement).map((c) => c.studentName.toLowerCase()));
  const extraStudents = roster.filter((s) => !stubStudentNames.has(s.displayName.toLowerCase()));

  const activeConv = CONVS.find((c) => c.id === activeConvId) ?? CONVS[0];

  // ── Nav ───────────────────────────────────────────────────────────────────
  const navStyle: React.CSSProperties = {
    padding: "20px 32px 0",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap" as const,
  };

  const tabBtnBase: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "system-ui,-apple-system,sans-serif",
    fontSize: 13,
    fontWeight: 700,
    paddingBottom: 14,
    letterSpacing: "0.02em",
    borderBottom: "2px solid transparent",
    color: C.muted,
    transition: "color 0.15s",
  };

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div
        style={{
          background: C.base,
          minHeight: "100vh",
          color: C.text,
          fontFamily: "system-ui,-apple-system,sans-serif",
          paddingBottom: 48,
        }}
      >
        {/* ── Page header ── */}
        <div
          style={{
            padding: "28px 32px 0",
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <Link
                href="/teacher"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.muted,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                <span>&#8592;</span> Dashboard
              </Link>
              <Link
                href="/teacher/command"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.blue,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  background: "rgba(56,189,248,0.08)",
                  borderRadius: 6,
                  padding: "3px 10px",
                }}
              >
                Command Center
              </Link>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.violet,
                marginBottom: 4,
              }}
            >
              Messages
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: C.text,
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              Message Center
            </h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
              Direct messages with parents, routed through WonderQuest. No contact details are exchanged.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 28 }}>
            {TOTAL_UNREAD > 0 && (
              <div
                style={{
                  background: C.coral,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 12,
                  borderRadius: 20,
                  padding: "4px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                {TOTAL_UNREAD} unread
              </div>
            )}
            <button
              onClick={() => setTab("compose")}
              style={{
                background: C.violet,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
                boxShadow: "0 2px 10px rgba(155,114,255,0.3)",
              }}
            >
              + Compose
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={navStyle}>
          {(["inbox", "compose", "announce"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...tabBtnBase,
                color: tab === t ? C.text : C.muted,
                borderBottom: tab === t ? `2px solid ${C.violet}` : "2px solid transparent",
              }}
            >
              {t === "inbox" ? "Inbox" : t === "compose" ? "Compose" : "Announcement"}
            </button>
          ))}
        </div>

        {/* ══════ TAB: INBOX ══════ */}
        {tab === "inbox" && (
          <div
            style={{
              display: "flex",
              height: "calc(100vh - 230px)",
              minHeight: 480,
            }}
          >
            {/* Left: conversation list */}
            <div
              style={{
                width: 280,
                flexShrink: 0,
                borderRight: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
                background: C.sideBg,
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <input
                  type="text"
                  placeholder="Search messages…"
                  readOnly
                  style={{
                    width: "100%",
                    background: C.inputBg,
                    border: `1.5px solid ${C.inputBorder}`,
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: C.muted,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {CONVS.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "13px 16px",
                        cursor: "pointer",
                        background: isActive ? C.cardBgActive : "transparent",
                        borderLeft: isActive ? `3px solid ${C.violet}` : "3px solid transparent",
                        borderRight: "none",
                        borderTop: "none",
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                        display: "block",
                        fontFamily: "inherit",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: conv.isAnnouncement ? C.gold : C.violet,
                          marginBottom: 3,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {conv.isAnnouncement ? "📢 " : "re: "}
                        {conv.studentName}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: conv.isAnnouncement ? C.gold : C.text,
                          }}
                        >
                          {conv.parentName}
                        </span>
                        <span style={{ fontSize: 10, color: C.muted, flexShrink: 0, marginLeft: 6 }}>
                          {conv.lastTime}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: C.muted,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {conv.lastMessage}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: C.coral,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Real students without existing stub convs */}
                {extraStudents.map((s) => (
                  <div
                    key={s.studentId}
                    style={{
                      padding: "13px 16px",
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                      borderLeft: "3px solid transparent",
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.violet, marginBottom: 3, letterSpacing: "0.04em" }}>
                      re: {s.displayName}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                      {s.displayName}&apos;s parent
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>No messages yet</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: message thread */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              {/* Thread header */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(0,0,0,0.14)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: activeConv.parentColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {activeConv.parentInitial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                    {activeConv.parentName}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {activeConv.isAnnouncement ? "Class-wide announcement" : `Parent of ${activeConv.studentName}`}
                  </div>
                </div>
                <button
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "transparent",
                    color: C.muted,
                    border: `1.5px solid ${C.border}`,
                    fontFamily: "inherit",
                  }}
                >
                  Archive
                </button>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  background: "rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    alignSelf: "center",
                    fontSize: 11,
                    color: C.muted,
                    background: "rgba(255,255,255,0.05)",
                    padding: "4px 14px",
                    borderRadius: 10,
                  }}
                >
                  March 21, 2026
                </div>

                {activeConv.messages.map((msg) => {
                  const isOut = msg.from === "teacher";
                  return (
                    <div
                      key={msg.id}
                      style={{ alignSelf: isOut ? "flex-end" : "flex-start", maxWidth: "72%" }}
                    >
                      <div
                        style={{
                          padding: "11px 16px",
                          borderRadius: isOut ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: isOut ? "#fff" : C.text,
                          background: isOut ? C.bubbleOut : C.bubbleIn,
                          border: isOut ? "none" : `1px solid ${C.bubbleInBorder}`,
                          boxShadow: isOut
                            ? "0 2px 12px rgba(155,114,255,0.28)"
                            : "0 1px 6px rgba(0,0,0,0.18)",
                          outline: msg.unread ? `2px solid ${C.coral}` : "none",
                          outlineOffset: msg.unread ? 2 : 0,
                        }}
                      >
                        {msg.body}
                        <div
                          style={{
                            fontSize: 10,
                            marginTop: 6,
                            color: isOut ? "rgba(255,255,255,0.6)" : C.muted,
                            textAlign: isOut ? "right" : "left",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: isOut ? "flex-end" : "flex-start",
                            gap: 6,
                          }}
                        >
                          {msg.time}
                          {msg.unread && (
                            <span
                              style={{
                                background: C.coral,
                                color: "#fff",
                                borderRadius: 5,
                                padding: "1px 6px",
                                fontSize: 9,
                                fontWeight: 800,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                              }}
                            >
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compose bar */}
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: `1px solid ${C.border}`,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-end",
                  background: C.composeBg,
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                {showTemplates && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 20,
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: 12,
                      width: 300,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: C.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 10,
                      }}
                    >
                      Message Templates
                    </div>
                    {TEMPLATES.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setReplyText(t.body);
                          setShowTemplates(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: "transparent",
                          color: C.text,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                          {t.icon} {t.title}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{t.body}</div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowTemplates((v) => !v)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: showTemplates ? "rgba(155,114,255,0.15)" : "transparent",
                    color: showTemplates ? C.violet : C.muted,
                    border: `1.5px solid ${showTemplates ? C.violet : C.border}`,
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Templates
                </button>

                <textarea
                  placeholder="Write a message…"
                  rows={1}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${C.inputBorder}`,
                    background: C.inputBg,
                    color: C.text,
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "none",
                    minHeight: 40,
                    maxHeight: 110,
                    lineHeight: 1.4,
                  }}
                />

                <button
                  style={{
                    padding: "9px 22px",
                    background: C.violet,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: "0 2px 10px rgba(155,114,255,0.32)",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ TAB: COMPOSE ══════ */}
        {tab === "compose" && (
          <div style={{ padding: "28px 32px", display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Compose form */}
            <div
              style={{
                flex: "1 1 380px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 18 }}>
                New Message
              </div>

              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 5,
                  }}
                >
                  To (parent)
                </div>
                <input
                  readOnly
                  value="Alex T. (parent of Jordan)"
                  style={{
                    width: "100%",
                    background: C.inputBg,
                    border: `1.5px solid ${C.inputBorder}`,
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: C.text,
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                  Messages are delivered in-platform. No email addresses shared.
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 5,
                  }}
                >
                  Message
                </div>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={5}
                  style={{
                    width: "100%",
                    background: C.inputBg,
                    border: `1.5px solid ${C.inputBorder}`,
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: C.text,
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    lineHeight: 1.55,
                  }}
                />
              </div>

              <div
                style={{
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 11,
                  color: C.mint,
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                &#128274; This message will be delivered to Alex T.'s WonderQuest parent account. Student data is not included unless you write it in your message.
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: C.violet,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 2px 10px rgba(155,114,255,0.3)",
                  }}
                >
                  Send
                </button>
                <button
                  onClick={() => setTab("inbox")}
                  style={{
                    padding: "10px 16px",
                    background: "transparent",
                    color: C.muted,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Template sidebar */}
            <div style={{ flex: "0 0 260px" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}
              >
                Message Templates
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setComposeBody(t.body)}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      color: C.text,
                      transition: "border-color 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                      {t.icon} {t.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{t.body}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════ TAB: ANNOUNCE ══════ */}
        {tab === "announce" && (
          <div style={{ padding: "28px 32px" }}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 24,
                maxWidth: 580,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 20 }}>📢</span>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>
                  Class Announcement
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
                Send a message to all parents in Class 4B (28 families). Announcements must not contain individual student names or data — use class-level language only.
              </div>

              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 5,
                  }}
                >
                  Subject
                </div>
                <input
                  value={announceSubject}
                  onChange={(e) => setAnnounceSubject(e.target.value)}
                  style={{
                    width: "100%",
                    background: C.inputBg,
                    border: `1.5px solid ${C.inputBorder}`,
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: C.text,
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 5,
                  }}
                >
                  Message
                </div>
                <textarea
                  value={announceBody}
                  onChange={(e) => setAnnounceBody(e.target.value)}
                  rows={7}
                  style={{
                    width: "100%",
                    background: C.inputBg,
                    border: `1.5px solid ${C.inputBorder}`,
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: C.text,
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    lineHeight: 1.55,
                  }}
                />
              </div>

              <div
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 11,
                  color: C.amber,
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                &#9888;&#65039; Class announcements must not include individual student names or data. If you need to reference a specific student, send an individual message instead.
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: C.blue,
                    color: "#0a0a0a",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Send to 28 families
                </button>
                <button
                  style={{
                    padding: "10px 16px",
                    background: "transparent",
                    color: C.muted,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Privacy notice (always shown) ── */}
        <div
          style={{
            margin: "16px 32px 0",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.18)",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 11,
            color: C.mint,
            lineHeight: 1.5,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span style={{ flexShrink: 0 }}>&#128274;</span>
          <span>
            Messages are sent through WonderQuest only. Parent contact details are not shared with teachers, and teacher contact details are not shared with parents. All messages are retained for 2 years after the class year ends.
          </span>
        </div>
      </div>
    </AppFrame>
  );
}
