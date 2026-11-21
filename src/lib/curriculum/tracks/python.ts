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
  {
    id: "py-5",
    title: "Types and arithmetic",
    minutes: 5,
    idea: [
      "Spring Search spent 1200 and recorded 80 signups, and the four campaigns together spent 2700 to earn 175 signups.",
      "In Python 3, / always returns a float, while // drops the fraction and returns an int.",
    ],
    example: {
      language: "python",
      code: `spend = 1200
signups = 80
print(spend / signups)
print(spend // signups)`,
      output: "15.0\n15",
    },
    takeaway: "1200 / 80 is the float 15.0, and 1200 // 80 is the integer 15.",
    question: {
      prompt: "Spring Search spent 1200 for 80 signups. What does 1200 / 80 produce in Python 3?",
      choices: [
        "The float 15.0",
        "The integer 15",
        "The string \"15\"",
        "A ZeroDivisionError",
      ],
      answer: 0,
      explanation: "True division with / returns a float. 80 is not zero, so the quotient is 15.0.",
    },
    drill: {
      kind: "fill",
      prompt: "Type the operator that divides and drops the fraction.",
      codeTemplate: "whole_dollars = spend ____ signups",
      answer: ["//"],
      hint: "Two slashes is floor division.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Spring Search spent 1200 and gained 80 signups. Store those numbers in spend and signups. Divide with / and store the float in cost_per_signup. Divide with // and store the integer in whole_dollars.",
      starter: "spend = 1200\nsignups = 80\ncost_per_signup = 0\nwhole_dollars = 0\n",
      solutionCode: `spend = 1200
signups = 80
cost_per_signup = spend / signups
whole_dollars = spend // signups
`,
      validationCode: `assert spend == 1200
assert signups == 80
assert cost_per_signup == 15
assert isinstance(cost_per_signup, float)
assert whole_dollars == 15
assert isinstance(whole_dollars, int)
`,
      hint: "cost_per_signup = spend / signups and whole_dollars = spend // signups.",
    },
    reflect: {
      prompt: "Which expression is the integer number of whole dollars for Spring Search?",
      choices: ["1200 / 80", "\"1200\" + \"80\"", "1200 // 80", "int(\"15.0\" + 0)"],
      answer: 2,
      explanation: "Floor division 1200 // 80 evaluates to the integer 15.",
    },
    closer: "Across all four campaigns, spend sums to 2700 and signups sum to 175, so the same / operator yields a float near 15.43.",
  },
];
