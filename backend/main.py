"""Point d'entrÃ©e FastAPI - EPM Retail API"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, close_db
from app.routers import kpis, stores, products, clients, scenarios

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie"""
    await init_db()
    print(f" Serveur dÃ©marrÃ© sur le port {settings.PORT}")
    yield
    await close_db()

app = FastAPI(
    title="EPM Retail API",
    description="API de gestion de performance",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kpis.router, prefix="/api", tags=["KPIs"])
app.include_router(stores.router, prefix="/api", tags=["Magasins"])
app.include_router(products.router, prefix="/api", tags=["Produits"])
app.include_router(clients.router, prefix="/api", tags=["Clients"])
app.include_router(scenarios.router, prefix="/api", tags=["Scenarios"])

@app.get("/")
async def root():
    return {"message": "EPM Retail API", "version": "2.0.0"}

@app.get("/api/health")
async def health_check():
    from app.database import get_db
    try:
        async with get_db() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "OK", "database": "connected"}
    except Exception as e:
        return {"status": "ERROR", "database": "disconnected", "error": str(e)}
