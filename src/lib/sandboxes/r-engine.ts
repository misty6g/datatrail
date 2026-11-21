import { records } from "@/lib/curriculum/datasets";

type Vec = {
  kind: "vec";
  mode: "num" | "str" | "bool";
  data: (number | string | boolean | null)[];
};

type Frame = {
  kind: "frame";
  columns: Record<string, Vec>;
  groups: string[];
  n: number;
};

type Plot = {
  kind: "plot";
  geom: "col" | "point" | "line" | "histogram";
  data: Frame;
  x?: string;
  y?: string;
  color?: string;
  facet?: string;
  title?: string;
};

type Value = Vec | Frame | Plot | { kind: "num"; value: number | null };

type Env = Map<string, Value>;

export type RPlot = {
  geom: Plot["geom"];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  points: { x: string; y: number; series?: string }[];
};

function isVec(value: Value | undefined): value is Vec {
  return value?.kind === "vec";
}
function isFrame(value: Value | undefined): value is Frame {
  return value?.kind === "frame";
}

function numVec(data: (number | null)[]): Vec {
  return { kind: "vec", mode: "num", data };
}
function strVec(data: (string | null)[]): Vec {
  return { kind: "vec", mode: "str", data };
}
function boolVec(data: (boolean | null)[]): Vec {
  return { kind: "vec", mode: "bool", data };
}

function asVec(value: Value): Vec {
  if (isVec(value)) return value;
  if (value.kind === "num") return numVec([value.value]);
  throw new Error("Expected a vector.");
}

function scalarOf(value: Value): number | string | boolean | null {
  const vec = asVec(value);
  if (vec.data.length !== 1) throw new Error("Expected a single value.");
  return vec.data[0];
}

function frameFromRecords(rows: Record<string, string | number | null>[]): Frame {
  const columns: Record<string, Vec> = {};
  const names = rows.length ? Object.keys(rows[0]) : [];
  for (const name of names) {
    const values = rows.map((row) => row[name]);
    const numeric = values.every((value) => value === null || typeof value === "number");
    columns[name] = numeric
      ? numVec(values.map((value) => (value === null ? null : Number(value))))
      : strVec(values.map((value) => (value === null ? null : String(value))));
  }
  return { kind: "frame", columns, groups: [], n: rows.length };
}

export function baseEnv(): Env {
  const env: Env = new Map();
  for (const name of ["customers", "products", "orders", "order_items", "subscriptions", "campaigns", "monthly_mrr", "line_items", "messy_spend"]) {
    env.set(name, frameFromRecords(records(name)));
  }
  return env;
}

class Parser {
  private i = 0;
  constructor(private src: string) {}

  parse() {
    const statements: Stmt[] = [];
    this.skip();
    while (!this.eof()) {
      statements.push(this.statement());
      this.skip();
      while (this.peek() === ";" || this.peek() === "\n") {
        this.i += 1;
        this.skip();
      }
    }
    return statements;
  }

