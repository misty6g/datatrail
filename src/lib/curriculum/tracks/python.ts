import { mod, type Blueprint } from "../expand";
import type { Module } from "../types";

const basicLessons: Blueprint[] = [
  {
    id: "py-1",
    title: "Variables",
    minutes: 4,
    idea: [
      "A variable is a name bound to a value with a single equals sign, so score = 95 stores the number 95.",
      "Python creates the name on first assignment, and a later assignment to the same name replaces the value.",
    ],
    example: {
      language: "python",
      code: `score = 95
print(score)`,
      output: "95",
    },
    takeaway: "score = 95 stores the number 95 under the name score.",
    question: {
      prompt: "After score = 95, what does score hold?",
      choices: [
        "The text \"95\"",
        "The number 95",
        "Nothing until a print statement runs",
        "An error, because score was never declared",
      ],
      answer: 1,
      explanation: "The assignment binds the integer 95 to score. Print displays a value, and Python does not require a separate declaration.",
    },
    drill: {
      kind: "tokens",
      prompt: "Tap the tokens that assign the number 95 to score.",
      template: ["", "", ""],
      bank: ["score", "=", "95", "==", "100"],
      answer: ["score", "=", "95"],
      hint: "One equals sign assigns. The name comes first.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt: "Create a variable named score and set it to the number 95.",
      starter: "# Bind the quiz score.\n",
      solutionCode: "score = 95\n",
      validationCode: "assert score == 95\nassert isinstance(score, int)\n",
      hint: "Write score = 95 with a single equals sign.",
    },
    reflect: {
      prompt: "The next line is score = score + 5. What does score hold afterward?",
      choices: ["95", "\"95 + 5\"", "100", "The original Score variable"],
      answer: 2,
      explanation: "The right-hand side reads the current 95, adds 5, and stores 100 back in score.",
    },
    closer: "Whenever a later lesson names a result, bind it with name = value and reuse that exact name.",
  },
];
