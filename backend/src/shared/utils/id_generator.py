import uuid6

def generate_uuid7() -> str:
    """
    Generates a time-ordered, cryptographically secure UUID v7 (RFC 9562).
    Excellent for PostgreSQL primary keys to avoid index page fragmentation
    and preserve insert speeds.
    """
    return str(uuid6.uuid7())

def encode_id(type_name: str, internal_id: str) -> str:
    """
    Transforms an internal database UUID string ID into the public string format.
    With UUIDs, the internal ID is already secure, so we return it directly.
    """
    if not internal_id:
        raise ValueError(f"Invalid internal ID provided for type {type_name}")
    return internal_id

def decode_id(public_id: str) -> str:
    """
    Reverses public string format back into database UUID.
    With UUIDs, this is a pass-through.
    """
    if not public_id or not isinstance(public_id, str):
        raise ValueError("Public ID must be a valid string")
    return public_id
