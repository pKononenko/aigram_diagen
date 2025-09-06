import json
from groq import Groq
from app.settings import GROQ_API_KEY, GROQ_MODEL, GROQ_URL
from app.models import Graph
from app.prompts.chart_md_gen_prompt import chart_prompt

_client: Groq = None

def _client_lazy() -> Groq:
    global _client
    if _client is None:
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set")
        kwargs = {"api_key": GROQ_API_KEY}
        # Groq SDK follows OpenAI-style; base_url is optional (defaults to Groq)
        #if GROQ_URL:
        #    kwargs["base_url"] = GROQ_URL
        _client = Groq(**kwargs)
    return _client

def coerce_json(text: str) -> dict:
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise ValueError("Groq returned non-JSON content")

def call_groq_for_graph(user_prompt: str) -> Graph:
    client = _client_lazy()
    resp = client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=0.5,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": chart_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    content = resp.choices[0].message.content
    return Graph.model_validate(coerce_json(content))
