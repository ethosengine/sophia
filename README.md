# Sophia

**Person-Centered Assessment Rendering Infrastructure**

Sophia (Wisdom) is a TypeScript monorepo for rendering interactive educational content. It transforms Khan Academy's Perseus exercise system with a decoupled assessment paradigm supporting:

- **Mastery** (graded exercises with correct/incorrect)
- **Discovery** (resonance mapping to reveal affinities)
- **Reflection** (open-ended capture without grading)
- **Governance** (formal ballot rendering with election hygiene)

The library seeks to enable learning management systems to implement cooperative Socratic methods—architecturally necessary for the distributed agentic AI dialogue envisioned by the [Elohim Protocol](https://github.com/ethosengine/elohim), which aims to scale wisdom for human flourishing.

## Quick Start

```bash
npm install @ethosengine/sophia-element
```

```typescript
import { Sophia, registerSophiaElement } from "@ethosengine/sophia-element";
import type { Moment, Recognition } from "@ethosengine/sophia-element";

// Configure once at app startup
Sophia.configure({
    theme: "auto",
    detectThemeFrom: "class",
});

// Register the custom element
await registerSophiaElement();

// Use in HTML
const el = document.querySelector("sophia-question");
el.moment = myMoment;
el.onRecognition = (recognition: Recognition) => {
    if (recognition.mastery?.demonstrated) {
        console.log("Correct!");
    } else if (recognition.resonance) {
        console.log("Primary affinity:", recognition.resonance.subscaleContributions);
    }
};
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    sophia-core (foundation)                      │
│                                                                  │
│  Types: Moment, Recognition, AssessmentPurpose                  │
│  Scoring Strategy Registry                                       │
│  Factory Functions: createMoment, createRecognition             │
└─────────────────────────────────────────────────────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
┌────┴──────────┐  ┌─────────┴─────────┐  ┌───────────┴───────────┐
│ perseus-score │  │  psyche-survey    │  │       psephos         │
│  (Mastery)    │  │  (Discovery)      │  │    (Governance)       │
│               │  │                   │  │                       │
│ Graded scoring│  │ Resonance mapping │  │ Ballot rendering with │
│ Correct/Wrong │  │ Subscale affinity │  │ election hygiene      │
└────┬──────────┘  └─────────┬─────────┘  └───────────┬───────────┘
     │                       │                        │
     └────────────────────┬──┴────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                          sophia                                  │
│                    (Main Rendering)                              │
│                                                                  │
│  Widget components, React rendering, Renderer infrastructure    │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
┌─────────┴───────────────┐   ┌───────────────────┴───────────┐
│    sophia-element       │   │      psephos-element          │
│ (Web Component+Theming) │   │   (Web Component+Theming)     │
│                         │   │                               │
│ <sophia-question>       │   │  <psephos-ballot>             │
│ UMD/ESM/CJS bundles    │   │  UMD bundle (153KB)           │
└─────────────────────────┘   └───────────────────────────────┘
```

### Design Principles

- **Rendering infrastructure only** - No application orchestration, no specific content
- **Clean separation** - sophia-core has no mastery logic; psyche-core has no Perseus dependencies
- **Extension via registry** - Widgets and strategies register themselves
- **Backwards compatible** - Perseus packages re-export from sophia-core

## Packages

### Distribution

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@ethosengine/sophia-element](packages/sophia-element) | Web Component for rendering questions | [README](packages/sophia-element/README.md) |
| [@ethosengine/psephos-element](packages/psephos-element) | Web Component for rendering governance ballots | - |

### Foundation

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@ethosengine/sophia-core](packages/sophia-core) | Core types and utilities | [README](packages/sophia-core/README.md) |
| [@ethosengine/sophia](packages/sophia) | Main rendering (widgets, components) | - |

### Assessment Modes

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@ethosengine/perseus-score](packages/perseus-score) | Mastery scoring (graded) | - |
| [@ethosengine/psyche-survey](packages/psyche-survey) | Discovery & reflection scoring | [README](packages/psyche-survey/README.md) |
| @ethosengine/psyche-core | Psychometric instruments | - |

### Governance

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@ethosengine/psephos](packages/psephos) | Ballot rendering with election hygiene (5 mechanisms) | - |
| [@ethosengine/psephos-element](packages/psephos-element) | `<psephos-ballot>` Web Component | - |

### Authoring

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@ethosengine/sophia-editor](packages/sophia-editor) | Content authoring UI | [Architecture](packages/sophia-editor/docs/ARCHITECTURE.md) |
| [@ethosengine/sophia-linter](packages/sophia-linter) | Content linting | - |

