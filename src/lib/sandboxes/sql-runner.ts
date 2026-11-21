import { seedSql } from "@/lib/curriculum/datasets";

export type SqlResult = {
  columns: string[];
  rows: (string | number | null)[][];
};

let sqlPromise: Promise<{
  Database: new () => {
    exec: (sql: string) => { columns: string[]; values: (string | number | Uint8Array | null)[][] }[];
    close: () => void;
  };
}> | null = null;

async function loadSql(wasmBinary?: Uint8Array) {
  if (!sqlPromise) {
    sqlPromise = import("sql.js").then((mod) => {
      const init = mod.default;
      if (wasmBinary) return init({ wasmBinary });
      return init({
        locateFile: (file: string) => `/wasm/${file}`,
      });
    });
  }
  return sqlPromise;
}

export async function runSql(script: string, wasmBinary?: Uint8Array): Promise<SqlResult> {
  const SQL = await loadSql(wasmBinary);
  const db = new SQL.Database();
  try {
    db.exec(seedSql());
    const resultSets = db.exec(script);
    const last = resultSets[resultSets.length - 1];
    if (!last) return { columns: [], rows: [] };
    return {
      columns: last.columns,
      rows: last.values.map((row) => row.map((cell) => (cell instanceof Uint8Array ? null : cell))),
    };
  } finally {
    db.close();
  }
}

function ordered(sql: string) {
  return /\border\s+by\b/i.test(sql);
}

function normalizeCell(value: string | number | null) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Math.round(value * 10000) / 10000;
  const asNumber = Number(value);
  if (value !== "" && !Number.isNaN(asNumber) && /^-?\d+(\.\d+)?$/.test(String(value))) {
    return Math.round(asNumber * 10000) / 10000;
  }
  return String(value);
}

function signature(result: SqlResult, keepOrder: boolean) {
  const columns = result.columns.map((col) => col.toLowerCase());
  const rows = result.rows.map((row) => row.map((cell) => normalizeCell(cell)));
  const body = keepOrder ? rows : [...rows].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return JSON.stringify({ columns, rows: body });
}

export function missingClauses(sql: string, clauses: string[] = []) {
  const compact = sql.replace(/\s+/g, " ");
  return clauses.filter((clause) => {
    const pattern = new RegExp(`\\b${clause.replace(/\s+/g, "\\s+")}\\b`, "i");
    return !pattern.test(compact);
  });
}

export async function gradeSql(userSql: string, solutionSql: string, requiredClauses?: string[], wasmBinary?: Uint8Array) {
  const missing = missingClauses(userSql, requiredClauses);
  if (missing.length) {
    return { ok: false, message: `Include ${missing.join(", ")} in the query.`, result: null as SqlResult | null };
  }
  try {
    const [user, solution] = await Promise.all([
      runSql(userSql, wasmBinary),
      runSql(solutionSql, wasmBinary),
    ]);
    const keepOrder = ordered(solutionSql);
    const ok = signature(user, keepOrder) === signature(solution, keepOrder);
    return {
      ok,
      message: ok ? "Result matches." : "The query ran, but the rows or columns do not match yet.",
      result: user,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not run that SQL.",
      result: null,
    };
  }
}
