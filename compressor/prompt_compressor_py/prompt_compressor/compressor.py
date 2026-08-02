"""
Compression pipeline. Ported from compressor.rs and then reworked to
fix two specific problems the Rust version had:

1.  Duplicate lines weren't being removed as an explicit, deterministic
    step -- only implicitly, as a side effect of sentence-level exact
    matching. Repeated log/error/list lines could survive if they
    didn't line up exactly with how sentences got split.
    -> Added `_dedupe_lines()`: a line-granularity exact-dedup pass
       that runs before sentence construction, scoped to English
       regions only (code is never touched).

2.  The PageRank-style pruning dropped a flat bottom-30% of ALL
    sentences by graph centrality. Centrality is a popularity measure,
    not an importance measure -- a lone instruction ("fix the null
    check on line 40") can be poorly connected to everything else and
    get cut, while a low-information but well-connected filler
    sentence survives.
    -> Added a `protected` flag: sentences with questions, numbers,
       code-identifier overlap, list/step markers, or directive verbs
       are excluded from the droppable pool entirely. The 30% cut now
       only applies within the *unprotected* remainder, and only once
       there are enough sentences for that cut to be meaningful.
    -> Added an explicit "definitely filler" drop (near-zero entities,
       very short) so greetings/acks are always removed instead of
       hoping the graph gets them.

No AI/ML models are used anywhere -- just tokenization, stemming
(Snowball/Porter2, a fixed algorithm with no learned weights), TF-style
entity weighting, Jaccard similarity, and a textbook weighted PageRank.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple

import snowballstemmer

from .extractor import Document
from .grouping import group_sentences
from .lexer import Token, TokenFlags, TokenKind

STOPWORDS: Set[str] = {
    "a", "also", "an", "and", "any", "are", "because", "but", "could", "he",
    "help", "here's", "i", "i'd", "i'll", "i'm", "i've", "ideas", "is",
    "it's", "just", "know", "maybe", "mine", "my", "of", "our", "ours",
    "please", "probably", "really", "she", "so", "something's", "thanks",
    "that", "the", "they", "think", "this", "to", "was", "we", "we're",
    "were", "what's", "would", "you", "you're", "you've", "your", "yours",
}

# Words that signal an instruction/constraint/requirement rather than
# throwaway prose. A sentence containing one of these is protected from
# the graph-pruning cut, regardless of how well-connected it is.
DIRECTIVE_WORDS: Set[str] = {
    "must", "should", "need", "needs", "ensure", "make", "required",
    "requirement", "requirements", "add", "fix", "implement", "remove",
    "update", "replace", "important", "warning", "constraint", "note",
    "todo", "critical", "don't", "do not", "never", "always", "avoid",
    "keep", "preserve", "expect", "expected", "should", "cannot", "can't",
    "must not", "shouldn't",
}

# Sentences whose *entire* meaningful content is one of these (i.e. no
# real entities at all) are dropped outright -- these are the "hi",
# "thanks", "sounds good" style tokens that canonicalization's
# substring rules can miss because they're not fixed multi-word phrases.
FILLER_STANDALONE: Set[str] = {
    "hi", "hey", "hello", "yo", "ok", "okay", "sure", "cool", "great",
    "nice", "thanks", "thank", "cheers", "regards", "sincerely", "bye",
    "alright", "yep", "yeah", "yup", "got", "understood", "noted",
}

_stemmer_backend = snowballstemmer.stemmer("english")


def _stem(word: str) -> str:
    return _stemmer_backend.stemWord(word)


class PromptSize:
    TINY, SMALL, MEDIUM, LARGE, HUGE = range(5)


@dataclass
class PromptAnalysis:
    token_count: int
    code_ratio: float
    boilerplate_ratio: float
    compressibility: float
    size_category: int


@dataclass
class CompressionResult:
    original_tokens: int
    compressed_tokens: int
    compression_ratio: float
    theoretical_max_ratio: float


@dataclass
class Sentence:
    tokens: List[Token]
    entities: Dict[str, float] = field(default_factory=dict)
    score: float = 0.0
    keep: bool = True
    protected: bool = False


def analyze_prompt(doc: Document) -> PromptAnalysis:
    source = doc.original
    total_tokens = sum(
        1 for t in doc.tokens
        if t.kind != TokenKind.WHITESPACE and t.kind != TokenKind.NEWLINE
    )

    if total_tokens == 0:
        return PromptAnalysis(0, 0.0, 0.0, 0.0, PromptSize.TINY)

    boilerplate_tokens = 0
    for tok in doc.tokens:
        if tok.kind == TokenKind.WORD:
            if tok.text(source).lower() in STOPWORDS:
                boilerplate_tokens += 1

    code_bytes = sum(b.end - b.start for b in doc.blocks)
    code_ratio = code_bytes / max(len(doc.original), 1)
    boilerplate_ratio = boilerplate_tokens / total_tokens
    compressibility = max(0.0, min(1.0, boilerplate_ratio + code_ratio * 0.3))

    if total_tokens <= 20:
        size_category = PromptSize.TINY
    elif total_tokens <= 80:
        size_category = PromptSize.SMALL
    elif total_tokens <= 300:
        size_category = PromptSize.MEDIUM
    elif total_tokens <= 1000:
        size_category = PromptSize.LARGE
    else:
        size_category = PromptSize.HUGE

    return PromptAnalysis(total_tokens, code_ratio, boilerplate_ratio, compressibility, size_category)


# ---------------------------------------------------------------------
# Region partitioning (Code vs English) -- identical logic to Rust:
# code blocks the extractor found are NEVER touched by dedup/pruning.
# ---------------------------------------------------------------------

class Region:
    __slots__ = ("kind", "tokens")

    CODE = "code"
    ENGLISH = "english"

    def __init__(self, kind: str, tokens: List[Token]):
        self.kind = kind
        self.tokens = tokens


def partition_regions(doc: Document) -> List[Region]:
    regions: List[Region] = []
    current: List[Token] = []
    in_code = False
    block_idx = 0
    blocks = doc.blocks

    for tok in doc.tokens:
        while block_idx < len(blocks) and tok.start >= blocks[block_idx].end:
            block_idx += 1

        tok_in_code = (
            block_idx < len(blocks)
            and blocks[block_idx].start <= tok.start < blocks[block_idx].end
        )

        if tok_in_code != in_code:
            if current:
                regions.append(Region(Region.CODE if in_code else Region.ENGLISH, current))
                current = []
            in_code = tok_in_code
        current.append(tok)

    if current:
        regions.append(Region(Region.CODE if in_code else Region.ENGLISH, current))

    return regions


def extract_code_vocabulary(regions: List[Region], source: str) -> Set[str]:
    vocab: Set[str] = set()
    for region in regions:
        if region.kind == Region.CODE:
            for tok in region.tokens:
                if tok.kind == TokenKind.WORD:
                    text = tok.text(source).lower()
                    if len(text) > 2:
                        vocab.add(text)
    return vocab


# ---------------------------------------------------------------------
# Code minification -- strip comments, collapse whitespace runs and
# blank lines. Never reorders or drops actual code tokens.
# ---------------------------------------------------------------------

def minify_code(tokens: List[Token]) -> List[Token]:
    tokens = [t for t in tokens if t.kind != TokenKind.COMMENT]

    out: List[Token] = []
    consecutive_newlines = 0
    pending_space = False

    for tok in tokens:
        if tok.kind == TokenKind.NEWLINE:
            if consecutive_newlines < 1:
                out.append(tok)
                consecutive_newlines += 1
            pending_space = False
        elif tok.kind == TokenKind.WHITESPACE:
            pending_space = True
        else:
            if pending_space:
                out.append(Token(TokenKind.WHITESPACE, tok.start, tok.start, TokenFlags.SYNTHETIC))
                pending_space = False
            consecutive_newlines = 0
            out.append(tok)

    return out


# ---------------------------------------------------------------------
# Line-level exact dedup (NEW). Runs on an English region's token
# stream before sentences are built. Lines are delimited by NEWLINE
# tokens, same granularity a human would call "a line". A line is
# dropped only if its normalized (word/number/inline-code, lowercased)
# content exactly matches one already seen. Consecutive blank lines
# are also collapsed to at most one, mirroring what minify_code does
# for code.
# ---------------------------------------------------------------------

def _line_signature(line_tokens: List[Token], source: str) -> str:
    parts = [
        tok.text(source).lower()
        for tok in line_tokens
        if tok.kind in (TokenKind.WORD, TokenKind.NUMBER, TokenKind.INLINE_CODE)
    ]
    return " ".join(parts)


def dedupe_lines(tokens: List[Token], source: str) -> List[Token]:
    lines: List[List[Token]] = [[]]
    for tok in tokens:
        lines[-1].append(tok)
        if tok.kind == TokenKind.NEWLINE:
            lines.append([])

    seen: Set[str] = set()
    out: List[Token] = []
    prev_blank = False

    for line in lines:
        if not line:
            continue
        sig = _line_signature(line, source)
        is_blank = sig == ""

        if is_blank:
            if prev_blank:
                continue  # collapse runs of blank lines
            prev_blank = True
            out.extend(line)
            continue

        prev_blank = False
        if sig in seen:
            continue  # exact duplicate line -- drop it entirely
        seen.add(sig)
        out.extend(line)

    return out


# ---------------------------------------------------------------------
# Sentence construction (same boundaries as Rust: newline, or one of
# . ? ! ;) plus protection-flagging for the pruning pass.
# ---------------------------------------------------------------------

_LIST_MARKER_RE = None  # compiled lazily to avoid import cost if unused


def _looks_like_list_item(text_stripped: str) -> bool:
    import re
    global _LIST_MARKER_RE
    if _LIST_MARKER_RE is None:
        _LIST_MARKER_RE = re.compile(r'^(\d+[\.\)]|[-*•])\s')
    return bool(_LIST_MARKER_RE.match(text_stripped))


def build_sentences(tokens: List[Token], source: str, code_vocab: Set[str]) -> List[Sentence]:
    sentences: List[Sentence] = []
    current_tokens: List[Token] = []
    current_entities: Dict[str, float] = {}
    has_directive = False
    has_number = False
    has_question = False

    def flush():
        nonlocal current_tokens, current_entities, has_directive, has_number, has_question
        meaningful = any(
            t.kind != TokenKind.WHITESPACE and t.kind != TokenKind.NEWLINE
            for t in current_tokens
        )
        if meaningful:
            text_stripped = "".join(
                t.text(source) for t in current_tokens
            ).strip()
            has_code_vocab_hit = any(e in code_vocab for e in current_entities)
            protected = (
                has_directive
                or has_number
                or has_question
                or _looks_like_list_item(text_stripped)
                or has_code_vocab_hit
            )
            sentences.append(Sentence(
                tokens=current_tokens,
                entities=current_entities,
                keep=True,
                protected=protected,
            ))
        current_tokens = []
        current_entities = {}
        has_directive = False
        has_number = False
        has_question = False

    for tok in tokens:
        current_tokens.append(tok)

        if tok.kind in (TokenKind.WORD, TokenKind.INLINE_CODE):
            raw_text = tok.text(source).strip(".,;:!?'\"()[]{}")
            if len(raw_text) > 1 and raw_text.lower() not in STOPWORDS:
                lower = raw_text.lower()
                stemmed = _stem(lower)

                if lower in DIRECTIVE_WORDS or stemmed in DIRECTIVE_WORDS:
                    has_directive = True

                weight = 1.0
                if tok.flags & TokenFlags.ALL_CAPS:
                    weight += 3.0
                elif tok.flags & TokenFlags.CAPITALIZED:
                    weight += 2.0
                if tok.flags & TokenFlags.HAS_NUMBERS:
                    weight += 1.0
                    has_number = True
                if tok.kind == TokenKind.INLINE_CODE:
                    weight += 5.0

                if lower in code_vocab or stemmed in code_vocab:
                    weight += 6.0

                current_entities[stemmed] = current_entities.get(stemmed, 0.0) + weight

        if tok.kind == TokenKind.NUMBER:
            has_number = True

        is_boundary = False
        if tok.kind == TokenKind.NEWLINE:
            is_boundary = True
        elif tok.kind == TokenKind.PUNCTUATION:
            t = tok.text(source)
            is_boundary = t in (".", "?", "!", ";")
            if t == "?":
                has_question = True

        if is_boundary:
            flush()

    flush()
    return sentences


def _sentence_is_bare_filler(sentence: Sentence, source: str) -> bool:
    """No real entities at all, and short -- a leftover greeting/ack
    that canonicalization's phrase rules didn't happen to cover."""
    if sentence.protected:
        return False
    word_tokens = [t for t in sentence.tokens if t.kind == TokenKind.WORD]
    if len(word_tokens) > 4:
        return False
    if not word_tokens:
        return True
    for t in word_tokens:
        w = t.text(source).lower().strip(".,;:!?'\"")
        if w and w not in STOPWORDS and w not in FILLER_STANDALONE:
            return False
    return True


def compute_jaccard_similarity(a: Dict[str, float], b: Dict[str, float]) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    all_keys = set(a) | set(b)
    intersection = 0.0
    union = 0.0
    for k in all_keys:
        va = a.get(k, 0.0)
        vb = b.get(k, 0.0)
        intersection += min(va, vb)
        union += max(va, vb)
    return intersection / union if union != 0.0 else 0.0


# How many recently-kept sentences a candidate is compared against for
# near-duplicate detection. >1 (the Rust version only checked the
# immediately previous sentence) so near-duplicates separated by one
# unrelated line still get caught.
_DEDUPE_WINDOW = 4
_DEDUPE_SIMILARITY_THRESHOLD = 0.55


def deduplicate_sentences(sentences: List[Sentence], source: str) -> None:
    seen_normalized: Set[str] = set()
    recent_kept: List[Dict[str, float]] = []

    for sentence in sentences:
        normalized = " ".join(
            t.text(source).lower()
            for t in sentence.tokens
            if t.kind in (TokenKind.WORD, TokenKind.NUMBER, TokenKind.INLINE_CODE)
        )
        if not normalized:
            continue

        if normalized in seen_normalized:
            sentence.keep = False
            continue
        seen_normalized.add(normalized)

        if not sentence.protected:
            for prev_entities in reversed(recent_kept):
                if compute_jaccard_similarity(sentence.entities, prev_entities) > _DEDUPE_SIMILARITY_THRESHOLD:
                    sentence.keep = False
                    break

        if sentence.keep:
            recent_kept.append(sentence.entities)
            if len(recent_kept) > _DEDUPE_WINDOW:
                recent_kept.pop(0)


def compute_weighted_pagerank(adj: List[List[float]], iterations: int = 20, damping: float = 0.85) -> List[float]:
    n = len(adj)
    if n == 0:
        return []

    ranks = [1.0 / n] * n
    base_score = (1.0 - damping) / n
    out_degree_sums = [sum(row) for row in adj]

    for _ in range(iterations):
        next_ranks = [base_score] * n
        for i in range(n):
            out_sum = out_degree_sums[i]
            if out_sum == 0.0:
                share = (ranks[i] * damping) / n
                for j in range(n):
                    next_ranks[j] += share
            else:
                row = adj[i]
                for j in range(n):
                    w = row[j]
                    if w > 0.0:
                        next_ranks[j] += damping * ranks[i] * (w / out_sum)
        ranks = next_ranks

    return ranks


# Only worth running the graph-prune pass once there are enough
# sentences for "bottom 30%" to be a meaningful, safe cut rather than
# noise on 4-5 sentences.
_MIN_SENTENCES_FOR_PRUNING = 6
_PRUNE_FRACTION = 0.30


def serialize_tokens(tokens: List[Token], source: str) -> Tuple[str, int]:
    out: List[str] = []
    count = 0
    last_was_space = False

    for tok in tokens:
        if tok.flags & TokenFlags.SYNTHETIC:
            if tok.kind == TokenKind.NEWLINE:
                out.append("\n")
                last_was_space = True
            else:
                if not last_was_space:
                    out.append(" ")
                    last_was_space = True
        else:
            is_space = tok.kind in (TokenKind.WHITESPACE, TokenKind.NEWLINE)
            if is_space:
                if not last_was_space:
                    out.append("\n" if tok.kind == TokenKind.NEWLINE else " ")
                    last_was_space = True
            else:
                out.append(tok.text(source))
                count += 1
                last_was_space = False

    return "".join(out), count


def process_english_region(tokens: List[Token], source: str, code_vocab: Set[str]) -> str:
    # 1. Explicit duplicate-line removal, scoped to this region only,
    #    before anything else touches the text.
    tokens = dedupe_lines(tokens, source)

    # 2. Build sentences (with protection flags) from the deduped stream.
    sentences = build_sentences(tokens, source, code_vocab)

    # 3. Drop bare filler ("hi", "thanks", "ok") outright -- these have
    #    no entities and no protection signal, so the graph would treat
    #    them as arbitrary low-degree nodes rather than reliably cutting
    #    them.
    for s in sentences:
        if _sentence_is_bare_filler(s, source):
            s.keep = False

    # 4. Exact + near-duplicate sentence removal.
    deduplicate_sentences(sentences, source)

    sentences = [s for s in sentences if s.keep]

    # 5. Information grouping -- merge runs of structurally similar
    #    consecutive sentences ("Some people wrote X.", "Some people
    #    pasted Y.", ...) into one sentence before the graph ever sees
    #    them. This is a distinct concern from dedup: these sentences
    #    are NOT duplicates of each other (they carry different facts),
    #    they just share a repeated frame that's wasteful to repeat
    #    verbatim. Everything downstream (the graph, pruning, final
    #    join) now operates on GroupedItem instead of Sentence -- a
    #    passthrough (ungrouped) sentence and a merged one look the
    #    same from here on.
    items = group_sentences(sentences, lambda toks: serialize_tokens(toks, source))

    n = len(items)
    if n <= 2:
        return " ".join(it.text for it in items)

    # 6. Weighted co-occurrence graph + PageRank, same as before.
    adj = [[0.0] * n for _ in range(n)]
    for i in range(n):
        ent_i = items[i].entities
        for j in range(i + 1, n):
            ent_j = items[j].entities
            edge_weight = 0.0
            for entity, weight_i in ent_i.items():
                weight_j = ent_j.get(entity)
                if weight_j is not None:
                    edge_weight += weight_i * weight_j
            if edge_weight > 0.0:
                adj[i][j] = edge_weight
                adj[j][i] = edge_weight

    ranks = compute_weighted_pagerank(adj, 20, 0.85)
    for i, item in enumerate(items):
        item.score = ranks[i]

    # 7. Prune, but ONLY from the unprotected pool, and only if that
    #    pool is large enough for a 30% cut to be a real signal rather
    #    than noise. Protected items (directives, numbers, questions,
    #    list/step items, code-identifier references, or anything that
    #    came out of the grouping pass) are never candidates for
    #    removal here -- duplicates of them were already handled in
    #    step 4.
    droppable = [i for i in range(n) if not items[i].protected]
    if len(droppable) >= _MIN_SENTENCES_FOR_PRUNING:
        droppable.sort(key=lambda i: items[i].score)
        drop_count = int(len(droppable) * _PRUNE_FRACTION)
        for idx in droppable[:drop_count]:
            items[idx].keep = False

    out_parts = [it.text.strip() for it in items if it.keep]
    return " ".join(out_parts)


def compress_prompt(doc: Document) -> Tuple[str, CompressionResult]:
    analysis = analyze_prompt(doc)
    source = doc.original

    regions = partition_regions(doc)
    code_vocab = extract_code_vocabulary(regions, source)

    final_parts: List[str] = []
    final_tokens = 0

    for region in regions:
        if region.kind == Region.CODE:
            minified = minify_code(region.tokens)
            text, count = serialize_tokens(minified, source)
            final_parts.append(text)
            final_tokens += count
        else:
            if analysis.size_category == PromptSize.TINY:
                text, count = serialize_tokens(region.tokens, source)
                final_parts.append(text)
                final_tokens += count
                continue

            compressed_english = process_english_region(region.tokens, source, code_vocab)
            count = len(compressed_english.split())
            final_parts.append(compressed_english)
            final_parts.append("\n")
            final_tokens += count

    compressed_text = "".join(final_parts).strip()

    if analysis.token_count > 0:
        compression_ratio = max(0, analysis.token_count - final_tokens) / analysis.token_count
    else:
        compression_ratio = 0.0

    result = CompressionResult(
        original_tokens=analysis.token_count,
        compressed_tokens=final_tokens,
        compression_ratio=compression_ratio,
        theoretical_max_ratio=analysis.compressibility,
    )
    return compressed_text, result
