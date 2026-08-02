"""
Direct port of extractor.rs: scores each line as code-like vs
English-like from lexer output, then runs a small state machine over
the smoothed scores to find contiguous code blocks.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from .lexer import Lexer, Token, TokenFlags, TokenKind

LANG_KEYWORDS = frozenset([
    "fn", "let", "impl", "struct", "trait", "pub", "mod", "mut", "enum",
    "match", "async", "await", "unwrap", "def", "elif", "except", "import",
    "namespace", "const", "static", "void", "lambda", "yield",
    "println", "printf", "endl", "nullptr", "none", "true", "false",
])

DOC_WORDS = frozenset([
    "function", "class", "variable", "method", "loop", "code", "error",
    "bug", "issue", "script", "program", "file", "example", "snippet",
    "output", "result", "following",
])

ENGLISH_STOPWORDS = frozenset([
    "i", "i'm", "i've", "i'll", "i'd", "you", "you're", "you've", "your",
    "yours", "my", "mine", "our", "ours", "we", "we're", "they", "he",
    "she", "it's", "the", "that", "this", "because", "should", "would",
    "could", "please", "here's", "what's", "something's", "is", "are",
    "was", "were", "a", "an", "of", "to", "and", "but", "so", "just",
    "really", "think", "know", "maybe", "probably", "also", "any",
    "ideas", "what", "how", "why", "when", "who", "can", "help", "thanks",
])


@dataclass
class LineFeatures:
    start: int = 0
    end: int = 0
    is_blank: bool = True
    indent_chars: int = 0
    total_tokens: int = 0
    word_tokens: int = 0
    symbol_tokens: int = 0
    lang_keyword_hits: int = 0
    doc_word_hits: int = 0
    stopword_hits: int = 0
    camel_or_snake: int = 0
    has_numbers: bool = False
    ends_with_symbol: bool = False
    ends_with_question: bool = False
    avg_word_len: float = 0.0
    is_explicit_code: bool = False


def is_camel_or_snake(word: str) -> bool:
    has_underscore = "_" in word and len(word) > 1
    has_inner_upper = any(c.isupper() for c in word[1:]) and (word[:1].islower())
    return has_underscore or has_inner_upper


def code_score(f: LineFeatures) -> float:
    if f.is_explicit_code:
        return 1.0
    total = max(f.total_tokens, 1)
    words = max(f.word_tokens, 1)

    s = 0.0
    s += (f.symbol_tokens / total) * 1.2
    s += min(f.lang_keyword_hits / words, 1.0) * 0.6
    s += min(f.camel_or_snake / words, 1.0) * 0.4
    s += 0.15 if f.indent_chars >= 2 else 0.0
    s += 0.15 if f.ends_with_symbol else 0.0
    s += 0.05 if f.has_numbers else 0.0
    return max(0.0, min(1.0, s))


def english_score(f: LineFeatures) -> float:
    words = max(f.word_tokens, 1)

    s = 0.0
    s += min(f.stopword_hits / words, 1.0) * 1.1
    s += min(f.doc_word_hits / words, 1.0) * 0.5
    s += 0.35 if f.ends_with_question else 0.0
    s += max(f.avg_word_len - 4.0, 0.0) * 0.08
    return max(0.0, min(1.0, s))


def line_score(f: LineFeatures) -> float:
    if f.is_blank:
        return math.nan
    return max(0.0, min(1.0, code_score(f) - english_score(f)))


def extract_line_features(text: str, tokens: List[Token]) -> List[LineFeatures]:
    line_ranges: List[Tuple[int, int]] = []
    line_start = 0
    for i, ch in enumerate(text):
        if ch == '\n':
            line_ranges.append((line_start, i + 1))
            line_start = i + 1
    if line_start < len(text):
        line_ranges.append((line_start, len(text)))
    if not line_ranges:
        line_ranges.append((0, len(text)))

    lines = [LineFeatures(start=s, end=e) for (s, e) in line_ranges]

    line_idx = 0
    for tok in tokens:
        while line_idx + 1 < len(line_ranges) and tok.start >= line_ranges[line_idx][1]:
            line_idx += 1
        lf = lines[line_idx]

        if tok.kind == TokenKind.WHITESPACE:
            if lf.total_tokens == 0:
                lf.indent_chars = tok.end - tok.start
            continue
        if tok.kind == TokenKind.NEWLINE:
            continue

        if tok.kind in (TokenKind.CODE_BLOCK, TokenKind.INLINE_CODE):
            lf.is_explicit_code = True
        elif tok.kind == TokenKind.WORD:
            lf.word_tokens += 1
            lower = text[tok.start:tok.end].lower()
            if lower in LANG_KEYWORDS:
                lf.lang_keyword_hits += 1
            elif lower in DOC_WORDS:
                lf.doc_word_hits += 1
            elif lower in ENGLISH_STOPWORDS:
                lf.stopword_hits += 1
            if is_camel_or_snake(text[tok.start:tok.end]):
                lf.camel_or_snake += 1
            if tok.flags & TokenFlags.HAS_NUMBERS:
                lf.has_numbers = True
            n = lf.word_tokens
            wlen = tok.end - tok.start
            lf.avg_word_len += (wlen - lf.avg_word_len) / n
        elif tok.kind in (TokenKind.OPERATOR, TokenKind.BRACKET):
            lf.symbol_tokens += 1
        elif tok.kind == TokenKind.PUNCTUATION:
            lf.symbol_tokens += 1
            if text[tok.start:tok.end] == "?":
                lf.ends_with_question = True

        lf.is_blank = False
        lf.total_tokens += 1
        lf.ends_with_symbol = tok.kind in (TokenKind.OPERATOR, TokenKind.BRACKET, TokenKind.PUNCTUATION)
        if tok.kind == TokenKind.PUNCTUATION and text[tok.start:tok.end] != "?":
            lf.ends_with_symbol = True

    return lines


def windowed_scores(raw: List[float]) -> List[float]:
    n = len(raw)
    out = [math.nan] * n
    for i in range(n):
        if math.isnan(raw[i]):
            continue
        prev = raw[i - 1] if i > 0 and not math.isnan(raw[i - 1]) else raw[i]
        nxt = raw[i + 1] if i + 1 < n and not math.isnan(raw[i + 1]) else raw[i]
        out[i] = max(0.0, min(1.0, (0.5 * prev + raw[i] + 0.5 * nxt) / 2.0))
    return out


@dataclass
class CodeBlock:
    start: int
    end: int
    score: float
    context: Optional[str]


ENTER_THRESHOLD = 0.55
EXIT_THRESHOLD = 0.35
CONSECUTIVE_REQUIRED = 2

_NL, _CANDIDATE_CODE, _CODE, _CANDIDATE_ENGLISH = range(4)


def _find_context(text: str, lines: List[LineFeatures], raw: List[float], block_start_line: int) -> Optional[str]:
    j = block_start_line
    floor = max(block_start_line - 3, 0)
    while j > floor:
        j -= 1
        if lines[j].is_blank:
            continue
        line_text = text[lines[j].start:lines[j].end].strip()
        if line_text and raw[j] < ENTER_THRESHOLD:
            return line_text
        return None
    return None


class Document:
    """Mirrors extractor.rs::Document. `original` holds the (already
    canonicalized) source text; `tokens` and `blocks` are computed once."""

    __slots__ = ("original", "tokens", "blocks")

    def __init__(self, original: str, tokens: List[Token], blocks: List[CodeBlock]):
        self.original = original
        self.tokens = tokens
        self.blocks = blocks

    @staticmethod
    def _build(text: str) -> Tuple[List[Token], List[CodeBlock]]:
        tokens = Lexer(text).lex_all()
        lines = extract_line_features(text, tokens)
        raw = [line_score(lf) for lf in lines]
        smoothed = windowed_scores(raw)

        blocks: List[CodeBlock] = []
        state = _NL
        block_start_line = 0
        streak = 0
        low_run_start = 0
        score_sum = 0.0
        score_n = 0

        n = len(lines)
        for i in range(n):
            blank = lines[i].is_blank
            s = smoothed[i]
            high = (not blank) and (not math.isnan(s)) and s >= ENTER_THRESHOLD
            low = blank or math.isnan(s) or s < EXIT_THRESHOLD

            if state == _NL:
                if high:
                    state = _CANDIDATE_CODE
                    streak = 1
                    block_start_line = i
                    score_sum = s
                    score_n = 1

            elif state == _CANDIDATE_CODE:
                if blank:
                    pass
                elif high:
                    streak += 1
                    score_sum += s
                    score_n += 1
                    if streak >= CONSECUTIVE_REQUIRED:
                        state = _CODE
                else:
                    state = _NL

            elif state == _CODE:
                if not blank:
                    score_sum += s
                    score_n += 1
                if low:
                    state = _CANDIDATE_ENGLISH
                    streak = 1
                    low_run_start = i

            elif state == _CANDIDATE_ENGLISH:
                if low:
                    streak += 1
                    if streak >= CONSECUTIVE_REQUIRED:
                        end_line = max(low_run_start - 1, block_start_line)
                        context = _find_context(text, lines, raw, block_start_line)
                        blocks.append(CodeBlock(
                            start=lines[block_start_line].start,
                            end=lines[end_line].end,
                            score=(score_sum / score_n) if score_n > 0 else 0.0,
                            context=context,
                        ))
                        state = _NL
                else:
                    state = _CODE
                    score_sum += s
                    score_n += 1

        if state == _CODE:
            blocks.append(CodeBlock(
                start=lines[block_start_line].start,
                end=lines[n - 1].end,
                score=(score_sum / score_n) if score_n > 0 else 0.0,
                context=_find_context(text, lines, raw, block_start_line),
            ))
        elif state == _CANDIDATE_ENGLISH:
            end_line = max(low_run_start - 1, block_start_line)
            blocks.append(CodeBlock(
                start=lines[block_start_line].start,
                end=lines[end_line].end,
                score=(score_sum / score_n) if score_n > 0 else 0.0,
                context=_find_context(text, lines, raw, block_start_line),
            ))

        return tokens, blocks

    @classmethod
    def analyze(cls, text: str) -> "Document":
        tokens, blocks = cls._build(text)
        return cls(text, tokens, blocks)

    def block_text(self, i: int) -> str:
        b = self.blocks[i]
        return self.original[b.start:b.end]
