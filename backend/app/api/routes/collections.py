"""Collections: named groups of a user's documents.

A collection is only an organizing layer right now — it never exposes another
user's documents, and membership is validated against the authenticated user.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Collection, Document, User
from app.db.postgres_client import get_db
from app.schemas.collections import (
    CollectionCreate,
    CollectionDetail,
    CollectionDocumentAdd,
    CollectionDocumentOut,
    CollectionOut,
    CollectionUpdate,
)

router = APIRouter(prefix="/collections")


def _owned(db: Session, user_id: int, collection_id: int) -> Collection:
    collection = db.get(Collection, collection_id)
    if collection is None or collection.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found"
        )
    return collection


def _out(collection: Collection) -> CollectionOut:
    return CollectionOut(
        id=collection.id,
        name=collection.name,
        description=collection.description,
        document_count=len(collection.documents),
        created_at=collection.created_at,
        updated_at=collection.updated_at,
    )


def _detail(collection: Collection) -> CollectionDetail:
    return CollectionDetail(
        **_out(collection).model_dump(),
        documents=[
            CollectionDocumentOut(
                id=document.id,
                filename=document.filename,
                status=document.status,
                chunk_count=document.chunk_count,
                entity_count=document.entity_count,
                relationship_count=document.relationship_count,
                created_at=document.created_at,
            )
            for document in collection.documents
        ],
    )


@router.get("", response_model=list[CollectionOut])
def list_collections(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CollectionOut]:
    rows = db.scalars(
        select(Collection)
        .where(Collection.user_id == current.id)
        .order_by(Collection.updated_at.desc())
    ).all()
    return [_out(row) for row in rows]


@router.post("", response_model=CollectionOut, status_code=status.HTTP_201_CREATED)
def create_collection(
    payload: CollectionCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CollectionOut:
    name = payload.name.strip()
    if not name:
        raise HTTPException(
            status_code=422,
            detail="Collection name is required",
        )
    clash = db.scalar(
        select(Collection).where(
            Collection.user_id == current.id,
            func.lower(Collection.name) == name.lower(),
        )
    )
    if clash is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A collection with that name already exists",
        )

    collection = Collection(
        user_id=current.id,
        name=name,
        description=(payload.description or "").strip(),
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return _out(collection)


@router.get("/{collection_id}", response_model=CollectionDetail)
def get_collection(
    collection_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CollectionDetail:
    return _detail(_owned(db, current.id, collection_id))


@router.patch("/{collection_id}", response_model=CollectionOut)
def update_collection(
    collection_id: int,
    payload: CollectionUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CollectionOut:
    collection = _owned(db, current.id, collection_id)

    if payload.name is not None:
        name = payload.name.strip()
        if not name:
            raise HTTPException(
                status_code=422,
                detail="Collection name is required",
            )
        clash = db.scalar(
            select(Collection).where(
                Collection.user_id == current.id,
                Collection.id != collection.id,
                func.lower(Collection.name) == name.lower(),
            )
        )
        if clash is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A collection with that name already exists",
            )
        collection.name = name

    if payload.description is not None:
        collection.description = payload.description.strip()

    collection.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(collection)
    return _out(collection)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(
    collection_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    collection = _owned(db, current.id, collection_id)
    db.delete(collection)
    db.commit()


@router.post("/{collection_id}/documents", response_model=CollectionDetail)
def add_document(
    collection_id: int,
    payload: CollectionDocumentAdd,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CollectionDetail:
    collection = _owned(db, current.id, collection_id)
    document = db.get(Document, payload.document_id)
    if document is None or document.user_id != current.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )

    if document not in collection.documents:
        collection.documents.append(document)
    collection.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(collection)
    return _detail(collection)


@router.delete(
    "/{collection_id}/documents/{document_id}", response_model=CollectionDetail
)
def remove_document(
    collection_id: int,
    document_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CollectionDetail:
    collection = _owned(db, current.id, collection_id)
    document = next(
        (item for item in collection.documents if item.id == document_id), None
    )
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document is not in this collection",
        )

    collection.documents.remove(document)
    collection.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(collection)
    return _detail(collection)
