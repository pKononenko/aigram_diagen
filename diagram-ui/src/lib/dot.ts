// shim types are provided in shims-viz.d.ts
import Viz from "viz.js";
import { Module, render } from "viz.js/full.render.js";
import type { SiteTheme } from "../types";

const viz: any = new Viz({ Module, render });

export function dotStyled(inner: string, siteTheme: SiteTheme) {
  const isDark = siteTheme === "dark";
  const graphAttrs =
    `graph [bgcolor="${
      isDark ? "#0b1220" : "white"
    }", pad=12, nodesep=0.5, ranksep=0.7, splines=true];\n` +
    `node  [shape=box, style="rounded,filled", color="${
      isDark ? "#334155" : "#e2e8f0"
    }", fillcolor="${
      isDark ? "#111827" : "#ffffff"
    }", fontname="Inter", fontsize=12];\n` +
    `edge  [color="${
      isDark ? "#64748b" : "#94a3b8"
    }", penwidth=1.5, arrowsize=0.8];\n`;
  if (/^\s*(digraph|graph)\b/i.test(inner))
    return inner.replace(/\{/, "{\n" + graphAttrs);
  return `digraph G {\n${graphAttrs}${inner}\n}`;
}

export async function renderDot(code: string) {
  const svgText = await viz.renderString(code);
  return svgText as string;
}
