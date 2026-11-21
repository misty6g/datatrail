import type { Blueprint } from "../expand";

export const reshapeLessons: Blueprint[] = [
  {
    id: "py-15",
    title: "Group revenue by region",
    minutes: 7,
    datasetId: "line_items",
    idea: [
      "A dictionary can accumulate a sum: start a region at 0, then add each line item's amount.",
      "Group every line item, shipped or not, so each region key holds the revenue for that region.",
    ],
    example: {
      language: "python",
      code: `rows = [
    {"region": "West", "amount": 48},
    {"region": "East", "amount": 36},
    {"region": "West", "amount": 89},
]
region_totals = {}
for row in rows:
    region = row["region"]
    region_totals[region] = region_totals.get(region, 0) + row["amount"]
print(region_totals)`,
      output: "{'West': 137, 'East': 36}",
    },
    takeaway: "region_totals[region] = region_totals.get(region, 0) + amount builds the group sums.",
    question: {
      prompt: "What should the values in region_totals represent?",
      choices: [
        "How many customers sit in each region",
        "The list price of one product",
        "Campaign spend by channel",
        "The sum of line-item amount for each region",
      ],
      answer: 3,
      explanation: "This grouping adds amount from line_items. Customer counts and campaign spend answer different questions.",
    },
    drill: {
      kind: "fill",
      prompt: "Type the dictionary method that returns 0 the first time a region appears.",
      codeTemplate: "region_totals[region] = region_totals.____(region, 0) + row[\"amount\"]",
      answer: ["get"],
      hint: "The method is get.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Group line_items by region in pure Python. Store a dictionary named region_totals whose keys are West, East, and Central and whose values are the summed amount for that region. Include every status. West should come out to 452.",
      starter: "region_totals = {}\n",
      solutionCode: `region_totals = {}
for row in line_items:
    region = row["region"]
    region_totals[region] = region_totals.get(region, 0) + row["amount"]
`,
      validationCode: `assert region_totals["West"] == 452
assert region_totals["East"] == 1164
assert region_totals["Central"] == 267
assert sum(region_totals.values()) == 1883
`,
      hint: "Use dict.get(region, 0) so the first row in a region starts at 0. West totals 452.",
    },
    reflect: {
      prompt: "West has 4 customers and totals 452. East has 3 customers and totals more. Why can that happen?",
      choices: [
        "West has no line items",
        "The helper skips Enterprise customers",
        "East includes Priya Shah's two Northstar Annual lines at 499 each",
        "West amounts are stored as text and drop out of the sum",
      ],
      answer: 2,
      explanation: "Both 499 annual lines belong to Priya Shah in the East. East totals 1164, Central totals 267, and the three regions sum to 1883.",
    },
    closer: "Accumulate amount by region in a dictionary. West is 452 on this book of business.",
  },
  {
    id: "py-16",
    title: "Join orders to customers",
    minutes: 7,
    datasetId: "orders",
    idea: [
      "A join attaches customer fields to each order by matching customer_id.",
      "There are 12 orders and 9 customers, and every order's customer_id points at one customer.",
    ],
    example: {
      language: "python",
      code: `customers = [{"customer_id": 9, "name": "Hannah Berg", "region": "West"}]
orders = [{"order_id": 12, "customer_id": 9, "status": "pending"}]
customers_by_id = {row["customer_id"]: row for row in customers}
customer = customers_by_id[orders[0]["customer_id"]]
print(customer["name"])`,
      output: "Hannah Berg",
    },
    takeaway: "Index customers by customer_id, then look up each order.",
    question: {
      prompt: "A labeled list with one dictionary per order should contain how many rows?",
      choices: ["9, one per customer", "16, one per line item", "4, one per region", "12, one per order"],
      answer: 3,
      explanation: "The join keeps the order grain. len(orders) is 12, so labeled has 12 rows.",
    },
    drill: {
      kind: "order",
      prompt: "Order the steps that put a customer name on every order.",
      items: [
        "Index customers by customer_id",
        "Loop over each order",
        "Look up that order's customer_id",
        "Append a row that includes the customer name",
      ],
      answer: [
        "Index customers by customer_id",
        "Loop over each order",
        "Look up that order's customer_id",
        "Append a row that includes the customer name",
      ],
      explanation: "Build the lookup once, then walk the 12 orders and copy the matching name.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Join orders to customers on customer_id. Build a list named labeled with one dictionary per order, in the same order as orders, so len(labeled) equals len(orders), which is 12. Each dictionary needs order_id, customer_id, name, region, and status. The first order belongs to Maya Chen, and the last belongs to Hannah Berg.",
      starter: `customers_by_id = {row["customer_id"]: row for row in customers}
labeled = []
`,
      solutionCode: `customers_by_id = {row["customer_id"]: row for row in customers}
labeled = []
for order in orders:
    customer = customers_by_id[order["customer_id"]]
    labeled.append({
        "order_id": order["order_id"],
        "customer_id": order["customer_id"],
        "name": customer["name"],
        "region": customer["region"],
        "status": order["status"],
    })
`,
      validationCode: `assert len(labeled) == len(orders) == 12
assert [row["order_id"] for row in labeled] == [order["order_id"] for order in orders]
assert [row["name"] for row in labeled] == [
    {row["customer_id"]: row["name"] for row in customers}[order["customer_id"]]
    for order in orders
]
assert labeled[0]["name"] == "Maya Chen"
assert labeled[-1]["name"] == "Hannah Berg"
`,
      hint: "Look up customers_by_id[order[\"customer_id\"]] and append a dictionary with name and region from that customer.",
    },
    reflect: {
      prompt: "Order 12 has customer_id 9. Which name belongs on that labeled row?",
      choices: ["Maya Chen", "Priya Shah", "Hannah Berg", "The text \"9\""],
      answer: 2,
      explanation: "customer_id 9 is Hannah Berg. The lookup copies her name onto the July order.",
    },
    closer: "Match on customer_id and keep one labeled row for each of the 12 orders.",
  },
  {
    id: "py-17",
    title: "Order months",
    minutes: 5,
    datasetId: "orders",
    idea: [
      "order_date is text in YYYY-MM-DD form, so the first seven characters are the year and month.",
      "A set keeps each month once, and the 12 orders fall in the seven months from January through July 2025.",
    ],
    example: {
      language: "python",
      code: `order_date = "2025-03-19"
print(order_date[:7])`,
      output: "2025-03",
    },
    takeaway: "Slice order_date[:7] and collect the slices in a set.",
    question: {
      prompt: "What is \"2025-03-19\"[:7]?",
      choices: ["2025-03", "2025", "03-19", "2025-03-19"],
      answer: 0,
      explanation: "The slice starts at index 0 and stops before index 7, which keeps 2025-03.",
    },
    drill: {
      kind: "tokens",
      prompt: "Slice each order_date down to the year and month.",
      template: ["months", "=", "{row[", "\"order_date\"", "]", "", "for row in orders}"],
      bank: ["[:7]", "[:4]", "[7:]", ".month"],
      answer: ["[:7]"],
      hint: "Seven characters cover YYYY-MM.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Build a set named months of the year-month strings from orders. Slice each order_date with [:7]. The orders run from January through July 2025, so the set should contain 7 months.",
      starter: "months = set()\n",
      solutionCode: "months = {row[\"order_date\"][:7] for row in orders}\n",
      validationCode: `assert len(months) == 7
assert months == {row["order_date"][:7] for row in orders}
assert "2025-01" in months
assert "2025-07" in months
`,
      hint: "months = {row[\"order_date\"][:7] for row in orders}.",
    },
    reflect: {
      prompt: "There are 12 orders and len(months) is 7. Why is the set shorter than the order list?",
      choices: [
        "Several orders share a month, and a set keeps each month once",
        "Six orders have a blank order_date",
        "The slice drops July",
        "A set cannot hold strings",
      ],
      answer: 0,
      explanation: "January, February, March, April, and June each contain two orders. May and July contain one. The set has those 7 distinct months.",
    },
    closer: "Slice the date text to YYYY-MM and use a set when you want each month once.",
  },
];

