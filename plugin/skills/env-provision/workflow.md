---
workflow_version: "2.0"
output_file: "project root (configured environment) + _context/tracking/env-provision-{date}.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Provisions the development environment: branches on stack_pack, installs dependencies, configures core tooling + baselines, verifies setup.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-branch.md](steps/step-00-branch.md) | Read `coldpress.yaml stack_pack`; dispatch to pack quickstart or generic path |
| 1 | [step-01-read-stack.md](steps/step-01-read-stack.md) | Read tech-stack.md + baselines block; plan setup (generic path only) |
| 2 | [step-02-install.md](steps/step-02-install.md) | Install all dependencies (generic path only) |
| 3 | [step-03-configure.md](steps/step-03-configure.md) | Part A: core tooling. Part B: baselines activation loop (generic path only) |
| 4 | [step-04-verify.md](steps/step-04-verify.md) | Core checks + baseline checks + tracking doc (both paths) |

Steps 1–3 are generic-path only. Step 0 and Step 4 run for all paths.

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **Never silent-degrade.** Install failures must surface with remediation steps.

## Completion Criteria

- `step_0_complete: true` (branch decision made)
- All dependencies installed (generic path: steps 1–2; pack path: quickstart handles this)
- Core tooling configured: lint, format, git hooks, .env.template, editor config
- Confirmed baselines activated (step-03 Part B)
- `step_4_complete: true` (verify run; tracking doc written)
- `_context/tracking/env-provision-{date}.md` present

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Added step-00-branch; steps 1–3 now generic-path only; step-04 runs for both paths; tracking doc added to completion criteria. |
| 1.0 | 2026-04-08 | Alfred | Initial 4-step workflow |
