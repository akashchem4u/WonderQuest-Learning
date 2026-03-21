# WonderQuest Question Factory Strategy

## Why This Matters

Yes, WonderQuest can support a `1M+` question inventory, but not by hand-authoring one million static rows.

The scalable model is:

1. define a strong curriculum graph
2. define reusable item blueprints
3. define safe theme and image packs
4. generate approved variations from controlled parameters
5. calibrate and retire items based on real learner performance

That gives us a large database with:

- academic consistency
- age-appropriate difficulty
- theme personalization
- explainers and remediation
- real adaptive routing

## The Core Rule

`Academic logic` and `theme rendering` must stay separate.

Example:

- the academic skill is `add within 10`
- the difficulty is `K1 / step 2 / visual support on`
- the item blueprint is `single-step addition with 3 options`
- the theme skin can be `soccer`, `animals`, `space`, `art`, or `builder world`

The theme changes how the child experiences the item.
It must not secretly change the academic hardness.

## The 5-Layer Content Model

### 1. Curriculum Graph

This is the permanent academic backbone.

Each node should include:

- age band
- grade band
- subject
- domain
- subskill
- prerequisite skills
- target mastery stage
- misconception tags
- allowed modalities
- reading-load limits
- support rules

Example:

- band: `K1`
- subject: `math`
- domain: `operations`
- skill: `add-to-10`
- prerequisite: `count-to-10`
- misconceptions: `counts wrong`, `forgets second addend`, `confuses 9 and 10`

### 2. Item Blueprints

These are not fully written questions.
They are structured templates for generating many safe items.

Each blueprint should define:

- blueprint key
- skill code
- prompt type
- allowed parameter ranges
- correct-answer rule
- distractor-generation rule
- visual support rule
- audio / explainer rule
- target difficulty band
- grading metadata

Example blueprint:

- `k1_addition_visual_3_choice`
- variables: `a`, `b`
- constraints: `a + b <= 10`
- distractor rules: `sum - 1`, `sum + 1`
- support: `counting dots`
- explanation: `count on from bigger number`

### 3. Theme and Asset Packs

These are reusable render layers.

Each theme pack should include:

- approved color tokens
- icons
- mascot variants
- object libraries
- background cards
- safe scene patterns
- voice tone guidance
- age appropriateness limits
- trademark restrictions

Important:

- do not use licensed characters, game brands, or copyrighted IP directly unless licensed
- do not use trend-based references that can drift into unsafe or inappropriate content
- use `inspired-by categories`, not copied brands

Good:

- `block-building world`
- `sports world`
- `animal adventure`
- `creative art studio`

Risky without licenses:

- direct use of `Roblox`, cartoon brands, or commercial characters

### 4. Variation Engine

This is how we scale.

It combines:

- skill node
- blueprint
- parameter set
- theme pack
- explainer
- support mode
- answer layout
- locale

It should generate:

- rendered prompt
- answer options
- grading key
- explainer linkage
- metadata tags

### 5. Calibration and Quality Layer

Every generated item should be tracked after release.

We should log:

- shown count
- completion rate
- correct rate
- first-try rate
- hint usage
- time spent
- remediation trigger rate
- post-explainer recovery rate

This lets us:

- detect bad distractors
- detect too-hard or too-easy items
- retire low-quality items
- recalibrate difficulty
- improve adaptive routing

## How We Reach 1M Questions

The scalable unit is not the raw written question.
The scalable unit is the `approved rendered item variation`.

Example path to `1,080,000` items:

- `300` skills
- `12` blueprints per skill on average
- `20` approved parameter sets per blueprint
- `5` theme render packs
- `3` support modes

Math:

- `300 x 12 x 20 x 5 x 3 = 1,080,000`

That is realistic if we build the system correctly.

We do not need all 1,080,000 active on day one.

We can phase it like this:

- Phase 1: `5,000 to 20,000` reviewed items
- Phase 2: `100,000+` rendered variations
- Phase 3: `1M+` catalog with active quality gating

## What the Database Should Actually Store

We should store both `logical content` and `rendered content`.

### Core Academic Tables

- `subjects`
- `domains`
- `skills`
- `skill_prerequisites`
- `misconception_types`
- `difficulty_bands`

### Blueprint Tables

