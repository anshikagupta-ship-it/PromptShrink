"""
Tokenizer / lexer.

Direct port of the Rust `lexer.rs`. A Token never owns text -- it's a
(kind, start, end, flags) tuple over byte offsets into the original
string, exactly like the Rust version. That keeps memory flat no matter
how large the prompt is (no per-token string allocation).
"""

from __future__ import annotations

from enum import IntEnum, IntFlag, auto
from typing import List, NamedTuple, Optional


class TokenKind(IntEnum):
    WORD = auto()
    NUMBER = auto()
    STRING = auto()
    URL = auto()
    CODE_BLOCK = auto()
    INLINE_CODE = auto()
    PUNCTUATION = auto()
    OPERATOR = auto()
    BRACKET = auto()
    WHITESPACE = auto()
    NEWLINE = auto()
    COMMENT = auto()
    UNKNOWN = auto()


class TokenFlags(IntFlag):
    NONE = 0
    CAPITALIZED = 1 << 0
    ALL_CAPS = 1 << 1
    HAS_NUMBERS = 1 << 2
    IS_STOP_WORD = 1 << 3
    IS_BOILERPLATE = 1 << 4
    # Set on tokens synthesized by a compression pass (e.g. a single
    # collapsed space standing in for a run of whitespace) rather than
    # sliced directly from the source text.
    SYNTHETIC = 1 << 5


class Token(NamedTuple):
    kind: TokenKind
    start: int
    end: int
    flags: TokenFlags

    def text(self, source: str) -> str:
        return source[self.start:self.end]


_BRACKETS = set("()[]{}<>")
_PUNCT = set(".,;:!?")
_OPERATORS = set("+-*/=~|&^%\\")


class Lexer:
    """Single-pass scanner over `input`. Mirrors lexer.rs closely."""

    __slots__ = ("input", "n", "pos", "prev_char")

    def __init__(self, text: str):
        self.input = text
        self.n = len(text)
        self.pos = 0
        self.prev_char: Optional[str] = None

    def lex_all(self) -> List[Token]:
        tokens: List[Token] = []
        tok = self.next_token()
        while tok is not None:
            tokens.append(tok)
            tok = self.next_token()
        return tokens

    # -- helpers -----------------------------------------------------

    def _peek(self) -> Optional[str]:
        return self.input[self.pos] if self.pos < self.n else None

    def _starts_with(self, prefix: str) -> bool:
        return self.input.startswith(prefix, self.pos)

    def _advance(self):
        if self.pos < self.n:
            self.prev_char = self.input[self.pos]
            self.pos += 1
        else:
            self.prev_char = None

    def _tok(self, kind: TokenKind, start: int, flags: TokenFlags = TokenFlags.NONE) -> Token:
        return Token(kind, start, self.pos, flags)

    # -- main dispatch -------------------------------------------------

    def next_token(self) -> Optional[Token]:
        if self.pos >= self.n:
            return None
        start = self.pos
        c = self.input[self.pos]

        if c == '\n' or c == '\r':
            return self._lex_newline(start)
        if c.isspace():
            return self._lex_whitespace(start)

        if c == '`':
            if self._starts_with('```'):
                return self._lex_code_block(start)
            return self._lex_inline_code(start)

        if c in _BRACKETS:
            self._advance()
            return self._tok(TokenKind.BRACKET, start)

        if c in _PUNCT:
            self._advance()
            return self._tok(TokenKind.PUNCTUATION, start)

        if c == '/':
            if self._starts_with('//'):
                return self._lex_line_comment(start)
            if self._starts_with('/*'):
                return self._lex_block_comment(start)

        if c in _OPERATORS:
            self._advance()
            return self._tok(TokenKind.OPERATOR, start)

        if c == '"':
            return self._lex_string(start, '"')

        if c == "'":
            prev_is_alnum = self.prev_char is not None and self.prev_char.isalnum()
            if prev_is_alnum:
                self._advance()
                return self._tok(TokenKind.PUNCTUATION, start)
            return self._lex_string(start, "'")

        if c.isdigit():
            return self._lex_number(start)

        if c.isalpha() or c == '_':
            if self._starts_with('http://') or self._starts_with('https://'):
                return self._lex_url(start)
            return self._lex_word(start)

        self._advance()
        return self._tok(TokenKind.UNKNOWN, start)

    # -- sub-lexers ------------------------------------------------------

    def _lex_newline(self, start: int) -> Token:
        while True:
            c = self._peek()
            if c == '\n' or c == '\r':
                self._advance()
            else:
                break
        return self._tok(TokenKind.NEWLINE, start)

    def _lex_whitespace(self, start: int) -> Token:
        while True:
            c = self._peek()
            if c is not None and c.isspace() and c != '\n' and c != '\r':
                self._advance()
            else:
                break
        return self._tok(TokenKind.WHITESPACE, start)

    def _lex_code_block(self, start: int) -> Token:
        for _ in range(3):
            self._advance()
        return self._tok(TokenKind.CODE_BLOCK, start)

    def _lex_inline_code(self, start: int) -> Token:
        self._advance()
        return self._tok(TokenKind.INLINE_CODE, start)

    def _lex_line_comment(self, start: int) -> Token:
        while True:
            c = self._peek()
            if c is None or c == '\n' or c == '\r':
                break
            self._advance()
        return self._tok(TokenKind.COMMENT, start)

    def _lex_block_comment(self, start: int) -> Token:
        self._advance()  # '/'
        self._advance()  # '*'
        prev_star = False
        while True:
            c = self._peek()
            if c is None:
                break
            self._advance()
            if prev_star and c == '/':
                break
            prev_star = (c == '*')
        return self._tok(TokenKind.COMMENT, start)

    def _lex_string(self, start: int, quote: str) -> Token:
        self._advance()
        escaped = False
        while True:
            c = self._peek()
            if c is None:
                break
            self._advance()
            if escaped:
                escaped = False
                continue
            if c == '\\':
                escaped = True
            elif c == quote:
                break
        return self._tok(TokenKind.STRING, start)

    def _lex_number(self, start: int) -> Token:
        has_decimal = False
        while True:
            c = self._peek()
            if c is None:
                break
            if c.isdigit():
                self._advance()
            elif c == '.' and not has_decimal:
                nxt = self.input[self.pos + 1] if self.pos + 1 < self.n else None
                if nxt is not None and nxt.isdigit():
                    has_decimal = True
                    self._advance()
                    continue
                break
            else:
                break
        return self._tok(TokenKind.NUMBER, start)

    def _lex_url(self, start: int) -> Token:
        stop_chars = set("()[]{}<>\"'")
        while True:
            c = self._peek()
            if c is None or c.isspace() or c in stop_chars:
                break
            self._advance()
        return self._tok(TokenKind.URL, start)

    def _lex_word(self, start: int) -> Token:
        flags = TokenFlags.NONE
        first = self.input[start]
        if first.isupper():
            flags |= TokenFlags.CAPITALIZED

        all_caps = True
        has_numbers = False

        while True:
            c = self._peek()
            if c is not None and (c.isalnum() or c in "_-'"):
                if c.isnumeric():
                    has_numbers = True
                if c.islower():
                    all_caps = False
                self._advance()
            else:
                break

        if all_caps and (self.pos - start > 1):
            flags |= TokenFlags.ALL_CAPS
        if has_numbers:
            flags |= TokenFlags.HAS_NUMBERS

        return self._tok(TokenKind.WORD, start, flags)
