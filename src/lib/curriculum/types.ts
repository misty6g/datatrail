export type Pill = {
  field: string;
  agg?: "SUM" | "AVG" | "COUNT" | "COUNTD" | null;
};

export type BiFilter = { field: string; value: string };

export type BiRelationship = {
  from: string;
  to: string;
  active: boolean;
};

export type BiTargetSpec = {
  mode: "tableau" | "dax" | "query" | "model";
  columns?: Pill[];
  rows?: Pill[];
  color?: Pill | null;
  mark?: "bar" | "line" | "circle" | "text";
  filters?: BiFilter[];
  expression?: string;
  steps?: string[];
  relationships?: BiRelationship[];
  reportFilters?: BiFilter[];
};

export type LessonStep =
  | {
      id: string;
      kind: "concept";
      title: string;
      body: string[];
      codeExample?: { language: string; code: string; output?: string };
      datasetId?: string;
      takeaway: string;
    }
  | {
      id: string;
      kind: "multiple_choice";
      prompt: string;
      codeContext?: string;
      choices: string[];
      answer: number;
      explanation: string;
      hint?: string;
    }
  | {
      id: string;
      kind: "spot_bug";
      prompt: string;
      lines: string[];
      buggyLine: number;
      fixChoices: string[];
      fixAnswer: number;
      explanation: string;
    }
  | {
      id: string;
      kind: "tap_tokens";
      prompt: string;
      template: string[];
      bank: string[];
      answer: string[];
      hint?: string;
    }
  | {
      id: string;
      kind: "fill_blank";
      prompt: string;
      codeTemplate?: string;
      answer: string[];
      placeholder?: string;
      hint?: string;
    }
  | {
      id: string;
      kind: "order";
      prompt: string;
      items: string[];
      answer: string[];
      explanation?: string;
    }
  | {
      id: string;
      kind: "sql_sandbox";
      prompt: string;
      datasetId: string;
      starter: string;
      solutionQuery: string;
      requiredClauses?: string[];
      hint: string;
    }
  | {
      id: string;
      kind: "python_sandbox";
      prompt: string;
      datasetId?: string;
      starter: string;
      setupCode?: string;
      solutionCode: string;
      validationCode: string;
      expectedStdout?: string;
      hint: string;
    }
  | {
      id: string;
      kind: "r_sandbox";
      prompt: string;
      datasetId?: string;
      starter: string;
      solutionCode: string;
      expectedExpr: string;
      checkVariable?: string;
      hint: string;
    }
  | {
      id: string;
      kind: "bi_sandbox";
      tool: "tableau" | "powerbi";
      prompt: string;
      datasetId: string;
      targetSpec: BiTargetSpec;
      starterSpec?: Partial<BiTargetSpec>;
      hint: string;
    };

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  minutes: number;
  capstone?: boolean;
  steps: LessonStep[];
};

export type CheatItem = { title: string; items: string[] };

export type Module = {
  id: string;
  title: string;
  summary: string;
  cheatsheet: CheatItem[];
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  tagline: string;
  color: string;
  accent: string;
  icon: string;
  modules: Module[];
};

export type ProgressRow = {
  course_id: string;
  lesson_id: string;
  status: "started" | "completed";
  score: number | null;
  current_step: number;
  xp_earned: number;
  completed_at: string | null;
  updated_at?: string | null;
};
