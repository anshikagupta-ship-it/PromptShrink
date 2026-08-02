"""
Canonicalization pass: strip/replace known filler phrases before the
prompt ever reaches the lexer/scorer. Direct port of canonical.rs's
RULES table, plus a few additions to close gaps the Rust version left
open (bare greetings/sign-offs that the sentence-level scorer was
otherwise relying on the graph to catch -- unreliably).

Matching semantics: case-insensitive substring match, leftmost-longest
(same as the original AhoCorasick::MatchKind::LeftmostLongest), so a
longer pattern always wins over a shorter one that starts at the same
position.
"""

from __future__ import annotations

import re
from typing import List, Tuple

RULES: List[Tuple[str, str]] = [
    # ==========================================================
    # Greetings
    # ==========================================================
    ("hello there", ""),
    ("hello everyone", ""),
    ("good morning", ""),
    ("good afternoon", ""),
    ("good evening", ""),
    ("hope you're doing well", ""),
    ("hope you are doing well", ""),
    ("hope you're having a great day", ""),
    ("hope you're having a good day", ""),
    ("hope this finds you well", ""),
    ("thanks in advance", ""),
    ("thank you in advance", ""),
    ("thank you very much", ""),
    ("thank you so much", ""),
    ("many thanks", ""),
    ("thanks so much", ""),
    ("thanks a lot", ""),
    ("thanks a ton", ""),
    ("much appreciated", ""),
    ("really appreciate it", ""),
    ("i would appreciate it", ""),
    ("i'd appreciate it", ""),
    ("i would really appreciate", ""),
    ("i'd really appreciate", ""),

    # ==========================================================
    # Introductions
    # ==========================================================
    ("i'm working on", ""),
    ("i am working on", ""),
    ("i've been working on", ""),
    ("i have been working on", ""),
    ("i'm building", ""),
    ("i am building", ""),
    ("i'm creating", ""),
    ("i am creating", ""),
    ("i'm developing", ""),
    ("i am developing", ""),
    ("i'm implementing", ""),
    ("i am implementing", ""),
    ("i'm trying to", ""),
    ("i am trying to", ""),
    ("i've been trying to", ""),
    ("i have been trying to", ""),
    ("i'm attempting to", ""),
    ("i am attempting to", ""),
    ("currently i'm", ""),
    ("currently i am", ""),
    ("right now i'm", ""),
    ("at the moment i'm", ""),
    ("for the past few days", ""),
    ("for the last few days", ""),
    ("for the past few hours", ""),
    ("after spending hours", ""),
    ("after spending days", ""),

    # ==========================================================
    # Boilerplate
    # ==========================================================
    ("the problem is that", ""),
    ("the issue is that", ""),
    ("the main issue is", ""),
    ("what's happening is", ""),
    ("what is happening is", ""),
    ("it seems that", ""),
    ("it appears that", ""),
    ("i noticed that", ""),
    ("i realized that", ""),
    ("i've noticed that", ""),
    ("i have noticed that", ""),
    ("the thing is", ""),
    ("basically", ""),
    ("to be honest", ""),
    ("honestly speaking", ""),
    ("to be completely honest", ""),
    ("in my opinion", ""),
    ("as you can see", ""),
    ("as shown below", ""),
    ("as shown above", ""),

    # ==========================================================
    # Headers
    # ==========================================================
    ("here's the parser", "Parser:"),
    ("here is the parser", "Parser:"),
    ("here's my parser", "Parser:"),
    ("here is my parser", "Parser:"),

    ("here's the code", "Code:"),
    ("here is the code", "Code:"),
    ("here's my code", "Code:"),
    ("here is my code", "Code:"),

    ("here's the implementation", "Code:"),
    ("here is the implementation", "Code:"),

    ("here's the function", "Function:"),
    ("here is the function", "Function:"),

    ("here's the configuration", "Config:"),
    ("here is the configuration", "Config:"),
    ("configuration file", "Config"),
    ("the configuration file", "Config"),
    ("configuration looks like", "Config:"),

    ("here's the output", "Output:"),
    ("here is the output", "Output:"),
    ("the output is", "Output:"),
    ("output looks like", "Output:"),

    ("here's the error", "Error:"),
    ("here is the error", "Error:"),
    ("error message", "Error:"),

    ("the panic is", "Panic:"),
    ("the panic looks like", "Panic:"),
    ("panic looks like", "Panic:"),

    ("stack trace", "Stacktrace:"),
    ("stacktrace", "Stacktrace:"),
    ("back trace", "Backtrace:"),

    ("the logs look like this", "Logs:"),
    ("the logs are", "Logs:"),
    ("here are the logs", "Logs:"),
    ("the logs show", "Logs:"),

    ("the repository is", "Repo:"),
    ("repository link", "Repo:"),
    ("github repository", "Repo:"),

    # ==========================================================
    # Execution
    # ==========================================================
    ("i'm running", "Run:"),
    ("i am running", "Run:"),
    ("when i run", "Run:"),
    ("after running", "Run:"),
    ("running the application", "Run:"),
    ("running the project", "Run:"),
    ("executing the application", "Run:"),
    ("executing the program", "Run:"),
    ("when executing", "Run:"),

    # ==========================================================
    # Attempts
    # ==========================================================
    ("i have already tried", "Tried:"),
    ("i've already tried", "Tried:"),
    ("i also tried", "Tried:"),
    ("i tried", "Tried:"),
    ("i attempted", "Tried:"),
    ("none of them worked", ""),
    ("none of this worked", ""),
    ("nothing worked", ""),
    ("without success", ""),

    # ==========================================================
    # Requests
    # ==========================================================
    ("what i'm hoping you can do is", "Tasks:"),
    ("what i'm hoping", "Tasks:"),
    ("could you please", ""),
    ("can you please", ""),
    ("would you please", ""),
    ("if possible", ""),
    ("if you can", ""),
    ("would it be possible to", ""),
    ("can you help me", ""),
    ("help me understand", "Explain"),
    ("please explain", "Explain"),
    ("could you explain", "Explain"),
    ("can you explain", "Explain"),
    ("walk me through", "Explain"),
    ("step by step", "Step-by-step"),

    # ==========================================================
    # Closings
    # ==========================================================
    ("i'm still learning", ""),
    ("i am still learning", ""),
    ("because i'm still learning", ""),
    ("because i am still learning", ""),
    ("i don't want a complete rewrite", "No rewrite."),
    ("avoid rewriting the whole project", "No rewrite."),
    ("preserve the current architecture", "Preserve architecture."),
    ("keep the current architecture", "Preserve architecture."),
    ("without changing the architecture", "Preserve architecture."),

    # ==========================================================
    # Additions: bare greetings / sign-offs that were previously
    # left for the sentence-graph pruner to catch (unreliably --
    # a short, low-entity greeting can still survive a relative
    # bottom-30% cut if the rest of the prompt is also sparse).
    # These are anchored to line-start/line-end so we don't eat
    # "hi" out of the middle of real content like "said hi to the
    # team in the changelog".
    # ==========================================================
    ("kind regards,", ""),
    ("kind regards", ""),
    ("best regards,", ""),
    ("best regards", ""),
    ("warm regards", ""),
    ("looking forward to your help", ""),
    ("looking forward to hearing from you", ""),
    ("sorry for the long message", ""),
    ("sorry for the wall of text", ""),
    ("apologies for the long post", ""),
    ("just wanted to say", ""),
    ("just a quick note", ""),
]

