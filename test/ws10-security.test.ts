/**
 * WS10-A3: security-registry + threat-model schemas + the story-graph
 * security_registry ⇒ risk:high cross-check.
 */

import { describe, expect, it } from "vitest";
import { SecurityRegistrySchema, ThreatModelSchema } from "../schemas/architecture/p6-artifacts.schema";
import { StorySchema } from "../schemas/story-graph.schema";

describe("SecurityRegistrySchema", () => {
  it("accepts a well-formed registry", () => {
    const r = SecurityRegistrySchema.parse({
      entries: [
        { path: "src/auth/**", category: "authn", reason: "credentials", component: "auth" },
        { path: "src/billing/**", category: "payment", reason: "Stripe" },
      ],
    });
    expect(r.entries).toHaveLength(2);
  });
  it("accepts an explicit empty registry (a decision, not absence)", () => {
    expect(SecurityRegistrySchema.parse({ entries: [] }).entries).toEqual([]);
  });
  it("rejects an unknown category + missing reason (strict)", () => {
    expect(SecurityRegistrySchema.safeParse({ entries: [{ path: "x", category: "nope", reason: "r" }] }).success).toBe(false);
    expect(SecurityRegistrySchema.safeParse({ entries: [{ path: "x", category: "authn" }] }).success).toBe(false);
  });
});

describe("ThreatModelSchema", () => {
  it("accepts STRIDE threats with mitigations", () => {
    const t = ThreatModelSchema.parse({
      threats: [
        { id: "T-01", component: "auth", category: "spoofing", description: "stuffing", mitigation: "rate-limit", security_registry_paths: ["src/auth/**"] },
      ],
    });
    expect(t.threats[0]?.residual_risk).toBe("low"); // default
  });
  it("rejects a bad threat id + unknown STRIDE category", () => {
    expect(ThreatModelSchema.safeParse({ threats: [{ id: "bad", component: "c", category: "spoofing", description: "d", mitigation: "m" }] }).success).toBe(false);
    expect(ThreatModelSchema.safeParse({ threats: [{ id: "T-1", component: "c", category: "phishing", description: "d", mitigation: "m" }] }).success).toBe(false);
  });
});

describe("story-graph security_registry ⇒ risk:high cross-check (A3)", () => {
  const base = { id: "ST-1", estimate: { o: 1, m: 2, p: 3 } };
  it("accepts a security story that is risk:high", () => {
    expect(StorySchema.safeParse({ ...base, security_registry: true, risk: "high" }).success).toBe(true);
  });
  it("REJECTS a security story that is not risk:high", () => {
    const r = StorySchema.safeParse({ ...base, security_registry: true, risk: "medium" });
    expect(r.success).toBe(false);
  });
  it("leaves non-security stories unconstrained", () => {
    expect(StorySchema.safeParse({ ...base, risk: "low" }).success).toBe(true);
    expect(StorySchema.safeParse({ ...base, security_registry: false, risk: "medium" }).success).toBe(true);
  });
});
