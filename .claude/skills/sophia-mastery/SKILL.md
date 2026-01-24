# Sophia Mastery Assessment Skill

Create graded knowledge assessments for the Elohim Protocol lamad learning platform.

## Who This Is For

**Teachers, curriculum designers, and content creators** who need to:
- Verify learner understanding of specific content
- Create quizzes that track mastery progress
- Design assessments with hints and feedback

## Mastery Assessment Overview

Mastery assessments have **correct** and **incorrect** answers. Learners must demonstrate understanding to progress. The lamad system uses **streak-based mastery** - learners need 3 correct answers in a row to earn attestation.

---

## Quick Start

### Basic Multiple Choice Question

```json
{
  "id": "gf-q1",
  "purpose": "mastery",
  "content": {
    "content": "What is the primary purpose of Elohim agents in governance?\n\n[[☃ radio 1]]",
    "images": {},
    "widgets": {
      "radio 1": {
        "type": "radio",
        "options": {
          "choices": [
            { "content": "To make all decisions for humans", "correct": false, "id": "choice-0" },
            { "content": "To serve as constitutional guardians while respecting human agency", "correct": true, "id": "choice-1" },
            { "content": "To maximize engagement metrics", "correct": false, "id": "choice-2" },
            { "content": "To enforce rules without exception", "correct": false, "id": "choice-3" }
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
      "content": "Elohim serve as guardians of constitutional principles while preserving human agency.",
      "images": {},
      "widgets": {}
    }
  ],
  "metadata": {
    "sourceContentId": "quiz-governance-foundations",
    "assessesContentId": "governance-epic",
    "bloomsLevel": "remember",
    "difficulty": "medium",
    "estimatedTimeSeconds": 30,
    "questionType": "core",
    "tags": ["governance", "foundations", "assessment"]
  }
}
```

---

## Key Requirements for Mastery

| Field | Requirement |
|-------|-------------|
| `purpose` | Must be `"mastery"` |
| `graded` | Must be `true` on scorable widgets |
| `correct` | Exactly one choice must have `correct: true` |
| `id` | Every choice needs a unique `id` |
| `assessesContentId` | Link to the content node being tested |

---

## Supported Question Types

### True/False

```json
{
  "id": "tf-q1",
  "purpose": "mastery",
  "content": {
    "content": "Every governance decision in the protocol can be challenged.\n\n[[☃ radio 1]]",
    "images": {},
    "widgets": {
      "radio 1": {
        "type": "radio",
        "options": {
          "choices": [
            { "content": "True", "correct": true, "id": "true" },
            { "content": "False", "correct": false, "id": "false" }
          ],
          "randomize": false,
          "multipleSelect": false
        },
        "graded": true,
        "version": { "major": 0, "minor": 0 }
      }
    }
  },
  "hints": [
    {
      "content": "The right to challenge is a constitutional principle.",
      "images": {},
      "widgets": {}
    }
  ],
  "metadata": {
    "sourceContentId": "quiz-governance",
    "assessesContentId": "governance-epic",
    "bloomsLevel": "remember",
    "difficulty": "easy",
    "estimatedTimeSeconds": 15,
    "questionType": "core",
    "tags": ["governance", "true-false"]
  }
}
```

### Numeric Input

```json
{
  "id": "num-q1",
  "purpose": "mastery",
  "content": {
    "content": "If a governance SLA requires response within 48 hours, and a decision takes 72 hours, by how many hours was the SLA breached?\n\n[[☃ numeric-input 1]]",
    "images": {},
    "widgets": {
      "numeric-input 1": {
        "type": "numeric-input",
        "options": {
          "answers": [
            { "value": 24, "status": "correct", "message": "Correct! 72 - 48 = 24 hours." }
          ],
          "size": "normal",
          "labelText": "hours"
        },
        "graded": true,
        "version": { "major": 0, "minor": 0 }
      }
    }
  },
  "hints": [
    {
      "content": "Subtract the SLA requirement from the actual time taken.",
      "images": {},
      "widgets": {}
    }
  ],
  "metadata": {
    "sourceContentId": "quiz-governance-slas",
    "assessesContentId": "governance-slas",
    "bloomsLevel": "apply",
    "difficulty": "medium",
    "estimatedTimeSeconds": 45,
    "questionType": "applied",
    "tags": ["governance", "sla", "math"]
  }
}
```

### Multiple Select (Select All That Apply)

