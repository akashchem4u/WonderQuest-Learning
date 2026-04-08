# WonderQuest Product Roadmap

**Consolidated from:** internal backlog · Agent Review A · Agent Review B · External tester feedback  
**Updated:** `2026-04-07`  
**Legend:** 🔴 P0 blocker · 🟠 P1 high · 🟡 P2 medium · 🟢 P3 backlog  
**Effort:** S = 1–2 days · M = 3–5 days · L = 1–2 weeks · XL = 2+ weeks

---

## 🔴 P0 — Fix Before Any Public Demo, Pilot, or Press

Trust-breaking issues confirmed by two independent external reviewers. These must ship before showing to investors, schools, or press.

| # | Issue | Detail | Effort |
|---|-------|--------|--------|
| P0-1 | **Server-enforce all `/teacher/*` and `/owner/*` routes** | Teacher dashboard renders nav, Family Hub link, Sign Out, and cross-links *before* login. Ops console is publicly linked from home and shows internal sections + owner identity. Server-side `redirect()` required — client guards alone are not enough. | S |
| P0-2 | **Remove ops/platform-ops from public navigation** | "Platform ops" link should not appear in any public-facing nav. Owner console is not a feature a parent, child, or teacher should ever discover. | S |
| P0-3 | **Strip internal data from publicly reachable routes** | `/owner/release`, `/owner/routes`, `/owner/risk-register`, etc. expose build numbers, feature flags, deploy state, PR names, and CI metadata publicly. Move behind `requireOwnerSession` in the server component itself. | S |
| P0-4 | **Fix indefinite "Loading…" states on public pages** | Multiple ops and some teacher pages display only "Loading…" forever to anonymous users. This makes the product feel broken. Every page must show: loading → data, or loading → error/unauthorized/empty — never stuck. | S |
| P0-5 | **Unify auth model labels** | Child: 4-digit PIN. Parent: email or username + password. Teacher: username + password. These labels are inconsistent with the actual credential types in the DB and confuse testers trying to log in. Audit every login form against actual auth flow. | S |
| P0-6 | **Fix copy inconsistencies** | Home says "Ages 2–10 · **5** live bands" but only 4 bands show (PREK/K1/G23/G45) and the top band goes to age 11. Fix the badge text and the age range claim everywhere it appears. | S |
| P0-7 | **Standardize naming across all surfaces** | Product alternates between "For families," "Family Hub," "Parent Portal." Same for teacher: "For teachers," "Teacher Dashboard," "Classroom." Pick one vocabulary set and apply it everywhere (nav, CTAs, headings, emails). | S |
| P0-8 | **Role boundary leakage in nav** | `app-frame.tsx` lets teacher-audience frames show owner/ops links. Public visitors see classroom navigation. Nav must be strictly role-scoped at the server component level, not just conditional rendering. | S |
| P0-9 | **Parent page: separate preview from real sign-in** | "Maya's week" sample data and real login form are on the same screen. Users mistake demo metrics for their live account. Gate preview behind explicit "See a demo ↓" toggle. | S |

---

## 🟠 P1 — Sprint 1 (This Week)

Core stability + the complete child → parent loop must be solid.

### Security & Session Hardening (OWASP-aligned)

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 1.1 | **OpenAI rate limiting** | `/api/play/answer` + `/api/play/explain` have no per-session or per-IP guard. One runaway loop = major cost spike. Add token-bucket middleware before launch. | S |
| 1.2 | **Session rotation after sign-in** | Current flow issues a cookie and never rotates the token. Should issue a fresh token on every successful login to prevent session fixation. | S |
| 1.3 | **Idle timeout + absolute timeout** | Child sessions: 240 min TTL exists. Add idle timeout (30 min inactive → expire). Parent/teacher: add absolute 8-hr timeout + idle 60-min. Show the `SessionTimeoutBanner` component (already built) to all authenticated roles. | M |
| 1.4 | **Parent/teacher session review + revoke** | Parents and teachers should be able to see active sessions ("signed in from Chrome/iPad yesterday") and revoke them. Especially important for shared family devices. | M |
| 1.5 | **Error fallback to content bank in `/play`** | `play-client.tsx` (104 KB) — if OpenAI times out mid-session, child sees white error screen. Fall back to seeded `example_items` from DB. Never show a crash to a child. | M |
| 1.6 | **Role-based auth integration tests** | No tests confirm child can't reach parent routes, parent can't reach teacher routes, etc. Add automated route-level auth assertions to `smoke:beta`. | M |
| 1.7 | **Synthetic monitoring for top routes** | Add health-check assertions for: home, `/child`, `/parent`, `/teacher`, `/api/health` in `render_post_setup_check.sh`. Alert on 4xx/5xx. | S |

