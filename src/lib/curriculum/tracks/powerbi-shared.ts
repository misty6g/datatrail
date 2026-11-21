import type { Blueprint } from "../expand";

type BiSpec = Extract<Blueprint["practice"], { kind: "bi_sandbox" }>["targetSpec"];

export const cleanSpendSteps = ["drop_duplicates", "drop_null_spend", "parse_spend"];

export function biPractice(id: string, prompt: string, hint: string, targetSpec: BiSpec): Blueprint["practice"] {
  return {
    id,
    kind: "bi_sandbox",
    tool: "powerbi",
    datasetId: "line_items",
    starter: "",
    prompt,
    hint,
    targetSpec,
  } as Blueprint["practice"];
}

export function querySpec(): BiSpec {
  return { mode: "query", steps: [...cleanSpendSteps] };
}

export function daxSpec(expression: string): BiSpec {
  return { mode: "dax", expression };
}

export function modelSpec(customer: boolean, product: boolean, date: boolean): BiSpec {
  return {
    mode: "model",
    relationships: [
      { from: "DimCustomer[customer_id]", to: "FactSales[customer_id]", active: customer },
      { from: "DimProduct[product_id]", to: "FactSales[product_id]", active: product },
      { from: "DimDate[date]", to: "FactSales[order_date]", active: date },
    ],
  };
}

export const spendCleanPrompt =
  "Clean the Northstar Retail campaign extract. Turn these steps on in order: remove duplicate campaign rows, drop rows with a blank spend, then turn $1,200 text into a number.";

export const spendCleanHint =
  "Click the three steps from top to bottom in that order. The check compares the sequence, and the cleaned spend for the remaining campaigns is 1,900.";
