# ============================================
# app/routers/products.py - Endpoints Produits
# ============================================
from fastapi import APIRouter, HTTPException
from typing import List

from database import get_db
from models.product import TopProduct, StockAlert

router = APIRouter()

@router.get("/produits/top", response_model=List[TopProduct])
async def get_top_products():
    """Top 5 des produits les plus vendus"""
    try:
        async with get_db() as conn:
            rows = await conn.fetch("""
                SELECT 
                    p.nom,
                    SUM(lv.quantite) as quantite_vendue,
                    ROUND(SUM(lv.montant_total_ttc) / 1000) as ca_total,
                    ROUND((p.prix_vente - p.prix_achat) / NULLIF(p.prix_vente, 0) * 100) as marge
                FROM produits p
                JOIN lignes_ventes lv ON p.id = lv.produit_id
                JOIN ventes v ON lv.vente_id = v.id
                WHERE v.statut = 'validee'
                GROUP BY p.id, p.nom, p.prix_vente, p.prix_achat
                ORDER BY quantite_vendue DESC
                LIMIT 5
            """)
            
            return [TopProduct(**dict(row)) for row in rows]
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/stock/alertes", response_model=List[StockAlert])
async def get_stock_alerts():
    """Alertes de stock bas (top 20)"""
    try:
        async with get_db() as conn:
            rows = await conn.fetch("""
                SELECT 
                    m.nom as magasin,
                    p.nom as produit,
                    s.quantite,
                    s.quantite_reservee,
                    (s.quantite - s.quantite_reservee) as disponible,
                    p.stock_minimum,
                    CASE 
                        WHEN (s.quantite - s.quantite_reservee) <= p.stock_minimum THEN 'critique'
                        WHEN (s.quantite - s.quantite_reservee) <= p.stock_securite THEN 'attention'
                        ELSE 'normal'
                    END as niveau_alerte
                FROM stock s
                JOIN magasins m ON s.magasin_id = m.id
                JOIN produits p ON s.produit_id = p.id
                WHERE (s.quantite - s.quantite_reservee) <= p.stock_securite
                ORDER BY 
                    CASE 
                        WHEN (s.quantite - s.quantite_reservee) <= p.stock_minimum THEN 1
                        ELSE 2
                    END,
                    (s.quantite - s.quantite_reservee) ASC
                LIMIT 20
            """)
            
            return [StockAlert(**dict(row)) for row in rows]
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")