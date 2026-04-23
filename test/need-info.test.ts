/**
 * <NEED_INFO> protocol tests (§5.4).
 *
 * Covers:
 *   - Schema invariants (Zod)
 *   - Parser — rich + terse forms, malformed payloads, topic slugging
 *   - Routing — every kind has a route; budget-exhausted → human
 *   - Retry budget — spend / exhaustion / reset semantics
 *   - Subagent convention — every of the 9 subagents carries the
 *     "When to Emit <NEED_INFO>" section.
 */

import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_RETRY_BUDGET,
  NeedInfoBudgetSchema,
  NeedInfoKindEnum,
  NeedInfoMessageSchema,
  NeedInfoResolutionSchema,
} from "../schemas/need-info.schema";
import { NeedInfoBudgetTracker } from "../src/need-info/budget";
import { deriveTopic, parseNeedInfo, renderNeedInfo } from "../src/need-info/parse";
import {
  NEED_INFO_ROUTES,
  type RouteTarget,
  routeNeedInfo,
} from "../src/need-info/route";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);

const FIXED_NOW = new Date("2026-04-24T15:00:00Z");

describe("NeedInfoKindEnum", () => {
  it("exposes the 10 canonical kinds", () => {
    expect(NeedInfoKindEnum.options.length).toBe(10);
    for (const k of [
      "prd-ambiguity",
      "architecture-unclear",
      "tech-stack-unclear",
      "scope-boundary-unclear",
      "acceptance-criteria-unclear",
      "design-intent-unclear",
      "process-step-unclear",
      "credential-missing",
      "handoff-shape-unclear",
      "other",
    ]) {
      expect(NeedInfoKindEnum.safeParse(k).success).toBe(true);
    }
  });

  it("rejects unknown kinds", () => {
    expect(NeedInfoKindEnum.safeParse("vibes").success).toBe(false);
  });
});

describe("NeedInfoMessageSchema", () => {
  const base = {
    schema_version: 1 as const,
    id: "ni-0",
    from_agent: "developer",
    topic: "auth-provider",
    kind: "tech-stack-unclear" as const,
    question: "Which auth provider?",
    context_refs: [] as string[],
    emitted_at: "2026-04-24T15:00:00Z",
  };

  it("accepts a well-formed message", () => {
    expect(NeedInfoMessageSchema.safeParse(base).success).toBe(true);
  });

  it("rejects non-slug topic", () => {
    expect(
      NeedInfoMessageSchema.safeParse({ ...base, topic: "Auth Provider!" })
        .success,
    ).toBe(false);
  });

  it("rejects empty question", () => {
    expect(
      NeedInfoMessageSchema.safeParse({ ...base, question: "" }).success,
    ).toBe(false);
  });

  it("rejects non-ISO emitted_at", () => {
    expect(
      NeedInfoMessageSchema.safeParse({ ...base, emitted_at: "yesterday" })
        .success,
    ).toBe(false);
  });
});

describe("NeedInfoResolutionSchema", () => {
  it("accepts answered/escalated/abandoned", () => {
    for (const resolution of ["answered", "escalated-to-human", "abandoned"]) {
      expect(
        NeedInfoResolutionSchema.safeParse({
          schema_version: 1,
          message_id: "ni-0",
          resolved_by: "pm",
          resolution,
          resolved_at: "2026-04-24T15:00:00Z",
        }).success,
      ).toBe(true);
    }
  });

  it("rejects unknown resolution value", () => {
    expect(
      NeedInfoResolutionSchema.safeParse({
        schema_version: 1,
        message_id: "ni-0",
        resolved_by: "pm",
        resolution: "maybe",
        resolved_at: "2026-04-24T15:00:00Z",
      }).success,
    ).toBe(false);
  });
});

