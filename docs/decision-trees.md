# Decision Trees — coldpress-os

> Routing guide: "When do I use X?" Answer the user's intent by mapping it to the right skill and subagent.

---

## 1. "I'm starting a new project"

```
→ Phase 1: Bootstrap
  → lifecycle/1-bootstrap/project-init/
  → Then: coldpress-os init (install/init.md)
  → Then: Phase 2 Discovery
```

## 2. "I need to understand the problem / do research"

```
Is this a new project with no context.md?
  YES → pre-project-interview (lifecycle/2-discovery/)     → @analyst
  NO  → What kind of research?
    Domain/industry    → domain-research                    → @analyst
    Market/competition → market-research                    → @analyst
    Technical          →  constraint-research                 → @analyst + @architect
    Need ideas         → brainstorming (skills/creative/)   → @analyst (creative mode)
    Need empathy/users → design-thinking (skills/creative/) → @analyst (creative mode)
```

## 3. "I need to choose / change my tech stack"

```
First time choosing?
  YES → stack-evaluation → stack-locking (lifecycle/3-tech-stack/) → @architect
  NO  → Is tech-stack.md sacred (locked)?
    YES → governance/tech-stack-change/workflow.md
    NO  → Edit directly
```

## 4. "I need to plan the product"

```
What exists so far?
  Nothing           → product-brief           → @analyst (brief mode)
                    → create-prd              → @pm
  context.md only   → product-brief           → @analyst (brief mode)
                    → create-prd              → @pm
  Product brief     → create-prd              → @pm
  PRD exists        → validate-prd            → @pm
                    → create-architecture     → @architect
                    → create-ux-design        → @ux-designer
  Everything        → Phase 5 Breakdown
```

## 5. "I need to break this into tasks"

```
→ Phase 5: Breakdown
  → create-epics                              → @pm
  → create-stories                            → @pm
  → parallelization-strategy (generates PERT) → @scrum-master
  → sprint-planning                           → @scrum-master
  → implementation-readiness (gate check)     → @qa
```

## 6. "I need to build / implement"

```
What are you building?
  A specific story        → dev-story (lifecycle/6-implementation/) → @developer (standard)
  Something quick/small   → quick-dev                               → @developer (quick)
  Need to review code     → code-review (skills/reviews/)
  Need to audit code      → code-audit (skills/reviews/)
  Need tests              → What kind?
    Acceptance tests      → atdd (skills/testing/)                  → @qa (strategic)
    Test plan/strategy    → test-design                             → @qa (strategic)
    Setup test framework  → test-framework                          → @qa (strategic)
    Expand coverage       → test-automation                         → @qa (rapid)
    Review test quality   → test-review                             → @qa
```

## 7. "I need to deploy"

```
→ Phase 7: Deployment
  → readiness-check                                                 → @qa
  → env-check
  → dep-health-check
  → security-scan
  → db-migration-check (if applicable)
  → deploy                                                          → @developer
```

## 8. "I need to review / improve"

```
What kind of review?
  Adversarial/critical     → adversarial-review (skills/reviews/)
  Edge cases               → edge-case-hunter
  Writing quality          → editorial-prose                        → @communicator
  Document structure       → editorial-structure                    → @communicator
  Code quality             → code-review or code-audit              → @qa
  Sprint/project status    → sprint-status (lifecycle/8-operate/)    → @scrum-master
  Post-sprint lessons      → retrospective                          → @scrum-master
  Course correction needed → correct-course                         → @scrum-master + @pm
  Product evolution ideas  → product-evolution                      → @pm
```

## 9. "I need help brainstorming / thinking"

```
What kind of thinking?
  Generate ideas           → brainstorming       → @analyst (creative mode)
  User-centered design     → design-thinking     → @analyst (creative mode)
  Solve a hard problem     → problem-solving     → @analyst (creative mode)
  Business strategy        → innovation-strategy → @analyst (strategic mode)
  Craft a narrative        → storytelling        → @communicator (narrative mode)
  Create a presentation    → presentation        → @communicator (presentation mode)
  Push my thinking deeper  → advanced-elicitation (skills/utilities/)
  Get multiple perspectives → party-mode (skills/utilities/)
```

## 10. "I need documentation or communication"

```
What do you need?
  Technical documentation  → document-project    → @communicator (documentation mode)
  API documentation        →                     → @communicator (documentation mode)
  Pitch narrative          → storytelling         → @communicator (narrative mode)
  Stakeholder presentation → presentation         → @communicator (presentation mode)
```

## 11. "I want to improve coldpress-os itself"

```
What do you want to do?
  Create/edit an agent     → agent-builder (skills/meta/)   → @valet
  Create/edit a skill      → skill-builder                  → @valet
  Create/edit a workflow   → workflow-builder                → @valet
  Create/edit a template   → template-builder                → @valet
  Propose a change         → propose-change (creates GH issue) → @valet
```

---

## Quick Subagent Reference

| I need... | Dispatch to | Mode |
|-----------|------------|------|
| Research, interviews, brainstorming | @analyst | discovery / brief / creative / strategic |
| PRD, product decisions, epics | @pm | — |
| UX specs, design system | @ux-designer | standard / full-spec |
| Architecture, tech stack | @architect | — |
| Code implementation | @developer | standard / quick |
| Tests, quality gates | @qa | rapid / strategic |
| Sprint planning, tracking | @scrum-master | — |
| Docs, narratives, presentations | @communicator | documentation / narrative / presentation |
| Framework improvements | @valet | — |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-04-13 | Alfred | Rewritten for 9-subagent system. Added subagent + mode annotations to all trees. Added tree #10 (communication) and #11 (meta). Added quick reference table. |
| 2.0 | 2026-04-08 | Alfred | Updated all agent names to new naming convention |
| 1.0 | 2026-04-07 | Alfred | Initial decision trees — 10 routing scenarios |