### Child Experience

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 1.8 | **Child profile/avatar picker before PIN** | Multi-child households need a "Who are you?" avatar picker *before* the PIN pad — not inside settings. Shows avatars + names from `guardian_student_links`. Child taps their face → enters PIN. | M |
| 1.9 | **Post-session summary screen** (`/play/summary`) | After every session: questions answered, stars earned, skills touched, points delta, shareable screenshot card. Currently nothing happens after session ends — biggest drop-off point. | M |
| 1.10 | **TTS / read-aloud on every play screen** | `voice-preferences` page exists but TTS is not confirmed on every question prompt, answer choice, and Coach Leo message. PREK/K1 (ages 2–7) **cannot read instructions**. Use `speechSynthesis` — zero cost, works offline. | M |
| 1.11 | **Frustration-reduction / adaptive hint ladder** | When child misses same question 2×: show hint. Miss 3×: show easier example. Miss 4×: adaptive retry with Coach Leo scaffold. App promises Coach Leo but pattern is currently shallow. | M |
| 1.12 | **WCAG 2.2 touch targets for child keypad** | PIN keypad and answer buttons must meet WCAG 2.2 minimum 24×24px target size (ideally 44×44). Critical for tablet use by ages 2–5. | S |

### Parent Experience

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 1.13 | **Parent weekly digest — email delivery** | `/parent/weekly` page + API exist but no push mechanism. Wire Resend (recommended) or SendGrid. Sunday-night cron. #1 parent re-engagement loop. Include: what improved / what needs help / what to do at home in 2 minutes. | M |
| 1.14 | **One-tap child switching** | Parents with 2–3 children need fast switching without re-login. `guardian_student_links` table exists. Add a child-switcher dropdown to parent nav. | S |
| 1.15 | **"What should I do this week?" action card** | 3 simple offline reinforcement activities on parent home. Derived from current skill gaps. Not just what happened — what to do next. | S |

### Auth

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 1.16 | **Google Sign-on — Parent + Teacher** | Scheduled for tomorrow. Supabase Auth OAuth → Google provider. Children use PIN (COPPA — no Google accounts). Reduces adult sign-up friction. | M |
| 1.17 | **Admin first-time setup** | Set `ADMIN_SETUP_SECRET` in Render env vars → visit `/owner/setup` once → creates super_admin. Then page locks permanently. | S |

---

## 🟡 P2 — Sprint 2 (Week 2)

Deeper engagement loops + teacher workflow quality.

### Child Depth

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 2.1 | **Onboarding quest polish** ("First 5 Minutes") | Biggest drop-off risk. Coach Leo guides first 3 questions → earns first badge → unlocks avatar. Currently `quickstart` wizard exists but the guided quest itself is not polished. A/B test this relentlessly. | M |
| 2.2 | **Streak Shield / recovery mechanic** | Missing 1 day kills streak → child quits. Add consumable Streak Shield (earned via trophies) or 24-hr grace period. Proven churn reducer (Duolingo, Headspace). | S |
| 2.3 | **Diagnostic placement assessment** | 3-min first-run adaptive assessment to place kids accurately instead of self-reported band selection. Improves learning outcomes and onboarding trust. | M |
| 2.4 | **Session timer / focus mode** | Simple per-session countdown (parent-configurable, e.g., 15 min). Soft end with "Great job! Come back tomorrow?" Gives parents screen-time control. | S |
| 2.5 | **Audio-first affordances (PREK)** | Replay button on every question. Slower TTS speed option. Visual cueing: highlight words as spoken. Required for ages 2–5 who cannot yet read. | M |
| 2.6 | **Spaced repetition scheduler** | `mastery-service.ts` tracks scores but never re-surfaces old skills. Implement SM-2 interval logic. Surface "due for review" skills in `/child/quest`. | M |
| 2.7 | **Achievement economy depth** | Streak repairs, treasure chests, seasonal events, class-safe team goals. Trophies/badges exist but the economy is shallow. Design reward loop before building. | L |

