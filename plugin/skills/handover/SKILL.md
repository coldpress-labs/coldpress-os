---
name: handover
description: "Phase 9 (client projects) — generate the client handover pack from LIVE sources (never hand-written): credentials manifest (from secure/, delivered via the client channel, never email), runbook (from the deploy pack), architecture one-pager (from the sacred docs), content-editing guide, dependency + license inventory, DNS/renewal map, and the support boundary."
license: MIT
compatibility: Invoked by @devops in Phase 9
allowed-tools: "Read Write Bash"
---

## Purpose

Hand the client a real, self-sufficient handover — **generated from the sources
that are already true**, never hand-written prose that drifts. A good handover is
what lets the client (or the next studio) run the thing without you, and it's a
studio deliverable, not an afterthought.

## When to Use

- Client projects, after production is live (post `deploy-prod` + prod smoke green).
  Regenerate whenever the sources change (new deploy pack, dependency, DNS).

## Process

Generate each artifact from its live source into `_context/operations/handover/`:

1. **Credentials manifest** — from `secure/manifest.yaml` (names + which service +
   where the value lives), **never the values**. Delivered via the client's secure
   channel (password manager / vault), **never email**.
2. **Runbook** — from the selected **deploy pack**: how to deploy (staging→prod),
   run smoke, and **roll back** (incl. the rollback-rehearsal note — it was
   exercised once on staging, §rollback), plus env/secret setup.
3. **Architecture one-pager** — distilled from `_context/sacred/architecture.md` +
   tech-stack: components, data flow, integrations, where things live.
4. **Content-editing guide** — for content-led sites: how to change copy/pages
   (CMS or repo path), and who owns what.
5. **Dependency + license inventory** — from `readiness`'s SBOM + license scan
   (what's used, under what licenses).
6. **DNS / renewal map** — domains, records, registrar, and **renewal dates** (the
   thing that silently expires).
7. **Support boundary** — what's covered vs out-of-scope (pairs with the acceptance
   record's scope) — the other half of the studio-protecting paperwork.

## Output

`_context/operations/handover/` — a generated pack the client can act on. All
artifacts trace to a live source, so a re-run reflects reality, never stale notes.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS6-F) | NEW (§5 P9 / G9). Client handover pack generated from live sources: credentials manifest (from secure/, never emailed), runbook (from the deploy pack + rollback rehearsal), architecture one-pager (sacred docs), content-editing guide, dependency+license inventory (readiness SBOM/license), DNS/renewal map, support boundary. |
