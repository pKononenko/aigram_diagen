from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from models import GenerateRequest, GenerateResponse, Graph
from settings import CORS_ORIGINS
from dsl import parse_mini_dsl
from llm import call_groq_for_graph
from renderers import to_mermaid, to_dot

app = FastAPI(openapi_url="/api/openapi.json", title="Text → Diagram")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def graph_from_prompt(prompt: str) -> Graph:
    g = parse_mini_dsl(prompt)
    if g.nodes and (g.edges or "EDGES:" in prompt.upper()):
        return g
    try:
        llm = call_groq_for_graph(prompt)
        if llm.nodes:
            return llm
    except Exception:
        pass
    return g

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    graph = graph_from_prompt(req.prompt)
    if not graph.nodes:
        raise HTTPException(400, "No nodes recognized.")
    if req.renderer == "mermaid":
        code, fence = to_mermaid(graph, req.diagram, req.direction or "TD"), "mermaid"
    elif req.renderer == "dot":
        code, fence = to_dot(graph, req.diagram, req.direction or "TD"), "dot"
    else:
        raise HTTPException(400, "Unknown renderer")
    md = f"```{fence}\n{code}\n```"
    return {"code": code, "markdown": md, "graph": graph}
