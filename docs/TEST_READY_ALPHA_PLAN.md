# WonderQuest Test Ready Alpha Plan

## Purpose

This document defines when WonderQuest is ready for serious owner-led testing.

The goal is not to wait for a fully mature product. The goal is to avoid testing too early, when feedback is dominated by obvious incompleteness instead of meaningful product signal.

## Current Assessment

WonderQuest is currently in an `internal prototype` phase, not a `test-ready alpha` phase.

What is already real:

- child username + 4-digit PIN access
- parent username + 4-digit PIN access
- parent-child linkage
- Supabase-backed progression and session persistence
- first playable loop
- owner and teacher gated views
- Render deployment and route verification

What is not mature enough yet for serious owner testing:

- the `ages 2-5` experience is still too text-dependent
- visual-first question rendering is too narrow
- voice guidance is improved but not yet product-quality
- parent multi-child visibility and switching is still thin
- teacher and owner views are still more dashboard-like than action-oriented
- the product still feels more like a prototype shell than a coherent learning experience

## Definition Of Test Ready Alpha

WonderQuest reaches `test-ready alpha` only when a real child can complete a short session with minimal adult rescue, and a parent can understand what happened afterward.

For this product, that means:

- a child ages `2-5` can start and finish a `5-8 minute` session using mostly taps, visuals, and voice guidance
- the core experience does not require reading for pre-readers
- wrong-answer help is quick, supportive, visual, and age-appropriate
- the child gets an early success within the first `60-90 seconds`
- progression feels motivating and not confusing
- the parent can link to the child and understand progress, strengths, support areas, and next-step guidance
- teacher and owner views are coherent enough to support operational evaluation
- the product feels like one experience, not disconnected flows

If those are not true, it is still an internal prototype.

## What Will Count As A Decent Phase For Testing

The first serious owner-testing phase should be a narrow `Alpha Slice`, not broad product exploration.

That alpha slice should include:

- one strong `ages 2-5` flow
- one usable `K-1` flow
- one believable parent flow
- one basic but actionable owner/teacher visibility layer

It should not try to prove the full long-term product vision.

## Explicit No-Go Reasons

Do not start serious owner testing if any of these are still true:

- a `2-5` child still needs reading ability to use the core flow
- the first session is too text-heavy or too long
- wrong-answer explainers are inconsistent or abstract
- the child does not get an early win
- parent reporting does not clearly explain what happened
- linked-child handling is confusing
- owner or teacher views do not surface clear action areas
- the product feels fragmented across login, play, rewards, and adult views
- device layout still breaks on phone or tablet

## Scenario Matrix

### Child Core Scenarios

- `C1`: child creates or accesses a profile with username + PIN + avatar
- `C2`: child starts a session without needing adult reading support
- `C3`: child hears the question again slowly
- `C4`: child answers correctly and gets a quick reward
- `C5`: child answers incorrectly and gets a brief visual/voice explainer
- `C6`: child retries and succeeds after support
- `C7`: child leaves mid-session and returns without losing progress
- `C8`: child finishes a session and sees a motivating, simple completion state
- `C9`: strong child gets a slightly harder next step
- `C10`: struggling child gets a calmer, simpler recovery path

### Ages 2-5 Specific Scenarios

- `P1`: no core step depends on reading paragraphs
- `P2`: prompts are short and voice-led
- `P3`: answer options are visual enough to choose without reading
- `P4`: at least the main launch items have supporting visuals
- `P5`: voice pace is slower and calmer than the current generic browser default
- `P6`: help and replay controls are obvious

### Parent Scenarios

- `PA1`: parent logs in at the parent route with username + 4-digit PIN
- `PA2`: parent links a child in the same flow
- `PA3`: parent can see all linked children clearly
- `PA4`: parent can switch between linked children
- `PA5`: parent sees time spent, effective time, completion, strengths, and support areas
- `PA6`: parent sees recent learning activity
- `PA7`: parent gets a clear recommendation for where to focus next
- `PA8`: parent can submit feedback easily

### Teacher Scenarios

- `T1`: teacher access route opens through its current gate
- `T2`: teacher sees recent learner activity
- `T3`: teacher sees support areas by skill
- `T4`: teacher sees a basic action lane, not just summary cards

### Owner Scenarios

- `O1`: owner access route opens through its current gate
- `O2`: owner sees student, session, and content health signals
- `O3`: owner sees feedback categorized into bug, enhancement, content, or safety
- `O4`: owner sees what needs attention next, not just totals

### Cross-Cutting Scenarios

- `X1`: mobile layout works for child flow
- `X2`: tablet layout works for child flow
- `X3`: parent flow works without layout breakage
- `X4`: Render deployment passes route checks
- `X5`: smoke flow passes locally end to end
- `X6`: no obvious session confusion between child and parent flows

## Alpha Gates

### Gate 1: Child Flow Gate

All of these must be true:

- child access works reliably
- session start works reliably
- at least one `ages 2-5` path is visual-first and voice-first
- retry and explainer flow feels helpful, not mechanical
- progression persists across refresh/return

### Gate 2: Parent Gate

All of these must be true:

- parent login works reliably
- parent can link a child
- parent can see linked children clearly
- parent can view progress and analysis for the selected child
- parent feedback submission works

### Gate 3: Teacher / Owner Gate

All of these must be true:

- teacher and owner routes load reliably
- each route has at least one action-oriented section
- feedback / support data is understandable enough to drive next steps

### Gate 4: Device and Deploy Gate

All of these must be true:

- local lint/build pass
- local smoke flow passes
- Render post-setup checks pass
- key screens are usable on phone and tablet widths

## Recommended Next 8-10 Hours

Keep the work narrow and parallel.

### Lane 1: Child Test-Ready Slice

- make the `ages 2-5` path more visual-first
- reduce reading burden further in the child play loop
- strengthen answer visuals and explainer presentation
- make the first `60-90 seconds` feel rewarding and obvious

### Lane 2: Parent Maturity Slice

- add clear linked-child switching
- expand progress analysis from one selected child into a family view
- make parent recommendations more concrete and calmer

### Lane 3: Teacher / Owner Action Slice

- turn teacher and owner views into action surfaces
- highlight support priorities, recent issues, and feedback routing
- avoid adding more generic cards

### Lane 4: Voice / Interaction Slice

- keep slowing and softening early-learner voice behavior
- improve replay, help, and encouragement patterns
- keep leaning into visual prompts over text prompts

### Lane 5: QA / Freeze Slice

- tighten local smoke and deploy checks
- run mobile-width validation on child and parent flows
- freeze the alpha slice instead of continuing broad backlog expansion

## What Not To Build Before Alpha Testing

Do not spend the next cycle on:

- native iOS / Android packaging
- large-scale content factory expansion
- deep teacher admin workflows
- monetization
- school billing
- live multiplayer
- peer chat
- benchmark-heavy comparisons

These will slow alpha readiness without improving early testing quality.

## Recommended Testing Start Point

You should start serious owner-led testing only after all four alpha gates pass.

At that point, the first test round should be:

- `2-3` children for the early learner path
- `1-2` parents using the real parent linkage flow
- focused observation of confusion, drop-off, and explainers

Do not start with wide testing.
Start with a small number of controlled test sessions and gather high-quality observations.

## Simple Readiness Verdict

Current verdict:

- `Renderable and internally demoable`: yes
- `Useful for ongoing engineering iteration`: yes
- `Ready for serious owner testing`: no

Target next verdict:

- `Test-ready alpha for controlled owner testing`: yes

That is the next meaningful milestone.
