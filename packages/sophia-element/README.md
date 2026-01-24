# @ethosengine/sophia-element

Web Component distribution for the Sophia assessment rendering engine.

Provides the `<sophia-question>` custom element for rendering assessment questions with Shadow DOM encapsulation. Works with any framework: Angular, React, Vue, or vanilla JavaScript.

## Installation

```bash
npm install @ethosengine/sophia-element
```

### Peer Dependencies

```bash
npm install react react-dom aphrodite @khanacademy/wonder-blocks-core
```

## Quick Start

```typescript
import { Sophia, registerSophiaElement } from "@ethosengine/sophia-element";
import type { Moment, Recognition } from "@ethosengine/sophia-element";

// 1. Configure once at app startup
Sophia.configure({
    theme: "auto",
    detectThemeFrom: "class",
});

// 2. Register the custom element
await registerSophiaElement();

// 3. Use in your HTML/template
const el = document.querySelector("sophia-question") as HTMLElement & {
    moment: Moment;
    onRecognition: (recognition: Recognition) => void;
};

el.moment = {
    id: "moment-1",
    purpose: "mastery",
    content: {
        content: "What is 2 + 2? [[input-number 1]]",
        images: {},
        widgets: {
            "input-number 1": {
                type: "input-number",
                options: { value: "4" },
            },
        },
    },
};

el.onRecognition = (recognition) => {
    console.log("Recognition:", recognition);
    if (recognition.mastery?.demonstrated) {
        console.log("Correct!");
    }
};
```

## Configuration

### Sophia.configure(options)

Call once at application startup to set global theme preferences.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | `"light"` \| `"dark"` \| `"auto"` | `"auto"` | Color theme mode |
| `detectThemeFrom` | `"system"` \| `"class"` \| `"attribute"` | `"system"` | How to detect theme in auto mode |
| `colors` | `Partial<SophiaColors>` | - | Light theme color overrides |
| `darkModeColors` | `Partial<SophiaColors>` | - | Dark theme color overrides |
| `logLevel` | `"none"` \| `"error"` \| `"warn"` \| `"debug"` | `"error"` | Debug logging level |

### Debug Logging

Enable debug logging to troubleshoot integration issues:

```typescript
Sophia.configure({
    theme: "auto",
    logLevel: "debug",  // Enable verbose logging
});
```

**Log Levels:**

| Level | Output |
|-------|--------|
| `none` | No logging output |
| `error` | Widget load failures, scoring errors (default) |
| `warn` | Theme detection fallbacks, deprecated usage |
| `debug` | Widget mount/unmount, recognition callbacks, theme changes |

You can also change the log level dynamically:

```typescript
// Enable debug logging temporarily
Sophia.setLogLevel("debug");

// Check current level
console.log(Sophia.getLogLevel()); // "debug"

// Return to normal
Sophia.setLogLevel("error");
```

The `logger` utility is also exported for use in custom extensions:

```typescript
import { logger } from "@ethosengine/sophia-element";

logger.debug("Custom debug info", { data: value });
logger.warn("Something unexpected");
logger.error("Something failed", error);
```

### Theme Detection Modes

- **`system`**: Uses `prefers-color-scheme` media query
- **`class`**: Looks for `.dark` or `.light` class on `<html>` or `<body>`
- **`attribute`**: Looks for `data-theme="dark"` or `data-theme="light"` attribute

### Sophia API Methods

```typescript
// Get current resolved theme
Sophia.getTheme(): "light" | "dark"

// Get current color palette
Sophia.getColors(): SophiaColors

// Subscribe to theme changes (returns unsubscribe function)
Sophia.onThemeChange((theme: "light" | "dark") => void): () => void

// Check if configured
Sophia.isConfigured(): boolean
```

## Element API

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `moment` | `Moment` | The assessment content to render |
| `mode` | `"mastery"` \| `"discovery"` \| `"reflection"` | Assessment mode (fallback if `moment.purpose` not set) |
| `reviewMode` | `boolean` | Display in review mode (non-interactive with feedback) |
| `locale` | `string` | Locale for i18n (default: `"en"`) |
| `hintsVisible` | `number` | Number of hints currently visible |

### Callbacks

