import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasTeacherAccess, isTeacherAccessConfigured } from "@/lib/teacher-access";
import TeacherGate from "@/app/teacher/teacher-gate";

export const dynamic = "force-dynamic";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  mint: "#58e8c1",
  violet: "#9b72ff",
  gold: "#ffd166",
  coral: "#ff7b6b",
  cardBg: "rgba(255,255,255,0.05)",
  cardBgActive: "rgba(155,114,255,0.12)",
  cardBorder: "rgba(255,255,255,0.1)",
  cardBorderActive: "rgba(155,114,255,0.4)",
  text: "#ffffff",
  muted: "rgba(216,240,234,0.6)",
  sideBg: "rgba(0,0,0,0.25)",
  inputBg: "rgba(255,255,255,0.07)",
  inputBorder: "rgba(255,255,255,0.15)",
  bubbleOut: "#9b72ff",
  bubbleIn: "rgba(255,255,255,0.08)",
  bubbleInBorder: "rgba(255,255,255,0.12)",
  composeBg: "rgba(0,0,0,0.2)",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  from: "teacher" | "parent";
  body: string;
  time: string;
  unread?: boolean;
};

type Conversation = {
  id: string;
  parentName: string;
  parentInitial: string;
  parentColor: string;
  studentName: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: Message[];
};

// ── Stub data ─────────────────────────────────────────────────────────────────
const CONVERSATIONS: Conversation[] = [
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
    lastMessage: "She's excited to catch up! We traveled for a family wedding last week.",
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
        body: "P3 covers Grade 3–4 level content — multiplication, division, and early fractions. He'll find it challenging in the best possible way. WonderQuest will ease him in with scaffolded questions.",
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
    id: "conv-bella",
    parentName: "Carmen V.",
    parentInitial: "C",
    parentColor: "#b45309",
    studentName: "Bella",
    lastMessage: "Wow, she'll be so proud when she hears! Thank you for telling us.",
    lastTime: "Mar 19",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi Carmen — I wanted to share that Bella earned the highest star count in the class this week: 312 stars! She was focused and persistent throughout every session.",
        time: "Ms. Sharma · Mar 19",
      },
      {
        id: "m2",
        from: "parent",
        body: "Oh my goodness, really? She hasn't said a word! She's so humble.",
        time: "Carmen V. · Mar 19",
      },
      {
        id: "m3",
        from: "teacher",
        body: "Ha! That's very Bella. She just quietly does the work. We're going to give her a little shout-out in class tomorrow — hope that's okay!",
        time: "Ms. Sharma · Mar 19",
      },
      {
        id: "m4",
        from: "parent",
        body: "Wow, she'll be so proud when she hears! Thank you for telling us.",
        time: "Carmen V. · Mar 19",
      },
    ],
  },
  {
    id: "conv-announcement",
    parentName: "Sent to all parents",
    parentInitial: "📢",
    parentColor: "#1d4ed8",
    studentName: "Class announcement",
    lastMessage: "Class 4B had an amazing week — 1,800 stars total, the best this term!",
    lastTime: "Mar 17",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        from: "teacher",
        body: "Hi Class 4B families — just wanted to share that your students have had a wonderful week on WonderQuest! The class collectively earned over 1,800 stars — the best weekly total this term. Keep encouraging those daily sessions at home. Streaks are building and skills are clicking!",
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
        from: "parent",
        body: "We noticed the same at home — she asks to do WonderQuest before dinner now!",
        time: "Parent reply · Mar 17",
      },
      {
        id: "m4",
        from: "teacher",
        body: "That is so great to hear! Keep it up everyone — another big week ahead.",
        time: "Ms. Sharma · Mar 17",
      },
    ],
  },
];

const TOTAL_UNREAD = CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0);
const ACTIVE_CONV = CONVERSATIONS[0];

// ── Shared styles ─────────────────────────────────────────────────────────────
const pageWrap: React.CSSProperties = {
  background: C.base,
  minHeight: "100vh",
  padding: "0 0 48px",
  color: C.text,
};

