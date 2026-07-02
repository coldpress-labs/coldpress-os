---
name: "client-acceptance"
description: "Phase 9 (client projects) — the UAT sub-stage between staging smoke and the prod trigger. Shares the staging URL for a structured feedback window, captures feedback as RECORDS (not WhatsApp archaeology), triages each item bug-vs-change-request (bugs block prod; change-requests become next-cycle deltas), and writes the acceptance record (who approved, what scope, when) that deploy-gate requires before deploy-prod."
type: "workflow"
category: "lifecycle"
phase: 9
agent: "devops"
tools: ["Read", "Write", "Bash"]
inputs:
  - "green staging smoke + the staging URL"
  - "the release scope (trace release / diffstat / verifier verdicts)"
outputs:
  - artifact: "Acceptance record"
    location: "_context/operations/acceptance/ACC-{seq}.yaml"
    format: "yaml"
    schema: "schemas/operations/acceptance-record.schema.ts"
---

## Purpose

Turn "the client said it's fine" into an **artifact**. For client work, production
is not triggered on the studio's say-so — it's triggered after a structured
acceptance, recorded. This is the sub-stage that sits between a green staging smoke
and the human prod trigger, and it produces the record `deploy-gate` checks.

## When to Use

- Client projects at Phase 9, after `deploy-staging` + a **green staging smoke**,
  before `deploy-prod`. (Internal projects skip this — `deploy.requires_acceptance`
  is false and `deploy-gate` does not require a record.)

## Process

1. **Share staging** — give the client the staging URL + a short "what to check"
   (the release scope: which requirements/flows shipped). Open a bounded **feedback
   window** (e.g. 2–3 days), not an open-ended one.
2. **Capture feedback as records** — every item goes into the record's `feedback[]`,
   not a chat thread. For each, **triage**:
   - **`bug`** — it doesn't do what was agreed. **Blocks prod.** Fix it (re-enter
     Phase 8 for the fix), re-deploy staging, re-smoke; the record can't be a plain
     `accepted` while an unresolved bug stands.
   - **`change-request`** — a new/changed want beyond the agreed scope. Does **not**
     block this release — it becomes a **DLT/story for the next cycle** (record the
     id in `disposition`). This is the line that protects the studio.
3. **Get the sign-off** — a real person + role approves, on the record:
   `verdict: accepted | accepted-with-conditions | rejected`, with `conditions[]`
   when conditional.
4. **Write the acceptance record** — `_context/operations/acceptance/ACC-{seq}.yaml`
   (schema'd): `approved_by`, `scope`, `release_ref`, `verdict`, `date`, `feedback[]`.
   Butler sets `state.deploy.requires_acceptance` for the project and, once the
   record exists with an acceptable verdict, `deploy-gate` will permit `deploy-prod`.

## Output

`ACC-{seq}.yaml` — the acceptance artifact + the triaged feedback. A `rejected`
verdict or an unresolved `bug` keeps `deploy-gate` closed. Change-requests are
handed to Phase 11 / the next cycle as deltas.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS6-E) | NEW (§5 P9 client UAT). The staging-smoke→prod sub-stage for client projects: structured feedback window; feedback triaged bug (blocks) vs change-request (next-cycle delta); schema'd acceptance record at `_context/operations/acceptance/`, the artifact `deploy-gate` requires when `deploy.requires_acceptance`. |
