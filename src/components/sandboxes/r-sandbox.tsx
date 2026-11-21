"use client";

import { useState } from "react";
import { gradeR, type RPlot } from "@/lib/sandboxes/r-engine";
import { Button } from "@/components/ui/button";

export function RSandbox({
  prompt,
  starter,
  solutionCode,
  expectedExpr,
  checkVariable,
  onSolved,
}: {
  prompt: string;
  starter: string;
  solutionCode: string;
  expectedExpr: string;
  checkVariable?: string;
  onSolved: () => void;
}) {
  const [code, setCode] = useState(starter);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [plots, setPlots] = useState<RPlot[]>([]);
  const [ok, setOk] = useState(false);

  function run() {
    const graded = gradeR(code, solutionCode, expectedExpr, checkVariable);
    setMessage(graded.message);
    setPreview(graded.preview);
    setPlots(graded.plots);
    setOk(graded.ok);
    if (graded.ok) onSolved();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--muted)]">{prompt}</p>
      <textarea
        value={code}
        onChange={(event) => {
          setCode(event.target.value);
          setOk(false);
        }}
        rows={8}
        spellCheck={false}
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--accent)]"
        aria-label="R editor"
      />
      <Button onClick={run}>Run and check</Button>
      {message && <p className={`text-sm font-medium ${ok ? "text-[#027A48]" : "text-[#B42318]"}`}>{message}</p>}
      {preview && <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[var(--bg)] px-4 py-3 font-mono text-xs">{preview}</pre>}
      {plots.map((plot, index) => (
        <Chart key={index} plot={plot} />
      ))}
    </div>
  );
}

function Chart({ plot }: { plot: RPlot }) {
  const width = 320;
  const height = 180;
  const max = Math.max(...plot.points.map((point) => point.y), 1);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-2xl bg-[var(--bg)]" role="img" aria-label={`${plot.geom} chart`}>
      {plot.points.map((point, index) => {
        const slot = width / Math.max(plot.points.length, 1);
        const barWidth = slot * 0.62;
        const h = (point.y / max) * (height - 36);
        const x = index * slot + slot * 0.2;
        if (plot.geom === "point" || plot.geom === "line") {
          return <circle key={index} cx={x + barWidth / 2} cy={height - 24 - h} r="4" fill="#0f766e" />;
        }
        return <rect key={index} x={x} y={height - 24 - h} width={barWidth} height={h} rx="4" fill="#0f766e" />;
      })}
    </svg>
  );
}
