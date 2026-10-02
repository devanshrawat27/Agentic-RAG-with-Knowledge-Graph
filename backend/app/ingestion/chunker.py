"""Text chunker: split documents into overlapping chunks.

Uses LangChain's RecursiveCharacterTextSplitter so splits respect paragraph,
sentence, and word boundaries before falling back to a hard cut. Overlap keeps
context that spans a boundary from being lost.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter

DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 150


def get_splitter(
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )


def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[str]:
    if not text or not text.strip():
        return []
    chunks = get_splitter(chunk_size, chunk_overlap).split_text(text)
    return [c.strip() for c in chunks if c.strip()]
