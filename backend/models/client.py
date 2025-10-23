# ============================================
# app/models/client.py - Modèles Clients
# ============================================
from pydantic import BaseModel

class ClientStats(BaseModel):
    """Statistiques clients"""
    clients_actifs: int
    panier_moyen: float
    ca_par_client: float
