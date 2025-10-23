# EPM Retail API - FastAPI Backend

API de gestion de performance pour chaÃ®ne de magasins.

## Installation

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
cp .env.example .env
```

## Démarrage

```bash
uvicorn main:app --reload --port 3131
```

## Documentation

- Swagger UI: http://localhost:3131/docs
- ReDoc: http://localhost:3131/redoc

## Endpoints

- GET /api/kpis
- GET /api/store-performance
- GET /api/monthly-trend
- GET /api/category-data
- GET /api/budget-data
- GET /api/produits/top
- GET /api/stock/alertes
- GET /api/clients/actifs
- GET /api/consolidation-data
- POST /api/scenarios

