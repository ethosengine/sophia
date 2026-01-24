# Sophia Development Guide for AI Assistants

This document provides essential information for AI assistants working on the Sophia codebase.

## Core Separation of Concerns

**Three domains, cleanly separated:**

| Domain | Purpose | Has "Correct" Answer |
|--------|---------|---------------------|
| **sophia** | Common foundation + rendering infrastructure | N/A |
| **perseus** | Mastery assessment (graded exercises) | Yes |
| **psyche** | Psychometrics + reflection collection | No |

```
┌─────────────────────────────────────────────────────────────────┐
│                    sophia (common layer)                         │
│                                                                  │
│  sophia-core       sophia-linter        sophia-editor            │
│  (types)           (mode-aware rules)   (mode-aware editing)     │
│                                                                  │
│  simple-markdown   math-input           kas / kmath              │
│  pure-markdown     keypad-context       (math utilities)         │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
┌─────────┴─────────┐               ┌─────────────┴─────────────┐
│   perseus         │               │   psyche                   │
│   (Mastery)       │               │   (Discovery/Reflection)   │
│                   │               │                            │
│  perseus-core     │               │   psyche-core              │
│  (minimal types)  │               │   (types + instruments)    │
│  perseus-score    │               │                            │
└─────────┬─────────┘               └─────────────┬──────────────┘
          │                                       │
          └───────────────────┬───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         sophia                                   │
│                    (Main Rendering)                              │
│                                                                  │
│  - Widget components                                             │
│  - React rendering                                               │
│  - Renderer infrastructure                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      sophia-element           │
              │   (Web Component + Theming)   │
              │                               │
              │  - <sophia-question> element  │
              │  - Sophia.configure() API     │
              │  - Shadow DOM + theme system  │
              │  - UMD/ESM/CJS bundles        │
              └───────────────────────────────┘
```

**Design Principles:**
- **Rendering infrastructure only** - No application orchestration, no content definitions
- **Clean separation** - sophia is generic; perseus adds mastery; psyche adds reflection
- **psyche has NO Perseus dependencies** - Can be used without mastery assessment
- **Extension via registry** - Widgets and instruments register themselves

## Quick Start Commands

### Development
```bash
npm run build              # Build all packages
npm run storybook          # Launch Storybook documentation
npm run test               # Run tests
npx tsc --noEmit           # Type-check all packages
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run lint -- --fix      # Auto-fix linting issues
```

### Testing Specific Packages
```bash
npm test -- --filter sophia           # Test main sophia rendering package
npm test -- --filter sophia-core      # Test sophia-core
```

## Package Structure

```
packages/
├── sophia-core/         # Foundation types and utilities
├── sophia/              # Main rendering (widgets, components) ← RENAMED from perseus
│   ├── src/widgets/     # Widget implementations
│   └── src/components/  # Reusable components
├── sophia-element/      # Web Component + theming (plug-and-play distribution)
├── sophia-linter/       # Mode-aware content linting (mastery, discovery, reflection)
├── sophia-editor/       # Mode-aware content authoring UI
├── psyche-survey/       # Discovery/resonance processing
│
├── psyche-core/         # Reflection/psychometric infrastructure
│
├── perseus-core/        # Mastery-specific types only (KEScore, validation)
├── perseus-score/       # Widget scoring → Sophia Recognition
└── math-input/          # Math keypad and input
```

### Migration Note
The following packages were renamed:
- `@khanacademy/perseus` → `@ethosengine/sophia` (main rendering)
- `@khanacademy/perseus-linter` → `@ethosengine/sophia-linter` (mode-aware)
- `@khanacademy/perseus-editor` → `@ethosengine/sophia-editor` (mode-aware)

Pending consolidation (future work):
- Move common widget logic from `perseus-core` → `sophia-core`
- Reduce `perseus-core` to mastery-specific types only (KEScore, validation)

## Callback Architecture

Sophia follows the same callback pattern used by Khan Academy's Perseus: **rendering provides callback hooks, consumers aggregate**.

