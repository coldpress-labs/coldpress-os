---
name: "generate-wrappers"
description: "Generate thin .claude/skills/ wrappers pointing to coldpress-os skills"
type: "simple"
category: "install"
agent: "butler"
phases: [1]
version: "1.0"
---

# Generate Thin Skill Wrappers

Generate `.claude/skills/` entries that point to the canonical skill definitions inside the coldpress-os submodule. Each wrapper is a minimal SKILL.md that tells Claude Code to read the real skill.

## When to Use

- After `coldpress-os init` to create initial wrappers
- After updating the coldpress-os submodule (new skills may have been added)
- When `coldpress-os/REGISTRY.md` shows skills not present in `.claude/skills/`

## Process

1. **Scan** `coldpress-os/skills/` recursively for all `SKILL.md` files
2. **For each skill found**, extract the `name` and `description` from YAML frontmatter
3. **Create** `.claude/skills/{skill-name}/SKILL.md` with this content:

```markdown
---
name: "{name}"
description: "{description}"
---

Read and follow coldpress-os/skills/{category}/{skill-name}/SKILL.md
```

4. **Also scan** `coldpress-os/lifecycle/` for phase-specific skills that are NOT routers (type != "router")
5. **For each lifecycle skill**, create a wrapper similarly:

```markdown
---
name: "{name}"
description: "{description}"
---

Read and follow coldpress-os/lifecycle/{phase}/{skill-name}/SKILL.md
```

6. **Skip** skills that already have a wrapper (don't overwrite customized wrappers)
7. **Report** how many wrappers were created, updated, or skipped

## Rules

- Wrappers are **generated, not hand-written**. If a wrapper needs customization, the customization goes in the wrapper — not in the coldpress-os source.
- Router skills in lifecycle/ (type: "router") should NOT get wrappers — they just redirect to skills/.
- Stack-pack skills only get wrappers if the project's `coldpress.yaml` has a matching `stack_pack` value.

## Output

Wrappers created in `.claude/skills/`:
```
.claude/skills/
├── brainstorming/SKILL.md
├── design-thinking/SKILL.md
├── problem-solving/SKILL.md
├── code-review/SKILL.md
├── test-design/SKILL.md
├── pre-project-interview/SKILL.md
├── create-prd/SKILL.md
├── dev-story/SKILL.md
└── ... (one per non-router skill)
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial wrapper generator — scans skills/ and lifecycle/, creates thin wrappers, respects stack-pack config |
