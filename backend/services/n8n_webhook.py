# ============================================
# app/services/n8n_webhook.py - Service webhook n8n
# ============================================
import httpx
from typing import Any

from config import settings

async def send_to_n8n(payload: dict[str, Any]) -> dict | None:
    """Envoie les données au webhook n8n pour analyse"""
    if not settings.N8N_WEBHOOK_URL:
        print("⚠️  N8N_WEBHOOK_URL non configuré")
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.N8N_WEBHOOK_URL,
                json=payload,
                timeout=10.0
            )
            return response.json()
    except Exception as e:
        print(f"❌ Erreur webhook n8n: {e}")
        return {"error": "Impossible d'appeler n8n"}