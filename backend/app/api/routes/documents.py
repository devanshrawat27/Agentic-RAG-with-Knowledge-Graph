"""Document upload + listing endpoints (auth-scoped per user)."""

import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Document, User
from app.db.postgres_client import get_db
from app.ingestion.loader import SUPPORTED_EXTENSIONS, UnsupportedDocumentError
from app.ingestion.pipeline import ingest_document

logger = logging.getLogger("app.api.documents")
router = APIRouter(prefix="/documents")

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_document(
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
        summary = ingest_document(current.id, filename, data, doc_id=None)
        # Embedding is authoritative for "ready"; extraction may be partial if
        # the LLM quota was hit, so surface that instead of failing the upload.
        doc.status = "ready"
        doc.chunk_count = summary["chunks"]
        return {
            "document_id": doc.id,
            "doc_id": summary["doc_id"],
            "filename": filename,
            "status": doc.status,
            "chunks": summary["chunks"],
            "entities": summary["entities"],
            "relationships": summary["relationships"],
            "extracted_chunks": summary.get("extracted_chunks", 0),
            "quota_hit": summary.get("quota_hit", False),
        }
    except UnsupportedDocumentError as exc:
        doc.status = "failed"
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        doc.status = "failed"
        logger.exception("ingestion failed for %s", filename)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {exc}") from exc


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
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in rows
        ]
    }
