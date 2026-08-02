from .extractor import Document, CodeBlock
from .lexer import Lexer, Token, TokenFlags, TokenKind
from .compressor import compress_prompt, analyze_prompt
from . import canonical
from . import grouping
from .grouping import group_sentences, GroupedItem
from .sectioning import Section, detect_sections
from .folding import fold_requirements, fold_enumerations, flatten_sections

__all__ = [
    "Document", "CodeBlock", "Lexer", "Token", "TokenFlags", "TokenKind",
    "compress_prompt", "analyze_prompt", "canonical",
    "grouping", "group_sentences", "GroupedItem",
    "Section", "detect_sections", "fold_requirements",
    "fold_enumerations", "flatten_sections"
]
