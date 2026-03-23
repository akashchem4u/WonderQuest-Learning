# WonderQuest UI / UX Design Backlog

This is the comprehensive parked design backlog for WonderQuest.

Use it as the long-horizon queue behind the active batch in
[`ENGINEERING_REQUESTS.md`](./ENGINEERING_REQUESTS.md).

Rules:

- Do not start from this file until the active `next batch` in
  `ENGINEERING_REQUESTS.md` is complete.
- Before creating a file from this backlog, check whether it already exists in
  the top-level `ui-agent/` folder or in an archive.
- Prefer route-level, implementation-friendly HTML references over abstract
  concept boards.
- Keep audience separation strict:
  - child = visual, low-text, motivating
  - parent = calm, trustworthy, actionable
  - teacher = instructional, structured, efficient
  - owner = operational, high-signal, triage-friendly
  - content-admin = production workflow, QA, publish readiness

## Design System / Shared Surfaces

1. `route-shell-token-reference-v2.html` — side-by-side shell anatomy for child, parent, teacher, owner
2. `background-system-gallery-v2.html` — all background variants with light/dark/focus states
3. `motion-language-reference-v2.html` — page load, overlay, success, and transition motion rules
4. `state-library-loading-empty-error-v2.html` — reusable loading, empty, partial, error, success states
5. `form-controls-library-v2.html` — inputs, toggles, chips, pickers, secure PIN states
6. `feedback-pattern-library-v2.html` — feedback forms, report issue, confirm submission, escalation cards
7. `progress-visualization-library-v2.html` — rings, bars, ladders, maps, progress strips, heatmaps
8. `toast-overlay-library-v2.html` — snackbars, alerts, confirmations, reward overlays
9. `safe-area-mobile-reference-v2.html` — notch, bottom tab, sticky CTA, keyboard overlap handling
10. `responsive-breakpoint-reference-v2.html` — phone, tablet, laptop route adaptations
11. `audience-iconography-v2.html` — icon style system per audience
12. `illustration-direction-v2.html` — illustration language and placement rules
13. `voice-ui-patterns-v2.html` — replay, listening, mic, pause, listen-again surfaces
14. `accessibility-mode-system-v2.html` — larger text, higher contrast, reduced motion, simpler prompts
15. `safe-copy-language-reference-v2.html` — no-shame, family-safe copy patterns by audience

## Child Home / Child Progression

16. `child-home-desktop-canonical-v2.html` — desktop child home
17. `child-home-mobile-canonical-v2.html` — mobile child home
18. `child-avatar-identity-strip-v2.html` — avatar/name/level strip
19. `child-world-selector-sheet-v2.html` — world selection sheet or tray
20. `child-next-quest-card-v2.html` — strongest next-action card
21. `child-progress-map-desktop-v2.html` — desktop path/progress map
22. `child-progress-map-tablet-v2.html` — tablet progress map
23. `child-daily-goal-strip-v2.html` — daily goals row
24. `child-rewards-rail-v2.html` — rewards/points/badges mini-rail
25. `child-badge-detail-v2.html` — single badge explanation screen
26. `child-trophy-room-v2.html` — trophy collection surface
27. `child-world-unlock-reveal-v2.html` — world unlock moment
28. `child-level-up-reveal-v2.html` — level-up celebration
29. `child-return-home-v2.html` — coming-back child home state
30. `child-streak-saver-v2.html` — streak restore / streak save screen
31. `child-quest-log-v2.html` — recent quests and completed loops
32. `child-home-empty-v2.html` — new child / no progress yet
33. `child-home-low-power-v2.html` — low-attention/quick-return mode
34. `child-reward-history-v2.html` — recent rewards and wins
35. `child-favorite-theme-picker-v2.html` — choose favorite theme flow

## Play / Gameplay / Learning Loops

