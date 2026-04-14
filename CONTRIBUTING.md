# Contributing to coldpress-os

Thanks for your interest in contributing. coldpress-os is an early-stage,
opinionated framework maintained by ColdPress Labs. We welcome feedback,
bug reports, and thoughtful proposals — though we are not yet accepting
large unsolicited PRs while the core architecture stabilizes.

---

## Project status

**Current phase:** pre-alpha. The public API, skill structure, and directory
layout may change between minor versions. We recommend pinning to a specific
commit or tag when consuming coldpress-os as a submodule.

**Versioning:** semantic versioning (`MAJOR.MINOR.PATCH`) once we reach v1.0.
Until then, expect breaking changes on any minor bump.

---

## Ways to contribute

### 1. Report a bug

> **Security vulnerability?** Please do **not** open a public issue.
> Email `team@coldpressai.com` instead — see [SECURITY.md](SECURITY.md)
> for the full disclosure policy.

Open a [GitHub Issue](https://github.com/coldpress-ai/coldpress-os/issues)
using the **Bug Report** template. Please include:

- The coldpress-os version/commit SHA you're on
- A minimal reproduction (a sample project or skill invocation)
- Expected vs. actual behavior
- Your environment (OS, Claude Code version, shell)

### 2. Propose an enhancement

For anything non-trivial, **open an Issue first** before writing code. This
lets us discuss fit, scope, and architectural implications before you invest
effort.

If you're using coldpress-os inside a project, the `propose-change` skill can
generate a well-structured proposal for you:

```
Run the propose-change skill
```

### 3. Improve documentation

Documentation PRs are always welcome and have the lowest friction. Typos,
clarifications, broken links, missing examples — all fair game.

### 4. Contribute a stack pack

Stack packs are pluggable skill sets for specific technology stacks (e.g.,
Convex, Supabase, Cloudflare Workers). See
[docs/stack-pack-guide.md](docs/stack-pack-guide.md) for the authoring spec.

---

## Development guidelines

### Sacred documents

Some files in this repository are **sacred** and protected by governance
workflows. Changes to these require formal proposal and review:

- `lifecycle/` phase definitions
- Core agent definitions in `agents/`
- The step-file specification (`docs/step-file-spec.md`)
- This file and `LICENSE` / `NOTICE.md`

### Style

- **Commit messages:** conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`,
  `chore:`). Scope is optional but encouraged (`feat(orchestrator): ...`).
- **Skills:** follow the step-file spec. Each skill must be self-contained and
  declare its inputs, outputs, and preconditions.
- **Version panels:** all markdown documents in coldpress-os must include a
  **Version Control** table at the bottom with `Version | Date | Author | Changes`.

### Testing

Add or update tests for any behavioral change. coldpress-os does not ship with
a runtime — correctness is validated through skill composition tests and
representative end-to-end scenarios.

---

## Licensing and provenance

By contributing, you agree that your contribution is licensed under the
[MIT License](LICENSE) and that you have the right to license it.

If your contribution incorporates code from another project, you must:

1. Ensure that project's license is compatible with MIT
2. Preserve the original copyright notice
3. Update [NOTICE.md](NOTICE.md) to record the derivation

---

## Attribution

coldpress-os is a derivative work of [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD).
See [NOTICE.md](NOTICE.md) for full attribution and the nature of the derivation.

---

## Code of conduct

Participation in this project is governed by the
[Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating,
you agree to uphold it.

---

## Contact

- **Issues & PRs:** https://github.com/coldpress-ai/coldpress-os
- **Maintainer:** ColdPress Labs — https://coldpressai.com
- **Email:** team@coldpressai.com

---

*Last updated: 2026-04-15*
