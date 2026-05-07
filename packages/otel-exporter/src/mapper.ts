/**
 * EventStream → OTel span mapper.
 *
 * Pure function. Takes a seq-ordered `Event[]` for a single run, returns
 * `ReadableSpan[]` ready to hand to an OTLP exporter.
 *
 * Mapping (plan §6.8):
 *   run                            → trace     (deterministic traceId from run_id)
 *   wave-start / wave-end          → WORKFLOW  span (one per wave_id)
 *   skill-invoke / skill-result    → TASK      span (parent = wave)
 *   gate-evaluate / gate-pass|fail → TASK      span (parent = wave); status = OK|ERROR
 *   condensation                   → span EVENT on its wave span
 *
 * Action/Observation pairing uses `cause_seq` when present, falls back
 * to `skill_id`/`gate_id` within the same wave. Orphan actions (no
 * matching observation) are still emitted as OTel error spans so
 * incomplete runs remain inspectable — coldpress-os cares about
 * unfinished work, not just happy paths.
 */

import { SpanKind, SpanStatusCode, type HrTime } from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";
import type { ReadableSpan, TimedEvent } from "@opentelemetry/sdk-trace-base";
import {
  COLDPRESS,
  DEFAULT_SERVICE_NAME,
  INSTRUMENTATION_SCOPE,
  OPENLLMETRY,
  RESOURCE,
  SPAN_KIND,
} from "./conventions.js";
import type {
  Event,
  GateEvaluateAction,
  GateFailObservation,
  GatePassObservation,
  SkillInvokeAction,
  SkillResultObservation,
  WaveEndAction,
  WaveStartAction,
} from "./event-schema.js";
import { deriveSpanId, deriveTraceId } from "./ids.js";

export interface MapOptions {
  /**
   * Overrides `service.name`. Falls back to `OTEL_SERVICE_NAME` env var
   * when the caller passes `undefined`, then to `coldpress-os`.
   */
  serviceName?: string;
  /** Optional service version stamped on the resource. */
  serviceVersion?: string;
  /** Optional project slug from `coldpress.yaml` — stamped on resource. */
  projectSlug?: string;
  /**
   * Extra resource attributes (service.instance.id, deployment.environment,
   * etc.). Callers can layer these on; mapper stays schema-free.
   */
  extraResourceAttributes?: Record<string, string>;
}

interface BuiltSpan {
  kindLabel: "wave" | "skill" | "gate";
  name: string;
  spanId: string;
  parentSpanId?: string;
  startHr: HrTime;
  endHr: HrTime;
  startUnixNanos: bigint;
  endUnixNanos: bigint;
  attributes: Record<string, string | number | boolean>;
  events: TimedEvent[];
  statusCode: SpanStatusCode;
  statusMessage?: string;
}

export function hrTimeFromISO(iso: string): HrTime {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) {
    throw new Error(`Invalid ISO timestamp: ${iso}`);
  }
  const sec = Math.floor(ms / 1000);
  const nanos = (ms - sec * 1000) * 1_000_000;
  return [sec, nanos];
}

function hrToUnixNanos(hr: HrTime): bigint {
  return BigInt(hr[0]) * 1_000_000_000n + BigInt(hr[1]);
}

/**
 * Build a ReadableSpan from the compact built-span shape. OTel's
 * interface requires several bookkeeping fields; we satisfy it with
 * constant/zero values where the concept doesn't map.
 */
