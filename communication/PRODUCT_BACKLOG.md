# WonderQuest Product Backlog

Updated: `2026-04-07`

Items are grouped by tier. Tier 1 = highest impact / most critical for launch. Work down the tiers after Tier 1 is solid.

---

## 🚧 In Flight (scheduled / assigned)

| Item | Status |
|------|--------|
| Google Sign-on (Parent + Teacher via Supabase OAuth) | Deferred to tomorrow — needs Google Console + Supabase OAuth config |
| Admin first-time setup (`/owner/setup`) | Built, needs `ADMIN_SETUP_SECRET` env var set in Render |

---

## Tier 1 — Core Learning Experience (Highest Impact)

### 1. PWA / Offline Support
Kids lose sessions on car rides, airplanes, spotty school Wi-Fi. Cache 1–2 sessions of questions + assets via service worker so play never drops. Biggest real-world reliability gap.

### 2. Read-Aloud / TTS for Every Question
`voice-preferences` page exists but it's unclear every question screen uses TTS. PREK/K1 learners (ages 2–7) **cannot read instructions**. Every prompt, answer choice, and Coach Leo message must be speakable. Use Web Speech API (`speechSynthesis`) — zero cost, works offline.

### 3. Spaced Repetition Scheduler
`mastery-service.ts` tracks scores but doesn't schedule re-visits. Implement SM-2 (or simpler interval logic) to surface "due for review" skills. Prevents forgetting. Lives entirely in `mastery-service.ts`.

### 4. Post-Session Summary Screen
After every session: show each question answered, stars earned, skills touched, points delta. Include a shareable image/card parents can screenshot. Drives retention + parent engagement. Route: `/play/summary`.

### 5. OpenAI API Rate Limiting
`/api/play/answer` and `/api/play/explain` call OpenAI on every interaction. No per-session or per-IP rate limit exists. A runaway client loop = significant cost spike. Add rate limiting middleware before launch.

### 6. Error Fallback to Content Bank in `/play`
`play-client.tsx` is the most critical file. If OpenAI times out mid-session, the child should never see a white error screen. Fall back to seeded `example_items` from DB when live generation fails.

---

## Tier 2 — Engagement & Retention

### 7. Parent Weekly Digest — Email Delivery
`/parent/weekly` page + API exists but **no push delivery**. Wire Resend (or SendGrid) to send a weekly email with child highlights. This is the #1 parent re-engagement loop. Cron: every Sunday night.

### 8. Daily Challenge Push Notification
`/child/daily-challenge` exists but nothing surfaces it to users. Add web push (or email fallback): "Your daily challenge is ready!" Drives daily habit. Uses existing `milestone-service.ts` + a notification worker.

### 9. Streak Recovery ("Streak Shield")
When a child misses a day, streak resets to 0. Add a "Streak Shield" consumable (earnable via trophies) or a 1-day grace period. Reduces churn. Proven in Duolingo, Headspace, etc.

### 10. Co-Play Mode (Parent + Child Together)
Simplified session where parent joins the same question flow on their own device. Huge for PREK/K1 where parents sit with kids. Strengthens parent–product relationship.

---

## Tier 3 — Teacher & Classroom Features

### 11. Assignment Builder with Standards Tags
`/teacher/assignment` exists. Assignments should tag CCSS/TEKS standards (you have `curriculum-frameworks.ts`). Makes WonderQuest gradebook-defensible for school adoption.

### 12. Bulk Roster Import (CSV / Google Classroom)
Teachers manually add students today. CSV import + optional Google Classroom OAuth sync is the #1 teacher onboarding friction point beyond individual classrooms.

### 13. Class-Wide Celebration Screen
When the whole class hits a milestone (e.g., 1,000 questions answered), show a shareable class badge/trophy. Builds classroom community and word-of-mouth between teachers.

### 14. AI Intervention — Actionable "Next Step"
`adaptive-teacher.ts` classifies archetypes. Intervention cards should include a concrete 3-step action plan: "Pull Maya Tuesday for 10 min, focus on place value, use Skill Group B." Make AI outputs teacher-workflow-ready.

---

## Tier 4 — Infrastructure & Scale

### 15. Analytics Events (PostHog / Mixpanel)
No client-side event telemetry exists. Instrument key funnels: `session_started`, `question_answered`, `hint_used`, `session_abandoned`, `badge_earned`. Critical for understanding where users drop off.

### 16. Tailwind CSS Migration
268 KB of hand-written global CSS is a maintenance liability. Migrate to Tailwind — aligns perfectly with compact design conventions (`p-3 sm:p-5`, `gap-3 sm:gap-5`).

### 17. Multi-Language Support (Spanish First)
PREK/K1 in the US is heavily bilingual. Spanish-language questions + Coach Leo audio unlocks a large underserved market and aligns with COPPA demographics.

---

## Tier 5 — Differentiation Features

### 18. Interest-Adaptive Story Themes
Student interests are tracked and saved. The connection to question themes needs tightening. A child who picks "dinosaurs" should see dino word problems, dino counting scenes, dino worlds — not generic themes.

### 19. Printable Progress Reports (Polish)
`/parent/print-report` exists. Make it beautiful — full-color PDF with avatar, weekly stars, skills mastered, Coach Leo message. Parents will display these. Zero-cost marketing.

### 20. Session Replay / "Watch Your Journey"
Post-session summary (see Tier 1 #4) extended: kids can revisit any past session and replay it step by step. Builds metacognitive awareness and drives parent sharing.

---

## Quick Wins (Can do any week)

| Enhancement | Effort | Impact |
|---|---|---|
| Wire weekly digest email delivery | Low | High |
| Add TTS via Web Speech API on play screens | Low | High (PREK) |
| Streak shield / grace period | Low | Medium |
| Post-session summary screen | Medium | High |
| OpenAI API rate limiting | Low | Critical |
| Error fallback to content bank in play | Medium | Critical |
| `ADMIN_SETUP_SECRET` env var in Render → run `/owner/setup` | Trivial | Unblocks admin accounts |

---

## Notes

- **Google Sign-on**: Applies to Parent + Teacher portals only. Children use PIN (COPPA). Configure tomorrow: Google Cloud Console → OAuth client → Supabase Auth Google provider → redirect URI `https://cbgevfhusngqqsojifyd.supabase.co/auth/v1/callback`.
- **Admin first-time setup**: Set `ADMIN_SETUP_SECRET` in Render env vars, then visit `/owner/setup` once to create the super_admin account. After that the setup page is permanently disabled.
