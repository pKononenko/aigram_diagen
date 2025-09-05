# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Literal, Optional, Dict
import os, re, json, requests

from starlette.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")  # override if you like
GROQ_URL = os.getenv("GROQ_URL", "https://api.groq.com/openai/v1/chat/completions")

app = FastAPI(openapi_url="/api/openapi.json", title="Text → Diagram")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your Pages domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- schema ----------
class Node(BaseModel):
    id: str
    label: Optional[str] = None
    kind: Optional[str] = None
    props: Optional[Dict[str, str]] = None

class Edge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None
    kind: Optional[str] = None

class Graph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class GenerateRequest(BaseModel):
    prompt: str
    diagram: Literal["flow", "er"] = "flow"
    renderer: Literal["mermaid", "dot", "plantuml", "excalidraw"] = "mermaid"
    direction: Optional[Literal["TD", "LR", "BT", "RL"]] = "TD"  # for flow

class GenerateResponse(BaseModel):
    code: str          # diagram text for chosen renderer
    markdown: str      # fenced snippet
    graph: Graph

# ---------- API ----------
@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    graph = graph_from_prompt(req.prompt)
    if not graph.nodes:
        raise HTTPException(400, "Не вдалося розпізнати жодного вузла. Спробуйте міні-DSL або увімкніть Groq.")

    if req.renderer == "mermaid":
        code = to_mermaid(graph, req.diagram, req.direction or "TD")
        fence = "mermaid"
    elif req.renderer == "dot":
        code = to_dot(graph, req.diagram, req.direction or "TD")
        fence = "dot"
    elif req.renderer == "plantuml":
        code = to_plantuml(graph, req.diagram)
        fence = "plantuml"
    elif req.renderer == "excalidraw":
        code = to_excalidraw(graph, req.diagram)  # JSON string
        fence = "json"
    else:
        raise HTTPException(400, "Unknown renderer")

    md = f"```{fence}\n{code}\n```"
    return {"code": code, "markdown": md, "graph": graph}

# ---------- graph creation (DSL → LLM fallback) ----------
def graph_from_prompt(prompt: str) -> Graph:
    """Try mini-DSL first; if nothing useful, ask Groq to return strict JSON Graph."""
    g = parse_mini_dsl(prompt)
    if g.nodes and (g.edges or "EDGES:" in prompt.upper()):
        return g

    # fallback to Groq if key is present
    if GROQ_API_KEY:
        try:
            return call_groq_for_graph(prompt)
        except Exception as e:
            # If Groq fails, keep whatever DSL gave us (can be empty)
            print("Groq error:", e)

    return g  # may be empty; the /generate handler guards and returns 400

def parse_mini_dsl(prompt: str) -> Graph:
    nodes: List[Node] = []
    edges: List[Edge] = []

    m_nodes = re.search(r"NODES:(.*?)(?:EDGES:|$)", prompt, re.S | re.I)
    m_edges = re.search(r"EDGES:(.*)$", prompt, re.S | re.I)

    if m_nodes:
        for nid, label in re.findall(r"([A-Za-z0-9_]+)\(([^)]*)\)", m_nodes.group(1)):
            nodes.append(Node(id=nid.strip(), label=label.strip()))

    if m_edges:
        for a, b, label in re.findall(r"([A-Za-z0-9_]+)\s*->\s*([A-Za-z0-9_]+)\s*:\s*([^;\n]+)", m_edges.group(1)):
            edges.append(Edge(source=a.strip(), target=b.strip(), label=label.strip()))

    return Graph(nodes=nodes, edges=edges)

# ---------- Groq LLM ----------
SYSTEM_PROMPT = """You convert short natural-language descriptions into a compact JSON graph.

Rules:
- Output ONLY JSON. No prose.
- Schema:
  {
    "nodes": [{"id": "API", "label": "API Server", "kind": null, "props": null}, ...],
    "edges": [{"source": "User", "target": "API", "label": "logs in", "kind": null}, ...]
  }
- 'id' must be short (1-12 chars), unique, alphanumeric or underscore.
- Labels are human-readable names.
- Include edges whenever relationships are mentioned (A -> B : label).
- Do not invent extra entities beyond the description.
"""

