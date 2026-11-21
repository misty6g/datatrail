"use client";

import { records } from "@/lib/curriculum/datasets";

export function DatasetDrawer({ tableName }: { tableName?: string }) {
  if (!tableName) return null;
  let rows: Record<string, string | number | null>[] = [];
  try {
    rows = records(tableName).slice(0, 6);
  } catch {
    return null;
  }
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  return (
    <details className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">
        Preview {tableName}
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="border-b border-[var(--line)] px-2 py-1 font-semibold text-[var(--muted)]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column} className="border-b border-[var(--line)]/70 px-2 py-1 text-[var(--ink)]">
                    {row[column] === null ? "NULL" : String(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
