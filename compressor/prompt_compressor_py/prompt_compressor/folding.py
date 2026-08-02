from typing import List, Callable
from .sectioning import Section
from .grouping import GroupedItem

REQUIREMENT_PREFIXES = [
    "please", "i want", "i'd like", "i do not want", "don't",
    "must", "should", "ensure", "avoid", "keep", "preserve", "make sure"
]

ENUMERATION_VERBS = [
    "should support", "recommend", "include", "contains", "features", "consists of"
]

def fold_requirements(sections: List[Section], serialize_fn: Callable, source: str) -> List[Section]:
    """
    Rewrites verbose requirement sentences into clean bullet points.
    Because sectioning already grouped them, they become a single cohesive list.
    """
    for sec in sections:
        if sec.title == "Requirements":
            for sent in sec.sentences:
                text, _ = serialize_fn(sent.tokens, source)
                text_lower = text.lower().strip()

                for p in REQUIREMENT_PREFIXES:
                    if text_lower.startswith(p):
                        # Strip the prefix and any trailing conversational punctuation
                        text = text[len(p):].strip(" ,;:")
                        text = text.capitalize()
                        break

                sent.synthetic_text = f"- {text}"
    return sections

def fold_enumerations(sections: List[Section], serialize_fn: Callable, source: str) -> List[Section]:
    """
    Detects enumeration patterns (e.g., 'The app should support A, B, C')
    and squashes everything before the verb, returning just the list items.
    """
    for sec in sections:
        for sent in sec.sentences:
            text, _ = serialize_fn(sent.tokens, source)
            text_lower = text.lower().strip()

            for verb in ENUMERATION_VERBS:
                idx = text_lower.find(verb)
                if idx != -1:
                    after = text[idx + len(verb):].strip(" ,;:")
                    if after:
                        sent.synthetic_text = after.capitalize()
                    break
    return sections

def flatten_sections(sections: List[Section], serialize_fn: Callable, source: str) -> List[GroupedItem]:
    """
    Converts the semantic AST (Sections) into macro Information Units (GroupedItems)
    that PageRank can operate on. Aggregates all entity weights.
    """
    items = []
    for sec in sections:
        if not sec.sentences:
            continue

        text_parts = []
        merged_entities = {}
        is_protected = False

        # Inject the semantic header for structured blocks
        if sec.title != "Prose":
            text_parts.append(f"{sec.title}:")

        for sent in sec.sentences:
            # Use folded text if available, otherwise fallback to raw tokens
            if hasattr(sent, 'synthetic_text') and sent.synthetic_text:
                text_parts.append(sent.synthetic_text)
            else:
                text, _ = serialize_fn(sent.tokens, source)
                text_parts.append(text.strip())

            # Aggregate entity weights into the macro block
            for k, v in sent.entities.items():
                merged_entities[k] = merged_entities.get(k, 0.0) + v

            if getattr(sent, 'protected', False):
                is_protected = True

        # Hard constraint blocks are inherently protected from the graph cut
        if sec.title in ["Requirements", "Features", "Deliverables", "Architecture"]:
            is_protected = True

        # Requirements get bulleted newlines; everything else gets space-joined
        sep = "\n" if sec.title == "Requirements" else " "
        full_text = sep.join(text_parts)

        items.append(GroupedItem(
            text=full_text,
            entities=merged_entities,
            protected=is_protected,
            keep=True,
            is_group=True,
            member_count=len(sec.sentences)
        ))
    return items