### The Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  RENDERING LAYER (Sophia)                                       │
│                                                                  │
│  <sophia-question>                                              │
│    ├── mode: 'mastery' | 'discovery' | 'reflection'             │
│    ├── onRecognition: (Recognition) => void  ← CALLBACK         │
│    └── getRecognition(): Recognition         ← METHOD           │
│                                                                  │
│  Internal: Uses Perseus for mastery, Psyche for discovery/refl. │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Recognition { mastery?, resonance?, reflection? }
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CONSUMER LAYER (Lamad/Elohim-App)                              │
│                                                                  │
│  For Mastery:                                                   │
│    ├── StreakTrackerService (consecutive correct)               │
│    ├── QuizSessionService (aggregation)                         │
│    └── Points/Levels system (platform responsibility)           │
│                                                                  │
│  For Psychometrics:                                             │
│    ├── PsychometricSessionService (aggregation)                 │
│    ├── Instrument definitions (consumer-defined)                │
│    └── Interpretation logic (consumer responsibility)           │
└─────────────────────────────────────────────────────────────────┘
```

### Perseus Pattern (Mastery)

Perseus provides callback hooks:
- **Callbacks:** `interactionCallback`, `trackInteraction`
- **Method:** `renderer.score()` → `PerseusScore`
- **Consumer wraps:** Creates `MasteryResult`, feeds to aggregation services

### Psyche Pattern (Psychometrics) - Same Structure

- **Callback:** `onRecognition` → `Recognition` with subscale contributions
- **Method:** `getRecognition()` → `Recognition`
- **Consumer brings:** Instrument definitions, aggregation, interpretation

### What Rendering Does NOT Do

- ❌ Aggregate results across questions (consumer responsibility)
- ❌ Define instruments (consumer responsibility)
- ❌ Interpret results (consumer responsibility)
- ❌ Manage sessions (consumer responsibility)

### Why This Matters

Khan Academy's platform aggregates Perseus scores into points, levels, and mastery progress. Lamad does the same - Sophia renders and produces Recognition callbacks, Lamad aggregates into QuizSessionService results.

---

## Key Concepts

### Moment (not "Question")
A unit of assessment content. Named "Moment" because not all are questions - some are invitations, reflections, or interactions.

```typescript
interface Moment {
    id: string;
    purpose: "mastery" | "discovery" | "reflection" | "invitation";
    content: PerseusRenderer;
    hints?: Hint[];
    subscaleContributions?: SubscaleMappings;  // For discovery/reflection
}
```

### Recognition (not "Score")
The result of processing a learner's response. Named "Recognition" because it acknowledges what the learner demonstrated, not just correctness.

```typescript
interface Recognition {
    momentId: string;
    purpose: AssessmentPurpose;
    userInput: UserInputMap;
    mastery?: MasteryResult;       // For graded: { demonstrated, score, total, message }
    resonance?: ResonanceResult;   // For discovery: { subscaleContributions }
    reflection?: ReflectionResult; // For reflection: { userInput, textContent, timestamp }
    timestamp?: number;
}
```

### Assessment Modes

| Mode | Package | Purpose | Has "Correct" Answer |
|------|---------|---------|---------------------|
| Mastery | perseus-score | Graded exercises | Yes |
| Discovery | psyche-survey | Resonance/affinity mapping | No |
| Reflection | psyche-survey | Open-ended capture | No |

## sophia-element: Plug-and-Play Distribution

The `sophia-element` package (`packages/sophia-element/`) is the **primary distribution
mechanism** for consuming Sophia in any framework. It provides:

- **`<sophia-question>` Web Component** - Works in Angular, React, Vue, vanilla JS
- **`Sophia.configure()` API** - One-time theme configuration
- **Shadow DOM encapsulation** - Styles don't leak in or out
- **Auto theme detection** - System preference, CSS class, or data attribute

### Public API

```typescript
// Configuration singleton - call once at app startup
import { Sophia } from '@ethosengine/sophia-element';

Sophia.configure({
  theme: 'auto',              // 'light', 'dark', or 'auto'
  detectThemeFrom: 'class',   // 'system', 'class', or 'attribute'
  colors: { primary: '#673ab7' }  // Optional color overrides
});

// Web Component (auto-registered on import)
export { SophiaQuestionElement, registerSophiaElement };

// Types from sophia-core
export type { Moment, Recognition, MasteryResult, ResonanceResult, ReflectionResult };
```

### Usage Pattern

```typescript
// Any framework - configure once at app startup
Sophia.configure({ theme: 'auto', detectThemeFrom: 'class' });

// Use the element
const el = document.querySelector('sophia-question');
el.moment = myMoment;
el.onRecognition = (recognition) => {
  // For mastery: recognition.mastery.demonstrated, .score
  // For discovery: recognition.resonance.subscaleContributions
  // For reflection: recognition.reflection.textContent, .timestamp
};
```

### Output Formats

| Format | File | Use Case |
|--------|------|----------|
| ESM | `dist/es/index.js` | Bundlers (Vite, Webpack, Angular CLI) |
| CJS | `dist/index.js` | Node/CommonJS |
| UMD | `dist/sophia.umd.js` | Script tag, CDN (React bundled) |

## sophia-plugin: Angular Wrapper (elohim-library)

The `sophia-plugin` package (in `elohim-library/projects/sophia-plugin/`) is a **thin
Angular wrapper** that re-exports from sophia-element:

```typescript
// Re-exports everything from sophia-element
export { Sophia, SophiaQuestionElement, registerSophiaElement } from '@ethosengine/sophia-element';
export type { Moment, Recognition } from '@ethosengine/sophia-element';

