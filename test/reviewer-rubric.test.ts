/**
 * @reviewer rubric schema tests (§6.2).
 *
 * Covers the Zod schema invariants and the `computeOverall` aggregator.
 * No runtime reviewer to test here — the agent itself is a markdown
 * persona invoked by Claude; this block ships the schema + schema-
 * enforced aggregation rule.
 */

import { describe, expect, it } from "vitest";
import {
  ReviewRubricSchema,
  type RubricRow,
  RubricRowSchema,
  RubricSeverityEnum,
  RubricStatusEnum,
  RubricVerdictEnum,
  computeOverall,
} from "../schemas/reviewer-rubric.schema";

const ROW_PASS: RubricRow = {
  id: "vision-clarity",
  description: "Vision is specific + time-bounded",
  status: "pass",
  severity: "low",
  evidence: '"In 2026, product X will…"',
  remediation: "",
};

function row(overrides: Partial<RubricRow>): RubricRow {
  return { ...ROW_PASS, ...overrides };
}

describe("RubricSeverityEnum + RubricStatusEnum + RubricVerdictEnum", () => {
  it("accepts the canonical values", () => {
    for (const s of ["low", "medium", "high"]) {
      expect(RubricSeverityEnum.safeParse(s).success).toBe(true);
    }
    for (const s of ["pass", "fail"]) {
      expect(RubricStatusEnum.safeParse(s).success).toBe(true);
    }
    for (const s of ["pass", "warn", "fail"]) {
      expect(RubricVerdictEnum.safeParse(s).success).toBe(true);
    }
  });

  it("rejects junk", () => {
    expect(RubricSeverityEnum.safeParse("urgent").success).toBe(false);
    expect(RubricStatusEnum.safeParse("warn").success).toBe(false);
    expect(RubricVerdictEnum.safeParse("maybe").success).toBe(false);
  });
});

describe("RubricRowSchema", () => {
  it("accepts a minimal valid row", () => {
    expect(RubricRowSchema.safeParse(ROW_PASS).success).toBe(true);
  });

  it("rejects non-slug id", () => {
    expect(
      RubricRowSchema.safeParse(row({ id: "Vision Clarity!" })).success,
    ).toBe(false);
  });

  it("rejects empty evidence", () => {
    expect(RubricRowSchema.safeParse(row({ evidence: "" })).success).toBe(false);
  });

  it("accepts empty remediation on pass", () => {
    expect(
      RubricRowSchema.safeParse(
        row({ status: "pass", remediation: "" }),
      ).success,
    ).toBe(true);
  });
});

describe("computeOverall aggregator", () => {
  it("pass when every row passes", () => {
    expect(
      computeOverall([
        row({ id: "a" }),
        row({ id: "b" }),
      ]),
    ).toBe("pass");
  });

  it("fail when any high-severity row fails", () => {
    expect(
      computeOverall([
        row({ id: "a" }),
        row({
          id: "b",
          status: "fail",
          severity: "high",
          remediation: "Add the field",
        }),
      ]),
    ).toBe("fail");
  });

  it("warn when rows fail but none are high", () => {
    expect(
      computeOverall([
        row({
          id: "a",
          status: "fail",
          severity: "medium",
          remediation: "tighten language",
        }),
        row({
          id: "b",
          status: "fail",
          severity: "low",
          remediation: "add a link",
        }),
      ]),
    ).toBe("warn");
  });

  it("fail dominates warn when both conditions present", () => {
    expect(
      computeOverall([
        row({
          id: "a",
          status: "fail",
          severity: "low",
          remediation: "x",
        }),
        row({
          id: "b",
          status: "fail",
          severity: "high",
          remediation: "y",
        }),
      ]),
    ).toBe("fail");
  });
});

describe("ReviewRubricSchema", () => {
  const base = {
    schema_version: 1 as const,
    reviewer_version: "1.0",
    artefact_path: "_context/sacred/prd.md",
    criteria_source: "_context/sacred/context.md",
    reviewed_at: "2026-04-24T15:00:00Z",
    criteria: [ROW_PASS],
  };

  it("accepts a well-formed pass rubric", () => {
    expect(
      ReviewRubricSchema.safeParse({ ...base, overall: "pass" }).success,
    ).toBe(true);
  });

  it("rejects when overall verdict disagrees with the criteria", () => {
    // rows are all pass, but overall claims fail
    const parsed = ReviewRubricSchema.safeParse({ ...base, overall: "fail" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((i) => i.path.includes("overall"))).toBe(
        true,
      );
    }
  });

  it("rejects empty criteria array", () => {
    expect(
      ReviewRubricSchema.safeParse({
        ...base,
        overall: "pass",
        criteria: [],
      }).success,
    ).toBe(false);
  });

  it("rejects non-ISO timestamp", () => {
    expect(
      ReviewRubricSchema.safeParse({
        ...base,
        overall: "pass",
        reviewed_at: "yesterday",
      }).success,
    ).toBe(false);
  });

  it("round-trips a fail rubric with mixed rows", () => {
    const rubric = {
      ...base,
      overall: "fail" as const,
      criteria: [
        row({ id: "a" }),
        row({
          id: "b",
          status: "fail" as const,
          severity: "high" as const,
          remediation: "Add missing NFR",
        }),
      ],
      notes: "Reviewed against architecture.md §4.",
    };
    expect(ReviewRubricSchema.safeParse(rubric).success).toBe(true);
  });
});