  private eof() {
    return this.i >= this.src.length;
  }
  private peek() {
    return this.src[this.i] ?? "";
  }
  private skip() {
    while (!this.eof()) {
      if (/\s/.test(this.peek())) {
        this.i += 1;
        continue;
      }
      if (this.peek() === "#") {
        while (!this.eof() && this.peek() !== "\n") this.i += 1;
        continue;
      }
      break;
    }
  }
  private statement(): Stmt {
    const checkpoint = this.i;
    if (/[A-Za-z.]/.test(this.peek())) {
      const name = this.readIdent();
      this.skip();
      if (this.src.startsWith("<-", this.i)) {
        this.i += 2;
        return { type: "assign", name, expr: this.expr() };
      }
      this.i = checkpoint;
    }
    return { type: "expr", expr: this.expr() };
  }
  private expr() {
    return this.formula();
  }
  private formula(): Expr {
    const left = this.pipe();
    this.skip();
    if (this.peek() === "~") {
      this.i += 1;
      return { type: "binary", op: "~", left, right: this.pipe() };
    }
    return left;
  }
  private pipe(): Expr {
    let left = this.or();
    while (true) {
      this.skip();
      if (this.src.startsWith("|>", this.i) || this.src.startsWith("%>%", this.i)) {
        this.i += this.src.startsWith("%>%", this.i) ? 3 : 2;
        this.skip();
        const call = this.callExpr();
        left = { type: "pipe", left, call };
      } else if (this.peek() === "+") {
        const saved = this.i;
        this.i += 1;
        this.skip();
        if (/[A-Za-z]/.test(this.peek())) {
          const call = this.callExpr();
          left = { type: "ggplotAdd", left, call };
        } else {
          this.i = saved;
          break;
        }
      } else break;
    }
    return left;
  }
  private or(): Expr {
    let left = this.and();
    while (this.consumeWord("|")) left = { type: "binary", op: "|", left, right: this.and() };
    return left;
  }
  private and(): Expr {
    let left = this.cmp();
    while (this.consumeWord("&")) left = { type: "binary", op: "&", left, right: this.cmp() };
    return left;
  }
  private cmp(): Expr {
    let left = this.add();
    const ops = ["==", "!=", "<=", ">=", "<", ">"];
    while (true) {
      this.skip();
      const op = ops.find((item) => this.src.startsWith(item, this.i));
      if (!op) break;
      this.i += op.length;
      left = { type: "binary", op, left, right: this.add() };
    }
    return left;
  }
  private add(): Expr {
    let left = this.mul();
    while (true) {
      this.skip();
      if (this.peek() === "+" || this.peek() === "-") {
        const op = this.peek();
        const rest = this.src.slice(this.i + 1).trimStart();
        if (op === "+" && /^(geom_|labs|facet_|scale_|coord_|theme)/.test(rest)) break;
        this.i += 1;
        left = { type: "binary", op, left, right: this.mul() };
      } else break;
    }
    return left;
  }
  private mul(): Expr {
    let left = this.unary();
    while (true) {
      this.skip();
      if (this.peek() === "*" || this.peek() === "/") {
        const op = this.peek();
        this.i += 1;
        left = { type: "binary", op, left, right: this.unary() };
      } else break;
    }
    return left;
  }
  private unary(): Expr {
    this.skip();
    if (this.peek() === "-") {
      this.i += 1;
      return { type: "unary", op: "-", expr: this.unary() };
    }
    if (this.peek() === "!") {
      this.i += 1;
      return { type: "unary", op: "!", expr: this.unary() };
    }
    return this.postfix();
  }
  private postfix(): Expr {
    let expr = this.primary();
    while (true) {
      this.skip();
      if (this.peek() === "$") {
        this.i += 1;
        expr = { type: "dollar", expr, name: this.readIdent() };
      } else if (this.peek() === "[") {
        this.i += 1;
        const row = this.peek() === "," ? null : this.expr();
        this.skip();
        let col: Expr | null = null;
        if (this.peek() === ",") {
          this.i += 1;
          this.skip();
          if (this.peek() !== "]") col = this.expr();
        }
        this.expect("]");
        expr = { type: "subset", expr, row, col };
      } else break;
    }
    return expr;
  }
  private primary(): Expr {
    this.skip();
    if (this.peek() === "(") {
      this.i += 1;
      const inner = this.expr();
      this.expect(")");
      return inner;
    }
    if (this.peek() === '"' || this.peek() === "'") return { type: "str", value: this.readString() };
    if (/[0-9]/.test(this.peek())) return { type: "num", value: this.readNumber() };
    if (/[A-Za-z.]/.test(this.peek())) {
      const name = this.readIdent();
      this.skip();
      if (name === "NA") return { type: "na" };
      if (name === "TRUE") return { type: "bool", value: true };
      if (name === "FALSE") return { type: "bool", value: false };
      if (this.peek() === "(") return { type: "call", name, args: this.args() };
      return { type: "name", name };
    }
    throw new Error(`Unexpected ${JSON.stringify(this.peek())} near ${this.src.slice(this.i, this.i + 24)}`);
  }
  private callExpr(): Expr {
    const name = this.readIdent();
    this.skip();
    if (this.peek() !== "(") throw new Error(`${name} should be a function call in a pipe.`);
    return { type: "call", name, args: this.args() };
  }
  private args(): Arg[] {
    this.expect("(");
    const args: Arg[] = [];
    this.skip();
    if (this.peek() === ")") {
      this.i += 1;
      return args;
    }
    while (true) {
      this.skip();
      const start = this.i;
      let argName: string | undefined;
      if (/[A-Za-z.]/.test(this.peek())) {
        const ident = this.readIdent();
        this.skip();
        if (this.peek() === "=" && this.src[this.i + 1] !== "=") {
          this.i += 1;
          argName = ident;
        } else this.i = start;
      }
      args.push({ name: argName, expr: this.expr() });
      this.skip();
      if (this.peek() === ",") {
        this.i += 1;
        continue;
      }
      this.expect(")");
      break;
    }
    return args;
  }
  private consumeWord(word: string) {
    this.skip();
    if (!this.src.startsWith(word, this.i)) return false;
    const next = this.src[this.i + word.length] ?? "";
    if ((word === "|" && next === ">") || (word === "&" && next === "&")) return false;
    if (/[A-Za-z]/.test(word) && /[A-Za-z0-9.]/.test(next)) return false;
    this.i += word.length;
    return true;
  }
  private expect(char: string) {
    this.skip();
    if (this.peek() !== char) {
      throw new Error(`Expected ${char} near ${JSON.stringify(this.src.slice(this.i, this.i + 24))}`);
    }
    this.i += 1;
  }
  private readIdent() {
    const start = this.i;
    while (/[A-Za-z0-9._]/.test(this.peek())) this.i += 1;
    return this.src.slice(start, this.i);
  }
  private readNumber() {
    const start = this.i;
    while (/[0-9.]/.test(this.peek())) this.i += 1;
    return Number(this.src.slice(start, this.i));
  }
  private readString() {
    const quote = this.peek();
    this.i += 1;
    let out = "";
    while (!this.eof() && this.peek() !== quote) {
      if (this.peek() === "\\") {
        this.i += 1;
        out += this.peek();
        this.i += 1;
        continue;
      }
      out += this.peek();
      this.i += 1;
    }
    this.i += 1;
    return out;
  }
}

