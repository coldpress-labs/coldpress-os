---
name: "teach-me-testing"
description: "Teach testing concepts progressively through structured learning sessions"
type: "reference"
category: "testing"
agent: "qa"
phases: [6]
inputs:
  - "../../data/testing/curriculum.yaml"
  - "../../data/testing/role-paths.yaml"
  - "../../data/testing/session-content-map.yaml"
  - "../../data/testing/quiz-questions.yaml"
outputs:
  - artifact: "Learning Progress"
    location: "inline (conversation-based learning)"
    format: "interactive"
version: "1.0"
---

## Purpose

Provides structured, progressive testing education through 7 sessions covering fundamentals through advanced topics. Uses the TEA (Testing Education Architecture) curriculum with role-specific learning paths, interactive quizzes, and practical examples.

## When to Use

- "teach me testing"
- "learn about testing"
- "testing tutorial"
- When a developer wants to understand testing concepts
- When onboarding to testing practices
- When wanting to level up testing skills

## Prerequisites

- Data assets from `../../data/testing/`:
  - `tea-curriculum.yaml` — Session structure and learning objectives
  - `tea-role-paths.yaml` — Role-specific learning paths
  - `tea-session-content-map.yaml` — Detailed content for each session
  - `tea-quiz-questions.yaml` — Assessment questions

## Process

1. **Assess learner level.** Ask the user:
   - Current role (developer, QA, PM, etc.)
   - Testing experience level (none, basic, intermediate, advanced)
   - What they want to learn (specific topic or general progression)

2. **Select learning path** based on role and level from `tea-role-paths.yaml`.

3. **Deliver sessions progressively.** Each of the 7 sessions covers:
   - **Session 1:** Testing fundamentals — Why test, test types, test pyramid
   - **Session 2:** Unit testing — Writing effective unit tests, mocking, assertions
   - **Session 3:** Integration testing — API testing, database testing, service integration
   - **Session 4:** E2E testing — Browser automation, user flow testing, visual testing
   - **Session 5:** Test architecture — Test strategy, coverage planning, test data management
   - **Session 6:** Advanced patterns — TDD/BDD/ATDD, mutation testing, property-based testing
   - **Session 7:** Testing culture — CI/CD integration, test maintenance, team practices

4. **Interactive elements** within each session:
   - Concept explanations with real-world examples
   - Code examples in the project's actual tech stack
   - Quiz questions to check understanding
   - Practical exercises to apply concepts

5. **Track progress** and adjust difficulty based on quiz performance.

## Output

Interactive learning delivered in conversation. Progress tracked for future sessions. No file artifacts produced.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from TEA curriculum, adapted to coldpress-os schema |
