

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Sequence, Tuple, TYPE_CHECKING

if TYPE_CHECKING:
    # Only for type hints. grouping.py does not import compressor.py at
    # runtime -- compressor.py imports group_sentences from *here*, so
    # importing compressor.Sentence back would be circular. Instead
    # this module duck-types on the four attributes it needs (see
    # _SentenceLike below) and never touches Token byte offsets.
    from .lexer import Token

# Minimum number of consecutive sentences that must share a frame
# before it's worth rewriting them as one merged sentence. Below this
# the ": ... , ..." punctuation overhead isn't worth paying.
_MIN_RUN = 3

_TOKEN_RE = re.compile(r"\d+\.\d+|[A-Za-z0-9][A-Za-z0-9'\-]*|[^\sA-Za-z0-9]")


@dataclass
class GroupedItem:
    """One output unit after grouping -- either a single ungrouped
    sentence passed through unchanged, or several sentences merged
    into one. Downstream code (the sentence graph / pruning stage in
    compressor.py) treats every item the same way and doesn't need to
    know which case it's looking at."""

    text: str
    entities: Dict[str, float] = field(default_factory=dict)
    protected: bool = False
    keep: bool = True
    score: float = 0.0
    is_group: bool = False
    member_count: int = 1


class _SentenceLike:
    """Minimal shape grouping.py needs from compressor.Sentence. Duck
    typed on purpose -- any object with these attributes works, so
    this module never has to import compressor.py."""

    tokens: Sequence["Token"]
    entities: Dict[str, float]
    protected: bool
    keep: bool


# ---------------------------------------------------------------------
# Tokenization + longest common prefix/suffix over word lists.
# ---------------------------------------------------------------------

def _words(text: str) -> List[str]:
    return _TOKEN_RE.findall(text)


def _is_word(tok: str) -> bool:
    return bool(tok) and tok[0].isalnum()


def _alnum_count(tokens: Sequence[str]) -> int:
    return sum(1 for t in tokens if _is_word(t))


def _common_prefix_len(token_lists: Sequence[List[str]]) -> int:
    min_len = min(len(t) for t in token_lists)
    i = 0
    while i < min_len:
        w = token_lists[0][i].lower()
        if any(tl[i].lower() != w for tl in token_lists[1:]):
            break
        i += 1
    return i


def _common_suffix_len(token_lists: Sequence[List[str]], cap: int) -> int:
    if cap <= 0:
        return 0
    i = 0
    while i < cap:
        w = token_lists[0][-1 - i].lower()
        if any(tl[-1 - i].lower() != w for tl in token_lists[1:]):
            break
        i += 1
    return i


def _join_tokens(tokens: Sequence[str]) -> str:
    out: List[str] = []
    for t in tokens:
        if not t:
            continue
        if out and _is_word(t):
            out.append(" " + t)
        else:
            out.append(t)
    return "".join(out)


# ---------------------------------------------------------------------
# Run detection: greedily grow a window from each start index as long
# as the whole window still shares an informative prefix/suffix.
# ---------------------------------------------------------------------

def _run_signature(window: List[List[str]]) -> Optional[Tuple[int, int]]:
    """If `window` (all sentences from the candidate run) shares an
    informative common prefix and/or suffix, return (prefix_len,
    suffix_len). Otherwise None."""
    min_len = min(len(t) for t in window)
    if min_len < 2:
        return None
    p = _common_prefix_len(window)
    s = _common_suffix_len(window, min_len - p)
    has_middle = all(len(t) - p - s >= 1 for t in window)
    if not has_middle:
        return None
    prefix_words = _alnum_count(window[0][:p]) if p else 0
    suffix_words = _alnum_count(window[0][len(window[0]) - s:]) if s else 0
    # A shared leading word is enough on its own ("Some people ...").
    # A shared trailing phrase needs to be at least 2 real words, since
    # a single shared trailing word is almost always just the final
    # "." token and carries no information.
    if prefix_words >= 1 or suffix_words >= 2:
        return (p, s)
    return None


