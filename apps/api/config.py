"""
DevNexus – Application Settings
Reads from environment / .env file via pydantic-settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    # GitHub
    GITHUB_APP_TOKEN: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Auth / Security
    SECRET_KEY: str = "devnexus-jwt-secret-change-in-production"

    # App
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000"

    # Rate limiting defaults
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60


settings = Settings()
