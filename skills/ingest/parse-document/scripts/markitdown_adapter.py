#!/usr/bin/env python3
"""markitdown_adapter.py — fast-path adapter for parse-document.

Reads a single input path from argv[1], converts via `markitdown`, and
writes the resulting markdown to stdout. Exits 0 on success, non-zero
with a diagnostic on stderr on failure.

Invoked by `scripts/parse.mjs`. Not intended to be run interactively.

Requirements:
    pip install markitdown
Python >= 3.10.
"""

from __future__ import annotations
import sys
import traceback


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: markitdown_adapter.py <input-path>", file=sys.stderr)
        return 2

    input_path = sys.argv[1]

    try:
        from markitdown import MarkItDown
    except ImportError as e:
        print(
            f"markitdown not installed: {e}\n"
            "  install with: pip install markitdown",
            file=sys.stderr,
        )
        return 3

    try:
        md = MarkItDown()
        result = md.convert(input_path)
    except FileNotFoundError:
        print(f"input file not found: {input_path}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"markitdown failed to convert {input_path}: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return 1

    text = getattr(result, "text_content", None) or str(result)
    sys.stdout.write(text)
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
