import { records } from "@/lib/curriculum/datasets";
import type { BiFilter, BiRelationship, BiTargetSpec, Pill } from "@/lib/curriculum/types";

export type FactRow = Record<string, string | number | null>;

export type ChartPoint = { x: string; y: number; series?: string };

const facts: FactRow[] = records("line_items");

export const tableauFields = [
  { field: "region", kind: "dimension" },
  { field: "segment", kind: "dimension" },
  { field: "category", kind: "dimension" },
  { field: "status", kind: "dimension" },
  { field: "channel", kind: "dimension" },
  { field: "product", kind: "dimension" },
  { field: "customer", kind: "dimension" },
  { field: "order_date", kind: "dimension" },
  { field: "amount", kind: "measure" },
  { field: "quantity", kind: "measure" },
  { field: "unit_price", kind: "measure" },
] as const;

export const querySteps = [
  { id: "drop_duplicates", label: "Remove duplicate campaign rows" },
  { id: "drop_null_spend", label: "Drop rows with a blank spend" },
  { id: "parse_spend", label: "Turn $1,200 text into a number" },
];

export const modelRelationships: BiRelationship[] = [
  { from: "DimCustomer[customer_id]", to: "FactSales[customer_id]", active: false },
  { from: "DimProduct[product_id]", to: "FactSales[product_id]", active: false },
  { from: "DimDate[date]", to: "FactSales[order_date]", active: false },
];

function pillKey(pill: Pill) {
  return `${pill.agg ?? ""}:${pill.field}`;
}

function samePills(left: Pill[] = [], right: Pill[] = []) {
  return left.length === right.length && left.every((pill, index) => pillKey(pill) === pillKey(right[index]));
}

export function gradeBi(learner: BiTargetSpec, target: BiTargetSpec) {
  if (learner.mode !== target.mode) return { ok: false, message: "Use the matching workspace for this step." };
  if (target.mode === "tableau") {
    const ok =
      samePills(learner.columns, target.columns) &&
      samePills(learner.rows, target.rows) &&
      (target.color ? pillKey(learner.color ?? { field: "" }) === pillKey(target.color) : !learner.color) &&
      (target.mark ? learner.mark === target.mark : true) &&
      JSON.stringify(learner.filters ?? []) === JSON.stringify(target.filters ?? []);
    return { ok, message: ok ? "The view matches the brief." : "The shelves, mark, or filters still differ from the brief." };
  }
  if (target.mode === "dax") {
    const ok = normalizeDax(learner.expression ?? "") === normalizeDax(target.expression ?? "");
    const value = ok ? evaluateDax(target.expression ?? "", target.reportFilters ?? []) : evaluateDax(learner.expression ?? "", target.reportFilters ?? []);
    return {
      ok,
      message: ok ? `Measure returns ${formatNumber(value)}.` : `That measure returns ${formatNumber(value)}. Check the function and column.`,
      value,
    };
  }
  if (target.mode === "query") {
    const ok = JSON.stringify(learner.steps ?? []) === JSON.stringify(target.steps ?? []);
    return { ok, message: ok ? "Those transform steps clean the table." : "The enabled steps or their order still differ.", preview: applyQuerySteps(learner.steps ?? []) };
  }
  const wanted = [...(target.relationships ?? [])].filter((item) => item.active).map(relKey).sort();
  const got = [...(learner.relationships ?? [])].filter((item) => item.active).map(relKey).sort();
  const ok = JSON.stringify(wanted) === JSON.stringify(got);
  return { ok, message: ok ? "The active relationships match the star schema." : "Check which relationships are active." };
}

function relKey(item: BiRelationship) {
  return `${item.from}->${item.to}`;
}

