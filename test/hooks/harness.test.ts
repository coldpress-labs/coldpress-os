/**
 * Hook harness tests — the COLDPRESS_OVERRIDE protocol, decision→JSON
 * rendering, and the `runHook` dispatcher (§4.4, WS1).
 */

import { describe, expect, it } from "vitest";
import { runHook } from "../../src/commands/hook";
import {
  type HookHandler,
  parseOverride,
  renderDecision,
} from "../../src/hooks/types";

describe("parseOverride — COLDPRESS_OVERRIDE=\"<gate>:<reason>\"", () => {
  it("returns the directive when gate matches and a reason is present", () => {
    const d = parseOverride("sacred-guard", { COLDPRESS_OVERRIDE: "sacred-guard:hotfix for incident 42" });
    expect(d).toEqual({ gate: "sacred-guard", reason: "hotfix for incident 42" });
  });

  it("preserves colons inside the reason (splits on first colon only)", () => {
    const d = parseOverride("deploy-gate", { COLDPRESS_OVERRIDE: "deploy-gate:see 12:30 change record" });
    expect(d?.reason).toBe("see 12:30 change record");
  });

  it("does not apply to a different gate", () => {
    expect(parseOverride("sacred-guard", { COLDPRESS_OVERRIDE: "deploy-gate:x" })).toBeNull();
  });

  it("requires a non-empty reason", () => {
    expect(parseOverride("sacred-guard", { COLDPRESS_OVERRIDE: "sacred-guard:" })).toBeNull();
    expect(parseOverride("sacred-guard", { COLDPRESS_OVERRIDE: "sacred-guard" })).toBeNull();
  });

  it("returns null for a non-overridable hook (gate=null) or unset env", () => {
    expect(parseOverride(null, { COLDPRESS_OVERRIDE: "x:y" })).toBeNull();
    expect(parseOverride("sacred-guard", {})).toBeNull();
  });
});

describe("renderDecision — Claude Code hook I/O contract", () => {
  it("renders a PreToolUse deny as permissionDecision JSON at exit 0", () => {
    const { stdout, exitCode } = renderDecision({ kind: "deny", reason: "sacred doc" }, "PreToolUse");
    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout as string);
    expect(payload.hookSpecificOutput.permissionDecision).toBe("deny");
    expect(payload.hookSpecificOutput.permissionDecisionReason).toBe("sacred doc");
    expect(payload.hookSpecificOutput.hookEventName).toBe("PreToolUse");
  });

  it("renders SessionStart context as additionalContext JSON", () => {
    const { stdout } = renderDecision({ kind: "context", text: "lane: full" }, "SessionStart");
    const payload = JSON.parse(stdout as string);
    expect(payload.hookSpecificOutput.additionalContext).toBe("lane: full");
    expect(payload.hookSpecificOutput.hookEventName).toBe("SessionStart");
  });

  it("renders 'none' as no output", () => {
    expect(renderDecision({ kind: "none" }, "PreToolUse")).toEqual({ stdout: null, exitCode: 0 });
  });
});

describe("runHook — dispatcher + override integration", () => {
  it("--explain prints the hook's explanation without reading stdin", async () => {
    let out = "";
    const code = await runHook("load-state", { explain: true, stdout: (s) => (out += s) });
    expect(code).toBe(0);
    expect(out).toContain("load-state (SessionStart)");
  });

  it("fails open (no-op) on an unknown hook name", async () => {
    let out = "";
    let err = "";
    const code = await runHook("does-not-exist", { input: {}, stdout: (s) => (out += s), stderr: (s) => (err += s) });
    expect(code).toBe(0);
    expect(out).toBe("");
    expect(err).toContain("unknown hook");
  });

  const denyHandler: HookHandler = {
    name: "fake-guard",
    event: "PreToolUse",
    overrideGate: "fake-guard",
    explain: "test",
    run: () => ({ kind: "deny", reason: "blocked" }),
  };

  it("emits a deny decision when a guard hook denies (no override)", async () => {
    let out = "";
    const code = await runHook("fake-guard", { handler: denyHandler, input: {}, env: {}, stdout: (s) => (out += s) });
    expect(code).toBe(0);
    expect(JSON.parse(out).hookSpecificOutput.permissionDecision).toBe("deny");
  });

  it("overrides a deny (allow + loud log) when COLDPRESS_OVERRIDE matches", async () => {
    let out = "";
    let err = "";
    const code = await runHook("fake-guard", {
      handler: denyHandler,
      input: {},
      env: { COLDPRESS_OVERRIDE: "fake-guard:intentional" },
      stdout: (s) => (out += s),
      stderr: (s) => (err += s),
    });
    expect(code).toBe(0);
    expect(out).toBe(""); // no deny emitted — allowed
    expect(err).toContain("COLDPRESS_OVERRIDE ACTIVE");
    expect(err).toContain("intentional");
  });
});
