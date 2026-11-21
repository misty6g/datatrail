"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { answersMatch, cn } from "@/lib/utils";
import type { Lesson, LessonStep } from "@/lib/curriculum/types";
import { SqlSandbox } from "./sandboxes/sql-sandbox";
import { PythonSandbox } from "./sandboxes/python-sandbox";
import { RSandbox } from "./sandboxes/r-sandbox";
import { BiSandbox } from "./sandboxes/bi-sandbox";
import { DatasetDrawer } from "./sandboxes/dataset-drawer";

export function LessonPlayer({
  courseId,
  lesson,
  nextHref,
  initialStep = 0,
}: {
  courseId: string;
  lesson: Lesson;
  nextHref: string | null;
  initialStep?: number;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(Math.min(initialStep, lesson.steps.length));
  const [passed, setPassed] = useState<Set<number>>(() => new Set(Array.from({ length: Math.min(initialStep, lesson.steps.length) }, (_, i) => i)));
  const [finished, setFinished] = useState(initialStep >= lesson.steps.length);
  const step = lesson.steps[Math.min(index, lesson.steps.length - 1)];
  const xp = (finished ? lesson.steps.length * 20 + 30 : passed.size * 20);

  async function save(nextIndex: number, complete: boolean) {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        lessonId: lesson.id,
        status: complete ? "completed" : "started",
        currentStep: nextIndex,
        score: complete ? 100 : null,
        xpEarned: complete ? lesson.steps.length * 20 + 30 : nextIndex * 20,
      }),
    });
    router.refresh();
  }

  function markPassed() {
    setPassed((current) => new Set(current).add(index));
  }

  async function continueStep() {
    const next = index + 1;
    if (next >= lesson.steps.length) {
      setFinished(true);
      await save(lesson.steps.length, true);
      return;
    }
    setIndex(next);
    await save(next, false);
  }

  if (finished) {
    return (
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Lesson complete</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">{lesson.title}</h1>
        <p className="mt-3 text-[var(--muted)]">You earned {lesson.steps.length * 20 + 30} XP across {lesson.steps.length} steps.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {nextHref ? <Button onClick={() => router.push(nextHref)}>Next lesson</Button> : <Button onClick={() => router.push(`/learn/${courseId}`)}>Back to track</Button>}
          <Button variant="secondary" onClick={() => { setFinished(false); setIndex(0); }}>Review</Button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(index / lesson.steps.length) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-[var(--muted)]">
          Step {index + 1}/{lesson.steps.length} · {xp} XP
        </span>
      </div>
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
        <StepView key={`${lesson.id}-${step.id}`} step={step} solved={passed.has(index)} onSolved={markPassed} />
        <div className="mt-6 flex flex-wrap gap-3">
          {index > 0 && (
            <Button variant="secondary" onClick={() => setIndex((current) => Math.max(0, current - 1))}>
              Back
            </Button>
          )}
          {(step.kind === "concept" || passed.has(index)) && (
            <Button onClick={continueStep}>{index === lesson.steps.length - 1 ? "Finish lesson" : "Continue"}</Button>
          )}
        </div>
      </section>
    </div>
  );
}

function StepView({ step, solved, onSolved }: { step: LessonStep; solved: boolean; onSolved: () => void }) {
  if (step.kind === "concept") {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Concept</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">{step.title}</h1>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-[var(--muted)]">
          {step.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        {step.codeExample && (
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-[var(--bg)] p-4 font-mono text-sm text-[var(--ink)]">
            {step.codeExample.code}
            {step.codeExample.output ? `\n\n${step.codeExample.output}` : ""}
          </pre>
        )}
        {step.datasetId && <div className="mt-4"><DatasetDrawer tableName={step.datasetId} /></div>}
        <p className="mt-4 rounded-2xl bg-[var(--accent)]/10 px-4 py-3 text-sm font-medium text-[var(--ink)]">{step.takeaway}</p>
      </div>
    );
  }
  if (step.kind === "sql_sandbox") {
    return <SqlSandbox {...step} onSolved={onSolved} />;
  }
  if (step.kind === "python_sandbox") {
    return <PythonSandbox {...step} onSolved={onSolved} />;
  }
  if (step.kind === "r_sandbox") {
    return <RSandbox {...step} onSolved={onSolved} />;
  }
  if (step.kind === "bi_sandbox") {
    return <BiSandbox {...step} onSolved={onSolved} />;
  }
  return <QuizStep step={step} solved={solved} onSolved={onSolved} />;
}

