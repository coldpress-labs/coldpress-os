---
workflow_version: "1.0"
output_file: "_context/design/brand-guidelines-v{N}.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Phase 5 brand-guidelines — canonical reference for tokens + voice + a11y rules + identity. Reads design-brief direction + baselines + personas; authors validated-distillate.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + existence_checks |
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Scope-conditional output per archetype (token-only vs full identity) |
| 2 | [step-02-voice.md](steps/step-02-voice.md) | Voice + tone (story_types brand_voice_samples + brainstorming + advanced-elicitation + editorial-prose) |
| 3 | [step-03-tokens.md](steps/step-03-tokens.md) | Tokens (colour/type/spacing/motion); auto-validate against a11y baseline contrast |
| 4 | [step-04-identity.md](steps/step-04-identity.md) | Identity (logo + iconography); finalisation; editorial-structure; emit validated-distillate + sidecar |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Halt at user-input prompts.** Voice traits, token values, identity decisions all require user input.
3. **Partial-completion mechanic** active in every step.
4. **Graph-first.** Step 0 loads; subsequent steps consult graph.
5. **Token auto-validation.** Step 3 runs contrast checks against active a11y baseline. Failures = supersede-check raises issue.
6. **Archetype-conditional output.** vibe-coder-lean → tokens-only mode (skip Steps 2, 4); standard → full; design-led/WDS → full + extended identity.

## Outputs

- `_context/design/brand-guidelines-v{N}.md` (validated-distillate; schema-validated)
- `_context/design/brand-guidelines-v{N}.meta.json` (sidecar)
