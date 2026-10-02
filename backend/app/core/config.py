"""Application configuration via pydantic-settings.

Loads values from environment variables / a .env file. All secrets are
optional at import time so the app can boot (and /health respond) before
real credentials are provided.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parents[1]
_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- LLM ---
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"

    # --- Embeddings ---
    embedding_provider: str = "gemini"  # "gemini" | "huggingface"
    hf_embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    # --- Vector store ---
    chroma_persist_dir: str = "./chroma"

    # --- Graph DB (Neo4j) ---
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "changeme"

    # --- Relational DB (PostgreSQL) ---
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "changeme"
    postgres_db: str = "agentic_rag"
    database_url: str = ""

    # --- App ---
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    frontend_base_url: str = "http://localhost:3000"

    # --- Auth ---
    # CHANGE THIS in production; keep it out of version control (set in .env).
    jwt_secret: str = "dev-insecure-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 1 day
    reset_token_expire_minutes: int = 30
    auth_cookie_name: str = "access_token"

    # --- Email (verification / password reset) ---
    # Leave empty to use dev mode (reset/verify links are logged to console).
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "no-reply@agentic-rag.local"

    @property
    def sqlalchemy_url(self) -> str:
        if self.database_url:
            return self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
