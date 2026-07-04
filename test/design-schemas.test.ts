/**
 * Design data-file schemas (audit F6): budgets + styleguide + the registry.
 */

import { describe, expect, it } from "vitest";
import { BudgetsSchema, parseBudgets } from "../schemas/design/budgets.schema";
import { StyleguideSchema, parseStyleguide } from "../schemas/design/styleguide.schema";
import { DESIGN_ARTEFACT_SCHEMAS, designSchemaForPath } from "../schemas/design/index";

const BUDGETS = {
  scope: "marketing-site",
  performance: { lcp_ms: 1800, inp_ms: 200, cls: 0.1, ttfb_ms: 600 },
  weight: { js_kb: 150, css_kb: 40, image_kb: 300, total_kb: 600 },
  accessibility: { wcag_level: "AA", axe_max_violations: 0 },
  lighthouse: { performance: 90, accessibility: 100, best_practices: 95, seo: 95 },
};

const STYLEGUIDE = {
  route: "/styleguide",
  tokens_ref: "_context/design/tokens.json",
  sections: [
    { id: "buttons", title: "Buttons", components: ["Button", "IconButton"], token_roles: ["primary", "text"] },
    { id: "forms", title: "Forms", components: ["Input", "Select"] },
  ],
  baselines: { dir: "_context/design/visual-baselines", themes: ["light", "dark"], viewports: [375, 1280] },
};

describe("BudgetsSchema", () => {
  it("accepts a well-formed budget set", () => {
    expect(parseBudgets(BUDGETS).accessibility.wcag_level).toBe("AA");
  });
  it("defaults axe_max_violations to 0", () => {
    const b = parseBudgets({ performance: { lcp_ms: 2000, cls: 0.1 }, weight: { js_kb: 100 }, accessibility: { wcag_level: "AA" } });
    expect(b.accessibility.axe_max_violations).toBe(0);
  });
  it("rejects an unknown WCAG level + unknown keys (strict)", () => {
    expect(BudgetsSchema.safeParse({ ...BUDGETS, accessibility: { wcag_level: "AAAA" } }).success).toBe(false);
    expect(BudgetsSchema.safeParse({ ...BUDGETS, oops: 1 }).success).toBe(false);
  });
  it("rejects a non-positive or out-of-range value", () => {
    expect(BudgetsSchema.safeParse({ ...BUDGETS, performance: { lcp_ms: -1, cls: 0.1 } }).success).toBe(false);
    expect(BudgetsSchema.safeParse({ ...BUDGETS, lighthouse: { performance: 101 } }).success).toBe(false);
  });
  it("requires performance + weight + accessibility", () => {
    expect(BudgetsSchema.safeParse({ performance: BUDGETS.performance }).success).toBe(false);
  });
});

describe("StyleguideSchema", () => {
  it("accepts a well-formed manifest", () => {
    const s = parseStyleguide(STYLEGUIDE);
    expect(s.sections).toHaveLength(2);
    expect(s.baselines.themes).toContain("dark");
  });
  it("defaults route + tokens_ref + light theme", () => {
    const s = parseStyleguide({ sections: [{ id: "x", title: "X", components: ["C"] }], baselines: { dir: "b" } });
    expect(s.route).toBe("/styleguide");
    expect(s.tokens_ref).toBe("_context/design/tokens.json");
    expect(s.baselines.themes).toEqual(["light"]);
  });
  it("rejects an empty sections list + a bad section id", () => {
    expect(StyleguideSchema.safeParse({ ...STYLEGUIDE, sections: [] }).success).toBe(false);
    expect(StyleguideSchema.safeParse({ ...STYLEGUIDE, sections: [{ id: "Bad Id", title: "T", components: ["C"] }] }).success).toBe(false);
  });
});

describe("DESIGN_ARTEFACT_SCHEMAS registry", () => {
  it("registers tokens, budgets, and styleguide", () => {
    expect(Object.keys(DESIGN_ARTEFACT_SCHEMAS).sort()).toEqual(["budgets", "styleguide", "tokens"]);
  });
  it("resolves a design schema by its canonical instance path", () => {
    expect(designSchemaForPath("_context/design/budgets.yaml")?.schema).toBe(BudgetsSchema);
    expect(designSchemaForPath("_context/design/styleguide.yaml")?.schema).toBe(StyleguideSchema);
    expect(designSchemaForPath("_context/design/tokens.json")).toBeDefined();
    expect(designSchemaForPath("_context/planning/prd.md")).toBeUndefined();
  });
  it("each registered artefact's parser round-trips its example", () => {
    // sanity: registry parsers are wired to the right schemas
    expect(() => designSchemaForPath("_context/design/budgets.yaml")?.parse(BUDGETS)).not.toThrow();
    expect(() => designSchemaForPath("_context/design/styleguide.yaml")?.parse(STYLEGUIDE)).not.toThrow();
  });
});
