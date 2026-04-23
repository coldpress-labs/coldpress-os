# Glossary — coldpress-os

> Terminology used across the framework. Alphabetical order.

---

| Term | Definition |
|------|-----------|
| **A/P/C Menu** | The standard navigation options in step-file workflows: Advanced (go deeper), Party Mode (multi-agent perspectives), Continue (next step). |
| **Butler** | The main Claude Code session that orchestrates subagents. Not a subagent itself. Butler reads CLAUDE.md and .claude/SYSTEM.md, routes work to subagents, and synthesizes results. |
| **Cascade** | The process of updating all downstream artifacts when a sacred document changes. |
| **coldpress.yaml** | The single project configuration file that coldpress-os reads. Lives at project root. Includes agent mode configuration. |
| **DAG** | Directed Acyclic Graph — used by the orchestrator to model task dependencies for parallelization. |
| **Dispatch** | The act of Butler delegating work to a subagent. Butler constructs a task prompt with context, file paths, and mode, then the subagent runs independently. |
| **Governance** | The rules protecting sacred documents from uncontrolled changes. See `governance/sacred-docs.md`. |
| **Halt-at-Menu** | The step-file rule requiring agents to stop and wait for user input when presenting options. |
| **Handoff Artifact** | A `_handoff.md` file summarizing decisions, open questions, and constraints when work transfers between subagents. Stored in `_context/handoffs/`. |
| **Lifecycle Phase** | One of 8 sequential stages of project development (Bootstrap through Evolve). |
| **Multi-Agent Orchestration** | The pattern where Butler dispatches work to independent subagents, each with their own context window, tools, and model. |
| **Mode** | A subagent operating configuration set in `coldpress.yaml` and passed by Butler. Examples: developer (standard/quick), qa (rapid/strategic), analyst (discovery/brief/creative/strategic). |
| **PERT Chart** | Program Evaluation Review Technique — a schedule showing task dependencies, critical path, and parallel work opportunities. Generated in Phase 5. |
| **Progressive Disclosure** | Loading one step-file at a time rather than the entire workflow. Reduces context load and prevents skipping. |
| **Promotion** | Copying validated application code from devSandbox to the production app repo. Planning artifacts never promote. |
| **Sacred Document** | A foundational project artifact (context.md, tech-stack.md, PRD, architecture.md, PERT) protected by change workflows. |
| **Skill** | The atomic unit of work in coldpress-os. Self-contained with step-files and references. See `skills/_schema.md`. |
| **Stack Pack** | A pluggable set of skills for a specific technology stack (e.g., Convex, Supabase). |
| **Step-File** | A single-step Markdown file in a multi-step workflow. See `docs/step-file-spec.md`. |
| **Subagent** | An independent Claude Code instance with its own context window, tools, and model. Defined in `.claude/agents/`. Dispatched by Butler, returns results to Butler. Cannot call other subagents directly. |
| **Task Prompt** | The context Butler constructs when delegating to a subagent — includes the user's request, relevant file paths, prior decisions, mode, and constraints. |
| **Thin Wrapper** | A 3-line `.claude/skills/` entry that points to the canonical skill in the coldpress-os submodule. |
| **Three-Tier Pattern** | Project structure: local root (credentials) → devSandbox (all dev) → app (production only). Pattern A. |
| **Valet** | Butler's meta counterpart — the framework evolution subagent. Proposes changes to coldpress-os via GitHub Issues/PRs. Operates outside the normal lifecycle. |
| **Wave** | A group of tasks that can execute in parallel, determined by topological sorting of the DAG. |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-04-14 | Alfred | Replaced MAO acronym with full "Multi-Agent Orchestration" term. |
| 2.0 | 2026-04-13 | Alfred | Rewrote for 9-subagent system. Replaced "Agent" with "Subagent" and "Butler". Added: Butler, Dispatch, Handoff Artifact, Multi-Agent Orchestration, Mode, Subagent, Task Prompt, Valet. Removed deprecated persona references. |
| 1.0 | 2026-04-07 | Alfred | Initial glossary — 20 terms |