export function normalizeDax(expression: string) {
  return expression.replace(/\s+/g, "").replace(/\[/g, "[").toLowerCase();
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "an error";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function filteredFacts(filters: BiFilter[] = []) {
  return facts.filter((row) => filters.every((filter) => String(row[filter.field] ?? "") === filter.value));
}

function sumField(rows: FactRow[], field: string) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

export function evaluateDax(expression: string, reportFilters: BiFilter[] = []) {
  const source = expression.trim();
  if (!source) return NaN;
  try {
    return parseExpr(tokenize(source), reportFilters).value;
  } catch {
    return NaN;
  }
}

type Token = { type: "id" | "num" | "str" | "op"; value: string };
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const char = input[i];
    if (/\s/.test(char)) {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      let value = "";
      while (/[0-9.]/.test(input[i] ?? "")) value += input[i++];
      tokens.push({ type: "num", value });
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      i += 1;
      let value = "";
      while (input[i] && input[i] !== quote) value += input[i++];
      i += 1;
      tokens.push({ type: "str", value });
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      let value = "";
      while (/[A-Za-z0-9_.]/.test(input[i] ?? "")) value += input[i++];
      tokens.push({ type: "id", value });
      continue;
    }
    if (input.startsWith("<=", i) || input.startsWith(">=", i) || input.startsWith("<>", i)) {
      tokens.push({ type: "op", value: input.slice(i, i + 2) });
      i += 2;
      continue;
    }
    tokens.push({ type: "op", value: char });
    i += 1;
  }
  return tokens;
}

class DaxParser {
  private i = 0;
  constructor(
    private tokens: Token[],
    private filters: BiFilter[],
  ) {}
  parse() {
    const value = this.expr();
    return value;
  }
  private peek() {
    return this.tokens[this.i];
  }
  private eat() {
    return this.tokens[this.i++];
  }
  private expr(): number {
    const token = this.peek();
    if (!token) return NaN;
    if (token.type === "num") {
      this.eat();
      return Number(token.value);
    }
    if (token.type === "id") {
      const name = token.value.toUpperCase();
      this.eat();
      if (this.peek()?.value === "(") return this.func(name);
      return NaN;
    }
    return NaN;
  }
  private func(name: string) {
    this.eat();
    if (name === "SUM" || name === "AVERAGE" || name === "DISTINCTCOUNT") {
      const field = this.column();
      this.expect(")");
      const rows = filteredFacts(this.filters);
      if (name === "SUM") return sumField(rows, field);
      if (name === "AVERAGE") return sumField(rows, field) / (rows.length || 1);
      return new Set(rows.map((row) => row[field])).size;
    }
    if (name === "COUNTROWS") {
      this.columnTable();
      this.expect(")");
      return filteredFacts(this.filters).length;
    }
    if (name === "DIVIDE") {
      const left = this.expr();
      this.expect(",");
      const right = this.expr();
      this.expect(")");
      return right === 0 ? 0 : left / right;
    }
    if (name === "CALCULATE") {
      const saved = this.filters;
      const innerStart = this.i;
      // parse expression first, but filters after comma should replace context before evaluation
      const snapshot = [...this.tokens.slice(this.i)];
      const exprTokens = this.takeUntilCommaOrEnd();
      const extra: BiFilter[] = [];
      while (this.peek() && this.peek()?.value !== ")") {
        if (this.peek()?.value === ",") this.eat();
        extra.push(...this.filterArg(saved));
      }
      this.expect(")");
      const inner = new DaxParser(exprTokens, [...saved, ...extra]).parse();
      void innerStart;
      void snapshot;
      return inner;
    }
    if (name === "ALL" || name === "ALLEXCEPT") {
      this.columnTable();
      while (this.peek() && this.peek()?.value !== ")") this.eat();
      this.expect(")");
      return NaN;
    }
    if (name === "SUMX" || name === "AVERAGEX") {
      this.columnTable();
      this.expect(",");
      const body = this.rowExpr();
      this.expect(")");
      const rows = filteredFacts(this.filters);
      const total = rows.reduce((sum, row) => sum + body(row), 0);
      return name === "SUMX" ? total : total / (rows.length || 1);
    }
    if (name === "TOTALYTD") {
      const inner = this.expr();
      while (this.peek() && this.peek()?.value !== ")") this.eat();
      this.expect(")");
      const year = "2025";
      const rows = filteredFacts(this.filters).filter((row) => String(row.order_date ?? "").startsWith(year));
      if (Number.isFinite(inner) && !this.tokens.some((token) => token.value.toUpperCase() === "SUM")) return sumField(rows, "amount");
      return sumField(rows, "amount");
    }
    if (name === "SAMEPERIODLASTYEAR") {
      while (this.peek() && this.peek()?.value !== ")") this.eat();
      this.expect(")");
      return NaN;
    }
    throw new Error(`Unsupported DAX ${name}`);
  }
  private column() {
    const table = this.eat();
    if (this.peek()?.value !== "[") throw new Error("Expected [column]");
    this.eat();
    const col = this.eat();
    if (this.peek()?.value === "]") this.eat();
    void table;
    return (col?.value ?? "").toLowerCase();
  }
  private columnTable() {
    if (this.peek()?.type === "id") this.eat();
  }
  private expect(value: string) {
    if (this.peek()?.value !== value) throw new Error(`Expected ${value}`);
    this.eat();
  }
  private takeUntilCommaOrEnd() {
    const tokens: Token[] = [];
    let depth = 0;
    while (this.peek()) {
      const token = this.peek();
      if (token.value === "," && depth === 0) break;
      if (token.value === ")" && depth === 0) break;
      if (token.value === "(") depth += 1;
      if (token.value === ")") depth -= 1;
      tokens.push(this.eat());
    }
    return tokens;
  }
  private filterArg(base: BiFilter[]): BiFilter[] {
    if (this.peek()?.value.toUpperCase() === "ALL") {
      this.func("ALL");
      return base.filter(() => false);
    }
    const field = this.column();
    const op = this.eat();
    const valueToken = this.eat();
    void op;
    return [{ field, value: valueToken?.value ?? "" }];
  }
  private rowExpr() {
    const tokens: Token[] = [];
    let depth = 0;
    while (this.peek()) {
      const token = this.peek();
      if (token.value === ")" && depth === 0) break;
      if (token.value === "(") depth += 1;
      if (token.value === ")") depth -= 1;
      tokens.push(this.eat());
    }
    return (row: FactRow) => {
      const replaced = tokens.map((token) => {
        if (token.type === "id") return token;
        return token;
      });
      // Support FactSales[quantity] * FactSales[unit_price]
      const cols: number[] = [];
      for (let i = 0; i < replaced.length; i += 1) {
        if (replaced[i].value === "[") {
          const name = replaced[i + 1]?.value;
          cols.push(Number(row[name] ?? 0));
        }
      }
      if (cols.length >= 2 && replaced.some((token) => token.value === "*")) return cols[0] * cols[1];
      if (cols.length === 1) return cols[0];
      return 0;
    };
  }
}

