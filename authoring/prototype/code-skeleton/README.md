# Prototype Mode: code-skeleton

Tech-stack-coupled component shells. Authored by `prototype` skill Step 2 when `mode == code-skeleton`.

## Expected directory shape (after authoring)

```
_context/design/prototype/{date}/
├── manifest.json                        # schema-validated
├── src/
│   ├── screens/
│   │   ├── <ScreenName>.tsx            # one per ux-design-spec Section 4 entry
│   │   └── ...
│   ├── routes.ts                        # routing per UX flows
│   └── types.ts                         # shared types
├── schema/
│   └── schema.ts                        # data layer stubs (Convex / Prisma / etc.)
└── styles/
    └── tokens.ts                        # imports brand-guidelines tokens
```

Exact file extensions and conventions follow `tech-stack-md`:
- React + Vite: `.tsx` + `tokens.ts` (CSS-in-JS) OR `tailwind.config.js` extension
- Next.js App Router: `app/<screen>/page.tsx`
- Vue 3: `.vue` SFC
- Svelte: `.svelte`
- Solid: `.tsx` (Solid syntax)
- etc.

## Comment conventions

Each component file MUST cite PRD user-story + acceptance-criteria IDs:

```tsx
// PRD US-7 AC-1: Search input must accept query within 300ms
// PRD US-7 AC-3: Empty state shown when no results
// PRD US-7 AC-5: Keyboard shortcut "/" focuses search input

import { tokens } from '@/styles/tokens';

export function SearchScreen() {
  // ... shell component
}
```

## Tech-stack imports

Every import statement is parsed at Step 4 and verified against `tech-stack-md.dependencies`. Imports of libraries NOT in tech-stack surface as design-deltas with `flag_for_architecture_ADR` recommendation.