describe("NeedInfoBudgetSchema", () => {
  it("accepts a fresh budget with defaults", () => {
    expect(
      NeedInfoBudgetSchema.safeParse({
        schema_version: 1,
        topic: "t",
        limit: 3,
        spent: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative spent", () => {
    expect(
      NeedInfoBudgetSchema.safeParse({
        schema_version: 1,
        topic: "t",
        limit: 3,
        spent: -1,
      }).success,
    ).toBe(false);
  });
});

describe("deriveTopic", () => {
  it("slugs the first line, caps at 48 chars", () => {
    expect(deriveTopic("Which auth provider?")).toBe("which-auth-provider");
    expect(
      deriveTopic("This is a really long question that should get truncated at 48 chars"),
    ).toMatch(/^[a-z0-9-]+$/);
    expect(
      deriveTopic("This is a really long question that should get truncated at 48 chars")
        .length,
    ).toBeLessThanOrEqual(48);
  });

  it("falls back to 'unslugged' on unsluggable input", () => {
    expect(deriveTopic("!!!")).toBe("unslugged");
    expect(deriveTopic("")).toBe("unslugged");
  });

  it("uses only the first line", () => {
    expect(deriveTopic("Line one?\nLine two.")).toBe("line-one");
  });
});

describe("parseNeedInfo — terse form", () => {
  it("parses a terse tag", () => {
    const input = "Some prose <NEED_INFO>Which auth provider?</NEED_INFO> more prose.";
    const result = parseNeedInfo(input, {
      fromAgent: "developer",
      now: FIXED_NOW,
    });
    expect(result.issues).toEqual([]);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]).toMatchObject({
      from_agent: "developer",
      kind: "other",
      topic: "which-auth-provider",
      question: "Which auth provider?",
    });
  });

  it("flags empty tags", () => {
    const result = parseNeedInfo("<NEED_INFO></NEED_INFO>", {
      fromAgent: "developer",
      now: FIXED_NOW,
    });
    expect(result.messages).toEqual([]);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]!.message).toMatch(/empty/);
  });
});

describe("parseNeedInfo — rich form", () => {
  it("parses a rich tag", () => {
    const input = `prose
<NEED_INFO>
topic: auth-provider-choice
kind: tech-stack-unclear
context_refs:
  - _context/sacred/tech-stack.md
question: Which auth provider?
</NEED_INFO>
more prose`;
    const result = parseNeedInfo(input, {
      fromAgent: "architect",
      now: FIXED_NOW,
    });
    expect(result.issues).toEqual([]);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]).toMatchObject({
      from_agent: "architect",
      topic: "auth-provider-choice",
      kind: "tech-stack-unclear",
      question: "Which auth provider?",
      context_refs: ["_context/sacred/tech-stack.md"],
    });
  });

  it("rejects rich form with unknown kind", () => {
    const input = `<NEED_INFO>
topic: x
kind: vibes
question: hmm?
</NEED_INFO>`;
    const result = parseNeedInfo(input, {
      fromAgent: "developer",
      now: FIXED_NOW,
    });
    expect(result.messages).toEqual([]);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]!.message).toMatch(/kind/);
  });

  it("rejects rich form missing question", () => {
    const input = `<NEED_INFO>
topic: x
kind: other
</NEED_INFO>`;
    const result = parseNeedInfo(input, {
      fromAgent: "developer",
      now: FIXED_NOW,
    });
    expect(result.messages).toEqual([]);
    expect(result.issues[0]!.message).toMatch(/question/);
  });

  it("derives topic from question when absent", () => {
    const input = `<NEED_INFO>
kind: prd-ambiguity
question: Are logged-out users in scope?
</NEED_INFO>`;
    const result = parseNeedInfo(input, {
      fromAgent: "pm",
      now: FIXED_NOW,
    });
    expect(result.messages[0]!.topic).toMatch(/logged-out-users/);
  });
});

describe("parseNeedInfo — multiple tags", () => {
  it("parses N tags in one pass, assigns stable ids", () => {
    const input = `<NEED_INFO>First one?</NEED_INFO>
and later <NEED_INFO>Second one?</NEED_INFO>`;
    const result = parseNeedInfo(input, {
      fromAgent: "developer",
      now: FIXED_NOW,
      idPrefix: "t",
    });
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]!.id).toBe("t-0");
    expect(result.messages[1]!.id).toBe("t-1");
  });
});

describe("renderNeedInfo", () => {
  it("round-trips to parseable rich form", () => {
    const input = {
      schema_version: 1 as const,
      id: "ni-0",
      from_agent: "developer",
      topic: "scope-of-logout",
      kind: "prd-ambiguity" as const,
      question: "Are logged-out users in scope?",
      context_refs: ["_context/sacred/prd.md"],
      emitted_at: FIXED_NOW.toISOString(),
    };
    const rendered = renderNeedInfo(input);
    const parsed = parseNeedInfo(rendered, {
      fromAgent: "developer",
      now: FIXED_NOW,
    });
    expect(parsed.issues).toEqual([]);
    expect(parsed.messages).toHaveLength(1);
    expect(parsed.messages[0]!.topic).toBe("scope-of-logout");
    expect(parsed.messages[0]!.kind).toBe("prd-ambiguity");
    expect(parsed.messages[0]!.question).toBe("Are logged-out users in scope?");
    expect(parsed.messages[0]!.context_refs).toEqual(["_context/sacred/prd.md"]);
  });
});

