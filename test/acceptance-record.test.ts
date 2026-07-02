import { describe, expect, it } from "vitest";
import { AcceptanceRecordSchema } from "../schemas/operations/acceptance-record.schema";

const base = {
  schema_version: 1 as const,
  record_id: "ACC-001",
  project_slug: "acme-site",
  approved_by: "Priya Rao (Client PM)",
  scope: "Profile page + settings (R-14, R-15)",
  release_ref: "https://acme-site-staging.vercel.app",
  verdict: "accepted" as const,
  date: "2026-07-03",
};

describe("AcceptanceRecordSchema (WS6-E)", () => {
  it("accepts a clean sign-off", () => {
    expect(AcceptanceRecordSchema.safeParse(base).success).toBe(true);
  });

  it("accepts change-requests without blocking (deferred to next cycle)", () => {
    const r = {
      ...base,
      feedback: [{ type: "change-request", description: "add dark mode", disposition: "DLT-42 → next cycle" }],
    };
    expect(AcceptanceRecordSchema.safeParse(r).success).toBe(true);
  });

  it("rejects a plain 'accepted' verdict carrying an unresolved bug (bugs block prod)", () => {
    const r = { ...base, feedback: [{ type: "bug", description: "avatar upload 500s" }] };
    const res = AcceptanceRecordSchema.safeParse(r);
    expect(res.success).toBe(false);
  });

  it("requires conditions for accepted-with-conditions", () => {
    const bad = { ...base, verdict: "accepted-with-conditions" as const };
    expect(AcceptanceRecordSchema.safeParse(bad).success).toBe(false);
    const ok = { ...base, verdict: "accepted-with-conditions" as const, conditions: ["fix copy on /pricing within a week"] };
    expect(AcceptanceRecordSchema.safeParse(ok).success).toBe(true);
  });

  it("enforces the ACC-<seq> id format", () => {
    expect(AcceptanceRecordSchema.safeParse({ ...base, record_id: "acceptance-1" }).success).toBe(false);
  });
});
