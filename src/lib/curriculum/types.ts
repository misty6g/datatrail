export type Exercise =
  | {
      kind: "multiple_choice";
      prompt: string;
      choices: string[];
      answer: number;
      hint?: string;
    }
  | {
      kind: "fill_blank";
      prompt: string;
      answer: string | string[];
      placeholder?: string;
      hint?: string;
    }
  | {
      kind: "code";
      prompt: string;
      language: "sql" | "python" | "r";
      starter?: string;
      answer: string | string[];
      hint?: string;
    }
  | {
      kind: "order";
      prompt: string;
      items: string[];
      answer: string[];
      hint?: string;
    };

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  concept: string;
  exercise: Exercise;
};

export type Course = {
  id: string;
  title: string;
  tagline: string;
  color: string;
  accent: string;
  icon: string;
  lessons: Lesson[];
};