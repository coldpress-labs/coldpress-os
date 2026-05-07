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
    User archetypes    → personas                            → @ux-designer

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

    Step 5: env-provision                        → @developer
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
                                 → create-architecture     → @architect
                                 → create-ux-design        → @ux-designer
  Everything                     → Phase 5 Breakdown
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
  A specific story        → dev-story (lifecycle/8-implementation/) → @developer (standard)
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
  Sprint/project status    → sprint-status (lifecycle/10-operate/)    → @scrum-master
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
| 6.0 | 2026-04-24 | Cadbury-hq | Phase II Part 3 Wave 5.3. Tree #3 ("I need to choose/change my tech stack") fully rewritten: warm-handoff pattern noted; Phase 3 4-step flow shown (discovery-sync → evaluation T1/T2/T3 → locking → post-CLI → env-provision); post-lock amendment path preserved via governance/tech-stack-change/workflow.md. |
| 5.0 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 5.4. Tree #2 ("I need to understand the problem") fully rewritten: warm-handoff note added; 8-skill Phase 2 Discovery flow shown (interview → parallel lane [domain + market + constraints + personas] → validate-idea → synthesize-research → product-brief); constraint-research corrected to @analyst-only (removed erroneous @architect); personas → @ux-designer added; ad-hoc creative methods expanded with problem-solving + innovation-strategy. Tree #4 ("I need to plan the product"): product-brief removed from Phase 4 start; "nothing yet → Phase 2 Discovery first" added; "product-brief (Phase 2 output)" now correctly gates create-prd. |
| 4.0 | 2026-04-24 | Cadbury-hq | Phase II Part 1 Wave 5.1b. Tree #1 ("I'm starting a new project") refreshed for the npm-era split: `coldpress doctor` + `coldpress init` (pre-session) replace the retired `project-init` reference; in-session leg now routes to `orient` → `intake` → Phase 2 handoff. |
| 3.0 | 2026-04-13 | Alfred | Rewritten for 9-subagent system. Added subagent + mode annotations to all trees. Added tree #10 (communication) and #11 (meta). Added quick reference table. |
| 2.0 | 2026-04-08 | Alfred | Updated all agent names to new naming convention |
| 1.0 | 2026-04-07 | Alfred | Initial decision trees — 10 routing scenarios |
