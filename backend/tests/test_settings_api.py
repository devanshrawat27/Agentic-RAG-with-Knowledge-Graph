from app.core.security import verify_password


def test_update_profile_name(client, db_session):
    response = client.patch("/api/auth/me", json={"name": "Devansh Rawat"})
    assert response.status_code == 200
    assert response.json()["name"] == "Devansh Rawat"

    assert client.patch("/api/auth/me", json={"name": "   "}).status_code == 422


def test_change_password(client, db_session):
    from app.db.models import User

    wrong = client.post(
        "/api/auth/change-password",
        json={"current_password": "wrong", "new_password": "NewPassword123"},
    )
    assert wrong.status_code == 400

    short = client.post(
        "/api/auth/change-password",
        json={"current_password": "Password123", "new_password": "short"},
    )
    assert short.status_code == 422

    ok = client.post(
        "/api/auth/change-password",
        json={"current_password": "Password123", "new_password": "NewPassword123"},
    )
    assert ok.status_code == 200

    user = db_session.get(User, 1)
    assert user is not None
    assert verify_password("NewPassword123", user.password_hash)
