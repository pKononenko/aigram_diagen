export type SiteTheme = "light" | "dark";
export type Engine = "mermaid" | "dot";
export type DiagramKind = "flow" | "er";
export type Direction = "TD" | "LR" | "BT" | "RL";

export interface Node {
  id: string;
  label?: string | null;
  kind?: string | null;
  props?: Record<string, string> | null;
}
export interface Edge {
  source: string;
  target: string;
  label?: string | null;
  kind?: string | null;
}
export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface GenerateResponse {
  code: string;
  markdown: string;
  graph: Graph;
}
