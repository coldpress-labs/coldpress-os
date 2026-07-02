---
name: api-contract
description: Phase 6. Author the API/type surface as a first-class artifact (OpenAPI or a typed route map), keyed to requirement ids. P7's contract stories are extracted FROM this — the wave-safety mechanism gets its content designed here, not invented per story.
license: MIT
compatibility: Invoked by @architect in Phase 6
version: "1.0"
---

## Purpose

For any project with an API surface, design the operations up front and **key each
to the requirement ids it serves**. P7's contract stories (`CT-*`) extract from
this, so the interface a wave freezes is designed here rather than improvised.

## Process

1. Enumerate every operation (method + path, or the typed route). Give each a
   stable `id`.
2. Set `requirement_ids` on each operation — the PRD requirements it satisfies.
   `coldpress trace` uses this keying (requirement → operation → story).
3. Choose `format: openapi | typed-routes`.

## Output

`_context/architecture/api-contract.yaml` — validates against the `ApiContract`
schema. Every operation with a requirement id feeds the P6 `trace orphans` check
(a requirement with no operation/story is flagged).
