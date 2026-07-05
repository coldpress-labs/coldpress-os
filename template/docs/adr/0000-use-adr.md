# ADR-0000 — Record architecture decisions

- **Status:** Accepted
- **Date:** {{date}}
- **Deciders:** {{user_name}}
- **Supersedes:** —

## Context

We need to record the architectural decisions made on this project. Decisions accrue silently without a dedicated artefact — eroding shared understanding, making onboarding slow, and inviting re-litigation.

## Decision

We use Architecture Decision Records (ADRs), following the format proposed by [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

Each decision lives as a numbered file under `docs/adr/NNNN-short-slug.md`. Numbering is sequential and immutable — superseded decisions stay in place; new decisions supersede them explicitly.

ADRs are referenced from the PRD (`_context/sacred/prd.md` frontmatter `adr_references[]`) and enforced at the Phase-4 exit gate (`coldpress validate-frontmatter-min _context/sacred/prd.md adr_references --min 1`). Every PRD must link to at least one ADR.

## Consequences

- New architectural decisions are discoverable in git history under `docs/adr/`.
- PRDs can no longer be merged without anchoring to a decision.
- Superseded decisions remain readable — history is additive, not destructive.

## Links

- [Nygard — Documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [adr-tools](https://github.com/npryce/adr-tools) — optional CLI that scaffolds new ADRs matching this format.
