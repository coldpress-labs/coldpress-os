import { describe, expect, it } from "vitest";
import { SpanStatusCode } from "@opentelemetry/api";
import { mapRunToSpans } from "../src/mapper.js";
import { deriveSpanId, deriveTraceId } from "../src/ids.js";
import type { Event } from "../src/event-schema.js";
import { COLDPRESS, OPENLLMETRY, SPAN_KIND, RESOURCE } from "../src/conventions.js";

const RUN_ID = "run-20260424-120000-abcdef";
const AT = (s: number) =>
  new Date(Date.UTC(2026, 3, 24, 12, 0, s)).toISOString();

function ev<T extends Event["kind"]>(
  seq: number,
  kind: T,
  extra: Omit<Extract<Event, { kind: T }>, "kind" | "seq" | "schema_version" | "run_id" | "timestamp">,
): Event {
  const base = {
    schema_version: 1 as const,
    seq,
    run_id: RUN_ID,
    timestamp: AT(seq),
    kind,
    ...extra,
  };
  // TS can't narrow the discriminated-union intersection through the
  // generic, but the shape is correct by construction — cast through
  // `unknown` at the factory boundary, keep call sites typed.
  return base as unknown as Event;
}

describe("mapRunToSpans — core mapping", () => {
  it("emits one wave + one skill + one gate for a minimal run", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 4 }),
      ev(1, "skill-invoke", { skill_id: "create-prd", caller: "pm" }),
      ev(2, "skill-result", {
        skill_id: "create-prd",
        cause_seq: 1,
        exit_code: 0,
        artifact_path: "_context/sacred/prd.md",
      }),
      ev(3, "gate-evaluate", { gate_id: "phase-4-exit", phase: 4 }),
      ev(4, "gate-pass", { gate_id: "phase-4-exit", phase: 4, cause_seq: 3 }),
      ev(5, "wave-end", { wave_id: "w1", phase: 4, status: "success" }),
    ];
    const { traceId, spans } = mapRunToSpans(events);
    expect(traceId).toBe(deriveTraceId(RUN_ID));
    expect(spans).toHaveLength(3);

    const wave = spans.find((s) => s.name.startsWith("wave "));
    const skill = spans.find((s) => s.name.startsWith("skill "));
    const gate = spans.find((s) => s.name.startsWith("gate "));
    expect(wave && skill && gate).toBeTruthy();

    // Trace id shared; wave has no parent; skill + gate parent to wave.
    for (const s of spans) expect(s.spanContext().traceId).toBe(traceId);
    expect(wave!.parentSpanId).toBeUndefined();
    expect(skill!.parentSpanId).toBe(wave!.spanContext().spanId);
    expect(gate!.parentSpanId).toBe(wave!.spanContext().spanId);

    // Statuses.
    expect(wave!.status.code).toBe(SpanStatusCode.OK);
    expect(skill!.status.code).toBe(SpanStatusCode.OK);
    expect(gate!.status.code).toBe(SpanStatusCode.OK);

    // OpenLLMetry span-kind + entity names land on attributes.
    expect(wave!.attributes[OPENLLMETRY.SPAN_KIND]).toBe(SPAN_KIND.WORKFLOW);
    expect(skill!.attributes[OPENLLMETRY.SPAN_KIND]).toBe(SPAN_KIND.TASK);
    expect(gate!.attributes[OPENLLMETRY.SPAN_KIND]).toBe(SPAN_KIND.TASK);
    expect(wave!.attributes[OPENLLMETRY.ENTITY_NAME]).toBe("w1");
    expect(skill!.attributes[OPENLLMETRY.ENTITY_NAME]).toBe("create-prd");
    expect(gate!.attributes[OPENLLMETRY.ENTITY_NAME]).toBe("phase-4-exit");

    // coldpress namespace attributes.
    expect(skill!.attributes[COLDPRESS.SKILL_ARTIFACT_PATH]).toBe(
      "_context/sacred/prd.md",
    );
    expect(skill!.attributes[COLDPRESS.SKILL_EXIT_CODE]).toBe(0);
    expect(wave!.attributes[COLDPRESS.PHASE]).toBe(4);

    // Deterministic span ids match the ids.ts derivation.
    expect(wave!.spanContext().spanId).toBe(deriveSpanId(RUN_ID, 0));
    expect(skill!.spanContext().spanId).toBe(deriveSpanId(RUN_ID, 1));
    expect(gate!.spanContext().spanId).toBe(deriveSpanId(RUN_ID, 3));
  });

  it("marks gate-fail spans with ERROR status + blocker message", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 7 }),
      ev(1, "gate-evaluate", { gate_id: "phase-7-exit", phase: 7 }),
      ev(2, "gate-fail", {
        gate_id: "phase-7-exit",
        phase: 7,
        cause_seq: 1,
        blockers: ["missing security scan", "unresolved NEED_INFO"],
      }),
      ev(3, "wave-end", { wave_id: "w1", phase: 7, status: "failure" }),
    ];
    const { spans } = mapRunToSpans(events);
    const gate = spans.find((s) => s.name.startsWith("gate "))!;
    expect(gate.status.code).toBe(SpanStatusCode.ERROR);
    expect(gate.status.message).toContain("missing security scan");
    expect(gate.attributes[COLDPRESS.GATE_BLOCKERS_JSON]).toContain("missing security scan");

    const wave = spans.find((s) => s.name.startsWith("wave "))!;
    expect(wave.status.code).toBe(SpanStatusCode.ERROR);
    expect(wave.attributes[COLDPRESS.WAVE_STATUS]).toBe("failure");
  });

  it("marks non-zero exit_code skill spans as ERROR with message fallback", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 6 }),
      ev(1, "skill-invoke", { skill_id: "dev-impl", caller: "developer" }),
      ev(2, "skill-result", {
        skill_id: "dev-impl",
        cause_seq: 1,
        exit_code: 2,
      }),
      ev(3, "wave-end", { wave_id: "w1", phase: 6, status: "failure" }),
    ];
    const { spans } = mapRunToSpans(events);
    const skill = spans.find((s) => s.name.startsWith("skill "))!;
    expect(skill.status.code).toBe(SpanStatusCode.ERROR);
    expect(skill.status.message).toContain("exit_code=2");
  });

  it("attaches condensation as a span event on its wave", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 4 }),
      ev(1, "condensation", {
        wave_id: "w1",
        summary: "wave 1 condensed",
        from_seq: 0,
        to_seq: 1,
      }),
      ev(2, "wave-end", { wave_id: "w1", phase: 4, status: "success" }),
    ];
    const { spans } = mapRunToSpans(events);
    const wave = spans.find((s) => s.name.startsWith("wave "))!;
    expect(wave.events).toHaveLength(1);
    expect(wave.events[0]!.name).toBe("coldpress.condensation");
    expect(wave.events[0]!.attributes?.[COLDPRESS.CONDENSATION_SUMMARY]).toBe(
      "wave 1 condensed",
    );
  });

  it("emits orphan skill spans with UNSET status when no result arrives", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 4 }),
      ev(1, "skill-invoke", { skill_id: "create-prd" }),
      // run interrupted — no skill-result, no wave-end
    ];
    const { spans } = mapRunToSpans(events);
    const skill = spans.find((s) => s.name.startsWith("skill "))!;
    expect(skill.status.code).toBe(SpanStatusCode.UNSET);
    expect(skill.status.message).toContain("without matching skill-result");
    const wave = spans.find((s) => s.name.startsWith("wave "))!;
    expect(wave.status.code).toBe(SpanStatusCode.UNSET);
  });

  it("pairs observations by skill_id when cause_seq is absent", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 4 }),
      ev(1, "skill-invoke", { skill_id: "create-prd" }),
      ev(2, "skill-result", { skill_id: "create-prd", exit_code: 0 }),
      ev(3, "wave-end", { wave_id: "w1", phase: 4, status: "success" }),
    ];
    const { spans } = mapRunToSpans(events);
    const skill = spans.find((s) => s.name.startsWith("skill "))!;
    expect(skill.status.code).toBe(SpanStatusCode.OK);
  });

  it("refuses events from multiple runs", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 4 }),
      {
        ...ev(1, "wave-end", { wave_id: "w1", phase: 4, status: "success" }),
        run_id: "run-different-id",
      },
    ];
    expect(() => mapRunToSpans(events)).toThrow(/multiple runs/);
  });

  it("stamps service.name from options", () => {
    const events: Event[] = [ev(0, "wave-start", { wave_id: "w", phase: 1 })];
    const { resource } = mapRunToSpans(events, {
      serviceName: "my-project",
      serviceVersion: "1.2.3",
      projectSlug: "my-proj",
    });
    expect(resource.attributes[RESOURCE.SERVICE_NAME]).toBe("my-project");
    expect(resource.attributes[RESOURCE.SERVICE_VERSION]).toBe("1.2.3");
    expect(resource.attributes[RESOURCE.COLDPRESS_PROJECT_SLUG]).toBe("my-proj");
  });

  it("defaults service.name to OTEL_SERVICE_NAME when options omit it", () => {
    const events: Event[] = [ev(0, "wave-start", { wave_id: "w", phase: 1 })];
    const prev = process.env["OTEL_SERVICE_NAME"];
    process.env["OTEL_SERVICE_NAME"] = "env-service";
    try {
      const { resource } = mapRunToSpans(events);
      expect(resource.attributes[RESOURCE.SERVICE_NAME]).toBe("env-service");
    } finally {
      if (prev === undefined) delete process.env["OTEL_SERVICE_NAME"];
      else process.env["OTEL_SERVICE_NAME"] = prev;
    }
  });

  it("emits spans in stable start-time order", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 4 }),
      ev(1, "skill-invoke", { skill_id: "s1" }),
      ev(2, "skill-result", { skill_id: "s1", cause_seq: 1, exit_code: 0 }),
      ev(3, "skill-invoke", { skill_id: "s2" }),
      ev(4, "skill-result", { skill_id: "s2", cause_seq: 3, exit_code: 0 }),
      ev(5, "wave-end", { wave_id: "w1", phase: 4, status: "success" }),
    ];
    const { spans } = mapRunToSpans(events);
    // Wave starts at seq 0, skill1 at seq 1, skill2 at seq 3.
    expect(spans.map((s) => s.name)).toEqual([
      "wave w1",
      "skill s1",
      "skill s2",
    ]);
  });

  it("is idempotent — same events produce identical span/trace ids", () => {
    const events: Event[] = [
      ev(0, "wave-start", { wave_id: "w1", phase: 4 }),
      ev(1, "skill-invoke", { skill_id: "create-prd" }),
      ev(2, "skill-result", { skill_id: "create-prd", cause_seq: 1, exit_code: 0 }),
      ev(3, "wave-end", { wave_id: "w1", phase: 4, status: "success" }),
    ];
    const a = mapRunToSpans(events);
    const b = mapRunToSpans(events);
    expect(a.traceId).toBe(b.traceId);
    expect(a.spans.map((s) => s.spanContext().spanId)).toEqual(
      b.spans.map((s) => s.spanContext().spanId),
    );
  });

  it("rejects empty input", () => {
    expect(() => mapRunToSpans([])).toThrow();
  });
});
