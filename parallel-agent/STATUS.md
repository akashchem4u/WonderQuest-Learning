# Parallel Agent Status

Use this file only for completion notes.

Each status block should include:

- timestamp or sequence label
- files created
- states covered
- anything engineering should notice

Example:

## Batch 1 — COMPLETE (2026-03-23)

- Files created:
  - `owner-route-health-compact-v3.html`
  - `owner-release-gate-desktop-v3.html`
  - `owner-feedback-workbench-desktop-v3.html`
  - `parent-family-dashboard-desktop-v3.html`
  - `play-session-complete-desktop-v3.html`
  - `child-returning-player-hub-v2.html`
- States covered:
  - Owner route health: 10-route compact strip, degraded-sorted, click-to-expand, p95/p99/uptime table, incident log, latency small multiples
  - Owner release gate: animated SVG score ring (71/100), 5-category scoring, 3 blockers, disabled launch button + tooltip, sign-off checklist with commentary log
  - Owner feedback workbench: live queue (P0 red-border, inline expand/resolve), triage inbox, resolution SLA cards, SLA metrics + 7-day volume chart
  - Parent family dashboard: 3-child switcher (Emma/Noah/Lily), hero card, progress tiers, teacher messages (contact-safe), settings with privacy promise
  - Play session complete: 4 band variants (Pre-K/K-1/G2-3/G4-5), confetti burst, star-safe replay overlay, staggered chip-pop animations
  - Child returning player hub: 5 return states (same-day/2-day/7-day streak restore/30-day comeback/spec), star-safe badge on all gap screens, confetti on comeback
