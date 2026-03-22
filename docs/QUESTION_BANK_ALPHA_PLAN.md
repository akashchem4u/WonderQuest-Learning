# WonderQuest Question Bank Alpha/Beta Plan

## Purpose

This repo currently has a small seed set in `data/launch/sample_questions.json`
and `app/src/lib/launch-data.ts`:

- 4 launch bands: `PREK`, `K1`, `G23`, `G45`
- 12 sample questions
- 12 launch skills
- 8 explainers

That is enough to prove route flow, but not enough for a meaningful tester pool.
This plan defines a practical bank expansion target for alpha/beta without
turning the repo into a hand-authored content dump.

## Recommended Release Target

Use a two-step content ramp:

- Alpha live set: `96` questions
- Beta expansion: `+32` questions
- Final tester bank target: `128` questions

This keeps each band represented immediately and gives us enough variation for
session replays, recovery paths, and adaptive routing.

## Band Distribution

Keep the final bank evenly distributed across the 4 launch bands:

- `PREK`: `32` questions
- `K1`: `32` questions
- `G23`: `32` questions
- `G45`: `32` questions

If we need a smaller alpha cut, publish `24` per band first and hold `8` per
band for beta.

## Subject / Skill Distribution

Use the current launch-band focus and the sample question structure already in
the repo.

### PREK (`32`)

Subject mix:

- `early-literacy`: `16`
- `math`: `16`

Skill mix:

- `counting-to-small-set`: `10`
- `letter-recognition`: `8`
- `shape-recognition`: `6`
- `sound-match` / voice-led explainers: `8`

### K1 (`32`)

Subject mix:

- `phonics`: `10`
- `reading`: `14`
- `math`: `8`

Skill mix:

- `short-vowel-phonics`: `10`
- `sight-words` / first-word recognition: `8`
- `add-within-10`: `8`
- `simple-word-reading`: `6`

### G23 (`32`)

Subject mix:

- `reading`: `16`
- `math`: `10`
- `logic`: `6`

Skill mix:

- `main-idea`: `10`
- `multiply-facts` / equal groups: `10`
- `pattern-next-item`: `6`
- `vocabulary` / short recap items: `6`

### G45 (`32`)

Subject mix:

- `reading`: `10`
- `math`: `16`
- `world-knowledge`: `6`

Skill mix:

- `context-clues`: `10`
- `fraction-comparison`: `10`
- `multi-step-math`: `6`
- `engineering-basics` / why-questions: `6`

## Difficulty Distribution

Keep designed difficulty simple and band-aware.

Overall target:

- Easy: `52`
- Medium: `48`
- Stretch: `28`

Band split:

- `PREK`: `24` easy, `8` medium, `0` stretch
- `K1`: `16` easy, `12` medium, `4` stretch
- `G23`: `8` easy, `16` medium, `8` stretch
- `G45`: `4` easy, `12` medium, `16` stretch

This gives younger testers enough wins and older testers enough challenge.

## Recommended Progression Order

Use this build order so the bank matches the live route flow:

1. `PREK`
   - counting
   - letter recognition
   - shapes
   - sound matching / voice-led explainers
2. `K1`
   - short vowels
   - sight words
   - simple addition
   - simple word reading
3. `G23`
   - main idea
   - multiplication facts
   - pattern / logic
   - vocabulary and recap items
4. `G45`
   - context clues
   - fraction comparison
   - multi-step math
   - world knowledge / engineering basics

Implementation note:
- keep `challenge choice`, `harder`, `easier`, and `more like this` as routing
  behavior, not as separate content skills.

## What To Build First

Start with these 8 seed skills because they cover the current alpha risk area
and map directly to the live sample structures:

- `counting-to-small-set`
- `letter-recognition`
- `shape-recognition`
- `sound-match`
- `short-vowel-phonics`
- `sight-words`
- `add-within-10`
- `main-idea`

Those 8 skills should receive the first high-quality question variants and the
first explainer coverage.

## Question Factory Ramp To 200+ Per Area

Do not grow the bank by copying full questions one at a time. Grow by skill
area.

For each core skill area, define:

- `1` skill node
- `4 to 6` question blueprints
- `8 to 12` parameter sets per blueprint
- `4` theme render variants
- `2 to 3` support modes

That creates enough rendered variation to reach `200+` approved items per
high-use skill area later.

Suggested ramp:

- Phase 1: `12` seed items stay as the gold examples
- Phase 2: `96` alpha bank for live testers
- Phase 3: `128` item tester bank
- Phase 4: `200+` per high-use skill area through the factory

## Repo-Specific Implementation Notes

Use the following repo assets as the content anchors:

- [app/src/lib/launch-plan.ts](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/lib/launch-plan.ts)
- [app/src/lib/launch-data.ts](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/lib/launch-data.ts)
- [data/launch/sample_questions.json](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/data/launch/sample_questions.json)
- [data/launch/skills.json](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/data/launch/skills.json)
- [docs/QUESTION_FACTORY_STRATEGY.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/docs/QUESTION_FACTORY_STRATEGY.md)

Recommended next repo work after this plan:

- expand the seed question set to `24` per band first
- add missing explainer coverage for the first 8 skills
- tag each item with `band`, `subject`, `skill`, `difficulty`, `theme`, and
  `explainer_key`
- keep generated items and reviewed items separate so calibration can begin
  cleanly
