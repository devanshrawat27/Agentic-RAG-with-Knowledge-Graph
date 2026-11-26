"""Source-chunk previews for citation clicks."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user
from app.core.vectorstore import get_chunk_context
from app.db.models import User

router = APIRouter(prefix="/chunks")


@router.get("/{chunk_id}")
def get_chunk(
    chunk_id: str,
    context: int = Query(default=1, ge=0, le=2),
    current: User = Depends(get_current_user),
) -> dict:
    chunks = get_chunk_context(current.id, chunk_id, context=context)
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Source chunk not found"
        )
    return {"focus": chunk_id, "chunks": chunks}
