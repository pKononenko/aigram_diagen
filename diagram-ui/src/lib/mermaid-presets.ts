// src/lib/mermaid-presets.ts
export type MermaidPreset =
  | "slate"
  | "ocean"
  | "sunset"
  | "mint"
  | "rose"
  | "mono"
  | "glass";

// Minimal set Mermaid respects; we keep keys small + stable
type Vars = {
  primaryColor: string;
  primaryBorderColor: string;
  primaryTextColor: string;
  lineColor: string;
  textColor: string;
  tertiaryColor: string;
  clusterBkg?: string;
  clusterBorder?: string;
};

export const MERMAID_PRESETS: Record<MermaidPreset, Vars> = {
  slate: {
    primaryColor: "#111827",
    primaryBorderColor: "#334155",
    primaryTextColor: "#e5e7eb",
    lineColor: "#60a5fa",
    textColor: "#e5e7eb",
    tertiaryColor: "#0b1220",
    clusterBkg: "#0f172a",
    clusterBorder: "#334155",
  },
  ocean: {
    primaryColor: "#0f172a",
    primaryBorderColor: "#155e75",
    primaryTextColor: "#e2f5ff",
    lineColor: "#22d3ee",
    textColor: "#dbeafe",
    tertiaryColor: "#07121f",
    clusterBkg: "#082f49",
    clusterBorder: "#155e75",
  },
  sunset: {
    primaryColor: "#2a1612",
    primaryBorderColor: "#fb923c",
    primaryTextColor: "#ffedd5",
    lineColor: "#fb7185",
    textColor: "#ffedd5",
    tertiaryColor: "#1a0e0b",
    clusterBkg: "#3b1c16",
    clusterBorder: "#fb923c",
  },
  mint: {
    primaryColor: "#052e2b",
    primaryBorderColor: "#34d399",
    primaryTextColor: "#d1fae5",
    lineColor: "#2dd4bf",
    textColor: "#ecfeff",
    tertiaryColor: "#041f1d",
    clusterBkg: "#06332f",
    clusterBorder: "#34d399",
  },
  rose: {
    primaryColor: "#2b1220",
    primaryBorderColor: "#f472b6",
    primaryTextColor: "#ffe4f1",
    lineColor: "#a78bfa",
    textColor: "#ffe4f1",
    tertiaryColor: "#1d0c15",
    clusterBkg: "#341627",
    clusterBorder: "#f472b6",
  },
  mono: {
    primaryColor: "#ffffff",
    primaryBorderColor: "#e5e7eb",
    primaryTextColor: "#0f172a",
    lineColor: "#6b7280",
    textColor: "#111827",
    tertiaryColor: "#f8fafc",
    clusterBkg: "#f8fafc",
    clusterBorder: "#e5e7eb",
  },
  glass: {
    primaryColor: "#ffffffcc",     // semi-translucent via CSS below
    primaryBorderColor: "#e2e8f0",
    primaryTextColor: "#0f172a",
    lineColor: "#64748b",
    textColor: "#0f172a",
    tertiaryColor: "#f8fafc80",
    clusterBkg: "#ffffffaa",
    clusterBorder: "#e2e8f0",
  },
};