function toReadableSpan(
  built: BuiltSpan,
  traceId: string,
  resource: Resource,
): ReadableSpan {
  const attributes = { ...built.attributes };
  const duration: HrTime = [
    built.endHr[0] - built.startHr[0],
    built.endHr[1] - built.startHr[1],
  ];
  if (duration[1] < 0) {
    duration[0] -= 1;
    duration[1] += 1_000_000_000;
  }
  const spanId = built.spanId;
  const parentSpanId = built.parentSpanId;
  const startTime = built.startHr;
  const endTime = built.endHr;
  const events = built.events;
  const status = built.statusMessage
    ? { code: built.statusCode, message: built.statusMessage }
    : { code: built.statusCode };

  return {
    name: built.name,
    kind: SpanKind.INTERNAL,
    spanContext: () => ({
      traceId,
      spanId,
      traceFlags: 1,
      isRemote: false,
    }),
    parentSpanId,
    startTime,
    endTime,
    status,
    attributes,
    links: [],
    events,
    duration,
    ended: true,
    resource,
    instrumentationLibrary: {
      name: INSTRUMENTATION_SCOPE.name,
      version: INSTRUMENTATION_SCOPE.version,
    },
    droppedAttributesCount: 0,
    droppedEventsCount: 0,
    droppedLinksCount: 0,
  } as ReadableSpan;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

interface Accumulator {
  runId: string;
  waves: Map<string, WaveBuilder>;
  skills: Map<string, SkillBuilder>;
  gates: Map<string, GateBuilder>;
  /** Fallback lookup when `cause_seq` is absent on an observation. */
  openSkillBySkillId: Map<string, string>;
  openGateByGateId: Map<string, string>;
  lastTimestamp: string | null;
}

interface WaveBuilder {
  waveId: string;
  phase: number;
  spanId: string;
  start: WaveStartAction;
  end?: WaveEndAction;
  events: TimedEvent[];
}

interface SkillBuilder {
  key: string;
  skillId: string;
  seq: number;
  spanId: string;
  waveSpanId: string | undefined;
  invoke: SkillInvokeAction;
  result?: SkillResultObservation;
}

interface GateBuilder {
  key: string;
  gateId: string;
  seq: number;
  spanId: string;
  waveSpanId: string | undefined;
  evaluate: GateEvaluateAction;
  observation?: GatePassObservation | GateFailObservation;
}

function skillKeyBySeq(seq: number): string {
  return `skill-seq-${seq}`;
}
function gateKeyBySeq(seq: number): string {
  return `gate-seq-${seq}`;
}

function currentWaveSpanId(acc: Accumulator): string | undefined {
  let latest: { seq: number; spanId: string } | null = null;
  for (const w of acc.waves.values()) {
    if (!w.end && (!latest || w.start.seq > latest.seq)) {
      latest = { seq: w.start.seq, spanId: w.spanId };
    }
  }
  return latest?.spanId;
}

/**
 * Fold the Event[] into the accumulator. One pass; seq-ordered.
 */
function accumulate(acc: Accumulator, event: Event): void {
  acc.lastTimestamp = event.timestamp;
  switch (event.kind) {
    case "wave-start": {
      const spanId = deriveSpanId(acc.runId, event.seq);
      acc.waves.set(event.wave_id, {
        waveId: event.wave_id,
        phase: event.phase,
        spanId,
        start: event,
        events: [],
      });
      return;
    }
    case "wave-end": {
      const w = acc.waves.get(event.wave_id);
      if (w) w.end = event;
      return;
    }
    case "skill-invoke": {
      const spanId = deriveSpanId(acc.runId, event.seq);
      const key = skillKeyBySeq(event.seq);
      const waveSpanId = currentWaveSpanId(acc);
      acc.skills.set(key, {
        key,
        skillId: event.skill_id,
        seq: event.seq,
        spanId,
        waveSpanId,
        invoke: event,
      });
      acc.openSkillBySkillId.set(event.skill_id, key);
      return;
    }
    case "skill-result": {
      const key =
        event.cause_seq !== undefined
          ? skillKeyBySeq(event.cause_seq)
          : acc.openSkillBySkillId.get(event.skill_id);
      if (!key) return;
      const s = acc.skills.get(key);
      if (!s) return;
      s.result = event;
      acc.openSkillBySkillId.delete(s.skillId);
      return;
    }
    case "gate-evaluate": {
      const spanId = deriveSpanId(acc.runId, event.seq);
      const key = gateKeyBySeq(event.seq);
      const waveSpanId = currentWaveSpanId(acc);
      acc.gates.set(key, {
        key,
        gateId: event.gate_id,
        seq: event.seq,
        spanId,
        waveSpanId,
        evaluate: event,
      });
      acc.openGateByGateId.set(event.gate_id, key);
      return;
    }
    case "gate-pass":
    case "gate-fail": {
      const key =
        event.cause_seq !== undefined
          ? gateKeyBySeq(event.cause_seq)
          : acc.openGateByGateId.get(event.gate_id);
      if (!key) return;
      const g = acc.gates.get(key);
      if (!g) return;
      g.observation = event;
      acc.openGateByGateId.delete(g.gateId);
      return;
    }
    case "condensation": {
      const w = acc.waves.get(event.wave_id);
      if (!w) return;
      w.events.push({
        name: "coldpress.condensation",
        time: hrTimeFromISO(event.timestamp),
        attributes: {
          [COLDPRESS.CONDENSATION_SUMMARY]: event.summary,
          [COLDPRESS.CONDENSATION_FROM_SEQ]: event.from_seq,
          [COLDPRESS.CONDENSATION_TO_SEQ]: event.to_seq,
          [COLDPRESS.SEQ]: event.seq,
        },
      });
      return;
    }
  }
}

function buildWaveSpans(acc: Accumulator, runId: string): BuiltSpan[] {
  const spans: BuiltSpan[] = [];
  for (const w of acc.waves.values()) {
    const start = hrTimeFromISO(w.start.timestamp);
    // Use last observed event's timestamp as fallback end when wave-end absent.
    const end = w.end
      ? hrTimeFromISO(w.end.timestamp)
      : hrTimeFromISO(acc.lastTimestamp ?? w.start.timestamp);
    const status: SpanStatusCode = w.end
      ? w.end.status === "success"
        ? SpanStatusCode.OK
        : SpanStatusCode.ERROR
      : SpanStatusCode.UNSET;
    const statusMessage = w.end ? w.end.status : "no-wave-end";
    const attributes: Record<string, string | number | boolean> = {
      [OPENLLMETRY.SPAN_KIND]: SPAN_KIND.WORKFLOW,
      [OPENLLMETRY.WORKFLOW_NAME]: runId,
      [OPENLLMETRY.ENTITY_NAME]: w.waveId,
      [COLDPRESS.RUN_ID]: runId,
      [COLDPRESS.WAVE_ID]: w.waveId,
      [COLDPRESS.PHASE]: w.phase,
      [COLDPRESS.SEQ]: w.start.seq,
    };
    if (w.start.label !== undefined) {
      attributes[COLDPRESS.WAVE_LABEL] = w.start.label;
    }
    if (w.end?.status !== undefined) {
      attributes[COLDPRESS.WAVE_STATUS] = w.end.status;
    }
    spans.push({
      kindLabel: "wave",
      name: `wave ${w.waveId}`,
      spanId: w.spanId,
      startHr: start,
      endHr: end,
      startUnixNanos: hrToUnixNanos(start),
      endUnixNanos: hrToUnixNanos(end),
      attributes,
      events: w.events,
      statusCode: status,
      statusMessage,
    });
  }
  return spans;
}

function buildSkillSpans(acc: Accumulator, runId: string): BuiltSpan[] {
  const spans: BuiltSpan[] = [];
  for (const s of acc.skills.values()) {
    const start = hrTimeFromISO(s.invoke.timestamp);
    const end = s.result
      ? hrTimeFromISO(s.result.timestamp)
      : hrTimeFromISO(acc.lastTimestamp ?? s.invoke.timestamp);
    const exitOK = s.result ? s.result.exit_code === 0 : false;
    const status: SpanStatusCode = s.result
      ? exitOK
        ? SpanStatusCode.OK
        : SpanStatusCode.ERROR
      : SpanStatusCode.UNSET;
    const statusMessage = s.result
      ? exitOK
        ? undefined
        : s.result.message ?? `exit_code=${s.result.exit_code}`
      : "skill-invoke without matching skill-result";
    const attributes: Record<string, string | number | boolean> = {
      [OPENLLMETRY.SPAN_KIND]: SPAN_KIND.TASK,
      [OPENLLMETRY.WORKFLOW_NAME]: runId,
      [OPENLLMETRY.ENTITY_NAME]: s.skillId,
      [COLDPRESS.RUN_ID]: runId,
      [COLDPRESS.SKILL_ID]: s.skillId,
      [COLDPRESS.SEQ]: s.invoke.seq,
    };
    if (s.invoke.caller !== undefined) {
      attributes[COLDPRESS.SKILL_CALLER] = s.invoke.caller;
    }
    if (s.invoke.args !== undefined) {
      attributes[COLDPRESS.SKILL_ARGS_JSON] = safeStringify(s.invoke.args);
    }
    if (s.result) {
      attributes[COLDPRESS.SKILL_EXIT_CODE] = s.result.exit_code;
      if (s.result.artifact_path !== undefined) {
        attributes[COLDPRESS.SKILL_ARTIFACT_PATH] = s.result.artifact_path;
      }
      if (s.result.message !== undefined) {
        attributes[OPENLLMETRY.ENTITY_OUTPUT] = s.result.message;
      }
      if (s.result.cause_seq !== undefined) {
        attributes[COLDPRESS.CAUSE_SEQ] = s.result.cause_seq;
      }
    }
    spans.push({
      kindLabel: "skill",
      name: `skill ${s.skillId}`,
      spanId: s.spanId,
      parentSpanId: s.waveSpanId,
      startHr: start,
      endHr: end,
      startUnixNanos: hrToUnixNanos(start),
      endUnixNanos: hrToUnixNanos(end),
      attributes,
      events: [],
      statusCode: status,
      statusMessage,
    });
  }
  return spans;
}

function buildGateSpans(acc: Accumulator, runId: string): BuiltSpan[] {
  const spans: BuiltSpan[] = [];
  for (const g of acc.gates.values()) {
    const start = hrTimeFromISO(g.evaluate.timestamp);
    const end = g.observation
      ? hrTimeFromISO(g.observation.timestamp)
      : hrTimeFromISO(acc.lastTimestamp ?? g.evaluate.timestamp);
    let status: SpanStatusCode = SpanStatusCode.UNSET;
    let statusMessage: string | undefined;
    if (g.observation) {
      if (g.observation.kind === "gate-pass") {
        status = SpanStatusCode.OK;
      } else {
        status = SpanStatusCode.ERROR;
        statusMessage = g.observation.blockers.join("; ") || "gate failed";
      }
    } else {
      statusMessage = "gate-evaluate without matching gate-pass|gate-fail";
    }
    const attributes: Record<string, string | number | boolean> = {
      [OPENLLMETRY.SPAN_KIND]: SPAN_KIND.TASK,
      [OPENLLMETRY.WORKFLOW_NAME]: runId,
      [OPENLLMETRY.ENTITY_NAME]: g.gateId,
      [COLDPRESS.RUN_ID]: runId,
      [COLDPRESS.GATE_ID]: g.gateId,
      [COLDPRESS.PHASE]: g.evaluate.phase,
      [COLDPRESS.SEQ]: g.evaluate.seq,
    };
    if (g.observation?.kind === "gate-fail") {
      attributes[COLDPRESS.GATE_BLOCKERS_JSON] = safeStringify(
        g.observation.blockers,
      );
    }
    if (g.observation?.cause_seq !== undefined) {
      attributes[COLDPRESS.CAUSE_SEQ] = g.observation.cause_seq;
    }
    spans.push({
      kindLabel: "gate",
      name: `gate ${g.gateId}`,
      spanId: g.spanId,
      parentSpanId: g.waveSpanId,
      startHr: start,
      endHr: end,
      startUnixNanos: hrToUnixNanos(start),
      endUnixNanos: hrToUnixNanos(end),
      attributes,
      events: [],
      statusCode: status,
      statusMessage,
    });
  }
  return spans;
}

export interface MapResult {
  traceId: string;
  resource: Resource;
  spans: ReadableSpan[];
}

/**
 * Primary mapping entrypoint. Assumes events share one `run_id`; if they
 * don't, throws — cross-run emission is a caller-level concern (the CLI
 * emits one run at a time).
 */
export function mapRunToSpans(events: Event[], options: MapOptions = {}): MapResult {
  if (events.length === 0) {
    throw new Error("mapRunToSpans requires at least one event");
  }
  const runId = events[0]!.run_id;
  for (const e of events) {
    if (e.run_id !== runId) {
      throw new Error(
        `mapRunToSpans received events from multiple runs (${runId} vs ${e.run_id})`,
      );
    }
  }
  const traceId = deriveTraceId(runId);

  const resourceAttrs: Record<string, string> = {
    [RESOURCE.SERVICE_NAME]:
      options.serviceName ?? process.env["OTEL_SERVICE_NAME"] ?? DEFAULT_SERVICE_NAME,
  };
  if (options.serviceVersion) {
    resourceAttrs[RESOURCE.SERVICE_VERSION] = options.serviceVersion;
  }
  if (options.projectSlug) {
    resourceAttrs[RESOURCE.COLDPRESS_PROJECT_SLUG] = options.projectSlug;
  }
  if (options.extraResourceAttributes) {
    for (const [k, v] of Object.entries(options.extraResourceAttributes)) {
      resourceAttrs[k] = v;
    }
  }
  const resource = new Resource(resourceAttrs);

  const acc: Accumulator = {
    runId,
    waves: new Map(),
    skills: new Map(),
    gates: new Map(),
    openSkillBySkillId: new Map(),
    openGateByGateId: new Map(),
    lastTimestamp: null,
  };
  for (const event of events) accumulate(acc, event);

  const built: BuiltSpan[] = [
    ...buildWaveSpans(acc, runId),
    ...buildSkillSpans(acc, runId),
    ...buildGateSpans(acc, runId),
  ];

  // Stable emission order: by start time, tiebreak by seq via the
  // `coldpress.seq` attribute. Deterministic ordering helps backend
  // diffing and snapshot tests.
  built.sort((a, b) => {
    if (a.startUnixNanos !== b.startUnixNanos) {
      return a.startUnixNanos < b.startUnixNanos ? -1 : 1;
    }
    const sa = Number(a.attributes[COLDPRESS.SEQ] ?? 0);
    const sb = Number(b.attributes[COLDPRESS.SEQ] ?? 0);
    return sa - sb;
  });

  const spans = built.map((b) => toReadableSpan(b, traceId, resource));
  return { traceId, resource, spans };
}
