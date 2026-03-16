---
name: psephos-ballot
description: Use when authoring governance ballots, creating voting content, choosing voting mechanisms, configuring election hygiene, or building PsephosBallot JSON for the Psephos renderer
---

# Authoring Psephos Ballots

## Who This Is For

Governance designers, community facilitators, elohim agents, and developers creating formal voting content for the Psephos ballot renderer.

## What Is a Ballot?

A **PsephosBallot** is to governance what a **Moment** is to learning. The protocol supplies the ballot content; Psephos renders it faithfully with election hygiene. The voter interacts; a `Recognition` with `GovernanceResult` comes back.

```
Protocol supplies PsephosBallot → Psephos renders → Recognition.governance out
```

Psephos handles: option display, interaction, validation, hygiene (randomization, confirmation).
The protocol handles: who votes, tallying, result interpretation, escalation.

## Mechanism Selection

Pick the mechanism that matches the decision type:

| Decision Type | Mechanism | Use When |
|---|---|---|
| Support multiple options | `approval` | Low-stakes, "which do you support?", many options OK |
| Find consensus winner | `ranked-choice` | Contested choices, need to eliminate spoiler effect |
| Rate on a scale | `score-vote` | Need intensity of preference, not just ordering |
| Allocate limited resources | `dot-vote` | Budget/priority decisions, "where should we invest?" |
| Proceed or escalate | `consent` | High-stakes, everyone must be aboard or block triggers facilitation |

**Default to `approval`** when unsure. It's the simplest and most familiar.

**Use `consent`** for constitutional or structural decisions. Blocking is not rejection — it triggers elohim-facilitated conversation.

**Use `ranked-choice`** when there are 3+ competing options and you need a single winner without vote splitting.

## Quick Start: Approval Ballot

```json
{
  "id": "ballot-review-policy",
  "purpose": "governance",
  "proposal": {
    "id": "prop-review-policy",
    "title": "Content review frequency",
    "description": "How often should community content undergo periodic review?",
    "proposalType": "advice"
  },
  "options": [
    { "id": "opt-monthly", "label": "Monthly", "description": "Review all content every 30 days", "position": 0 },
    { "id": "opt-quarterly", "label": "Quarterly", "description": "Review all content every 90 days", "position": 1 },
    { "id": "opt-biannual", "label": "Biannually", "description": "Review all content every 180 days", "position": 2 }
  ],
  "mechanism": "approval",
  "config": {},
  "hygiene": {
    "randomizeOrder": true,
    "equalVisualWeight": true,
    "requireReasoning": false,
    "showResultsAfterVote": true,
    "confirmBeforeSubmit": false,
    "hideVoterCount": true
  }
}
```

## PsephosBallot Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ballot identifier |
| `purpose` | `"governance"` | Always "governance" |
| `proposal` | PsephosProposal | What's being voted on |
| `options` | PsephosOption[] | The choices (min 1 for consent, min 2 for others) |
| `mechanism` | VotingMechanism | Which widget to render |
| `config` | PsephosConfig | Mechanism-specific settings |
| `hygiene` | ElectionHygiene | Ballot integrity rules |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `previousBallot` | BallotEntry[] | Existing vote for amendment/review |

### PsephosProposal

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Proposal identifier |
| `title` | string | yes | Short title (< 100 chars) |
| `description` | string | yes | Full description of what's being decided |
| `proposalType` | string | yes | `"advice"`, `"consent"`, `"consensus"`, `"policy"`, `"constitutional"` |

### PsephosOption

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique within this ballot |
| `label` | string | yes | Short label (< 50 chars) |
| `description` | string | yes | Explain what choosing this means |
| `position` | number | yes | Original display position (0-indexed) |
| `source` | string | no | Who proposed this option |
| `sourceJustification` | string | no | Why they proposed it |

### PsephosConfig (mechanism-specific)

| Field | Mechanisms | Required | Description |
|-------|-----------|----------|-------------|
| `scoreMin` | score-vote | yes | Minimum score value (e.g., 1) |
| `scoreMax` | score-vote | yes | Maximum score value (e.g., 10) |
| `dotsPerVoter` | dot-vote | yes | Total dot budget per voter |
| `quorumPercentage` | all | no | Required voter participation (0-1) |
| `passageThreshold` | all | no | Required approval ratio (0-1) |

### ElectionHygiene

| Field | Type | Default varies by mechanism | Description |
|-------|------|---------------------------|-------------|
| `randomizeOrder` | boolean | true (false for consent) | Shuffle option order to prevent position bias |
| `randomSeed` | string | - | Seed for reproducible shuffle (proposalId + humanId) |
| `equalVisualWeight` | boolean | true | No option visually larger than others |
| `requireReasoning` | boolean | false | Require text justification |
| `reasoningMinLength` | number | 50 (consent only) | Minimum chars for reasoning |
| `showResultsAfterVote` | boolean | true | Show tally only after submitting |
| `confirmBeforeSubmit` | boolean | varies | Show "Review your ballot" interstitial |
| `hideVoterCount` | boolean | varies | Don't show "N people voted" before submission |

