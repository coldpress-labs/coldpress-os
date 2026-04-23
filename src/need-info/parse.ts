/**
 * `<NEED_INFO>` tag parser (§5.4).
 *
 * Extracts `<NEED_INFO>…</NEED_INFO>` blocks from a subagent's output.
 * Supports two surface shapes:
 *
 *   1. Terse (just the question):
 *      `<NEED_INFO>What is the expected auth provider?</NEED_INFO>`
 *
 *   2. Rich (fenced YAML inside the tag):
 *      ```
 *      <NEED_INFO>
 *      topic: auth-provider
 *      kind: tech-stack-unclear
 *      context_refs:
 *        - _context/sacred/tech-stack.md
 *      question: What is the expected auth provider?
 *      </NEED_INFO>
 *      ```
 *
 * Pure function: takes input text, returns parsed messages + any parse
 * errors. Never throws on malformed input; caller decides how to surface
 * the issue.
 */

import { parse as parseYaml } from "yaml";
import {
  type NeedInfoKind,
  type NeedInfoMessage,
  NeedInfoKindEnum,
  NeedInfoMessageSchema,
} from "../../schemas/need-info.schema.js";

export interface ParseIssue {
  /** 0-indexed offset in the input text where the malformed tag started. */
  offset: number;
  snippet: string;
  message: string;
}

export interface ParseResult {
  messages: NeedInfoMessage[];
  issues: ParseIssue[];
}

export interface ParseOptions {
  /** Emitter agent name — pinned on every parsed message. */
  fromAgent: string;
  /** Injected for deterministic tests. */
  now?: Date;
  /** Injected for deterministic tests. */
  idPrefix?: string;
}

const TAG_RE = /<NEED_INFO>([\s\S]*?)<\/NEED_INFO>/g;

export function parseNeedInfo(
  input: string,
  options: ParseOptions,
): ParseResult {
  const messages: NeedInfoMessage[] = [];
  const issues: ParseIssue[] = [];
  const emittedAt = (options.now ?? new Date()).toISOString();
  const idPrefix = options.idPrefix ?? "ni";
  let matchIdx = 0;

  for (const match of input.matchAll(TAG_RE)) {
    const offset = match.index ?? 0;
    const inner = match[1] ?? "";
    const candidate = parseInner(inner);

    if (!candidate.ok) {
      issues.push({
        offset,
        snippet: match[0].slice(0, 80),
        message: candidate.error,
      });
      continue;
    }

    const message: NeedInfoMessage = {
      schema_version: 1,
      id: `${idPrefix}-${matchIdx++}`,
      from_agent: options.fromAgent,
      topic: candidate.value.topic,
      kind: candidate.value.kind,
      question: candidate.value.question,
      context_refs: candidate.value.context_refs ?? [],
      emitted_at: emittedAt,
    };

    const validated = NeedInfoMessageSchema.safeParse(message);
    if (!validated.success) {
      issues.push({
        offset,
        snippet: match[0].slice(0, 80),
        message: validated.error.issues
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; "),
      });
      continue;
    }
    messages.push(validated.data);
  }

  return { messages, issues };
}

interface InnerFields {
  topic: string;
  kind: NeedInfoKind;
  question: string;
  context_refs?: string[];
}

type InnerResult =
  | { ok: true; value: InnerFields }
  | { ok: false; error: string };

function parseInner(inner: string): InnerResult {
  const trimmed = inner.trim();

  // Rich form: starts with a YAML key (word colon).
  if (/^[a-z_]+\s*:/i.test(trimmed)) {
    let parsed: unknown;
    try {
      parsed = parseYaml(trimmed);
    } catch (err) {
      return { ok: false, error: `YAML parse failed: ${(err as Error).message}` };
    }
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "rich-form payload is not a YAML object" };
    }
    const obj = parsed as Record<string, unknown>;
    const question = typeof obj.question === "string" ? obj.question : undefined;
    if (!question) {
      return { ok: false, error: "rich-form payload missing `question`" };
    }
    const kindRaw = typeof obj.kind === "string" ? obj.kind : undefined;
    const kindParse = NeedInfoKindEnum.safeParse(kindRaw);
    if (!kindParse.success) {
      return {
        ok: false,
        error: `unknown or missing \`kind\` — expected one of: ${NeedInfoKindEnum.options.join(", ")}`,
      };
    }
    const topic =
      typeof obj.topic === "string" && obj.topic.trim().length > 0
        ? obj.topic.trim()
        : deriveTopic(question);
    const refs = Array.isArray(obj.context_refs)
      ? (obj.context_refs as unknown[]).filter((v): v is string => typeof v === "string")
      : undefined;
    return {
      ok: true,
      value: {
        topic,
        kind: kindParse.data,
        question,
        context_refs: refs,
      },
    };
  }

  // Terse form: just the question body.
  if (trimmed.length === 0) {
    return { ok: false, error: "empty `<NEED_INFO>` tag" };
  }
  return {
    ok: true,
    value: {
      topic: deriveTopic(trimmed),
      kind: "other",
      question: trimmed,
    },
  };
}

/**
 * Slugify the first line / 48 chars of the question for budget bookkeeping.
 * Stable for identical questions; won't collide with distinct questions at
 * small scale. Real duplicates should pass explicit `topic:` in rich form.
 */
export function deriveTopic(question: string): string {
  const firstLine = question.split("\n")[0] ?? "";
  const slug = firstLine
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug.length > 0 ? slug : "unslugged";
}

/**
 * Render a message back to its canonical rich tag form. Useful for
 * orchestrator logs + testing round-trip integrity.
 */
export function renderNeedInfo(msg: NeedInfoMessage): string {
  const lines: string[] = ["<NEED_INFO>"];
  lines.push(`topic: ${msg.topic}`);
  lines.push(`kind: ${msg.kind}`);
  if (msg.context_refs.length > 0) {
    lines.push("context_refs:");
    for (const ref of msg.context_refs) lines.push(`  - ${ref}`);
  }
  lines.push(`question: ${JSON.stringify(msg.question)}`);
  lines.push("</NEED_INFO>");
  return lines.join("\n");
}
