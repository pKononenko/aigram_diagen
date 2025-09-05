import { API_BASE } from "../constants";
import type {
  DiagramKind,
  Direction,
  Engine,
  GenerateResponse,
} from "../types";

export async function generateDiagram(params: {
  prompt: string;
  diagram: DiagramKind;
  renderer: Engine;
  direction: Direction;
}): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as GenerateResponse | { detail?: string };
  if (!res.ok) throw new Error((data as any)?.detail || "Request failed");
  return data as GenerateResponse;
}