type Arg = { name?: string; expr: Expr };
type Expr =
  | { type: "num"; value: number }
  | { type: "str"; value: string }
  | { type: "bool"; value: boolean }
  | { type: "na" }
  | { type: "name"; name: string }
  | { type: "call"; name: string; args: Arg[] }
  | { type: "binary"; op: string; left: Expr; right: Expr }
  | { type: "unary"; op: string; expr: Expr }
  | { type: "dollar"; expr: Expr; name: string }
  | { type: "subset"; expr: Expr; row: Expr | null; col: Expr | null }
  | { type: "pipe"; left: Expr; call: Expr }
  | { type: "ggplotAdd"; left: Expr; call: Expr };
type Stmt = { type: "assign"; name: string; expr: Expr } | { type: "expr"; expr: Expr };

function broadcast(op: string, left: Vec, right: Vec): Vec {
  const n = Math.max(left.data.length, right.data.length);
  const out: (number | string | boolean | null)[] = [];
  for (let i = 0; i < n; i += 1) {
    const a = left.data[i % left.data.length];
    const b = right.data[i % right.data.length];
    if (a === null || b === null) {
      out.push(null);
      continue;
    }
    if (op === "+") out.push(Number(a) + Number(b));
    else if (op === "-") out.push(Number(a) - Number(b));
    else if (op === "*") out.push(Number(a) * Number(b));
    else if (op === "/") out.push(Number(a) / Number(b));
    else if (op === "==") out.push(a === b);
    else if (op === "!=") out.push(a !== b);
    else if (op === "<") out.push(Number(a) < Number(b));
    else if (op === ">") out.push(Number(a) > Number(b));
    else if (op === "<=") out.push(Number(a) <= Number(b));
    else if (op === ">=") out.push(Number(a) >= Number(b));
    else if (op === "&") out.push(Boolean(a) && Boolean(b));
    else if (op === "|") out.push(Boolean(a) || Boolean(b));
    else throw new Error(`Unknown operator ${op}`);
  }
  const mode = typeof out.find((item) => item !== null) === "boolean" ? "bool" : typeof out.find((item) => item !== null) === "string" ? "str" : "num";
  return { kind: "vec", mode, data: out };
}

