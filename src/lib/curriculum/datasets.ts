export type ColumnType = "int" | "real" | "text";

export type DataTable = {
  name: string;
  columns: { name: string; type: ColumnType }[];
  rows: (string | number | null)[][];
};

function table(
  name: string,
  columns: { name: string; type: ColumnType }[],
  rows: (string | number | null)[][],
): DataTable {
  return { name, columns, rows };
}

const customers = table(
  "customers",
  [
    { name: "customer_id", type: "int" },
    { name: "name", type: "text" },
    { name: "region", type: "text" },
    { name: "segment", type: "text" },
    { name: "joined_on", type: "text" },
    { name: "referred_by", type: "text" },
  ],
  [
    [1, "Maya Chen", "West", "Enterprise", "2024-01-12", null],
    [2, "Luis Ortega", "East", "Mid-Market", "2024-02-03", "Maya Chen"],
    [3, "Amina Diallo", "West", "SMB", "2024-03-18", null],
    [4, "Jonah Park", "Central", "SMB", "2024-04-02", null],
    [5, "Priya Shah", "East", "Enterprise", "2024-05-21", null],
    [6, "Owen Brooks", "West", "Mid-Market", "2024-06-11", "Luis Ortega"],
    [7, "Sofia Rossi", "Central", "SMB", "2024-07-09", null],
    [8, "Noah Kim", "East", "SMB", "2024-08-30", null],
    [9, "Hannah Berg", "West", "Enterprise", "2024-11-02", "Priya Shah"],
  ],
);

const products = table(
  "products",
  [
    { name: "product_id", type: "int" },
    { name: "product", type: "text" },
    { name: "category", type: "text" },
    { name: "list_price", type: "real" },
  ],
  [
    [1, "Trail Bottle", "Gear", 24],
    [2, "Summit Pack", "Gear", 89],
    [3, "Field Notebook", "Gear", 12],
    [4, "Northstar Monthly", "Software", 49],
    [5, "Northstar Annual", "Software", 499],
    [6, "API Add-on", "Software", 19],
  ],
);

const orders = table(
  "orders",
  [
    { name: "order_id", type: "int" },
    { name: "customer_id", type: "int" },
    { name: "order_date", type: "text" },
    { name: "status", type: "text" },
    { name: "channel", type: "text" },
  ],
  [
    [1, 1, "2025-01-06", "shipped", "web"],
    [2, 2, "2025-01-14", "shipped", "retail"],
    [3, 1, "2025-02-02", "refunded", "web"],
    [4, 3, "2025-02-11", "shipped", "web"],
    [5, 4, "2025-03-03", "pending", "partner"],
    [6, 5, "2025-03-19", "shipped", "web"],
    [7, 6, "2025-04-08", "shipped", "retail"],
    [8, 2, "2025-04-22", "cancelled", "web"],
    [9, 7, "2025-05-16", "shipped", "web"],
    [10, 8, "2025-06-01", "shipped", "partner"],
    [11, 5, "2025-06-18", "shipped", "web"],
    [12, 9, "2025-07-07", "pending", "web"],
  ],
);

const orderItems = table(
  "order_items",
  [
    { name: "item_id", type: "int" },
    { name: "order_id", type: "int" },
    { name: "product_id", type: "int" },
    { name: "quantity", type: "int" },
    { name: "unit_price", type: "real" },
  ],
  [
    [1, 1, 1, 2, 24],
    [2, 1, 2, 1, 89],
    [3, 2, 3, 3, 12],
    [4, 3, 4, 1, 49],
    [5, 4, 1, 4, 24],
    [6, 4, 6, 2, 19],
    [7, 5, 2, 1, 89],
    [8, 6, 5, 1, 499],
    [9, 6, 1, 1, 24],
    [10, 7, 3, 5, 12],
    [11, 7, 1, 1, 24],
    [12, 8, 4, 1, 49],
    [13, 9, 2, 2, 89],
    [14, 10, 6, 3, 19],
    [15, 11, 5, 1, 499],
    [16, 12, 1, 2, 24],
  ],
);

const subscriptions = table(
  "subscriptions",
  [
    { name: "subscription_id", type: "int" },
    { name: "customer_id", type: "int" },
    { name: "plan", type: "text" },
    { name: "mrr", type: "real" },
    { name: "started_on", type: "text" },
    { name: "status", type: "text" },
  ],
  [
    [1, 1, "Enterprise", 1200, "2024-01-12", "active"],
    [2, 2, "Growth", 400, "2024-02-03", "active"],
    [3, 3, "Starter", 49, "2024-03-18", "canceled"],
    [4, 5, "Enterprise", 1500, "2024-05-21", "active"],
    [5, 6, "Growth", 400, "2024-06-11", "paused"],
    [6, 9, "Enterprise", 1200, "2024-11-02", "active"],
  ],
);

const campaigns = table(
  "campaigns",
  [
    { name: "campaign_id", type: "int" },
    { name: "campaign", type: "text" },
    { name: "channel", type: "text" },
    { name: "spend", type: "real" },
    { name: "clicks", type: "int" },
    { name: "signups", type: "int" },
  ],
  [
    [1, "Spring Search", "search", 1200, 4000, 80],
    [2, "Spring Social", "social", 800, 9000, 40],
    [3, "Partner Webinar", "partner", 500, 600, 25],
    [4, "Summer Email", "email", 200, 2500, 30],
  ],
);

