"""Configuration de l'application"""
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "epm_retail"
    DB_PORT: int = 5432
    PORT: int = 3131
    N8N_WEBHOOK_URL: str | None = None
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)
    
    @property
    def database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
