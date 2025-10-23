# ============================================
# app/models/store.py - Modèles Magasins
# ============================================
from pydantic import BaseModel

class ConsolidationData(BaseModel):
    """Données de consolidation par magasin"""
    id: int
    name: str
    code: str
    region: str
    ca: int
    objectif: int
    ecart: str
    marge: str
    stock: int
    transactions: int
    clients: int