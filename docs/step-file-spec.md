# Step-File Specification — coldpress-os

> The step-file micro-architecture is THE convention for complex, multi-step workflows in coldpress-os. This document is the authoritative reference.

---

## 1. What is a Step-File?

A step-file is a self-contained Markdown file that represents one discrete step in a multi-step workflow. Each step-file contains everything needed to execute that step: goal, instructions, user interaction prompts, output format, and navigation.

**Core principle:** Load one step at a time. The executing agent never reads ahead.

---

## 2. Why Step-Files?

| Problem | Step-File Solution |
|---------|-------------------|
| Large workflows overwhelm context | Each step is loaded individually — progressive disclosure |
| Users lose track of progress | State tracked in output document frontmatter |
| Agents skip or rush steps | Sequential enforcement — no peeking ahead |
| Interrupted workflows lose progress | Resume from last completed step via frontmatter state |
| Different modes need different flows | Variant directories (steps-c/, steps-e/, steps-v/) |

---

## 3. Directory Structure

### Standard (single mode)

```
skills/{category}/{skill-name}/
├── SKILL.md
├── workflow.md
└── steps/
    ├── step-01-discovery.md
    ├── step-02-analysis.md
    ├── step-03-synthesis.md
    └── step-04-output.md
```

### Multi-mode (create / edit / validate)

```
skills/{category}/{skill-name}/
├── SKILL.md
├── workflow.md
└── steps/
    ├── steps-c/              # Create mode
    │   ├── step-01-*.md
    │   └── ...
    ├── steps-e/              # Edit mode
    │   ├── step-01-*.md
    │   └── ...
    └── steps-v/              # Validate mode
        ├── step-01-*.md
        └── ...
```

---

## 4. Step-File Format

### 4.1 Frontmatter (Required)

```yaml
---
step_number: 1
step_name: "Discovery"
step_goal: "Understand the project context and gather initial requirements"
halts_for_input: true
next_step: "step-02-analysis.md"
---
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `step_number` | int | Yes | Sequential number (1-indexed) |
| `step_name` | string | Yes | Human-readable name |
| `step_goal` | string | Yes | One sentence — what completing this step achieves |
| `halts_for_input` | bool | Yes | `true` if step waits for user input before completing |
| `next_step` | string | Yes | Filename of next step, or `"complete"` for final step |

### 4.2 Body Structure

```markdown
# Step {N}: {Step Name}

> {step_goal repeated for visibility}

## Instructions

{What the executing agent should do in this step.
Written as directives to the agent, not to the user.}

## User Interaction

{Questions to ask the user, options to present, input to gather.
If halts_for_input is true, this section defines the halt point.}

## Output

{What to write or append to the output document.
Include the exact section structure, headings, and format.}

## Navigation

{Menu options and next-step routing.}

**Options:**
- **A** — Advanced: deeper exploration of this step
- **P** — Party Mode: get perspectives from multiple agents
- **C** — Continue: proceed to next step

→ On **C**: Load `{next_step}`
```

---

## 5. Execution Rules

These rules are NON-NEGOTIABLE for any agent executing a step-file workflow:

### 5.1 Sequential Loading
- Load ONE step at a time
- NEVER read ahead to future steps
- NEVER load the entire steps/ directory at once

### 5.2 Complete Before Proceeding
- Every section of the current step must be executed
- Output must be written before moving to the next step
- User confirmation required before advancing (if `halts_for_input: true`)

### 5.3 No Skipping
- Every step exists for a reason
- Even if the agent "knows" the answer, the step's process must be followed
- The user may skip by explicitly requesting it — the agent never skips autonomously

### 5.4 State Tracking
- Progress is tracked in the output document's YAML frontmatter:

```yaml
---
workflow: "{skill-name}"
workflow_version: "1.0"
steps_completed: [1, 2, 3]
current_step: 4
started_at: "2026-04-07T10:00:00Z"
last_updated: "2026-04-07T11:30:00Z"
---
```

### 5.5 Resumability
- On interruption (session end, context loss), the workflow resumes from the last completed step
- The resume protocol:
  1. Read output document frontmatter
  2. Find `current_step` value
  3. Load the corresponding step file
  4. Confirm with user: "Resuming from Step {N}: {step_name}. Continue?"

### 5.6 Halt-at-Menu
- When a step presents a menu (A/P/C or custom options), the agent MUST stop and wait
- Never auto-select an option
- Never proceed without explicit user choice

### 5.7 User Input Required
- Never generate substantive content without user input or confirmation
- Ask, then produce — not produce, then ask
- When the user provides input, incorporate it faithfully

---

## 6. The A/P/C Menu Convention

Most step-files offer three navigation options at their halt point:

| Option | Name | Behavior |
|--------|------|----------|
| **A** | Advanced | Go deeper on the current step — additional analysis, alternative approaches, edge cases |
| **P** | Party Mode | Invoke multiple agent perspectives on the current step's topic |
| **C** | Continue | Mark step complete, load next step |

### Custom Menus

Steps may define custom options beyond A/P/C:

```markdown
**Options:**
- **1** — Focus on B2C market
- **2** — Focus on B2B market
- **3** — Explore both markets
- **A** — Advanced analysis of market segmentation
- **C** — Continue with default recommendation
```

---

## 7. Output Document Convention

Step-file workflows progressively build an output document. Each step appends its section.

### Document Structure

```markdown
---
workflow: "product-brief"
workflow_version: "1.0"
steps_completed: [1, 2]
current_step: 3
started_at: "2026-04-07T10:00:00Z"
last_updated: "2026-04-07T10:45:00Z"
---

# Product Brief: {Project Name}

## 1. Executive Summary
{Written in Step 1}

## 2. Problem Statement
{Written in Step 2}

## 3. Target Audience
{Being written in Step 3...}
```

### Append-Only Rule

- Steps APPEND to the output document — they never overwrite previous sections
- Exception: edit-mode steps (`steps-e/`) may modify existing sections
- Validate-mode steps (`steps-v/`) annotate but don't modify

---

## 8. Step-File Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|-------------|---------------|-----------------|
| Loading all steps at once | Defeats progressive disclosure, wastes context | Load one step at a time |
| Skipping steps autonomously | Each step builds on the previous; gaps cause errors | Follow sequence strictly |
| Generating without asking | Produces generic output that doesn't match user intent | Ask, incorporate, then produce |
| Peeking ahead | Creates bias toward later steps, short-circuits exploration | Trust the sequence |
| Storing state in memory | Memory is volatile; step-files survive session breaks | Track state in output frontmatter |
| Duplicating data inline | Creates maintenance burden, drift risk | Reference canonical `data/` assets |

---

## 9. Creating New Step-File Workflows

Use the `meta/workflow-builder` skill, or follow this checklist:

1. Define the workflow goal and expected output
2. Break into discrete steps (aim for 5-15 steps)
3. For each step, identify: goal, user interaction, output section
4. Determine if the skill needs create/edit/validate variants
5. Write `SKILL.md` with frontmatter per skill schema
6. Write `workflow.md` with step index and execution rules
7. Write each step file with frontmatter per this spec
8. Create any assets/ templates the steps reference
9. Test the full workflow end-to-end

---


---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 11 Shape A subagents (analyst · architect · pm · ux-designer · scrum-master · developer · qa · devops · reviewer · communicator · valet) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.
### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | ColdPress Labs | Initial step-file specification — codified from BMAD step-file architecture |
