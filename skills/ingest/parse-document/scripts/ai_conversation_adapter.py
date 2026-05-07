#!/usr/bin/env python3
"""ai_conversation_adapter.py — AI conversation export adapter for parse-document.

Converts ChatGPT / Claude / generic AI conversation exports into
turn-preserving markdown. Reads a single input path from argv[1] and
writes markdown to stdout.

Supported inputs:
    - JSON with a top-level `messages` array (OpenAI / ChatGPT export shape)
    - JSON as a top-level array of messages (alternate OpenAI shape)
    - Anthropic / Claude export shape where each message `content` is a
      list of blocks with `type: text | tool_use | tool_result`
    - Markdown with `### User` / `### Assistant` (or `## User`, `Human:`,
      `Claude:`, `ChatGPT:`) speaker headings

Invoked by scripts/parse.mjs after sniffAiConversation() matches.
Uses only the Python stdlib — no third-party deps.

Requirements:
    Python >= 3.10.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


# ─── Heuristic header regexes (markdown path) ────────────────────────
USER_HEADER_RE = re.compile(
    r"^\s*(?:###?|##)\s+(User|Human|You|ChatGPT user|Claude user)\b.*$",
    re.IGNORECASE,
)
ASSISTANT_HEADER_RE = re.compile(
    r"^\s*(?:###?|##)\s+(Assistant|ChatGPT|Claude|Bot|AI)\b.*$",
    re.IGNORECASE,
)


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: ai_conversation_adapter.py <input-path>", file=sys.stderr)
        return 2

    input_path = Path(sys.argv[1])
    if not input_path.exists():
        print(f"input file not found: {input_path}", file=sys.stderr)
        return 1

    try:
        raw = input_path.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"failed to read {input_path}: {exc}", file=sys.stderr)
        return 1

    ext = input_path.suffix.lower()
    try:
        if ext == ".json":
            markdown = _render_json_conversation(raw, source_name=input_path.name)
        elif ext in (".md", ".markdown"):
            markdown = _render_markdown_conversation(raw, source_name=input_path.name)
        else:
            print(
                f"unsupported extension for ai_conversation adapter: {ext}",
                file=sys.stderr,
            )
            return 1
    except Exception as exc:
        print(f"failed to render conversation: {exc}", file=sys.stderr)
        return 1

    sys.stdout.write(markdown)
    sys.stdout.flush()
    return 0


# ─── JSON rendering ──────────────────────────────────────────────────


def _render_json_conversation(raw: str, *, source_name: str) -> str:
    data = json.loads(raw)
    messages = _extract_messages(data)
    if not messages:
        raise ValueError("no messages[] array found in JSON input")

    lines = [f"# AI Conversation — {source_name}", ""]
    turn = 0
    for msg in messages:
        role = _normalise_role(msg.get("role"))
        if role is None:
            continue
        turn += 1
        lines.append(f"## Turn {turn} — {role}")
        lines.append("")
        lines.append(_render_content(msg.get("content")))
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def _extract_messages(data: object) -> list[dict]:
    if isinstance(data, list):
        return [m for m in data if isinstance(m, dict)]
    if isinstance(data, dict):
        messages = data.get("messages")
        if isinstance(messages, list):
            return [m for m in messages if isinstance(m, dict)]
    return []


def _normalise_role(role: object) -> str | None:
    if not isinstance(role, str):
        return None
    r = role.strip().lower()
    if r in ("user", "human"):
        return "User"
    if r in ("assistant", "ai", "bot", "claude", "chatgpt"):
        return "Assistant"
    if r in ("system", "developer"):
        return "System"
    if r == "tool":
        return "Tool"
    return role.capitalize()


def _render_content(content: object) -> str:
    if content is None:
        return "_(empty)_"
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        blocks: list[str] = []
        for block in content:
            if not isinstance(block, dict):
                blocks.append(str(block))
                continue
            btype = block.get("type")
            if btype == "text":
                text = block.get("text", "")
                blocks.append(text.strip() if isinstance(text, str) else str(text))
            elif btype == "tool_use":
                name = block.get("name", "unknown-tool")
                tool_input = block.get("input", {})
                pretty = json.dumps(tool_input, indent=2, ensure_ascii=False)
                blocks.append(f"### Tool use: `{name}`\n\n```json\n{pretty}\n```")
            elif btype == "tool_result":
                inner = block.get("content", "")
                rendered = _render_content(inner)
                blocks.append(f"### Tool result\n\n```\n{rendered}\n```")
            elif btype == "image":
                source = block.get("source", {})
                media_type = source.get("media_type", "image/unknown") if isinstance(source, dict) else "image"
                blocks.append(f"_[image — {media_type}]_")
            else:
                pretty = json.dumps(block, indent=2, ensure_ascii=False)
                blocks.append(f"### Unknown block (`{btype}`)\n\n```json\n{pretty}\n```")
        return "\n\n".join(b for b in blocks if b)
    # Fallback for unexpected shapes — preserve rather than drop.
    return json.dumps(content, indent=2, ensure_ascii=False)


# ─── Markdown rendering ──────────────────────────────────────────────


def _render_markdown_conversation(raw: str, *, source_name: str) -> str:
    lines = raw.splitlines()
    turns: list[tuple[str, list[str]]] = []
    current_role: str | None = None
    current_body: list[str] = []

    def flush() -> None:
        if current_role is not None:
            turns.append((current_role, [*current_body]))

    for line in lines:
        user_match = USER_HEADER_RE.match(line)
        asst_match = ASSISTANT_HEADER_RE.match(line)
        if user_match:
            flush()
            current_role = "User"
            current_body = []
            continue
        if asst_match:
            flush()
            current_role = "Assistant"
            current_body = []
            continue
        if current_role is None:
            # Pre-amble before the first speaker; preserve as frontmatter-ish
            # context only if non-blank.
            continue
        current_body.append(line)

    flush()

    if not turns:
        raise ValueError("no speaker headings (User/Assistant) found in markdown input")

    out: list[str] = [f"# AI Conversation — {source_name}", ""]
    for idx, (role, body) in enumerate(turns, start=1):
        body_text = "\n".join(body).strip()
        out.append(f"## Turn {idx} — {role}")
        out.append("")
        out.append(body_text if body_text else "_(empty)_")
        out.append("")
    return "\n".join(out).rstrip() + "\n"


if __name__ == "__main__":
    sys.exit(main())
