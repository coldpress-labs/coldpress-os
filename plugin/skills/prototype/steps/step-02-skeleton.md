---
step_number: 2
step_name: "Author Scaffolds (mode-conditional)"
step_goal: "Author prototype artefacts in selected mode. Embed PRD acceptance criteria as comments. Apply brand tokens."
halts_for_input: true
next_step: "step-03-iteration.md"
partial_completion_id: "prototype_step_02"
---

## Goal

Author prototype artefacts per selected mode. Each screen from `ux-design-spec` Section 4 → corresponding artefact file. Embed PRD acceptance criteria as inline comments referencing user-story IDs. Apply brand-guidelines tokens.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "prototype_step_02", sub_skill: "skeleton_author", at: "started" }`.

### 2. Mode-conditional branch

#### 2a. mode == code-skeleton

For each screen in `ux-design-spec` Section 4:

- File path: per tech-stack convention (e.g., `src/screens/<ScreenName>.tsx` for React + Vite; `app/<screen-name>/page.tsx` for Next.js; etc.)
- Component shell:
  - Import brand tokens (e.g., `import { tokens } from '@/styles/tokens'` for CSS-in-JS; or className references for Tailwind)
  - Layout structure per ux-design-spec wireframe
  - Embedded comments cite PRD acceptance criteria:
    ```tsx
    // PRD US-7 AC-1: Search input must accept query within 300ms
    // PRD US-7 AC-3: Empty state shown when no results
    ```
  - State management stubs (useState / signals / etc. per stack)
  - Event handler stubs
  - aria-labels per ux-design-spec a11y notes

For data shape: author corresponding schema stubs (e.g., `convex/schema.ts`, `prisma/schema.prisma`, `db/migrations/<num>_<name>.sql`).

For routing: author route definitions per UX flows.

For each file: append entry to `manifest.json files[]`:
```json
{
  "path": "<relative-path>",
  "role": "screen|schema|route|type|util",
  "screens_referenced": ["<screen-name>"],
  "user_stories_referenced": ["US-7", "US-8"]
}
```

Append imports to `manifest.tech_stack_imports[]` (verification at Step 4).

#### 2b. mode == mock-spec

For each screen, author a Mermaid `.md` file:

```markdown
# Screen: <Name>

> US: <user-story-IDs>; AC: <acceptance-criteria-IDs>

## Layout (Mermaid)

\`\`\`mermaid
flowchart TB
    Header[Header]
    Main[Main content area]
    Footer[Footer]
    Header --> Main --> Footer
\`\`\`

## States

| State | Trigger | Content / Behaviour |
|-------|---------|---------------------|
| default | initial | <description> |
| loading | data fetch | <skeleton tokens applied> |
| empty | no results | <empty state copy from ux-design-spec> |
| error | network fail | <error pattern from interaction patterns> |

## Interactions

(per ux-design-spec)
```

#### 2c. mode == clickable-html

Author `index.html` + `style.css` + `tokens.css` + per-screen `<screen-name>.html`. Apply brand-guidelines tokens via CSS custom properties (load `tokens.css` first).

Each screen HTML:
- Semantic structure per a11y (landmark roles)
- Inline comments with US/AC IDs
- Anchor-link-based navigation between screens (no JS framework)
- Brand fonts loaded
- Token-applied styles

Optional: `external-tool-reference.md` if user prefers Figma/Penpot link instead of HTML.

### 3. User confirmation per screen

Author 1-2 screens; halt for user feedback. Adjust before continuing.

### 4. Partial-completion clean

`at: "skeleton_drafted"`.

## Output

- Mode-conditional artefact files in `_context/design/prototype/{date}/`
- manifest.json populated with files, tech_stack_imports, acceptance_criteria_referenced

## Navigation

→ Next: [step-03-iteration.md](step-03-iteration.md)