### Teacher Workflow

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 2.8 | **Teacher demo mode** | Show sample class data in read-only demo before teacher authenticates. Removes the confusing "empty shell" state new teachers see. | S |
| 2.9 | **Fast workflow shortcuts** | "Students who need help today" / "Skills slipping this week" / "Print intervention plan" — one-click from teacher home. Drives daily active use. | S |
| 2.10 | **Assignment builder with standards tags** | Tag CCSS/TEKS/BEST standards per assignment. `curriculum-frameworks.ts` already has the data. Makes WonderQuest gradebook-defensible for school adoption. | M |
| 2.11 | **One-click assignment from intervention** | Teacher sees "Maya needs help with place value" → one click creates a targeted quest assignment. Currently requires navigating separately. | S |
| 2.12 | **AI intervention — actionable 3-step plan** | `adaptive-teacher.ts` classifies archetypes. Upgrade to: "Pull Maya Tuesday 10 min · focus place value · use Skill Group B." Teacher-workflow-ready. | M |
| 2.13 | **Small-group recommendations by misconception** | Cluster students by misconception pattern, not just low score. Useful for mixed classrooms. | M |
| 2.14 | **Student notes in intervention flow** | Teacher can leave notes on a student that persist. Already partially built (`teacher_notes` table exists from migration 000012). Wire it into intervention detail. | S |
| 2.15 | **Parent communication triggers** | Teacher can send a "heads up" to parent from intervention flow. Kicks off a notification via the parent digest system. | M |

### Parent Depth

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 2.16 | **Supportive gap language audit** | Rewrite all "skills needing work" / "struggling with" copy to use growth-framing language. Deficit language erodes parent trust. | S |
| 2.17 | **Goal setting + milestone notifications** | Parents set weekly goal ("15 min, 4×/week"). Email/push when child hits it. Drives parent re-engagement. | M |
| 2.18 | **Daily challenge push notification** | `/child/daily-challenge` exists but nothing surfaces it. Email or web push: "Your daily challenge is ready!" Proven DAU driver. | S |
| 2.19 | **Share-with-teacher option** | Parent can share their child's weekly summary directly with the teacher. Closes the parent→teacher communication loop. | M |
| 2.20 | **Recovery flows** | Clear, obvious paths for: parent forgot password, child forgot PIN, parent needs to reset child PIN, parent wants to unlink a child. | M |

---

## 🟡 P2 — Sprint 3 (Weeks 3–4)

COPPA compliance hardening + ops maturity + infrastructure.

### COPPA & Privacy (Explicit Product Features)

Per FTC COPPA guidance — these must be explicit *product features*, not just policy text.

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 3.1 | **Verifiable parental consent flow** | On child account creation: explicit parent consent screen, email verification to guardian, consent record stored in DB. Required for COPPA. | M |
| 3.2 | **Parent data access + deletion dashboard** | Parent can view all data WonderQuest holds for their child and request full deletion. "Delete child account" must be a real button, not an email flow. | M |
| 3.3 | **Data minimization audit** | Audit every API endpoint for data returned — only return what's needed. Review which fields are stored in `student_profiles` and whether all are necessary. | M |
| 3.4 | **Data retention + auto-deletion policy** | Define retention periods. Implement auto-delete for inactive accounts > 12 months. Document vendor security assurances (Supabase, OpenAI). | M |
| 3.5 | **Session + audit log for parents** | Parent can see: when child logged in, from what device, what sessions were played. Gives parents oversight control. | M |

### Ops Console Maturity

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 3.6 | **Content QA workflows** | Owner can flag, review, and approve/reject individual questions. Link to existing `content-health` miss-rate data. Add review queue to owner console. | M |
| 3.7 | **Experiment guardrails** | `/owner/experiments` exists. Add guardrails: kill switch, traffic-split controls, automatic rollback trigger if error rate spikes. | M |
| 3.8 | **Adoption funnels by school/teacher** | Owner console shows: signups by school, DAU by teacher, cohort retention, question completion rates. Critical for pilot-school conversations. | M |
| 3.9 | **Audit log for content changes** | Who changed what question/skill/band when. Especially important for content moderation and COPPA accountability. | S |
| 3.10 | **Incident summaries tied to route health** | When a route is failing (from synthetic monitoring), auto-surface it in owner console with last-known-good + current error rate. | M |

### Infrastructure

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 3.11 | **Analytics events** (PostHog recommended — COPPA-friendly, self-hostable) | No client-side telemetry. Instrument: `session_started`, `question_answered`, `hint_used`, `session_abandoned`, `badge_earned`. Flying blind without this. | M |
| 3.12 | **Observability for route-load failures** | Structured logging for every fetch failure in owner/teacher pages. "Loading…" should never persist without a server-side trace. | S |
| 3.13 | **PWA / offline support** | Cache 1–2 sessions + assets via service worker. Biggest real-world reliability gap — tablets, car rides, school Wi-Fi. | L |
| 3.14 | **Lighthouse + a11y in CI** | Run Lighthouse on `/`, `/child`, `/parent`, `/teacher` in CI. Accessibility check for PREK voice flows. Performance target: >85. | S |
| 3.15 | **Bulk roster import (CSV / Google Classroom)** | Manual student adds = #1 teacher onboarding friction. CSV upload + optional Google Classroom OAuth sync. | L |
| 3.16 | **Class-wide celebration screen** | Shareable class badge when class hits milestones (1,000 questions, full band completion). Teacher hallway word-of-mouth driver. | S |