def _find_runs(token_lists: List[List[str]]) -> List[Tuple[int, int, int, int]]:
    """Returns (start, end, prefix_len, suffix_len) for each qualifying
    run, inclusive indices, scanned left to right and non-overlapping."""
    n = len(token_lists)
    runs: List[Tuple[int, int, int, int]] = []
    i = 0
    while i < n:
        best: Optional[Tuple[int, int, int]] = None  # (end, prefix, suffix)
        j = i + 1
        while j < n:
            window = token_lists[i:j + 1]
            sig = _run_signature(window)
            if sig is None:
                break
            best = (j, sig[0], sig[1])
            j += 1
        if best is not None and best[0] - i + 1 >= _MIN_RUN:
            runs.append((i, best[0], best[1], best[2]))
            i = best[0] + 1
        else:
            i += 1
    return runs


# ---------------------------------------------------------------------
# Rendering a run back into a single merged sentence.
# ---------------------------------------------------------------------

def _render_run(token_lists: List[List[str]], start: int, end: int,
                 prefix_len: int, suffix_len: int) -> str:
    toks0 = token_lists[start]
    prefix_tokens = toks0[:prefix_len]
    suffix_tokens = toks0[len(toks0) - suffix_len:] if suffix_len else []

    middles: List[str] = []
    for k in range(start, end + 1):
        toks = token_lists[k]
        mid_end = len(toks) - suffix_len if suffix_len else len(toks)
        mid = toks[prefix_len:mid_end]
        rendered = _join_tokens(mid).strip(" ,;")
        if rendered:
            middles.append(rendered)

    prefix_str = _join_tokens(prefix_tokens).strip(" ,;:.")
    suffix_str = _join_tokens(suffix_tokens).strip(" ,;:.")
    body = ", ".join(middles)

    text = f"{prefix_str}: {body}" if prefix_str else body
    if suffix_str:
        text = f"{text} {suffix_str}."
    elif not text.endswith("."):
        text += "."
    return text


# ---------------------------------------------------------------------
# Public entry point.
# ---------------------------------------------------------------------

def group_sentences(
    items: Sequence[_SentenceLike],
    serialize_fn: Callable[[Sequence["Token"]], Tuple[str, int]],
) -> List[GroupedItem]:
    """Detect runs of structurally similar consecutive sentences and
    merge each run into one GroupedItem. Sentences that don't belong
    to any qualifying run pass through unchanged (still wrapped in a
    GroupedItem so downstream code has one uniform type to work with).

    `serialize_fn` renders a sentence's tokens back to text -- callers
    pass `compressor.serialize_tokens` bound to the source string.
    grouping.py never touches Token byte offsets directly, since a
    merged sentence's text no longer corresponds to any single span of
    the original source text.

    Merged items are always marked `protected`: they're already a
    compression product, and letting the graph-pruning pass cut a
    frame that's summarizing several distinct facts at once would risk
    losing more than pruning a single sentence would.
    """
    n = len(items)
    if n == 0:
        return []

    texts: List[str] = [serialize_fn(it.tokens)[0].strip() for it in items]
    token_lists = [_words(t) for t in texts]
    runs = _find_runs(token_lists)
    run_at_start = {r[0]: r for r in runs}

    out: List[GroupedItem] = []
    i = 0
    while i < n:
        run = run_at_start.get(i)
        if run is not None:
            _, end, p, s = run
            merged_text = _render_run(token_lists, i, end, p, s)
            merged_entities: Dict[str, float] = {}
            for k in range(i, end + 1):
                for ent, w in items[k].entities.items():
                    merged_entities[ent] = merged_entities.get(ent, 0.0) + w
            out.append(GroupedItem(
                text=merged_text,
                entities=merged_entities,
                protected=True,
                keep=True,
                is_group=True,
                member_count=end - i + 1,
            ))
            i = end + 1
        else:
            it = items[i]
            out.append(GroupedItem(
                text=texts[i],
                entities=dict(it.entities),
                protected=it.protected,
                keep=True,
                is_group=False,
                member_count=1,
            ))
            i += 1

    return out
