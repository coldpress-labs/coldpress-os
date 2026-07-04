# Architecture Decision Records

This directory holds the project's ADRs — numbered, immutable records of architectural decisions.

## Format

Files are named `NNNN-short-slug.md` (e.g., `0001-adopt-postgres.md`). Numbering is sequential and never reused; superseded decisions stay in place and point to their replacement.

Each ADR follows the [Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions):

- **Status:** Proposed / Accepted / Deprecated / Superseded (by ADR-NNNN)
- **Context:** what forces the decision
- **Decision:** what we're doing
- **Consequences:** what changes as a result

See [0000-use-adr.md](./0000-use-adr.md) for the seed decision.

## Why ADRs

PRDs reference ADRs (frontmatter `adr_references[]`). Conftest enforces the link: no PRD merges without at least one ADR anchor. Rationale: design decisions that don't survive in git history invite re-litigation and silent drift.

## Optional tooling

[adr-tools](https://github.com/npryce/adr-tools) — BSD-2 licensed CLI that scaffolds new ADRs matching this format:

```bash
brew install adr-tools
cd docs/adr
adr new "Adopt Postgres"
```

Tooling is optional — a plain editor works too.

## Related governance

- Semantic validation: `coldpress-os/authoring/governance/policies/prd_has_adr.rego`
- RFC template (for larger, in-progress proposals): `coldpress-os/authoring/governance/rfc-amendment.md`
