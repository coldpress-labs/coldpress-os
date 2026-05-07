/**
 * Unit tests for the parse-document routing layer — covers the pure
 * Node logic (routeFile, defaultOutputPath, parseArgs). The Python
 * subprocess invocation isn't exercised here; that needs a Python +
 * markitdown/docling env and is validated out-of-band.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// @ts-ignore — importing JS from TS test; JSDoc types carry signatures.
import {
  AI_CONVERSATION_SNIFFABLE,
  DOCLING_EXTENSIONS,
  MARKITDOWN_EXTENSIONS,
  PASSTHROUGH_EXTENSIONS,
  SUPPORTED_EXTENSIONS,
  defaultOutputPath,
  parseArgs,
  routeFile,
  sniffAiConversation,
} from "../skills/ingest/parse-document/scripts/parse.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

describe("routeFile", () => {
  it("routes PDFs to markitdown with fallbackOk=true", () => {
    const r = routeFile("/a/b/c.pdf");
    expect(r.backend).toBe("markitdown");
    expect(r.fallbackOk).toBe(true);
  });

  it("routes DOCX / PPTX / XLSX / HTML to markitdown (no fallback)", () => {
    for (const ext of [".docx", ".pptx", ".xlsx", ".html", ".htm"]) {
      const r = routeFile(`/a/doc${ext}`);
      expect(r.backend).toBe("markitdown");
      expect(r.fallbackOk).toBeUndefined();
    }
  });

  it("routes images to docling", () => {
    for (const ext of [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]) {
      expect(routeFile(`/a/img${ext}`).backend).toBe("docling");
    }
  });

  it("routes markdown / text to passthrough", () => {
    for (const ext of [".md", ".markdown", ".txt"]) {
      expect(routeFile(`/a/file${ext}`).backend).toBe("passthrough");
    }
  });

  it("rejects unsupported extensions with the extension echoed back", () => {
    const r = routeFile("/a/file.xyz");
    expect(r.backend).toBe("unsupported");
    expect(r.extension).toBe(".xyz");
  });

  it("is case-insensitive on extension", () => {
    expect(routeFile("/a/FILE.PDF").backend).toBe("markitdown");
    expect(routeFile("/a/IMAGE.PNG").backend).toBe("docling");
  });
});

describe("AI conversation sniffing + routing", () => {
  it("sniffs JSON with a top-level messages[] array as a conversation", () => {
    const head = JSON.stringify({
      messages: [{ role: "user", content: "hi" }],
    });
    expect(sniffAiConversation(head, ".json")).toBe(true);
  });

  it("sniffs JSON as a top-level array of messages (OpenAI shape)", () => {
    const head = JSON.stringify([{ role: "user", content: "hi" }]);
    expect(sniffAiConversation(head, ".json")).toBe(true);
  });

  it("rejects plain JSON data that is not a conversation", () => {
    const head = JSON.stringify({ foo: "bar", items: [1, 2, 3] });
    expect(sniffAiConversation(head, ".json")).toBe(false);
  });

  it("sniffs markdown with `### User` + `### Assistant` as a conversation", () => {
    const md = "### User\nhi\n\n### Assistant\nhello";
    expect(sniffAiConversation(md, ".md")).toBe(true);
  });

  it("does not sniff ordinary markdown with a single speaker heading", () => {
    const md = "# Meeting notes\n\n### User stories\n...";
    expect(sniffAiConversation(md, ".md")).toBe(false);
  });

  it("routes JSON content that sniffs as conversation to ai_conversation backend", () => {
    const head = JSON.stringify({ messages: [{ role: "user", content: "hi" }] });
    expect(routeFile("/a/thread.json", head).backend).toBe("ai_conversation");
  });

  it("routes markdown that sniffs as conversation to ai_conversation backend", () => {
    const md = "### User\nhi\n\n### Assistant\nhello";
    expect(routeFile("/a/thread.md", md).backend).toBe("ai_conversation");
  });

  it("falls back to passthrough for ordinary markdown without conversation headers", () => {
    const md = "# My notes\nSome content\n";
    expect(routeFile("/a/notes.md", md).backend).toBe("passthrough");
  });

  it("rejects generic JSON (not a conversation) as unsupported", () => {
    const head = JSON.stringify({ foo: "bar" });
    expect(routeFile("/a/data.json", head).backend).toBe("unsupported");
  });

  it("`.json` with no content head is unsupported (defensive)", () => {
    expect(routeFile("/a/data.json").backend).toBe("unsupported");
  });

  it("AI_CONVERSATION_SNIFFABLE covers .json, .md, .markdown", () => {
    expect(AI_CONVERSATION_SNIFFABLE.has(".json")).toBe(true);
    expect(AI_CONVERSATION_SNIFFABLE.has(".md")).toBe(true);
    expect(AI_CONVERSATION_SNIFFABLE.has(".markdown")).toBe(true);
  });
});

describe("extension-set invariants", () => {
  it("SUPPORTED_EXTENSIONS covers all routed categories", () => {
    for (const ext of MARKITDOWN_EXTENSIONS) expect(SUPPORTED_EXTENSIONS.has(ext)).toBe(true);
    for (const ext of DOCLING_EXTENSIONS) expect(SUPPORTED_EXTENSIONS.has(ext)).toBe(true);
    for (const ext of PASSTHROUGH_EXTENSIONS) expect(SUPPORTED_EXTENSIONS.has(ext)).toBe(true);
    expect(SUPPORTED_EXTENSIONS.has(".pdf")).toBe(true);
  });

  it("markitdown / docling / passthrough sets do not overlap", () => {
    for (const ext of MARKITDOWN_EXTENSIONS) {
      expect(DOCLING_EXTENSIONS.has(ext)).toBe(false);
      expect(PASSTHROUGH_EXTENSIONS.has(ext)).toBe(false);
    }
    for (const ext of DOCLING_EXTENSIONS) expect(PASSTHROUGH_EXTENSIONS.has(ext)).toBe(false);
  });
});

describe("defaultOutputPath", () => {
  const projectRoot = "/project";

  it("preserves subpath under _input/", () => {
    const out = defaultOutputPath("_input/raw/briefs/q2-plan.pdf", projectRoot);
    expect(out).toBe(join(projectRoot, "_input/.parsed/raw/briefs/q2-plan.md"));
  });

  it("handles a flat file in _input/", () => {
    const out = defaultOutputPath("_input/raw/notes.docx", projectRoot);
    expect(out).toBe(join(projectRoot, "_input/.parsed/raw/notes.md"));
  });

  it("flattens to basename when input is outside _input/", () => {
    const out = defaultOutputPath("/elsewhere/random.pdf", projectRoot);
    expect(out).toBe(join(projectRoot, "_input/.parsed/random.md"));
  });

  it("strips the extension and replaces with .md", () => {
    const out = defaultOutputPath("_input/raw/file.pptx", projectRoot);
    expect(out.endsWith(".md")).toBe(true);
    expect(out.endsWith("file.md")).toBe(true);
  });
});

describe("parseArgs", () => {
  it("parses a bare input path", () => {
    const a = parseArgs(["input.pdf"]);
    expect(a.input).toBe("input.pdf");
    expect(a.backend).toBeUndefined();
    expect(a.force).toBe(false);
  });

  it("parses --backend / --output / --force", () => {
    const a = parseArgs([
      "in.pdf",
      "--backend",
      "docling",
      "--output",
      "out.md",
      "--force",
    ]);
    expect(a.input).toBe("in.pdf");
    expect(a.backend).toBe("docling");
    expect(a.output).toBe("out.md");
    expect(a.force).toBe(true);
  });

  it("tolerates --help anywhere", () => {
    expect(parseArgs(["--help"]).help).toBe(true);
    expect(parseArgs(["-h"]).help).toBe(true);
    expect(parseArgs(["input.pdf", "--help"]).help).toBe(true);
  });

  it("only assigns first positional to input (additional positionals ignored)", () => {
    const a = parseArgs(["first.pdf", "second.pdf"]);
    expect(a.input).toBe("first.pdf");
  });
});

describe("import safety (no side effects on require)", () => {
  it("module can be imported without triggering main() — no process.exit, no IO", async () => {
    // If importing the module had triggered main(), one of: the test
    // suite would have exited early, or mkdirSync/writeFileSync side
    // effects would have landed somewhere observable. The fact that
    // we got here + ran the above tests is the invariant.
    expect(typeof routeFile).toBe("function");
    expect(typeof defaultOutputPath).toBe("function");
    expect(typeof parseArgs).toBe("function");
  });
});
