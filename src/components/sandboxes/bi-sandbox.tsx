"use client";

import { useMemo, useState } from "react";
import type { BiTargetSpec, Pill } from "@/lib/curriculum/types";
import {
  emptySpec,
  evaluateDax,
  gradeBi,
  modelRelationships,
  querySteps,
  tableauChart,
  tableauFields,
  applyQuerySteps,
} from "@/lib/sandboxes/bi-engine";
import { Button } from "@/components/ui/button";

export function BiSandbox({
  tool,
  prompt,
  targetSpec,
  starterSpec,
  onSolved,
}: {
  tool: "tableau" | "powerbi";
  prompt: string;
  targetSpec: BiTargetSpec;
  starterSpec?: Partial<BiTargetSpec>;
  onSolved: () => void;
}) {
  const initial = useMemo<BiTargetSpec>(
    () => ({ ...emptySpec(targetSpec.mode), ...starterSpec, mode: targetSpec.mode }),
    [starterSpec, targetSpec.mode],
  );
  const [spec, setSpec] = useState<BiTargetSpec>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [shelf, setShelf] = useState<"columns" | "rows" | "color">("rows");

  function check() {
    const graded = gradeBi(spec, targetSpec);
    setMessage(graded.message);
    setOk(graded.ok);
    if (graded.ok) onSolved();
  }

  function addPill(field: string, kind: "dimension" | "measure") {
    const pill: Pill = { field, agg: kind === "measure" ? "SUM" : null };
    setOk(false);
    setSpec((current) => {
      if (shelf === "color") return { ...current, color: pill };
      const list = [...(current[shelf] ?? []), pill];
      return { ...current, [shelf]: list };
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--muted)]">{prompt}</p>
      {targetSpec.mode === "tableau" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["columns", "rows", "color"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setShelf(item)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${shelf === item ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-[var(--surface-2)] text-[var(--ink)]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {tableauFields.map((field) => (
              <button
                key={field.field}
                type="button"
                onClick={() => addPill(field.field, field.kind)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${field.kind === "measure" ? "bg-[#d8f3dc] text-[#1b4332]" : "bg-[#dbeafe] text-[#1e3a8a]"}`}
              >
                {field.field}
              </button>
            ))}
          </div>
          <ShelfList label="Columns" pills={spec.columns ?? []} />
          <ShelfList label="Rows" pills={spec.rows ?? []} />
          <div className="flex flex-wrap gap-2">
            {(["bar", "line", "circle", "text"] as const).map((mark) => (
              <button
                key={mark}
                type="button"
                onClick={() => setSpec((current) => ({ ...current, mark }))}
                className={`rounded-xl px-3 py-1 text-xs font-semibold ${spec.mark === mark ? "bg-[var(--ink)] text-white" : "bg-[var(--surface-2)]"}`}
              >
                {mark}
              </button>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setSpec(initial)}>
              Clear
            </Button>
          </div>
          <MiniChart points={tableauChart(spec)} />
        </div>
      )}
      {targetSpec.mode === "dax" && (
        <div className="space-y-3">
          <textarea
            value={spec.expression ?? ""}
            onChange={(event) => {
              setOk(false);
              setSpec((current) => ({ ...current, expression: event.target.value }));
            }}
            rows={4}
            spellCheck={false}
            className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 font-mono text-sm outline-none"
            aria-label="DAX measure"
          />
          <p className="text-sm text-[var(--muted)]">
            Preview: {Number.isFinite(evaluateDax(spec.expression ?? "", targetSpec.reportFilters ?? []))
              ? evaluateDax(spec.expression ?? "", targetSpec.reportFilters ?? []).toLocaleString()
              : "—"}
          </p>
        </div>
      )}
      {targetSpec.mode === "query" && (
        <div className="space-y-2">
          {querySteps.map((step) => {
            const enabled = spec.steps?.includes(step.id) ?? false;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setOk(false);
                  setSpec((current) => {
                    const steps = current.steps ?? [];
                    return {
                      ...current,
                      steps: enabled ? steps.filter((item) => item !== step.id) : [...steps, step.id],
                    };
                  });
                }}
                className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm ${enabled ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--line)]"}`}
              >
                {enabled ? "On" : "Off"} · {step.label}
              </button>
            );
          })}
          <p className="text-xs text-[var(--muted)]">{applyQuerySteps(spec.steps ?? []).length} rows after these steps</p>
        </div>
      )}
      {targetSpec.mode === "model" && (
        <div className="space-y-2">
          {modelRelationships.map((relationship) => {
            const active = spec.relationships?.find((item) => item.from === relationship.from && item.to === relationship.to)?.active ?? false;
            return (
              <button
                key={relationship.from}
                type="button"
                onClick={() => {
                  setOk(false);
                  setSpec((current) => ({
                    ...current,
                    relationships: (current.relationships ?? modelRelationships).map((item) =>
                      item.from === relationship.from ? { ...item, active: !item.active } : item,
                    ),
                  }));
                }}
                className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm ${active ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--line)]"}`}
              >
                {active ? "Active" : "Inactive"} · {relationship.from} → {relationship.to}
              </button>
            );
          })}
        </div>
      )}
      <Button onClick={check}>Check {tool === "tableau" ? "view" : "model"}</Button>
      {message && <p className={`text-sm font-medium ${ok ? "text-[#027A48]" : "text-[#B42318]"}`}>{message}</p>}
    </div>
  );
}

function ShelfList({ label, pills }: { label: string; pills: Pill[] }) {
  return (
    <p className="text-xs text-[var(--muted)]">
      <span className="font-semibold text-[var(--ink)]">{label}: </span>
      {pills.length ? pills.map((pill) => `${pill.agg ? `${pill.agg}(${pill.field})` : pill.field}`).join(", ") : "empty"}
    </p>
  );
}

function MiniChart({ points }: { points: { x: string; y: number }[] }) {
  if (!points.length) return <p className="text-xs text-[var(--muted)]">Add a dimension and a measure to preview the view.</p>;
  const max = Math.max(...points.map((point) => point.y), 1);
  return (
    <div className="flex h-32 items-end gap-2 rounded-2xl bg-[var(--bg)] p-3">
      {points.slice(0, 8).map((point) => (
        <div key={point.x} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-[var(--accent)]" style={{ height: `${(point.y / max) * 80}px` }} />
          <span className="w-full truncate text-center text-[10px] text-[var(--muted)]">{point.x}</span>
        </div>
      ))}
    </div>
  );
}