- Notes:
  - Background agents cannot use Write tool — all files must be built directly by main Claude instance
  - Star-safe badge shown on all gap/absence states; never shown on same-day return
  - 30-day comeback includes Legend Badge chip (+2⭐ +100XP)
  - Play session complete: replay state uses star-safe overlay text "Your stars are safe!"
  - Owner dark ops palette (#0d1117 bg / #161d2a card) used consistently across all 3 owner files
  - Parent language rules applied throughout: no accuracy %, no "missed day", tier labels only

## Continuing into TASK_BACKLOG.md — item 1 next

## Batch 2 — COMPLETE (2026-03-23) · TASK_BACKLOG items 1–6

- Files created:
  - `child-home-hub-desktop-v3.html`
  - `child-home-hub-mobile-v3.html`
  - `child-quickstart-desktop-v3.html`
  - `child-quickstart-mobile-v3.html`
  - `child-returning-player-desktop-v3.html`
  - `child-returning-player-mobile-v3.html`
- States covered:
  - Home hub desktop: 3-col grid (220px sidebar / 1fr main / 280px rail), hero world card, 12-node map, quest strip 3-up, band selector 2×2, world map 3×2, right rail (wins/badges/daily)
  - Home hub mobile: 390px phone, sticky bottom nav (5 items), node horizontal strip, vertical quest list, worlds/quests/wins tab screens
  - Quickstart desktop: 3-step flow (name+avatar / band / world), step indicator (pending/active/done states), complete screen with trophy-spin + reward chips
  - Quickstart mobile: same 3-step flow in phone frame, vertical band/world lists, progress dots at top
  - Returning player desktop: 900px 2-col, 4 return states (same-day/2-day/7-day/30-day comeback with gold banner), star-safe badge on all gap screens
  - Returning player mobile: phone 390px, same 4 states, confetti burst on 30-day tab switch, gold comeback banner full-width
- Notes:
  - Node strip uses horizontal scroll (scrollbar-width:none) on mobile
  - Band selection: 4 options with per-band color schemes (P0 gold / P1 violet / P2 mint / P3 coral)
  - 30-day comeback state: gold (#ffd166) border/accent overrides throughout
  - Star-safe badge omitted on same-day return (no gap = no need for reassurance)
  - World progress locked at 58% / Node 7 across all return states

## Continuing into TASK_BACKLOG.md — items 7–12 next

## Batch 3 — COMPLETE (2026-03-24) · TASK_BACKLOG items 7–12

- Files created:
  - `child-avatar-selection-grid-v3.html`
  - `child-band-selection-grid-v3.html`
  - `child-pin-entry-pad-v3.html`
  - `child-pin-wrong-state-v3.html`
  - `child-pin-lockout-state-v2.html`
  - `child-welcome-back-banner-v2.html`
- States covered:
  - Avatar grid: 4×4 grid (16 avatars with names), default/selected/category-filter states, preview strip on selection, live JS single-select
  - Band selection: 2×2 desktop grid, per-band gradient + color scheme, compare table (ages/reading/math/voice), default/selected/compare tabs
  - PIN entry: empty/partial (2 dots)/full (4 dots auto-submit) states, 3×4 numpad with letter sub-labels, backspace
  - PIN wrong: 3 escalating wrong states (friendly/amber warning/red final warning), shake animation on dots, sad mascot wobble
  - PIN lockout: cooldown (SVG countdown ring, 60s)/parent-required/unlocked states; "short break" language not "lockout"
  - Welcome-back banner: 4 return-type variants (same-day/2-day/7-day/30-day), desktop full-width + mobile compact strip, dismiss ✕
- Notes:
  - PIN wrong uses "that wasn't it" not "wrong PIN" — no shame framing
  - Lockout uses "short break" language to child; "safety" framing for parent
  - Star-safe badge on all gap/lockout screens; omitted same-day
  - Band compare table gives parent-accessible context without grade labels
  - Welcome-back banner 30-day has CSS gold pulse box-shadow animation
  - Avatar names are character names (Flutter, Leo, Sparks…) not child's real name

## Continuing into TASK_BACKLOG.md — items 13–18 next

## Batch 4 — COMPLETE (2026-03-24) · TASK_BACKLOG items 13–18

- Files created:
  - `child-progress-map-desktop-v3.html`
  - `child-progress-map-mobile-v3.html`
  - `child-badge-collection-desktop-v3.html`
  - `child-badge-collection-mobile-v3.html`
  - `child-reward-cabinet-v2.html`
  - `child-streak-panel-v2.html`
- States covered:
  - Progress map desktop: 4-world horizontal node path, done/active/locked node states, green connectors, boss node (gold), stats overview
  - Progress map mobile: same worlds as horizontal-scroll strips, 52px nodes, star counts below, world progress bars in stats tab
  - Badge collection desktop: 4 tabs (all/detail/locked), category filter, 15 badges (3 earned / 12 locked), float animations, NEW dot, progress bars on close-to-unlock badges
  - Badge collection mobile: 3-col grid, new-earned overlay cards, category scroll, progress tab with detailed progress bars
  - Reward cabinet: 4 shelves (stars/badges/trophies/worlds), star milestone progress bar (10/25/50/100/200★), item float animations, milestone rewards view
  - Streak panel: 4 states (active 5-day / long 21-day / broken / restored), weekly dot display, milestone chips, streak shield info, "Day 1 fresh start" celebration on restore
- Notes:
  - Progress map: no accuracy % anywhere, stars only (1–3⭐ per node)
  - Badge broken state language: "paused" not "broken" — no shame framing
  - Streak broken shows best previous streak as aspirational, not as failure reminder
  - Reward cabinet explicitly says "stays here forever" — permanence reinforced
  - Badge progress on locked items is forward-looking ("8 more to go!")
  - 30-day combo badge on long streak view: gold theme, not amber

## Continuing into TASK_BACKLOG.md — items 19–24 next

## Batch 5 — COMPLETE (2026-03-24) · TASK_BACKLOG items 19–24

- Files created:
  - `child-trophy-wall-v2.html`
  - `child-world-journey-desktop-v3.html`
  - `child-world-journey-mobile-v3.html`
  - `child-resume-session-modal-v2.html`
  - `child-missed-days-return-card-v2.html`
  - `child-theme-picker-v2.html`
- States covered:
  - Trophy wall: 4-tab (Wall/All/Detail/Spec), shelf row with gold/silver/bronze cups, trophy-bob float animation, locked silhouettes 35% opacity, detail card
  - World journey desktop: 1100px 2-col (280px sticky left + 1fr map), 3 zone sections (Foundation/Adventure/Final Boss), node types done/active/locked/boss, quest strip below active zone, boss card, world complete with trophy + reward chips
  - World journey mobile: 390px phone, horizontal-scroll zone node rows, active quest card expands inline, boss full-width CTA card, world complete screen with chip animations
  - Resume session modal: 440px centered overlay, 3 states (resume same quest / resume new quest / mid-quest interrupted), progress bar, last-session strip, quest preview, star-safe badge always shown, mid-quest progress dots animation
  - Missed days return card: inline card component (desktop 520px + mobile phone column), 3 gap variants (2-day amber / 7-day mint / 30-day gold), week bar with played/gap/today dots, star-safe badge with explicit count, streak restore offer on 7-day, gold pulse animation on 30-day
  - Theme picker: 1000px 2-col (preview pane + 320px picker), 6 themes (Cosmic/Forest/Ocean/Sunset/Candy/Midnight), 6 accent color dots, live preview on swatch click, save confirmation chip
- Notes:
  - World journey: no accuracy % anywhere, stars per node shown (1–3⭐), star-safe badge in left panel at all times
  - Boss node: gold #ffd166 theme, unlock trigger = all Adventure zone nodes complete
  - Resume modal: "Restart Quest (keep stars)" — restart never loses stars, label must say so
  - Missed days: "Away" label on gap days (not red, not "missed"). "Been a couple of days" not "you missed 2 days"
  - 30-day comeback: gold pulse box-shadow animation, +2⭐ +100XP + Legend Badge chip
  - Theme picker: no locked themes — all 6 free, pure cosmetic, no impact on stars/progress

## Continuing into TASK_BACKLOG.md — items 25–30 next

## Batch 6 — COMPLETE (2026-03-24) · TASK_BACKLOG items 25–30

- Files created:
  - `child-interest-capture-v2.html`
  - `child-voice-preferences-v2.html`
  - `child-profile-card-v2.html`
  - `child-quest-selector-v2.html`
  - `child-skill-preview-cards-v2.html`
  - `child-home-empty-state-v2.html`
- States covered:
  - Interest capture: 390px phone, 5 states (empty/partial 3/max 5/complete/spec), 3×4 grid of 12 interest cards, checkmark badge, chip-pop complete screen
  - Voice preferences: 4 voice characters (Coach Leo/Buddy/Whisper/Zap), ▶ Try preview button, wave-bars animation on playing, speed row (Slow/Normal/Fast), 3 audio toggles
  - Profile card: reusable 380px card, hero with avatar+band+world, 4-stat row, active world progress bar, badge preview, streak row, band-color variants (all 4 bands)
  - Quest selector: phone, 4 quest states per card (done/active/locked/new), node context header, star-safe replay badge, bottom CTA changes per state, node-complete celebration
  - Skill preview cards: desktop auto-fill grid, child-friendly skill names (no skill IDs), section separators (done/up-next), card-pop animation staggered, detail view 2-col with related panel
  - Home empty state: 4 states (brand-new/has-avatar-band/loading-skeleton/all-worlds-complete), twinkling star-field CSS, mascot-float, world picker strip, shimmer skeleton, gold trophy celebration
- Notes:
  - Interest capture: skip link always visible, 5-card max dims remaining cards to 40% opacity
  - Voice preferences: no locked voices, all 4 always available
  - Profile card: no accuracy %, no grade labels, band shown as "K–1 Explorer" not "Grade 1"
  - Quest selector: done quests always replayable with "Stars are safe!" label
  - Skill cards: child-friendly names ("Find the Word!" not "Word Recognition"), no skill IDs in child view
  - Home empty: "Stars are yours to keep forever" promise on brand-new state; all-worlds-complete never dead-ends ("New Adventures Coming!")

## Continuing into TASK_BACKLOG.md — items 31–36 next

## Batch 7 — COMPLETE (2026-03-24) · TASK_BACKLOG items 31–36

- Files created:
  - `play-session-shell-desktop-v3.html`
  - `play-session-shell-tablet-v3.html`
  - `play-session-shell-mobile-v3.html`
  - `play-prereader-counting-scene-v3.html`
  - `play-prereader-letter-scene-v3.html`
  - `play-prereader-sound-scene-v3.html`
- States covered:
  - Play shell desktop: 1100px, top bar / (question zone + 320px right rail) / bottom bar, 4 tabs (active/correct/wrong/spec), mascot coach with mc-bounce, star-safe badge in rail, shake animation on wrong, "Not quite — give it another try!" language
  - Play shell tablet: 768px, 28px border-radius frame, 260px rail, same 2-col layout at smaller scale, 3 tabs (active/correct/spec)
  - Play shell mobile: 390px, single-column, segment-bar progress strip (not dots), coach inline above answer grid, bottom 3 buttons flex:1 (Replay/Hint/IDK yet), 4 tabs (active/correct/wrong/spec)
  - Counting scene: Pre-K gold theme, 5× 60px emoji tiles with obj-pop staggered animation, 4 number answer buttons, correct state highlights tiles + shows 80px count-display, wrong = "Touch each star and count — you can do it!"
  - Letter scene: Pre-K gold, 160px letter hero with letter-glow pulse, 4-up picture grid with emoji+word, phonics "Buh-buh-buh!" coach format, correct = letter turns green + matching card green + others 35% opacity
  - Sound scene: Pre-K gold, 160px circle audio-pulse hero button, 7 wave-bars with wave-dance keyframe, letter choices 50% opacity during playback, correct = button green + phoneme text "BUH-BUH-BUH!" + bars green
- Notes:
  - No timer anywhere on any play scene — critical rule
  - No accuracy % — stars only, never performance percentages
  - Mobile play shell uses segment bars (flex:1) for progress strip — better than dots at 390px narrow width
  - Pre-K scenes all use gold (#ffd166) theme to be visually distinct from K-1 violet (#9b72ff)
  - Star-safe badge visible at all times in right rail (desktop/tablet) and inline (mobile) — stars never decrease on wrong answer
  - Wrong answer language standardized: "Not quite — give it another try!" / "That wasn't it" — never "Wrong!"
  - Sound scene: letter choices non-interactive (cursor:default) during audio playback — user must listen before responding

## Continuing into TASK_BACKLOG.md — items 37–42 next

## Batch 8 — COMPLETE (2026-03-24) · TASK_BACKLOG items 37–42

- Files created:
  - `play-prereader-shapes-scene-v3.html`
  - `play-prereader-picture-word-scene-v3.html`
  - `play-k1-phonics-scene-v3.html`
  - `play-k1-first-words-scene-v3.html`
  - `play-k1-simple-math-scene-v3.html`
  - `play-grade23-math-scene-v2.html`
- States covered:
  - Shapes scene: Pre-K gold, 2×2 SVG shape choice grid (circle/triangle/square/star), shape hero with letter-glow pulse, correct dims others + green border, wrong = "Run your finger around it!"
  - Picture-word scene: Pre-K gold, large emoji picture hero, 2×2 word buttons (word text + small emoji scaffold), child reads word and matches to picture; wrong = "Say the name out loud!"
  - K-1 phonics: Violet theme, emoji hero with word label + violet-glow, 2×2 letter choice buttons with phoneme label (buh/sss/duh/rrr), beginning-sound identification
  - K-1 first words: Violet, wide 280×120px word-only hero (no picture cue), 2×2 picture+label answer cards, tests actual word decoding not phonics
  - K-1 simple math: Violet, equation display with 2 emoji object groups + count labels, obj-pop animated objects, 4 number answer buttons (70px), addition only sum ≤10
  - G2-3 math: Mint (#58e8c1) theme, large 3.5rem equation, array visual hint (toggle via 💡), skip-count strip auto-revealed after wrong, 4 answer buttons (1.8rem), ×2–×5 multiplication
- Notes:
  - Pre-K scenes (items 37–38) continue gold theme to match counting/letter/sound/shapes suite
  - K-1 scenes (items 39–41) use violet theme — distinct from Pre-K gold and G2-3 mint
  - G2-3 math (item 42) uses mint (#58e8c1) — first mint-themed play scene
  - Band color cascade: Pre-K=gold, K-1=violet, G2-3=mint, G4-5=coral (not yet built)
  - Shapes scene: SVG shapes inline (no external assets) — circle/triangle/square/star
  - First words scene: word hero intentionally has NO picture cue — tests decoding not picture recognition
  - G2-3 math: hint system uses two distinct scaffolds (array=conceptual, skip-count=procedural) — auto-shown after wrong answer
  - Skip-count strip highlights target number in solid mint, future items fade to 40% opacity
  - No timer on any play scene. No accuracy % anywhere.

## Continuing into TASK_BACKLOG.md — items 43–48 next

## Batch 9 — COMPLETE (2026-03-24) · TASK_BACKLOG items 43–48

- Files created:
  - `play-grade23-reading-scene-v2.html`
  - `play-grade45-math-scene-v2.html`
  - `play-grade45-reading-scene-v2.html`
  - `play-answer-cards-desktop-v3.html`
  - `play-answer-cards-mobile-v3.html`
  - `play-correct-state-v3.html`
- States covered:
  - G2-3 reading: Mint, 3–5 sentence passage with key sentence highlighted (mint bg), literal comprehension question, 4 sentence-length choices, "📖 Re-read" replaces Replay, slide-in animation for choices, correct state adds stronger green highlight + passage border turns green
  - G4-5 math: Coral, multi-step word problem + 2-step breakdown panel (step numbers, labels, results), hint system reveals step 1 after wrong answer, 4 answer buttons 1.5rem, wrong banner targets specific step
  - G4-5 reading: Coral, inference-level questions (not literal), question type badge (🔍 Inference), correct state shows evidence explanation box ("📌 Evidence" + why the answer is correct), clue sentences highlighted with coral tint
  - Answer cards desktop: 5-tab component library — default 2×2/list/row layouts, all states (default/correct/wrong/dimmed), band color variants (prek/k1/g23/g45), 6 size classes (standard/large/compact/wide/letter/numeral)
  - Answer cards mobile: 5-tab mobile library — no hover (uses :active opacity), -webkit-tap-highlight-color: transparent, inline .ac-check div (not ::after), touch targets all ≥44px, tighter padding/smaller fonts
  - Correct state: 6 tabs — Pre-K gold / K-1 violet / G2-3 mint / G4-5 coral / overlay burst / spec; star counter bumps with spring animation; star bonus chip pops in; optional overlay with burst-ring animation for special moments
- Notes:
  - G2-3 reading: answer choices use slide-in animation (translateX) not scale — better for text blocks
  - G4-5 reading: evidence explanation box is unique to G4-5 — teaches inference reasoning, not just confirms correct
  - G2-3 and G4-5 reading: "📖 Re-read" button replaces "🔊 Replay" — text-primary scenes
  - Answer cards: wrong state leaves other choices active (retry allowed); only correct state triggers dimming
  - Answer cards mobile: checkmark uses div child not CSS ::after for better mobile browser rendering reliability
  - Correct state overlay: NOT shown on every correct answer — reserved for special moments (boss node, streak milestone)
  - Band theme cascade complete: Pre-K=gold, K-1=violet, G2-3=mint, G4-5=coral (all 4 bands now built in play scenes)

## Continuing into TASK_BACKLOG.md — items 49–54 next

## Batch 10 — COMPLETE (2026-03-24) · TASK_BACKLOG items 49–54

- Files created:
  - `play-wrong-state-gentle-v3.html`
  - `play-i-dont-know-yet-state-v2.html`
  - `play-voice-coach-overlay-v3.html`
  - `play-voice-replay-controls-v3.html`
  - `play-no-audio-fallback-v2.html`
  - `play-explainer-panel-v3.html`
- States covered:
  - Wrong state gentle: 5 tabs (Pre-K/K-1/G2-3/G4-5/Spec); banner = icon + coral headline + actionable hint; forbidden language documented (no "Wrong!", "Incorrect!", "Oops!"); `.wrong-card` class + `ac-shake`; small inline coach gives complementary angle; G2-3/G4-5 use "📖 Re-read"
  - IDK state: 4 tabs (IDK Response/Hint Shown/Got It After IDK/Spec); "Yet" non-negotiable in label; warm purple `#c9a8ff` bg (NOT red); zero star penalty; post-IDK correct = "You figured it out — and earned a star!"; IDK button dims after hint (max scaffolding reached)
  - Voice coach overlay: 5 tabs (Idle/Speaking/Celebration/Wrong Support/Spec); bottom sheet; 56px avatar + speech bubble + 5 wave bars; cards 35% opacity during speech; 4 personas (Leo/Buddy/Whisper/Zap); auto-dismisses when TTS ends; violet border (not red) on wrong support
  - Voice replay controls: 5 tabs (Default/Playing/Slow Mode/Band Variants/Spec); `replay-pulse` ring + `replay-shimmer` overlay during play; slow mode hidden until 2+ replays; adaptive suggestion banner after 2nd consecutive replay; Pre-K removes Hint button; G2-3/G4-5 replace Replay with "📖 Re-read"
  - No audio fallback: 4 tabs (Audio Error/Muted Device/Low Bandwidth/Spec); amber `#f0a020` warnings (not red); text question card replaces audio hero in visual-only mode; muted device = non-blocking banner; low bandwidth = animated loading bar + skip link; child never sees technical error messages
  - Explainer panel: 5 tabs (K-1 First Time/K-1 Reviewing/Pre-K Variant/G2-3 G4-5/Spec); bottom sheet ~55–65% height; full panel on first encounter, abbreviated on encounters 2–3, stops at 4+; drag handle cosmetic; scrim above (0.55 full / 0.30 abbreviated); band color tokens for border-top + step circles + CTA gradient; Pre-K simplified language (Look/Find/Tap)
- Notes:
  - IDK "Yet" framing is architecturally significant — encodes growth mindset, never negotiable
  - Audio fallback: amber not red — intentional; audio failure is minor/recoverable, not alarming
  - Voice coach overlay: auto-dismiss when TTS ends; do NOT dismiss mid-speech on card tap
  - Replay controls: slow mode adaptive (hidden by default, appears after 2+ replays without answering)
  - Explainer panel: full sheet has Skip link; abbreviated sheet has no Skip (short enough)
  - Explainer panel: same sheet structure across all 4 bands — only color tokens + content change

## Continuing into TASK_BACKLOG.md — items 55–60 next

## Batch 11 — COMPLETE (2026-03-24) · TASK_BACKLOG items 55–60

- Files created:
  - `play-explainer-video-state-v2.html`
  - `play-explainer-voice-state-v2.html`
  - `play-recovery-flow-v3.html`
  - `play-support-hint-bar-v2.html`
  - `play-progress-strip-v3.html`
  - `play-reward-pulse-overlay-v3.html`
- States covered:
  - Explainer video: 5 tabs (Loading/Playing/Paused/Ended/Spec); skeleton+spinner during load; progress bar 4px top of video; wave bars during playing; mute badge + timestamp; "Got it!" gated until ended or skip; "Watch again" in ended state; fallback to text panel on video error
  - Explainer voice: 5 tabs (Idle/Speaking/Done/Audio Blocked/Spec); coach avatar idle-ring pulse → spinning ring during TTS; step-by-step highlight (done-step green / active-step violet / upcoming dim); wave bars in speech bubble during Speaking; "Got it!" gated until speech ends; amber blocked banner when browser autoplay blocked; fallback chain: video → voice → text panel → abbreviated → none
  - Recovery flow: 5 tabs (Struggling/Coach Support/Simpler Q/Breakthrough/Spec); recovery offered after 2nd wrong; coach hint after accepting; simpler Q (4→2 choices) after 3rd wrong; breakthrough = bigger celebration than normal correct; star-safe throughout; forbidden language documented (no shame, no "finally")
  - Support hint bar: 5 tabs (Default/Hint Shown/Pre-K/Band Variants/Spec); 3-button row (Replay flex:2 / Hint flex:1 / IDK flex:1); hint panel slides in above row; Hint + IDK dim after use; Replay never dims; Pre-K = 2 buttons only (no Hint); G2-3/G4-5 = "📖 Re-read" replaces Replay; IDK "yet" non-negotiable
  - Progress strip: 5 tabs (Default/States/Boss Node/Band Variants/Spec); 5 segs height:6px gap:4px; filled = attempted (no red segs — star-safe); current seg pulses; boss node: last seg ⭐ ::after pip + gold fill on complete; fill animation scaleX; star counter top-right with bump animation
  - Reward pulse overlay: 5 tabs (Boss/Streak5/Session Bonus/Star Milestone/Spec); NOT shown on every correct — reserved for boss/streak/milestone; auto-dismiss 2.5s + safety cap 3s; tap-to-dismiss; boss = +2⭐ + gold burst; streak5 = flame + violet burst; session = confetti; milestone = level badge + XP bar fill; coach speech bubble only (no TTS during overlay)
- Notes:
  - Explainer fallback chain: video → voice TTS → silent text panel → abbreviated → none (4th+ session)
  - Recovery simpler Q: same skill, reduced cognitive load (fewer choices, add picture cue, phoneme hint inline)
  - Support hint bar: amber adaptive banner for slow mode appears after 2+ replays without answering
  - Progress strip: filled = attempted (correct OR wrong) — never red segments anywhere
  - Boss node: ~20% of sessions; last seg always fills gold on completion regardless of band color
  - Reward overlay: boss = +2 ⭐ (double); streak5 chip = motivational only (still +1 ⭐); no TTS during overlay

## Continuing into TASK_BACKLOG.md — items 61–66 next

## Batch 12 — COMPLETE (2026-03-24) · TASK_BACKLOG items 61–66

- Files created:
  - `play-level-up-overlay-v2.html`
  - `play-badge-earned-overlay-v2.html`
  - `play-session-complete-desktop-v3.html` (rebuilt with 5-tab spec)
  - `play-session-complete-mobile-v3.html`
  - `play-next-session-prompt-v2.html`
  - `play-pause-sheet-v2.html`
- States covered:
  - Level-up overlay: 4 tabs (Entry Animation/Perks Panel/Band Variants/Spec); badge drop spring animation; XP bar surge to 100% then resets to new-level start; particle field floating up; perks panel shows 2–3 unlock cards; level name system per band (Seedling/Bloomer→Champion)
  - Badge earned overlay: 4 tabs (Badge Reveal/Detail/Gallery/Spec); 3D flip animation (rotateY 90°→0); 4 rarity tiers (Common/Rare/Epic/Legendary with serial numbers); badge detail shows name/description/stats; 3×3 gallery grid with locked dims + new-badge gold pip
  - Session complete desktop: 5 tabs (Normal/Perfect/With Badge/Star-Safe Replay/Spec); 2-col grid 1fr+380px; segs 8px; perfect = gold segs + perfect badge + gold CTA; badge earned = highlighted stat row + "See Your Badge" CTA; star-safe replay overlay; never shows accuracy %
  - Session complete mobile: 4 tabs (Normal/Perfect/Band Variants/Spec); single column; stat chips as horizontal-scroll row (not vertical list); full-width stacked CTAs; phone frame 390×700; all 4 band themes shown
  - Next session prompt: 4 tabs (Same Day Bonus/Daily Limit/Tomorrow Teaser/Spec); bonus chip "+1 ⭐ for playing again today!"; daily limit default 3 sessions (parent-configurable); warm "See you tomorrow!" not guilt-trip; tomorrow teaser previews next skill; star-safe message always shown at close
  - Pause sheet: 4 tabs (Child Pause/Parent Pause/Quit Confirm/Spec); bottom sheet ~40-55% height; progress auto-saved before sheet opens; star-safe chip ("⭐ N stars safe!"); child: Resume primary + Leave danger + Parent access ghost; parent: extra section (End session/Adjust limit/Settings); quit confirm: "Stay and play!" primary, "Leave" muted — intentionally pushes staying
- Notes:
  - Level-up overlay: queued to show AFTER session-complete screen, never mid-session
  - Badge flip: perspective: 600px on container — must be on parent not on badge itself
  - Session complete: desktop file was rebuilt with 5-tab structure (previously had 4 tabs from Batch 1)
  - Pause sheet: auto-save fires BEFORE sheet opens — stars credited even on force-quit
  - "Leave" button is always less prominent than "Resume/Stay" — intentional UX hierarchy
  - Never shows accuracy % on any session complete screen — stars only

## Continuing into TASK_BACKLOG.md — items 67–72 next

## Batch 13 — COMPLETE (2026-03-24) · TASK_BACKLOG items 67–72

- Files created:
  - `play-resume-sheet-v2.html`
  - `play-low-confidence-retry-v2.html`
  - `play-session-history-preview-v2.html`
  - `play-visual-token-library-v2.html`
  - `parent-entry-desktop-v3.html`
  - `parent-entry-mobile-v3.html`
- States covered:
  - Resume sheet: 4 tabs (Same Day/Next Day/Stale Session/Spec); Same Day (<2h)=resume primary, question preview; Next Day (2h–48h)=resume primary + equal fresh-start secondary; Stale (3+ days)=fresh-start shifts to primary; Old (7+ days)=fresh-start only; question preview shows qp-emoji + Q# + skill + band; stars always kept regardless of staleness
  - Low confidence retry: 4 tabs (Skill Review/In Practice/Practice Done/Spec); confidence 0–100, <30% triggers offer at session START; always opt-in; 3 practice Qs (Q1=2 choices, Q2=4 choices, Q3=4 harder); confidence meter bar with gradient (low=coral→gold, medium=gold→violet, high=mint→violet); dot progress in topbar; before/after comparison bar on done screen; % never shown to child (bar only)
  - Session history preview: 4 tabs (History Strip/Session Detail/Empty State/Spec); horizontal scroll strip (130px cards, no scrollbar); session card = band dot + skill name + star delta + relative date + perfect pip; all-time star total motivator row; expanded detail inline (not new screen); privacy rule: child view celebratory only, never shows wrong-answer count or accuracy %
  - Visual token library: 5 tabs (Colors/Typography/Spacing/Animation/Spec); canonical reference for all WonderQuest design tokens; live animation demos for all keyframes (star-bump/badge-flip/badge-drop/burst-ring/seg-pulse/obj-pop/wave-dance/xp-surge/seg-fill/skel-shimmer/idle-ring/slide-hint/p-float); CSS custom property reference block; XP thresholds table; badge rarity table; engineering hint box pattern documented
  - Parent entry desktop: 5 tabs (Sign-In/Returning Parent/Create Account/Verification/Spec); #f5f0e8 warm cream bg (NOT child dark theme); 2-col hero+card layout max-width 1100px; parent portal tone = calm/trusted/professional; trust badges (COPPA/No ads/No data sold); PIN numpad for returning parent; 3-step create flow with step indicator; 6-digit OTP verification; COPPA note always shown
  - Parent entry mobile: 5 tabs (Sign-In/PIN/Create/Verify/Spec); phone frame 390px; single column; PIN numpad bottom-anchored fills viewport; OTP auto-advances boxes; step progress bar 4px; abbreviated hero (no benefit list on mobile); same auth rules as desktop
- Notes:
  - Visual token library is a pure reference file — no play logic, no phone frame, dark bg #0c0920 with visible code blocks
  - Parent entry is the FIRST parent-facing screen in the build — brand new design language shift: #f5f0e8, system-ui font (not Nunito), white cards, professional layout
  - Parent entry mobile PIN numpad: nk.active uses background dim, NOT outline — avoids double-border on tap
  - Returning parent shows saved avatar + PIN (or biometric) to skip full email/password re-entry
  - Desktop create: 3-step flow; Step 1=details; Step 2=email verify (OTP); Step 3=add first child (link child flow = item 73)
  - After entry success: new parent → parent-link-child-flow-v3.html (item 73); returning parent → family dashboard (item 75)

## Continuing into TASK_BACKLOG.md — items 73–78 next

## Batch 14 — COMPLETE (2026-03-24) · TASK_BACKLOG items 73–78

- Files created:
  - `parent-link-child-flow-v3.html`
  - `parent-linking-recovery-v3.html`
  - `parent-family-dashboard-desktop-v3.html` (rebuilt — was from Batch 1)
  - `parent-family-dashboard-mobile-v3.html`
  - `parent-weekly-report-desktop-v3.html`
  - `parent-weekly-report-mobile-v3.html`
- States covered:
  - Link child flow: 5 tabs (Child Details/Grade-Age/Goals/Confirm/Spec); 3-step progress bar; first name only (no surname/DOB — COPPA); avatar grid (8 emoji options); auto-select band from age/grade; daily session limit chips (1/2/3/4/unlimited); focus area grid (Reading/Math/Spelling/Vocabulary); notification checkboxes; confirmation card before submit; free plan = 1 child (upgrade to add more)
  - Linking recovery: 5 tabs (Already Linked/Duplicate Name/Plan Limit/Network Error/Spec); neutral non-accusatory framing ("It looks like…"); already-linked → send join request; duplicate → rename/nickname; plan limit → warm upgrade card (Family plan); network error → retry with safe-to-retry confirmation, error code in detail box
  - Family dashboard desktop: 5 tabs (Overview/Multi-Child/Notifications/Settings/Spec); 240px sidebar + main content (max-width 900px); child hero card (3-col: avatar/info/CTAs); 4-col quick stats; 2-col section (skills + streak/activity); multi-child grid with add-child dashed card; notification list with unread dots; toggle settings (on/off); NO accuracy % on dashboard overview — stars only
  - Family dashboard mobile: 5 tabs (Home/Multi/Notifs/Settings/Spec); 390px phone frame; bottom nav (5 items); horizontal-scroll stat chips; vertical skills list; streak card (dark gradient); activity card; multi-child with child mini-cards + add-child; bottom nav badge (notifs)
  - Weekly report desktop: 5 tabs (Full Report/Skills/Habits/Suggestions/Spec); ACCURACY % SHOWN HERE (parent context — the only place); skill mastery table with %, delta, status (Strong/Building/Just started); session log with date/stars/skills/duration/perfect flag; sessions-per-day bar chart; time-of-day breakdown; 3 concrete at-home suggestions tied to skill gaps; export (PDF/Email)
  - Weekly report mobile: 4 tabs (Overview/Skills/Suggestions/Spec); horizontal-scroll stat chips; skill items as vertical bars; sessions as cards; habits omitted on mobile; PDF button in header
- Notes:
  - parent-family-dashboard-desktop-v3.html existed from Batch 1 — rebuilt with 5-tab structure including multi-child, notifications, and settings tabs
  - Link child flow: "yet" on IDK button applies only to child play. Parent forms use system-ui (not Nunito).
  - Plan limit in linking recovery uses same upgrade card pattern as plan limit in settings
  - Weekly report is the ONLY place accuracy % is shown to parent. Child screens: stars only, always.
  - Dashboard overview: down arrows NOT shown. Weekly report: down arrows OK (full context with explanation)
  - Support tip wording: "Building toward" not "struggling with". "Support tip" not "weakness". Always specific and actionable.

## Continuing into TASK_BACKLOG.md — items 79–84 next

## Batch 15 — COMPLETE (2026-03-24)

- Files created:
  - `parent-notification-center-desktop-v3.html` (item 79)
  - `parent-notification-center-mobile-v3.html` (item 80)
  - `parent-child-switcher-v3.html` (item 81)
  - `parent-linked-child-sheet-v2.html` (item 82)
  - `parent-linked-child-empty-v2.html` (item 83)
  - `parent-wrong-child-recovery-v2.html` (item 84)

- States covered:
  - Notification center: grouped by day (Today/This week/Older), 6 types, filter chips, unread dot, settings toggles, empty state — desktop (5 tabs) and mobile (4 tabs)
  - Child switcher: desktop dropdown + mobile bottom sheet; trigger button pattern (avatar+name+band+caret); switching reloads entire dashboard (NOT comparison view)
  - Linked child sheet: bottom sheet (mobile) + modal (desktop); child stats strip (stars/sessions/streak); 4 action rows; 2-step unlink confirmation with data-safe guarantee
  - Linked child empty: fresh-account variant (welcoming tone) + post-removal variant (reassuring tone); disabled nav items; post-removal toast; plan limit note
  - Wrong child recovery: 3 scenarios — (A) no sessions (easy update), (B) sessions exist (support transfer option), (C) same child new device (re-authorise); always non-accusatory; data-safe guarantee shown in all scenarios

- Engineering notes:
  - Notification defaults: Badge ON / Level-up ON / Weekly report ON; Session complete OFF / Streak OFF / Inactivity OFF
  - Child switcher: max-height 320px with overflow-y:auto for 4+ children; "Add another child" always pinned at footer
  - Unlink: 2-step confirm required; copy always says "progress data is never deleted"; after removal dashboard shows empty state + toast
  - Wrong child recovery: tone rule enforced — "It looks like…" not "You made a mistake"; escape option ("Keep [name] — this is correct") always present
  - Privacy: stars/sessions/streak shown in child sheet; accuracy % NEVER shown in sheet (weekly report only)

## Continuing into TASK_BACKLOG.md — items 85–90 next

## Batch 16 — COMPLETE (2026-03-24)

- Files created:
  - `parent-time-spent-card-v2.html` (item 85)
  - `parent-effective-time-card-v2.html` (item 86)
  - `parent-strengths-card-v2.html` (item 87)
  - `parent-support-areas-card-v2.html` (item 88)
  - `parent-next-action-card-v2.html` (item 89)
  - `parent-activity-feed-v2.html` (item 90)

- States covered:
  - Time spent: standard/data-states/compact; bar chart (Mon–Sun) with colour coding; week-over-week delta; subject breakdown pills; sparkline
  - Effective time: donut chart (conic-gradient CSS) + horizontal breakdown bars; low-engagement state with supportive framing; 4-week comparison variant; explainer panel
  - Strengths: top 3 skills with mastery bars + stars (NOT accuracy %); 1-strength and empty (🌱) states
  - Support areas: "Building toward" framing (never "weakness"); gold/coral mastery bars; support tips as at-home activity suggestions; empty state = "🎉 All skills strong"
  - Next action: 3 priority levels (high/medium/low); action types (streak-at-risk, report-ready, badge-earned, level-up, focus-area-suggestion); "Maybe later" always available; all-clear state
  - Activity feed: day-grouped feed; 6 event types; privacy filter (wrong_answer / hint_request / accuracy_data all hidden); skeleton loader; empty state; load-more pagination

- Engineering notes:
  - Time-spent card: no timer during play — duration recorded server-side at session end. Format as "Xh Ym" for >=60min.
  - Effective time formula: effective = total − idle − hint_overflow. Donut conic-gradient CSS, no canvas.
  - Strengths qualification: mastery_score >= 70 AND sessions >= 2 AND delta >= 0. Max 3.
  - Support areas qualification: mastery_score < 65 OR (delta < 0 AND mastery < 75). Max 3. Prohibited words: weakness, struggling, failing, accuracy %.
  - Activity feed: visible_to_parent flag on child_events table. wrong_answer / hint_request events are ALWAYS hidden.
  - Next-action card: all actions are optional; "Maybe later" dismiss on every suggestion.

## Continuing into TASK_BACKLOG.md — items 91–96 next

## Batch 17 — COMPLETE (2026-03-24)

- Files created:
  - `parent-practice-planner-v2.html` (item 91)
  - `parent-home-practice-planner-v3.html` (item 92)
  - `parent-skill-detail-desktop-v3.html` (item 93)
  - `parent-skill-detail-mobile-v3.html` (item 94)
  - `parent-quiet-hours-settings-v2.html` (item 95)
  - `parent-account-manager-v2.html` (item 96)

- States covered:
  - Practice planner: weekly day picker, session-per-day stepper, time-of-day chips, reminder toggles, saved confirmation, default state; Free plan cap (3 sessions)
  - Home practice planner: offline at-home activity suggestions per support area; checklist; filter chips; empty state (all skills strong); distinguished from in-app practice planner
  - Skill detail desktop: strong skill view + building skill view; breadcrumb nav; 4-stat row; mastery bar; 5-week sparkline; session log with perfect-session flag; support tip / celebrate card; related skills
  - Skill detail mobile: same data, different layout — horizontal-scroll stat chips, stacked sparkline, session log as rows, back button header
  - Quiet hours: two controls (notification quiet vs session-start quiet); timeline visualisation; day picker; child-facing "Bedtime mode" blocked screen (dark WonderQuest theme); COPPA note (not a device lock)
  - Account manager: profile/email/password/role; subscription plan (free vs family variants); linked devices; 2FA/security; child profile PIN; data export (GDPR/CCPA); delete account with 2-step confirm + 90-day grace period

- Engineering notes:
  - Practice planner vs home practice planner: clearly distinguished in spec. Practice planner = in-app session schedule. Home planner = offline activity suggestions.
  - Session quiet hours: sessions in progress when quiet hours begin MUST be allowed to complete. Only block new starts.
  - Perfect session flag: shown as ⭐ badge — NEVER as "100%". Stars language maintained in parent skill detail.
  - Skill detail: accuracy % STILL not shown here (weekly report skills table only). mastery shown as "N/100" bar, not %.
  - Account delete: 2-step (checkbox + password re-entry) + 90-day grace period. Child data follows same window.

## Continuing into TASK_BACKLOG.md — items 97–102 next

## Batch 18 — COMPLETE (2026-03-24)

- Files created:
  - `parent-feedback-drawer-v2.html` (item 97)
  - `parent-benchmark-explainer-v3.html` (item 98)
  - `parent-comparison-card-v2.html` (item 99)
  - `parent-family-summary-rail-v2.html` (item 100)
  - `teacher-home-desktop-v3.html` (item 101)
  - `teacher-home-tablet-v3.html` (item 102)

- States covered:
  - Feedback drawer: desktop slide-in (340px) + mobile bottom sheet + success state; 5 categories (General/Bug/Feature/Content/Privacy); star rating optional; privacy concern routes to dedicated email; COPPA: no child data collected
  - Benchmark explainer: 3 presentation modes — full page card, inline modal (triggered by "?" next to mastery bar), mini tooltip (band chip hover); mastery thresholds (65–100 Strong / 40–64 Building / 0–39 Just started); star-based effort vs accuracy distinction
  - Comparison card: sibling side-by-side snapshot; Family plan only (2+ children); shows stars/sessions/time/streak/strong-skills; NEVER shows accuracy %/mastery scores/rankings; mandatory disclaimer (different bands, not competition)
  - Family summary rail: horizontal scroll (mobile/narrow) + CSS grid (≥860px desktop); one card per child with status dot (green = active today); add card pinned at end; card states (active/inactive/streak-at-risk/no-sessions)
  - Teacher home desktop: NEW Teacher persona (#f0f4f8 bg, #0f172a sidebar, #2563eb accent); class overview (5-stat row, active students, support queue preview, band coverage, skill alerts, week summary); student table (sortable, band/activity filters); support queue (4 trigger types)
  - Teacher home tablet: top nav bar replaces sidebar; stat cards horizontally scrollable; student card grid (3-col) replaces table; collapsed 56px icon rail variant for borderline widths

- Engineering notes:
  - FIRST TEACHER PERSONA FILES (items 101–102). Design tokens distinct from parent (cream) and child (dark purple): bg #f0f4f8 blue-grey, sidebar/topnav #0f172a dark slate, accent #2563eb blue.
  - Teacher top nav (tablet): replaces 240px desktop sidebar. Collapsed rail (56px icons) used at portrait tablet breakpoint (~768px).
  - Comparison card: anti-competitive framing rule — bar chart shows relative activity, not ranking. Disclaimer mandatory at all times.
  - Family summary rail: grid auto-fill min(220px,1fr) on ≥860px; overflow-x scroll on narrower.
  - Teacher support queue triggers: confidence_floor_hit ≥ 3 (amber), absence ≥ 5 days (amber), hint_requests ≥ 5 same skill (amber), band ceiling (blue/positive).
  - FERPA: student first names only in all teacher views. No surname, no parent contact info in teacher portal.

## Continuing into TASK_BACKLOG.md — items 103–108 next

## Batch 19 — COMPLETE (2026-03-24)

- Files created:
  - `teacher-home-mobile-v3.html` (item 103)
  - `teacher-command-center-desktop-v3.html` (item 104)
  - `teacher-command-center-tablet-v3.html` (item 105)
  - `teacher-support-queue-desktop-v3.html` (item 106)
  - `teacher-support-queue-mobile-v3.html` (item 107)
  - `teacher-class-summary-strip-v2.html` (item 108)

- States covered:
  - Teacher home mobile: bottom tab bar (5 items, #0f172a); stat pills horizontal scroll; compact student rows; queue preview + skill alerts; separate queue screen (full list with filter chips)
  - Command center desktop: sidebar + main area; 5-stat row; mini student table (sortable columns, status/queue chips); band coverage bars; support queue preview; week session bar chart; skill alert cards; full roster tab with all 28 students
  - Command center tablet: top nav + sub-nav week selector (This week / Last week / 4 weeks chips); same data as desktop, 2-col grid; horizontally scrollable stat pills; 6-row truncated student table
  - Support queue desktop: left filter panel (trigger type / band / status checkboxes) + right queue list; 4 trigger types (amber: confidence floor / absence / hint pattern; blue: band ceiling); expanded card shows skill-pattern rows + suggested support; privacy note on expanded card; empty state (🎉 All clear!)
  - Support queue mobile: bottom tab; horizontal filter chips; queue cards with primary action + dismiss buttons; expanded detail card with skill rows; empty state
  - Class summary strip: 4 variants — Standard (5-stat grid), Compact (icon row), With Alerts (alert pills scrollable row), Mobile (horizontal scroll tiles); down deltas amber not red; spec with stats definitions and delta colour rules

- Engineering notes:
  - Command center vs home screen: Home = today's snapshot. Command center = week-level analytics + full roster + assignment pipeline + export.
  - Support queue triggers documented: confidence_floor_hit ≥ 3 (amber), absence ≥ 5 days (amber), hint_requests ≥ 5 same skill (amber), band ceiling 2+ weeks (blue/positive).
  - Expanded queue card: skill-category patterns + floor-hit count only. NEVER shows specific questions, exact wrong answers, or accuracy %.
  - Queue auto-resolve: amber items auto-resolve when trigger condition clears (5 days). Band ceiling requires teacher action.
  - Class summary strip: embeddable component, not a standalone page. Alert pills only shown when queue_count > 0 or milestone active.
  - Down delta colours: ALWAYS amber (#f59e0b), NEVER red. Red reserved for system errors only.
  - FERPA maintained: first names only in all teacher screens (home, command center, queue, strip).

## Continuing into TASK_BACKLOG.md — items 109–114 next

## Batch 20 — COMPLETE (2026-03-24)

- Files created:
  - `teacher-band-coverage-card-v2.html` (item 109)
  - `teacher-skill-drilldown-desktop-v3.html` (item 110)
  - `teacher-skill-drilldown-mobile-v3.html` (item 111)
  - `teacher-student-detail-desktop-v3.html` (item 112)
  - `teacher-student-detail-mobile-v3.html` (item 113)
  - `teacher-intervention-detail-desktop-v2.html` (item 114)

- States covered:
  - Band coverage card: standard (horizontal bar per band), expanded (click band → shows students with name/stars/status), wide 4-quadrant grid; band colours P0=gold/P1=violet/P2=mint/P3=coral; first names only (FERPA)
  - Skill drilldown desktop: breadcrumb nav; skill header (name/band/class stats including class-avg accuracy); class distribution (Strong/Building/Just started) bars; student table with mastery N/100 bars + status badges; 4-week session trend; pattern alert note
  - Skill drilldown mobile: same data, single column; stat pills horizontal scroll; back button nav; compact student rows
  - Student detail desktop: profile header (name / band / 4 stats / queue flag); skill list with N/100 bars; session log (skill + stars + perfect badge); week activity bar chart; teacher private note field
  - Student detail mobile: same data stacked; horizontal stat pills; compact skill rows; back button header; bottom tabs
  - Intervention detail desktop: active state (mastery before/after + trend + floor-hit reduction); action checklist (checkable items, private to teacher); timeline of events; resolved state (green header, mastery arc 32→74, celebration note)

- Engineering notes:
  - "Intervention" definition: queue item becomes intervention when teacher logs note or takes action → creates intervention_log record.
  - Intervention states: Active / Improving / Resolved (auto when mastery ≥ 65 + 0 floor hits for 5 days, or teacher marks) / Escalated.
  - Teacher notes: private to teacher (teacher_id + student_id); NOT visible to parent, child, or other teachers.
  - Skill drilldown: class-avg accuracy % shown as aggregate only; NEVER per-student accuracy. Must include disclaimer near accuracy figure.
  - Student detail: session log shows skill name + stars + perfect flag only. No session duration, no accuracy. Perfect = ⭐ badge, never "100%".
  - Band coverage expand: one band open at a time; clicking another collapses previous. Student list shows first name + stars + status dot only.
  - Mastery in student detail: N/100 bar; NEVER as % text. Status labels (Strong/Building/Just started) OK for teacher.
  - FERPA maintained: first name only on all teacher views (band card, skill drilldown, student detail, intervention).
  - Wrong answers: NEVER shown. Pattern-level context only via queue/intervention trigger.

## Continuing into TASK_BACKLOG.md — items 115–120 next

## Batch 21 — COMPLETE (2026-03-24)

- Files created:
  - `teacher-intervention-detail-mobile-v3.html` (item 115)
  - `teacher-intervention-timeline-v3.html` (item 116)
  - `teacher-class-overview-tablet-v3.html` (item 117)
  - `teacher-empty-class-state-v2.html` (item 118)
  - `teacher-filter-bar-v2.html` (item 119)
  - `teacher-recent-wins-panel-v2.html` (item 120)

- States covered:
  - Intervention detail mobile: active (mastery before/after, action plan, timeline, CTA row) + resolved (green header, 32→74 arc) + spec; mobile stat pills; sticky Log note + Mark resolved buttons
  - Intervention timeline: full-history view (distinct from inline timeline on detail page); 5 event types (trigger/teacher_note/mastery_transition/system_adjustment/resolution); timeline connectors; teacher note shown in full; mastery bar comparison; resolved history with all 5 events; retention rule (90 days then anonymise)
  - Class overview tablet: top nav + stat scroll + 2-col grid; distinct from teacher-home-tablet (home=today, overview=weekly); band coverage + queue + active students + skill alerts all visible
  - Empty class state: 3 scenarios — new account (Create class CTA + 3-step onboarding), no students (Add students / import / share invite), no activity today (good morning greeting + yesterday's summary + tip about session timing); never uses "no data" or "error" language
  - Filter bar: desktop inline chip bar (all dimensions); active filter summary chip row (removable chips + clear all); dropdown filter panel (tablet/mobile); mobile horizontal scroll + Filter button; filter dimensions: Band (multi) / Activity / Queue status / Sort
  - Recent wins panel: list panel (right column, up to 5 items); wide grid (2-col cards, analytics page); empty state (🌱 Wins are on the way!); 5 win types (skill_mastered/streak_milestone/band_ceiling/class_star_milestone/class_skill_milestone); deduplication rule (max 1 per student per type per day)

- Engineering notes:
  - Intervention timeline is separate from detail page's inline timeline. Detail = current state; Timeline = full audit history.
  - Intervention timeline retention: 90 days → anonymise student name, delete teacher notes. Stats retained for class analytics.
  - Empty class state: "no activity today" shows YESTERDAY's stats (sessions/stars/queue) so screen is never entirely empty.
  - Filter bar: Band is multi-select; Activity/Queue status/Sort are single-select. Active filters trigger summary chips row.
  - Recent wins: NEVER shows accuracy %, wrong answers, queue flags, or negative signals. Class-level events (N students mastered X) do not name individual students.
  - Deduplication for wins: if student mastered multiple skills today, show as "Bella mastered 3 skills today!" (combined entry).

## Continuing into TASK_BACKLOG.md — items 121–126 next

## Batch 22 — COMPLETE (2026-03-24)

- Files created:
  - `teacher-watchlist-panel-v2.html` (item 121)
  - `teacher-assignment-preview-v2.html` (item 122)
  - `teacher-home-recommendation-card-v2.html` (item 123)
  - `teacher-parent-message-center-v3.html` (item 124)
  - `teacher-class-health-mini-board-v2.html` (item 125)
  - `teacher-session-readiness-banner-v2.html` (item 126)

- States covered:
  - Watchlist panel: 3-tab (Watchlist / Empty State / Spec); manual teacher-curated list distinct from system support queue; max 10 students; name + reason + band chips + View/Remove buttons; Add row at bottom; private to teacher (teacher_watchlist table teacher_id + student_id)
  - Assignment preview: 4-tab (Assignment List / Assignment Detail / Assign New / Spec); 3 assignment types (class-wide / group / individual); soft priority model (adaptive engine retains final say); max 3 active per student; completion auto-triggers on mastery_status→Strong; progress table per assignment
  - Recommendation card: 5-tab (Standard / Compact / Wide Grid / Empty State / Spec); 5 rec types (band_advancement / support_needed / skill_assign / streak_at_risk / class_milestone); priority order: support > advancement > skill > milestone; max 4 shown; 7-day dismissal cooldown; never uses alarming language
  - Parent message center: 4-tab (Inbox / Compose / Announcement / Spec); 2-col layout (thread list + message view); in-platform routing only (no email/phone shared); 4 message templates (progress update / band advancement / check-in / encourage at home); class announcements cannot contain individual student names (FERPA); 2-year retention after class year end
  - Class health mini board: 4-tab (Mini Board / Expanded / Mobile Strip / Spec); 4 health dimensions (engagement / mastery velocity / support queue / streak health); green=good/amber=attention/blue=info — RED NEVER USED; down deltas amber not red; expanded has sparkbars + segment bars; mobile horizontal scroll strip
  - Session readiness banner: 5-tab (Pre-Session / In-Session Live / Post-Session / Mobile / Spec); 3 lifecycle phases; pre=readiness checklist with queue alert + assignment summary; live=WebSocket/30s poll, student count + stars + participation bar; post=session totals + wins highlights (always celebratory); no timer anywhere

- Engineering notes:
  - Watchlist: manual-only, never auto-populated. Teacher removes manually. Max 10; if >10 prompt to review/remove.
  - Assignments: soft priority hints to adaptive engine only. Max 3 per student simultaneously. Auto-complete when mastery_status → Strong on assigned skill.
  - Recommendation card: support_needed recs link to existing queue item — never duplicate queue entry. Dismissed recs suppressed 7 days per rec type per student.
  - Parent messages: platform-routed only. Teacher never sees parent email/phone. Class announcements have server-side validation to catch student names (FERPA).
  - Class health board: Red colour NEVER used — amber is the most urgent. Down deltas text is #f59e0b amber.
  - Session banner: live phase uses active_sessions_now (last_ping_at within 90s). Post-session auto-dismisses after 6 hours. Post-session banner is celebratory only — no queue items shown there.

## Continuing into TASK_BACKLOG.md — items 127–132 next

## Batch 23 — COMPLETE (2026-03-24)

- Files created:
  - `teacher-feedback-panel-v2.html` (item 127)
  - `teacher-mobile-route-shell-v2.html` (item 128)
  - `teacher-class-summary-desktop-v3.html` (item 129)
  - `teacher-intervention-overview-v2.html` (item 130)
  - `owner-home-desktop-v3.html` (item 131)
  - `owner-home-mobile-v3.html` (item 132)

- States covered:
  - Teacher feedback panel: 4-tab (Submit Feedback / My Feedback / Notifications / Spec); 4 feedback types (bug/feature/content/question); severity levels; SLA table; NPS/rating widget (suppressed 14 days after feedback); system notification list with update/maintenance notices; submitted feedback with status tracking
  - Teacher mobile route shell: 5-tab (Shell Home / Back Header / Side Drawer / Route Map / Spec); bottom tab bar (Home/Students/Queue/Messages/More); main header (root routes) vs back header (child routes); side drawer (More tab) with assignments/watchlist/analytics/feedback/settings/sign out; badge system (queue count, unread messages); full route map for all teacher mobile routes
  - Teacher class summary desktop: 3-tab (Class Summary / Weekly Comparison / Spec); full-page analytics (distinct from home=today and command-center=deep ops); week selector chips navigable; 5-stat row with deltas; band distribution + session bar chart; top skills + queue summary; compact student table; 4-week comparison table; PDF export button
  - Intervention overview: 4-tab (Active / Resolved History / Stats / Spec); ALL interventions across class (distinct from queue=open only and detail=single intervention); mastery before/after shown; status chips (Active/Improving/Resolved/Escalated); resolution funnel; trigger distribution pie; avg days to resolve; 90-day retention and anonymisation rule
  - Owner home desktop: 3-tab (Home / With Active Incident / Spec); FIRST OWNER PERSONA FILE — design tokens bg #0d1117, card #161b22, accent #50e890 green, text #f0f6ff; 5-stat row (MAU/MRR/schools/uptime/feedback); 4-card grid (route health/feedback queue/release gate/DAU bar chart); P0 incident variant with red alert banner + degraded route rows
  - Owner home mobile: 3-tab (Home / With P0 Incident / Spec); same data as desktop; phone frame with notch; dark header (#010409); horizontal stat scroll; bottom tab bar (Home/Routes/Feedback/Release/More); P0 banner non-dismissible; P1 amber banner dismissible; push notification spec

- Engineering notes:
  - OWNER PERSONA TOKENS introduced: bg #0d1117, card #161b22, accent #50e890 green, border rgba(255,255,255,.06). Distinct from teacher (blue) / parent (violet/cream) / child (dark purple).
  - Teacher class summary: class-level aggregate accuracy % shown with mandatory disclaimer. Per-student accuracy NEVER shown.
  - Intervention overview distinct from queue: queue = daily action list (open only, auto-cleared); overview = term analytics + full history + stats.
  - Intervention retention: 90 days → anonymise student name + delete teacher notes. Aggregate stats (totals, trigger distribution) retained permanently for product analytics.
  - Owner console: MFA required (TOTP or biometric). No magic link login. Route health refreshes every 60s. Business metrics are daily snapshots.
  - P0 alert on mobile: non-dismissible until incident resolved. Routes tab icon turns red. Push notification via FCM/APNs.
  - Teacher mobile back header: shown on student detail / skill drilldown / intervention detail / assignment detail. Bottom tabs change on child routes (detail-specific tabs).

## Continuing into TASK_BACKLOG.md — items 133–138 next

## Batch 24 — COMPLETE (2026-03-24)

- Files created:
  - `owner-command-center-desktop-v3.html` (item 133)
  - `owner-command-center-mobile-v3.html` (item 134)
  - `owner-release-gate-desktop-v3.html` (item 135 — overwrite of Batch 1 file)
  - `owner-release-gate-mobile-v3.html` (item 136)
  - `owner-release-readiness-detail-v2.html` (item 137)
  - `owner-feedback-workbench-desktop-v3.html` (item 138 — overwrite of Batch 1 file)

- States covered:
  - Command center desktop: 3-tab (Command Center / Schools View / Spec); period selector (7d/30d/90d/All time); MAU growth chart + MRR/ARR breakdown; school cohorts (active 107/light 28/dormant 7); D7/D30/D90 retention table; band adoption chart; schools table with health status; export CSV button; data lag note (daily snapshot, 4–6h lag)
  - Command center mobile: same data as desktop; condensed layout; horizontal-scroll period chips; scroll stat tiles; mini bar charts; compact cohort list; no schools table (linked from More drawer)
  - Release gate desktop: 3-tab (Gate Blocked / Gate Ready / Spec); animated SVG score ring (71/100 blocked, 94/100 ready); 5-category scoring (Quality 25 + Performance 25 + Content 20 + Privacy 20 + Sign-off 10); blocker cards with resolution steps; warning cards (non-blocking); launch button disabled/greyed when blocked; active green when ≥ 90 + no blockers; stakeholder sign-off rows; gate re-checks on each CI/CD build
  - Release gate mobile: condensed; collapsed category rows (expand on tap); pinned launch button at bottom; full-screen confirmation overlay on tap (1s anti-accidental-tap delay)
  - Release readiness detail: 4-tab (Performance Blocked / Content Warning / Privacy Pass / Spec); category score header; individual check items with evidence (CI/CD metrics); resolution steps; check history log; evidence = infrastructure metrics only, no user data
  - Feedback workbench desktop: 3-tab (Live Queue / Expanded Item / Spec); 2-panel layout (wb-left 320px + wb-right flex); priority filter chips; auto-triage rules (Critical→P0/Major→P1/Moderate→P2/Minor→P3/Feature→Feature); actions (resolve/bump/escalate/won't fix/add to roadmap); owner reply textarea → platform notification (not email); school name shown (not individual teacher name)

- Engineering notes:
  - Release gate scoring: Quality(25) + Performance(25) + Content(20) + Privacy(20) + Sign-off(10) = 100; threshold ≥ 90 to open. Hard blocker = any failing check. Warning = non-blocking but tracked.
  - Warnings not resolved within 7 days post-launch escalate to blocker for next release.
  - owner-release-gate-desktop-v3.html and owner-feedback-workbench-desktop-v3.html both existed from Batch 1 — required Read before Write to overwrite.
  - Feedback workbench privacy: school name (B2B contract) shown; individual teacher name NOT shown.
  - Owner reply delivery: platform notification panel, not email. Teacher sees reply in notification center.
  - Command center data source: analytics warehouse with daily snapshots (not real-time). 4–6h lag shown as UI note.
  - Release gate mobile: full-screen confirmation overlay before deploy. 1-second delay on "Confirm" button (anti-accidental-tap).

## Continuing into TASK_BACKLOG.md — items 139–144 next

## Batch 25 — COMPLETE (2026-03-24)

- Files created:
  - `owner-feedback-workbench-mobile-v2.html` (item 139)
  - `owner-feedback-resolution-desktop-v2.html` (item 140)
  - `owner-feedback-resolution-mobile-v3.html` (item 141)
  - `owner-feedback-summary-desktop-v3.html` (item 142)
  - `owner-route-health-desktop-v3.html` (item 143)
  - `owner-route-health-mobile-v3.html` (item 144)

- States covered:
  - Feedback workbench mobile: 3-tab (Queue List / Item Detail / Spec); filter chips (All/P0/P1/P2/Feature); summary strip (P0/P1/P2-P3/Feature counts); feedback item cards (priority/type/school/preview); full detail view (meta/body/reply textarea/5-action flex-wrap row); P0 items pinned to top always
  - Feedback resolution desktop: 4-tab (Resolved / Won't Fix / Escalated / Spec); 2-col layout (main+sidebar); 3 resolution states: Resolved (green banner + resolution note + reply confirmation + activity log) / Won't Fix (neutral + internal reason) / Escalated (red + PagerDuty + still open); Reopen button in sidebar; SLA tracking shown
  - Feedback resolution mobile: 4-tab (Resolved / Won't Fix / Escalated / Spec); single-column; meta merged inline; activity log shown expanded; reopen in sticky footer; reply textarea omitted on resolved items (reply already sent)
  - Feedback summary desktop: 3-tab (Feedback Summary / Trends / Spec); period selector (7d/30d/90d); 5-stat row; daily volume chart with P0 spikes coloured red; type breakdown bar + stacked bar; SLA performance table (P0–Feature); NPS ring (+42) with promoter/passive/detractor bars; top-submitting schools sidebar; resolution breakdown sidebar; 90-day trends tab
  - Route health desktop: 3-tab (All Healthy / With P0 Incident / Spec); status header (healthy/degraded/down/uptime); full 10-route table (p95/p99/error rate/uptime); expand on click for resolution steps; latency small multiples (5 key routes); incident log sidebar; 30-day uptime sidebar; incident banner on P0; refresh cadence shown
  - Route health mobile: 3-tab (All Healthy / P0 Incident / Spec); non-dismissible P0 banner; status strip; route cards (dot/name/p95/uptime/error); expand on tap for down routes; incident log card; Routes tab icon turns red on P0; 10s refresh indicator during incident

- Engineering notes:
  - Feedback resolution: Internal resolution notes visible to owner only. Teacher sees only the reply (via platform notification). Reopen sends item back to queue with previous priority + log entry.
  - Feedback summary: Data from analytics warehouse (daily snapshots). NPS sent 24h after resolution. Suppressed 14d if previous NPS sent. Export: CSV (raw) or PDF (board/investor formatted).
  - Feedback summary: High submission count ≠ unhappy school. Top schools note explicitly states this.
  - Route health: p95 > 200ms = amber. p95 > 300ms = degraded. Error rate > 0.5% = amber. Uptime < 99.5% = amber. Normal refresh: 60s. P0 incident: 10s.
  - Route health mobile: P0 banner non-dismissible (clears when incident resolved). Routes tab icon: red on P0, amber on P1.
  - Reports/Export route always runs slow (310ms p95) — expected for heavy report generation. Shown as amber (slow) not red (down).

## Continuing into TASK_BACKLOG.md — items 145–150 next

## Batch 26 — COMPLETE (2026-03-24)

- Files created:
  - `owner-route-health-compact-v3.html` (item 145 — overwrite of Batch 1 file, updated to v3 tokens)
  - `owner-content-health-desktop-v2.html` (item 146)
  - `owner-content-health-detail-v3.html` (item 147)
  - `owner-adoption-by-band-desktop-v2.html` (item 148)
  - `owner-adoption-by-band-mobile-v2.html` (item 149)
  - `owner-live-incident-center-desktop-v2.html` (item 150)

- States covered:
  - Route health compact: 4-tab (Horizontal Strip / Home Widget / Degraded Expand / Spec); 3 usage contexts: pill strip (horizontal, all-healthy + incident w/ sorted degraded routes) / home page card widget (summary chips + route list) / inline expand on click (degraded/down routes show error detail + resolution steps); Reports route has custom p95 threshold (500ms, not 200ms) — shown as amber "Slow" not "Down"
  - Content health desktop: 3-tab (Content Health / Skills Table / Spec); 5-stat row; band health grid (P0–P3 with live/review/blocked counts); review queue (5 items with priority/type/band tag); error reports by subject area (horizontal bars); skills table filtered to flagged; auto-flag thresholds (skip rate >60% / wrong-answer >2 reports / asset 404 instant / abort >40%)
  - Content health detail: 4-tab (Blocked Skill / Under Review / Passed / Spec); single-skill drill-down; stat strip; error reports list (reporter = "Teacher, [School]"); question preview with wrong-marked-correct answer highlighted; review history log; actions sidebar (Mark Fixed+Unblock / Assign Curriculum / Block / Dismiss)
  - Adoption by band desktop: 3-tab (Band Overview / Advancement / Spec); period selector (30d/90d/Term/All time); 4-stat row; band cards grid (P0–P3 each with MAU/delta/retention/% share bar); stacked MAU chart (8 months); D7/D30 retention table; band advancement funnel (P0→P1 18%, P1→P2 24%, P2→P3 22%); product insights sidebar
  - Adoption by band mobile: 2-tab (Band View / Spec); period scroll chips; stat scroll tiles; vertical band cards (each with D7/D30/sessions/bar/pct); advancement card (3 transitions with bars); accessed from More → Analytics
  - Live incident center desktop: 4-tab (Active P0 / All Clear / Post-Incident / Spec); 3 states: Active P0 (red header + live 5h23m timer + PD link + resolve button + update timeline + add update form + on-call sidebar + affected routes + teacher status page note) / All Clear (green header + incident history table) / Post-Incident (resolved summary with TTD/TTA/TTR/SLA/post-mortem link); integrations: PagerDuty + Slack #incidents + teacher status page

- Engineering notes:
  - Route health compact: degraded/down routes always sorted to front of strip. "Reports" route custom SLA 500ms — amber "Slow" is expected, not a bug.
  - Content health: auto-block at >2 confirmed wrong-answer reports. Blocked skill = delivery_locked=true in content_skills table. Unblock requires code fix + deploy first.
  - Content health reporter privacy: "Teacher, [School]" only — no individual teacher name. No student data in content health.
  - Adoption by band: band advancement triggered by mastery_status=Strong on ≥70% of band skills + teacher confirmation. Not time-based. Average time in P2 = 4 terms (longest).
  - Live incident center: P0 auto-declares when route DOWN or error_rate > threshold. Auto-posts to teacher status page with generic "investigating" message (no technical details).
  - Incident post-mortem: auto-generates summary with TTD/TTA/TTR. "Schedule Post-Mortem" creates calendar invite + pre-fills incident doc template.

## Continuing into TASK_BACKLOG.md — items 151–156 next

---

## Batch 27 — Items 151–156 ✅
**Completed:** 2026-03-24

### Files built:
- `owner-live-incident-center-mobile-v2.html` (item 151)
- `owner-governance-log-v3.html` (item 152)
- `owner-roadmap-priority-board-v3.html` (item 153)
- `owner-release-calendar-v2.html` (item 154)
- `owner-quick-actions-rail-v2.html` (item 155)
- `owner-risk-register-panel-v2.html` (item 156)

- States covered:
  - Live incident center mobile: 4-tab (Active P0 / All Clear / Post-Incident / Spec); push notification opens directly to Active P0; single-column layout; sticky footer (PD link + Resolve) throughout; condensed post-incident summary card
  - Governance log: 2-tab (Governance Log / Spec); filter bar (All/Privacy/Content/Ops/Security/Release/Account + search); 10 log entries (P0 resolve, hotfix deploy, P0 declare, skill block, release launch, student data deletion, school onboard, MFA update, intervention anonymisation, skill unblock); category colour-coded dots; actor field: "System (auto)" vs "Owner" vs engineering name
  - Roadmap priority board: 2-tab (Roadmap Board / Spec); quarter selector (Q1–Q4); 4 Kanban columns (Now/Next/Later/Won't Build); cards show title + persona tags + effort (S/M/L/XL) + evidence count + progress bar; Won't Build at 60% opacity with rejection reason
  - Release calendar: 2-tab (Release Calendar / Spec); April 2026 grid; event types (Release green / Hotfix red / Code Freeze violet / Review amber / Post-Mortem mint); upcoming list (Apr 16 hotfix tentative, Apr 21 gate run, Apr 25 v2.6 launch); auto-logged releases/hotfixes from CI/CD; post-mortems auto-created 1 day after P0 resolve
  - Quick actions rail: 3-tab (All Clear / With Incident / Spec); 56px fixed left strip; 9 destinations + dividers; badge logic (Feedback=P0+P1 count, Route Health=DOWN count red, Release Gate=dot, Content Health=dot); active green state; P0 incident: Route Health turns red; tooltip (200ms delay) includes badge context; mobile: replaced by bottom tab bar
  - Risk register: 3-tab (Risk Register / Risk Matrix / Spec); 12 risks; score = Likelihood(1–5) × Impact(1–5) = 1–25; Critical ≥16 (2 risks: FERPA breach R-01=20, Assignment SPOF R-02=16); High 10–15 (3 risks: COPPA R-03, key-person R-04, content regression R-05); Medium 5–9 (4 risks); Low 1–4 (3 risks); filter by category + status; 5×5 matrix with risk IDs plotted in cells; quick-reference summary table

- Engineering notes:
  - Live incident center mobile: push notification payload includes incident_id → deep-links to /incidents/:id on open. Teacher status page auto-updated to generic "investigating" on declare, cleared on resolve.
  - Governance log: append-only table; writer = system service account only; owner read + export only; CSV export includes all fields; PDF export strips actor names per FERPA (school name only).
  - Roadmap: evidence_count = COUNT(feedback_items WHERE roadmap_item_id = this.id). Won't Build items never deleted — preserved for institutional memory. Quarter selector scopes active items only; Won't Build is always visible regardless of quarter.
  - Release calendar: Tue–Thu preferred release windows. School term blackout periods configurable in Settings. Post-mortem auto-created = incident resolve time + 1 day.
  - Quick actions rail: rail not rendered on mobile (display:none at breakpoint ≤ 768px). Badge counts fetched via API on nav load; re-polled every 60s (10s during P0 incident). Tooltip suppressed if section label already visible in wider layout mode.
  - Risk register: owner-only panel. Not visible to any teacher/parent/student. Risks archived after 12 months at Mitigated/Accepted status. Full review monthly; Critical risks weekly.

## Continuing into TASK_BACKLOG.md — items 157–162 next

---

## Batch 28 — Items 157–162 ✅
**Completed:** 2026-03-24

### Files built:
- `owner-beta-readiness-summary-v2.html` (item 157)
- `owner-kpi-strip-desktop-v3.html` (item 158)
- `owner-kpi-strip-mobile-v2.html` (item 159)
- `owner-ops-alert-banner-v2.html` (item 160)
- `content-home-desktop-v3.html` (item 161)
- `content-home-mobile-v2.html` (item 162)

- States covered:
  - Beta readiness summary: 3-tab (Not Ready / Ready / Spec); score 74 (not ready, 2 blockers) and score 83 (ready); 5-category scoring (Quality/Performance/Content/Privacy/Sign-off = 100); beta threshold = 80, full release threshold = 90; hero score + SVG ring + animated bar; per-category score bars; checklist (✕ blockers / ~ warnings / ✓ passed); beta pilot school list (4 schools: 2 ready, 1 limited P3, 1 DPA pending); 3-person sign-off panel; launch button disabled until score ≥ 80 AND 3/3 sign-offs
  - KPI strip desktop: 3-tab (All Healthy / With Incident / Spec); 8-cell grid (MAU/DAU/MRR/ARR/Schools/Feedback/Gate/Routes); period selector (7d/30d/90d/All Time); 30d and 7d variants shown; P0 incident: Route Health turns red + "N DOWN" + duration + feedback turns amber; degraded: amber "Degraded" + amber period bar; 5-min normal refresh, 10s on P0 (Routes only); MAU/MRR always monthly regardless of period
  - KPI strip mobile: 3-tab (All Clear / P0 Incident / Spec); horizontally scrollable tile row; right-edge fade gradient scroll hint; period chips separate scroll row; non-dismissible P0 banner above strip during incident (Routes tile red, Feedback tile amber); tile order differs from desktop (Routes/Gate earlier); 8 tiles total
  - Ops alert banner: 3-tab (Gallery / Stacked / Spec); 6 individual banner variants (P0 route down non-dismissible, P1 feedback SLA, P1 route degraded, Info release deployed, Privacy action required, P1 content blocked); stacked view (P0 + P1 + "+1 more" overflow chip); no-alerts all-clear state; severity: P0=red non-dismissible, P1=amber dismissible, Info=green dismissible, Privacy=violet requires acknowledge (not simple ×); max 2 banners + overflow chip
  - Content home desktop: 3-tab (Content Home / Flagged View / Spec); left sidebar (Library: Home/All/Flagged/Blocked/Under Review + Browse: Maths/Literacy/Science + Bands: P0–P3 + Settings); 6-stat row (total/live/review/blocked/sessions/skip rate); blocked alert banner; flagged skills grid (3-col, 6 shown: 3 blocked / 3 under review); recently published section; Flagged view with filter bar (status + band + search); persona: content/curriculum team, NOT owner console
  - Content home mobile: 3-tab (Content Home / Blocked View / Spec); stat scroll strip; red alert strip (if blocked > 0); filter chips; skill list items (icon + title + status + flag reason + band tag); blocked view shows all 3 blocked skills with "View Detail" + "Assign Review" actions; bottom tab bar (Home/Flagged/Blocked/All Skills/More); mobile = view + status-change only, no editing

- Engineering notes:
  - Beta readiness: beta_flag=true stored per school in schools table. Feature exposure via feature_flags.beta_enabled JOIN school context. Schools added/removed from beta cohort without deploy (config change only).
  - KPI strip: MAU = users with ≥1 session in calendar month. ARR = MRR × 12 (annualised, not trailing-12-months). Feedback count = P0+P1 open_at query time. Route Health + Gate = latest status from health_checks cache. 5-min polling for all cells; Route Health cell switches to 10s polling when P0 incident flag is active.
  - Ops alert banner: dismissed banners stored in owner_dismissed_alerts (timestamp + banner_type + source_id). P0 banners not dismissible; not stored in dismissed table. Privacy acknowledgements logged to governance_log AND privacy_acknowledgements tables. "+N more" overflow chip opens modal with all active alerts.
  - Content home desktop: sidebar badge counts (Flagged / Blocked) fetched on page load + 60s poll. Skill status flow: Published → Under Review (auto-flag) → Blocked (threshold). Unblock requires: fix → curriculum review → owner confirm → deploy → delivery_locked=false. Content team cannot access: school data, financial KPIs, governance log.
  - Content home mobile: mobile is view + status-change only. "View Detail" → skill detail page (read-only on mobile). "Assign Review" → assigns review_assigned_to field (content team member). Full edit workflow (question editing, asset upload) requires desktop. Blocked alert strip auto-hides when blocked count = 0.

## Continuing into TASK_BACKLOG.md — items 163–168 next

---

## Batch 29 — Items 163–168 ✅
**Completed:** 2026-03-24

### Files built:
- `content-question-browser-desktop-v3.html` (item 163)
- `content-question-browser-mobile-v2.html` (item 164)
- `content-question-gallery-v3.html` (item 165)
- `content-bulk-import-review-v3.html` (item 166)
- `content-publish-readiness-detail-v3.html` (item 167)
- `content-skill-coverage-map-v3.html` (item 168)

- States covered:
  - Question browser desktop: 3-tab (Flagged / All / Spec); two-pane layout (380px list + detail pane); question list with red/amber left border (blocked/review); selected question shows full detail — answer options with wrong-answer-as-correct highlighted red; SQL fix reference; error reports (reporter = "Teacher, [School]" only); session ID as reference; stats grid; skill linkage; 8 flagged + all-questions variants
  - Question browser mobile: 3-tab (List / Detail / Spec); list → tap → full-screen detail sheet; mobile edit = answer key correction only (toggle is_correct); full edit on desktop only; wrong-answer-as-correct shown in red; fix box with SQL reference + "full edit requires desktop" note; footer action bar (Edit Answer Key / Re-block)
  - Question gallery: 3-tab (Gallery / List / Spec); 4-col card grid; view toggle (Gallery ↔ List); red top bar (blocked) / amber top bar (review) on cards; selected card expands inline detail panel (above gallery, not modal); answer options with correct/wrong highlights; quick action buttons; asset 404 shown as "404" badge in visual area; list view = same data as table
  - Bulk import review: 3-tab (Import Review / Post-Import / Spec); 6-step progress indicator; summary row (18 skills/92 questions/11 valid/3 errors/4 warnings); import table with row-level status (blocking error = red left border, warning = amber, valid = green); inline fix actions per row (Fix inline / Skip / Assign new ID / etc.); sidebar with error/warning detail cards; post-import success state (11 draft skills created); skills imported as Draft (delivery_locked=true); confirm button disabled until all errors resolved
  - Publish readiness detail: 3-tab (Not Ready 74 / Ready 94 / Spec); per-skill quality gate; 4 categories (Content Completeness/Question Quality/Asset Completeness/Review Sign-off = 100); threshold = 90; score grid with per-category bars; readiness checklist (✕ blockers / ~ warnings / ✓ passed); question mini-list with per-Q status; curriculum + owner sign-off panel; "Request Owner Publish" disabled until score ≥ 90 AND curriculum sign-off; NOT the same as Release Gate (per-skill vs per-release)
  - Skill coverage map: 3-tab (Coverage Map / Gap Analysis / Spec); Band (P0–P3) rows × Subject columns × Topic cells; 5 coverage levels (Full ≥8 / Good 5–7 / Partial 3–4 / Thin 1–2 / Gap 0); Draft skills show "+N new" badge without inflating coverage colour; P3 G4–5 has major gaps (38 skills vs target 60+) — v2.6 batch expansion target; gap analysis tab with 16 unserved topics prioritised by curriculum alignment + teacher requests; "Commission" action creates content_commissions record

- Engineering notes:
  - Question browser: error_reports stored against question_id (FK). Auto-block threshold evaluated at skill level: ≥3 confirmed error reports across skill → delivery_locked=true. Reporter field = "Teacher, [School]" only; full teacher_id stored for audit only.
  - Question gallery: card visual area shows emoji placeholder when no asset image. Asset 404 shown as "404" badge to clearly distinguish from intentional text-only questions. Gallery card selection does NOT open a new route/page — expands inline panel to preserve gallery context.
  - Bulk import: CSV parse → validate → review → confirm → draft creation is a single database transaction (rollback on error). Skills created as Draft (delivery_locked=true, review_status=Draft). Blocking errors prevent DB insert for that row. Warnings are stored in import_warnings log for post-import triage. Import jobs are async (background job) for large files > 50 rows.
  - Publish readiness: "Request Owner Publish" sends notification to owner_notifications table + push notification if owner has mobile app. Owner receives skill title, readiness score, and link to this detail page. Owner publish action = UPDATE content_skills SET review_status='Published', delivery_locked=false + INSERT to governance_log.
  - Coverage map: topic taxonomy defined in curriculum_topics table (band + subject + topic name). Coverage count = COUNT published + draft skills (blocked excluded). Commissions created in content_commissions table. Sprint board integration: commissions sync to Notion/Linear via webhook (configurable in Settings).

## Batch 30 — COMPLETE (2026-03-24)

- Files created:
  - `content-alpha-readiness-dashboard-v3.html` (item 169)
  - `content-explainer-qa-v3.html` (item 170)
  - `content-audio-review-console-v2.html` (item 171)
  - `content-image-coverage-panel-v2.html` (item 172)
  - `content-grade-band-density-board-v2.html` (item 173)
  - `content-duplication-review-panel-v2.html` (item 174)

- States covered:
  - Alpha readiness dashboard: 3-tab (Dashboard / Per-Band / Spec); aggregate content library readiness score 78; thresholds Alpha≥70 / Beta≥80 / GA≥90; 3-col hero (score bar + thresholds / category scores / metric cards); per-band readiness table with bar+% value; P0–P3 each assessed independently; blockers list (P0/P1 priority boxes); content milestones timeline; review pipeline sidebar (capacity/days-to-clear); score 78 = Alpha ✓, Beta 2pts away
  - Explainer QA: 2-pane layout (340px list + detail); explainers = hint/explanation blocks shown after incorrect answers; each EXP links to 1–3 skills; 5-tab detail (QA Checklist / Preview / Linked Skills / Revision Notes / Diff View); Flesch-Kincaid reading level target = band_min − 0.5; score chips (Reading Level / Word Count / Fact Checks / QA Score / Revision #); automated checks + fact-check table (Science/Social Studies mandatory); reading level meter (segment-based, K–7+ scale); diff view showing text changes v2→v3; revision thread with open/resolved notes; Approve button disabled until QA score ≥90 and all checks pass
  - Audio review console: 2-pane layout (320px list + detail); 4-tab detail (Player & Flags / Transcript / Auto-Checks / Metadata); waveform visualisation (bar chart with played/flagged-region colouring); LUFS meter (Integrated LUFS target −18±2 dB; Noise Floor threshold −50 dB); auto-checks: LUFS, peak level, noise floor, leading/trailing silence, voice clarity score, transcript match, privacy scan; transcript word-level timestamps (Whisper auto-generated) with mispronounced word highlighting; script comparison (expected vs transcript); voice actor reference (session ID only, no name stored for privacy/contractual reasons); Approve button disabled when blocking issues present
  - Image coverage panel: 4-tab (Coverage Heatmap / Asset Browser / Missing Assets / Alt-Text Audit); coverage heatmap same 5-level schema as skill coverage map; asset browser card grid with status badges (Approved/Review/New/Missing/404); missing assets table with impact ratings (Critical/High/Medium) and commission/re-upload actions; alt-text audit for WCAG 2.1 AA compliance (47 missing / 241 present); alt-text missing = warn not block; stat strip: 284 total / 241 approved / 18 in review / 31 missing / 47 no-alt / 6 404 errors
  - Grade band density board: 4-tab (Overview / Subject Breakdown / Imbalance Alerts / Spec); density = total published+draft skills vs v2.6 targets; band cards (P0–P3) each showing skills count, questions, published rate, blocked count, target bar; horizontal comparison chart (subjects × bands, 5 subjects × 4 bands = 20 data points); P3 G4–5 at 73.3% of target (deficit); P2 Math over-indexed at 37.8% (max 35%); Social Studies and Arts under-indexed at P2/P3; imbalance alert thresholds: band <75% target = High, subject >35% band = Medium, Social Studies <10%/15% = Medium
  - Duplication review panel: 5+Settings tabs (All Pairs / Exact / Near / Concept / Resolved / Settings); exact match ≥98% / near match 85–97% / concept overlap = manual flag; collapsible pair cards with left border colour coding (red=exact, amber=near, violet=concept, green=resolved); side-by-side question comparison with diff highlighting (yellow=matching span, green=differing span); 4 resolution actions (Keep Both / Merge→Keep A / Merge→Keep B / Rewrite / Mark Not Duplicate); auto-merge rule (≥99.5% + one is Draft → keep Published automatically); retiring Q: q_status=retired, removed from adaptive pool, skill re-scored — if q_count drops <4 → skill flagged for review; concept overlap at skill level → add adaptive exclusion rule

- Engineering notes:
  - Explainer QA: explainers stored in content_explainers (EXP-XXXX). FK: exp_skill_links (exp_id, skill_id, many-to-many). qa_status field: draft/in_review/needs_revision/approved/published. reading_level = float (FK grade). fact_check_results stored in exp_fact_checks (exp_id, claim_text, status, reviewer). Auto-block fires if reading_level > band_max + 1.5.
  - Audio: assets in asset_library (type=audio). LUFS/noise floor stored in aud_qa_metrics after scan. Transcript stored in aud_transcripts (word-level JSON, word + start_ms + end_ms + confidence). Mispronunciation flags in aud_flags (flag_type, ts_start_ms, ts_end_ms, description, severity). Voice actor name NOT stored (privacy/contractual); only session reference (session_id).
  - Images: assets in asset_library (type=image). alt_text stored in asset_library.alt_text (nullable). WCAG report generated by querying WHERE type='image' AND alt_text IS NULL AND status='published'. Image 404 detected by CDN health check job (runs hourly); fires content_alert when broken link detected → auto-blocks linked questions.
  - Density board: density metrics computed from content_skills table via band_id + subject_id grouping. Imbalance alerts generated on-demand (no async job needed — pure SQL aggregate queries). Target values stored in content_targets config table (band_id, metric_key, target_value, version).
  - Dedup: dedup_pairs table stores (qid_a, qid_b, similarity_score, type, status, resolution, resolved_by, resolved_at). Scan job uses sklearn TF-IDF cosine similarity for exact/near; sentence-transformers for concept-level embedding comparison. Auto-merge fires when similarity ≥ 0.995 AND one q_status='draft' → keep the published question, set draft to retired. Adaptive exclusion rules stored in adaptive_exclusions (skill_id_a, skill_id_b, reason).

## Batch 31 — COMPLETE (2026-03-24)

- Files created:
  - `content-difficulty-ladder-v2.html` (item 175)
  - `content-theme-mapping-board-v2.html` (item 176)
  - `content-review-queue-v2.html` (item 177)
  - `content-safe-language-checker-v2.html` (item 178)
  - `content-release-bundle-card-v2.html` (item 179)
  - `content-seed-status-board-v2.html` (item 180)

- States covered:
  - Difficulty ladder: 4-tab (Ladder View / Distribution / Broken Ladders / Spec); 5 difficulty levels per skill (L1 Introductory → L5 Extension); band constraints (P0 max L3, P1 max L4, P2/P3 all levels); 4-column kanban view (one column per band) with skill pills per level; skill pill variants (published/review/blocked/draft); broken ladder detection: gap at lower level when higher level exists; distribution chart (horizontal segmented bars per band showing L1–L5 distribution); P3 G4–5 L3 gap highlighted red
  - Theme mapping board: 4-tab (Kanban Board / Theme Statistics / Multi-Theme Skills / Spec); 6 themes: Adventure/Nature/Space/City Life/Animals/Ocean World; kanban board with draggable skill cards per theme column + Unmapped bucket; skill cards show ID, title, band, subject, status; multi-theme skills (up to 3 themes per skill, first = primary); theme stat table with coverage %; unmapped skills cannot appear in adventure modes; 23 unmapped shown in bucket
  - Content review queue: 2-pane layout (360px queue + detail); queue items with SLA status (overdue/due-soon/on-time); left border colour coding (red=overdue, amber=due-soon); SLA rules: P0=24h, P1=48h, P2=5 biz days; detail pane: type badge + priority + days-overdue; meta strip; action bar (Approve/Request Revision/Block/Reassign); content preview with question list and per-Q status; interactive review checklist (click to check); review history log with dot indicators; queue stat header (Overdue/Due Soon/Queued/Total)
  - Safe language checker: 4-tab (Live Checker / Batch Results / Override Log / Rules Reference); live checker: content type + band selector; text input area; annotated results view with colour-coded flag spans (red=block, amber=warn, violet=info); flag list with type, flagged text, suggested replacement, and Accept/Edit/Dismiss actions; sidebar: check summary score grid + category breakdown + publish status; 9 rule categories (Anxiety/Pressure, Timer, Death/Distress, Violence, Exclusionary, Cultural Sensitivity, Complex Vocab, PII, Shame Language); false positive overrides logged with reason for audit
  - Release bundle card: card grid layout; bundle card variants (ready=green top bar/border, partial=amber, blocked=red, draft=grey); bundle card anatomy: ID + status + name + description + stat strip (skills/questions/approved/avg score) + progress bars + band tags + blocker warnings + footer actions; expanded detail table view for individual skill readiness within bundle; "Submit to Owner" disabled unless all skills approved; partial submit allowed (cherry-pick); BDL-0010 "submitted" state shown; create-new placeholder card with hover effect
  - Seed status board: 4-tab (Stage Board / Band Progress / All Seeds / Spec); 5-stage pipeline: Assigned → Scripted → Curriculum Review → QA → Ready; kanban stage board with seed topic cards; overdue cards shown with red border; seed cards: topic name + band + subject + question count + due date; Band Progress tab: per-band stage breakdown bars + % toward target; P3 G4–5 at only 38% complete (major gap warning); Ready stage auto-transfers items to main review queue; SLA per stage defined in Spec tab

- Engineering notes:
  - Difficulty ladder: difficulty_level field on content_skills (1–5). Broken ladder query: SELECT band_id, subject_id FROM content_skills WHERE difficulty_level > 3 AND NOT EXISTS (SELECT 1 FROM content_skills s2 WHERE s2.band_id=s.band_id AND s2.subject_id=s.subject_id AND s2.difficulty_level = s.difficulty_level - 1 AND s2.review_status='Published').
  - Theme mapping: skill_themes table (skill_id UUID, theme_id INT, is_primary BOOL). A skill with zero theme rows = unmapped. Adventure mode query: JOIN skill_themes ON skill_id WHERE theme_id = ? AND is_primary = true. Unmapped count = SELECT COUNT(*) FROM content_skills LEFT JOIN skill_themes USING (id) WHERE theme_id IS NULL.
  - Review queue: review_queue table (item_id, item_type ENUM, priority ENUM p0/p1/p2, assigned_to, created_at, due_at, status). Overdue = due_at < NOW() AND status != 'completed'. Review completion: UPDATE review_queue SET status='completed', completed_at=NOW(); UPDATE content_skills SET review_status='Approved' (or 'Needs Revision').
  - Safe language checker: safe_language_check_results (item_id, item_type, band_id, check_category, severity, flagged_text, suggestion, status ENUM open/dismissed/fixed, checked_at). Overrides: safe_language_overrides (item_id, check_id, reason, dismissed_by, dismissed_at). Batch scan = nightly cron job runs check on all items with review_status IN ('Draft','Under Review').
  - Release bundles: content_bundles (id, name, description, status ENUM draft/curriculum_ready/owner_review/published/rejected). bundle_skills (bundle_id, skill_id, included_at). Publish gate: ALL bundle_skills must have readiness_score >= 90 AND review_status='Approved'. Partial publish creates partial_publish_record (bundle_id, published_skill_ids[], published_at, owner_id).
  - Seed pipeline: seed_items table (id, topic_name, band_id, subject_id, stage ENUM, assigned_to, scripted_at, reviewed_at, qa_at, ready_at, due_at, q_count_target). Stage transition: UPDATE seed_items SET stage = next_stage, [stage]_at = NOW(). When stage = 'ready': INSERT INTO review_queue (item_id=seed_id, item_type='seed', ...).

## Continuing into TASK_BACKLOG.md — items 181+ next
