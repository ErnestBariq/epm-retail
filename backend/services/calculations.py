# ============================================
# Helper Functions
# ============================================

from typing import List
import uuid
from models.scenario import ScenarioParameters
from models.simulation import SimulationResult, EvolutionItem, StoreImpact

def calculate_simulation_results(simulation_type: str, parameters: ScenarioParameters, period: str) -> SimulationResult:
    """Calcule les résultats d'une simulation basée sur le type et les paramètres"""
    
    base_revenue = 2400000  # CA mensuel de base
    base_margin = 0.35
    base_costs = base_revenue * (1 - base_margin)
    
    # Multiplicateur de période
    period_multiplier = {
        '1_month': 1,
        '3_months': 3,
        '6_months': 6,
        '12_months': 12
    }.get(period, 1)
    
    results = {
        'revenue_impact': 0,
        'margin_impact': 0,
        'cost_impact': 0,
        'revenue_percent': 0,
        'margin_percent': 0,
        'cost_percent': 0,
        'roi': 0
    }
    
    if simulation_type == 'promotion':
        discount = parameters.discount or 20
        marketing_budget = parameters.marketing_budget or 50000
        traffic_increase = parameters.traffic_increase or 25
        
        # Impact sur le CA
        revenue_increase = base_revenue * (traffic_increase / 100) * 0.7
        results['revenue_impact'] = (revenue_increase - marketing_budget) * period_multiplier
        
        # Impact sur la marge (réduite par la promotion)
        margin_reduction = discount * 0.015
        results['margin_impact'] = (revenue_increase * (base_margin - margin_reduction)) * period_multiplier
        
        # Impact sur les coûts
        results['cost_impact'] = -marketing_budget * period_multiplier
        
        # ROI
        if marketing_budget > 0:
            results['roi'] = (results['margin_impact'] / marketing_budget) * 100
        
    elif simulation_type == 'new_store':
        monthly_revenue = parameters.monthly_revenue or 120000
        investment = parameters.investment or 250000
        
        results['revenue_impact'] = monthly_revenue * period_multiplier
        results['margin_impact'] = monthly_revenue * base_margin * period_multiplier
        results['cost_impact'] = investment
        
        if investment > 0:
            results['roi'] = (results['margin_impact'] / investment) * 100
            
    elif simulation_type == 'cost_optimization':
        cost_reduction = parameters.cost_reduction or 5
        implementation_cost = parameters.implementation_cost or 25000
        
        monthly_savings = base_costs * (cost_reduction / 100)
        results['cost_impact'] = -(monthly_savings * period_multiplier - implementation_cost)
        results['margin_impact'] = monthly_savings * period_multiplier
        results['revenue_impact'] = 0
        
        if implementation_cost > 0:
            results['roi'] = (results['margin_impact'] / implementation_cost) * 100
            
    elif simulation_type == 'price_change':
        price_change = parameters.price_change or -10
        
        # Elasticité prix simplifiée
        volume_change = -price_change * 1.5  # Elasticité de 1.5
        
        revenue_change = base_revenue * (price_change / 100) + base_revenue * (volume_change / 100)
        results['revenue_impact'] = revenue_change * period_multiplier
        
        # Impact marge
        if price_change > 0:
            results['margin_impact'] = revenue_change * (base_margin + 0.05) * period_multiplier
        else:
            results['margin_impact'] = revenue_change * (base_margin - 0.02) * period_multiplier
            
        results['roi'] = 400 if price_change > 0 else 200
    
    # Calcul des pourcentages
    if base_revenue > 0:
        results['revenue_percent'] = (results['revenue_impact'] / (base_revenue * period_multiplier)) * 100
    
    base_monthly_margin = base_revenue * base_margin
    if base_monthly_margin > 0:
        results['margin_percent'] = (results['margin_impact'] / (base_monthly_margin * period_multiplier)) * 100
    
    if base_costs > 0:
        results['cost_percent'] = (results['cost_impact'] / (base_costs * period_multiplier)) * 100
    
    # Scénarios optimiste/pessimiste
    results['optimistic_revenue'] = results['revenue_impact'] * 1.2
    results['optimistic_margin'] = results['margin_impact'] * 1.24
    results['realistic_revenue'] = results['revenue_impact']
    results['realistic_margin'] = results['margin_impact']
    results['pessimistic_revenue'] = results['revenue_impact'] * 0.85
    results['pessimistic_margin'] = results['margin_impact'] * 0.74
    
    return SimulationResult(**results)

def generate_evolution_data(base_impact: float, period: str) -> List[EvolutionItem]:
    """Génère les données d'évolution temporelle"""
    base_revenue = 2400000
    months = {
        '1_month': 1,
        '3_months': 3,
        '6_months': 6,
        '12_months': 12
    }.get(period, 6)
    
    evolution = []
    for i in range(months):
        factor = 1.0 + (0.1 * (i / months)) - (0.05 * ((i - months/2) ** 2) / (months ** 2))
        evolution.append(EvolutionItem(
            month=f'Mois {i+1}',
            baseline=base_revenue,
            with_simulation=base_revenue + (base_impact * factor / months)
        ))
    
    return evolution

def generate_store_impact() -> List[StoreImpact]:
    """Génère l'impact par magasin"""
    stores = ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Bordeaux']
    base_impacts = [35000, 28000, 22000, 21000, 19000, 17000]
    
    return [
        StoreImpact(
            id=str(uuid.uuid4()),        # Génère un id unique
            impact=impact,
            ca_prevu=0.0,
            ca_impact=0.0,
            marge_prevue=0.0,
            marge_impact=0.0,
            details=[]
        )
        for store, impact in zip(stores, base_impacts)
    ]
