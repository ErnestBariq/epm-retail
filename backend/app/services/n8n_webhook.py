"""Service webhook n8n"""
import httpx
from typing import Any
from app.config import settings

async def send_to_n8n(payload: dict[str, Any]) -> dict | None:
    if not settings.N8N_WEBHOOK_URL:
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
        print(f"Erreur n8n: {e}")
        return {"error": str(e)}
