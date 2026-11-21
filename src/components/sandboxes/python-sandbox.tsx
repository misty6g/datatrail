"use client";

import { useEffect, useRef, useState } from "react";
import { pythonDatasetSetup } from "@/lib/curriculum/datasets";
import { Button } from "@/components/ui/button";

type WorkerResult = { type: "ready" } | { type: "result"; ok: boolean; stdout: string; error?: string };

export function PythonSandbox({
  prompt,
  starter,
  setupCode,
  solutionCode,
  validationCode,
  onSolved,
}: {
  prompt: string;
  starter: string;
  setupCode?: string;
  solutionCode: string;
  validationCode: string;
  onSolved: () => void;
}) {
  const solvedRef = useRef(onSolved);
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState(starter);
  const [output, setOutput] = useState("Python loads the first time you open a lesson. This can take a moment.");
  const [ok, setOk] = useState(false);
  const pending = useRef<"run" | "check" | null>(null);

  useEffect(() => {
    solvedRef.current = onSolved;
  });

  useEffect(() => {
    const worker = new Worker("/workers/pyodide-worker.js");
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      if (event.data.type === "ready") {
        setReady(true);
        setOutput("Python is ready.");
        return;
      }
      const checking = pending.current === "check";
      pending.current = null;
      setOutput(event.data.ok ? event.data.stdout || "Finished with no printed output." : event.data.error || "Python error");
      setOk(checking && event.data.ok);
      if (checking && event.data.ok) solvedRef.current();
    };
    worker.postMessage({ type: "init" });
    return () => worker.terminate();
  }, []);

  function submit(mode: "run" | "check") {
    if (!workerRef.current || !ready) return;
    pending.current = mode;
    setOutput(mode === "check" ? "Checking…" : "Running…");
    setOk(false);
    workerRef.current.postMessage({
      type: "run",
      setup: `${pythonDatasetSetup()}\n${setupCode ?? ""}`,
      code: mode === "check" ? code : code,
      validation: mode === "check" ? validationCode : "None",
    });
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
        aria-label="Python editor"
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={!ready} onClick={() => submit("run")}>
          {ready ? "Run" : "Loading Python…"}
        </Button>
        <Button disabled={!ready} onClick={() => submit("check")}>
          Check
        </Button>
      </div>
      <pre className={`overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[var(--bg)] px-4 py-3 font-mono text-xs ${ok ? "text-[#027A48]" : "text-[var(--ink)]"}`}>
        {output}
      </pre>
      <p className="sr-only">Reference solution available after you solve it: {solutionCode}</p>
    </div>
  );
}
