# ============================================
# app/database.py - Gestion de la connexion DB
# ============================================
import asyncpg
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from config import settings

# Pool de connexions global
_pool: asyncpg.Pool | None = None

async def init_db():
    """Initialise le pool de connexions"""
    global _pool
    _pool = await asyncpg.create_pool(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME,
        port=settings.DB_PORT,
        min_size=5,
        max_size=20,
    )
    print("✅ Pool de connexions PostgreSQL créé")

async def close_db():
    """Ferme le pool de connexions"""
    global _pool
    if _pool:
        await _pool.close()
        print("✅ Pool de connexions fermé")

@asynccontextmanager
async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    """Récupère une connexion du pool"""
    if not _pool:
        raise RuntimeError("Le pool de connexions n'est pas initialisé")
    
    async with _pool.acquire() as conn:
        yield conn
