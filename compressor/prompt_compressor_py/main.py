#!/usr/bin/env python3
"""
Prompt Compressor CLI (Python port).

Usage:
    python3 main.py input.txt output.json
    python3 main.py input.txt output.json --stats
"""

from __future__ import annotations

import argparse
import json
import sys

from prompt_compressor.memcap import set_memory_limit, DEFAULT_LIMIT_MB
from prompt_compressor import canonical
from prompt_compressor.extractor import Document
from prompt_compressor.compressor import compress_prompt


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="prompt_compressor",
        description="Prompt Compressor CLI",
    )
    parser.add_argument("input", help="Input prompt file (.txt/.md)")
    parser.add_argument("output", help="Output json file")
    parser.add_argument(
        "--stats", action="store_true",
        help="Include compression stats (ratio, token counts) in the output JSON",
    )
    parser.add_argument(
        "--memory-limit-mb", type=int, default=DEFAULT_LIMIT_MB,
        help=f"Hard memory cap in MB (default: {DEFAULT_LIMIT_MB})",
    )
    args = parser.parse_args()

    applied = set_memory_limit(args.memory_limit_mb)
    if not applied:
        print(
            f"warning: could not enforce {args.memory_limit_mb}MB memory cap on this platform",
            file=sys.stderr,
        )

    try:
        with open(args.input, "r", encoding="utf-8") as f:
            raw_input = f.read()
    except OSError as e:
        print(f"Failed to read '{args.input}': {e}", file=sys.stderr)
        sys.exit(1)

    try:
        normalized = canonical.canonicalize(raw_input)
        doc = Document.analyze(normalized)
        compressed_prompt, result = compress_prompt(doc)
    except MemoryError:
        print(f"error: exceeded {args.memory_limit_mb}MB memory cap while processing input", file=sys.stderr)
        sys.exit(1)

    output = {"prompt": compressed_prompt}
    if args.stats:
        output["stats"] = {
            "original_tokens": result.original_tokens,
            "compressed_tokens": result.compressed_tokens,
            "compression_ratio": round(result.compression_ratio, 4),
            "theoretical_max_ratio": round(result.theoretical_max_ratio, 4),
        }

    try:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)
    except OSError as e:
        print(f"Failed to write '{args.output}': {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
