"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { answersMatch, cn } from "@/lib/utils";
import type { Lesson } from "@/lib/curriculum/types";
import { motion, AnimatePresence } from "framer-motion";

export function LessonPlayer({
  courseId,
  lesson,
  nextHref,
}: {
  courseId: string;
  lesson: Lesson;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState(
    lesson.exercise.kind === "code" ? lesson.exercise.starter ?? "" : "",
  );
  const [order, setOrder] = useState(
    lesson.exercise.kind === "order" ? shuffle(lesson.exercise.items) : [],
  );
  const [status, setStatus] = useState<"idle" | "wrong" | "right">("idle");
  const [showHint, setShowHint] = useState(false);

  const hint =
    "hint" in lesson.exercise ? lesson.exercise.hint : undefined;

  const check = () => {
    const ex = lesson.exercise;
    let ok = false;
    if (ex.kind === "multiple_choice") ok = choice === ex.answer;
    if (ex.kind === "fill_blank" || ex.kind === "code")
      ok = answersMatch(text, ex.answer);
    if (ex.kind === "order")
      ok = JSON.stringify(order) === JSON.stringify(ex.answer);

    if (!ok) {
      setStatus("wrong");
      return;
    }
    setStatus("right");
    startTransition(async () => {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonId: lesson.id,
          status: "completed",
          score: 100,
        }),
      });
    });
  };

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
    setStatus("idle");
  };

  const languageLabel = useMemo(() => {
    if (lesson.exercise.kind !== "code") return null;
    return lesson.exercise.language.toUpperCase();
  }, [lesson.exercise]);

  return (
    <div className="mx-auto max-w-2xl">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Concept · {lesson.minutes} min
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          {lesson.concept}
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-5 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Try it
          </h2>
          {languageLabel && (
            <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              {languageLabel}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {lesson.exercise.prompt}
        </p>

        <div className="mt-5 space-y-3">
          {lesson.exercise.kind === "multiple_choice" &&
            lesson.exercise.choices.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setChoice(i);
                  setStatus("idle");
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                  choice === i
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--line)] hover:bg-[var(--surface-2)]",
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {c}
              </button>
            ))}

          {(lesson.exercise.kind === "fill_blank" ||
            lesson.exercise.kind === "code") && (
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setStatus("idle");
              }}
              rows={lesson.exercise.kind === "code" ? 6 : 2}
              placeholder={
                lesson.exercise.kind === "fill_blank"
                  ? lesson.exercise.placeholder
                  : "Type your answer"
              }
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          )}

          {lesson.exercise.kind === "order" &&
            order.map((item, i) => (
              <div
                key={`${item}-${i}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2"
              >
                <span className="text-sm">{item}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => move(i, -1)}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => move(i, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
        </div>

        <AnimatePresence>
          {status === "wrong" && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-sm font-medium text-[#B42318]"
            >
              Not quite — try again{hint ? ", or peek at the hint" : ""}.
            </motion.p>
          )}
          {status === "right" && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm font-medium text-[#027A48]"
            >
              Nice work — lesson complete.
            </motion.p>
          )}
        </AnimatePresence>

        {showHint && hint && (
          <p className="mt-3 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--muted)]">
            Hint: {hint}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {status !== "right" ? (
            <>
              <Button onClick={check} disabled={pending}>
                Check answer
              </Button>
              {hint && (
                <Button variant="ghost" onClick={() => setShowHint(true)}>
                  Hint
                </Button>
              )}
            </>
          ) : nextHref ? (
            <Button onClick={() => router.push(nextHref)}>Next lesson</Button>
          ) : (
            <Button onClick={() => router.push(`/learn/${courseId}`)}>
              Back to track
            </Button>
          )}
        </div>
      </motion.section>
    </div>
  );
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  // Avoid accidentally starting in the correct order.
  if (JSON.stringify(copy) === JSON.stringify(items) && copy.length > 1) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}
