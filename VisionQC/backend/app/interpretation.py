"""Optional visual explanation through OpenRouter. It never decides the verdict."""
import base64, os
import httpx

async def interpret_image(image: bytes, media_type: str) -> str | None:
    key = os.getenv("OPENROUTER_API_KEY")
    if not key: return "Optional interpretation is not configured."
    payload = {"model": os.getenv("OPENROUTER_MODEL", "typesafe/jev-router"), "messages": [{"role": "user", "content": [{"type": "text", "text": "Briefly describe visible product surface irregularities. Advisory only; do not assign a pass/fail verdict."}, {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{base64.b64encode(image).decode()}"}}]}], "max_tokens": 180}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post("https://openrouter.ai/api/v1/chat/completions", headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json", "HTTP-Referer": os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173"), "X-Title": "VisionQC"}, json=payload)
            response.raise_for_status(); return response.json()["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError): return "Optional interpretation could not be completed."
