"""Knowledge-graph snapshot endpoint (auth-scoped)."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user
from app.db.graph_snapshot import fetch_graph
from app.db.models import User

router = APIRouter(prefix="/graph")


@router.get("")
def get_graph(
    limit: int = Query(default=300, ge=1, le=1000),
    include_mentions: bool = Query(default=False),
    current: User = Depends(get_current_user),
) -> dict:
    try:
        return fetch_graph(
            current.id, limit=limit, include_mentions=include_mentions
        )
    except Exception as exc:  # noqa: BLE001 - graph store may be down
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Knowledge graph is unavailable",
        ) from exc
