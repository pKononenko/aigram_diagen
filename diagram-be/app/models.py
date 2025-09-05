from pydantic import BaseModel
from typing import List, Optional, Dict, Literal

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
    renderer: Literal["mermaid", "dot"] = "mermaid"
    direction: Optional[Literal["TD", "LR", "BT", "RL"]] = "TD"

class GenerateResponse(BaseModel):
    code: str
    markdown: str
    graph: Graph
