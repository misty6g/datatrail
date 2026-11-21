import { seedSql } from "@/lib/curriculum/datasets";

export type SqlResult = {
  columns: string[];
  rows: (string | number | null)[][];
};

type Database = {
  exec: (sql: string) => { columns: string[]; values: (string | number | Uint8Array | null)[][] }[];
  close: () => void;
};

type InitSql = (config?: { locateFile?: (file: string) => string }) => Promise<{ Database: new () => Database }>;

let ready: Promise<{ Database: new () => Database }> | null = null;

function loadSql(): Promise<{ Database: new () => Database }> {
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    const locateFile = (file: string) => `https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${file}`;
    const existing = (window as Window & { initSqlJs?: InitSql }).initSqlJs;
    if (existing) {
      resolve(existing({ locateFile }));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/sql-wasm.js";
    script.async = true;
    script.onload = () => {
      const init = (window as Window & { initSqlJs?: InitSql }).initSqlJs;
      if (!init) {
        reject(new Error("SQL engine did not load."));
        return;
      }
      resolve(init({ locateFile }));
    };
    script.onerror = () => reject(new Error("Could not load the SQL engine."));
    document.head.appendChild(script);
  });
  return ready;
}

export async function runSql(script: string): Promise<SqlResult> {
  const SQL = await loadSql();
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
  const columns = result.columns.map((column) => column.toLowerCase());
  const rows = result.rows.map((row) => row.map((cell) => normalizeCell(cell)));
  const body = keepOrder ? rows : [...rows].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return JSON.stringify({ columns, rows: body });
}

export async function gradeSql(userSql: string, solutionSql: string, requiredClauses: string[] = []) {
  const compact = userSql.replace(/\s+/g, " ");
  const missing = requiredClauses.filter((clause) => !new RegExp(`\\b${clause.replace(/\s+/g, "\\s+")}\\b`, "i").test(compact));
  if (missing.length) return { ok: false, message: `Include ${missing.join(", ")} in the query.`, result: null as SqlResult | null };
  try {
    const [user, solution] = await Promise.all([runSql(userSql), runSql(solutionSql)]);
    const keepOrder = /\border\s+by\b/i.test(solutionSql);
    const ok = signature(user, keepOrder) === signature(solution, keepOrder);
    return { ok, message: ok ? "Result matches." : "The query ran, but the rows or columns do not match yet.", result: user };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not run that SQL.", result: null };
  }
}