// Plus Angular-specific wrapper
export { SophiaWrapperComponent } from './sophia-wrapper.component';
```

**All core logic lives in sophia-element.** sophia-plugin just provides:
- Re-exports for convenience
- Optional `SophiaWrapperComponent` with Angular `@Input`/`@Output` bindings
- Auto-registration on import

### Why This Separation Matters

Sophia is the **rendering layer**. Processing (aggregation, interpretation, session
management) belongs in the consuming application's services. This keeps Sophia
focused on its core responsibility: rendering assessment content and producing
Recognition results.

---

## Package Dependencies

```
sophia-core (foundation types)
    │
    ├── psyche-survey (discovery)
    ├── psyche-core (reflection) ← NO Perseus dependencies
    │
    ├── sophia-linter (mode-aware linting)
    ├── sophia-editor (mode-aware editing)
    │
    ├── perseus-core (widget types, mastery types)
    │       │
    │       └── perseus-score → outputs Recognition directly
    │
    └── sophia (main rendering - widgets, components)
            │
            └── sophia-element (Web Component distribution)
                    │
                    └── sophia-plugin (thin Angular wrapper, in elohim-library)
```

**Key constraints:**
- psyche-core must NEVER depend on perseus packages
- sophia-element bundles everything for distribution
- sophia-plugin re-exports from sophia-element (no logic duplication)

### Import Guidelines
- **For consumers**: Import from `@ethosengine/sophia-element` (or `@elohim/sophia-plugin`)
- Sophia packages: `@ethosengine/sophia-core`, `@ethosengine/sophia`, `@ethosengine/sophia-utils`, `@ethosengine/sophia-linter`, `@ethosengine/sophia-editor`, `@ethosengine/psyche-core`
- Perseus packages (internal only): `@ethosengine/perseus-core`, `@ethosengine/perseus-score`
- Utility packages (staying @khanacademy): `@khanacademy/kas`, `@khanacademy/kmath`, `@khanacademy/math-input`, `@khanacademy/simple-markdown`
- NO file extensions in imports
- NO cross-package relative imports

### Example Imports
```typescript
// CONSUMERS: Use sophia-element for the Web Component
import { Sophia, SophiaQuestionElement } from "@ethosengine/sophia-element";
import type { Moment, Recognition } from "@ethosengine/sophia-element";

// Foundation types (also re-exported from sophia-element)
import {Moment, Recognition} from "@ethosengine/sophia-core";

// Widget types (in perseus-core)
import type {PerseusRenderer, KEScore} from "@ethosengine/perseus-core";

// Main rendering package
import {ServerItemRenderer} from "@ethosengine/sophia";

// Mastery (graded) assessment scoring
import {recognizeMastery} from "@ethosengine/perseus-score";

// Reflection/psychometric assessment
import {interpretReflection} from "@ethosengine/psyche-core";
```

## Scoring Strategies

Sophia uses a registry of scoring strategies to process user input into Recognition results:

| Strategy ID | Package | Purpose | Registered On |
|-------------|---------|---------|---------------|
| `noop` | sophia-core | Pass-through (no processing) | Always |
| `mastery` | perseus-score | Graded scoring | Import |
| `discovery` | psyche-survey | Subscale mapping | Import |
| `reflection` | psyche-survey | Open-ended capture | Import |

### Using Strategies

```typescript
import { getScoringStrategy, registerScoringStrategy } from "@ethosengine/sophia-core";

// Get a registered strategy
const mastery = getScoringStrategy("mastery");

// Register a custom strategy
registerScoringStrategy({
    id: "custom",
    name: "Custom Strategy",
    getEmptyWidgetIds(content, userInput, locale) { return []; },
    recognize(moment, userInput, locale) {
        return { momentId: moment.id, purpose: moment.purpose, userInput };
    },
});
```

### Type Guards

```typescript
import { hasMasteryResult, hasResonanceResult, hasReflectionResult } from "@ethosengine/sophia-core";

