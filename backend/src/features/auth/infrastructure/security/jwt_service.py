import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from src.config import settings

class JwtService:
    """
    Handles JWT sign and verify operations.
    Conforms to the Clean Architecture security adapters pattern.
    """
    def __init__(self) -> None:
        self.secret = settings.JWT_SECRET
        self.expires_in = settings.JWT_EXPIRES_IN

    def _parse_expires_in(self) -> timedelta:
        """Parses duration strings like '7d' or '24h' into a timedelta."""
        try:
            val = int(self.expires_in[:-1])
            unit = self.expires_in[-1].lower()
            if unit == 'd':
                return timedelta(days=val)
            elif unit == 'h':
                return timedelta(hours=val)
            elif unit == 'm':
                return timedelta(minutes=val)
        except Exception:
            pass
        return timedelta(days=7) # fallback default

    def sign(self, payload: Dict[str, Any]) -> str:
        """Generates a signed JWT access token."""
        data = payload.copy()
        expire = datetime.utcnow() + self._parse_expires_in()
        data.update({"exp": expire})
        return jwt.encode(data, self.secret, algorithm="HS256")

    def verify(self, token: str) -> Optional[Dict[str, Any]]:
        """Verifies JWT token signature and expiry. Returns payload if valid."""
        try:
            decoded = jwt.decode(token, self.secret, algorithms=["HS256"])
            return decoded
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None
