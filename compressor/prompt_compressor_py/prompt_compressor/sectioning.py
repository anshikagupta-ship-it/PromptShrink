from dataclasses import dataclass, field
from typing import List, Any
from .lexer import TokenKind

@dataclass
class Section:
    """Represents a semantic block of the user's prompt."""
    title: str
    sentences: List[Any] = field(default_factory=list)

def detect_sections(sentences: List[Any], source: str) -> List[Section]:
    """
    Groups sentences into semantic buckets based on cue phrases.
    This resolves fragmentation where a user interleaves context,
    requirements, and features across multiple paragraphs.
    """
    buckets = {
        "Context": Section("Context"),
        "Requirements": Section("Requirements"),
        "Features": Section("Features"),
        "Architecture": Section("Architecture"),
        "Deliverables": Section("Deliverables"),
        "Migration": Section("Migration"),
        "Prose": Section("Prose")
    }

    def get_text(sent: Any) -> str:
        # Reconstruct just the words to check for cue phrases
        words = [t.text(source).lower() for t in sent.tokens if t.kind in (TokenKind.WORD, TokenKind.NUMBER)]
        return " ".join(words)

    for sent in sentences:
        text = get_text(sent)

        # We prioritize specific constraints over general prose
        if any(cue in text for cue in ["migrate", "migration", "update", "finally"]):
            buckets["Migration"].sentences.append(sent)

        elif any(cue in text for cue in ["deliverable", "deliver ", "output ", "provide ", "produce ", "generate ", "return "]):
            buckets["Deliverables"].sentences.append(sent)

        elif any(cue in text for cue in ["architecture", "stack", "technologies", "framework", "database", "recommendations for"]):
            buckets["Architecture"].sentences.append(sent)

        elif any(cue in text for cue in ["should support", "support ", "recommend ", "include ", "contains ", "features ", "consists of "]):
            buckets["Features"].sentences.append(sent)

        elif any(cue in text for cue in ["please", "i want", "i'd like", "i do not want", "don't", "must", "should", "ensure", "avoid", "keep", "preserve", "require", "make sure"]):
            buckets["Requirements"].sentences.append(sent)

        elif any(cue in text for cue in ["i'm building", "i am building", "working on", "context", "background", "currently", "trying to"]):
            buckets["Context"].sentences.append(sent)

        else:
            buckets["Prose"].sentences.append(sent)

    # Emit only the buckets that actually collected sentences
    return [b for b in buckets.values() if b.sentences]