### Internal/Utilities

| Package | Description |
|---------|-------------|
| @ethosengine/perseus-core | Widget types, data schema |
| @khanacademy/math-input | Math keypad and input |
| @khanacademy/kas | Computer algebra system |
| @khanacademy/kmath | Math utilities |

## Key Concepts

### Moment

A unit of assessment content. Named "Moment" because not all are questions—some are invitations or reflections.

```typescript
interface Moment {
    id: string;
    purpose: "mastery" | "discovery" | "reflection" | "invitation" | "governance";
    content: PerseusRenderer;
    hints?: Hint[];
    subscaleContributions?: SubscaleMappings;  // For discovery/reflection
}
```

### Recognition

The result of processing a learner's response. Named "Recognition" because it acknowledges what the learner demonstrated.

```typescript
interface Recognition {
    momentId: string;
    purpose: AssessmentPurpose;
    userInput: UserInputMap;
    mastery?: MasteryResult;        // For graded assessment
    resonance?: ResonanceResult;    // For discovery assessment
    reflection?: ReflectionResult;  // For reflection assessment
    governance?: GovernanceResult;  // For governance ballots
    timestamp?: number;
}
```

### Assessment Modes

| Mode | Package | Purpose | Has "Correct" Answer |
|------|---------|---------|---------------------|
| Mastery | perseus-score | Graded exercises | Yes |
| Discovery | psyche-survey | Resonance/affinity mapping | No |
| Reflection | psyche-survey | Open-ended capture | No |
| Governance | psephos | Formal ballot rendering | No (preferences) |

## Development

### Prerequisites

- Node.js v20
- npm (pnpm commands work via npm scripts)

### Commands

```bash
npm run build          # Build all packages
npm run test           # Run tests
npm run lint           # Run ESLint
npm run storybook      # Open component gallery
npx tsc --noEmit       # Type-check all packages
```

### Package Development

```bash
# Build specific package
pnpm build --filter=sophia-element

# Type-check specific package
cd packages/sophia-core && npx tsc --noEmit

# Run tests for specific package
npm test -- --filter sophia-core
```

## Psephos — Governance Ballots

Psephos (ψῆφος, the Athenian voting pebble) is the third rendering pillar. It renders formal governance ballots with built-in election hygiene — the voting equivalent of Perseus exercise widgets.

```typescript
import { registerPsephosElement } from "@ethosengine/psephos-element";
import type { PsephosBallot, Recognition } from "@ethosengine/psephos-element";

await registerPsephosElement();

const el = document.querySelector("psephos-ballot");
el.ballot = {
    id: "ballot-1",
    purpose: "governance",
    proposal: { id: "p1", title: "Adopt new review policy", description: "...", proposalType: "consent" },
    options: [
        { id: "opt-1", label: "Consent", description: "Approve the proposal", position: 0 },
    ],
    mechanism: "consent",
    config: {},
    hygiene: { randomizeOrder: false, equalVisualWeight: true, requireReasoning: false,
               reasoningMinLength: 50, showResultsAfterVote: true, confirmBeforeSubmit: true, hideVoterCount: true },
};
el.onRecognition = (recognition: Recognition) => {
    console.log(recognition.governance?.mechanism); // "consent"
    console.log(recognition.governance?.ballots);   // [{ optionId: "opt-1", approved: true }]
};
```

**5 voting mechanisms:** approval, ranked-choice, score-vote, dot-vote, consent

**Election hygiene:** seeded option randomization, equal visual weight, confirmation interstitial, result hiding before vote, reasoning requirements for blocks

## Bundle Formats

| Bundle | Entry Point | Size | Use Case |
|--------|-------------|------|----------|
| sophia-element ESM | `dist/es/index.js` | - | Bundlers (Vite, Webpack, Angular CLI) |
| sophia-element CJS | `dist/index.js` | - | Node/CommonJS |
| sophia-element UMD | `dist/sophia-element.umd.js` | ~3.4MB | Script tag, CDN (React bundled) |
| psephos-element UMD | `dist/psephos-element.umd.js` | 153KB | Script tag (React bundled) |

## Heritage

Sophia builds on [Khan Academy's Perseus](https://github.com/Khan/perseus), the exercise rendering system powering millions of learners. The Sophia layer adds:

- Unified assessment vocabulary (Moment, Recognition)
- Non-graded assessment modes (discovery, reflection)
- Psychometric instrument infrastructure
- Mode-aware content authoring
- Clean package separation

## AI Assistant Guide

For AI assistants working on this codebase, see [CLAUDE.md](CLAUDE.md).

## License

[MIT License](http://opensource.org/licenses/MIT)
