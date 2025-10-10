"""Gestion de la connexion DB"""
import asyncpg
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from app.config import settings

_pool: asyncpg.Pool | None = None

async def init_db():
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
    print(" Pool PostgreSQL crÃ©Ã©")

async def close_db():
    global _pool
    if _pool:
        await _pool.close()

@asynccontextmanager
async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    if not _pool:
        raise RuntimeError("Pool non initialisÃ©")
    async with _pool.acquire() as conn:
        yield conn
