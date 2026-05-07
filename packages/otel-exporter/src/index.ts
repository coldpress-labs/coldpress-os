/**
 * @coldpress/otel-exporter — public surface.
 *
 * Two primary entrypoints:
 *
 *   mapRunToSpans(events)   — pure function, JSONL-events → ReadableSpan[]
 *   createOtlpExporter()    — thin OTLP transport wrapper
 *
 * The CLI (`coldpress-otel-export`) composes these two; library
 * consumers can skip the CLI and call mapRunToSpans directly (e.g., an
 * in-process orchestrator that wants both JSONL persistence AND live
 * OTel emission without shelling out).
 */

export { mapRunToSpans, type MapOptions, type MapResult } from "./mapper.js";
export {
  createOtlpExporter,
  exportSpans,
  type CreateOtlpExporterOptions,
} from "./exporter.js";
export {
  readRun,
  listRuns,
  EventStreamNotFoundError,
  EventStreamParseError,
  type ReadOptions,
} from "./reader.js";
export {
  EventSchema,
  type Event,
  type WaveStartAction,
  type WaveEndAction,
  type SkillInvokeAction,
  type SkillResultObservation,
  type GateEvaluateAction,
  type GatePassObservation,
  type GateFailObservation,
  type Condensation,
} from "./event-schema.js";
export { deriveTraceId, deriveSpanId } from "./ids.js";
export * as conventions from "./conventions.js";
