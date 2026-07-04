# Decision Trees — coldpress-os

> Routing guide: "When do I use X?" Answer the user's intent by mapping it to the right skill and subagent.

---

## 1. "I'm starting a new project"

```
→ Pre-session (CLI, from your terminal):
  → coldpress doctor                    (sanity-check Node/git/Claude Code)
  → coldpress init [project-name]       (scaffold + git init + pre-commit hook)
  → cd <slug> && claude

→ In-session (Butler, Phase 1 Bootstrap):
  → lifecycle/1-bootstrap/orient/       (scaffold health + lifecycle intro)
  → lifecycle/1-bootstrap/intake/       (6 steps: material → shape → intent →
                                         working mode → graph prime → gate)
  → Handoff to Phase 2 Discovery (@analyst pre-project-interview)
```

## 2. "I need to understand the problem / do research"

```
→ Phase 2: Discovery (warm-handoff — Butler reads Phase 1 intake outputs)

  Is context.md status = seed (Phase 1 just completed)?
    YES → pre-project-interview (lifecycle/2-discovery/)     → @analyst

  Parallel research lane (run as needed after interview):
    Domain/industry    → domain-research                     → @analyst
    Market/competition → market-research                     → @analyst
    Constraints/compliance → constraint-research             → @analyst
    User archetypes    → personas                            → @analyst

  Then sequentially:
    → validate-idea  (warn-severity — solo may skip)         → @analyst
    → synthesize-research                                    → @analyst
    → product-brief  (validated distillate, last step)       → @analyst

  Ad-hoc creative methods (any phase):
    Need ideas         → brainstorming (skills/creative/)    → @analyst (creative mode)
    Need empathy/users → design-thinking (skills/creative/)  → @analyst (creative mode)
    Solve a hard problem → problem-solving                   → @analyst (creative mode)
    Business strategy  → innovation-strategy                 → @analyst (strategic mode)
```

## 3. "I need to choose / change my tech stack"

```
First time choosing? (Phase 2 complete, no tech-stack.md yet)
  YES → Phase 3 Tech Stack (warm-handoff — reads Phase 2 evidence automatically)

    Step 1: stack-discovery-sync                → @architect
      Consolidate evidence + classify archetype + score packs + derive shortlist

    Step 2: stack-evaluation (repeat per decision-area)  → @architect
      T1 (pack pre-pick)    → fast-path confirm → brief ADR
      T2 (catalog)          → 6-dim rubric walk (fit/cost/familiarity/ecosystem/lock-in/vibe-fit)
      T3 (independent)      → graph-query + web-search + broad universe

    Step 3: stack-locking                        → @architect
      ADR inventory + red-flag escape hatch + baselines confirm → tech-stack.md [SACRED]

    Step 4: coldpress update --post-phase-3      (manual — between lock and provision)

    Step 5: env-provision                        → @architect
      Pack branch → quickstart skill OR generic runtime-install + baselines activation

  NO → Is tech-stack.md sacred (locked)?
    YES → governance/tech-stack-change/workflow.md    (post-lock amendments)
    NO  → Edit directly
```

## 4. "I need to plan the product"

```
What exists so far?
  Nothing yet                    → Phase 2 Discovery first
                                   (pre-project-interview → research → product-brief)
  product-brief (Phase 2 output) → create-prd              → @pm
  PRD exists                     → validate-prd            → @pm
                                 → ux-design              → @ux-designer (Phase 5 Design)
                                 → brand-guidelines       → @ux-designer (Phase 5 Design)
                                 → architecture-design    → @architect (Phase 6 Architecture)
  Everything                     → Phase 7 Breakdown (Shape A)
```

## 5. "I need to break this into tasks"

```
→ Phase 7: Breakdown
  → create-epics                              → @pm
  → create-stories                            → @pm
  → story-slice (builds story-graph.yaml)     → @pm
  → coldpress waves (waves + critical-path + schedule)  (CLI)
  → implementation-readiness (gate check)     → @pm
```

## 6. "I need to build / implement"

```
What are you building?
  A specific story        → dev-story (lifecycle/8-implementation/) → @developer (standard)
  Something quick/small   → quick-dev                               → @developer (quick)
  Need to review code     → code-review (skills/reviews/)           → @verifier
  Need to audit code      → code-audit (skills/reviews/)            → @verifier
  Need tests              → What kind?
    Acceptance tests      → atdd (skills/testing/)                  → @developer
    Test plan/strategy    → test-design                             → @developer
    Setup test framework  → test-framework                          → @developer
    Expand coverage       → test-automation                         → @developer
    Review test quality   → test-review                             → @verifier
```