**Default hygiene per mechanism** (use these unless you have a specific reason to override):

| | randomize | confirm | hideCount |
|---|---|---|---|
| approval | true | false | true |
| ranked-choice | true | true | true |
| score-vote | true | true | false |
| dot-vote | true | true | false |
| consent | false | true | true |

## Option Writing Guide

### Rules for Neutral Framing

1. **Equal length** — Options of similar word count prevent visual bias
2. **Describe outcomes, not emotions** — "Review monthly" not "Keep our content fresh and safe"
3. **No leading language** — "Increase budget by 20%" not "Invest in our future with a 20% increase"
4. **Parallel structure** — All options should follow the same grammatical pattern
5. **Include trade-offs** — "Monthly (higher cost, fresher content)" helps informed voting

### Option Count Guidelines

| Mechanism | Min | Max | Guidance |
|-----------|-----|-----|----------|
| approval | 2 | 10 | More options OK since voters select multiple |
| ranked-choice | 3 | 7 | Too many makes ranking cognitively expensive |
| score-vote | 2 | 7 | Each needs individual scoring |
| dot-vote | 2 | 10 | Budget spreads across options |
| consent | 1 | 1 | Binary consent/block on the proposal itself |

### Consent Ballots Are Special

Consent has only **one option** — the proposal itself. The voter chooses to **consent** (approve: true) or **block** (approve: false). Blocking requires reasoning and triggers facilitated conversation.

```json
{
  "options": [
    {
      "id": "opt-proposal",
      "label": "Adopt revised content policy",
      "description": "Replace current ad-hoc review with structured quarterly reviews...",
      "position": 0
    }
  ],
  "mechanism": "consent"
}
```

## Proposal Types

| Type | Mechanism Fit | Stakes |
|------|--------------|--------|
| `advice` | approval, dot-vote | Low — gathering input |
| `consent` | consent | High — everyone must be aboard |
| `consensus` | ranked-choice | Medium — finding common ground |
| `policy` | score-vote, ranked-choice | Medium-high — binding decision |
| `constitutional` | consent | Highest — structural change, override hygiene to `requireReasoning: true` |

For constitutional proposals, override defaults:
```json
{
  "hygiene": {
    "requireReasoning": true,
    "confirmBeforeSubmit": true,
    "hideVoterCount": true,
    "randomizeOrder": false
  }
}
```

## Validation Checklist

Before submitting a ballot:

- [ ] `id` is unique and descriptive (e.g., `ballot-content-review-2026-03`)
- [ ] `purpose` is `"governance"`
- [ ] `proposal.title` is under 100 characters
- [ ] `proposal.description` explains what's being decided, not just the topic
- [ ] Options have unique `id` values
- [ ] Options use neutral, parallel framing
- [ ] Option `position` values are sequential starting from 0
- [ ] `mechanism` matches the decision type (see selection guide)
- [ ] `config` has required fields for the mechanism (scoreMin/Max, dotsPerVoter)
- [ ] `hygiene` uses mechanism defaults unless there's a specific reason to override
- [ ] For consent: exactly 1 option (the proposal itself)
- [ ] For score-vote: scoreMin < scoreMax, reasonable range (not 1-1000)
- [ ] For dot-vote: dotsPerVoter > 0, reasonable relative to option count

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using consent for multi-option votes | Consent is binary (proceed/block). Use approval or ranked-choice for multiple options |
| Leading option labels ("The best approach...") | Use neutral labels that describe the outcome |
| Unequal option descriptions (one is 3 words, another is 50) | Keep descriptions similar length |
| Missing config for score-vote/dot-vote | score-vote needs scoreMin + scoreMax; dot-vote needs dotsPerVoter |
| Setting randomizeOrder: false without reason | Position bias is real. Only disable for consent (2 options) or when order carries meaning |
| hideVoterCount: false before voting closes | Showing "47 people voted" creates bandwagon pressure |
| Too many options for ranked-choice | 7+ options make ranking cognitively expensive. Consolidate or use dot-vote |
| Forgetting proposalType | Determines governance weight. Constitutional proposals should use consent mechanism |

## File Location

Ballot JSON files go in: `genesis/data/qahal/ballots/`

Naming convention: `ballot-{topic}-{date}.json` (e.g., `ballot-content-review-2026-03.json`)

## Types Reference

Full TypeScript types are in `sophia/packages/psephos/src/types.ts`. The JSON schema for validation is at `sophia/.claude/skills/psephos-ballot/schemas/psephos-ballot.schema.json`.
