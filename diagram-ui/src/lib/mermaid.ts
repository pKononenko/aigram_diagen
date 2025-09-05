// src/lib/mermaid.ts
import mermaid from "mermaid";
import { MERMAID_PRESETS, type MermaidPreset } from "./mermaid-presets";

export type MermaidTheme = "default" | "dark" | "neutral" | "forest";

export function initMermaid(theme: MermaidTheme) {
  mermaid.initialize({ startOnLoad: false, theme });
}

export function applyDirection(src: string, dir: "TD" | "LR" | "BT" | "RL") {
  if (!src) return src;
  if (/^\s*flowchart\s+\w+/m.test(src))
    return src.replace(/^\s*flowchart\s+\w+/m, `flowchart ${dir}`);
  return `flowchart ${dir}\n${src}`;
}

export async function renderMermaid(id: string, src: string) {
  const { svg } = await mermaid.render(id, src);
  return svg;
}

export function mermaidStyled(
  src: string,
  chartTheme: MermaidTheme,
  preset: MermaidPreset
) {
  const v = MERMAID_PRESETS[preset];

  const cfg = {
    theme: chartTheme, // built-in base (default/dark/neutral/forest)
    themeVariables: {
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system",
      primaryColor: v.primaryColor,
      primaryBorderColor: v.primaryBorderColor,
      primaryTextColor: v.primaryTextColor,
      lineColor: v.lineColor,
      textColor: v.textColor,
      tertiaryColor: v.tertiaryColor,
      clusterBkg: v.clusterBkg,
      clusterBorder: v.clusterBorder,
    },
    flowchart: {
      curve: "basis",
      padding: 12,
      nodeSpacing: 48,
      rankSpacing: 64,
    },
    themeCSS: `
      .node rect,.node circle,.node ellipse { rx:14; ry:14; filter: drop-shadow(0 4px 12px rgba(0,0,0,.12)); }
      .edgePath path { stroke-width: 1.6px; }
      .edgeLabel { font-weight: 600; }
      .cluster rect { rx:16; ry:16; }
      /* glass preset tweak */
      ${
        preset === "glass"
          ? `.node rect { backdrop-filter: blur(6px); fill-opacity:.85 }`
          : ""
      }
    `,
  };

  const init = `%%{init: ${JSON.stringify(cfg)} }%%`;
  const classDefaults =
    `classDef default fill:${v.primaryColor},` +
    `stroke:${v.primaryBorderColor},` +
    `color:${v.primaryTextColor},rx:14,ry:14;`;

  return `${init}\n${src}\n${classDefaults}\n`;
}