function parseExpr(tokens: Token[], filters: BiFilter[]) {
  return { value: new DaxParser(tokens, filters).parse() };
}

export function tableauChart(spec: BiTargetSpec): ChartPoint[] {
  const rows = filteredFacts(spec.filters ?? []);
  const dimension = [...(spec.columns ?? []), ...(spec.rows ?? [])].find((pill) => !pill.agg);
  const measure = [...(spec.rows ?? []), ...(spec.columns ?? [])].find((pill) => pill.agg || ["amount", "quantity", "unit_price"].includes(pill.field));
  if (!dimension || !measure) return [];
  const buckets = new Map<string, FactRow[]>();
  for (const row of rows) {
    const key = String(row[dimension.field] ?? "");
    buckets.set(key, [...(buckets.get(key) ?? []), row]);
  }
  return [...buckets.entries()].map(([x, group]) => ({
    x,
    y: aggregate(group, measure),
    series: spec.color ? String(group[0]?.[spec.color.field] ?? "") : undefined,
  }));
}

function aggregate(group: FactRow[], pill: Pill) {
  const field = pill.field;
  if (pill.agg === "COUNT") return group.length;
  if (pill.agg === "COUNTD") return new Set(group.map((row) => row[field])).size;
  if (pill.agg === "AVG") return sumField(group, field) / (group.length || 1);
  return sumField(group, field);
}

export function applyQuerySteps(steps: string[]) {
  let rows = records("messy_spend").map((row) => ({ ...row }));
  for (const step of steps) {
    if (step === "drop_duplicates") {
      const seen = new Set<string>();
      rows = rows.filter((row) => {
        const key = `${row.campaign}|${row.spend_text}|${row.month}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    if (step === "drop_null_spend") rows = rows.filter((row) => row.spend_text !== null);
    if (step === "parse_spend") {
      rows = rows.map((row) => ({
        ...row,
        spend: Number(String(row.spend_text ?? "").replace(/[$,]/g, "")) || null,
      }));
    }
  }
  return rows;
}

export function emptySpec(mode: BiTargetSpec["mode"]): BiTargetSpec {
  if (mode === "tableau") return { mode, columns: [], rows: [], color: null, mark: "bar", filters: [] };
  if (mode === "dax") return { mode, expression: "" };
  if (mode === "query") return { mode, steps: [] };
  return { mode, relationships: modelRelationships.map((item) => ({ ...item, active: false })) };
}