function QuizStep({
  step,
  solved,
  onSolved,
}: {
  step: Extract<LessonStep, { kind: "multiple_choice" | "spot_bug" | "tap_tokens" | "fill_blank" | "order" }>;
  solved: boolean;
  onSolved: () => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [bugLine, setBugLine] = useState<number | null>(null);
  const [fix, setFix] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>(() => (step.kind === "order" ? shuffled(step.items, step.answer) : []));
  const [message, setMessage] = useState<string | null>(solved ? "Already completed." : null);
  const [ok, setOk] = useState(solved);

  const hint = "hint" in step ? step.hint : undefined;

  function check() {
    let passed = false;
    let explanation = "";
    if (step.kind === "multiple_choice") {
      passed = choice === step.answer;
      explanation = step.explanation;
    } else if (step.kind === "spot_bug") {
      passed = bugLine === step.buggyLine && fix === step.fixAnswer;
      explanation = step.explanation;
    } else if (step.kind === "fill_blank") {
      passed = answersMatch(text, step.answer);
      explanation = passed ? "That fills the blank." : "Check the spelling and the function name.";
    } else if (step.kind === "tap_tokens") {
      passed = JSON.stringify(slots) === JSON.stringify(step.answer);
      explanation = passed ? "The statement is assembled." : "The slots are not in the right order yet.";
    } else {
      passed = JSON.stringify(order) === JSON.stringify(step.answer);
      explanation = step.explanation ?? (passed ? "That order is right." : "Not the right sequence yet.");
    }
    setOk(passed);
    setMessage(passed ? explanation : hint ? `${explanation} Hint: ${hint}` : explanation);
    if (passed) onSolved();
  }

  const bank = useMemo(() => (step.kind === "tap_tokens" ? step.bank.filter((token) => !slots.includes(token)) : []), [slots, step]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Try it</p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">{step.prompt}</h2>
      {"codeContext" in step && step.codeContext && (
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-[var(--bg)] p-3 font-mono text-xs">{step.codeContext}</pre>
      )}
      <div className="mt-4 space-y-2">
        {step.kind === "multiple_choice" && step.choices.map((choiceText, choiceIndex) => (
          <button key={choiceText} type="button" onClick={() => { setChoice(choiceIndex); setOk(false); }} className={cn("flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm", choice === choiceIndex ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--line)]")}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-bold">{String.fromCharCode(65 + choiceIndex)}</span>
            {choiceText}
          </button>
        ))}
        {step.kind === "spot_bug" && step.lines.map((line, lineIndex) => (
          <button key={line} type="button" onClick={() => setBugLine(lineIndex)} className={cn("block w-full rounded-xl border px-3 py-2 text-left font-mono text-xs", bugLine === lineIndex ? "border-[#B42318] bg-[#FEF3F2]" : "border-[var(--line)]")}>
            {lineIndex + 1}. {line}
          </button>
        ))}
        {step.kind === "spot_bug" && bugLine !== null && step.fixChoices.map((choiceText, choiceIndex) => (
          <button key={choiceText} type="button" onClick={() => setFix(choiceIndex)} className={cn("block w-full rounded-2xl border px-4 py-3 text-left text-sm", fix === choiceIndex ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--line)]")}>
            {choiceText}
          </button>
        ))}
        {step.kind === "fill_blank" && (
          <div>
            {step.codeTemplate && <pre className="mb-2 font-mono text-xs text-[var(--muted)]">{step.codeTemplate}</pre>}
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder={step.placeholder ?? "Your answer"} className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 font-mono text-sm outline-none" />
          </div>
        )}
        {step.kind === "tap_tokens" && (
          <div>
            <div className="flex flex-wrap gap-2 rounded-2xl bg-[var(--bg)] p-3">
              {step.template.map((token, tokenIndex) => token ? (
                <span key={`${token}-${tokenIndex}`} className="rounded-lg bg-[var(--surface-2)] px-2 py-1 font-mono text-xs">{token}</span>
              ) : (
                <button key={`slot-${tokenIndex}`} type="button" onClick={() => setSlots((current) => current.slice(0, -1))} className="min-w-16 rounded-lg border border-dashed border-[var(--accent)] px-2 py-1 font-mono text-xs">
                  {slots[step.template.slice(0, tokenIndex).filter((item) => item === "").length] ?? "___"}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {bank.map((token) => (
                <button key={token} type="button" onClick={() => setSlots((current) => [...current, token])} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold">
                  {token}
                </button>
              ))}
            </div>
          </div>
        )}
        {step.kind === "order" && order.map((item, itemIndex) => (
          <div key={`${item}-${itemIndex}`} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] px-3 py-2">
            <span className="text-sm">{item}</span>
            <span className="flex gap-1">
              <Button size="sm" variant="secondary" onClick={() => move(itemIndex, -1)} aria-label="Move up">↑</Button>
              <Button size="sm" variant="secondary" onClick={() => move(itemIndex, 1)} aria-label="Move down">↓</Button>
            </span>
          </div>
        ))}
      </div>
      {message && <p className={cn("mt-4 text-sm font-medium", ok ? "text-[#027A48]" : "text-[#B42318]")}>{message}</p>}
      {!ok && <Button className="mt-4" onClick={check}>Check</Button>}
    </div>
  );

  function move(from: number, direction: -1 | 1) {
    const to = from + direction;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
    setOk(false);
  }
}

function shuffled(items: string[], answer: string[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (JSON.stringify(copy) === JSON.stringify(answer) && copy.length > 1) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}
