# ============================================
# app/models/scenario.py - Modèles Scénarios
# ============================================
from typing import List, Optional
from pydantic import BaseModel, Field
from models.simulation import SimulationRequest, SimulationResult, EvolutionItem, StoreImpact

# ============================================
# Models
# ============================================

class ScenarioParameters(BaseModel):
    category: Optional[str] = None
    price_change: Optional[float] = None
    promo_type: Optional[str] = None
    discount: Optional[float] = None
    marketing_budget: Optional[float] = None
    traffic_increase: Optional[float] = None
    city: Optional[str] = None
    surface: Optional[float] = None
    investment: Optional[float] = None
    monthly_revenue: Optional[float] = None
    cost_type: Optional[str] = None
    cost_reduction: Optional[float] = None
    implementation_cost: Optional[float] = None
    service_impact: Optional[str] = None

class ScenarioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    scenario_type: str  # what_if, budget, forecast, stress_test
    simulation_type: str  # price_change, promotion, new_store, cost_optimization
    period: str  # 1_month, 3_months, 6_months, 12_months
    parameters: ScenarioParameters
    created_by: Optional[str] = "system"

class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    parameters: Optional[ScenarioParameters] = None

class ScenarioResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    scenario_type: str
    simulation_type: str
    period: str
    parameters: dict
    revenue_impact: float
    cost_impact: float
    margin_impact: float
    probability: float
    status: str
    created_at: int
    created_by: str

class ScenarioDetail(ScenarioResponse):
    results: Optional[SimulationResult] = None

    # Remplacer Optional[List[...]] = None par Field(default_factory=list)
    evolution_data: List[EvolutionItem] = Field(default_factory=list)
    
    # Remplacer Optional[List[...]] = None par Field(default_factory=list)
    store_impact: List[StoreImpact] = Field(default_factory=list)