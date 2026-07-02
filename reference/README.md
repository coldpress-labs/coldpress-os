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

> Note (ledger delta **D4**): a later workstream (§8 item 12) renames
> `templates/` → `reference/` after pruning. Because this directory already
> exists, that step becomes a merge-into-existing rather than a bare rename.
