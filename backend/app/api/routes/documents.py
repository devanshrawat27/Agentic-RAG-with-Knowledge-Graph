"""Document upload + listing endpoints (auth-scoped per user).

Upload does the fast work (load/chunk/embed) synchronously and returns, then
runs LLM graph extraction in the background so the request is not blocked by a
slow local LLM.
"""

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Document, User
from app.db.postgres_client import get_db, get_session_factory
from app.ingestion.loader import SUPPORTED_EXTENSIONS
from app.ingestion.pipeline import extract_document, prepare_document

logger = logging.getLogger("app.api.documents")
router = APIRouter(prefix="/documents")

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB


def _run_extraction(user_id: int, document_pk: int, doc_id: str, filename: str, chunks: list[str]):
    """Background job: extract entities/relationships and update the row."""
    try:
        stats = extract_document(user_id, doc_id, filename, chunks)
    except Exception:  # noqa: BLE001
        logger.exception("background extraction failed for %s", filename)
        return
    session = get_session_factory()()
    try:
        doc = session.get(Document, document_pk)
        if doc is not None:
            doc.entity_count = stats["entities"]
            doc.relationship_count = stats["relationships"]
            # extraction is best-effort; embeddings already make it searchable
            doc.status = "ready"
            session.commit()
    finally:
        session.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_document(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    filename = file.filename or "upload"
    suffix = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type. Supported: {sorted(SUPPORTED_EXTENSIONS)}",
        )

    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 20 MB)")

    doc = Document(user_id=current.id, filename=filename, status="processing")
    db.add(doc)
    db.flush()

    try:
        prep = prepare_document(current.id, filename, data)
    except Exception as exc:  # noqa: BLE001
        doc.status = "failed"
        db.commit()
        logger.exception("ingestion failed for %s", filename)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {exc}") from exc

    doc.doc_id = prep["doc_id"]
    doc.chunk_count = prep["stored"]
    # Embedded => already searchable, so mark ready immediately. Graph
    # extraction runs in the background and fills the entity/relationship counts.
    doc.status = "ready"
    db.commit()
    db.refresh(doc)

    background.add_task(
        _run_extraction, current.id, doc.id, prep["doc_id"], filename, prep["chunks"]
    )

    return {
        "document_id": doc.id,
        "doc_id": prep["doc_id"],
        "filename": filename,
        "status": doc.status,
        "chunks": prep["stored"],
        "extraction": "running",
    }


@router.get("")
def list_documents(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    rows = db.scalars(
        select(Document).where(Document.user_id == current.id).order_by(Document.id.desc())
    ).all()
    return {
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "status": d.status,
                "chunk_count": d.chunk_count,
                "entity_count": d.entity_count,
                "relationship_count": d.relationship_count,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in rows
        ]
    }
