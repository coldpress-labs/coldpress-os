---
name: observability-setup
description: How to get coldpress-os EventStream runs into an OTel backend (Langfuse, Arize Phoenix, or vendor-neutral OTLP).
version: "1.0"
---

# Observability setup (§6.8)

> Pick a backend, run the exporter, watch your runs appear as traces.
> This doc walks the three supported paths: **Langfuse self-host** (MIT,
> recommended), **Arize Phoenix** (Elastic License 2.0 — power-user
> alternative), and **any other OTLP/HTTP backend**.

**Source decision:** [Phase I plan §6.8](./phase-i-implementation-plan.md#68-coldpressotel-exporter--optional-observability-emission-package) + [fourth-pass-oss-survey-2026-04-23.md](./fourth-pass-oss-survey-2026-04-23.md).

---

## The big picture

```
.coldpress/runs/<run-id>/events.jsonl     ← source of truth (EventStream §6.4)
                  │
                  ▼
    @coldpress/otel-exporter              ← this package
                  │
                  ▼
         OTLP/HTTP over 4318              ← standard OTel transport
                  │
                  ▼
   Langfuse / Phoenix / Jaeger / etc.     ← pluggable backends
```

The EventStream JSONL stays authoritative. The exporter is a *sidecar*
— it's optional, doesn't alter the on-disk record, and is idempotent
(re-emission produces identical trace/span ids). You can run it in
CI, on a schedule, or on demand. `@coldpress/core` has no dependency
on the exporter and never will.

See [`packages/otel-exporter/README.md`](../packages/otel-exporter/README.md)
for the CLI and mapping reference.

---

## Recommended: Langfuse (MIT) via self-host

**Why Langfuse:** MIT-licensed, OTel-ingest-capable since v3, purpose-built
for LLM-workflow tracing (the UI understands trace nesting, metric
aggregation, and prompt/completion payloads out of the box). Active
community, production deployments in the thousands.

### Self-host in one command

Langfuse publishes an official Docker Compose bundle:

```sh
git clone https://github.com/langfuse/langfuse.git
cd langfuse
docker compose up -d
# Langfuse UI at http://localhost:3000
# OTLP HTTP endpoint at http://localhost:3000/api/public/otel
```

Generate a project key from the Langfuse UI (Settings → API keys).
Langfuse expects keys via OTLP headers as basic auth — add them to the
exporter call:

```sh
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:3000/api/public/otel
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic <base64(pk:sk)>"
coldpress-otel-export --latest
```

Langfuse's "Traces" view renders the wave → skill / gate span tree, and
the OpenLLMetry `traceloop.*` attributes light up the LLM-workflow UI
primitives.

### Why not Langfuse Cloud?

You can absolutely use Langfuse Cloud (they offer a managed tier). The
self-host recommendation here is about **licence compatibility and data
residency**: with MIT self-host, the exporter + backend stack stays
inside your infrastructure, no third-party TOS gates your dev-time
traces. If your team is fine with the cloud TOS, the endpoint change
is one env var.

---

## Alternative: Arize Phoenix (⚠ Elastic License 2.0)

> **Licence caveat.** Arize Phoenix is distributed under the
> [Elastic License 2.0 (ELv2)](https://www.elastic.co/licensing/elastic-license).
> ELv2 is **source-available, not OSI-approved**. It restricts using
> Phoenix to offer a managed service that substantially competes with
> Arize. For internal observability use, ELv2 is typically fine; for
> embedding or redistributing Phoenix as part of a product, **talk to
> legal first**.
>
> coldpress-os itself is MIT, and the exporter only speaks OTLP to
> Phoenix. Nothing about your coldpress-os usage becomes ELv2; the
> licence scope is Phoenix's own binaries.

Phoenix's angle is LLM-evaluation-focused: strong support for comparing
runs, aggregating metrics across traces, and drift detection. If your
team already uses Arize for model monitoring, Phoenix is the natural
choice.

```sh
# Run Phoenix locally (Docker)
docker run -p 6006:6006 -p 4317:4317 arizephoenix/phoenix:latest
# OTLP gRPC on 4317, OTLP HTTP on 6006/v1/traces, UI on 6006

export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:6006
coldpress-otel-export --latest
```

---

## Any other OTLP/HTTP backend

Jaeger, Tempo, Honeycomb, Datadog, New Relic, Uptrace, Signoz — anything
with an OTLP/HTTP ingest endpoint works. Set the endpoint, add any
required auth headers, run the exporter:

```sh
export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=<your-api-key>"
coldpress-otel-export --latest
```

The exporter uses plain OTel JS SDK conventions; no coldpress-os-specific
vendor quirks.

---

## Explicit skips (documented for future searches)

| Tool | Why not in v1 |
|------|---------------|
| **Helicone** | Proxy model — sits between your app and an LLM provider. Wrong fit for a dev-time lifecycle orchestrator. |
| **W&B Weave** | Tied to Weights & Biases cloud. Heavyweight auth + data flow. |
| **MLflow LLM** | ML-experiment framing; lifecycle → trace shape mismatch. |
| **TruLens** | RAG-evaluation focus; too narrow. |

Skipping is not rejection — if your team already runs one of these and
wants coldpress-os runs in it, the OTLP endpoint is a one-line change.
The list above is what's NOT in the *recommended path*.

---

## Integration with the phase-gate protocol

Phase 9's gate (`lifecycle/9-deployment/gate.json`) can consume exporter
emission as a health signal: once `@coldpress/otel-exporter` is running
in your CI, a missing trace in Langfuse becomes a visible gate-failure
input. Wiring this as an automated acceptance check is a follow-up
block — today the exporter is a read-side sidecar only.

---

## See also

- [`packages/otel-exporter/README.md`](../packages/otel-exporter/README.md) — CLI + API reference
- [`docs/event-stream.md`](event-stream.md) — EventStream JSONL protocol (§6.4)
- [`docs/phase-gate-protocol.md`](phase-gate-protocol.md) — how gate-pass/fail propagates
- [OpenLLMetry spec](https://github.com/traceloop/openllmetry-js) — the attribute conventions the exporter emits
- [OpenTelemetry JS SDK](https://github.com/open-telemetry/opentelemetry-js) — underlying SDK

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 11 Shape A subagents (analyst · architect · pm · ux-designer · scrum-master · developer · qa · devops · reviewer · communicator · valet) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