36. `play-prek-counting-scene-v2.html` — richer counting scenes
37. `play-prek-shape-scene-v2.html` — shape recognition scenes
38. `play-prek-letter-scene-v2.html` — letter recognition scenes
39. `play-prek-sound-match-scene-v2.html` — sound/phonics scene pack
40. `play-picture-word-scene-v2.html` — picture-word association scene pack
41. `play-k1-reading-scene-v2.html` — K1 reading question surface
42. `play-k1-math-scene-v2.html` — K1 math question surface
43. `play-g23-question-shell-v2.html` — Grades 2–3 question shell
44. `play-g45-question-shell-v2.html` — Grades 4–5 question shell
45. `play-hint-overlay-mobile-v2.html` — mobile hint overlay
46. `play-hint-overlay-tablet-v2.html` — tablet hint overlay
47. `play-explainer-video-card-v2.html` — explainer video/voice frame
48. `play-recovery-after-first-miss-v2.html` — first wrong answer pattern
49. `play-recovery-after-second-miss-v2.html` — second wrong answer pattern
50. `play-listen-again-dock-v2.html` — audio replay dock
51. `play-i-dont-know-yet-v2.html` — “I don’t know yet” support flow
52. `play-between-question-pacing-v2.html` — between-question transition state
53. `play-mid-session-break-v2.html` — pause / resume / come-back-later state
54. `play-streak-saved-overlay-v2.html` — streak saved overlay
55. `play-badge-earned-overlay-v2.html` — badge earned overlay
56. `play-world-node-unlock-overlay-v2.html` — node unlock overlay
57. `play-session-complete-mobile-v2.html` — mobile complete state
58. `play-session-complete-tablet-v2.html` — tablet complete state
59. `play-session-complete-desktop-v2.html` — desktop complete state
60. `play-progress-strip-v2.html` — stronger top progress/navigation strip

## Parent / Family Experience

61. `parent-dashboard-mobile-canonical-v2.html` — strongest compact parent hub
62. `parent-dashboard-desktop-canonical-v2.html` — strongest full desktop hub
63. `parent-child-switcher-sheet-v2.html` — mobile child switcher
64. `parent-linked-children-grid-v2.html` — desktop linked-child grid
65. `parent-weekly-hero-desktop-v2.html` — bigger weekly summary hero
66. `parent-week-comparison-desktop-v2.html` — week-over-week comparison
67. `parent-practice-planner-desktop-v2.html` — desktop home-practice planner
68. `parent-practice-history-v2.html` — completed/attempted home practice history
69. `parent-notification-settings-desktop-v2.html` — desktop notification settings
70. `parent-notification-settings-mobile-v2.html` — mobile notification settings
71. `parent-quiet-hours-detail-v2.html` — quiet-hours detail flow
72. `parent-home-practice-checklist-v2.html` — parent activity checklist
73. `parent-skill-drilldown-desktop-v2.html` — larger skill detail page
74. `parent-support-area-detail-v2.html` — support area deep dive
75. `parent-strength-area-detail-v2.html` — strength area deep dive
76. `parent-teacher-thread-v2.html` — parent-side teacher conversation thread
77. `parent-message-compose-v2.html` — safe message compose panel
78. `parent-family-settings-mobile-v2.html` — mobile family settings
79. `parent-link-success-v2.html` — successful link / setup confirmation
80. `parent-no-data-empty-v2.html` — no sessions/no insights yet
81. `parent-sibling-overview-v2.html` — multi-child comparison
82. `parent-goals-builder-v2.html` — choose short-term family goals
83. `parent-feedback-history-v2.html` — past submitted feedback/issues
84. `parent-beta-welcome-v2.html` — beta tester welcome/expectation screen
85. `parent-school-update-center-v2.html` — school notices and messages hub

## Teacher Experience

