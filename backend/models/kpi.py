# ============================================
# app/models/kpi.py - Modèles Pydantic pour KPIs
# ============================================
from pydantic import BaseModel, Field

class KPI(BaseModel):
    """Modèle pour un KPI"""
    label: str
    value: str
    evolution: str
    icon: str
    color: str

class TopStore(BaseModel):
    """Top magasin pour le tableau du dashboard"""
    name: str
    revenue: float
    margin: float
    growth: float
    status: str  # 'excellent', 'bon', 'moyen', 'faible'
    
class StorePerformance(BaseModel):
    """Performance d'un magasin"""
    name: str
    ca: int = Field(..., description="Chiffre d'affaires en milliers d'euros")
    objectif: int = Field(..., description="Objectif en milliers d'euros")
    marge: int = Field(..., description="Marge en pourcentage")
    stock: int = Field(..., description="Niveau de stock en pourcentage")

class StorePerformanceResponse(BaseModel):
    """Réponse de l'endpoint store-performance"""
    data: list[StorePerformance]
    analysis: dict | None = None

class MonthlyTrend(BaseModel):
    """Tendance mensuelle"""
    mois: str
    ca: int
    prevision: int
    marge: int

class MonthlyTrendResponse(BaseModel):
    """Réponse de l'endpoint monthly-trend"""
    data: list[MonthlyTrend]
    analysis: dict | None = None

class CategoryData(BaseModel):
    """Données par catégorie"""
    name: str
    value: int
    color: str

class RegionData(BaseModel):
    """Données par région"""
    name: str
    nb_magasins: int
    percentage: float
    """color: str"""

class BudgetData(BaseModel):
    """Données budget"""
    categorie: str
    budget: int
    reel: int
    ecart: int
