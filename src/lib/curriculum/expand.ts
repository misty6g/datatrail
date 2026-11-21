import type { Lesson, LessonStep, Module } from "./types";

type Drill =
  | {
      kind: "tokens";
      prompt: string;
      template: string[];
      bank: string[];
      answer: string[];
      hint: string;
    }
  | {
      kind: "bug";
      prompt: string;
      lines: string[];
      buggyLine: number;
      fixChoices: string[];
      fixAnswer: number;
      explanation: string;
    }
  | {
      kind: "order";
      prompt: string;
      items: string[];
      answer: string[];
      explanation: string;
    }
  | {
      kind: "fill";
      prompt: string;
      answer: string[];
      hint: string;
      codeTemplate?: string;
    };

export type Blueprint = {
  id: string;
  title: string;
  minutes: number;
  capstone?: boolean;
  datasetId?: string;
  idea: string[];
  example?: { language: string; code: string; output?: string };
  takeaway: string;
  question: {
    prompt: string;
    choices: string[];
    answer: number;
    explanation: string;
    hint?: string;
    codeContext?: string;
  };
  drill: Drill;
  practice: LessonStep;
  reflect: { prompt: string; choices: string[]; answer: number; explanation: string };
  closer: string;
};

function drillStep(id: string, drill: Drill): LessonStep {
  if (drill.kind === "tokens") {
    return { id, kind: "tap_tokens", prompt: drill.prompt, template: drill.template, bank: drill.bank, answer: drill.answer, hint: drill.hint };
  }
  if (drill.kind === "bug") {
    return {
      id,
      kind: "spot_bug",
      prompt: drill.prompt,
      lines: drill.lines,
      buggyLine: drill.buggyLine,
      fixChoices: drill.fixChoices,
      fixAnswer: drill.fixAnswer,
      explanation: drill.explanation,
    };
  }
  if (drill.kind === "order") {
    return { id, kind: "order", prompt: drill.prompt, items: drill.items, answer: drill.answer, explanation: drill.explanation };
  }
  return {
    id,
    kind: "fill_blank",
    prompt: drill.prompt,
    answer: drill.answer,
    hint: drill.hint,
    codeTemplate: drill.codeTemplate,
  };
}

export function lesson(moduleId: string, blueprint: Blueprint): Lesson {
  const practice = { ...blueprint.practice, id: `${blueprint.id}-practice` } as LessonStep;
  const steps: LessonStep[] = [
    {
      id: `${blueprint.id}-concept`,
      kind: "concept",
      title: blueprint.title,
      body: blueprint.idea,
      codeExample: blueprint.example,
      datasetId: blueprint.datasetId,
      takeaway: blueprint.takeaway,
    },
    {
      id: `${blueprint.id}-check`,
      kind: "multiple_choice",
      prompt: blueprint.question.prompt,
      codeContext: blueprint.question.codeContext,
      choices: blueprint.question.choices,
      answer: blueprint.question.answer,
      explanation: blueprint.question.explanation,
      hint: blueprint.question.hint,
    },
    drillStep(`${blueprint.id}-drill`, blueprint.drill),
    practice,
    {
      id: `${blueprint.id}-reflect`,
      kind: "multiple_choice",
      prompt: blueprint.reflect.prompt,
      choices: blueprint.reflect.choices,
      answer: blueprint.reflect.answer,
      explanation: blueprint.reflect.explanation,
    },
    {
      id: `${blueprint.id}-closer`,
      kind: "concept",
      title: "Lock it in",
      body: [blueprint.closer],
      takeaway: blueprint.takeaway,
    },
  ];
  return {
    id: blueprint.id,
    moduleId,
    title: blueprint.title,
    minutes: blueprint.minutes,
    capstone: blueprint.capstone,
    steps,
  };
}

export function mod(id: string, title: string, summary: string, cheatsheet: Module["cheatsheet"], blueprints: Blueprint[]): Module {
  return {
    id,
    title,
    summary,
    cheatsheet,
    lessons: blueprints.map((blueprint) => lesson(id, blueprint)),
  };
}
