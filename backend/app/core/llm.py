"""LLM factory: rotating Gemini keys primary, Ollama local fallback.

Multiple free-tier Gemini keys can be supplied in `GEMINI_API_KEYS`. A key that
hits a quota/429 error is put on a short cooldown and the next key is used, so
one exhausted key never blocks the pipeline. Both providers return LangChain
chat models, so agents call `.invoke(...)` the same way.
"""

from functools import lru_cache
from typing import Any

from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from pydantic import PrivateAttr

from app.core.config import get_settings
from app.core.keypool import ApiKeyPool, is_quota_error


class RotatingGeminiChat(BaseChatModel):
    """ChatGoogleGenerativeAI with per-request API-key rotation."""

    model_name: str
    temperature: float = 0.0
    keys: list[str]
    cooldown_seconds: float = 60.0

    _pool: ApiKeyPool = PrivateAttr()

    def __init__(self, **data: Any):
        super().__init__(**data)
        self._pool = ApiKeyPool(
            self.keys, cooldown_seconds=self.cooldown_seconds
        )

    @property
    def _llm_type(self) -> str:
        return "rotating-gemini"

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: CallbackManagerForLLMRun | None = None,
        **kwargs: Any,
    ) -> ChatResult:
        # Imported lazily so the app can boot without the provider installed.
        from langchain_google_genai import ChatGoogleGenerativeAI

        last_error: Exception | None = None
        for _ in range(len(self._pool)):
            key = self._pool.acquire()
            if key is None:
                break
            try:
                model = ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=key,
                    temperature=self.temperature,
                    max_retries=0,
                )
                call_kwargs = dict(kwargs)
                if stop:
                    call_kwargs["stop"] = stop
                response = model.invoke(messages, **call_kwargs)
                self._pool.mark_ok(key)
                return ChatResult(
                    generations=[ChatGeneration(message=response)]
                )
            except Exception as exc:  # noqa: BLE001 - inspect quota errors
                if not is_quota_error(exc):
                    raise
                self._pool.mark_failed(key)
                last_error = exc

        if last_error is not None:
            raise last_error
        raise RuntimeError(
            "All Gemini API keys are cooling down; try again shortly"
        )


@lru_cache
def get_gemini_llm(temperature: float = 0.0) -> BaseChatModel:
    settings = get_settings()
    keys = settings.all_gemini_api_keys
    if not keys:
        raise RuntimeError("GEMINI_API_KEY or GEMINI_API_KEYS is not set")
    return RotatingGeminiChat(
        model_name=settings.gemini_model,
        temperature=temperature,
        keys=keys,
        cooldown_seconds=settings.gemini_key_cooldown_seconds,
    )


@lru_cache
def get_ollama_llm(temperature: float = 0.0) -> BaseChatModel:
    from langchain_ollama import ChatOllama

    settings = get_settings()
    return ChatOllama(
        base_url=settings.ollama_base_url,
        model=settings.ollama_model,
        temperature=temperature,
    )


def get_llm(temperature: float = 0.0) -> BaseChatModel:
    settings = get_settings()
    if settings.llm_provider == "ollama":
        return get_ollama_llm(temperature)
    return get_gemini_llm(temperature)


def get_llm_with_fallback(temperature: float = 0.0) -> BaseChatModel:
    """Primary LLM with a local Ollama fallback on failure."""
    settings = get_settings()
    if settings.llm_provider == "ollama":
        return get_ollama_llm(temperature)
    primary = get_gemini_llm(temperature)
    try:
        fallback = get_ollama_llm(temperature)
    except Exception:
        return primary
    return primary.with_fallbacks([fallback])


def content_to_text(content: object) -> str:
    """Normalize LangChain message content to plain text.

    LangChain 1.x may return a list of content blocks (dicts with 'text')
    instead of a plain string.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and "text" in block:
                parts.append(str(block["text"]))
        return "".join(parts)
    return str(content)