def call_groq_for_graph(user_prompt: str) -> Graph:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    }
    resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
    if resp.status_code >= 400:
        raise RuntimeError(f"Groq API error {resp.status_code}: {resp.text}")

    data = resp.json()
    # OpenAI-compatible shape
    content = data["choices"][0]["message"]["content"]
    obj = coerce_json(content)
    return Graph.model_validate(obj)

def coerce_json(text: str) -> dict:
    """Accepts plain JSON or fenced/loose text; extracts the first JSON object."""
    text = text.strip()
    # Quick path
    try:
        return json.loads(text)
    except Exception:
        pass
    # Extract between first '{' and last '}'.
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        snippet = text[start : end + 1]
        return json.loads(snippet)
    raise ValueError("Groq returned non-JSON content")

# ---------- generators ----------
def to_mermaid(g: Graph, kind: str = "flow", direction: str = "TD") -> str:
    if kind == "flow":
        lines = [f"flowchart {direction}"]
        for n in g.nodes:
            text = (n.label or n.id).replace('"', '\\"')
            lines.append(f'    {n.id}["{text}"]')
        for e in g.edges:
            lab = (e.label or "").replace('"', '\\"')
            arrow = f'-- {lab} -->' if lab else '-->'
            lines.append(f'    {e.source} {arrow} {e.target}')
        return "\n".join(lines)

    if kind == "er":
        lines = ["erDiagram"]
        seen = set()
        for n in g.nodes:
            if n.id not in seen:
                lines.append(f"    {n.id} {{ }}")
                seen.add(n.id)
        for e in g.edges:
            label = (e.label or e.kind or "").replace('"', '\\"')
            lines.append(f'    {e.source} ||--o{{ {e.target} : "{label}"')
        return "\n".join(lines)

    raise ValueError("Unsupported diagram kind")

def to_dot(g: Graph, kind: str = "flow", direction: str = "TD") -> str:
    rank = {"TD": "TB", "BT": "BT", "LR": "LR", "RL": "RL"}.get(direction, "TB")
    lines = ["digraph G {", f"  rankdir={rank};", "  node [shape=box];"]
    for n in g.nodes:
        label = (n.label or n.id).replace('"', '\\"')
        lines.append(f'  {n.id} [label="{label}"];')
    for e in g.edges:
        lab = (e.label or "").replace('"', '\\"')
        if lab:
            lines.append(f'  {e.source} -> {e.target} [label="{lab}"];')
        else:
            lines.append(f'  {e.source} -> {e.target};')
    lines.append("}")
    return "\n".join(lines)

def to_plantuml(g: Graph, kind: str = "flow") -> str:
    L = ["@startuml", "skinparam shadowing false", "skinparam rectangleBorderRoundCorner 12"]
    for n in g.nodes:
        label = (n.label or n.id).replace('"', '\\"')
        L.append(f'rectangle "{label}" as {n.id}')
    for e in g.edges:
        lab = (e.label or "")
        L.append(f'{e.source} --> {e.target}' + (f' : {lab}' if lab else ''))
    L.append("@enduml")
    return "\n".join(L)

def to_excalidraw(g: Graph, kind: str = "flow") -> str:
    # naive layout: 3 per row
    dx, dy = 240, 160
    elements = []
    for i, n in enumerate(g.nodes):
        elements.append({
            "type": "rectangle",
            "version": 1, "versionNonce": 0, "isDeleted": False, "id": n.id,
            "x": (i % 3) * dx, "y": (i // 3) * dy, "width": 180, "height": 60,
            "angle": 0, "strokeColor": "#1e293b", "backgroundColor": "#ffffff",
            "roughness": 1, "seed": i, "text": n.label or n.id, "fontSize": 20
        })
    for j, e in enumerate(g.edges):
        elements.append({
            "type": "arrow", "version": 1, "versionNonce": 0, "isDeleted": False,
            "id": f"edge_{j}",
            "points": [{"x": 0, "y": 0}, {"x": 120, "y": 0}],
            "x": 30 + (j % 3) * dx, "y": 90 + (j // 3) * dy
        })
    doc = {"type": "excalidraw", "version": 2, "source": "text2diagram",
           "elements": elements, "appState": {}}
    return json.dumps(doc, ensure_ascii=False, indent=2)
