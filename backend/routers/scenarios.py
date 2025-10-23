# ============================================
# app/routers/scenarios.py - Endpoints Scénarios
# ============================================
from typing import List
from datetime import datetime
from typing import Optional

import uuid
import json

from fastapi import APIRouter, HTTPException

from services.calculations import calculate_simulation_results, generate_evolution_data, generate_store_impact
from database import get_db
from models.simulation import SimulationRequest
from models.scenario import EvolutionItem, ScenarioCreate, ScenarioDetail, ScenarioParameters, ScenarioResponse, ScenarioUpdate, StoreImpact

router = APIRouter()

# ============================================
# Endpoints
# ============================================

@router.get("/scenarios", response_model=List[ScenarioResponse])
async def get_scenarios(status: Optional[str] = None):
    """Récupérer tous les scénarios"""
    try:
        async with get_db() as conn:
            query = """
                SELECT id, name, description, scenario_type, 
                       parameters, revenue_impact, cost_impact, margin_impact,
                       probability, status, created_at, created_by
                FROM scenarios
                WHERE deleted = FALSE
            """
            params = []
            
            if status:
                query += " AND status = $1"
                params.append(status)
            
            query += " ORDER BY created_at DESC"
            
            rows = await conn.fetch(query, *params)
            
            scenarios = []
            for row in rows:
                params_dict = {} #row['parameters']
                scenarios.append(ScenarioResponse(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    scenario_type=row['scenario_type'],
                    simulation_type=params_dict.get('simulation_type', 'unknown'),
                    period=params_dict.get('period', '6_months'),
                    parameters=params_dict,
                    revenue_impact=float(row['revenue_impact']),
                    cost_impact=float(row['cost_impact']),
                    margin_impact=float(row['margin_impact']),
                    probability=float(row['probability']),
                    status=row['status'],
                    created_at=row['created_at'],
                    created_by=row['created_by']
                ))
            
            return scenarios
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des scénarios: {str(e)}")

