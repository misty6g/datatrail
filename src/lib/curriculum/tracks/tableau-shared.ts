import type { Blueprint } from "../expand";

type ShelfPill = {
  field: string;
  agg?: "SUM" | "AVG" | "COUNT" | "COUNTD" | null;
};

type TableauView = {
  mode: "tableau";
  columns: ShelfPill[];
  rows: ShelfPill[];
  color: ShelfPill | null;
  mark: "bar" | "line" | "circle" | "text";
  filters: { field: string; value: string }[];
};

export function tableauPractice(step: {
  id: string;
  kind: "bi_sandbox";
  tool: "tableau";
  prompt: string;
  datasetId: "line_items";
  starter: "";
  hint: string;
  targetSpec: TableauView;
}): Blueprint["practice"] {
  return step;
}