86. `teacher-home-desktop-canonical-v2.html` — teacher route canonical desktop
87. `teacher-home-mobile-canonical-v2.html` — teacher route canonical mobile
88. `teacher-class-overview-tablet-v2.html` — tablet class overview
89. `teacher-support-lane-mobile-v2.html` — mobile support queue lane
90. `teacher-support-lane-desktop-v3.html` — enhanced support lane desktop
91. `teacher-student-history-desktop-v2.html` — student history timeline
92. `teacher-student-history-mobile-v2.html` — student history mobile
93. `teacher-intervention-plan-editor-v2.html` — teacher plan editor
94. `teacher-intervention-status-board-v2.html` — track active interventions
95. `teacher-quick-note-capture-v2.html` — quick note entry flow
96. `teacher-assignment-status-board-v2.html` — sent/scheduled assignment board
97. `teacher-assignment-review-v2.html` — review scheduled assignment details
98. `teacher-group-picker-v2.html` — learner group selection interface
99. `teacher-filter-drawer-mobile-v2.html` — mobile filters
100. `teacher-skill-trend-dashboard-v2.html` — class skill trends
101. `teacher-queue-empty-state-v2.html` — first-time/low-data empty state
102. `teacher-parent-contact-log-v2.html` — contact-safe communication log
103. `teacher-in-class-quick-actions-v2.html` — classroom quick actions strip
104. `teacher-risk-learner-list-v2.html` — at-risk learners board
105. `teacher-support-priority-board-v2.html` — priority board

## Owner / Product Ops Experience

106. `owner-home-desktop-canonical-v2.html` — owner route canonical desktop
107. `owner-home-mobile-canonical-v2.html` — owner route canonical mobile
108. `owner-feedback-triage-desktop-v2.html` — dense triage table
109. `owner-feedback-triage-mobile-v2.html` — compact triage queue
110. `owner-feedback-category-mix-v2.html` — category mix dashboard
111. `owner-route-health-desktop-v2.html` — route health detailed dashboard
112. `owner-content-health-desktop-v2.html` — content health dashboard
113. `owner-adoption-detail-desktop-v2.html` — adoption drilldown
114. `owner-beta-tester-overview-v2.html` — tester pool / band coverage
115. `owner-release-checklist-desktop-v2.html` — full release checklist
116. `owner-release-gate-banner-v2.html` — release banner system
117. `owner-runtime-alert-detail-v2.html` — runtime alert detail
118. `owner-deploy-history-v2.html` — deploy history UI
119. `owner-resolution-workflow-desktop-v2.html` — resolution workflow
120. `owner-roadmap-priority-board-v2.html` — priority planning board
121. `owner-governance-log-v2.html` — change log / decision log
122. `owner-alert-feed-mobile-v2.html` — mobile alert feed
123. `owner-support-escalation-board-v2.html` — escalations board
124. `owner-beta-readiness-scorecard-v2.html` — combined readiness scorecard
125. `owner-family-signal-overview-v2.html` — household signal summary

## Content / Admin Experience

126. `content-home-desktop-canonical-v2.html` — content-admin home
127. `content-question-browser-mobile-v2.html` — mobile browser
128. `content-question-detail-v2.html` — single question detail
129. `content-question-approval-board-v2.html` — approval dashboard
130. `content-import-error-center-v2.html` — import error center
131. `content-gap-analysis-desktop-v2.html` — gap analysis
132. `content-band-coverage-drilldown-v2.html` — per-band coverage drilldown
133. `content-batch-generation-review-v2.html` — generation review board
134. `content-publish-history-v2.html` — publish history
135. `content-media-hint-library-v2.html` — media hint library
136. `content-voice-script-review-v2.html` — voice script review
137. `content-explainer-qa-v2.html` — explainer QA
138. `content-publish-scoreboard-v2.html` — publish/readiness scoreboard
139. `content-review-queue-mobile-v2.html` — mobile review queue
140. `content-skill-density-map-mobile-v2.html` — mobile density/coverage map
141. `content-theme-browser-v2.html` — theme browser and filters
142. `content-draft-state-gallery-v2.html` — draft/review/approved states
143. `content-hard-block-center-v2.html` — blocker center
144. `content-qa-history-v2.html` — QA history log
145. `content-beta-release-panel-v2.html` — beta content release panel

## Platform / Launcher / Shared Product Surfaces

