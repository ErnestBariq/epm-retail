# ============================================
# app/routers/clients.py - Endpoints Clients
# ============================================
from fastapi import APIRouter, HTTPException

from database import get_db
from models.client import ClientStats

router = APIRouter()

@router.get("/clients/actifs", response_model=ClientStats)
async def get_active_clients():
    """Statistiques des clients actifs (30 derniers jours)"""
    try:
        async with get_db() as conn:
            row = await conn.fetchrow("""
                SELECT 
                    COUNT(DISTINCT c.id) as clients_actifs,
                    ROUND(AVG(v.montant_ttc), 2) as panier_moyen,
                    ROUND(SUM(v.montant_ttc) / NULLIF(COUNT(DISTINCT c.id), 0), 2) as ca_par_client
                FROM clients c
                JOIN ventes v ON c.id = v.client_id
                WHERE v.statut = 'validee'
                    AND v.date_vente >= CURRENT_DATE - INTERVAL '30 days'
            """)
            
            return ClientStats(
                clients_actifs=int(row['clients_actifs'] or 0),
                panier_moyen=float(row['panier_moyen'] or 0),
                ca_par_client=float(row['ca_par_client'] or 0)
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des Clients: {str(e)}")