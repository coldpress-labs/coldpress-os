# Third-Party Attributions — @coldpress/otel-exporter

This package is MIT-licensed. It depends on OpenTelemetry JavaScript
packages (Apache License 2.0) at runtime and encodes the OpenLLMetry
semantic conventions (also Apache License 2.0) via attribute-name
constants.

## 1. OpenTelemetry JavaScript

| Field | Value |
|-------|-------|
| Upstream project | OpenTelemetry JavaScript |
| Upstream source | https://github.com/open-telemetry/opentelemetry-js |
| Upstream author | The OpenTelemetry Authors |
| Upstream license | Apache License 2.0 |
| Incorporated via | npm runtime deps (see `package.json`) |
| First incorporated | 2026-04 |

### Packages consumed

- `@opentelemetry/api` — span and tracer interfaces
- `@opentelemetry/sdk-trace-base` — `ReadableSpan` shape + `SpanExporter` interface
- `@opentelemetry/exporter-trace-otlp-http` — OTLP/HTTP transport
- `@opentelemetry/resources` — Resource abstraction
- `@opentelemetry/semantic-conventions` — standard attribute names

### Nature of the derivation

This package is a **consumer**, not a derivative. No OpenTelemetry
source is vendored or modified. Attribution here satisfies Apache-2.0's
NOTICE-preservation clause for downstream distribution.

### Acknowledgment

ColdPress Labs is grateful to the OpenTelemetry community for
maintaining a vendor-neutral observability spec and providing robust
JavaScript implementations under a permissive license.

---

## 2. OpenLLMetry (semantic conventions only)

| Field | Value |
|-------|-------|
| Upstream project | OpenLLMetry (maintained by Traceloop) |
| Upstream source | https://github.com/traceloop/openllmetry-js |
| Upstream author | Traceloop and contributors |
| Upstream license | Apache License 2.0 |
| Incorporated via | Attribute-name string constants (no code imported) |
| First incorporated | 2026-04 |

### Nature of the derivation

This package adopts OpenLLMetry's **attribute-name conventions** — the
strings `traceloop.workflow.name`, `traceloop.entity.name`,
`traceloop.span.kind`, etc. — codified as constants in
[`src/conventions.ts`](src/conventions.ts). No OpenLLMetry source
code, types, or runtime is imported; only the public naming spec is
referenced. Attribution is included per good-neighbour convention and
to preserve ecosystem interoperability (Langfuse, Arize Phoenix, and
other backends recognise these attribute names out of the box).

### Acknowledgment

ColdPress Labs is grateful to Traceloop and the OpenLLMetry
contributors for establishing a vendor-neutral LLM-tracing attribute
spec that backends across the observability ecosystem have adopted.

---

## License compatibility

| Package | License | Compatible with MIT? |
|---------|---------|----------------------|
| `@coldpress/otel-exporter` | MIT | — |
| OpenTelemetry JS | Apache-2.0 | Yes (permissive, one-way compatible) |
| OpenLLMetry | Apache-2.0 | Yes (attribute conventions only, no code) |

Downstream consumers using this package inherit Apache-2.0 obligations
for the OpenTelemetry runtime (NOTICE preservation, patent-grant
survival). This file + transitively-included OpenTelemetry NOTICEs
from npm satisfy both.
