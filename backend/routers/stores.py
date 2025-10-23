# ============================================
# app/routers/stores.py - Endpoints Magasins
# ============================================
from fastapi import APIRouter, HTTPException
from typing import List

from database import get_db
from models.store import ConsolidationData

router = APIRouter()

@router.get("/consolidation-data", response_model=List[ConsolidationData])
async def get_consolidation_data():
    """Vue consolidée de tous les magasins"""
    try:
        async with get_db() as conn:
            rows = await conn.fetch("""
                SELECT 
                    m.id,
                    m.nom,
                    m.code_magasin as code,
                    r.nom as region,
                    ROUND(COALESCE(SUM(v.montant_ht), 0) / 1000) as ca,
                    ROUND(m.objectif_ca_mensuel / 1000) as objectif,
                    ROUND(AVG((p.prix_vente - p.prix_achat) / NULLIF(p.prix_vente, 0) * 100), 1) as marge,
                    ROUND(AVG((s.quantite::float / NULLIF(p.stock_securite, 0)) * 100)) as taux_stock,
                    COUNT(DISTINCT v.id) as transactions,
                    COUNT(DISTINCT v.client_id) as clients
                FROM magasins m
                LEFT JOIN regions r ON m.region_id = r.id
                LEFT JOIN ventes v ON m.id = v.magasin_id 
                    AND v.statut = 'validee'
                    AND v.date_vente >= CURRENT_DATE - INTERVAL '30 days'
                LEFT JOIN lignes_ventes lv ON v.id = lv.vente_id
                LEFT JOIN produits p ON lv.produit_id = p.id
                LEFT JOIN stock s ON m.id = s.magasin_id AND p.id = s.produit_id
                WHERE m.statut = 'actif'
                GROUP BY m.id, m.nom, m.code_magasin, r.nom, m.objectif_ca_mensuel
                ORDER BY ca DESC
            """)
            
            result = []
            for row in rows:
                ca = int(row['ca'] or 0)
                objectif = int(row['objectif'] or 0)
                ecart = f"{(((ca - objectif) / objectif) * 100):.1f}" if objectif > 0 else "0.0"
                
                result.append(ConsolidationData(
                    id=row['id'],
                    name=row['nom'],
                    code=row['code'],
                    region=row['region'],
                    ca=ca,
                    objectif=objectif,
                    ecart=ecart,
                    marge=f"{float(row['marge'] or 25):.1f}",
                    stock=int(row['taux_stock'] or 90),
                    transactions=int(row['transactions'] or 0),
                    clients=int(row['clients'] or 0)
                ))
            
            return result
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")
