"""Email delivery for verification / password-reset links.

If SMTP is not configured, runs in dev mode and logs the link to the console
so the full flow can be tested without a mail provider.
"""

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger("app.core.email")


def send_email(to: str, subject: str, body: str) -> None:
    settings = get_settings()
    if not settings.smtp_host:
        logger.warning("[DEV EMAIL] to=%s subject=%s\n%s", to, subject, body)
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(message)


def send_verification_email(to: str, token: str) -> None:
    settings = get_settings()
    link = f"{settings.frontend_base_url}/verify-email?token={token}"
    send_email(to, "Verify your email", f"Confirm your account: {link}")


def send_password_reset_email(to: str, token: str) -> None:
    settings = get_settings()
    link = f"{settings.frontend_base_url}/reset-password?token={token}"
    send_email(to, "Reset your password", f"Reset your password: {link}")
