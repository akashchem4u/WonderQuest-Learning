# WonderQuest UI Adoption Strategy

## Purpose

WonderQuest will receive multiple design versions over time.

The implementation should not assume any single design file is the permanent source of truth. Instead, the app should be structured so we can combine the best parts of multiple design references without rewriting the whole UI each time.

## Operating Rule

Design files are `reference inputs`, not direct one-to-one code exports.

We will extract from each version:

- design tokens
- audience shell patterns
- route-level layout patterns
- reusable components
- interaction states

Then we will merge the strongest ideas into the app in a controlled way.

## Flexibility Layers

WonderQuest UI should stay flexible at four layers.

### 1. Shared Design Tokens

Keep these centralized and easy to swap:

- typography families
- color variables
- spacing scale
- radius scale
- shadow scale
- motion timing

This allows visual direction changes without rewriting route logic.

### 2. Audience Shells

Keep shell structure separate for:

- child
- parent
- teacher
- owner

Each audience should have its own frame, tone, navigation model, and density level.

This allows us to adopt a better parent or owner shell from a later design version without disturbing child flow code.

### 3. Route Sections

Each route should be built from sections, not one giant page blob.

Examples:

- child play:
  - top bar
  - question zone
  - visual scene
  - answer grid
  - support/explainer state
  - completion state
- parent:
  - access form
  - child switcher
  - summary stats
  - strengths/support
  - activity feed
  - feedback section
- teacher:
  - gate
  - summary stats
  - action lane
  - support/strength views
  - activity feed
- owner:
  - gate
  - alert/status strip
  - metrics
  - queue/triage section
  - route/content health
  - recent activity

This lets us replace one section from a better design version without replacing the full route.

### 4. Component Inventory

Reusable UI primitives should stay separate from route composition.

Examples:

- stat tiles
- pills and chips
- cards and panels
- section headers
- activity items
- progress bars
- child switcher chips
- alert banners
- gate forms

This prevents each new design version from forcing a ground-up rebuild.

## How We Will Use Future Design Versions

When a new design version arrives, we should classify it into one or more of these buckets:

- better tokens
- better shell
- better route layout
- better reusable component
- better state treatment

Then we adopt only the best parts.

## Decision Rules

When design versions conflict, choose based on:

1. child comprehension first
2. audience clarity second
3. engineering reuse third
4. visual polish fourth

Specific rules:

- child routes should favor lower text and clearer interaction over denser visual polish
- parent routes should favor trust and clarity over playfulness
- teacher routes should favor instructional action over decorative styling
- owner routes should favor operational readability over visual novelty

## Current Implementation Direction

The app is already moving toward this flexible structure:

- shared tokens in CSS variables
- audience-specific shell behavior
- route-level sections
- reusable UI primitives

This should continue.

## Intake Workflow For New Design Files

For each new design file:

1. store it as a temporary reference input
2. identify what audiences and routes it covers
3. extract notable patterns
4. compare it to current implementation
5. adopt only the high-value pieces
6. verify with lint, build, smoke, and Render route checks

## What We Will Not Do

- we will not rewrite the entire app for every new design file
- we will not tightly couple route logic to one static mockup
- we will not let one better screen force regressions in other audiences

## Immediate Practical Rule

Future design work should be applied in this order:

1. shells
2. route sections
3. state treatments
4. component refinements
5. decorative polish

That keeps the UI adaptable while the product is still evolving.
