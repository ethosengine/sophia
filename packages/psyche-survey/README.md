# @ethosengine/psyche-survey

Psychometric assessment that recognizes what resonates with learners.

This package provides discovery and reflection scoring strategies for non-graded assessment. Unlike mastery assessment, there is no "correct" answer - only what calls to the learner.

## Installation

```bash
npm install @ethosengine/psyche-survey
```

## Quick Start

```typescript
import "@ethosengine/psyche-survey";  // Auto-registers strategies
import {
    recognizeResonance,
    aggregateResonance,
    createDiscoveryMoment,
} from "@ethosengine/psyche-survey";
import type { Moment, SubscaleMappings } from "@ethosengine/psyche-survey";

// Define subscale mappings for a discovery moment
const subscaleContributions: SubscaleMappings = {
    "radio 1": {
        "choice-0": { governance: 1, leadership: 0.5 },
        "choice-1": { care: 1, empathy: 0.5 },
        "choice-2": { economic: 1, innovation: 0.5 },
    },
};

// Create a discovery moment
const moment = createDiscoveryMoment(
    "disc-1",
    {
        content: "What aspect of community interests you most? [[radio 1]]",
        widgets: { "radio 1": { type: "radio", options: { choices: [...] } } },
    },
    subscaleContributions,
);

// Process user response
const userInput = { "radio 1": { choicesSelected: [true, false, false] } };
const recognition = recognizeResonance(moment, userInput);

console.log(recognition.resonance?.subscaleContributions);
// { governance: 1, leadership: 0.5 }
```

## Scoring Strategies

This package provides two scoring strategies that auto-register on import:

| Strategy | ID | Purpose |
|----------|-----|---------|
| `DiscoveryScoringStrategy` | `"discovery"` | Maps choices to subscale contributions |
| `ReflectionScoringStrategy` | `"reflection"` | Captures open-ended responses |

### Discovery Strategy

For psychometric assessment where choices map to subscales (e.g., personality, interests, values):

```typescript
import { DiscoveryScoringStrategy } from "@ethosengine/psyche-survey";

// Recognition will contain resonance result
const recognition = DiscoveryScoringStrategy.recognize(moment, userInput, "en");
console.log(recognition.resonance?.subscaleContributions);
// { openness: 1, creativity: 0.5 }
```

### Reflection Strategy

For open-ended capture without grading:

```typescript
import { ReflectionScoringStrategy } from "@ethosengine/psyche-survey";

// Recognition will contain reflection result
const recognition = ReflectionScoringStrategy.recognize(moment, userInput, "en");
console.log(recognition.reflection?.textContent);
// "User's reflection text..."
```

## Subscale Contribution Format

Subscale mappings define how each choice contributes to psychological subscales:

```typescript
// Map: widget ID -> choice ID -> subscale contributions
const subscaleContributions: SubscaleMappings = {
    "radio 1": {
        "choice-0": { openness: 1, creativity: 0.5 },
        "choice-1": { conscientiousness: 1 },
        "choice-2": { agreeableness: 1 },
    },
    "radio 2": {
        "choice-0": { introversion: 1 },
        "choice-1": { extraversion: 1 },
    },
};
```

### Choice ID Formats

- **Index-based**: `"choice-0"`, `"choice-1"`, etc.
- **Widget-prefixed**: `"radio 1-choice-0"` (for older Perseus format)

## Aggregation Utilities

Aggregate resonance across multiple moments to reveal overall affinities:

### aggregateResonance

```typescript
import { aggregateResonance } from "@ethosengine/psyche-survey";

const recognitions = [recognition1, recognition2, recognition3];
const aggregated = aggregateResonance(recognitions);

console.log(aggregated);
// {
//   subscaleTotals: { governance: 3, care: 2, economic: 1 },
//   primarySubscale: "governance",
//   momentCount: 3,
//   normalizedScores: { governance: 1, care: 0.67, economic: 0.33 }
// }
```

### getSubscaleRankings

Get subscales ordered by total contribution:

```typescript
import { getSubscaleRankings } from "@ethosengine/psyche-survey";

const rankings = getSubscaleRankings(aggregated);
// [
//   { subscale: "governance", total: 3, normalized: 1 },
//   { subscale: "care", total: 2, normalized: 0.67 },
//   { subscale: "economic", total: 1, normalized: 0.33 },
// ]
```

