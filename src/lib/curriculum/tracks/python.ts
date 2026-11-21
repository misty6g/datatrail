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
      choices: ["The float 15.0", "The integer 15", "The string \"15\"", "A ZeroDivisionError"],
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
      prompt: "Spring Search spent 1200 and gained 80 signups. Store those numbers in spend and signups. Divide with / and store the float in cost_per_signup. Divide with // and store the integer in whole_dollars.",
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
  {
    id: "py-6",
    title: "f-strings",
    minutes: 4,
    idea: [
      "An f-string evaluates expressions inside braces and stitches them into one piece of text.",
      "Maya Chen is in the West and Noah Kim is in the East, so the same template can label either customer.",
    ],
    example: {
      language: "python",
      code: `name = "Maya Chen"
region = "West"
print(f"{name} is in {region}")`,
      output: "Maya Chen is in West",
    },
    takeaway: "Prefix the quotes with f and put each variable in braces.",
    question: {
      prompt: "name is Maya Chen and region is West. What does f\"{name} is in {region}\" produce?",
      codeContext: "name = \"Maya Chen\"\nregion = \"West\"\nlabel = f\"{name} is in {region}\"",
      choices: ["The braces stay as literal text", "Maya Chen is in West", "name + region, with no space", "A syntax error on the period"],
      answer: 1,
      explanation: "The f prefix inserts the current values of name and region, producing Maya Chen is in West.",
    },
    drill: {
      kind: "bug",
      prompt: "This label prints the braces instead of the customer. Select the broken line and the fix.",
      lines: ["name = \"Maya Chen\"", "region = \"West\"", "label = \"{name} is in {region}\"", "print(label)"],
      buggyLine: 2,
      fixChoices: ["label = f\"{name} is in {region}\"", "label = name + region", "print(f name)", "region = \"{West}\""],
      fixAnswer: 0,
      explanation: "Without the f prefix, braces are ordinary characters. Adding f inserts the variable values.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt: "Set name to Maya Chen and region to West. Use an f-string to store Maya Chen is in West in message. Then set other_name to Noah Kim and other_region to East, and store Noah Kim is in East in other_message.",
      starter: "name = \"Maya Chen\"\nregion = \"West\"\nmessage = \"\"\nother_name = \"Noah Kim\"\nother_region = \"East\"\nother_message = \"\"\n",
      solutionCode: `name = "Maya Chen"
region = "West"
message = f"{name} is in {region}"
other_name = "Noah Kim"
other_region = "East"
other_message = f"{other_name} is in {other_region}"
`,
      validationCode: `assert message == "Maya Chen is in West"
assert other_message == "Noah Kim is in East"
`,
      hint: "Write message = f\"{name} is in {region}\" and use the same pattern for other_message.",
    },
    reflect: {
      prompt: "Active MRR is the number 4300. Why can an f-string place that number into a sentence?",
      choices: ["An f-string rejects numbers", "The braces convert the number into text inside the sentence", "Plus signs cannot join two strings", "The variable permanently becomes a string"],
      answer: 1,
      explanation: "f\"{count} subscriptions bring ${mrr} MRR\" turns the number into text for that string. The variable mrr itself stays a number.",
    },
    closer: "Build labels from the live variables so a new name or region updates the sentence.",
  },
  {
    id: "py-7",
    title: "if and else",
    minutes: 5,
    idea: [
      "if, elif, and else choose one branch, and each header ends with a colon and an indented block.",
      "Shipped orders are closed, pending orders are open, and refunded or cancelled orders fall through to review.",
    ],
    example: {
      language: "python",
      code: `status = "pending"
if status == "shipped":
    bucket = "closed"
elif status == "pending":
    bucket = "open"
else:
    bucket = "review"
print(bucket)`,
      output: "open",
    },
    takeaway: "The first true condition wins, and else handles every status that remains.",
    question: {
      prompt: "status is pending. What does bucket hold after this branch?",
      codeContext: "status = \"pending\"\nif status == \"shipped\":\n    bucket = \"closed\"\nelif status == \"pending\":\n    bucket = \"open\"\nelse:\n    bucket = \"review\"",
      choices: ["closed", "open", "review", "pending"],
      answer: 1,
      explanation: "The shipped test is false and the pending test is true, so bucket becomes open.",
    },
    drill: {
      kind: "order",
      prompt: "Order the decision for an order status.",
      items: ["Check whether status is shipped", "If that fails, check whether status is pending", "Otherwise take the else branch", "Keep the matching label"],
      answer: ["Check whether status is shipped", "If that fails, check whether status is pending", "Otherwise take the else branch", "Keep the matching label"],
      explanation: "Python tests the conditions from top to bottom and keeps the first match.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt: "status is refunded. Use if, elif, and else to set bucket to closed when status is shipped, open when status is pending, and review for every other status, including refunded and cancelled.",
      starter: "status = \"refunded\"\nbucket = \"\"\n",
      solutionCode: `status = "refunded"
if status == "shipped":
    bucket = "closed"
elif status == "pending":
    bucket = "open"
else:
    bucket = "review"
`,
      validationCode: `assert status == "refunded"
assert bucket == "review"
`,
      hint: "The refunded status misses both comparisons, so the else branch sets bucket = \"review\".",
    },
    reflect: {
      prompt: "A cancelled order should be labeled review. Which branch assigns that label?",
      choices: ["The shipped if branch", "The pending elif branch", "The else branch", "A branch that deletes bucket"],
      answer: 2,
      explanation: "cancelled matches neither shipped nor pending, so the else branch assigns review. The orders table spells that status cancelled.",
    },
    closer: "Write the specific statuses first and let else collect the remaining order statuses.",
  },
];

