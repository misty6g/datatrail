"use client";

import { useState } from "react";
import { gradeSql, runSql, type SqlResult } from "@/lib/sandboxes/sql-browser";
import { DatasetDrawer } from "./dataset-drawer";
import { ResultTable } from "./result-table";
import { Button } from "@/components/ui/button";

export function SqlSandbox({
  prompt,
  datasetId,
  starter,
  solutionQuery,
  requiredClauses,
  onSolved,
}: {
  prompt: string;
  datasetId: string;
  starter: string;
  solutionQuery: string;
  requiredClauses?: string[];
  onSolved: () => void;
}) {
  const [code, setCode] = useState(starter);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [result, setResult] = useState<SqlResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(grade: boolean) {
    setBusy(true);
    try {
      if (!grade) {
        const next = await runSql(code);
        setResult(next);
        setMessage("Query finished.");
        setOk(false);
      } else {
        const graded = await gradeSql(code, solutionQuery, requiredClauses);
        setResult(graded.result);
        setMessage(graded.message);
        setOk(graded.ok);
        if (graded.ok) onSolved();
      }
    } catch (error) {
      setResult(null);
      setOk(false);
      setMessage(error instanceof Error ? error.message : "Could not run that SQL.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--muted)]">{prompt}</p>
      <DatasetDrawer tableName={datasetId} />
      <textarea
        value={code}
        onChange={(event) => {
          setCode(event.target.value);
          setOk(false);
        }}
        rows={7}
        spellCheck={false}
        className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--accent)]"
        aria-label="SQL editor"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => run(false)} disabled={busy} variant="secondary">
          Run
        </Button>
        <Button onClick={() => run(true)} disabled={busy}>
          Check
        </Button>
      </div>
      {message && (
        <p className={`text-sm font-medium ${ok ? "text-[#027A48]" : "text-[#B42318]"}`}>{message}</p>
      )}
      {result && <ResultTable columns={result.columns} rows={result.rows} />}
    </div>
  );
}
