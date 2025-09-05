import React, { useEffect, useMemo, useRef, useState } from "react";
import { ENGINES, EXAMPLES } from "./constants";
import Tooltip from "./components/Tooltip";
import CodePanel from "./components/CodePanel";
import useSiteTheme from "./hooks/useSiteTheme";
import { dotStyled, renderDot } from "./lib/dot";
import { generateDiagram } from "./services/api";
import type { DiagramKind, Direction, Engine } from "./types";

import {
  initMermaid,
  mermaidStyled,
  applyDirection,
  renderMermaid,
} from "./lib/mermaid";
import type { MermaidTheme } from "./lib/mermaid";
import { MERMAID_PRESETS, type MermaidPreset } from "./lib/mermaid-presets";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [diagram, setDiagram] = useState<DiagramKind>(EXAMPLES[0].diagram);
  const [engine, setEngine] = useState<Engine>("mermaid");
  const [theme, setTheme] = useState<MermaidTheme>("default"); // Mermaid base theme
  const [stylePreset, setStylePreset] = useState<MermaidPreset>("slate");
  const [direction, setDirection] = useState<Direction>("TD");
  const [code, setCode] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [graphJson, setGraphJson] = useState<any>(null);
  const [svg, setSvg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [siteTheme, setSiteTheme] = useSiteTheme();
  const renderId = useRef(0);

  useEffect(() => {
    initMermaid(theme);
  }, [theme]);

  const effectiveMermaid = useMemo(() => {
    if (engine !== "mermaid" || !code) return "";
    if (diagram !== "flow") return code;
    return applyDirection(code, direction);
  }, [engine, code, diagram, direction]);

  const markdownFence = useMemo(() => {
    const fence =
      engine === "mermaid" ? "mermaid" : engine === "dot" ? "dot" : "json";
    const body = engine === "mermaid" ? effectiveMermaid : code;
    return body ? "```" + fence + "\n" + body + "\n```" : "";
  }, [engine, effectiveMermaid, code]);

  async function onGenerate() {
    setLoading(true);
    setError("");
    setSvg("");
    try {
      const data = await generateDiagram({
        prompt,
        diagram,
        renderer: engine,
        direction,
      });
      setCode(data.code);
      setGraphJson(data.graph);
      setMarkdown(data.markdown || "");
      renderId.current += 1;

      if (engine === "mermaid") {
        const id = `m-${Date.now()}-${renderId.current}`;
        const base =
          diagram === "flow" ? applyDirection(data.code, direction) : data.code;
        const svgOut = await renderMermaid(
          id,
          mermaidStyled(base, theme, stylePreset)
        );
        setSvg(svgOut);
      } else {
        const svgOut = await renderDot(dotStyled(data.code, siteTheme));
        setSvg(svgOut);
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function copy(text?: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
  }
  function download(svgText?: string) {
    if (!svgText) return;
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 dark:bg-slate-900 dark:text-slate-50">
      <div className="mx-auto max-w-6xl grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">DiagramAI</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <label className="text-sm flex items-center gap-1">
                Theme{" "}
                <Tooltip text="Changes the diagram renderer theme (Mermaid only), not the website theme." />
              </label>
              <select
                className="rounded-xl border px-3 py-1.5 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                value={theme}
                onChange={(e) => setTheme(e.target.value as MermaidTheme)}
              >
                <option value="default">default</option>
                <option value="dark">dark</option>
                <option value="neutral">neutral</option>
                <option value="forest">forest</option>
              </select>
              <select
                className="rounded-xl border px-3 py-1.5 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                value={stylePreset}
                onChange={(e) =>
                  setStylePreset(e.target.value as MermaidPreset)
                }
              >
                {Object.keys(MERMAID_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <label className="text-sm">Site</label>
              <select
                className="rounded-xl border px-3 py-1.5 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                value={siteTheme}
                onChange={(e) => setSiteTheme(e.target.value as any)}
              >
                <option value="light">light</option>
                <option value="dark">dark</option>
              </select>
            </div>
          </div>
        </header>

        <section className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white rounded-2xl shadow p-4 dark:bg-slate-800 dark:border-slate-700 border">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="prompt" className="font-medium">
                Description / Mini-DSL
              </label>
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
                  onClick={() => {
                    setPrompt(EXAMPLES[0].prompt);
                    setDiagram(EXAMPLES[0].diagram);
                    setCode("");
                    setSvg("");
                    setGraphJson(null);
                    setError("");
                  }}
                >
                  Use Flow Example
                </button>
                <button
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
                  onClick={() => {
                    setPrompt(EXAMPLES[1].prompt);
                    setDiagram(EXAMPLES[1].diagram);
                    setCode("");
                    setSvg("");
                    setGraphJson(null);
                    setError("");
                  }}
                >
                  Use ER Example
                </button>
              </div>
            </div>

            <textarea
              id="prompt"
              className="w-full h-48 rounded-xl border p-3 font-mono text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                "NODES: A(Service A), B(Service B)\nEDGES: A->B: calls"
              }
            />

            <div className="mt-3 grid md:grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Engine</label>
                <select
                  className="rounded-xl border px-1.5 py-1.5 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value as Engine)}
                >
                  {ENGINES.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Diagram</label>
                <select
                  className="rounded-xl border px-1.5 py-1.5 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  value={diagram}
                  onChange={(e) => setDiagram(e.target.value as DiagramKind)}
                >
                  <option value="flow">flow</option>
                  <option value="er">er</option>
                </select>
              </div>

              {diagram === "flow" &&
                (engine === "mermaid" || engine === "dot") && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Direction</label>
                    <select
                      className="rounded-xl border px-3 py-1.5 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                      value={direction}
                      onChange={(e) =>
                        setDirection(e.target.value as Direction)
                      }
                    >
                      <option value="TD">Top→Down</option>
                      <option value="LR">Left→Right</option>
                      <option value="BT">Bottom→Top</option>
                      <option value="RL">Right→Left</option>
                    </select>
                  </div>
                )}
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={onGenerate}
                disabled={loading}
                className="px-4 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Generating…" : "Generate Diagram"}
              </button>
              <button
                onClick={() =>
                  copy(engine === "mermaid" ? effectiveMermaid : code)
                }
                disabled={!code && !effectiveMermaid}
                className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              >
                Copy Code
              </button>
              <button
                onClick={() => copy(markdownFence)}
                disabled={!markdownFence}
                className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              >
                Copy Markdown
              </button>
              <button
                onClick={() => download(svg)}
                disabled={!svg}
                className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              >
                Download SVG
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
          </div>

          <div className="md:col-span-2 grid gap-4">
            <CodePanel title="Diagram Code">
              {(engine === "mermaid" ? effectiveMermaid : code) ||
                "/* generate to see code */"}
            </CodePanel>
            <CodePanel title="Markdown Snippet">
              {markdownFence || "/* generate to see markdown */"}
            </CodePanel>
            <CodePanel title="Graph JSON">
              {graphJson
                ? JSON.stringify(graphJson, null, 2)
                : "/* generate to see JSON */"}
            </CodePanel>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-4 border dark:bg-slate-800 dark:border-slate-700">
          <div className="text-sm mb-2 font-medium">Diagram Preview</div>
          <div
            className="rounded-xl border p-4 overflow-auto min-h-[200px] dark:border-slate-700"
            dangerouslySetInnerHTML={{
              __html: svg || placeholder("Generate to preview the diagram…"),
            }}
          />
        </section>

        <footer className="text-xs text-gray-500">
          <p>
            Tip: if your frontend runs on :5173 and API on :8000, enable CORS in
            FastAPI or set up a dev proxy.
          </p>
        </footer>
      </div>
    </div>
  );
}

function placeholder(text: string) {
  return `
    <div style="display:flex;align-items:center;justify-content:center;height:180px;color:inherit;opacity:0.7;font-family:ui-sans-serif,system-ui">
      <span>${text}</span>
    </div>
  `;
}
