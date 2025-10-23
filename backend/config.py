# ============================================
# app/config.py - Configuration
# ============================================
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Configuration de l'application"""

# Webhook Configuration
# WEBHOOK_URL=http://thor:5678/webhook-test/462cd1e4-4187-44c6-9ea4-351d6149f1b6

    # JWT
    JWT_SECRET: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_EXPIRES_IN: str = "24h"

    # Base de données
    DB_HOST: str = "192.168.100.200"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "admin"
    DB_NAME: str = "epm_retail"
    DB_PORT: int = 5433
    
    # Serveur
    PORT: int = 3131
    
    # Webhook n8n
    N8N_WEBHOOK_URL: str = "http://localhost:5678/webhook-test/analyse-chiffres"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)
    
    @property
    def database_url(self) -> str:
        """URL de connexion PostgreSQL"""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()