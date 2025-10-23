# ============================================
# app/models/product.py - Modèles Produits
# ============================================
from pydantic import BaseModel

class TopProduct(BaseModel):
    """Top produit vendu"""
    nom: str
    quantite_vendue: int
    ca_total: int
    marge: int

class StockAlert(BaseModel):
    """Alerte de stock"""
    magasin: str
    produit: str
    quantite: int
    quantite_reservee: int
    disponible: int
    stock_minimum: int
    niveau_alerte: str