export const capstoneLessons: Blueprint[] = [
  {
    id: "py-18",
    title: "Outliers",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "The maximum is the extreme value in a column, and here it is a real Northstar Annual price rather than a broken row.",
      "Sixteen line items sum to 1883, so one 499 line moves the average well above a typical gear amount.",
    ],
    example: {
      language: "python",
      code: `amounts = [24, 48, 89, 499]
print(max(amounts))
print(sum(amounts) / len(amounts))`,
      output: "499\n165.0",
    },
    takeaway: "Read the max of amount before you treat the average as a typical order line.",
    question: {
      prompt: "Why check the maximum line-item amount before quoting an average of the 16 amounts?",
      choices: [
        "max() deletes the extreme row",
        "Python cannot average integers",
        "A large annual plan can pull the average above a typical gear line",
        "Every outlier is a data error and must be dropped",
      ],
      answer: 2,
      explanation: "Northstar Annual is a real 499 price. It belongs in the report, and it still pulls the average of the 16 amounts above the gear lines.",
    },
    drill: {
      kind: "bug",
      prompt: "This should find the largest amount. Select the broken line and the fix.",
      lines: [
        "amounts = column(line_items, \"amount\")",
        "peak = max(line_items)",
        "print(peak)",
      ],
      buggyLine: 1,
      fixChoices: [
        "peak = max(amounts)",
        "peak = len(line_items)",
        "peak = sum(amounts)",
        "peak = column(line_items, \"status\")",
      ],
      fixAnswer: 0,
      explanation: "max needs the numeric amount list. A list of dictionaries does not have one ordering.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Use column() to read line_items amount, then store the maximum in a variable named peak. The extreme amount is the Northstar Annual line.",
      starter: "amounts = column(line_items, \"amount\")\npeak = 0\n",
      solutionCode: `amounts = column(line_items, "amount")
peak = max(amounts)
`,
      validationCode: `assert peak == 499
assert peak == max(column(line_items, "amount"))
`,
      hint: "peak = max(column(line_items, \"amount\")).",
    },
    reflect: {
      prompt: "peak is the maximum amount. Which catalog price is that maximum?",
      choices: [
        "Trail Bottle at 24",
        "Summit Pack at 89",
        "Northstar Annual at 499",
        "Northstar Monthly at 49",
      ],
      answer: 2,
      explanation: "The largest amount is 499, the Northstar Annual list price. Two line items reach it, both for Priya Shah.",
    },
    closer: "Report the max beside the sum. The peak amount on this table is 499.",
  },
  {
    id: "py-19",
    title: "Customer retention Python capstone",
    minutes: 8,
    capstone: true,
    datasetId: "subscriptions",
    idea: [
      "Retained MRR is the sum of mrr on subscriptions whose status is active.",
      "Paused and canceled plans remain in the table, and they stay outside the MRR you still collect.",
    ],
    example: {
      language: "python",
      code: `def keep(rows, name, value):
    return [row for row in rows if row[name] == value]

def total(rows, name):
    return sum((row[name] or 0) for row in rows)

sample = [
    {"status": "active", "mrr": 1200},
    {"status": "paused", "mrr": 400},
]
active = keep(sample, "status", "active")
print(total(active, "mrr"))`,
      output: "1200",
    },
    takeaway: "keep the active subscriptions, count those rows, and total their mrr.",
    question: {
      prompt: "Which subscriptions belong in the retained MRR total?",
      choices: [
        "Every row in subscriptions",
        "Rows whose status is active",
        "Active rows and paused rows",
        "Canceled rows, because they explain churn",
      ],
      answer: 1,
      explanation: "The retention total keeps status active. Paused and canceled plans stay in the table and out of that sum. The subscription status is spelled canceled.",
    },
    drill: {
      kind: "order",
      prompt: "Order the retention calculation.",
      items: [
        "Keep subscriptions whose status is active",
        "Count those active rows",
        "Sum the mrr on the kept rows",
        "Report the active count and the retained MRR",
      ],
      answer: [
        "Keep subscriptions whose status is active",
        "Count those active rows",
        "Sum the mrr on the kept rows",
        "Report the active count and the retained MRR",
      ],
      explanation: "Filter to active first so the count and the MRR describe the same rows.",
    },
    practice: {
      id: "practice",
      kind: "python_sandbox",
      prompt:
        "Customer retention: keep subscriptions whose status is exactly active, store that list in active, and store total(active, \"mrr\") in retained_mrr. Leave paused and canceled plans out. The status value on a canceled plan is canceled.",
      starter: "active = []\nretained_mrr = 0\n",
      solutionCode: `active = keep(subscriptions, "status", "active")
retained_mrr = total(active, "mrr")
`,
      validationCode: `assert total(active, "mrr") == 4300 and len(active) == 4
assert retained_mrr == 4300
assert sorted(row["customer_id"] for row in active) == [1, 2, 5, 9]
assert all(row["status"] == "active" for row in active)
`,
      hint: "active = keep(subscriptions, \"status\", \"active\"), then retained_mrr = total(active, \"mrr\"). Four active plans total 4300.",
    },
    reflect: {
      prompt: "Owen Brooks is paused at 400 MRR and Amina Diallo is canceled at 49 MRR. The active total is 4300. Where do Owen and Amina belong?",
      choices: [
        "Inside the 4300, because both plans have an mrr value",
        "Owen inside the total and Amina outside it",
        "Outside the active total",
        "In the campaigns table, added to the 2700 spend",
      ],
      answer: 2,
      explanation: "Paused and canceled are outside the active filter. The 4300 comes from Maya Chen, Luis Ortega, Priya Shah, and Hannah Berg.",
    },
    closer: "Four active subscriptions hold 4300 of MRR. That is the retained book.",
  },
];