const glassCard: React.CSSProperties = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 16,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: C.mint,
  marginBottom: 4,
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function TeacherMessagesPage() {
  const configured = isTeacherAccessConfigured();
  const unlocked = await hasTeacherAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Teacher dashboard</span>
              <h1>Messages</h1>
            </div>
          </section>

          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Teacher"
            title="Unlock teacher dashboard"
          >
            <TeacherGate configured={configured} />
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <div style={pageWrap}>
        {/* ── Page header ── */}
        <div
          style={{
            padding: "28px 32px 24px",
            borderBottom: `1px solid ${C.cardBorder}`,
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
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
                marginBottom: 10,
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ fontSize: 14 }}>&#8592;</span>
              Classroom Board
            </Link>

            <div style={eyebrowStyle}>Messages</div>
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
            <p
              style={{
                fontSize: 13,
                color: C.muted,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              Direct messages with parents, routed through WonderQuest. No
              contact details are exchanged.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {TOTAL_UNREAD > 0 && (
              <div
                style={{
                  background: C.coral,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  borderRadius: 20,
                  padding: "5px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    background: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                {TOTAL_UNREAD} unread
              </div>
            )}

            <button
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
              }}
            >
              + Compose
            </button>
          </div>
        </div>

        {/* ── 2-col layout ── */}
        <div
          style={{
            display: "flex",
            gap: 0,
            height: "calc(100vh - 210px)",
            minHeight: 520,
          }}
        >
          {/* ── Left: conversation list ── */}
          <div
            style={{
              width: 280,
              flexShrink: 0,
              borderRight: `1px solid ${C.cardBorder}`,
              display: "flex",
              flexDirection: "column",
              background: C.sideBg,
            }}
          >
            {/* Search */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: `1px solid ${C.cardBorder}`,
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

            {/* Thread list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {CONVERSATIONS.map((conv, idx) => {
                const isActive = idx === 0;
                const isAnnouncement = conv.id === "conv-announcement";

                return (
                  <div
                    key={conv.id}
                    style={{
                      padding: "13px 16px",
                      borderBottom: `1px solid rgba(255,255,255,0.05)`,
                      cursor: "pointer",
                      background: isActive ? C.cardBgActive : "transparent",
                      borderLeft: isActive
                        ? `3px solid ${C.violet}`
                        : "3px solid transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Student chip */}
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: isAnnouncement ? C.gold : C.violet,
                        marginBottom: 3,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {isAnnouncement ? "📢 " : "re: "}
                      {conv.studentName}
                    </div>

                    {/* Name row */}
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
                          color: isAnnouncement ? C.gold : C.text,
                        }}
                      >
                        {conv.parentName}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: C.muted,
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        {conv.lastTime}
                      </span>
                    </div>

                    {/* Preview + unread dot */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: selected thread ── */}
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
                borderBottom: `1px solid ${C.cardBorder}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: ACTIVE_CONV.parentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {ACTIVE_CONV.parentInitial}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: 14, fontWeight: 800, color: C.text }}
                >
                  {ACTIVE_CONV.parentName}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  Parent of {ACTIVE_CONV.studentName}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "transparent",
                    color: C.muted,
                    border: `1.5px solid ${C.cardBorder}`,
                    fontFamily: "inherit",
                    letterSpacing: "0.03em",
                  }}
                >
                  Archive
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: "rgba(0,0,0,0.08)",
              }}
            >
              {/* Date marker */}
              <div
                style={{
                  alignSelf: "center",
                  fontSize: 11,
                  color: C.muted,
                  background: "rgba(255,255,255,0.06)",
                  padding: "4px 14px",
                  borderRadius: 10,
                }}
              >
                March 21, 2026
              </div>

              {ACTIVE_CONV.messages.map((msg) => {
                const isOut = msg.from === "teacher";

                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isOut ? "flex-end" : "flex-start",
                      maxWidth: "72%",
                    }}
                  >
                    <div
                      style={{
                        padding: "11px 16px",
                        borderRadius: isOut
                          ? "14px 14px 4px 14px"
                          : "14px 14px 14px 4px",
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: isOut ? "#fff" : C.text,
                        background: isOut
                          ? C.bubbleOut
                          : C.bubbleIn,
                        border: isOut
                          ? "none"
                          : `1px solid ${C.bubbleInBorder}`,
                        boxShadow: isOut
                          ? "0 2px 12px rgba(155,114,255,0.3)"
                          : "0 1px 6px rgba(0,0,0,0.2)",
                        ...(msg.unread
                          ? {
                              outline: `2px solid ${C.coral}`,
                              outlineOffset: 2,
                            }
                          : {}),
                      }}
                    >
                      {msg.body}
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 6,
                          color: isOut
                            ? "rgba(255,255,255,0.6)"
                            : C.muted,
                          textAlign: isOut ? "right" : "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: isOut
                            ? "flex-end"
                            : "flex-start",
                          gap: 6,
                        }}
                      >
                        {msg.time}
                        {msg.unread && (
                          <span
                            style={{
                              background: C.coral,
                              color: "#fff",
                              borderRadius: 6,
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

            {/* Compose area */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: `1px solid ${C.cardBorder}`,
                display: "flex",
                gap: 10,
                alignItems: "flex-end",
                background: C.composeBg,
                flexShrink: 0,
              }}
            >
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: "transparent",
                  color: C.muted,
                  border: `1.5px solid ${C.cardBorder}`,
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
                readOnly
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
                  letterSpacing: "0.02em",
                  boxShadow: "0 2px 10px rgba(155,114,255,0.35)",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* ── Privacy notice ── */}
        <div
          style={{
            margin: "16px 32px 0",
            background: "rgba(88,232,193,0.07)",
            border: `1px solid rgba(88,232,193,0.2)`,
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
            Messages are sent through WonderQuest only. Parent contact details
            are not shared with teachers, and teacher contact details are not
            shared with parents. All messages are retained for 2 years after
            the class year ends.
          </span>
        </div>
      </div>
    </AppFrame>
  );
}