## 7. "I need to deploy"

```
→ Phase 9: Deployment
  → readiness-check                                                 → @devops
  → env-check
  → dep-health-check
  → security-scan
  → db-migration-check (if applicable)
  → deploy                                                          → @devops
```

## 8. "I need to review / improve"

```
What kind of review?
  Adversarial/critical     → adversarial-review (skills/reviews/)
  Edge cases               → edge-case-hunter
  Writing quality          → editorial-prose                        (forkable editorial skill)
  Document structure       → editorial-structure                    (forkable editorial skill)
  Code quality             → code-review or code-audit              → @verifier
  Sprint/project status    → sprint-status (lifecycle/10-operate/)    → @devops
  Post-sprint lessons      → retrospective                          → @reviewer
  Course correction needed → correct-course                         → @pm
  Product evolution ideas  → product-evolution                      → @pm
```

## 9. "I need help brainstorming / thinking"

```
What kind of thinking?
  Generate ideas           → brainstorming       → @analyst (creative mode)
  User-centered design     → design-thinking     → @analyst (creative mode)
  Solve a hard problem     → problem-solving     → @analyst (creative mode)
  Business strategy        → innovation-strategy → @analyst (strategic mode)
  Craft a narrative        → storytelling        (forkable creative skill)
  Create a presentation    → presentation        (forkable creative skill)
  Push my thinking deeper  → advanced-elicitation (skills/utilities/)
  Get multiple perspectives → party-mode (skills/utilities/)
```

## 10. "I need documentation or communication"

```
What do you need?
  Technical documentation  → document-project    (forkable export skill)
  API documentation        → document-project    (forkable export skill)
  Pitch narrative          → storytelling         (forkable creative skill)
  Stakeholder presentation → presentation         (forkable creative skill)
```

## 11. "I want to improve coldpress-os itself"

```
What do you want to do?
  Create/edit an agent     → agent-builder (skills/meta/)   → Butler (main session)
  Create/edit a skill      → skill-builder                  → Butler (main session)
  Create/edit a workflow   → workflow-builder                → Butler (main session)
  Create/edit a template   → template-builder                → Butler (main session)
  Propose a change         → propose-change (creates GH issue) → Butler (main session)
```

---

## Quick Subagent Reference

| I need... | Dispatch to | Mode |
|-----------|------------|------|
| Research, interviews, brainstorming, personas | @analyst | discovery / brief / creative / strategic |
| PRD, planning, breakdown, stories | @pm | — |
| UX specs, design system | @ux-designer | standard / full-spec |
| Architecture, tech stack, provisioning | @architect | — |
| Code implementation, tests | @developer | standard / quick |
| Independent verification, quality gates | @verifier | — |
| Deployment, CI/CD, operations | @devops | — |
| Retrospective, evolve review | @reviewer | — |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 6.0 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 5.3. Tree #3 ("I need to choose/change my tech stack") fully rewritten: warm-handoff pattern noted; Phase 3 4-step flow shown (discovery-sync → evaluation T1/T2/T3 → locking → post-CLI → env-provision); post-lock amendment path preserved via governance/tech-stack-change/workflow.md. |
| 5.0 | 2026-04-24 | ColdPress Labs | Phase II Part 2 Wave 5.4. Tree #2 ("I need to understand the problem") fully rewritten: warm-handoff note added; 8-skill Phase 2 Discovery flow shown (interview → parallel lane [domain + market + constraints + personas] → validate-idea → synthesize-research → product-brief); constraint-research corrected to @analyst-only (removed erroneous @architect); personas → @ux-designer added; ad-hoc creative methods expanded with problem-solving + innovation-strategy. Tree #4 ("I need to plan the product"): product-brief removed from Phase 4 start; "nothing yet → Phase 2 Discovery first" added; "product-brief (Phase 2 output)" now correctly gates create-prd. |
| 4.0 | 2026-04-24 | ColdPress Labs | Phase II Part 1 Wave 5.1b. Tree #1 ("I'm starting a new project") refreshed for the npm-era split: `coldpress doctor` + `coldpress init` (pre-session) replace the retired `project-init` reference; in-session leg now routes to `orient` → `intake` → Phase 2 handoff. |
| 3.0 | 2026-04-13 | ColdPress Labs | Rewritten for 9-subagent system. Added subagent + mode annotations to all trees. Added tree #10 (communication) and #11 (meta). Added quick reference table. |
| 2.0 | 2026-04-08 | ColdPress Labs | Updated all agent names to new naming convention |
| 1.0 | 2026-04-07 | ColdPress Labs | Initial decision trees — 10 routing scenarios |
