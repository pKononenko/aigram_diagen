from app.models import Graph

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
