from app.models import Graph

def to_mermaid(g: Graph, kind: str = "flow", direction: str = "TD") -> str:
    if kind == "flow":
        lines = [f"flowchart {direction}"]
        for n in g.nodes:
            t = (n.label or n.id).replace('"', '\\"')
            lines.append(f'    {n.id}["{t}"]')
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
            lab = (e.label or e.kind or "").replace('"', '\\"')
            lines.append(f'    {e.source} ||--o{{ {e.target} : "{lab}"')
        return "\n".join(lines)
    raise ValueError("Unsupported diagram kind")
