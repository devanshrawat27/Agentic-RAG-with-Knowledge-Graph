"""Authentication endpoints: signup, login, logout, me, verify, reset."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.email import send_password_reset_email, send_verification_email
from app.core.security import (
    create_access_token,
    generate_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.db.models import Token, User
from app.db.postgres_client import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenRequest,
    UserPublic,
)

router = APIRouter(prefix="/auth")


def _issue_token(db: Session, user_id: int, type_: str, minutes: int) -> str:
    raw = generate_token()
    db.add(
        Token(
            user_id=user_id,
            type=type_,
            token_hash=hash_token(raw),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=minutes),
        )
    )
    return raw


def _consume_token(db: Session, raw: str, type_: str) -> Token | None:
    token = db.scalar(
        select(Token).where(
            Token.token_hash == hash_token(raw),
            Token.type == type_,
            Token.used_at.is_(None),
        )
    )
    if token is None:
        return None
    if token.expires_at < datetime.now(timezone.utc):
        return None
    token.used_at = datetime.now(timezone.utc)
    return token


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> MessageResponse:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        is_verified=False,
    )
    db.add(user)
    db.flush()

    raw = _issue_token(db, user.id, "verify", 60 * 24)
    send_verification_email(user.email, raw)
    return MessageResponse(message="Account created. Check your email to verify.")


@router.post("/login", response_model=UserPublic)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first")

    settings = get_settings()
    token = create_access_token(user.id)
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # TODO: True behind HTTPS in production
        max_age=settings.access_token_expire_minutes * 60,
    )
    return user


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    settings = get_settings()
    response.delete_cookie(settings.auth_cookie_name)
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=UserPublic)
def me(current: User = Depends(get_current_user)) -> User:
    return current


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: TokenRequest, db: Session = Depends(get_db)) -> MessageResponse:
    token = _consume_token(db, payload.token, "verify")
    if token is None:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.get(User, token.user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid token")
    user.is_verified = True
    return MessageResponse(message="Email verified. You can now log in.")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    payload: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> MessageResponse:
    settings = get_settings()
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is not None:
        raw = _issue_token(db, user.id, "reset", settings.reset_token_expire_minutes)
        send_password_reset_email(user.email, raw)
    # Always the same response — never reveal whether the email is registered.
    return MessageResponse(
        message="If that email is registered, a reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    payload: ResetPasswordRequest, db: Session = Depends(get_db)
) -> MessageResponse:
    token = _consume_token(db, payload.token, "reset")
    if token is None:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.get(User, token.user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid token")
    user.password_hash = hash_password(payload.new_password)
    return MessageResponse(message="Password updated. You can now log in.")
