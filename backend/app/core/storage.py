"""Local storage for uploaded source files (PDF/DOCX/TXT/...)."""

import re
from pathlib import Path

from app.core.config import get_settings

_MIME_TYPES = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".json": "application/json",
}

_SAFE_SUFFIX = re.compile(r"^\.[a-z0-9]{1,8}$")


def mime_for_suffix(suffix: str) -> str:
    return _MIME_TYPES.get((suffix or "").lower(), "application/octet-stream")


def _root() -> Path:
    root = get_settings().storage_path
    root.mkdir(parents=True, exist_ok=True)
    return root


def save_document_file(
    user_id: int, doc_id: str, suffix: str, data: bytes
) -> str:
    """Write an upload to disk and return its path relative to the root."""
    suffix = (suffix or "").lower()
    if not _SAFE_SUFFIX.match(suffix):
        suffix = ""
    relative = Path(str(user_id)) / f"{doc_id}{suffix}"
    path = _root() / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return relative.as_posix()


def resolve_document_file(relative_path: str | None) -> Path | None:
    """Resolve a stored path safely; returns None for missing/traversal paths."""
    if not relative_path:
        return None
    root = _root().resolve()
    path = (root / relative_path).resolve()
    if path != root and root not in path.parents:
        return None
    return path if path.is_file() else None


def delete_document_file(relative_path: str | None) -> None:
    path = resolve_document_file(relative_path)
    if path is not None:
        path.unlink(missing_ok=True)