# Line-anchored bare greetings / sign-offs: only stripped when they are
# (almost) the entire line, so we never touch the word inside real
# sentences.
_LINE_ANCHORED_PATTERNS = [
    r"^\s*(hi|hey|hello|yo)[,!.\s]*$",
    r"^\s*(hi|hey|hello)\s+(there|team|all|everyone|folks)[,!.\s]*$",
    r"^\s*(thanks|thank you|thx|cheers)[,!.\s]*$",
    r"^\s*(regards|sincerely|best|cheers)[,!.\s]*$",
]
_LINE_ANCHORED_RE = [re.compile(p, re.IGNORECASE) for p in _LINE_ANCHORED_PATTERNS]


def _build_pattern_regex():
    # Longest-first ordering approximates leftmost-longest matching
    # with a leftmost-first regex engine: at any given start position,
    # the longer alternative is tried before shorter ones that would
    # also match there.
    ordered = sorted(range(len(RULES)), key=lambda i: -len(RULES[i][0]))
    alternation = "|".join(re.escape(RULES[i][0]) for i in ordered)
    pattern = re.compile(alternation, re.IGNORECASE)
    replacement_by_lower = {RULES[i][0].lower(): RULES[i][1] for i in ordered}
    return pattern, replacement_by_lower


_PATTERN_RE, _REPLACEMENTS = _build_pattern_regex()


def canonicalize(text: str) -> str:
    """Strip/replace known filler phrases. Substring-level, mirrors
    canonical.rs::canonicalize exactly, plus the line-anchored greeting
    pass below."""

    def _sub(m: re.Match) -> str:
        return _REPLACEMENTS[m.group(0).lower()]

    out = _PATTERN_RE.sub(_sub, text)

    lines = out.split("\n")
    for i, line in enumerate(lines):
        for rgx in _LINE_ANCHORED_RE:
            if rgx.match(line):
                lines[i] = ""
                break
    return "\n".join(lines)
