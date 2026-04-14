# Gate Protocol — Human Approval Between Waves

> "Reflection agent proposes; humans explicitly promote."

---

## Principle

No wave advances without explicit human approval. The orchestrator can automate execution within a wave, but transitions between waves require human judgment.

## Gate Flow

```
All tasks in Wave N complete
  ↓
System presents: Wave N summary + artifacts
  ↓
Human reviews: Are outputs acceptable?
  ↓
Human decision:
  ├── APPROVE → Wave N+1 begins
  ├── REVISE → Specific tasks re-run with feedback
  └── HALT → Escalate, replan, or cancel
```

## Gate Data Structure

```yaml
gate:
  wave: 1
  status: "pending"                    # pending | approved | revision_requested | halted
  criteria: "Foundation validated — schema, auth, design system working"
  presented_at: "2026-04-25T10:00:00Z"
  artifacts:
    - "_output/implementation/1-1-project-setup.md"
    - "_output/implementation/1-2-design-system.md"
  decision:
    action: "approve"                  # approve | revise | halt
    decided_at: "2026-04-25T14:30:00Z"
    decided_by: "aastha"
    notes: "Foundation looks solid. Proceed with auth."
  revision_feedback: null              # Only if action = revise
```

## What the Gate Presents

For each completed wave:

1. **Wave summary** — tasks completed, duration, any issues encountered
2. **Artifact links** — paths to all output files from wave tasks
3. **Quality metrics** — test pass rates, code review findings, if available
4. **Next wave preview** — what will run next, estimated duration
5. **Gate criteria** — what was supposed to be true after this wave

## Gate Timeout

- **Default:** 7 days
- **In Inngest:** `step.waitForEvent("wave-N-approved", { timeout: "7d" })`
- **On timeout:** System notifies but does NOT auto-advance. Human must explicitly decide.

## Gate in Different Runtimes

### Inngest (Production)
```typescript
const approval = await step.waitForEvent(`wave-${n}-approved`, {
  event: "orchestration/approve",
  match: "data.wave",
  timeout: "7d",
});
```

### Local / Claude Code (Development)
Butler presents the gate in conversation:
```
Wave 1 complete. Review these artifacts:
- [1-1-project-setup.md]
- [1-2-design-system.md]

Gate criteria: "Foundation validated — schema, auth, design system working"

(A)pprove and start Wave 2
(R)evise — specify what needs fixing
(H)alt — stop and replan
```

### GitHub Actions
Gate implemented as environment protection rule requiring manual approval.

## Anti-Patterns

- **Auto-approving gates** — defeats the purpose. Every gate needs genuine human review.
- **Skipping gates** — only acceptable in dev/testing, never in production pipelines.
- **Approval without review** — the gate should prompt the human to actually check artifacts.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial gate protocol spec |
