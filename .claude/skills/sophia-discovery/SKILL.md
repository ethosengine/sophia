# Sophia Discovery Assessment Skill

Create psychometric instruments and self-discovery assessments for the Elohim Protocol lamad learning platform.

## Who This Is For

**Researchers, counselors, and experience designers** who need to:
- Map learner interests to personalized learning paths
- Create personality/preference inventories
- Design onboarding flows that reveal affinities
- Build psychometric instruments without "correct" answers

## Discovery Assessment Overview

Discovery assessments have **no correct answers**. Instead, each choice contributes to one or more **subscales** that reveal patterns in learner preferences, interests, or personality traits.

### The Difference from Mastery

| Mastery | Discovery |
|---------|-----------|
| Has correct answers | No correct answers |
| Measures knowledge | Measures preferences |
| Tracks what you know | Reveals who you are |
| `graded: true` | `graded: false` |
| Uses `correct` field | Uses `subscaleContributions` |

---

## Quick Start

### Basic Discovery Question

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

---

## Subscale Contributions

The `subscaleContributions` object maps widget choices to subscale scores:

```json
{
  "subscaleContributions": {
    "radio 1": {                    // Widget ID (matches content placeholder)
      "0": {                        // Choice index (0-based)
        "governance": 1,            // Subscale contribution
        "care": 0,
        "economic": 0,
        "public": 0,
        "social": 0
      },
      "1": {
        "governance": 0,
        "care": 1,
        // ... etc
      }
    }
  }
}
```

### Key Rules

1. **Widget ID as key** - Must match the widget key in content (e.g., `"radio 1"`)
2. **Choice index as string** - `"0"`, `"1"`, `"2"` (not numbers)
3. **All subscales included** - Even with value `0`
4. **Values 0-1** - Typically 0 (no contribution) or 1 (full contribution)

---

## Elohim Epic Domain Subscales

For the Elohim Protocol "Find Your Path" discovery:

| Subscale | Epic Domain | Represents |
|----------|-------------|------------|
| `governance` | AI Constitutional | Interest in AI policy, democratic oversight |
| `care` | Value Scanner | Interest in caregiving, invisible work |
| `economic` | Economic Coordination | Interest in workplace ownership, equity |
| `public` | Public Observer | Interest in civic participation, transparency |
| `social` | Social Medium | Interest in digital spaces, online community |

---

## Weighted Contributions

For nuanced discovery, choices can contribute to multiple subscales:

```json
{
  "subscaleContributions": {
    "radio 1": {
      "0": {
        "governance": 0.6,
        "public": 0.4,
        "care": 0,
        "economic": 0,
        "social": 0
      }
    }
  }
}
```

This models someone who enjoys "policy advocacy in public forums" - primarily governance-oriented but with civic engagement aspects.

---

## Key Requirements for Discovery

| Field | Requirement |
|-------|-------------|
| `purpose` | Must be `"discovery"` |
| `graded` | Must be `false` on all widgets |
| `correct` | Must NOT be present on choices |
| `subscaleContributions` | Required - maps every choice |
| `instrumentId` | Required in metadata |

---

## Question Design Principles

### Frame Positively

Instead of negative framing:
> "Which of these problems bothers you most?"

Use positive framing:
> "Which of these activities interests you most?"

### Balanced Options

Each subscale should have roughly equal representation across the assessment. If testing 5 subscales with 4 questions, each subscale should be a "primary" choice 4 times total.

### Avoid Social Desirability Bias

Don't make one option obviously "better":

**Bad:**
- "Helping people in need" (too virtuous)
- "Making money" (too mercenary)

**Better:**
- "Supporting caregivers and families"
- "Creating equitable economic systems"

---

## Complete Discovery Assessment

```json
{
  "id": "quiz-who-are-you",
  "contentType": "assessment",
  "title": "Find Your Path in the Protocol",
  "description": "A brief quiz to help you discover which epic domain resonates with you",
  "content": [
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
                { "content": "Transforming workplace ownership and governance", "id": "d-q1-choice-2" },
                { "content": "Civic participation and public oversight", "id": "d-q1-choice-3" },
                { "content": "Building healthier digital communication spaces", "id": "d-q1-choice-4" }
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
        "tags": ["discovery", "onboarding"],
        "instrumentId": "epic-domain"
      }
    },
    {
      "id": "d-q2",
      "purpose": "discovery",
      "content": {
        "content": "What aspect of the current system concerns you most?\n\n[[☃ radio 1]]",
        "images": {},
        "widgets": {
          "radio 1": {
            "type": "radio",
            "options": {
              "choices": [
                { "content": "AI systems making decisions without democratic oversight", "id": "d-q2-choice-0" },
                { "content": "Unpaid care work being invisible in our economy", "id": "d-q2-choice-1" },
                { "content": "Workers having no voice in their workplaces", "id": "d-q2-choice-2" },
                { "content": "Citizens being disconnected from decision-making", "id": "d-q2-choice-3" },
                { "content": "Social media amplifying division and misinformation", "id": "d-q2-choice-4" }
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
        "tags": ["discovery", "onboarding"],
        "instrumentId": "epic-domain"
      }
    }
  ],
  "contentFormat": "sophia-moment-json",
  "tags": ["assessment", "onboarding", "personalization", "discovery"],
  "relatedNodeIds": ["governance", "value_scanner", "public_observer", "autonomous_entity", "social_medium"],
  "metadata": {
    "assessmentType": "discovery",
    "recommendsEpics": true,
    "quizType": "domain-discovery",
    "category": "onboarding",
    "questionCount": 4,
    "instrumentId": "epic-domain"
  }
}
```

---

## Validation Checklist

Before submitting:

- [ ] Each moment has `purpose: "discovery"`
- [ ] Each widget has `graded: false`
- [ ] No `correct` field on any choice
- [ ] `subscaleContributions` includes ALL subscales (even with 0)
- [ ] Each choice index has a subscale mapping
- [ ] `instrumentId` is in metadata
- [ ] Widget keys match placeholders
- [ ] Choices are balanced across subscales

---

## Common Mistakes

1. **Missing subscales** - Include ALL subscales, even with value `0`
2. **`graded: true`** - Must be `false` for discovery
3. **Adding `correct`** - Discovery has no correct answers
4. **Missing instrumentId** - Required for psychometric processing
5. **Numeric indices** - Use strings: `"0"`, not `0`
6. **Unbalanced subscales** - Each subscale needs equal representation

---

## Psychometric Processing

Discovery results are processed by `psyche-survey` to produce:

```typescript
interface ResonanceResult {
  subscaleContributions: Record<string, number>;
}
```

The consuming application aggregates these across questions and interprets results based on the instrument definition.

---

## File Location

Save discovery assessments to: `genesis/data/lamad/content/quiz-*.json`