---

## 🟢 P3 — Backlog (Do When Capacity Allows)

| # | Item | Category | Effort |
|---|------|----------|--------|
| B1 | Co-play mode (parent + child on 2 devices, same session) | Engagement | L |
| B2 | Interest-adaptive story themes (dino kid sees dino questions) | Differentiation | L |
| B3 | Tailwind CSS migration (268 KB global CSS → Tailwind) | Infra | XL |
| B4 | Multi-language support (Spanish first) | Differentiation | XL |
| B5 | Printable progress report polish (beautiful PDF, fridge-worthy) | Parent | M |
| B6 | Session replay / "Watch Your Journey" | Child | L |
| B7 | Admin / pilot-school dashboard (district-level KPIs) | Owner | L |
| B8 | Seasonal events / limited-time quests | Engagement | M |
| B9 | WCAG 2.1 AA full audit + remediation | Accessibility | L |
| B10 | Intervention packs (2–3 targeted quests + printable parent activities) | Teacher | M |
| B11 | Post-session shareable image card (parents screenshot + share) | Parent | M |
| B12 | Parent-approved rewards / streak protection consent | Child/COPPA | M |

---

## Sprint Summary

### Sprint 1 — This Week (P0 + P1)
**Theme: Trust, security, and the core loop**
```
P0-1 to P0-9   All 9 P0 fixes                          ~3 days total
1.1  OpenAI rate limiting                               S
1.2  Session rotation after sign-in                     S
1.3  Idle + absolute session timeouts                   M
1.5  Error fallback in /play                            M
1.8  Child profile picker before PIN                    M
1.9  Post-session summary screen                        M
1.10 TTS on every play screen                           M
1.12 WCAG touch targets on child keypad                 S
1.13 Parent weekly digest email (Resend)                M
1.14 One-tap child switching                            S
1.16 Google Sign-on (Parent + Teacher)                  M  ← tomorrow
1.17 Admin setup (env var + /owner/setup)               S  ← trivial
```

### Sprint 2 — Week 2 (P1 depth + P2 start)
**Theme: Engagement + teacher workflow**
```
1.6  Role-based auth integration tests                  M
1.7  Synthetic monitoring                               S
1.11 Frustration-reduction / hint ladder                M
1.15 "What to do this week" parent card                 S
2.1  Onboarding quest polish                            M
2.2  Streak Shield                                      S
2.8  Teacher demo mode                                  S
2.9  Teacher fast shortcuts                             S
2.10 Assignment builder standards tags                  M
2.12 AI intervention 3-step plan                        M
2.16 Supportive gap language audit                      S
```

### Sprint 3 — Week 3 (COPPA + ops + infra)
**Theme: Production readiness**
```
3.1-3.5   COPPA product features                        M each
3.6-3.10  Ops console maturity                          M each
3.11      Analytics events (PostHog)                    M
3.13      PWA / offline                                 L
3.14      Lighthouse + a11y in CI                       S
3.15      Bulk roster import                            L
```

---

## Decisions Needed from Owner

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Email provider | Resend vs SendGrid | **Resend** — simpler API, generous free tier, great DX |
| Analytics tool | PostHog vs Mixpanel | **PostHog** — self-hostable, COPPA-friendly, open source |
| PWA strategy | Full service worker vs manifest + install prompt only | Start with manifest + prompt; add service worker in sprint 3 |
| Spanish localization | In-house vs i18n vendor | Decision gate before week 4; set up `i18n` structure now |
| Google Classroom OAuth | OAuth sync vs CSV only | Start CSV (faster); add Google Classroom in sprint 3 |
| COPPA consent mechanism | Email-based parental consent vs in-app consent | **Email-based** — lower friction, auditable |

---

## Key Metrics to Watch at Launch

| Metric | Target | Source |
|--------|--------|--------|
| Session completion rate | > 80% | `/api/play` completion events |
| Day-2 child retention | > 50% | Cohort analysis via PostHog |
| Parent digest email open rate | > 40% | Resend webhook |
| Teacher DAU / roster size ratio | > 3 sessions/week | Teacher analytics |
| OpenAI cost per session | < $0.02 | OpenAI billing + session count |
| Child keypad touch-target pass rate | 100% WCAG 2.2 | Lighthouse a11y |
| Route auth test pass rate | 100% | `smoke:beta` |
| Lighthouse performance (child page) | > 85 | CI check |
