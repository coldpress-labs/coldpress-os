import { describe, expect, it } from "vitest";
import { extractFrontmatter } from "../src/utils/frontmatter";

describe("extractFrontmatter", () => {
  it("extracts quoted scalar fields", () => {
    const input = `---
name: "retrospective"
description: "Post-epic review to extract lessons learned"
type: "workflow"
---

# Body`;
    const fm = extractFrontmatter(input);
    expect(fm.name).toBe("retrospective");
    expect(fm.description).toBe("Post-epic review to extract lessons learned");
    expect(fm.type).toBe("workflow");
  });

  it("extracts unquoted scalar fields", () => {
    const input = `---
name: retrospective
type: workflow
---
`;
    const fm = extractFrontmatter(input);
    expect(fm.name).toBe("retrospective");
    expect(fm.type).toBe("workflow");
  });

  it("returns empty object when no frontmatter is present", () => {
    expect(extractFrontmatter("# Just a heading\n")).toEqual({});
    expect(extractFrontmatter("")).toEqual({});
  });

  it("ignores list items and continuation lines", () => {
    const input = `---
name: "with-list"
inputs:
  - "first"
  - "second"
description: "still captured"
---
`;
    const fm = extractFrontmatter(input);
    expect(fm.name).toBe("with-list");
    expect(fm.description).toBe("still captured");
    // The list under "inputs" should not leak a key, and individual list
    // items should not be captured as malformed scalars.
    expect(fm.inputs).toBeUndefined();
    expect(Object.keys(fm)).toEqual(["name", "description"]);
  });

  it("preserves punctuation inside quoted values", () => {
    const input = `---
description: "Review code changes with parallel review layers and structured triage"
---
`;
    expect(extractFrontmatter(input).description).toBe(
      "Review code changes with parallel review layers and structured triage",
    );
  });

  it("handles single-quoted values", () => {
    const input = `---
name: 'single-quoted'
---
`;
    expect(extractFrontmatter(input).name).toBe("single-quoted");
  });
});
