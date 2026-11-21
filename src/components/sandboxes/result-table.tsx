export function ResultTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number | null)[][];
}) {
  if (!columns.length) return <p className="text-sm text-[var(--muted)]">Query finished with no result table.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
      <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
        <thead className="bg-[var(--surface-2)]">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-3 py-2 font-semibold text-[var(--ink)]">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 12).map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-t border-[var(--line)] px-3 py-2 text-[var(--ink)]">
                  {cell === null ? "NULL" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
