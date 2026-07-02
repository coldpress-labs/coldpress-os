---
name: integration-inventory
description: Phase 6. Every third-party service (payment, CMS, LiveKit/Deepgram, email, …) with sandbox strategy, webhook signature verification, rate limits, cost model, and an explicit failure-mode row — resilience designed at the moment dependencies are chosen. Includes an infra cost estimate.
license: MIT
compatibility: Invoked by @architect in Phase 6
version: "1.0"
---

## Purpose

Every external dependency is a failure point. This inventory forces resilience to
be **designed** when dependencies are chosen, not discovered in production, and
surfaces the infra cost for client quotes + cost routing (G10).

## Process

For each third-party service, record:

- `kind` (payment / cms / voice / email / …), `sandbox_strategy` (test mode),
  `webhook_signature` (verify inbound webhooks), `rate_limits`, `cost_model`.
- **`failure_mode` (required):** what does the product do when this dependency is
  down? Every row must resolve to a requirement or an ADR — no dangling risk.

Then set `infra_cost_estimate` (free tiers? monthly cost at expected scale).

## Output

`_context/architecture/integration-inventory.yaml` — validates against
`IntegrationInventory`. A row without a `failure_mode` fails validation; the P6
exit gate checks every integration resolves its failure mode.
