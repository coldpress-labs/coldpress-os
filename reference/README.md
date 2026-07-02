# reference/

Repo-internal reference material — **not** shipped into scaffolded consumer
projects (it is not in `frameworkDirs`, `src/utils/paths.ts`). A holding area for
material that is kept for provenance or future consumption but has no active
wiring in the framework runtime.

Current contents:

- **`legacy-manifest.md`** — moved here from the former `_sandbox/` (v0.4 overhaul
  WS0, §8 item 4). Its final home is the **brownfield capability pack's scaffold**
  (plan §7.6), which does not exist yet; parked here until that pack lands so it
  is out of the framework root. See the execution ledger delta **D1**.
- **`ci-cd/`** — CI pipeline templates for runners the studio does not use
  (Harness, GitLab, Azure), moved from `data/ci-cd/` (WS0 §8 item 13). The studio
  runs GitHub Actions + Forgejo; `github-actions.yaml` stays in `data/ci-cd/`.
- **`brownfield-pending/`** — three lifecycle skills moved out of the standard
  Phase 1/4/5 flow per §5's per-skill dispositions ("MOVE into the brownfield
  pack") and §8 item 6 ("Brownfield-bound"): `codebase-onboarding` (was
  `lifecycle/1-bootstrap/`), `legacy-assessment` (was `lifecycle/4-planning/`),
  `legacy-ui-assessment` (was `lifecycle/5-design/`). Their real home is the
  **brownfield capability pack** (plan §7.6 — `capability: brownfield`, a
  size-threshold-triggered pack with a swappable indexer interface), which does
  not exist yet. Parked here, content unchanged, until that pack lands. This
  means brownfield-project legacy-assessment support is **temporarily
  unavailable** in the standard lifecycle (the Phase 4/5 gate checks that made
  them conditional were removed to match — see ledger delta **D17**), not a
  silent regression: WS6-era work is expected to build the pack and either
  restore equivalent gating there or supersede the need for it.

> Note (ledger delta **D4**): a later workstream (§8 item 12) renames
> `templates/` → `reference/` after pruning. Because this directory already
> exists, that step becomes a merge-into-existing rather than a bare rename.
