# @coldpress/otel-exporter

Optional observability sidecar for [coldpress-os](https://github.com/coldpress-labs/coldpress-os).
Re-emits the framework's EventStream JSONL as OpenLLMetry-conformant
OpenTelemetry spans — point it at Langfuse, Arize Phoenix, Jaeger,
Tempo, Honeycomb, or any OTLP/HTTP-compatible backend.

**Why a separate package?** `@coldpress/core` stays dep-light and
offline-capable. The EventStream JSONL on disk (`.coldpress/runs/<run-id>/events.jsonl`)
is the source of truth; OTel emission is indirection. Install this
package only when you want an observability backend in the loop.

## Install

```sh
npm install -g @coldpress/otel-exporter
```

Requires Node ≥ 20. Peer requirement: a coldpress-os project that has
produced at least one run at `.coldpress/runs/<run-id>/events.jsonl`.

## CLI

```sh
# Export the most recent run to http://localhost:4318 (Langfuse self-host default)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
coldpress-otel-export --latest

# Export every run on disk
coldpress-otel-export --all

# Just list the runs
coldpress-otel-export --list

# Dry run — map to spans, print counts, don't emit
coldpress-otel-export --run run-20260424-120000-abcdef --dry-run
```

### Options

| Flag | Purpose |
|------|---------|
| `--run <id>` | Export a specific run |
| `--latest` | Export the most recent run |
| `--all` | Export every run on disk |
| `--list` | Print run ids and exit |
| `--project-dir <path>` | Override the project root (default: CWD) |
| `--endpoint <url>` | OTLP endpoint (overrides `OTEL_EXPORTER_OTLP_ENDPOINT`) |
| `--header <k=v>` | OTLP request header (repeatable) |
| `--service-name <name>` | `service.name` attribute (overrides `OTEL_SERVICE_NAME`) |
| `--service-version <v>` | `service.version` attribute |
| `--project-slug <slug>` | `coldpress.project_slug` resource attribute |
| `--dry-run` | Build spans without sending |
| `--quiet` | Suppress progress output |

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | OK (including "no runs on disk") |
| 1 | Runtime failure (malformed stream / OTLP transport failure) |
| 2 | Specified run not found, or none of `--run/--latest/--all/--list` given |

### Standard OTel env vars (honoured)

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`
- `OTEL_EXPORTER_OTLP_TRACES_HEADERS`
- `OTEL_SERVICE_NAME`

## Mapping

| coldpress-os concept | OpenTelemetry |
|----------------------|---------------|
| `run_id` | Trace (deterministic 16-byte id derived via SHA-256) |
| `wave-start` + `wave-end` | Workflow span (`traceloop.span.kind = "workflow"`) |
| `skill-invoke` + `skill-result` | Task span (`traceloop.span.kind = "task"`) |
| `gate-evaluate` + `gate-pass` | Task span, status = OK |
| `gate-evaluate` + `gate-fail` | Task span, status = ERROR, `coldpress.gate.blockers_json` populated |
| `condensation` | Span event on the wave span |
| non-zero `exit_code` | Span status = ERROR with `exit_code=N` message |
| orphan action (no observation) | Span status = UNSET with "without matching …" message |

### Attribute conventions

Every span carries:

- `traceloop.workflow.name` = run id
- `traceloop.entity.name` = wave id / skill id / gate id
- `traceloop.span.kind` = `"workflow"` \| `"task"`
- `coldpress.run_id`, `coldpress.seq`, `coldpress.phase`
- Type-specific `coldpress.*` attributes (see [`src/conventions.ts`](src/conventions.ts))

Resource attributes:

- `service.name` (default: `coldpress-os`)
- `service.version` (optional)
- `coldpress.project_slug` (optional)

Full list: [`src/conventions.ts`](src/conventions.ts).

## Determinism + idempotency

Trace id = SHA-256(`run_id`) truncated to 16 bytes.
Span id  = SHA-256(`run_id:seq`) truncated to 8 bytes.

Running the exporter twice on the same run produces identical ids.
OTel backends that dedupe on span ids (Jaeger, Tempo, Langfuse) will
ignore re-emissions cleanly.

## Programmatic API

```ts
import { mapRunToSpans, createOtlpExporter, exportSpans, readRun } from "@coldpress/otel-exporter";

const events = await readRun("run-20260424-120000-abcdef");
const { spans } = mapRunToSpans(events, { serviceName: "my-project" });
const exporter = createOtlpExporter({ endpoint: "http://localhost:4318" });
await exportSpans(exporter, spans);
await exporter.shutdown?.();
```

## Backends

See [`coldpress-os/docs/observability-setup.md`](../../docs/observability-setup.md)
for Langfuse (MIT, recommended) self-host and the Arize Phoenix
(Elastic License 2.0 — flagged) alternative.

## License

MIT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).
