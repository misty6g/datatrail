import type { Blueprint } from "../expand";

export const functionLessons: Blueprint[] = [
  {
    id: "py-4",
    title: "Functions",
    minutes: 5,
    idea: [
      "def names a block of code you can call, and return sends a value back to the caller.",
      "greet with an empty parameter list returns the string hi when you call greet().",
    ],
    example: {
      language: "python",
      code: `def greet():
    return "hi"

print(greet())`,
      output: "hi",
    },
    takeaway: "def greet(): followed by return \"hi\" makes greet() evaluate to hi.",
    question: {
      prompt: "What does greet() return?",
      codeContext: "def greet():\n    return \"hi\"",
      choices: ["None", "\"hi\"", "\"greet\"", "It prints hi and returns nothing"],
      answer: 1,
      explanation: "return \"hi\" is the value of the call greet(). Printing is a separate step.",
    },
    drill: {
      kind: "tokens",
      prompt: "Finish the function so a call returns hi.",
      template: ["def", "", "():", "return", ""],
      bank: ["greet", "\"hi\"", "\"hello\"", "print"],
      answer: ["greet", "\"hi\""],
      hint: "The name is greet and the returned text is hi.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt: "Define a function named greet with no parameters that returns the string hi.",
      starter: "def greet():\n    return \"\"\n",
      solutionCode: `def greet():
    return "hi"
`,
      validationCode: "assert greet() == \"hi\"\n",
      hint: "Inside def greet(): write return \"hi\".",
    },
    reflect: {
      prompt: "Why return \"hi\" instead of only printing it inside greet?",
      choices: [
        "The caller can use the returned string in later code",
        "print stores the value on the function",
        "return always prints to the screen",
        "A function body cannot contain print",
      ],
      answer: 0,
      explanation: "The returned string is available to the caller. A print inside the function would display text and still return None if return is missing.",
    },
    closer: "Small functions like greet turn a repeated result into a name you can call.",
  },
  {
    id: "py-10",
    title: "Lambdas and sort",
    minutes: 6,
    datasetId: "products",
    idea: [
      "sorted walks a list and uses a key function to decide the order, and a lambda is a one-expression function.",
      "Northstar Annual lists at 499, and Field Notebook lists at 12, so a descending price sort puts the annual plan first.",
    ],
    example: {
      language: "python",
      code: `prices = [
    {"product": "Trail Bottle", "list_price": 24},
    {"product": "Northstar Annual", "list_price": 499},
]
ranked = sorted(prices, key=lambda row: row["list_price"], reverse=True)
print(ranked[0]["product"])`,
      output: "Northstar Annual",
    },
    takeaway: "Pass key=lambda row: row[\"list_price\"] and reverse=True to sort prices from high to low.",
    question: {
      prompt: "products is sorted by list_price with reverse=True. Which product is first?",
      choices: ["Field Notebook", "Trail Bottle", "Northstar Annual", "API Add-on"],
      answer: 2,
      explanation: "Northstar Annual has the highest list price at 499, so it leads a descending sort.",
    },
    drill: {
      kind: "bug",
      prompt: "This sort should rank products by list price. Select the broken line and the fix.",
      lines: [
        "ranked = sorted(",
        "    products,",
        "    key=row[\"list_price\"],",
        "    reverse=True,",
        ")",
      ],
      buggyLine: 2,
      fixChoices: [
        "key=lambda row: row[\"list_price\"]",
        "key=products",
        "reverse=row",
        "lambda products: products",
      ],
      fixAnswer: 0,
      explanation: "key must be a function. lambda row: row[\"list_price\"] reads the price from each product as sorted calls it.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "products is already loaded. Sort it by list_price from high to low with a lambda, and store the product names in that order in pricey. Northstar Annual should be first and Field Notebook last.",
      starter: "pricey = []\n",
      solutionCode: `ranked = sorted(products, key=lambda row: row["list_price"], reverse=True)
pricey = [row["product"] for row in ranked]
`,
      validationCode: `assert pricey == [
    "Northstar Annual",
    "Summit Pack",
    "Northstar Monthly",
    "Trail Bottle",
    "API Add-on",
    "Field Notebook",
]
assert pricey[0] == "Northstar Annual"
assert pricey[-1] == "Field Notebook"
`,
      hint: "sorted(products, key=lambda row: row[\"list_price\"], reverse=True), then collect row[\"product\"].",
    },
    reflect: {
      prompt: "What does the lambda receive for each comparison?",
      choices: [
        "The whole products list",
        "Only the sort direction",
        "One product dictionary, so it can read list_price",
        "The product name as a number",
      ],
      answer: 2,
      explanation: "sorted calls the key function once per row. The lambda reads list_price from that product dictionary.",
    },
    closer: "Sort the rows with a lambda key, then pull out the labels you want to show.",
  },
  {
    id: "py-11",
    title: "try and except",
    minutes: 6,
    datasetId: "messy_spend",
    idea: [
      "messy_spend stores dollars as text such as $1,200, repeats Spring Search, and leaves Spring Social blank.",
      "try attempts the conversion, and except turns a blank or a bad string into 0 so the other rows can still be summed.",
    ],
    example: {
      language: "python",
      code: `raw = "$1,200"
try:
    spend = float(raw.replace("$", "").replace(",", ""))
except ValueError:
    spend = 0
print(spend)`,
      output: "1200.0",
    },
    takeaway: "Strip the dollar sign and comma, convert with float, and catch ValueError or TypeError.",
    question: {
      prompt: "Spring Social has a blank spend_text. What should the except branch do for that cell?",
      choices: [
        "Stop the report on the first blank",
        "Delete the campaigns table",
        "Turn every campaign spend into text",
        "Record 0 so the remaining rows can still be summed",
      ],
      answer: 3,
      explanation: "The blank cell cannot become a number. Catching the error and using 0 keeps the parse going for $500 and $200.",
    },
    drill: {
      kind: "fill",
      prompt: "Type the keyword that catches the conversion error.",
      codeTemplate: "try:\n    spend = float(cleaned)\n____ ValueError:\n    spend = 0",
      answer: ["except"],
      hint: "The keyword paired with try is except.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Define parse_spend(raw). Strip $ and commas, convert with float, and return 0 when raw is missing or not a number. Map it over messy_spend into a list named parsed, and store the sum in parsed_total. The blank Spring Social row counts as 0, and the duplicate Spring Search rows are both included, so the parsed total is 3100. The clean campaigns table is a different file: its spend sums to 2700.",
      starter: `def parse_spend(raw):
    return 0

parsed = []
parsed_total = 0
`,
      solutionCode: `def parse_spend(raw):
    try:
        cleaned = str(raw).replace("$", "").replace(",", "")
        return float(cleaned)
    except (TypeError, ValueError):
        return 0

parsed = [parse_spend(row["spend_text"]) for row in messy_spend]
parsed_total = sum(parsed)
`,
      validationCode: `assert parse_spend("$1,200") == 1200
assert parse_spend(None) == 0
assert parse_spend("n/a") == 0
assert len(parsed) == 5
assert parsed_total == 3100
`,
      hint: "float(\"$1,200\".replace(\"$", \"\").replace(\",\", \"\")) is 1200. A blank raw value should hit except and return 0.",
    },
    reflect: {
      prompt: "Why convert \"$1,200\" before adding campaign spend?",
      choices: [
        "The dollar sign and comma make it text, and sum needs a number",
        "sum can add currency symbols",
        "Python stores every number as text",
        "int() ignores dollar signs on its own",
      ],
      answer: 0,
      explanation: "\"$1,200\" is text. After the symbols are removed, float can turn 1200 into a number that sum can add.",
    },
    closer: "Clean the text, attempt the conversion, and replace a failed cell with 0.",
  },
];

