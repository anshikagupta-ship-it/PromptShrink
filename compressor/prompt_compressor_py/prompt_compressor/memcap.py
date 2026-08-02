"""
Hard memory cap. No AI/ML models are used anywhere in this tool -- this
is just tokenization, regex, stemming, and graph math -- so 512MB is
comfortably enough for even large prompts. This sets a hard OS-level
ceiling so a pathological input fails loudly (MemoryError) instead of
letting the process balloon.
"""

from __future__ import annotations

import sys

DEFAULT_LIMIT_MB = 512


def set_memory_limit(limit_mb: int = DEFAULT_LIMIT_MB) -> bool:
    """Set RLIMIT_AS to `limit_mb` megabytes. Returns True if applied.

    Only works on platforms with a real `resource` module (Linux/macOS).
    On unsupported platforms (Windows) this is a no-op and returns False
    -- callers should treat that as "best effort, not guaranteed".
    """
    try:
        import resource
    except ImportError:
        return False

    limit_bytes = limit_mb * 1024 * 1024
    try:
        soft, hard = resource.getrlimit(resource.RLIMIT_AS)
        new_hard = hard if hard != resource.RLIM_INFINITY and hard < limit_bytes else limit_bytes
        resource.setrlimit(resource.RLIMIT_AS, (limit_bytes, new_hard))
        return True
    except (ValueError, OSError):
        # Some sandboxes/containers refuse to lower RLIMIT_AS. Not fatal.
        return False


def current_rss_mb() -> float:
    """Best-effort current resident memory usage, for diagnostics."""
    try:
        import resource
        usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        # Linux reports KB, macOS reports bytes.
        return usage / 1024.0 if sys.platform != "darwin" else usage / (1024.0 * 1024.0)
    except Exception:
        return -1.0