const monthlyMrr = table(
  "monthly_mrr",
  [
    { name: "month", type: "text" },
    { name: "segment", type: "text" },
    { name: "mrr", type: "real" },
  ],
  [
    ["2024-01-01", "Enterprise", 1200],
    ["2024-01-01", "SMB", 200],
    ["2024-06-01", "Enterprise", 1800],
    ["2024-06-01", "SMB", 350],
    ["2025-01-01", "Enterprise", 2400],
    ["2025-01-01", "SMB", 420],
    ["2025-06-01", "Enterprise", 3100],
    ["2025-06-01", "SMB", 510],
  ],
);

const messySpend = table(
  "messy_spend",
  [
    { name: "row_id", type: "int" },
    { name: "campaign", type: "text" },
    { name: "channel", type: "text" },
    { name: "spend_text", type: "text" },
    { name: "month", type: "text" },
  ],
  [
    [1, "Spring Search", "Search", "$1,200", "2025-03"],
    [2, "Spring Search", "Search", "$1,200", "2025-03"],
    [3, "Spring Social", "Social", null, "2025-03"],
    [4, "Partner Webinar", "Partner", "$500", "2025-04"],
    [5, "Summer Email", "Email", "$200", "2025-06"],
  ],
);

function idx(tableDef: DataTable, column: string) {
  const index = tableDef.columns.findIndex((col) => col.name === column);
  if (index < 0) throw new Error(`Missing column ${tableDef.name}.${column}`);
  return index;
}

function buildLineItems(): DataTable {
  const rows: (string | number | null)[][] = [];
  for (const item of orderItems.rows) {
    const order = orders.rows.find((row) => row[0] === item[1]);
    const customer = customers.rows.find((row) => row[0] === order?.[1]);
    const product = products.rows.find((row) => row[0] === item[2]);
    if (!order || !customer || !product) continue;
    const quantity = Number(item[3]);
    const unitPrice = Number(item[4]);
    rows.push([
      item[0],
      order[0],
      customer[0],
      customer[1],
      customer[2],
      customer[3],
      product[0],
      product[1],
      product[2],
      order[2],
      order[3],
      order[4],
      quantity,
      unitPrice,
      quantity * unitPrice,
    ]);
  }
  return table(
    "line_items",
    [
      { name: "item_id", type: "int" },
      { name: "order_id", type: "int" },
      { name: "customer_id", type: "int" },
      { name: "customer", type: "text" },
      { name: "region", type: "text" },
      { name: "segment", type: "text" },
      { name: "product_id", type: "int" },
      { name: "product", type: "text" },
      { name: "category", type: "text" },
      { name: "order_date", type: "text" },
      { name: "status", type: "text" },
      { name: "channel", type: "text" },
      { name: "quantity", type: "int" },
      { name: "unit_price", type: "real" },
      { name: "amount", type: "real" },
    ],
    rows,
  );
}

export const lineItems = buildLineItems();

export const tables: DataTable[] = [
  customers,
  products,
  orders,
  orderItems,
  subscriptions,
  campaigns,
  monthlyMrr,
  messySpend,
  lineItems,
];

export const tableMap = Object.fromEntries(tables.map((item) => [item.name, item]));

function sqlLiteral(value: string | number | null) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

export function seedSql() {
  return tables
    .map((item) => {
      const cols = item.columns.map((col) => col.name).join(", ");
      const colTypes = item.columns
        .map((col) => `${col.name} ${col.type === "text" ? "TEXT" : col.type === "int" ? "INTEGER" : "REAL"}`)
        .join(", ");
      const inserts = item.rows
        .map((row) => `INSERT INTO ${item.name} (${cols}) VALUES (${row.map(sqlLiteral).join(", ")});`)
        .join("\n");
      return `CREATE TABLE ${item.name} (${colTypes});\n${inserts}`;
    })
    .join("\n");
}

export function records(name: string) {
  const item = tableMap[name];
  if (!item) throw new Error(`Unknown table ${name}`);
  return item.rows.map((row) => {
    const record: Record<string, string | number | null> = {};
    item.columns.forEach((col, index) => {
      record[col.name] = row[index];
    });
    return record;
  });
}

function pythonLiteral(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.map((item) => pythonLiteral(item)).join(", ")}]`;
  if (typeof value === "object") {
    return `{${Object.entries(value)
      .map(([key, item]) => `${JSON.stringify(key)}: ${pythonLiteral(item)}`)
      .join(", ")}}`;
  }
  return "None";
}

export function pythonDatasetSetup() {
  const names = ["customers", "products", "orders", "order_items", "subscriptions", "campaigns", "monthly_mrr", "line_items", "messy_spend"];
  const tables = names.map((name) => `${name} = ${pythonLiteral(records(name))}`).join("\n");
  return `${tables}
def column(rows, name):
    return [row[name] for row in rows]

def keep(rows, name, value):
    return [row for row in rows if row[name] == value]

def total(rows, name):
    return sum((row[name] or 0) for row in rows)
`;
}

export const highlightedTables = [
  "customers",
  "orders",
  "order_items",
  "products",
  "line_items",
  "subscriptions",
  "campaigns",
  "monthly_mrr",
];

export function columnIndex(name: string, column: string) {
  return idx(tableMap[name], column);
}