146. `home-launcher-desktop-v3.html` — richer desktop home launcher
147. `home-launcher-mobile-v3.html` — richer mobile home launcher
148. `home-trust-strip-v2.html` — trust/safety strip variants
149. `home-live-status-panel-v2.html` — live status strip/panel
150. `home-audience-switcher-v2.html` — audience switcher behavior
151. `global-beta-announcement-banner-v2.html` — beta tester announcement banner
152. `global-maintenance-mode-v2.html` — maintenance mode screen
153. `global-no-connection-v2.html` — offline/no-connection product screen
154. `global-session-timeout-v2.html` — session timeout / resume state
155. `global-role-gate-patterns-v2.html` — teacher/owner gate patterns

## Voice / Audio / Interaction Layer

156. `voice-coach-control-bar-v2.html` — reusable voice control bar
157. `voice-guide-persona-picker-v2.html` — choose guide/voice persona
158. `audio-replay-floating-button-v2.html` — floating replay button states
159. `listening-mode-fullscreen-v2.html` — full listening mode
160. `mic-response-state-v2.html` — speaking/listening response UI
161. `slow-paced-prek-audio-ui-v2.html` — slower Pre-K audio pacing cues
162. `caption-support-mode-v2.html` — captions/word-highlight mode
163. `voice-disabled-fallback-v2.html` — no-audio fallback flow
164. `interactive-explainer-choice-v2.html` — choose explain again / try again / easier prompt
165. `audio-success-chime-overlay-v2.html` — subtle success chime visual state

## QA / Tester / Research Support

166. `beta-tester-home-v2.html` — tester landing/expectations page
167. `beta-feedback-entry-v2.html` — structured beta feedback intake
168. `family-test-scenario-cards-v2.html` — scenario cards for family testing
169. `teacher-test-scenario-cards-v2.html` — teacher test scenarios
170. `owner-test-scenario-cards-v2.html` — owner test scenarios
171. `ux-observation-log-v2.html` — observation log surface
172. `research-replay-board-v2.html` — replay/notes board
173. `issue-reproduction-helper-v2.html` — bug reproduction guide UI
174. `a-b-variant-comparison-v2.html` — visual A/B comparison sheet
175. `usability-metrics-strip-v2.html` — quick usability metrics panel

## Onboarding / Recovery / System States

176. `child-first-launch-welcome-v2.html` — first launch welcome and calm entry
177. `child-pin-recovery-flow-v2.html` — forgot PIN and grown-up assist pattern
178. `child-profile-switcher-v2.html` — sibling and returning child switcher
179. `parent-first-linking-wizard-v2.html` — first-time parent linking wizard
180. `parent-relink-recovery-v2.html` — recover from wrong linked child
181. `parent-household-manager-v2.html` — household/member management surface
182. `teacher-access-recovery-v2.html` — teacher wrong code / retry / support state
183. `owner-access-recovery-v2.html` — owner lockout and recovery state
184. `global-empty-state-gallery-v2.html` — all-audience empty state patterns
185. `global-error-state-gallery-v2.html` — all-audience error state patterns
186. `global-maintenance-banner-v3.html` — maintenance and degraded service banners
187. `global-update-announcement-v2.html` — release/update announcement patterns
188. `global-loading-skeletons-v2.html` — skeleton/loading references for all major routes
189. `global-no-results-state-v2.html` — search/filter no-results patterns
190. `global-permission-denied-v2.html` — safe denied-access state patterns

## Comparison / Benchmarks / Reports

191. `parent-benchmark-explainer-v2.html` — explain age/grade/internal benchmark framing safely
192. `parent-progress-report-download-v2.html` — export/share report surface
193. `parent-age-grade-comparison-v2.html` — age vs grade expectation comparison
194. `teacher-class-comparison-board-v2.html` — compare groups, bands, and support lanes
195. `teacher-student-growth-report-v2.html` — printable growth report layout
196. `owner-adoption-comparison-board-v2.html` — compare adoption across bands/themes
197. `owner-quality-score-trend-v2.html` — quality/readiness trend view
198. `content-coverage-comparison-v2.html` — compare skill/theme coverage by band
199. `beta-feedback-trend-board-v2.html` — feedback trends over beta window
200. `research-session-summary-v2.html` — researcher/test moderator summary surface

This backlog should keep growing over time. Add new items whenever a live route,
tester session, or engineering implementation reveals a missing surface.