function evalExpr(expr: Expr, env: Env): Value {
  switch (expr.type) {
    case "num":
      return numVec([expr.value]);
    case "str":
      return strVec([expr.value]);
    case "bool":
      return boolVec([expr.value]);
    case "na":
      return numVec([null]);
    case "name": {
      const value = env.get(expr.name);
      if (!value) throw new Error(`Object '${expr.name}' not found.`);
      return value;
    }
    case "unary": {
      const inner = asVec(evalExpr(expr.expr, env));
      if (expr.op === "-") return numVec(inner.data.map((item) => (item === null ? null : -Number(item))));
      return boolVec(inner.data.map((item) => (item === null ? null : !item)));
    }
    case "binary":
      return broadcast(expr.op, asVec(evalExpr(expr.left, env)), asVec(evalExpr(expr.right, env)));
    case "dollar": {
      const frame = evalExpr(expr.expr, env);
      if (!isFrame(frame) || !frame.columns[expr.name]) throw new Error(`Unknown column ${expr.name}`);
      return frame.columns[expr.name];
    }
    case "subset":
      return subset(evalExpr(expr.expr, env), expr, env);
    case "call":
      return call(expr.name, expr.args, env);
    case "pipe": {
      const left = evalExpr(expr.left, env);
      if (expr.call.type !== "call") throw new Error("Pipe expects a function.");
      return call(expr.call.name, expr.call.args, env, left);
    }
    case "ggplotAdd": {
      const left = evalExpr(expr.left, env);
      if (left.kind !== "plot" || expr.call.type !== "call") throw new Error("ggplot + expects a layer.");
      return addLayer(left, expr.call.name, expr.call.args, env);
    }
    default:
      throw new Error("Cannot evaluate expression.");
  }
}

function subset(value: Value, expr: Extract<Expr, { type: "subset" }>, env: Env): Value {
  if (isVec(value)) {
    if (!expr.row) return value;
    const index = asVec(evalExpr(expr.row, env));
    return pickVec(value, index);
  }
  if (!isFrame(value)) throw new Error("Cannot subset that object.");
  const rowMask = expr.row ? maskOf(value.n, asVec(evalExpr(expr.row, env))) : value.columns[Object.keys(value.columns)[0]].data.map(() => true);
  let names = Object.keys(value.columns);
  if (expr.col) {
    const col = evalExpr(expr.col, env);
    if (isVec(col) && col.mode === "str") names = col.data.map(String);
    else if (isVec(col) && col.mode === "num") names = col.data.map((item) => names[Number(item) - 1]);
  }
  if (names.length === 1 && expr.col) {
    const source = value.columns[names[0]];
    return pickByMask(source, rowMask);
  }
  const columns: Record<string, Vec> = {};
  for (const name of names) columns[name] = pickByMask(value.columns[name], rowMask);
  const n = columns[names[0]]?.data.length ?? 0;
  return { kind: "frame", columns, groups: [], n };
}

function maskOf(n: number, index: Vec) {
  if (index.mode === "bool") return index.data.map((item) => Boolean(item));
  const mask = Array(n).fill(false);
  for (const item of index.data) {
    if (typeof item === "number") mask[item - 1] = true;
  }
  return mask;
}

function pickByMask(vec: Vec, mask: boolean[]): Vec {
  return { kind: "vec", mode: vec.mode, data: vec.data.filter((_, index) => mask[index]) };
}

function pickVec(vec: Vec, index: Vec): Vec {
  if (index.mode === "bool") return pickByMask(vec, index.data.map(Boolean));
  return { kind: "vec", mode: vec.mode, data: index.data.map((item) => vec.data[Number(item) - 1] ?? null) };
}

function nums(vec: Vec, naRm: boolean) {
  const data = vec.data.map((item) => (item === null ? null : Number(item)));
  return naRm ? data.filter((item): item is number => item !== null && !Number.isNaN(item)) : data.map((item) => item ?? NaN);
}