- `item_blueprints`
- `blueprint_parameters`
- `distractor_rules`
- `support_rules`
- `grading_rules`

### Theme and Media Tables

- `theme_packs`
- `theme_assets`
- `scene_templates`
- `narration_styles`
- `explainer_assets`

### Generated Content Tables

- `generated_items`
- `generated_item_options`
- `generated_item_renders`
- `generated_item_reviews`
- `generated_item_status_history`

### Adaptive and Performance Tables

- `learner_skill_state`
- `item_performance_stats`
- `misconception_hits`
- `adaptive_decisions`
- `session_results`

## How We Grade and Difficulty-Tag Questions

We need two difficulty systems:

1. `Designed difficulty`
2. `Observed difficulty`

### Designed Difficulty

This comes from content rules before release.

Score components:

- grade anchor
- prerequisite depth
- number size or text complexity
- number of steps
- distractor similarity
- reading load
- visual support level
- abstractness
- time pressure

Example:

- `K1 add 6 + 4 with dots visible` is easier than
- `K1 add 6 + 4 without dots` which is easier than
- `K1 word problem add 6 + 4 with extra wording`

### Observed Difficulty

This comes from actual child performance.

Signals:

- percent correct
- first-try success
- median time to answer
- hint dependence
- recovery after explainer
- band-specific performance by age and grade

Later, we can add stronger calibration models.
Early on, a rules-based and percentile-based system is enough.

## The Adaptive Routing Logic

The next question should use:

- current mastery estimate
- recent streak
- fatigue signals
- frustration signals
- child-requested direction
- parent / teacher assigned focus
- theme preference

The routing engine should decide:

- same skill, same difficulty
- same skill, easier
- same skill, harder
- prerequisite review
- new nearby skill
- explainer first, then retry
- challenge stretch item

## How Images and Visual Questions Should Work

For younger learners especially, a large share of the item bank should be visual-first.

Recommended approach:

- create approved object packs by theme
- use scene templates, not fully open image generation per question
- generate image scenes from structured specs
- keep visual complexity mapped to age band
- attach alt text and semantic tags

Example scene spec:

- theme: `animal-adventure`
- object: `duck`
- count: `3`
- layout: `simple-row`
- background: `light-pond`
- labels: `off`

This lets one academic item render as:

- ducks
- soccer balls
- stars
- paint brushes

without changing the skill being assessed.

## Voice and Video Explainers at Scale

Explainers should also be factory-driven.

Each misconception should have:

- explainer objective
- age-band language style
- narration script
- visual storyboard
- follow-up reinforcement item
- replay / skip fallback

This is how we scale fast without writing every clip from scratch.

## Safety and Review Rules

Child-facing content should never be fully open-ended at runtime.

Recommended rule set:

- AI may help author internal drafts
- human review approves anything child-facing
- theme packs must pass safety review
- image assets must pass style and safety review
- explainers must be checked for age-appropriate language
- trending-topic content must use curated prompts only

## Recommended Build Sequence

### Stage 1: Foundation

- finalize subject, domain, and skill taxonomy
- define difficulty ladder by band
- define misconception taxonomy
- define blueprint schema

### Stage 2: Factory MVP

- build `50 to 100` strong blueprints
- support `4` launch bands
- support `4 to 6` theme packs
- generate `10,000+` reviewed items

### Stage 3: Scale Engine

- add parameter generation rules
- add render variants
- add automated QA checks
- add content review queue
- add item calibration stats

### Stage 4: Million-Item Expansion

- broaden subject coverage
- add more blueprints per skill
- add more theme packs
- expand to reinforcement and enrichment variants
- retire low-performing items continuously

## Immediate Recommendations

- do not aim for one million hand-written rows
- build a `question factory`, not a static bank
- keep theme and academic logic separate
- use structured visual scene generation for images
- treat explainers as reusable misconception assets
- store designed difficulty and observed difficulty separately
- begin with a smaller reviewed inventory and scale through controlled generation

## Next Build Artifacts

The next practical deliverables should be:

1. a skill taxonomy workbook
2. a blueprint schema
3. a distractor rule library
4. a scene-template and asset-pack model
5. a generated-item table design
6. a calibration rules spec
7. a review workflow for child-facing content
