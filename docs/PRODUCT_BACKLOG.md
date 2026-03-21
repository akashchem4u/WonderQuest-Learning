# WonderQuest Learning Product Backlog

## Backlog Use

This backlog is organized for execution.

Priority meaning:

- P0: must do before or during MVP foundation
- P1: MVP-critical
- P2: strong next wave after MVP
- P3: expansion
- P4: later or optional

## P0: Foundation and Decisions

- P0-01: lock MVP scope for ages 2 to 5, K-1, 2-3, and 4-5
- P0-02: define child, parent, and teacher / school primary journeys
- P0-03: choose the technology stack and deployment model
- P0-04: create the initial PostgreSQL schema
- P0-05: define the content taxonomy for subject, domain, subskill, difficulty, modality, and theme compatibility
- P0-06: define the telemetry event model
- P0-07: define the feedback intake and routing model
- P0-08: define legal disclaimers and comparison language
- P0-09: define content safety and review rules
- P0-10: decide the first primary theme family for each launch age or grade band
- P0-11: define age-band explainer standards for voice and video teaching
- P0-12: define child self-directed challenge flows and guardrails
- P0-13: define lightweight username, 4-digit PIN, avatar, and parent-child linkage model
- P0-14: define tester persistence and migration rules so early users do not lose progress
- P0-15: define login recovery, wrong-PIN, forgot-PIN, and duplicate-username scenarios
- P0-16: define parent-child linkage verification and wrong-link correction flow
- P0-17: define explainer fallback rules for skip, replay, audio-off, and video-failure cases
- P0-18: define minimum feedback context fields for bug, enhancement, and content reports

## P1: MVP Product Build

- P1-01: responsive web application shell for phone, tablet, and desktop
- P1-02: lightweight username and 4-digit PIN access flow
- P1-03: child profile creation with display name and avatar selection
- P1-03a: parent lightweight access and child linkage flow
- P1-03b: login recovery and parent-assisted reset flow
- P1-04: lightweight onboarding with gradual preference capture
- P1-05: age-band and grade-band selection
- P1-06: structured content database for skills, templates, and examples
- P1-07: low-text interactive question experiences
- P1-08: audio-friendly prompts and guidance
- P1-08a: quick age-specific voice explainers for wrong answers
- P1-08b: quick age-specific video or animation explainers for core concepts
- P1-09: points, levels, badges, and basic progression
- P1-10: theme-aware UI system
- P1-11: one primary theme family for each launch age or grade band
- P1-12: retry flow and simple explainer flow
- P1-12a: child-initiated "more like this" and "harder/easier" challenge actions
- P1-12b: safe fallback from self-directed challenge mode back to guided mode
- P1-13: persistent save and resume sessions for all users including testers
- P1-14: parent summary after session
- P1-15: feedback capture for parents and teachers
- P1-16: baseline analytics dashboard for internal use

## P2: Adaptive Intelligence and Reporting

- P2-01: adaptive difficulty engine
- P2-02: AI next-best-question engine
- P2-03: AI next-best-support engine
- P2-04: modality switching based on learner response
- P2-05: progressive preference refinement from behavior
- P2-05a: AI mapping of child-requested challenges to the right skill and difficulty
- P2-06: parent dashboard with subject and domain progress
- P2-07: time spent and effectiveness scoring
- P2-08: notification preferences and reminder engine
- P2-09: weekly summary generation
- P2-10: AI feedback triage into bug, enhancement, content issue, safety, and product insight
- P2-11: teacher / school dashboard v1
- P2-12: intervention and enrichment grouping suggestions

## P3: Content and Engagement Expansion