function call(name: string, args: Arg[], env: Env, piped?: Value): Value {
  const positional = args.filter((arg) => !arg.name);
  const named = Object.fromEntries(args.filter((arg) => arg.name).map((arg) => [arg.name as string, arg.expr]));
  const at = (index: number) => {
    const expr = positional[index]?.expr;
    if (!expr) throw new Error(`${name}() is missing argument ${index + 1}.`);
    return evalExpr(expr, env);
  };
  const naRm = named["na.rm"] ? scalarOf(evalExpr(named["na.rm"], env)) === true : false;

  if (name === "c") {
    const parts = positional.map((arg) => asVec(evalExpr(arg.expr, env)));
    const data = parts.flatMap((part) => part.data);
    const mode = parts.some((part) => part.mode === "str") ? "str" : parts.some((part) => part.mode === "bool") ? "bool" : "num";
    return { kind: "vec", mode, data };
  }
  if (name === "seq") {
    const from = Number(scalarOf(at(0)));
    const to = Number(scalarOf(at(1)));
    const by = named.by ? Number(scalarOf(evalExpr(named.by, env))) : from <= to ? 1 : -1;
    const data: number[] = [];
    if (by === 0) throw new Error("seq by cannot be 0.");
    for (let value = from; by > 0 ? value <= to + 1e-9 : value >= to - 1e-9; value += by) data.push(Math.round(value * 10000) / 10000);
    return numVec(data);
  }
  if (name === "rep") {
    const source = asVec(at(0));
    const times = Number(scalarOf(at(1)));
    return { kind: "vec", mode: source.mode, data: Array.from({ length: times }, () => source.data).flat() };
  }
  if (name === "length") return numVec([asVec(piped ?? at(0)).data.length]);
  if (name === "mean" || name === "sum" || name === "median" || name === "sd" || name === "var" || name === "min" || name === "max") {
    const data = nums(asVec(piped ?? at(0)), naRm);
    if (name === "sum") return numVec([data.reduce((sum, item) => sum + item, 0)]);
    if (name === "min") return numVec([Math.min(...data)]);
    if (name === "max") return numVec([Math.max(...data)]);
    const mean = data.reduce((sum, item) => sum + item, 0) / data.length;
    if (name === "mean") return numVec([mean]);
    if (name === "median") {
      const sorted = [...data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return numVec([sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2]);
    }
    const variance = data.reduce((sum, item) => sum + (item - mean) ** 2, 0) / (data.length - 1);
    return numVec([name === "sd" ? Math.sqrt(variance) : variance]);
  }
  if (name === "cor") {
    const x = nums(asVec(at(0)), true);
    const y = nums(asVec(at(1)), true);
    const mx = x.reduce((a, b) => a + b, 0) / x.length;
    const my = y.reduce((a, b) => a + b, 0) / y.length;
    const num = x.reduce((sum, item, index) => sum + (item - mx) * (y[index] - my), 0);
    const den = Math.sqrt(x.reduce((sum, item) => sum + (item - mx) ** 2, 0) * y.reduce((sum, item) => sum + (item - my) ** 2, 0));
    return numVec([num / den]);
  }
  if (name === "round") {
    const digits = positional[1] ? Number(scalarOf(at(1))) : 0;
    const factor = 10 ** digits;
    return numVec(asVec(at(0)).data.map((item) => (item === null ? null : Math.round(Number(item) * factor) / factor)));
  }
  if (name === "ifelse") {
    const cond = asVec(at(0));
    const yes = asVec(at(1));
    const no = asVec(at(2));
    const data = cond.data.map((item, index) => (item ? yes.data[index % yes.data.length] : no.data[index % no.data.length]));
    const mode = yes.mode === "str" || no.mode === "str" ? "str" : "num";
    return { kind: "vec", mode, data };
  }
  if (name === "paste") {
    const parts = positional.map((arg) => asVec(evalExpr(arg.expr, env)));
    const sep = named.sep ? String(scalarOf(evalExpr(named.sep, env))) : " ";
    const n = Math.max(...parts.map((part) => part.data.length));
    return strVec(Array.from({ length: n }, (_, index) => parts.map((part) => part.data[index % part.data.length]).join(sep)));
  }
  if (name === "factor") return asVec(piped ?? at(0));
  if (name === "data.frame") return dataFrame(args, env);
  if (name === "filter") return filterFrame(mustFrame(piped ?? at(0)), positional.slice(piped ? 0 : 1), env);
  if (name === "select") return selectFrame(mustFrame(piped ?? at(0)), positional.slice(piped ? 0 : 1));
  if (name === "mutate") return mutateFrame(mustFrame(piped ?? at(0)), args.filter((arg) => (piped ? true : arg !== positional[0])), env);
  if (name === "arrange") return arrangeFrame(mustFrame(piped ?? at(0)), positional.slice(piped ? 0 : 1), env);
  if (name === "desc") return { kind: "vec", mode: "num", data: asVec(at(0)).data.map((item) => (item === null ? null : -Number(item))) , };
  if (name === "group_by") {
    const frame = mustFrame(piped ?? at(0));
    const groups = positional.slice(piped ? 0 : 1).map((arg) => (arg.expr.type === "name" ? arg.expr.name : ""));
    return { ...frame, groups };
  }
  if (name === "summarise" || name === "summarize") return summariseFrame(mustFrame(piped ?? at(0)), args.filter((arg) => arg.name), env);
  if (name === "ggplot") return ggplot(mustFrame(piped ?? at(0)), positional[piped ? 0 : 1] ?? positional[0], env);
  if (name === "aes") return aesValue(args);
  if (name === "geom_col" || name === "geom_point" || name === "geom_line" || name === "geom_histogram") {
    throw new Error("Add geoms with ggplot(...) + geom_*().");
  }
  if (name === "labs") return { kind: "num", value: 0 };
  if (name === "lm") return lm(positional, named, env);
  if (name === "coef") {
    const model = at(0);
    return model;
  }
  throw new Error(`Function ${name}() is not in this lesson sandbox.`);
}

function mustFrame(value: Value): Frame {
  if (!isFrame(value)) throw new Error("Expected a data frame.");
  return value;
}

function dataFrame(args: Arg[], env: Env): Frame {
  const columns: Record<string, Vec> = {};
  for (const arg of args) {
    if (!arg.name) throw new Error("data.frame columns need names.");
    columns[arg.name] = asVec(evalExpr(arg.expr, env));
  }
  const n = Object.values(columns)[0]?.data.length ?? 0;
  return { kind: "frame", columns, groups: [], n };
}

function withColumns(frame: Frame, env: Env) {
  const next = new Map(env);
  for (const [name, vec] of Object.entries(frame.columns)) next.set(name, vec);
  return next;
}

function filterFrame(frame: Frame, preds: Arg[], env: Env): Frame {
  let mask = Array(frame.n).fill(true);
  for (const pred of preds) {
    const result = asVec(evalExpr(pred.expr, withColumns(frame, env)));
    mask = mask.map((item, index) => item && Boolean(result.data[index]));
  }
  const columns: Record<string, Vec> = {};
  for (const [name, vec] of Object.entries(frame.columns)) columns[name] = pickByMask(vec, mask);
  return { kind: "frame", columns, groups: frame.groups, n: mask.filter(Boolean).length };
}

function selectFrame(frame: Frame, cols: Arg[]): Frame {
  const columns: Record<string, Vec> = {};
  for (const col of cols) {
    if (col.expr.type !== "name") throw new Error("select() expects column names.");
    columns[col.expr.name] = frame.columns[col.expr.name];
  }
  return { ...frame, columns };
}

function mutateFrame(frame: Frame, args: Arg[], env: Env): Frame {
  const columns = { ...frame.columns };
  const scoped = withColumns(frame, env);
  for (const arg of args) {
    if (!arg.name) continue;
    columns[arg.name] = asVec(evalExpr(arg.expr, scoped));
    scoped.set(arg.name, columns[arg.name]);
  }
  return { ...frame, columns };
}

function arrangeFrame(frame: Frame, keys: Arg[], env: Env): Frame {
  const indexes = Array.from({ length: frame.n }, (_, index) => index);
  const keyed = keys.map((key) => asVec(evalExpr(key.expr, withColumns(frame, env))));
  indexes.sort((a, b) => {
    for (const key of keyed) {
      const av = key.data[a];
      const bv = key.data[b];
      if (av === bv) continue;
      if (av === null) return 1;
      if (bv === null) return -1;
      return av > bv ? 1 : -1;
    }
    return 0;
  });
  const columns: Record<string, Vec> = {};
  for (const [name, vec] of Object.entries(frame.columns)) {
    columns[name] = { kind: "vec", mode: vec.mode, data: indexes.map((index) => vec.data[index]) };
  }
  return { ...frame, columns };
}

function summariseFrame(frame: Frame, args: Arg[], env: Env): Frame {
  const groupNames = frame.groups;
  const buckets = new Map<string, number[]>();
  for (let row = 0; row < frame.n; row += 1) {
    const key = groupNames.map((name) => String(frame.columns[name].data[row])).join("||");
    buckets.set(key, [...(buckets.get(key) ?? []), row]);
  }
  const keys = groupNames.length ? [...buckets.keys()] : ["all"];
  if (!groupNames.length) buckets.set("all", Array.from({ length: frame.n }, (_, index) => index));
  const columns: Record<string, Vec> = {};
  for (const name of groupNames) columns[name] = { kind: "vec", mode: frame.columns[name].mode, data: [] };
  for (const arg of args) columns[arg.name as string] = numVec([]);
  for (const key of keys) {
    const rows = buckets.get(key) ?? [];
    const mini = sliceFrame(frame, rows);
    if (groupNames.length) {
      groupNames.forEach((name) => columns[name].data.push(frame.columns[name].data[rows[0]]));
    }
    const scoped = withColumns(mini, env);
    for (const arg of args) {
      const value = scalarOf(evalExpr(arg.expr, scoped));
      columns[arg.name as string].data.push(typeof value === "number" ? value : value === null ? null : Number(value));
    }
  }
  return { kind: "frame", columns, groups: [], n: keys.length };
}

function sliceFrame(frame: Frame, rows: number[]): Frame {
  const columns: Record<string, Vec> = {};
  for (const [name, vec] of Object.entries(frame.columns)) {
    columns[name] = { kind: "vec", mode: vec.mode, data: rows.map((index) => vec.data[index]) };
  }
  return { kind: "frame", columns, groups: [], n: rows.length };
}

function aesValue(args: Arg[]): Value {
  const columns: Record<string, Vec> = {};
  for (const arg of args) {
    if (arg.name && arg.expr.type === "name") columns[arg.name] = strVec([arg.expr.name]);
  }
  return { kind: "frame", columns, groups: ["aes"], n: 1 };
}

function ggplot(frame: Frame, aesArg: Arg | undefined, env: Env): Plot {
  if (!aesArg) throw new Error("ggplot needs aes().");
  const mapping = evalExpr(aesArg.expr, env);
  if (!isFrame(mapping)) throw new Error("aes() was not understood.");
  return {
    kind: "plot",
    geom: "col",
    data: frame,
    x: mapping.columns.x ? String(mapping.columns.x.data[0]) : undefined,
    y: mapping.columns.y ? String(mapping.columns.y.data[0]) : undefined,
    color: mapping.columns.color ? String(mapping.columns.color.data[0]) : undefined,
  };
}

function addLayer(plot: Plot, name: string, args: Arg[], env: Env): Plot {
  if (name === "labs") {
    const title = args.find((arg) => arg.name === "title");
    return { ...plot, title: title ? String(scalarOf(evalExpr(title.expr, env))) : plot.title };
  }
  if (name === "facet_wrap") {
    const arg = args[0]?.expr;
    return { ...plot, facet: arg?.type === "name" ? arg.name : plot.facet };
  }
  return applyGeom(plot, name, args, env);
}

function applyGeom(plot: Plot, name: string, args: Arg[], env: Env): Plot {
  const geom: Plot["geom"] = name === "geom_point" ? "point" : name === "geom_line" ? "line" : name === "geom_histogram" ? "histogram" : "col";
  let next = { ...plot, geom };
  for (const arg of args) {
    if (arg.name === "mapping") {
      const mapping = evalExpr(arg.expr, env);
      if (isFrame(mapping)) {
        next = {
          ...next,
          x: mapping.columns.x ? String(mapping.columns.x.data[0]) : next.x,
          y: mapping.columns.y ? String(mapping.columns.y.data[0]) : next.y,
        };
      }
    }
  }
  if (name === "facet_wrap") {
    const formula = args[0]?.expr;
    if (formula && formula.type === "name") next = { ...next, facet: formula.name };
  }
  return next;
}

function lm(positional: Arg[], named: Record<string, Expr>, env: Env): Vec {
  const formula = positional[0]?.expr;
  if (!formula || formula.type !== "binary" || formula.op !== "~") throw new Error("lm formula should look like y ~ x.");
  const data = named.data ? evalExpr(named.data, env) : null;
  const scoped = data && isFrame(data) ? withColumns(data, env) : env;
  const y = nums(asVec(evalExpr(formula.left, scoped)), true);
  const x = formula.right.type === "num" ? y.map(() => formula.right.type === "num" ? formula.right.value : 0) : nums(asVec(evalExpr(formula.right, scoped)), true);
  const n = Math.min(x.length, y.length);
  const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const num = x.slice(0, n).reduce((sum, item, index) => sum + (item - mx) * (y[index] - my), 0);
  const den = x.slice(0, n).reduce((sum, item) => sum + (item - mx) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  return numVec([intercept, slope]);
}

export function runR(code: string, env = baseEnv()) {
  const parser = new Parser(code);
  const statements = parser.parse();
  let value: Value = numVec([null]);
  const plots: Plot[] = [];
  for (const statement of statements) {
    if (statement.type === "assign") {
      value = evalExpr(statement.expr, env);
      env.set(statement.name, value);
    } else {
      value = evalExpr(statement.expr, env);
      if (value.kind === "plot") plots.push(value);
    }
  }
  return { env, value, plots };
}

export function valuesEqual(left: Value | undefined, right: Value | undefined) {
  if (!left || !right) return false;
  return JSON.stringify(normalizeValue(left)) === JSON.stringify(normalizeValue(right));
}

function normalizeValue(value: Value): unknown {
  if (value.kind === "vec" || value.kind === "num") {
    const data = value.kind === "num" ? [value.value] : value.data;
    return data.map((item) => (typeof item === "number" ? Math.round(item * 1000) / 1000 : item));
  }
  if (value.kind === "frame") {
    const columns: Record<string, unknown> = {};
    for (const [name, vec] of Object.entries(value.columns)) columns[name] = normalizeValue(vec);
    return { columns, n: value.n };
  }
  return value.geom;
}

export function valuePreview(value: Value | undefined) {
  if (!value) return "";
  if (value.kind === "vec" || value.kind === "num") {
    const data = value.kind === "num" ? [value.value] : value.data;
    return data.map((item) => (item === null ? "NA" : String(typeof item === "number" ? Math.round(item * 1000) / 1000 : item))).join(", ");
  }
  if (value.kind === "frame") {
    const names = Object.keys(value.columns);
    const lines = [names.join(" | ")];
    for (let row = 0; row < Math.min(value.n, 8); row += 1) {
      lines.push(names.map((name) => String(value.columns[name].data[row] ?? "NA")).join(" | "));
    }
    return lines.join("\n");
  }
  return `${value.geom} chart`;
}

export function plotToView(plot: Plot): RPlot {
  const x = plot.x ? plot.data.columns[plot.x] : undefined;
  const y = plot.y ? plot.data.columns[plot.y] : undefined;
  const points: RPlot["points"] = [];
  if (plot.geom === "histogram" && x) {
    const counts = new Map<string, number>();
    for (const item of x.data) counts.set(String(item), (counts.get(String(item)) ?? 0) + 1);
    for (const [label, count] of counts) points.push({ x: label, y: count });
  } else if (x && y && plot.geom === "col") {
    const buckets = new Map<string, number>();
    for (let i = 0; i < plot.data.n; i += 1) {
      const label = String(x.data[i]);
      buckets.set(label, (buckets.get(label) ?? 0) + Number(y.data[i] ?? 0));
    }
    for (const [label, total] of buckets) points.push({ x: label, y: total });
  } else if (x && y) {
    for (let i = 0; i < plot.data.n; i += 1) {
      points.push({ x: String(x.data[i]), y: Number(y.data[i] ?? 0), series: plot.color ? String(plot.data.columns[plot.color].data[i]) : undefined });
    }
  }
  return { geom: plot.geom, xLabel: plot.x, yLabel: plot.y, title: plot.title, points };
}

export function gradeR(userCode: string, solutionCode: string, expectedExpr: string, checkVariable?: string) {
  try {
    const expectedRun = runR(expectedExpr, baseEnv());
    const solutionRun = runR(solutionCode, baseEnv());
    const student = runR(userCode, baseEnv());
    const mine = checkVariable ? student.env.get(checkVariable) : student.value;
    const gold = checkVariable ? solutionRun.env.get(checkVariable) : solutionRun.value;
    const expectedValue = checkVariable ? expectedRun.env.get(checkVariable) : expectedRun.value;
    const ok = valuesEqual(mine, expectedValue) || valuesEqual(mine, gold);
    return {
      ok,
      message: ok ? "The R result matches." : `Not yet. Your result: ${valuePreview(mine)}`,
      preview: valuePreview(mine),
      plots: student.plots.map(plotToView),
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not run that R code.", preview: "", plots: [] };
  }
}
