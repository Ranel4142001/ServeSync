from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    """
    Application settings parsed from environment variables.
    Provides type safety and auto-validation.
    """
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

    DATABASE_URL: str = Field(
        default="postgresql://servesync:servesync_dev@localhost:5432/servesync_db"
    )
    JWT_SECRET: str = Field(
        default="change-this-in-production-min-32-chars"
    )
    JWT_EXPIRES_IN: str = Field(
        default="7d"
    )
    AWS_BUCKET_NAME: str = Field(
        default=""
    )
    AWS_REGION: str = Field(
        default="ap-southeast-1"
    )
    AWS_ACCESS_KEY_ID: str = Field(
        default=""
    )
    AWS_SECRET_ACCESS_KEY: str = Field(
        default=""
    )
    GEMINI_API_KEY: str = Field(
        default=""
    )
    PORT: int = Field(
        default=8000
    )

settings = Settings()
