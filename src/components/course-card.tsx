"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CourseCard({
  id,
  title,
  tagline,
  color,
  accent,
  icon,
  completed,
  total,
  index,
}: {
  id: string;
  title: string;
  tagline: string;
  color: string;
  accent: string;
  icon: string;
  completed: number;
  total: number;
  index: number;
}) {
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Link
        href={`/learn/${id}`}
        className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{ background: `${accent}22` }}
          >
            {icon}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {completed}/{total}
          </span>
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          {title}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{tagline}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-[var(--muted)]">
          {pct === 0 ? "Not started" : pct === 100 ? "Completed" : `${pct}% complete`}
        </p>
      </Link>
    </motion.div>
  );
}