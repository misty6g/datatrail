import type { Blueprint } from "../expand";

export const statsLessons: Blueprint[] = [
  {
    id: "r-16",
    title: "Mean and median",
    minutes: 6,
    datasetId: "products",
    idea: [
      "The six list prices, in catalog order, are Trail Bottle 24, Summit Pack 89, Field Notebook 12, Northstar Monthly 49, Northstar Annual 499, and API Add-on 19. mean() adds them and divides by 6: 692 / 6 = 115.333. One annual plan has a large vote.",
      "median() sorts first. The sorted prices are 12, 19, 24, 49, 89, 499. Six is even, so the median averages the 3rd and 4th values, 24 and 49, and lands on 36.5. The typical catalog price sits with the bottle, the notebook, the add-on, and the monthly plan. The mean sits much higher because of Northstar Annual.",
    ],
    example: {
      language: "r",
      code: `list_prices <- c(24, 89, 12, 49, 499, 19)
median(list_prices)`,
      output: "36.5",
    },
    takeaway: "The six list prices have mean 115.333 and median 36.5. The 499 annual plan moves the mean.",
    question: {
      prompt: "Sorted list prices are 12, 19, 24, 49, 89, 499. The median averages the two middle values. What is it?",
      codeContext: "c(24, 89, 12, 49, 499, 19)",
      choices: ["115.333, the mean", "36.5", "49, the fourth sorted price on its own", "24, the third sorted price on its own"],
      answer: 1,
      explanation: "Positions 3 and 4 are 24 and 49. Their average is 36.5. 115.333 is 692 divided by 6, the mean. Either middle price alone is not the median of an even-length vector.",
    },
    drill: {
      kind: "tokens",
      prompt: "Choose the summary that returns the middle list price.",
      template: ["", "(list_prices)"],
      bank: ["median", "mean", "cor", "sum"],
      answer: ["median"],
      hint: "Sort, then take the middle. That is not the arithmetic average.",
    },
    practice: {
      id: "r-16-practice",
      kind: "r_sandbox",
      prompt:
        "Assign list_prices to c(24, 89, 12, 49, 499, 19). Assign price_center to a two-value vector: the mean, then the median.",
      starter: `list_prices <- c(24, 89, 12, 49, 499, 19)
price_center <- mean(list_prices)`,
      solutionCode: `list_prices <- c(24, 89, 12, 49, 499, 19)
price_center <- c(mean(list_prices), median(list_prices))`,
      expectedExpr: "c(mean(c(24, 89, 12, 49, 499, 19)), median(c(24, 89, 12, 49, 499, 19)))",
      checkVariable: "price_center",
      hint: "Wrap mean(list_prices) and median(list_prices) in c(), mean first.",
    },
    reflect: {
      prompt: "Why is the mean 115.333 while the median is 36.5?",
      choices: [
        "The mean drops Northstar Annual before it divides",
        "The median is defined as the sum of the prices divided by 6",
        "There are 16 list prices, one for every line item",
        "Northstar Annual at 499 pulls the mean up, and the median stays between 24 and 49",
      ],
      answer: 3,
      explanation: "All six prices enter the mean, so 499 moves it to 115.333. The median uses the middle of the sorted list, halfway between the bottle at 24 and the monthly plan at 49.",
    },
    closer:
      "Quote 36.5 when someone asks what the catalog costs. Quote 115.333 when they ask how the prices average, and say the annual plan in the same sentence. Neither number is shipped revenue. That sum still lives on line_items$amount.",
  },
  {
    id: "r-17",
    title: "Correlation",
    minutes: 6,
    datasetId: "campaigns",
    idea: [
      "cor(x, y) measures how two equal-length numeric vectors move together. Campaigns, in table order, spent c(1200, 800, 500, 200) and signed up c(80, 40, 25, 30): Spring Search, Spring Social, Partner Webinar, and Summer Email. cor() of those two vectors is 0.887.",
      "Positive means higher spend in this set tends to arrive with more signups. It is not 1, because the points are not a perfect line. Summer Email produces 30 signups on 200 of spend, a higher yield than Spring Social's 40 signups on 800. A perfect positive line, such as c(1, 2, 3, 4) and c(2, 4, 6, 8), has correlation 1. The reversed vector c(4, 3, 2, 1) has correlation -1. This lesson stops at cor(). It does not fit a line with lm().",
    ],
    example: {
      language: "r",
      code: `spend <- c(1200, 800, 500, 200)
signups <- c(80, 40, 25, 30)
cor(spend, signups)`,
      output: "0.887",
    },
    takeaway: "cor() of campaign spend and signups is 0.887. They move together, and Summer Email keeps the line from being perfect.",
    question: {
      prompt: "cor(c(1200, 800, 500, 200), c(80, 40, 25, 30)) is 0.887. What does that say about these four campaigns?",
      choices: [
        "Higher spend in this set tends to arrive with more signups, and the relationship is not a perfect line",
        "The vectors are unrelated, because the value is below 1",
        "Signups fall as spend rises",
        "The correlation is exactly 1 after rounding",
      ],
      answer: 0,
      explanation: "0.887 is positive and short of 1. Unrelated would sit near 0. A falling relationship would be negative. Rounding 0.887 does not make it 1.",
    },
    drill: {
      kind: "fill",
      prompt: "Fill the function that measures how spend and signups move together.",
      codeTemplate: "association <- ____(spend, signups)",
      answer: ["cor"],
      hint: "Three letters, short for correlation.",
    },
    practice: {
      id: "r-17-practice",
      kind: "r_sandbox",
      prompt:
        "Assign spend to c(1200, 800, 500, 200) and signups to c(80, 40, 25, 30), in that campaign order. Assign association to cor(spend, signups).",
      starter: `spend <- c(1200, 800, 500, 200)
signups <- c(80, 40, 25, 30)
association <- sum(spend)`,
      solutionCode: `spend <- c(1200, 800, 500, 200)
signups <- c(80, 40, 25, 30)
association <- cor(spend, signups)`,
      expectedExpr: "cor(c(1200, 800, 500, 200), c(80, 40, 25, 30))",
      checkVariable: "association",
      hint: "cor() takes the two vectors. sum(spend) is 2700, which is a different question.",
    },
    reflect: {
      prompt: "Which pair has correlation exactly 1?",
      choices: [
        "c(1, 2, 3, 4) and c(4, 3, 2, 1)",
        "c(1200, 800, 500, 200) and c(80, 40, 25, 30)",
        "c(1, 2, 3, 4) and c(2, 4, 6, 8)",
        "c(1, 2, 3, 4) and c(1, 3, 2, 5)",
      ],
      answer: 2,
      explanation: "Doubling 1, 2, 3, 4 produces a perfect positive line, so cor() is 1. The reversed vector is -1. The campaign pair is 0.887. The irregular pair is neither.",
    },
    closer:
      "Spend and signups move together across these four campaigns, and email's yield is the reason the number is 0.887 rather than 1. That is association in one extract. It is not a reason to move the annual plan's price. The pricing read uses shipped amount by category.",
  },
  {
    id: "r-18",
    title: "Pricing experiment R capstone",
    minutes: 8,
    capstone: true,
    datasetId: "line_items",
    idea: [
      "The catalog what-if was a 20% cut on Gear list prices above 20. The decision number is different. It is shipped revenue by category on the lines already recorded. Refunded, pending, and cancelled amount stays out. filter(status == \"shipped\") before the grouped sum.",
      "group_by(category) |> summarise(revenue = sum(amount)) on those shipped lines is the whole capstone. You already know the shape from the channel summary. The group column changes to category. All-status category totals are a different frame, Gear 692 and Software 1191, and they are the wrong numerator for this experiment because they still contain the 235 that never shipped.",
    ],
    example: {
      language: "r",
      code: `line_items |>
  filter(status == "shipped") |>
  group_by(region) |>
  summarise(revenue = sum(amount))`,
      output: "region | revenue\nWest | 355\nEast | 1115\nCentral | 178",
    },
    takeaway: "Shipped revenue by category is the pricing read. Filter status == \"shipped\", then group and sum amount.",
    question: {
      prompt: "Which lines belong in the pricing experiment's category totals?",
      choices: [
        "Every line, including refunded and cancelled",
        "Lines whose status is shipped",
        "One row per product at list price, ignoring quantity",
        "The four campaign spend rows",
      ],
      answer: 1,
      explanation: "Recognized revenue in this extract is status shipped. The all-status sum is 1883. List price ignores quantity and repeats. Campaign spend is the marketing table, not line revenue.",
    },
    drill: {
      kind: "order",
      prompt: "Order the capstone pipeline for shipped revenue by category.",
      items: [
        "Start from line_items",
        "Keep rows whose status is shipped",
        "Group by category",
        "Summarise revenue as the sum of amount",
      ],
      answer: [
        "Start from line_items",
        "Keep rows whose status is shipped",
        "Group by category",
        "Summarise revenue as the sum of amount",
      ],
      explanation: "Filter first so the groups only add shipped amount. group_by(category) then summarise names one revenue per category.",
    },
    practice: {
      id: "r-18-practice",
      kind: "r_sandbox",
      prompt:
        "Assign category_revenue to shipped line_items only, grouped by category, with revenue = sum(amount). The starter still includes every status. Add the shipped filter.",
      starter: `category_revenue <- line_items |>
  group_by(category) |>
  summarise(revenue = sum(amount))`,
      solutionCode: `category_revenue <- line_items |> filter(status == "shipped") |> group_by(category) |> summarise(revenue = sum(amount))`,
      expectedExpr: `line_items |> filter(status == "shipped") |> group_by(category) |> summarise(revenue = sum(amount))`,
      checkVariable: "category_revenue",
      hint: "Add filter(status == \"shipped\") before group_by(category).",
    },
    reflect: {
      prompt: "Shipped revenue is Software 1093 and Gear 555. What is a sound reading?",
      choices: [
        "Software brought in more shipped revenue here, largely from two Annual lines at 499, which does not mean the typical list price is high",
        "Gear won because it has more shipped lines",
        "The categories are tied at 1883",
        "Refunded lines should be added back in before the comparison",
      ],
      answer: 0,
      explanation: "Software's shipped total is higher. Gear has more shipped lines and less shipped revenue. 1883 is every status, not a tie. Putting refunds back in would answer a different question than recognized revenue.",
    },
    closer:
      "Software shipped 1093 and Gear shipped 555, together the 1648 you saw by channel. Two Northstar Annual lines at 499 do a lot of that Software work. The median list price is still 36.5. Report the category totals, and report the median beside them, so the annual plan cannot be mistaken for the typical price.",
  },
];
