# Subagent Customization Guide — coldpress-os

> How to configure, override, and extend the 9 default subagents for your project.

---

## How Modes Work

Subagent behavior is controlled by **modes** set in `coldpress.yaml`. Butler reads the mode and passes it to the subagent in the task prompt. The subagent adapts its behavior accordingly.

### Default Mode Configuration

```yaml
# coldpress.yaml
agents:
  analyst:
    mode: "full"        # full | brief | creative | strategic
  developer:
    mode: "standard"    # standard | quick
  qa:
    depth: "rapid"      # rapid | strategic
  ux-designer:
    mode: "standard"    # standard | full-spec
```

### What Each Mode Does

**Analyst:**

| Mode | Behavior |
|------|----------|
| `full` | Complete interview + deep research. 10-15 questions. Produces comprehensive `context.md`. |
| `brief` | Product brief + trigger map only. 5 questions. Fast context capture for well-understood projects. |
| `creative` | Brainstorming / design thinking / problem solving mode. Uses techniques from `data/methods/`. |
| `strategic` | Innovation strategy, blue ocean analysis. Long-form strategic thinking. |

**Developer:**

| Mode | Behavior |
|------|----------|
| `standard` | Story-driven. TDD. Full ceremony — reads story spec, creates implementation plan, writes tests first, implements, runs tests, creates handoff artifact. |
| `quick` | Lean spec. Rapid implementation. Minimal docs. For well-understood tasks where ceremony adds overhead. |

**QA:**

| Mode | Behavior |
|------|----------|
| `rapid` | Coverage-first. Generates tests pragmatically. Focuses on the happy path + critical edge cases. |
| `strategic` | Risk-based. ATDD. CI/CD governance. NFR assessment. Full test strategy for high-stakes features. |

**UX Designer:**

| Mode | Behavior |
|------|----------|
| `standard` | UX spec from PRD — wireframes, component breakdown, interaction patterns. |
| `full-spec` | WDS flow — scenarios, sketches, Object IDs, full design system. For design-heavy projects. |

### Changing Modes

Edit `coldpress.yaml`. The change takes effect on the next subagent dispatch — no restart needed.

```yaml
# Switch developer to quick mode for rapid prototyping
agents:
  developer:
    mode: "quick"
```

---

## Overriding an Existing Subagent

To change a subagent's system prompt, model, or tools for your project:

### 1. Edit the Agent File Directly

Agent definitions live in your project at `.claude/agents/{slug}.md`. They're copies, not symlinks — you can edit them freely.

```yaml
---
name: architect
model: sonnet              # Changed from opus to sonnet (cost savings)
tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit                   # Added: let architect create ADR files directly
  - Write
maxTurns: 30               # Increased from 20
---

# Architect — {Your Project}

You are the Architect — the project's technical authority.

[... your customized system prompt ...]
```

### 2. Common Overrides

| Override | Why | How |
|----------|-----|-----|
| **Change model** | Cost or capability | Edit `model:` in frontmatter (`sonnet`, `opus`, `haiku`) |
| **Add tools** | Agent needs to write files | Add `Edit`, `Write` to `tools:` array |
| **Increase maxTurns** | Complex tasks hit the limit | Increase `maxTurns:` value |
| **Customize system prompt** | Project-specific expertise | Edit the markdown body |
| **Add domain context** | Agent needs project-specific knowledge | Add a "Project Context" section to the system prompt |

### 3. What Not to Override

- **Don't change `name:`** — it must match the filename and Butler's routing table
- **Don't remove core tools** like `Read` and `Grep` — agents need them to read the codebase
- **Don't add cross-agent communication** — subagents return results to Butler, they don't call each other

---

## Adding a Custom Subagent

For specialized needs not covered by the 9 defaults.

### Step 1: Create the Agent File

Create `.claude/agents/{slug}.md`:

```yaml
---
name: data-engineer
model: sonnet
tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
color: cyan
maxTurns: 25
---

# Data Engineer

You are the Data Engineer — the project's authority on data pipelines, 
ETL processes, and database optimization.

## Expertise

- Database schema design and optimization
- Data pipeline architecture (batch and streaming)
- Query performance tuning
- Data validation and quality checks

## Context You Need

Always read:
- `coldpress.yaml` — project config
- `docs/tech-stack.md` — locked technology decisions

Read when available:
- `_output/planning/architecture.md` — system architecture
- Database schema files

## Artifacts You Produce

| Artifact | Location |
|----------|----------|
| Data model documentation | `_output/planning/data-model.md` |
| Migration scripts | `migrations/` |
| Performance reports | `_output/testing/db-performance.md` |

## Boundaries

- You design and implement data layer code
- You do NOT make product decisions (defer to @pm)
- You do NOT design UI (defer to @ux-designer)
- You DO collaborate with @architect on system-level data decisions

## Handoff Protocol

When done, report: what was built, what was tested, any schema changes, 
recommended next steps. Include file paths for all artifacts produced.
```

### Step 2: Update Butler's Routing

Add the new agent to `.claude/SYSTEM.md`'s routing table:

```markdown
| @data-engineer | Database design, data pipelines, query optimization, migrations |
```

### Step 3: Reference in Skills (Optional)

If you create skills that dispatch to this agent, set `agent: "data-engineer"` in the skill's SKILL.md frontmatter.

### Step 4: Test

```
Ask @data-engineer to review the current database schema
```

Verify Butler dispatches correctly and the agent runs with the right model and tools.

---

## Model Selection Tips

| Consideration | Recommendation |
|---------------|---------------|
| **Cost-sensitive project** | Use `sonnet` for all agents. It handles most tasks well. |
| **Architecture-heavy project** | Keep `architect` on `opus` for deeper reasoning. |
| **Fast iteration / prototyping** | Use `haiku` for organizational agents (scrum-master), `sonnet` for everything else. |
| **Complex multi-step reasoning** | Consider `opus` for agents doing long-form analysis (analyst in strategic mode). |

### Model Capabilities

| Model | Strengths | Weaknesses |
|-------|-----------|------------|
| `opus` | Deep reasoning, complex architecture, nuanced analysis | Slower, higher cost |
| `sonnet` | Balanced — good reasoning, fast, cost-effective | May miss subtle architectural tradeoffs |
| `haiku` | Very fast, great for formatting and organization | Shallower reasoning, not for complex decisions |

---

## Tool Permission Patterns

| Pattern | Tools | Use For |
|---------|-------|---------|
| **Read-only** | `Read, Grep, Glob` | Reviewers, analyzers, scrum-master |
| **Read + execute** | `Read, Grep, Glob, Bash` | Researchers, architects (running tests/checks) |
| **Full write** | `Read, Grep, Glob, Bash, Edit, Write` | Developers, PMs (producing documents), QA |
| **Minimal** | `Read` | Lightweight advisory agents |

Be deliberate. An agent with `Write` access can create files — only grant it when the agent's job requires producing artifacts.

---

## Advanced: Parallel Dispatch

Butler can dispatch multiple subagents concurrently when their work is independent. This is configured in Butler's routing logic, not in individual agent files.

Safe parallel pairs:
- `@architect` + `@ux-designer` (different domains, same phase)
- `@developer` + `@developer` (different stories in the same wave)
- `@analyst` + `@communicator` (research + documentation)

Unsafe (sequential required):
- `@pm` then `@architect` (architecture depends on PRD)
- `@developer` then `@qa` (tests depend on implementation)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial subagent customization guide — modes, overrides, custom agents, model selection |
