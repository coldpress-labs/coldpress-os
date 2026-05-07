/**
 * Tests for the non-interactive --yes path (Wave 2.3). Covers the
 * required-flag validator — a pure function callers can invoke directly.
 * CLI-level wiring (exposed flags on `coldpress init`) is intentionally
 * not plumbed in cli.ts at present; when it lands, it delegates to this
 * validator.
 */

import { describe, expect, it } from "vitest";
import { resolveNonInteractiveInputs } from "../src/commands/init";

describe("resolveNonInteractiveInputs", () => {
  it("accepts a fully specified set of flags", () => {
    const res = resolveNonInteractiveInputs({
      yes: true,
      name: "My App",
      slug: "my-app",
      user: "Aastha",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.resolved.projectName).toBe("My App");
      expect(res.resolved.slug).toBe("my-app");
      expect(res.resolved.userName).toBe("Aastha");
    }
  });

  it("accepts a positional name in place of --name", () => {
    const res = resolveNonInteractiveInputs({
      yes: true,
      projectNameArg: "My App",
      slug: "my-app",
      user: "Aastha",
    });
    expect(res.ok).toBe(true);
  });

  it("infers slug from name when --slug is omitted", () => {
    const res = resolveNonInteractiveInputs({
      yes: true,
      name: "My Awesome App",
      user: "Aastha",
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.resolved.slug).toBe("my-awesome-app");
  });

  it("rejects with a clear error when --name is missing", () => {
    const res = resolveNonInteractiveInputs({ yes: true, slug: "x", user: "U" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors.some((e) => e.includes("--name"))).toBe(true);
    }
  });

  it("rejects when --user is missing", () => {
    const res = resolveNonInteractiveInputs({ yes: true, name: "X", slug: "x" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors.some((e) => e.includes("--user"))).toBe(true);
    }
  });

  it("rejects non-kebab-case --slug", () => {
    const res = resolveNonInteractiveInputs({
      yes: true,
      name: "X",
      slug: "Not_KebabCase!",
      user: "U",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors.some((e) => e.includes("kebab-case"))).toBe(true);
    }
  });

  it("accumulates multiple errors in one pass", () => {
    const res = resolveNonInteractiveInputs({ yes: true });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.length).toBeGreaterThanOrEqual(2);
  });
});