| Callback | Signature | When Fired |
|----------|-----------|------------|
| `onAnswerChange` | `(hasValidAnswer: boolean) => void` | When user interaction changes answer validity |
| `onRecognition` | `(recognition: Recognition) => void` | When a complete answer produces a result |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getRecognition()` | `() => Recognition \| null` | Get current recognition result on demand |
| `focusInput()` | `() => void` | Focus the first input widget |
| `blur()` | `() => void` | Blur any focused input |
| `showNextHint()` | `() => void` | Show the next available hint |
| `getNumHints()` | `() => number` | Get total number of hints |
| `getState()` | `() => unknown` | Get serializable widget state |

## Recognition Output

Recognition results vary by assessment purpose.

### Mastery Mode

Graded assessment with correct/incorrect feedback:

```typescript
{
    momentId: "moment-1",
    purpose: "mastery",
    userInput: { "input-number 1": { currentValue: "4" } },
    mastery: {
        demonstrated: true,  // Whether learner showed understanding
        score: 1,            // Points earned
        total: 1,            // Total possible points
        message: "Correct!"  // Optional feedback
    },
    timestamp: 1699999999999
}
```

### Discovery Mode

Resonance mapping for psychometric assessment:

```typescript
{
    momentId: "moment-2",
    purpose: "discovery",
    userInput: { "radio 1": { choicesSelected: [true, false, false] } },
    resonance: {
        subscaleContributions: {
            "openness": 0.7,
            "conscientiousness": 0.3
        },
        selectedChoiceIds: ["choice-0"]
    },
    timestamp: 1699999999999
}
```

### Reflection Mode

Open-ended input capture without grading:

```typescript
{
    momentId: "moment-3",
    purpose: "reflection",
    userInput: { "free-response 1": { content: "My thoughts..." } },
    reflection: {
        userInput: { "free-response 1": { content: "My thoughts..." } },
        textContent: "My thoughts...",
        subscaleContributions: { "self-awareness": 1 },  // Optional
        timestamp: 1699999999999
    },
    timestamp: 1699999999999
}
```

## Types

### Moment

The unit of assessment content:

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

Result of processing user input:

```typescript
interface Recognition {
    momentId: string;
    purpose: AssessmentPurpose;
    userInput: UserInputMap;
    mastery?: MasteryResult;
    resonance?: ResonanceResult;
    reflection?: ReflectionResult;
    timestamp?: number;
}
```

## Bundle Formats

| Format | Entry Point | Use Case |
|--------|-------------|----------|
| ESM | `dist/es/index.js` | Bundlers (Vite, Webpack, Angular CLI) |
| CJS | `dist/index.js` | Node/CommonJS |
| UMD | `dist/sophia-element.umd.js` | Script tag, CDN (React bundled) |
| Styles | `dist/index.css` | CSS for ESM/CJS usage |
| UMD Styles | `dist/sophia-element.umd.css` | CSS for UMD usage |

### UMD Usage (Script Tag)

```html
<link rel="stylesheet" href="sophia-element.umd.css">
<script src="sophia-element.umd.js"></script>
<script>
    const { Sophia } = window.SophiaElement;
    Sophia.configure({ theme: "auto" });
</script>

<sophia-question id="q1"></sophia-question>
```

## Factory Functions

Convenience functions for creating moments:

```typescript
import {
    createMoment,
    createMasteryMoment,
    createDiscoveryMoment,
} from "@ethosengine/sophia-element";

// Generic moment
const moment = createMoment("id", "mastery", content, { hints });

// Shorthand for mastery
const mastery = createMasteryMoment("id", content, hints);

// Shorthand for discovery (requires subscale mappings)
const discovery = createDiscoveryMoment("id", content, subscaleMappings);
```

## Utility Functions

```typescript
import {
    isMasteryMoment,
    isDiscoveryMoment,
    hasDemonstrated,
    getPrimarySubscale,
    hasMasteryResult,
    hasResonanceResult,
} from "@ethosengine/sophia-element";

// Check moment purpose
if (isMasteryMoment(moment)) { ... }
if (isDiscoveryMoment(moment)) { ... }

// Check recognition results
if (hasDemonstrated(recognition)) { ... }
if (hasMasteryResult(recognition)) { ... }
if (hasResonanceResult(recognition)) { ... }

// Get primary subscale from resonance
const primary = getPrimarySubscale(recognition.resonance);
```

## Scoring Strategies

Register custom scoring strategies:

```typescript
import {
    registerScoringStrategy,
    getScoringStrategy,
    getRegisteredStrategyIds,
} from "@ethosengine/sophia-element";

// Register custom strategy
registerScoringStrategy({
    id: "custom",
    name: "Custom Strategy",
    getEmptyWidgetIds(content, userInput, locale) {
        // Return IDs of widgets without valid input
        return [];
    },
    recognize(moment, userInput, locale) {
        // Return Recognition result
        return { momentId: moment.id, purpose: moment.purpose, userInput };
    },
});

// Check registered strategies
console.log(getRegisteredStrategyIds()); // ["mastery", "discovery", "reflection", "noop", "custom"]
```

## License

[MIT License](http://opensource.org/licenses/MIT)