### hasClearPrimary

Check if primary subscale is significantly higher than others:

```typescript
import { hasClearPrimary } from "@ethosengine/psyche-survey";

if (hasClearPrimary(aggregated, 0.2)) {  // 20% threshold
    console.log(`Clear primary: ${aggregated.primarySubscale}`);
} else {
    console.log("No clear dominant subscale");
}
```

### mergeAggregatedResonance

Combine results from multiple sessions:

```typescript
import { mergeAggregatedResonance } from "@ethosengine/psyche-survey";

const combined = mergeAggregatedResonance([session1Result, session2Result]);
```

### createInsightMessage

Generate human-readable insight text:

```typescript
import { createInsightMessage } from "@ethosengine/psyche-survey";

const message = createInsightMessage(aggregated, {
    governance: "Community Leadership",
    care: "Compassionate Service",
    economic: "Economic Innovation",
});
// "Your responses resonate most strongly with Community Leadership,
//  with secondary interest in Compassionate Service."
```

## Resonance Recognition Functions

### recognizeResonance

Process a discovery moment and extract subscale contributions:

```typescript
import { recognizeResonance } from "@ethosengine/psyche-survey";

const recognition = recognizeResonance(moment, userInput);
```

### getPrimarySubscale

Get the subscale with the highest contribution:

```typescript
import { getPrimarySubscale } from "@ethosengine/psyche-survey";

if (recognition.resonance) {
    const primary = getPrimarySubscale(recognition.resonance);
    console.log(`Primary subscale: ${primary}`);
}
```

### hasResonance

Check if recognition contains resonance data:

```typescript
import { hasResonance } from "@ethosengine/psyche-survey";

if (hasResonance(recognition)) {
    // Process resonance result
}
```

## Reflection Mode

Reflection mode captures open-ended responses without grading:

```typescript
import { ReflectionScoringStrategy, createReflectionMoment } from "@ethosengine/psyche-survey";
import { createReflectionMoment } from "@ethosengine/sophia-core";

// Create reflection moment (subscale contributions optional)
const moment = createReflectionMoment("refl-1", content, {
    subscaleContributions,  // Optional - for tracking themes
});

// Process response
const recognition = ReflectionScoringStrategy.recognize(moment, userInput, "en");

// Access captured content
console.log(recognition.reflection?.textContent);      // Extracted text
console.log(recognition.reflection?.subscaleContributions);  // Optional subscales
console.log(recognition.reflection?.timestamp);        // When captured
```

### Reflection Result Structure

```typescript
interface ReflectionResult {
    userInput: UserInputMap;           // Raw widget input
    textContent?: string;              // Extracted text from free-response widgets
    subscaleContributions?: Record<string, number>;  // If moment defines them
    timestamp: number;                 // Capture timestamp
}
```

## Widget Support

### Discovery Mode

Supports these widget types for extracting choices:

- `radio` - Single choice selection
- `dropdown` - Dropdown selection
- `orderer` - Ranking/ordering
- `sorter` - Category sorting

### Reflection Mode

Supports text extraction from:

- `free-response` - Open-ended text input
- `input-number` - Numeric input (captured as text)

## Re-exported Types

For convenience, this package re-exports commonly used types:

```typescript
export type {
    Moment,
    Recognition,
    ResonanceResult,
    AggregatedResonance,
    SubscaleMappings,
    ChoiceSubscaleMap,
    SubscaleContribution,
    UserInputMap,
} from "@ethosengine/sophia-core";

export {
    createDiscoveryMoment,
    createRecognition,
    isDiscoveryMoment,
} from "@ethosengine/sophia-core";
```

## Package Dependencies

```
sophia-core (types, factory functions)
    │
    └── psyche-survey (this package)
            │
            └── Registers discovery and reflection strategies
```

## Use Cases

- **Personality Assessment**: Map choices to Big Five or other personality subscales
- **Interest Inventory**: Discover learner affinities for different topics
- **Values Assessment**: Identify what resonates with learners
- **Journaling**: Capture reflections for later analysis
- **Self-Assessment**: Non-graded self-reflection exercises

## License

[MIT License](http://opensource.org/licenses/MIT)
