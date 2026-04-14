---
step_number: 3
step_name: "Key Screen Concepts"
step_goal: "Define key screen layouts, interaction patterns, and component inventory"
halts_for_input: true
next_step: "step-04-spec.md"
---

## Goal

For each major screen/view in the product, define the layout concept, interaction patterns, and key components. These aren't pixel-perfect designs — they're structural decisions that an @developer can build from.

## Instructions

### 3a. Identify Key Screens

From the user flows in Step 2, list every distinct screen/page/view the product needs:

| Screen | Flow | Purpose | Priority |
|--------|------|---------|----------|
| {name} | {which flow} | {what user does here} | P0/P1/P2 |

Focus on P0 screens first. P1/P2 screens can be described briefly.

### 3b. Screen Concepts (Per P0 Screen)

For each P0 screen, define:

1. **Layout structure:**
   - What sections does this screen have? (header, main, sidebar, footer, etc.)
   - What's the visual hierarchy? (what does the user see first?)
   - Responsive behavior (how does this change on mobile?)

2. **Key components:**
   | Component | Type | Behavior |
   |-----------|------|----------|
   | {name} | {button/form/list/card/modal/etc.} | {what it does, states it has} |

3. **States:**
   - **Default:** What the user sees on first visit
   - **Loading:** How loading states are shown (skeleton, spinner, progressive)
   - **Empty:** What shows when there's no data yet
   - **Error:** How errors are communicated
   - **Success:** Confirmation and feedback patterns

4. **Interactions:**
   - Primary action (CTA) — what's the main thing to do here?
   - Secondary actions — what else can the user do?
   - Destructive actions — how are deletes/removes handled? (confirmation?)

### 3c. Interaction Patterns

Define reusable patterns across the product:

| Pattern | Where Used | Specification |
|---------|-----------|---------------|
| Form submission | {screens} | Inline validation, submit button states, success/error feedback |
| Data list | {screens} | Pagination or infinite scroll, sort/filter controls, empty state |
| Modal/dialog | {screens} | Trigger, focus trap, close behavior, backdrop |
| Toast/notification | Global | Duration, dismissal, stacking, severity levels |
| Loading states | Global | Skeleton screens vs. spinners vs. progressive loading |

### 3d. Review with User

- Walk through each P0 screen concept
- "Does this layout match how you imagine the product?"
- "Any interactions I'm missing?"
- "How should {specific edge case} be handled?"

## Output

Key screen concepts, component inventory, and interaction patterns defined. `step_3_complete: true`

## Navigation

-> Proceed to [step-04-spec.md](step-04-spec.md)
