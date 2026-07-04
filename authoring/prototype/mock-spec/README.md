# Prototype Mode: mock-spec

Stack-agnostic Mermaid diagrams + state lists. Authored by `prototype` skill Step 2 when `mode == mock-spec` (typically `vibe-coder-lean` archetype).

## Expected directory shape

```
_context/design/prototype/{date}/
├── manifest.json
└── screens/
    ├── <screen-name>.md                 # one per ux-design-spec Section 4 entry
    └── ...
```

## Screen file template

```markdown
# Screen: <Name>

> User stories: US-<N>, US-<M>
> Acceptance criteria: AC-<X>, AC-<Y>

## Layout

\`\`\`mermaid
flowchart TB
    Header[Header — primary nav]
    Main[Main content]
    Footer[Footer]
    Header --> Main --> Footer
\`\`\`

## States

| State | Trigger | Content / Behaviour |
|-------|---------|---------------------|
| default | initial | <description> |
| loading | data fetch | <skeleton or spinner per design-brief motion direction> |
| empty | no data | <empty-state copy from ux-design-spec interaction patterns> |
| error | network/server fail | <error pattern> |

## Interactions

(per ux-design-spec Section 5 patterns)

## A11y notes

- Keyboard order: Header → Main → Footer (cycles on Tab)
- Landmarks: header / main / footer roles
- Focus visible per --focus-ring brand token
```
