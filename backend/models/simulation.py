# =============================================
# app/models/simulation.py - Modèles Simulation
# =============================================
from typing import List, Optional
from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    """Paramètres de simulation what-if"""
    promo: float = Field(0, description="Pourcentage de promotion")
    nouveauxMagasins: int = Field(0, description="Nombre de nouveaux magasins")
    coutPersonnel: float = Field(0, description="Variation du coût personnel en %")
    period: str = Field("6_months", description="Période de simulation")
    simulation_type: str = Field("promotion", description="Type de simulation: price_change, promotion, new_store, cost_optimization")
    parameters: Optional[dict] = Field(default_factory=dict, description="Paramètres additionnels pour la simulation")  
    # Pour des simulations plus avancées, on pourrait ajouter d'autres paramètres ici       
    # created_by: str = Field("user", description="Identifiant de l'utilisateur ayant créé la simulation")
    # name:"Optimisation coûts opérationnels"
    # parameters: {discount: 6}
    # revenue_impact: 0
    # scenario_type: "what_if"

class SimulationResult(BaseModel):
    revenue_impact: float
    margin_impact: float
    cost_impact: float
    revenue_percent: float
    margin_percent: float
    cost_percent: float
    roi: float

    optimistic_revenue: float
    optimistic_margin: float
    realistic_revenue: float
    realistic_margin: float
    pessimistic_revenue: float
    pessimistic_margin: float

class StoreImpact(BaseModel):
    id: str
    impact: float
    # Utilisez Field(default=...) pour que ces champs soient vraiment optionnels lors de la création à partir d'un dict.
    ca_prevu: float = Field(default=0.0) 
    ca_impact: float = Field(default=0.0)
    marge_prevue: float = Field(default=0.0)
    marge_impact: float = Field(default=0.0)
    
    # Pour les listes, l'utilisation de Field est aussi recommandée pour la clarté
    details: List[dict] = Field(default_factory=list) 

class EvolutionItem(BaseModel):
    month: str
    baseline: float = Field(default=0.0)
    with_simulation: float = Field(default=0.0)

# class ScenarioDetail(ScenarioResponse):
#     results: Optional[SimulationResult] = None
#     # Remplacer Optional[List[...]] = None par Field(default_factory=list)
#     evolution_data: List[EvolutionItem] = Field(default_factory=list)
    
#     # Remplacer Optional[List[...]] = None par Field(default_factory=list)
#     store_impact: List[StoreImpact] = Field(default_factory=list)


class SimulationResponse(BaseModel):
    results: Optional[SimulationResult] = None

    # Remplacer Optional[List[...]] = None par Field(default_factory=list)
    evolution_data: List[EvolutionItem] = Field(default_factory=list)
    
    # Remplacer Optional[List[...]] = None par Field(default_factory=list)
    store_impact: List[StoreImpact] = Field(default_factory=list)