describe("routeNeedInfo", () => {
  it("routes every kind to a non-empty target", () => {
    for (const kind of NeedInfoKindEnum.options) {
      const decision = routeNeedInfo(kind);
      expect(decision.target).toBeTruthy();
      expect(decision.reason).toBe("kind-lookup");
    }
  });

  it("has full coverage — every kind has a route in NEED_INFO_ROUTES", () => {
    const routedKinds = Object.keys(NEED_INFO_ROUTES).sort();
    const enumKinds = [...NeedInfoKindEnum.options].sort();
    expect(routedKinds).toEqual(enumKinds);
  });

  it("canonical routes per the routing table", () => {
    const expected: Record<string, RouteTarget> = {
      "prd-ambiguity": "pm",
      "architecture-unclear": "architect",
      "tech-stack-unclear": "architect",
      "scope-boundary-unclear": "pm",
      "acceptance-criteria-unclear": "scrum-master",
      "design-intent-unclear": "ux-designer",
      "process-step-unclear": "valet",
      "credential-missing": "human",
      "handoff-shape-unclear": "valet",
      "other": "human",
    };
    for (const [kind, target] of Object.entries(expected)) {
      expect(NEED_INFO_ROUTES[kind as keyof typeof NEED_INFO_ROUTES]).toBe(target);
    }
  });

  it("budget-exhausted overrides kind lookup → human", () => {
    const decision = routeNeedInfo("prd-ambiguity", { budgetExhausted: true });
    expect(decision.target).toBe("human");
    expect(decision.reason).toBe("budget-exhausted");
  });
});

describe("NeedInfoBudgetTracker", () => {
  it("returns fresh budget for unseen topic", () => {
    const t = new NeedInfoBudgetTracker();
    const b = t.get("new-topic");
    expect(b.spent).toBe(0);
    expect(b.limit).toBe(DEFAULT_RETRY_BUDGET);
  });

  it("spend increments, does not exhaust under limit", () => {
    const t = new NeedInfoBudgetTracker();
    const r1 = t.spend("topic-a", "ni-0");
    expect(r1.budget.spent).toBe(1);
    expect(r1.exhausted).toBe(false);

    const r2 = t.spend("topic-a", "ni-1");
    expect(r2.budget.spent).toBe(2);
    expect(r2.exhausted).toBe(false);
  });

  it("third spend at default limit exhausts", () => {
    const t = new NeedInfoBudgetTracker();
    t.spend("topic-a");
    t.spend("topic-a");
    const r3 = t.spend("topic-a");
    expect(r3.budget.spent).toBe(3);
    expect(r3.exhausted).toBe(true);
    expect(t.isExhausted("topic-a")).toBe(true);
  });

  it("honours non-default limit", () => {
    const t = new NeedInfoBudgetTracker({ defaultLimit: 1 });
    const r = t.spend("topic-a");
    expect(r.exhausted).toBe(true);
  });

  it("reset clears the topic", () => {
    const t = new NeedInfoBudgetTracker();
    t.spend("topic-a");
    t.spend("topic-a");
    t.spend("topic-a");
    expect(t.isExhausted("topic-a")).toBe(true);
    t.reset("topic-a");
    expect(t.isExhausted("topic-a")).toBe(false);
    expect(t.get("topic-a").spent).toBe(0);
  });

  it("topics are independent", () => {
    const t = new NeedInfoBudgetTracker();
    t.spend("topic-a");
    t.spend("topic-a");
    t.spend("topic-a");
    expect(t.isExhausted("topic-a")).toBe(true);
    expect(t.isExhausted("topic-b")).toBe(false);
  });

  it("toArray exposes a snapshot", () => {
    const t = new NeedInfoBudgetTracker();
    t.spend("topic-a");
    t.spend("topic-b");
    const snap = t.toArray();
    expect(snap).toHaveLength(2);
    expect(snap.map((b) => b.topic).sort()).toEqual(["topic-a", "topic-b"]);
  });
});

describe("Subagent convention — all 9 carry a NEED_INFO section", () => {
  const AGENTS = [
    "analyst",
    "architect",
    "communicator",
    "developer",
    "pm",
    "qa",
    "scrum-master",
    "ux-designer",
    "valet",
  ];

  it("template ships exactly these 9 subagents", async () => {
    const dir = join(repoRoot, "template/.claude/agents");
    const files = (await readdir(dir))
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
      .sort();
    expect(files).toEqual(AGENTS);
  });

  it("every subagent carries a `## When to Emit <NEED_INFO>` section", async () => {
    for (const agent of AGENTS) {
      const content = await readFile(
        join(repoRoot, "template/.claude/agents", `${agent}.md`),
        "utf8",
      );
      expect(
        content,
        `${agent}.md should have a NEED_INFO section`,
      ).toMatch(/## When to Emit `<NEED_INFO>`/);
      // And a reference to the protocol doc.
      expect(content).toContain("coldpress-os/docs/need-info-protocol.md");
    }
  });
});
