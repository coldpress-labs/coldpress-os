#!/usr/bin/env python3
"""docling_adapter.py — accurate-path adapter for parse-document.

Reads a single input path from argv[1], converts via IBM Docling, and
writes the resulting markdown to stdout. Exits 0 on success, non-zero
with a diagnostic on stderr on failure.

Invoked by `scripts/parse.mjs`. Not intended to be run interactively.

Requirements:
    pip install docling
Python >= 3.10. First-run downloads ML models (up to ~1GB).
"""

from __future__ import annotations
import sys
import traceback


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: docling_adapter.py <input-path>", file=sys.stderr)
        return 2

    input_path = sys.argv[1]

    try:
        from docling.document_converter import DocumentConverter
    except ImportError as e:
        print(
            f"docling not installed: {e}\n"
            "  install with: pip install docling\n"
            "  (first run downloads ML models, up to 1GB — one-time)",
            file=sys.stderr,
        )
        return 3

    try:
        converter = DocumentConverter()
        result = converter.convert(input_path)
    except FileNotFoundError:
        print(f"input file not found: {input_path}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"docling failed to convert {input_path}: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return 1

    # Docling's ConversionResult exposes .document.export_to_markdown().
    try:
        markdown = result.document.export_to_markdown()
    except AttributeError:
        # API shape change tolerance — fall back to string coercion.
        markdown = str(result)

    sys.stdout.write(markdown)
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