const collectionLessons: Blueprint[] = [
  {
    id: "py-2",
    title: "Lists",
    minutes: 4,
    idea: [
      "A list stores values in order inside square brackets, so the first item sits at index 0.",
      "cities = [\"Paris\", \"Tokyo\"] has length 2, and cities[0] is Paris.",
    ],
    example: {
      language: "python",
      code: `cities = ["Paris", "Tokyo"]
print(cities[0])
print(len(cities))`,
      output: "Paris\n2",
    },
    takeaway: "Square brackets keep order, index 0 is the first city, and len counts the items.",
    question: {
      prompt: "cities = [\"Paris\", \"Tokyo\"]. What is cities[0]?",
      choices: ["Tokyo", "Paris", "[\"Paris\", \"Tokyo\"]", "2"],
      answer: 1,
      explanation: "Indexes start at 0, so cities[0] is Paris and cities[1] is Tokyo.",
    },
    drill: {
      kind: "tokens",
      prompt: "Build the list with Paris first and Tokyo second.",
      template: ["cities", "=", "[", "", ",", "", "]"],
      bank: ["\"Paris\"", "\"Tokyo\"", "\"London\"", "\"Berlin\""],
      answer: ["\"Paris\"", "\"Tokyo\""],
      hint: "The first blank is Paris.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt: "Create a list named cities containing Paris and then Tokyo.",
      starter: "cities = []\n",
      solutionCode: "cities = [\"Paris\", \"Tokyo\"]\n",
      validationCode: "assert cities == [\"Paris\", \"Tokyo\"]\nassert cities[0] == \"Paris\"\nassert len(cities) == 2\n",
      hint: "cities = [\"Paris\", \"Tokyo\"]",
    },
    reflect: {
      prompt: "What does len(cities) return for [\"Paris\", \"Tokyo\"]?",
      choices: ["Tokyo", "1", "2", "Paris"],
      answer: 2,
      explanation: "len counts the entries. The list holds two city names, so the length is 2.",
    },
    closer: "Use a list when the order of values matters and you will read them by position.",
  },
];

const functionLessons: Blueprint[] = [];
const tableLessons: Blueprint[] = [];
const reshapeLessons: Blueprint[] = [];
const capstoneLessons: Blueprint[] = [];
export const pythonModules: Module[] = [];
