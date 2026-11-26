from langchain_core.messages import AIMessage, HumanMessage

from app.core.embeddings import RotatingGeminiEmbeddings
from app.core.llm import RotatingGeminiChat


class _FakeGeminiChat:
    calls: list[str] = []

    def __init__(self, model, google_api_key, temperature, max_retries):
        self.key = google_api_key
        _FakeGeminiChat.calls.append(google_api_key)

    def invoke(self, messages, **kwargs):
        if self.key == "bad":
            raise RuntimeError("429 RESOURCE_EXHAUSTED")
        return AIMessage(content="ok")


class _FakeGeminiEmbeddings:
    calls: list[str] = []

    def __init__(self, model, google_api_key):
        self.key = google_api_key
        _FakeGeminiEmbeddings.calls.append(google_api_key)

    def embed_query(self, text):
        if self.key == "bad":
            raise RuntimeError("quota exceeded")
        return [0.1, 0.2]

    def embed_documents(self, texts):
        return [[0.1] for _ in texts]


def test_chat_rotates_to_next_key(monkeypatch):
    _FakeGeminiChat.calls = []
    monkeypatch.setattr(
        "langchain_google_genai.ChatGoogleGenerativeAI", _FakeGeminiChat
    )

    chat = RotatingGeminiChat(
        model_name="fake",
        temperature=0.0,
        keys=["bad", "good"],
        cooldown_seconds=60,
    )
    result = chat.invoke([HumanMessage(content="hi")])

    assert result.content == "ok"
    assert _FakeGeminiChat.calls == ["bad", "good"]


def test_chat_skips_cooling_key_on_next_call(monkeypatch):
    _FakeGeminiChat.calls = []
    monkeypatch.setattr(
        "langchain_google_genai.ChatGoogleGenerativeAI", _FakeGeminiChat
    )

    chat = RotatingGeminiChat(
        model_name="fake",
        temperature=0.0,
        keys=["bad", "good"],
        cooldown_seconds=60,
    )
    chat.invoke([HumanMessage(content="hi")])
    _FakeGeminiChat.calls = []

    chat.invoke([HumanMessage(content="hi")])

    assert _FakeGeminiChat.calls == ["good"]


def test_chat_raises_when_all_keys_are_quota_limited(monkeypatch):
    class _AlwaysQuota(_FakeGeminiChat):
        def invoke(self, messages, **kwargs):
            raise RuntimeError("429 quota")

    monkeypatch.setattr(
        "langchain_google_genai.ChatGoogleGenerativeAI", _AlwaysQuota
    )

    chat = RotatingGeminiChat(
        model_name="fake",
        temperature=0.0,
        keys=["a", "b"],
        cooldown_seconds=60,
    )

    try:
        chat.invoke([HumanMessage(content="hi")])
    except RuntimeError as exc:
        assert "429" in str(exc)
    else:
        raise AssertionError("expected a quota error")


def test_embeddings_rotate_to_next_key(monkeypatch):
    _FakeGeminiEmbeddings.calls = []
    monkeypatch.setattr(
        "langchain_google_genai.GoogleGenerativeAIEmbeddings",
        _FakeGeminiEmbeddings,
    )

    embeddings = RotatingGeminiEmbeddings(
        model_name="fake", keys=["bad", "good"], cooldown_seconds=60
    )

    assert embeddings.embed_query("hello") == [0.1, 0.2]
    assert _FakeGeminiEmbeddings.calls == ["bad", "good"]


def test_config_combines_primary_and_extra_keys():
    from app.core.config import Settings

    settings = Settings(
        gemini_api_key="primary",
        gemini_api_keys="a,b\nc",
    )
    assert settings.all_gemini_api_keys == ["primary", "a", "b", "c"]
