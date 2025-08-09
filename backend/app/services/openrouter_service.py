import aiohttp
from typing import Any
from ..config import settings


async def fetch_openrouter_chat_completion(messages: list[dict[str, str]]) -> str:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    payload: dict[str, Any] = {
        "model": settings.openrouter_model,
        "messages": messages,
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers, timeout=120) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise RuntimeError(f"OpenRouter error {resp.status}: {text}")
            data = await resp.json()
            # Expecting OpenAI-like structure
            try:
                return data["choices"][0]["message"]["content"].strip()
            except Exception as exc:  # noqa: BLE001
                raise RuntimeError("Unexpected OpenRouter response format") from exc