if (hasMasteryResult(recognition)) {
    console.log(recognition.mastery.demonstrated);  // TypeScript knows mastery exists
}
if (hasResonanceResult(recognition)) {
    console.log(recognition.resonance.subscaleContributions);
}
if (hasReflectionResult(recognition)) {
    console.log(recognition.reflection.textContent);
}
```

---

## Scope Boundaries

### What belongs in these packages:
- Rendering types and utilities
- Response processing (scoring, aggregation)
- Generic frameworks (instrument registry, parser combinators)
- Widget infrastructure

### What does NOT belong:
- Specific instrument definitions (Enneagram, MBTI, etc.)
- Application orchestration (session management, persistence)
- Content/curriculum definitions
- UI components (those go in the consuming application)

## Widget Development

### Creating a New Widget
1. **Create directory**: `packages/sophia/src/widgets/[widget-name]/`
2. **Implement files**:
   - `[widget-name].tsx` - Main component
   - `[widget-name].test.ts` - Tests
   - `index.ts` - Exports
   - `__docs__/[widget-name].stories.tsx` - Storybook story
3. **Register widget** in `packages/sophia/src/widgets.ts`
4. **Add scoring** in `packages/perseus-score/src/widgets/[widget-name]/`
5. **Add types** to `packages/sophia-core/src/data-schema.ts`

### Widget Implementation Pattern
```typescript
export default {
    name: "widget-name",
    displayName: "Widget Display Name",
    widget: WidgetComponent,
    isLintable: true,
} as WidgetExports<typeof WidgetComponent>;
```

## psyche-core Usage

### Instrument Registry
Instruments register themselves - psyche-core doesn't define specific frameworks:

```typescript
import {registerInstrument, interpretReflection} from "@ethosengine/psyche-core";

// Application-layer code registers instruments
registerInstrument({
    id: "my-instrument",
    name: "My Instrument",
    category: "personality",
    subscales: [...],
    scoringConfig: { method: "highest-subscale" }
});

// Later, interpret aggregated responses
const interpretation = interpretReflection("my-instrument", aggregatedData);
```

### Scoring Methods
- `highest-subscale` - Result is subscale with highest score
- `threshold-based` - Types determined by meeting thresholds
- `profile-matching` - Compare to predefined profiles (cosine similarity)
- `dimensional` - Return multi-dimensional profile without typing

## Testing Guidelines

### Test Structure
```typescript
import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";

describe("WidgetComponent", () => {
    it("renders correctly", () => {
        render(<WidgetComponent {...question1} />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });
});
```

### Writing Tests
- Use `it` for individual test cases
- Use `describe` to group related tests
- Follow AAA pattern: Arrange, Act, Assert

## Common Issues

### Module Resolution
If you see `Cannot find module '@ethosengine/sophia-core'`:
- Check tsconfig.json has path mappings for `@ethosengine/*`
- Ensure sophia-core is built: `cd packages/sophia-core && npx tsc -p tsconfig-build.json`

### Type Errors After Refactoring
Run full type-check to catch cascading issues:
```bash
npx tsc --noEmit
```

### Build Order
Packages must build in dependency order:
1. sophia-core (foundation types)
2. psyche-core, psyche-survey, perseus-core (domain packages)
3. sophia-linter, sophia-editor (mode-aware tooling)
4. perseus-score, sophia (main rendering)
5. **sophia-element** (Web Component distribution)

To build sophia-element:
```bash
pnpm build --filter=sophia-element
```

To build everything in order:
```bash
pnpm build
```

After sophia-element is built, sophia-plugin (in elohim-library) can be built:
```bash
cd elohim-library/projects/sophia-plugin && npm run build
```

### Large Minified Files (AI Safety)
**WARNING**: Do not read or cat the full contents of large minified bundles like `sophia-element.umd.js` (3.4MB). This can crash or hang AI assistants due to context limits.

Safe alternatives:
```bash
# Check file exists and size
ls -la dist/sophia-element.umd.js

# Check first few bytes (e.g., for process shim)
head -c 200 dist/sophia-element.umd.js

# Check HTTP headers only
curl -s -I "http://localhost:4200/assets/sophia-plugin/sophia-element.umd.js" | head -5
```

## Resources

- **Storybook**: `npm run storybook` for component gallery
- **Sophia Architecture**: See `packages/sophia/src/__docs__/`
- **Khan Academy Perseus**: [github.com/Khan/perseus](https://github.com/Khan/perseus) (original fork source)

---

## AI Assistant Resources

Sophia includes resources for AI assistants to help with integration and content creation.

### Subagent

The **sophia-integrator** agent (`.claude/agents.json`) helps integrators with:
- Framework integration (Angular, React, Vue, vanilla JS)
- Assessment mode selection and content creation
- Theming and configuration
- Scoring strategy implementation

### Content Authoring Skills

Located in `.claude/skills/`:

| Skill | Audience | Purpose |
|-------|----------|---------|
| **sophia-mastery** | Teachers | Creating graded knowledge assessments |
| **sophia-discovery** | Researchers | Creating psychometric instruments |
| **sophia-moment** | Developers | Shared schema and type reference |

Each skill includes:
- Comprehensive documentation (`SKILL.md`)
- JSON schemas for validation (`schemas/`)
- Example files (`examples/`)

### Usage

When working with Sophia, Claude Code will automatically use these resources. Integrators can also explicitly invoke:

```
Use the sophia-integrator agent to help me integrate Sophia into my Angular app
```

Or reference the skills for content creation guidance.

---

*This document is maintained for AI assistants. For human developers, see README.md.*
