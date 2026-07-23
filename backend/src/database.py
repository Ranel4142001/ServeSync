from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from src.config import settings

# In industry, for standard PostgreSQL, we use psycopg2 driver via connection pooling
# pool_pre_ping checks connection health before returning it, avoiding stale socket errors
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency generator yielding a scoped SQLAlchemy database session.
    Automatically handles session closing when request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