export const tableLessons: Blueprint[] = [
  {
    id: "py-12",
    title: "Inspect line items",
    minutes: 5,
    datasetId: "line_items",
    idea: [
      "column(rows, name) returns one field from every dictionary, in table order.",
      "line_items has 16 rows, amount is quantity times unit price, and the amounts sum to 1883.",
    ],
    example: {
      language: "python",
      code: `def column(rows, name):
    return [row[name] for row in rows]

sample = [{"amount": 48}, {"amount": 89}]
print(column(sample, "amount"))`,
      output: "[48, 89]",
    },
    takeaway: "Pull amount with column(line_items, \"amount\") before you sum or scan it.",
    question: {
      prompt: "What does column(line_items, \"amount\") return?",
      choices: [
        "A list of all 16 amount values",
        "One number, the sum of amount",
        "Only the shipped amounts",
        "The line_items table with amount removed",
      ],
      answer: 0,
      explanation: "column pulls the amount field from each of the 16 line items and returns that list. Summing is a separate step.",
    },
    drill: {
      kind: "order",
      prompt: "Order the steps that inspect line-item amounts.",
      items: [
        "Start from the line_items rows",
        "Pull amount with column()",
        "Confirm the list has 16 values",
        "Sum the list and expect 1883",
      ],
      answer: [
        "Start from the line_items rows",
        "Pull amount with column()",
        "Confirm the list has 16 values",
        "Sum the list and expect 1883",
      ],
      explanation: "Read the column first, check its length, then add it.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Use column() to pull every amount from line_items into a list named amounts. The table has 16 line items and the amounts sum to 1883. The first amount is 48, from two Trail Bottles at 24.",
      starter: "amounts = []\n",
      solutionCode: "amounts = column(line_items, \"amount\")\n",
      validationCode: `assert amounts == column(line_items, "amount")
assert len(amounts) == 16
assert sum(amounts) == 1883
assert amounts[0] == 48
`,
      hint: "amounts = column(line_items, \"amount\").",
    },
    reflect: {
      prompt: "sum of every line-item amount equals which total?",
      choices: ["1648, the shipped lines only", "2700, campaign spend", "4300, active MRR", "1883, every line item"],
      answer: 3,
      explanation: "All 16 line items sum to 1883. The shipped subset, campaign spend, and active MRR are different totals.",
    },
    closer: "Inspect a column with column() so later filters start from the full 1883.",
  },
  {
    id: "py-13",
    title: "Shipped line items",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "keep(rows, name, value) returns the dictionaries whose field equals value.",
      "Eight orders are shipped, while the shipped line-item rows are a different count, and their amount total is 1648.",
    ],
    example: {
      language: "python",
      code: `def keep(rows, name, value):
    return [row for row in rows if row[name] == value]

sample = [{"status": "shipped", "amount": 48}, {"status": "refunded", "amount": 49}]
print(keep(sample, "status", "shipped"))`,
      output: "[{'status': 'shipped', 'amount': 48}]",
    },
    takeaway: "Filter line_items on status, then sum amount with total().",
    question: {
      prompt: "keep(line_items, \"status\", \"shipped\") keeps which rows?",
      choices: [
        "The 8 shipped rows from the orders table",
        "Line-item rows whose status is shipped",
        "Every line item, whatever the status",
        "Customers in the West",
      ],
      answer: 1,
      explanation: "keep reads the status field on each line item. A shipped order can contribute more than one line item, so this is not a count of orders.",
    },
    drill: {
      kind: "tokens",
      prompt: "Fill the keep call that selects shipped line items.",
      template: ["shipped", "=", "keep(line_items,", "", ",", "", ")"],
      bank: ["\"status\"", "\"shipped\"", "\"region\"", "\"West\""],
      answer: ["\"status\"", "\"shipped\""],
      hint: "The field is status and the value is shipped.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Filter line_items, not orders. Store the rows whose status is shipped in a variable named shipped. There are 8 shipped orders, and a shipped order can hold several line items. Sum amount with total(); the shipped line items total 1648.",
      starter: "shipped = []\n",
      solutionCode: "shipped = keep(line_items, \"status\", \"shipped\")\n",
      validationCode: `shipped_check = keep(line_items, "status", "shipped")
assert shipped == shipped_check
assert len(shipped) == 12
assert total(shipped, "amount") == 1648
`,
      hint: "shipped = keep(line_items, \"status\", \"shipped\"). That list has 12 line-item rows and totals 1648.",
    },
    reflect: {
      prompt: "Shipped line items total 1648 and every line item totals 1883. Why is the shipped number smaller?",
      choices: [
        "Refunded, pending, and cancelled line items stay out of the shipped filter",
        "total() drops cents from every row",
        "West rows are excluded",
        "quantity is ignored on shipped rows",
      ],
      answer: 0,
      explanation: "The rows that are not shipped sum to 235. 1648 plus 235 is the full 1883.",
    },
    closer: "Count and sum shipped line-item rows. Eight shipped orders is a different grain.",
  },
  {
    id: "py-14",
    title: "Missing referrers",
    minutes: 5,
    datasetId: "customers",
    idea: [
      "A missing referred_by arrives as None, and a preview may print that blank as NULL.",
      "Six of the nine customers have no referrer: Maya Chen, Amina Diallo, Jonah Park, Priya Shah, Sofia Rossi, and Noah Kim.",
    ],
    example: {
      language: "python",
      code: `row = {"name": "Maya Chen", "referred_by": None}
print(row["referred_by"] is None)`,
      output: "True",
    },
    takeaway: "Test a missing referrer with is None, then count the matches.",
    question: {
      prompt: "Of the 9 customers, how many have referred_by set to None?",
      choices: ["3", "9", "6", "0, because the blank is an empty string"],
      answer: 2,
      explanation: "Luis Ortega, Owen Brooks, and Hannah Berg have referrers. The other 6 customers have referred_by is None.",
    },
    drill: {
      kind: "bug",
      prompt: "This count misses every blank referrer. Select the broken line and the fix.",
      lines: [
        "missing_referrals = 0",
        "for row in customers:",
        "    if row[\"referred_by\"] == \"\":",
        "        missing_referrals += 1",
      ],
      buggyLine: 2,
      fixChoices: [
        "if row[\"referred_by\"] is None:",
        "if row[\"referred_by\"] == 0:",
        "if row[\"referred_by\"] == \"None\":",
        "if row is None:",
      ],
      fixAnswer: 0,
      explanation: "The missing value is None. An empty string, the text None, and a missing row are different tests.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Count customers whose referred_by is None. Store that count in missing_referrals. Use is None. Six customers have no referrer.",
      starter: "missing_referrals = 0\n",
      solutionCode: "missing_referrals = sum(1 for row in customers if row[\"referred_by\"] is None)\n",
      validationCode: `assert missing_referrals == 6
assert sum(1 for row in customers if row["referred_by"] is None) == 6
`,
      hint: "sum(1 for row in customers if row[\"referred_by\"] is None).",
    },
    reflect: {
      prompt: "Which test identifies a missing referrer on these customer rows?",
      choices: [
        "row[\"referred_by\"] == \"\"",
        "row[\"referred_by\"] == 0",
        "len(row[\"referred_by\"]) == 0",
        "row[\"referred_by\"] is None",
      ],
      answer: 3,
      explanation: "The field is present and holds None. is None is the test that matches those six rows.",
    },
    closer: "Count None with is None. Luis, Owen, and Hannah are the three customers who were referred.",
  },
];