@router.get("/scenarios/{scenario_id}", response_model=ScenarioDetail)
async def get_scenario(scenario_id: str):
    """Récupérer un scénario spécifique avec tous les détails"""
    try:
        async with get_db() as conn:
            row = await conn.fetchrow("""
                SELECT id, name, description, scenario_type, 
                       parameters, revenue_impact, cost_impact, margin_impact,
                       probability, status, created_at, created_by
                FROM scenarios
                WHERE id = $1 AND deleted = FALSE
            """, scenario_id)
            
            if not row:
                raise HTTPException(status_code=404, detail="Scénario non trouvé")
            
            params_dict = json.loads(row['parameters'])
            simulation_type = params_dict.get('simulation_type', 'unknown')
            period = params_dict.get('period', '6_months')
            
            # Recalculer les résultats détaillés
            param_obj = ScenarioParameters(**{k: v for k, v in params_dict.items() 
                                              if k not in ['simulation_type', 'period']})
            results = calculate_simulation_results(simulation_type, param_obj, period)
            
            # Générer les données
            evolution_data = generate_evolution_data(float(row['revenue_impact']), period)
            store_impact = generate_store_impact()
            
            return ScenarioDetail(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                scenario_type=row['scenario_type'],
                simulation_type=simulation_type,
                period=period,
                parameters=params_dict,
                revenue_impact=float(row['revenue_impact']),
                cost_impact=float(row['cost_impact']),
                margin_impact=float(row['margin_impact']),
                probability=float(row['probability']),
                status=row['status'],
                created_at=row['created_at'],
                created_by=row['created_by'],
                results=results,
                evolution_data=evolution_data,
                store_impact=store_impact
            )
            
    except HTTPException as http:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du scénario: {str(http)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du scénario: {str(e)}")

@router.post("/scenarios", response_model=ScenarioDetail)
async def create_scenario(scenario: ScenarioCreate):
    """Créer et simuler un nouveau scénario"""
    try:
        async with get_db() as conn:
            # print("Payload reçu :", scenario)
            # print("Parameters type:", type(scenario.parameters))

            scenario_id = str(uuid.uuid4())
            current_time = int(datetime.now().timestamp() * 1000)
            
            parameters_json = json.dumps({
                'simulation_type': scenario.simulation_type,
                'period': scenario.period,
                **scenario.parameters.model_dump(exclude_none=True)
            })
            
            # Calculer les résultats de la simulation
            results = calculate_simulation_results(
                scenario.simulation_type,
                scenario.parameters,
                scenario.period
            )
            
            # Calculer la probabilité basée sur le type et les résultats
            probability = 75.0
            if results.roi > 200:
                probability = 85.0
            elif results.roi < 100:
                probability = 60.0
            
            # Insérer le scénario
            await conn.execute("""
                INSERT INTO scenarios (
                    id, name, description, scenario_type, 
                    parameters, revenue_impact, cost_impact, margin_impact,
                    probability, status, created_by, created_at, updated_at,
                    base_period, deleted
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            """, scenario_id, scenario.name, scenario.description, scenario.scenario_type,
                 parameters_json ,
                 results.revenue_impact, results.cost_impact, results.margin_impact,
                 probability, 'active', scenario.created_by, current_time, current_time,
                 datetime.now(), False)
            
            # Générer les données complémentaires
            evolution_data = generate_evolution_data(results.revenue_impact, scenario.period)
            store_impact = generate_store_impact()
                     
            return ScenarioDetail(
                id=scenario_id,
                name=scenario.name,
                description=scenario.description,
                scenario_type=scenario.scenario_type,
                simulation_type=scenario.simulation_type,
                period=scenario.period,
                parameters=scenario.parameters.model_dump(exclude_none=True),
                revenue_impact=results.revenue_impact,
                cost_impact=results.cost_impact,
                margin_impact=results.margin_impact,
                probability=probability,
                status='active',
                created_at=current_time,
                created_by=scenario.created_by,
                results=results,
                evolution_data=evolution_data,
                store_impact=store_impact
            )
            
    except Exception as e:
        import traceback
        print("❌ ERREUR SERVEUR /scenarios:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"{e}")

@router.put("/scenarios/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(scenario_id: str, update: ScenarioUpdate):
    """Mettre à jour un scénario"""
    try:
        async with get_db() as conn:
            # Vérifier que le scénario existe
            exists = await conn.fetchval(
                "SELECT id FROM scenarios WHERE id = $1 AND deleted = FALSE",
                scenario_id
            )
            
            if not exists:
                raise HTTPException(status_code=404, detail="Scénario non trouvé")
            
            # Construire la requête de mise à jour
            updates = []
            params = []
            param_count = 1
            
            if update.name is not None:
                updates.append(f"name = ${param_count}")
                params.append(update.name)
                param_count += 1
            
            if update.description is not None:
                updates.append(f"description = ${param_count}")
                params.append(update.description)
                param_count += 1
            
            if update.status is not None:
                updates.append(f"status = ${param_count}")
                params.append(update.status)
                param_count += 1
            
            if update.parameters is not None:
                updates.append(f"parameters = parameters || ${param_count}::jsonb")
                params.append(update.parameters.dict(exclude_none=True))
                param_count += 1
            
            updates.append(f"updated_at = ${param_count}")
            params.append(int(datetime.now().timestamp() * 1000))
            param_count += 1
            
            params.append(scenario_id)
            
            query = f"""
                UPDATE scenarios
                SET {', '.join(updates)}
                WHERE id = ${param_count}
                RETURNING id, name, description, scenario_type, parameters,
                          revenue_impact, cost_impact, margin_impact,
                          probability, status, created_at, created_by
            """
            
            row = await conn.fetchrow(query, *params)
            
            params_dict = dict(row['parameters'])
            
            return ScenarioResponse(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                scenario_type=row['scenario_type'],
                simulation_type=params_dict.get('simulation_type', 'unknown'),
                period=params_dict.get('period', '6_months'),
                parameters=params_dict,
                revenue_impact=float(row['revenue_impact']),
                cost_impact=float(row['cost_impact']),
                margin_impact=float(row['margin_impact']),
                probability=float(row['probability']),
                status=row['status'],
                created_at=row['created_at'],
                created_by=row['created_by']
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour du scénario: {str(e)}")

@router.delete("/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: str):
    """Supprimer un scénario (soft delete)"""
    try:
        async with get_db() as conn:
            result = await conn.execute("""
                UPDATE scenarios
                SET deleted = TRUE, updated_at = $1
                WHERE id = $2 AND deleted = FALSE
            """, int(datetime.now().timestamp() * 1000), scenario_id)
            
            if result == "UPDATE 0":
                raise HTTPException(status_code=404, detail="Scénario non trouvé")
            
            return {"message": "Scénario supprimé avec succès"}
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression du scénario: {str(e)}")

@router.post("/scenarios/{scenario_id}/duplicate", response_model=ScenarioResponse)
async def duplicate_scenario(scenario_id: str):
    """Dupliquer un scénario existant"""
    try:
        async with get_db() as conn:
            # Récupérer le scénario original
            row = await conn.fetchrow("""
                SELECT name, description, scenario_type, parameters,
                       revenue_impact, cost_impact, margin_impact,
                       probability, created_by
                FROM scenarios
                WHERE id = $1 AND deleted = FALSE
            """, scenario_id)
            
            if not row:
                raise HTTPException(status_code=404, detail="Scénario non trouvé")
            
            # Créer le duplicata
            new_id = str(uuid.uuid4())
            current_time = int(datetime.now().timestamp() * 1000)
            new_name = f"{row['name']} (Copie)"
            
            await conn.execute("""
                INSERT INTO scenarios (
                    id, name, description, scenario_type, 
                    parameters, revenue_impact, cost_impact, margin_impact,
                    probability, status, created_by, created_at, updated_at,
                    base_period, deleted
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            """, new_id, new_name, row['description'], row['scenario_type'],
                 row['parameters'], row['revenue_impact'], row['cost_impact'], 
                 row['margin_impact'], row['probability'], 'draft', row['created_by'],
                 current_time, current_time, datetime.now(), False)
            
            params_dict = dict(row['parameters'])
            
            return ScenarioResponse(
                id=new_id,
                name=new_name,
                description=row['description'],
                scenario_type=row['scenario_type'],
                simulation_type=params_dict.get('simulation_type', 'unknown'),
                period=params_dict.get('period', '6_months'),
                parameters=params_dict,
                revenue_impact=float(row['revenue_impact']),
                cost_impact=float(row['cost_impact']),
                margin_impact=float(row['margin_impact']),
                probability=float(row['probability']),
                status='draft',
                created_at=current_time,
                created_by=row['created_by']
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la duplication du scénario: {str(e)}")