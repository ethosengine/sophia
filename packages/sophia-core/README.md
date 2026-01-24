# @ethosengine/sophia-core

Foundation types and utilities for the Sophia assessment system.

This package provides the core vocabulary for person-centered assessment: Moments, Recognition, and scoring strategies. It serves as the foundation that other Sophia packages build upon.

## Installation

```bash
npm install @ethosengine/sophia-core
```

## Philosophy

Sophia uses intentional naming to honor learner dignity:

- **Moment** (not "Question" or "Item") - Each interaction is an opportunity for recognition
- **Recognition** (not "Score" or "Result") - We recognize what the learner demonstrated
- **Demonstrated** (not "Correct") - Emphasizes learner agency and accomplishment

## Types

### Moment

The unit of assessment content. A moment can be for mastery (graded), discovery (resonance mapping), or reflection (open-ended capture).

```typescript
interface Moment {
    id: string;
    purpose: "mastery" | "discovery" | "reflection" | "invitation";
    content: PerseusRenderer;  // Widget content
    hints?: Hint[];
    subscaleContributions?: SubscaleMappings;  // For discovery/reflection
    metadata?: MomentMetadata;
}
```

### Recognition

The result of processing user input. Contains purpose-specific results.

```typescript
interface Recognition {
    momentId: string;
    purpose: AssessmentPurpose;
    userInput: UserInputMap;
    mastery?: MasteryResult;      // For graded assessment
    resonance?: ResonanceResult;  // For discovery assessment
    reflection?: ReflectionResult; // For reflection assessment
    timestamp?: number;
}
```

### MasteryResult

Result from graded assessment:

```typescript
interface MasteryResult {
    demonstrated: boolean;  // Did learner show understanding?
    score: number;          // Points earned
    total: number;          // Total possible points
    message?: string;       // Optional feedback
}
```

### ResonanceResult

Result from discovery assessment (no "correct" answer):

```typescript
interface ResonanceResult {
    subscaleContributions: Record<string, number>;  // e.g., { openness: 0.7 }
    selectedChoiceIds?: string[];
    confidence?: number;
}
```

### ReflectionResult

Result from reflection assessment (open-ended capture):

```typescript
interface ReflectionResult {
    userInput: UserInputMap;
    subscaleContributions?: Record<string, number>;  // Optional
    timestamp: number;
    textContent?: string;  // Extracted text content
}
```

### Subscale Mappings

For discovery and reflection modes, map choices to subscale contributions:

```typescript
// Map widget ID -> choice ID -> subscale contributions
const subscaleContributions: SubscaleMappings = {
    "radio 1": {
        "choice-0": { openness: 1, creativity: 0.5 },
        "choice-1": { conscientiousness: 1 },
        "choice-2": { agreeableness: 1 },
    },
};
```

## Factory Functions

### Creating Moments

```typescript
import {
    createMoment,
    createMasteryMoment,
    createDiscoveryMoment,
    createReflectionMoment,
} from "@ethosengine/sophia-core";

// Generic moment
const moment = createMoment("id", "mastery", content, {
    hints: [{ content: "Think about..." }],
    metadata: { tags: ["algebra"] },
});

// Mastery moment (graded)
const mastery = createMasteryMoment("m-1", content, hints, metadata);

// Discovery moment (requires subscale mappings)
const discovery = createDiscoveryMoment("d-1", content, subscaleMappings, metadata);

// Reflection moment (optional subscale mappings)
const reflection = createReflectionMoment("r-1", content, {
    subscaleContributions: subscaleMappings,  // Optional
    metadata,
});
```

### Creating Recognition

```typescript
import { createRecognition } from "@ethosengine/sophia-core";

const recognition = createRecognition("moment-1", "mastery", userInput, {
    mastery: { demonstrated: true, score: 1, total: 1 },
    timestamp: Date.now(),
});
```

## Utility Functions

### Moment Type Checks

