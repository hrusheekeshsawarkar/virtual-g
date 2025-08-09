from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    mongodb_uri: str = Field(..., env="MONGODB_URI")
    jwt_secret_key: str = Field(..., env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    openrouter_api_key: str = Field(..., env="OPENROUTER_API_KEY")
    openrouter_model: str = Field("openrouter/auto", env="OPENROUTER_MODEL")
    database_name: str = Field("virtual_g", env="MONGODB_DB")

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / "env",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()  # type: ignore[call-arg]


