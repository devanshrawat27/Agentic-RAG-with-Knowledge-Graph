"""Gemini API key pool: round-robin rotation + cooldown on quota errors.

We keep the project on Gemini as the primary provider (locked decision) but
allow many free-tier keys. When one key hits 429/RESOURCE_EXHAUSTED it is put
on a short cooldown and the next key is used. Keys never appear in logs.
"""

import json
import re
import threading
import time

_COOLDOWN_SECONDS = 60.0
_SPLIT = re.compile(r"[,;\n]+")


def parse_api_keys(raw: str, fallback: str = "") -> list[str]:
    """Parse comma/newline/semicolon-separated keys, or a JSON array."""
    text = (raw or "").strip()
    keys: list[str] = []

    if text.startswith("["):
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                keys = [str(item).strip() for item in parsed if str(item).strip()]
        except (ValueError, TypeError):
            keys = []

    if not keys:
        keys = [part.strip() for part in _SPLIT.split(text) if part.strip()]

    if fallback and fallback.strip():
        fallback = fallback.strip()
        keys = [fallback] + [key for key in keys if key != fallback]

    seen: set[str] = set()
    unique: list[str] = []
    for key in keys:
        if key not in seen:
            seen.add(key)
            unique.append(key)
    return unique


def is_quota_error(exc: Exception) -> bool:
    """True for quota errors and unusable-key errors (both should rotate)."""
    message = str(exc).lower()
    markers = (
        "429",
        "resource_exhausted",
        "quota",
        "rate limit",
        "api key not valid",
        "api_key_invalid",
        "invalid api key",
        "api key expired",
        "permission_denied",
        "unauthenticated",
        "401",
        "403",
    )
    return any(marker in message for marker in markers)


def is_transient_error(exc: Exception) -> bool:
    """Provider hiccups that are worth retrying on another key."""
    message = str(exc).lower()
    markers = (
        "503",
        "500",
        "502",
        "504",
        "unavailable",
        "high demand",
        "temporarily",
        "timeout",
        "timed out",
        "deadline exceeded",
        "connection reset",
        "overloaded",
    )
    return any(marker in message for marker in markers)


def should_rotate(exc: Exception) -> bool:
    return is_quota_error(exc) or is_transient_error(exc)


def cooldown_for(exc: Exception) -> float | None:
    """Transient provider errors get a short rest; bad keys get the full one."""
    if is_transient_error(exc) and not is_quota_error(exc):
        return 5.0
    return None



class ApiKeyPool:
    """Round-robin key selection; failed keys rest for `cooldown_seconds`."""

    def __init__(
        self,
        keys: list[str],
        cooldown_seconds: float = _COOLDOWN_SECONDS,
        clock=time.monotonic,
    ):
        unique = list(dict.fromkeys(key for key in keys if key))
        if not unique:
            raise ValueError("ApiKeyPool needs at least one key")
        self._keys = unique
        self._cooldown = float(cooldown_seconds)
        self._clock = clock
        self._until = {key: 0.0 for key in unique}
        self._index = 0
        self._lock = threading.Lock()

    def __len__(self) -> int:
        return len(self._keys)

    def acquire(self) -> str | None:
        """Return the next usable key, or None while all keys are cooling."""
        with self._lock:
            now = self._clock()
            if not any(self._until[key] <= now for key in self._keys):
                return None
            for _ in range(len(self._keys)):
                key = self._keys[self._index]
                self._index = (self._index + 1) % len(self._keys)
                if self._until[key] <= now:
                    return key
            return None

    def mark_failed(self, key: str, seconds: float | None = None) -> None:
        with self._lock:
            wait = self._cooldown if seconds is None else float(seconds)
            self._until[key] = self._clock() + wait

    def mark_ok(self, key: str) -> None:
        with self._lock:
            self._until[key] = 0.0

    def cooldown_remaining(self, key: str) -> float:
        with self._lock:
            return max(0.0, self._until.get(key, 0.0) - self._clock())
