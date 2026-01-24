# Sophia Moment Authoring Skill

A skill for creating Sophia assessment content for the Elohim Protocol lamad learning platform.

## What is Sophia?

Sophia is our **person-centered assessment framework** that extends Khan Academy's Perseus rendering engine with support for three distinct assessment modes:

| Mode | Purpose | Has Correct Answer | Use Case |
|------|---------|-------------------|----------|
| **Mastery** | Knowledge verification | Yes | Graded exercises, quizzes |
| **Discovery** | Self-discovery, psychometrics | No | Personality, interest inventories |
| **Reflection** | Open-ended journaling | No | Metacognition, self-assessment |

**GitHub**: Sophia is based on [Khan Academy Perseus](https://github.com/Khan/perseus), extended in `sophia/packages/`.

---

## Core Concept: The Moment

A **Moment** is a unit of assessment content. We call it "Moment" rather than "Question" because not all assessments are questions - some are invitations, reflections, or interactions.

```typescript
interface Moment {
  id: string;                           // Unique identifier
  purpose: "mastery" | "discovery" | "reflection";
  content: PerseusRenderer;             // Widget-based content
  hints?: Hint[];                       // Progressive hints (mastery only)
  subscaleContributions?: SubscaleMappings;  // For discovery/reflection
  metadata: MomentMetadata;
}
```

---

## Widget Placeholder Syntax

Moments embed widgets using the **snowman placeholder** format:

```
[[☃ widget-type index]]
```

**Examples:**
- `[[☃ radio 1]]` - Multiple choice widget
- `[[☃ numeric-input 1]]` - Number input widget
- `[[☃ expression 1]]` - Math expression widget
- `[[☃ dropdown 1]]` - Dropdown selection
- `[[☃ free-response 1]]` - Open-ended text (reflection)

The `☃` character is U+2603 SNOWMAN. The index allows multiple widgets of the same type.

---

## Assessment File Structure

A complete assessment file wraps multiple moments:

```json
{
  "id": "assessment-unique-id",
  "contentType": "assessment",
  "title": "Assessment Title",
  "description": "Brief description",
  "content": [
    { /* Moment 1 */ },
    { /* Moment 2 */ },
    { /* Moment 3 */ }
  ],
  "contentFormat": "sophia-moment-json",
  "tags": ["tag1", "tag2"],
  "relatedNodeIds": ["content-node-1"],
  "metadata": {
    "assessmentType": "mastery" | "discovery" | "reflection",
    "questionCount": 5,
    "instrumentId": "optional-instrument-id"
  }
}
```

---

## Creating Mastery Moments

Mastery moments have **correct** and **incorrect** answers for knowledge verification.

### Basic Multiple Choice

```json
{
  "id": "gf-q1",
  "purpose": "mastery",
  "content": {
    "content": "What is the capital of France?\n\n[[☃ radio 1]]",
    "images": {},
    "widgets": {
      "radio 1": {
        "type": "radio",
        "options": {
          "choices": [
            { "content": "Paris", "correct": true, "id": "choice-0" },
            { "content": "London", "correct": false, "id": "choice-1" },
            { "content": "Berlin", "correct": false, "id": "choice-2" },
            { "content": "Madrid", "correct": false, "id": "choice-3" }
          ],
          "randomize": true,
          "multipleSelect": false
        },
        "graded": true,
        "version": { "major": 0, "minor": 0 }
      }
    }
  },
  "hints": [
    {
      "content": "Think about the Eiffel Tower's location.",
      "images": {},
      "widgets": {}
    }
  ],
  "metadata": {
    "sourceContentId": "quiz-geography",
    "assessesContentId": "european-capitals",
    "bloomsLevel": "remember",
    "difficulty": "easy",
    "estimatedTimeSeconds": 20,
    "questionType": "core",
    "tags": ["geography", "capitals"]
  }
}
```

### Key Mastery Requirements

1. **`purpose: "mastery"`** - Identifies this as a graded moment
2. **`graded: true`** on widget - Enables scoring
3. **Exactly one `correct: true`** per radio widget (unless multipleSelect)
4. **Each choice needs `id`** - For scoring consistency
5. **Hints are optional** but recommended for learning

---

## Creating Discovery Moments

Discovery moments have **no correct answers**. Each choice contributes to personality/preference subscales.

### Subscale Contributions

Each choice maps to subscales with numeric weights (0-1):

```json
{
  "subscaleContributions": {
    "radio 1": {
      "0": { "governance": 1, "care": 0, "economic": 0, "public": 0, "social": 0 },
      "1": { "governance": 0, "care": 1, "economic": 0, "public": 0, "social": 0 },
      "2": { "governance": 0, "care": 0, "economic": 1, "public": 0, "social": 0 }
    }
  }
}
```

The outer key (`"radio 1"`) matches the widget ID. The inner keys (`"0"`, `"1"`) are choice indices.

### Complete Discovery Moment

```json
{
  "id": "d-q1",
  "purpose": "discovery",
  "content": {
    "content": "Which of these activities interests you most?\n\n[[☃ radio 1]]",
    "images": {},
    "widgets": {
      "radio 1": {
        "type": "radio",
        "options": {
          "choices": [
            { "content": "Shaping AI policy and constitutional frameworks", "id": "d-q1-choice-0" },
            { "content": "Supporting caregivers and recognizing invisible work", "id": "d-q1-choice-1" },
            { "content": "Transforming workplace ownership models", "id": "d-q1-choice-2" },
            { "content": "Improving civic engagement and transparency", "id": "d-q1-choice-3" },
            { "content": "Building healthier online communities", "id": "d-q1-choice-4" }
          ],
          "randomize": false,
          "multipleSelect": false
        },
        "graded": false,
        "version": { "major": 0, "minor": 0 }
      }
    }
  },
  "subscaleContributions": {
    "radio 1": {
      "0": { "governance": 1, "care": 0, "economic": 0, "public": 0, "social": 0 },
      "1": { "governance": 0, "care": 1, "economic": 0, "public": 0, "social": 0 },
      "2": { "governance": 0, "care": 0, "economic": 1, "public": 0, "social": 0 },
      "3": { "governance": 0, "care": 0, "economic": 0, "public": 1, "social": 0 },
      "4": { "governance": 0, "care": 0, "economic": 0, "public": 0, "social": 1 }
    }
  },
  "metadata": {
    "sourceContentId": "quiz-who-are-you",
    "bloomsLevel": "remember",
    "difficulty": "medium",
    "estimatedTimeSeconds": 30,
    "questionType": "core",
    "tags": ["discovery", "onboarding", "personalization"],
    "instrumentId": "epic-domain"
  }
}
```

### Key Discovery Requirements

1. **`purpose: "discovery"`** - Identifies this as a psychometric moment
2. **`graded: false`** on widget - No scoring
3. **No `correct` field** on choices - All choices are valid
4. **`subscaleContributions` required** - Maps choices to subscales
5. **All subscales included** - Even with value 0
6. **`instrumentId` in metadata** - Links to psychometric instrument

### Elohim Epic Domain Subscales

For Elohim Protocol discovery assessments:

| Subscale | Epic Domain | Theme |
|----------|-------------|-------|
| `governance` | AI Constitutional | AI policy, democratic oversight |
| `care` | Value Scanner | Caregiving, invisible work recognition |
| `economic` | Economic Coordination | Workplace ownership, economic equity |
| `public` | Public Observer | Civic participation, transparency |
| `social` | Social Medium | Digital spaces, online communication |

---

## Creating Reflection Moments

Reflection moments capture open-ended text responses for journaling and metacognition.

### Basic Reflection

```json
{
  "id": "r-q1",
  "purpose": "reflection",
  "content": {
    "content": "What aspect of AI governance concerns you most, and why?\n\n[[☃ free-response 1]]",
    "images": {},
    "widgets": {
      "free-response 1": {
        "type": "free-response",
        "options": {
          "placeholder": "Share your thoughts...",
          "allowUnlimitedCharacters": false,
          "characterLimit": 500,
          "question": "What aspect of AI governance concerns you most?"
        },
        "graded": false,
        "version": { "major": 0, "minor": 0 }
      }
    }
  },
  "metadata": {
    "sourceContentId": "reflection-governance",
    "bloomsLevel": "evaluate",
    "difficulty": "medium",
    "estimatedTimeSeconds": 120,
    "questionType": "synthesis",
    "tags": ["reflection", "governance", "metacognition"]
  }
}
```

### Reflection with Subscale Hints

Reflections can optionally map to subscales for deeper insights:

```json
{
  "id": "r-q2",
  "purpose": "reflection",
  "content": { /* ... */ },
  "subscaleContributions": {
    "free-response 1": {
      "any": { "openness": 0.5, "conscientiousness": 0.3 }
    }
  },
  "metadata": { /* ... */ }
}
```

---

## Supported Widget Types

### Primary Widgets

| Widget | Type Key | Use For |
|--------|----------|---------|
| Multiple Choice | `radio` | Single/multiple selection |
| Number Input | `numeric-input` | Numeric answers |
| Math Expression | `expression` | Algebraic expressions |
| Dropdown | `dropdown` | Inline dropdown |
| Free Response | `free-response` | Open-ended text |

### Ordering & Matching

| Widget | Type Key | Use For |
|--------|----------|---------|
| Sorter | `sorter` | Put items in order |
| Orderer | `orderer` | Drag-and-drop arrange |
| Matcher | `matcher` | Match columns |
| Categorizer | `categorizer` | Sort into categories |

### Full Widget List

See `sophia/packages/perseus-core/src/data-schema.ts` for complete widget type definitions.

---

## Metadata Reference

### Required Fields

```json
{
  "sourceContentId": "quiz-id",          // Source assessment ID
  "bloomsLevel": "remember",             // Cognitive level
  "difficulty": "medium",                // easy | medium | hard
  "estimatedTimeSeconds": 30,            // Expected completion time
  "questionType": "core",                // core | applied | synthesis
  "tags": ["tag1", "tag2"]              // For filtering
}
```

### Optional Fields

```json
{
  "assessesContentId": "content-node",   // Content being assessed (mastery)
  "instrumentId": "epic-domain",         // Psychometric instrument (discovery)
  "createdAt": "2025-01-24T00:00:00Z"   // Creation timestamp
}
```

### Bloom's Taxonomy Levels

| Level | Description | Question Stems |
|-------|-------------|----------------|
| `remember` | Recall facts | "What is...", "Name the..." |
| `understand` | Explain concepts | "Why does...", "Describe..." |
| `apply` | Use in situations | "How would you use...", "Calculate..." |
| `analyze` | Break down, compare | "Compare...", "Analyze..." |
| `evaluate` | Judge, defend | "Which is better...", "Evaluate..." |
| `create` | Produce new work | "Design...", "Create..." |

---

## Validation Checklist

Before outputting assessment JSON, verify:

### All Moments
- [ ] Each moment has unique `id`
- [ ] `purpose` is one of: `mastery`, `discovery`, `reflection`
- [ ] Content uses correct placeholder syntax `[[☃ widget-type index]]`
- [ ] Widget key matches placeholder (e.g., `"radio 1"` for `[[☃ radio 1]]`)
- [ ] Widget has `version: { major: 0, minor: 0 }`
- [ ] All choices have unique `id` field
- [ ] Metadata has all required fields
- [ ] Tags are lowercase and consistent

### Mastery Moments
- [ ] `graded: true` on widget
- [ ] Exactly one `correct: true` per radio widget
- [ ] Hints provide learning guidance without giving away answer

### Discovery Moments
- [ ] `graded: false` on widget
- [ ] No `correct` field on choices
- [ ] `subscaleContributions` includes all subscales (even with 0)
- [ ] Each choice index has a mapping
- [ ] `instrumentId` in metadata

### Reflection Moments
- [ ] Uses `free-response` widget type
- [ ] `graded: false` on widget
- [ ] Character limit is reasonable (100-1000)

---

## Common Mistakes to Avoid

1. **Missing choice IDs**: Every choice needs an `id` field for consistent scoring
2. **Wrong widget placeholder**: Use `☃` (snowman U+2603), not other characters
3. **Multiple correct answers**: Radio widgets should have only one `correct: true`
4. **Missing subscales**: Include all subscales in discovery mode, even with value 0
5. **Graded discovery**: Set `graded: false` for discovery mode
6. **Widget key mismatch**: `"radio 1"` in widgets must match `[[☃ radio 1]]` in content
7. **Inconsistent difficulty**: Match `estimatedTimeSeconds` to actual complexity
8. **Missing instrumentId**: Discovery assessments need an instrument reference

---

## File Locations

| Location | Purpose |
|----------|---------|
| `genesis/data/lamad/content/*.json` | Assessment data files |
| `.claude/skills/sophia-moment/schemas/` | JSON validation schemas |
| `.claude/skills/sophia-moment/examples/` | Example assessment files |
| `sophia/packages/sophia-core/src/types.ts` | TypeScript type definitions |
| `sophia/packages/perseus-core/src/data-schema.ts` | Widget type definitions |

---

## Example Files

See `.claude/skills/sophia-moment/examples/` for:

- `mastery-quiz.json` - Complete graded quiz with hints
- `discovery-assessment.json` - Self-discovery instrument
- `reflection-journal.json` - Open-ended reflection prompts
