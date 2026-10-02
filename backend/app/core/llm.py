"""LLM factory: Google Gemini primary, Ollama local fallback.

Both providers return LangChain chat models, so agents call `.invoke(...)` the
same way. `get_llm()` picks the provider from settings; `get_llm_with_fallback`
wraps the primary with a fallback for transient errors (e.g. 503 high demand).
"""

from functools import lru_cache

from langchain_core.language_models import BaseChatModel

from app.core.config import get_settings


@lru_cache
def get_gemini_llm(temperature: float = 0.0) -> BaseChatModel:
    from langchain_google_genai import ChatGoogleGenerativeAI

    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=temperature,
        max_retries=settings.llm_max_retries,
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
