# ============================================
# main.py - Point d'entrée FastAPI
# ============================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database import init_db, close_db
from routers import kpis, stores, products, clients, scenarios, simulations

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    # Startup
    await init_db()
    print(f"🚀 Serveur EPM Retail démarré sur le port {settings.PORT}")
    print(f"📊 Endpoints disponibles:")
    print(f"   - GET  /api/health")
    print(f"   - GET  /api/kpis")
    print(f"   - GET  /api/store-performance")
    print(f"   - GET  /api/monthly-trend")
    print(f"   - GET  /api/category-data")
    print(f"   - GET  /api/budget-data")
    print(f"   - GET  /api/produits/top")
    print(f"   - GET  /api/stock/alertes")
    print(f"   - GET  /api/clients/actifs")
    print(f"   - GET  /api/consolidation-data")
    print(f"   - POST /api/scenarios")
    print(f"   - POST /api/simulations")    
    yield
    
    # Shutdown
    await close_db()
    print("👋 Serveur arrêté")

app = FastAPI(
    title="EPM Retail API",
    description="API de gestion de performance pour chaîne de magasins",
    version="2.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routers
app.include_router(kpis.router, prefix="/api", tags=["KPIs"])
app.include_router(stores.router, prefix="/api", tags=["Magasins"])
app.include_router(products.router, prefix="/api", tags=["Produits"])
app.include_router(clients.router, prefix="/api", tags=["Clients"])
app.include_router(scenarios.router, prefix="/api", tags=["Scénarios"])
app.include_router(simulations.router, prefix="/api", tags=["Simulations"])

# @app.get("/api/health")
# async def health_check():
#     """Health check de l'API et de la base de données"""
#     from app.database import get_db
    
#     try:
#         async with get_db() as conn:
#             await conn.fetchval("SELECT 1")
#         return {"status": "OK", "database": "connected"}
#     except Exception as e:
#         return {"status": "ERROR", "database": "disconnected", "error": str(e)}