- P3-01: broader subject coverage beyond reading and math
- P3-02: curated daily news and world awareness cards
- P3-03: richer remediation clip library
- P3-04: more theme families
- P3-05: richer collectibles and trophy system
- P3-06: mission boards and challenge ladders
- P3-07: enrichment recommendations for strong learners
- P3-08: advanced world progression and unlocks
- P3-09: teacher assignment flows
- P3-10: classroom summary exports
- P3-11: self-paced assignment mode for parent and teacher assigned play
- P3-12: teacher-hosted live challenge mode with safe join flow
- P3-13: challenge recap and question review reports

## P4: Platform Maturity and Growth

- P4-01: content admin console
- P4-02: A/B testing and experimentation
- P4-03: AI decision review tooling
- P4-04: privacy and compliance hardening
- P4-05: localization and multilingual support
- P4-06: offline-friendly session support
- P4-07: PWA install experience
- P4-08: advanced observability and alerting
- P4-09: seasonal content operations workflow
- P4-10: native app packaging if later justified

## Recommended Enhancements

These are not all day-one features, but they are strong backlog candidates.

- enhancement-01: child-friendly reaction buttons such as liked this, too hard, too easy, or confusing
- enhancement-02: parent-set learning goals by subject
- enhancement-03: dynamic re-entry sessions for children returning after a long gap
- enhancement-04: calm mode with reduced motion and softer pacing
- enhancement-05: voice narration packs by age band
- enhancement-16: child voice shortcut buttons such as more math, harder please, easier please, and explain that again
- enhancement-17: replayable micro-lessons for repeated misconceptions
- enhancement-18: self-selected challenge boards by subject and theme
- enhancement-06: family dashboard with more than one child profile
- enhancement-21: account upgrade path from lightweight PIN access to stronger authentication later without losing points or progress
- enhancement-07: teacher notes linked to skill observations
- enhancement-08: content freshness score so stale items can be refreshed
- enhancement-09: duplicate feedback clustering for faster product triage
- enhancement-10: AI-generated but human-reviewed parent summaries
- enhancement-11: skill heat maps by week and month
- enhancement-12: theme rotation recommendations based on engagement drop
- enhancement-13: session-length tuning by learner stamina
- enhancement-14: world knowledge streaks that are not tied to daily attendance
- enhancement-15: guided challenge sets for competition-ready students
- enhancement-19: quiz-show round formats such as lightning round, review round, and final challenge
- enhancement-20: teacher or parent hosted family challenge sessions

## Recommended Operating Backlog

- ops-01: set up product analytics and event naming standards
- ops-02: define bug severity and enhancement intake rules
- ops-03: define content QA checklist
- ops-04: define AI prompt versioning and evaluation workflow
- ops-05: define feedback review cadence
- ops-06: define release train and environment strategy
- ops-07: define dashboard ownership and reporting cadence
- ops-08: define data retention and privacy rules

## Recommended Design Backlog

- design-01: child UI patterns by age band
- design-02: parent dashboard information hierarchy
- design-03: teacher dashboard information hierarchy
- design-04: theme token system for colors, icons, rewards, and world framing
- design-05: low-text interaction standards
- design-06: notification templates and preference UI
- design-07: resume-session experience after inactivity
- design-08: child challenge-choice UI patterns
- design-09: explainer video and voice pattern library by age band

## Recommended AI Backlog

- ai-01: model the signals used for difficulty changes
- ai-02: build decision logs for every adaptive change
- ai-03: define confidence thresholds for AI-assisted actions
- ai-04: build fallback rules when AI is unavailable
- ai-05: classify feedback into bug, enhancement, content, safety, and general product insight
- ai-06: summarize parent and teacher views from session data
- ai-07: detect repeated misconceptions by child and by class
- ai-08: recommend the next best content block for each learner
- ai-09: interpret child challenge requests into safe age-appropriate challenge paths
- ai-10: choose the best explainer modality for a child based on history

## Explicitly Out of Scope For Early Releases

- open peer-to-peer chat
- public leaderboards for young children
- native apps before the web product is proven
- official benchmark-test claims
- fully open-ended AI-generated child-facing content
- deep school SIS integration in the first release
