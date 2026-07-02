/**
 * Tests for the `secret-scan` PostToolUse hook (§4.4).
 */

import { describe, expect, it } from "vitest";
import { scanForSecret, secretScanHandler, writtenContent } from "../../src/hooks/secret-scan";

describe("scanForSecret", () => {
  it("flags an AWS access key id", () => {
    expect(scanForSecret("const k = 'AKIAIOSFODNN7EXAMPLE'")).toBe("AWS access key id");
  });
  it("flags a GitHub PAT", () => {
    expect(scanForSecret(`token: ghp_${"a".repeat(36)}`)).toBe("GitHub personal access token");
  });
  it("flags a hardcoded credential assignment", () => {
    expect(scanForSecret('password = "hunter2hunter2"')).toBe("hardcoded credential assignment");
  });
  it("passes clean code", () => {
    expect(scanForSecret("const key = process.env.API_KEY;")).toBeNull();
  });
});

describe("writtenContent", () => {
  it("reads Write content and Edit new_string", () => {
    expect(writtenContent({ tool_input: { content: "abc" } })).toBe("abc");
    expect(writtenContent({ tool_input: { new_string: "def" } })).toBe("def");
    expect(writtenContent({ tool_input: {} })).toBe("");
  });
});

describe("secretScanHandler.run", () => {
  it("feeds back (deny) when a secret is written — names the pattern, not the value", async () => {
    const secret = `sk_live_${"x".repeat(30)}`;
    const d = await secretScanHandler.run({
      tool_name: "Write",
      tool_input: { file_path: "/proj/config.ts", content: `const s = "${secret}"` },
    });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") {
      expect(d.reason).toContain("Stripe live secret");
      expect(d.reason).not.toContain(secret); // never echo the value
    }
  });

  it("is silent on clean writes", () => {
    expect(secretScanHandler.run({ tool_name: "Write", tool_input: { content: "clean code" } })).toEqual({ kind: "none" });
  });

  it("is a PostToolUse hook, overridable, with --explain", () => {
    expect(secretScanHandler.event).toBe("PostToolUse");
    expect(secretScanHandler.overrideGate).toBe("secret-scan");
    expect(secretScanHandler.explain.length).toBeGreaterThan(20);
  });
});
