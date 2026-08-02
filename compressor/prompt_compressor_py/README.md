# prompt_compressor (Python port)

Pure-Python port of the Rust `prompt_compressor` crate. No AI/ML models
anywhere — tokenization, regex, Snowball/Porter2 stemming (a fixed
algorithm, not learned), TF-style entity weighting, Jaccard similarity,
and textbook weighted PageRank. Peak memory on a 550KB / 80k-token
stress input was ~45MB; a hard 512MB ceiling is enforced via
`RLIMIT_AS` regardless.

## Run it

```bash
pip install snowballstemmer          # only external dependency
python3 main.py input.txt output.json --stats
```

`output.json` → `{"prompt": "...", "stats": {...}}` (stats only with `--stats`).

## Layout

- `prompt_compressor/lexer.py` — tokenizer (port of `lexer.rs`)
- `prompt_compressor/canonical.py` — boilerplate phrase stripping (port of `canonical.rs`, + a few new rules/line-anchored greeting patterns)
- `prompt_compressor/extractor.py` — code-vs-English line scoring + block detection (port of `extractor.rs`)
- `prompt_compressor/compressor.py` — the actual compression pipeline (reworked, see below)
- `prompt_compressor/memcap.py` — 512MB hard cap via `RLIMIT_AS`
- `main.py` — CLI

## What changed vs. the Rust version, and why

You flagged two problems: no explicit duplicate-line removal, and the
graph-based pruning eating important content while leaving filler like
"hi" behind. Both come from the same root cause — the old pipeline had
exactly one filter (PageRank centrality) doing two jobs it wasn't
suited for (remove duplicates, remove unimportant content). Centrality
measures how well-connected a sentence is to others, not how important
it is standalone — a lone instruction has few connections and can lose
to a repetitive-but-central filler line. Splitting this into explicit,
purpose-built stages fixes both:

1. **`dedupe_lines()`** — new. Runs on each English region before
   anything else touches it. Drops a line outright if its normalized
   (word/number/inline-code, lowercased) content exactly matches a line
   already seen; collapses runs of blank lines to one. Code regions are
   never touched by this — dedup only ever runs on the English side of
   the code/English partition.

2. **Bare-filler drop** — new. A sentence with zero real entities and
   ≤4 word tokens (the "hi" / "thanks" / "sounds good" tier) is dropped
   unconditionally rather than left for canonicalization's fixed phrase
   list or the graph to maybe catch.

3. **Protected sentences** — new. A sentence is now flagged `protected`
   — and therefore *never* eligible for the graph-pruning cut — if it:
   - contains a question mark
   - contains a number
   - looks like a list/step item (`1.`, `2)`, `-`, `*`)
   - contains a directive word (must/should/ensure/fix/add/required/...)
   - references an identifier that also appears in a code region
     (i.e. the prompt is talking about actual code, not prose about it)

   The old flat "drop bottom 30% of everything" only runs now if the
   *unprotected* pool has ≥6 sentences, and only cuts within that pool.
   Exact/near-duplicates of a protected sentence are still removed
   (step 1/4) — protection means "don't cut this for being
   unpopular", not "never touch it if it's literally repeated."

4. **Wider near-duplicate window** — the old Jaccard check only
   compared a sentence to the one immediately before it, so two
   near-identical lines separated by one unrelated line survived both.
   Now compares against the last 4 kept sentences.

On a synthetic worst-case (20k near-duplicate log lines + one buried
"critical requirement" sentence + a code block), the port gets
99.7% compression, in ~2s, ~45MB peak RSS, and keeps the requirement
sentence, the code, and all distinct log identities intact.