```json
{
  "id": "ms-q1",
  "purpose": "mastery",
  "content": {
    "content": "Which of the following are constitutional principles? (Select all that apply)\n\n[[☃ radio 1]]",
    "images": {},
    "widgets": {
      "radio 1": {
        "type": "radio",
        "options": {
          "choices": [
            { "content": "Right to challenge any decision", "correct": true, "id": "choice-0" },
            { "content": "Transparency in governance", "correct": true, "id": "choice-1" },
            { "content": "Unlimited data collection", "correct": false, "id": "choice-2" },
            { "content": "Human agency preservation", "correct": true, "id": "choice-3" }
          ],
          "randomize": true,
          "multipleSelect": true,
          "countChoices": true,
          "numCorrect": 3
        },
        "graded": true,
        "version": { "major": 0, "minor": 0 }
      }
    }
  },
  "metadata": {
    "sourceContentId": "quiz-constitutional",
    "assessesContentId": "constitutional-principles",
    "bloomsLevel": "remember",
    "difficulty": "medium",
    "estimatedTimeSeconds": 45,
    "questionType": "core",
    "tags": ["governance", "multiple-select"]
  }
}
```

---

## Writing Effective Hints

Hints should guide thinking without giving away the answer:

```json
"hints": [
  {
    "content": "Think about which epic domain focuses on recognizing invisible labor.",
    "images": {},
    "widgets": {}
  },
  {
    "content": "The name suggests it 'scans' for something valuable that others might miss.",
    "images": {},
    "widgets": {}
  }
]
```

### Hint Best Practices

1. **Start general, get specific** - First hint is broadest
2. **2-3 hints maximum** - More isn't better
3. **Reference concepts** - Point to related content
4. **Don't solve it** - Guide thinking, don't give answers

---

## Metadata Reference

### Bloom's Taxonomy Levels

| Level | Description | Example Stems |
|-------|-------------|---------------|
| `remember` | Recall facts | "What is...", "Name the..." |
| `understand` | Explain concepts | "Why does...", "Describe..." |
| `apply` | Use in situations | "Calculate...", "How would you..." |
| `analyze` | Break down, compare | "Compare...", "Analyze..." |
| `evaluate` | Judge, defend | "Which is better...", "Evaluate..." |
| `create` | Produce new work | "Design...", "Create..." |

### Difficulty Guidelines

| Level | Time | Cognitive Load |
|-------|------|----------------|
| `easy` | 10-20 sec | Basic recall |
| `medium` | 30-60 sec | Some reasoning |
| `hard` | 60-120 sec | Deep analysis |

### Question Types

| Type | Purpose |
|------|---------|
| `core` | Essential concepts every learner should know |
| `applied` | Real-world scenarios and application |
| `synthesis` | Combining multiple concepts |

---

## Complete Assessment File

```json
{
  "id": "quiz-governance-foundations",
  "contentType": "assessment",
  "title": "Governance Foundations",
  "description": "Test your understanding of constitutional AI governance principles",
  "content": [
    { /* Moment 1 */ },
    { /* Moment 2 */ },
    { /* Moment 3 */ }
  ],
  "contentFormat": "sophia-moment-json",
  "tags": ["assessment", "governance", "foundations"],
  "relatedNodeIds": ["governance-epic"],
  "metadata": {
    "assessmentType": "mastery",
    "category": "governance",
    "attestationId": "governance-foundations",
    "difficulty": "medium",
    "questionCount": 5
  }
}
```

---

## Validation Checklist

Before submitting:

- [ ] Each moment has `purpose: "mastery"`
- [ ] Each widget has `graded: true`
- [ ] Exactly one `correct: true` per radio widget
- [ ] Every choice has unique `id`
- [ ] Widget keys match placeholders (`"radio 1"` = `[[☃ radio 1]]`)
- [ ] `assessesContentId` links to valid content node
- [ ] Hints guide without revealing answers
- [ ] Difficulty matches actual cognitive load

---

## Common Mistakes

1. **Multiple correct answers** - Only one `correct: true` (unless multipleSelect)
2. **Missing choice IDs** - Every choice needs `id`
3. **`graded: false`** - Must be `true` for mastery
4. **Missing assessesContentId** - Required for mastery tracking
5. **Hints that reveal** - Guide thinking, don't solve

---

## File Location

Save mastery assessments to: `genesis/data/lamad/content/quiz-*.json`
