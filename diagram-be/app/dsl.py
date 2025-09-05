import re
from typing import List
from app.models import Graph, Node, Edge

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
