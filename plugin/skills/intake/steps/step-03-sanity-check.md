---
step_number: 3
step_name: "Sanity check"
step_goal: "Confirm the scaffold is healthy before intake starts writing"
halts_for_input: false
next_step: "step-04-lifecycle-intro.md"
---

## Goal

Catch obvious scaffold drift early — *before* the rest of intake starts writing sacred-doc seeds — so the user isn't chasing phantom bugs later.

## Instructions

Run four checks. Each produces a line in the intake report.

### 1. Core environment (`coldpress doctor` silent mode)

```ts
const { exitCode, suite } = await runDoctor({ silent: true });
```

- `exitCode === 0` → ✓ Environment
- `exitCode === 2` → ⚠ Environment (warnings — summarise in one line)
- `exitCode === 1` → ✗ Environment (critical — list failing checks and their remedies; offer to abort)

### 2. `coldpress.yaml` schema validator

```ts
const yaml = await readFile(join(projectRoot, "coldpress.yaml"), "utf8");
assertValidColdpressYaml(yaml, { phase: "runtime" });
```

- Throws `ColdpressYamlValidationError` on drift — surface the full issue list, offer to abort.
- Passes silently on success.

### 3. Template file probes

Confirm each of these exists and is non-empty. A missing file means the scaffold was partially deleted or never completed; the user should re-run `coldpress init --retrofit` or restore from git.

- `CLAUDE.md`
- `.claude/SYSTEM.md`
- `.claude/agents/` (directory, ≥ 1 file)
- `_input/assets/`, `_input/vendor/`, `_input/raw/`, `_input/legacy/`, `_input/reference/` — each present (README.md or .gitkeep)
- `scripts/check-secrets.sh`
- `secure/manifest.yaml`

### 4. Git hook installed

```bash
ls .git/hooks/pre-commit
```

- Present + executable → ✓ Pre-commit hook
- Missing → ⚠ Pre-commit hook not installed — remind the user they can run `cp scripts/check-secrets.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`.

### 5. Write the health report

Append all four findings to `_context/tracking/intake-{date}.md`:

```markdown
## Scaffold health

| Check | Status |
|-------|--------|
| Core tools | ✓ / ⚠ / ✗ |
| coldpress.yaml | ✓ / ✗ |
| Template files | ✓ / ✗ (missing: <list>) |
| Pre-commit hook | ✓ / ⚠ |
```

## Halts for Input

Only when a `✗` critical failure requires user acknowledgement before proceeding (e.g., missing Node 20, malformed yaml).

## Navigation

→ `step-04-lifecycle-intro.md` on all-green or warnings-only.
→ Abort intake (back to user) on critical failure — Butler surfaces the remediation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `orient` Step 3. |
| 2.0 | 2026-07-02 | Butler | Folded into `intake` as Step 3 (WS5-B, §8 item 6). Output renamed to the intake report (single report per session, not a separate `orient-{date}.md`). |
