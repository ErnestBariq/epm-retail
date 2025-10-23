# ============================================
# app/routers/simulations.py - Endpoints Simulations
# ============================================
import logging
from typing import List
from datetime import datetime
from typing import Optional

import uuid
import json

from fastapi import APIRouter, HTTPException

from models import scenario
from services.calculations import calculate_simulation_results, generate_evolution_data, generate_store_impact
from database import get_db
from models.simulation import SimulationRequest, SimulationResult, SimulationResponse
from models.scenario import EvolutionItem, ScenarioCreate, ScenarioDetail, ScenarioParameters, ScenarioResponse, ScenarioUpdate, StoreImpact

router = APIRouter()

# Mapping des périodes vers les intervalles PostgreSQL
PERIOD_INTERVALS = {
    '1_month': '1 month',
    '3_months': '3 months',
    '6_months': '6 months',
    '1_year': '1 year',
    '2_years': '2 years',
}

@router.post("/simulations", response_model=SimulationResponse)
async def simulate_scenario(simulation: SimulationRequest):
    """Simulation what-if avec différents paramètres"""
    try:
        async with get_db() as conn:
        # Payload
            # created_by : "user"
            # description : ""
            # name : "da"
            # parameters : {}
            # period : "6_months"
            # revenue_impact : 0
            # scenario_type : "what_if"
            # simulation_type : "promotion"

            # CA actuel sur les 6 derniers mois en k€ : DATE_TRUNC('month', CURRENT_DATE)
            # Récupération de la période
            logging.info(f"Période demandée: {simulation.period}")

            period_interval = PERIOD_INTERVALS.get(simulation.period, '6 months')
            logging.info(f"Interval SQL: {period_interval}")

            # Validation de sécurité
            assert period_interval in PERIOD_INTERVALS.values(), "Invalid period interval"

            ca_actuel = await conn.fetchval(f"""
                SELECT SUM(montant_ht) / 1000
                FROM ventes
                WHERE statut = 'validee'
                    AND date_vente >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '{period_interval}');
            """) or 3800

            logging.info(f"CA actuel calculé: {ca_actuel}")
            
            # Marge actuelle
            marge_actuelle = await conn.fetchval(f"""
                SELECT AVG((p.prix_vente - p.prix_achat) / NULLIF(p.prix_vente, 0) * 100)
                FROM produits p
                JOIN lignes_ventes lv ON p.id = lv.produit_id
                JOIN ventes v ON lv.vente_id = v.id
                WHERE v.statut = 'validee'
                    AND date_vente >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '{period_interval}');
            """) or 27
            
            # Construire l'objet ScenarioParameters à partir des paramètres fournis
            param_obj = ScenarioParameters(**simulation.parameters);

            # Calculer les résultats de la simulation
            results = calculate_simulation_results(
                simulation.simulation_type,
                param_obj,
                simulation.period
            )
            
            # Calculer la probabilité basée sur le type et les résultats
            probability = 75.0
            if results.roi > 200:
                probability = 85.0
            elif results.roi < 100:
                probability = 60.0

            # Générer les données complémentaires
            evolution_data = generate_evolution_data(results.revenue_impact, simulation.period)
            store_impact = generate_store_impact()

            return SimulationResponse(
                results=results,
                evolution_data=evolution_data,
                store_impact=store_impact,
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des simulations: {str(e)}")
