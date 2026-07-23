import bcrypt

class HashService:
    """
    Handles password hashing and validation.
    Conforms to the Clean Architecture security adapters pattern.
    """
    def hash(self, password: str) -> str:
        """Hashes a plaintext password using bcrypt."""
        # bcrypt demands bytes as input
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_bytes = bcrypt.hashpw(password_bytes, salt)
        return hashed_bytes.decode('utf-8')

    def compare(self, password: str, hashed_password: str) -> bool:
        """Compares plaintext password with stored hash. Returns true if matching."""
        try:
            password_bytes = password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception:
            return False