```typescript
import {
    isMasteryMoment,
    isDiscoveryMoment,
    isReflectionMoment,
} from "@ethosengine/sophia-core";

if (isMasteryMoment(moment)) {
    // moment.purpose === "mastery"
}
```

### Recognition Type Guards

```typescript
import {
    hasMasteryResult,
    hasResonanceResult,
    hasReflectionResult,
    hasDemonstrated,
    getPrimarySubscale,
} from "@ethosengine/sophia-core";

if (hasMasteryResult(recognition)) {
    console.log(recognition.mastery.demonstrated);  // TypeScript knows mastery exists
}

if (hasResonanceResult(recognition)) {
    const primary = getPrimarySubscale(recognition.resonance);
    console.log(`Primary subscale: ${primary}`);
}

if (hasDemonstrated(recognition)) {
    console.log("Learner demonstrated mastery!");
}
```

## Scoring Strategies

Scoring strategies define how to process user input and produce Recognition. Different strategies serve different assessment purposes.

### Strategy Interface

```typescript
interface ScoringStrategy {
    readonly id: string;
    readonly name: string;

    // Check which widgets are empty (not filled in)
    getEmptyWidgetIds(
        content: PerseusRenderer,
        userInput: UserInputMap,
        locale: string,
    ): ReadonlyArray<string>;

    // Process input and produce Recognition
    recognize(
        moment: Moment,
        userInput: UserInputMap,
        locale: string,
    ): Recognition;
}
```

### Registering Strategies

Strategies register themselves at import time:

```typescript
import { registerScoringStrategy } from "@ethosengine/sophia-core";

const MyScoringStrategy: ScoringStrategy = {
    id: "custom",
    name: "Custom Strategy",

    getEmptyWidgetIds(content, userInput, locale) {
        // Return IDs of widgets without valid input
        const widgetIds = Object.keys(content.widgets || {});
        return widgetIds.filter(id => !userInput[id]);
    },

    recognize(moment, userInput, locale) {
        return {
            momentId: moment.id,
            purpose: moment.purpose,
            userInput,
            timestamp: Date.now(),
        };
    },
};

registerScoringStrategy(MyScoringStrategy);
```

### Registry Functions

```typescript
import {
    getScoringStrategy,
    getDefaultScoringStrategy,
    setDefaultScoringStrategy,
    getRegisteredStrategyIds,
    hasStrategy,
} from "@ethosengine/sophia-core";

// Get strategy by ID
const strategy = getScoringStrategy("mastery");

// Get default strategy (noop if not set)
const defaultStrategy = getDefaultScoringStrategy();

// Set default strategy
setDefaultScoringStrategy("mastery");

// List all registered strategies
console.log(getRegisteredStrategyIds());  // ["noop", "mastery", "discovery", "reflection"]

// Check if strategy exists
if (hasStrategy("custom")) { ... }
```

## Built-in Strategies

| ID | Package | Purpose | Description |
|----|---------|---------|-------------|
| `noop` | sophia-core | Pass-through | Captures input without processing |
| `mastery` | perseus-score | Graded | Determines correct/incorrect with scoring |
| `discovery` | psyche-survey | Resonance | Maps choices to subscale contributions |
| `reflection` | psyche-survey | Input capture | Captures open-ended responses |

To use non-default strategies, import the providing package:

```typescript
// Import to register mastery strategy
import "@ethosengine/perseus-score";

// Import to register discovery and reflection strategies
import "@ethosengine/psyche-survey";
```

## Re-exported Types

For convenience, sophia-core re-exports Perseus types:

```typescript
export type { PerseusRenderer, Hint, UserInputMap } from "@ethosengine/perseus-core";
```

## Package Dependencies

```
sophia-core (this package)
    │
    └── perseus-core (widget types)
```

sophia-core has minimal dependencies and serves as the foundation for:
- `perseus-score` - Mastery scoring
- `psyche-survey` - Discovery and reflection scoring
- `sophia` - Main rendering package
- `sophia-element` - Web Component distribution

## License

[MIT License](http://opensource.org/licenses/MIT)
