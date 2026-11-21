import type { Blueprint } from "../expand";

export function sqlPractice(id: string, prompt: string, starter: string, solutionQuery: string, hint: string, requiredClauses?: string[], datasetId = "orders"): Blueprint["practice"] {
  return {
    id,
    kind: "sql_sandbox",
    prompt,
    datasetId,
    starter,
    solutionQuery,
    requiredClauses,
    hint,
  };
}
