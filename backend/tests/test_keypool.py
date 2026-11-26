from app.core.keypool import ApiKeyPool, is_quota_error, parse_api_keys


def test_parse_comma_newline_and_semicolon():
    keys = parse_api_keys("a, b\nc;d\n\n")
    assert keys == ["a", "b", "c", "d"]


def test_parse_json_array():
    assert parse_api_keys('["a", "b"]') == ["a", "b"]


def test_parse_puts_fallback_first_and_dedupes():
    assert parse_api_keys("b,a", "a") == ["a", "b"]


def test_round_robin_order():
    pool = ApiKeyPool(["a", "b", "c"], cooldown_seconds=60)
    assert [pool.acquire() for _ in range(3)] == ["a", "b", "c"]


def test_failed_key_cools_down():
    now = [0.0]
    pool = ApiKeyPool(["a", "b"], cooldown_seconds=10, clock=lambda: now[0])

    assert pool.acquire() == "a"
    pool.mark_failed("a")
    assert pool.acquire() == "b"
    assert pool.acquire() == "b"  # a is still cooling, b is usable

    now[0] = 11.0
    assert pool.acquire() == "a"
    assert pool.cooldown_remaining("a") == 0.0


def test_all_keys_cooling_returns_none():
    now = [0.0]
    pool = ApiKeyPool(["a", "b"], cooldown_seconds=10, clock=lambda: now[0])
    pool.mark_failed("a")
    pool.mark_failed("b")

    assert pool.acquire() is None

    now[0] = 11.0
    assert pool.acquire() in {"a", "b"}


def test_mark_ok_clears_cooldown():
    now = [0.0]
    pool = ApiKeyPool(["a"], cooldown_seconds=10, clock=lambda: now[0])
    pool.mark_failed("a")
    assert pool.cooldown_remaining("a") == 10.0
    pool.mark_ok("a")
    assert pool.cooldown_remaining("a") == 0.0


def test_is_quota_error_detection():
    assert is_quota_error(RuntimeError("429 RESOURCE_EXHAUSTED"))
    assert is_quota_error(RuntimeError("quota exceeded"))
    assert is_quota_error(RuntimeError("rate limit hit"))
    assert is_quota_error(RuntimeError("API key not valid"))
    assert is_quota_error(RuntimeError("401 UNAUTHENTICATED"))
    assert not is_quota_error(RuntimeError("network down"))


def test_transient_error_detection():
    from app.core.keypool import is_transient_error, should_rotate

    assert is_transient_error(RuntimeError("503 UNAVAILABLE"))
    assert is_transient_error(RuntimeError("high demand"))
    assert is_transient_error(RuntimeError("request timed out"))
    assert should_rotate(RuntimeError("503 UNAVAILABLE"))
    assert not is_transient_error(RuntimeError("network down"))
