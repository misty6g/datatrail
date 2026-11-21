import { mod } from "../expand";
import type { Module } from "../types";
import { tableauPractice } from "./tableau-shared";

export const tab_calcs: Module =
mod(
  "tab-calcs",
  "Calculated fields and table calcs",
  "Write aggregated calculations on Northstar amount and quantity, then use table calculations for share of total and running revenue along order_date.",
  [
    {
      title: "Weighted price",
      items: [
        "SUM([amount]) / SUM([quantity]) is 1883 / 31, or 60.74",
        "[amount] / [quantity] equals unit_price on each line",
        "AVG([unit_price]) across 16 lines is 96.56 and ignores quantity",
      ],
    },
    {
      title: "Table calculations",
      items: [
        "SUM([amount]) / TOTAL(SUM([amount])) is a share of the view total",
        "East's share of unfiltered revenue uses 1164 / 1883",
        "A status filter changes the table-calc denominator to 1648",
        "RUNNING_SUM(SUM([amount])) accumulates along order_date",
        "LOOKUP(SUM([amount]), -1) reads the previous order_date",
      ],
    },
  ],
  [
    {
      id: "tab-11",
      title: "A calculated field",
      minutes: 6,
      datasetId: "line_items",
      idea: [
        "SUM([amount]) / SUM([quantity]) is the quantity-weighted price of Northstar lines, and on this extract it is 1883 divided by 31.",
        "The row-level expression [amount] / [quantity] equals unit_price on every line, so Trail Bottle stays 24 and Northstar Annual stays 499 before any weighting.",
      ],
      example: {
        language: "tableau",
        code: "SUM([amount]) / SUM([quantity])",
        output: "1883 / 31 = 60.74",
      },
      takeaway: "Divide summed Northstar amount by summed quantity when the question is the weighted price.",
      question: {
        prompt: "What does SUM([amount]) / SUM([quantity]) return on the full Northstar line_items extract?",
        choices: [
          "The unweighted average of the 16 unit prices, 96.56",
          "The quantity-weighted price, 1883 / 31 = 60.74",
          "The count of distinct customers",
          "West revenue only, 452",
        ],
        answer: 1,
        explanation:
          "Summing amount and quantity first weights each unit, so the ten Trail Bottle units pull harder than a single 499 price.",
        hint: "Both the numerator and the denominator are aggregates.",
        codeContext: "SUM([amount]) / SUM([quantity])",
      },
      drill: {
        kind: "tokens",
        prompt: "Assemble the weighted average price of Northstar line items.",
        template: ["", " / ", ""],
        bank: ["SUM([amount])", "SUM([quantity])", "SUM([unit_price])", "COUNTD([customer])"],
        answer: ["SUM([amount])", "SUM([quantity])"],
        hint: "Sum revenue, then divide by summed units. On this extract the result is 60.74.",
      },
      practice: tableauPractice({
        id: "tab-11-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Show a text table of SUM(amount) by category, the revenue side of the Northstar weighted price.",
        datasetId: "line_items",
        starter: "",
        hint: "Put category on Columns and SUM(amount) on Rows. Set the mark to text and leave Color empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "category" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "text",
          filters: [],
        },
      }),
      reflect: {
        prompt: "On a single Northstar line, what does [amount] / [quantity] equal?",
        choices: [
          "That line's unit_price, such as 24 on a Trail Bottle line",
          "The regional FIXED total",
          "SUM(amount) for the whole extract, 1883",
          "The customer's segment name",
        ],
        answer: 0,
        explanation:
          "amount is quantity times unit_price, so the row-level ratio collapses to unit_price before any aggregation.",
      },
      closer: "Write the Northstar average price as SUM([amount]) / SUM([quantity]) so each unit is weighted by quantity.",
    },
    {
      id: "tab-12",
      title: "Row-level versus aggregate",
      minutes: 7,
      datasetId: "line_items",
      idea: [
        "Summing the row-level ratio adds unit prices and treats one Annual license like one Trail Bottle.",
        "SUM([amount]) / SUM([quantity]) adds Northstar revenue and units first, so ten Trail Bottle units pull harder than two Annual licenses.",
      ],
      example: {
        language: "tableau",
        code: "SUM([amount]) / SUM([quantity])",
        output: "Weighted 60.74, versus an unweighted unit-price average of 96.56",
      },
      takeaway: "Aggregate Northstar amount and quantity separately before you divide them.",
      question: {
        prompt: "Which formula is the weighted average selling price across Northstar lines?",
        choices: [
          "SUM([amount] / [quantity])",
          "AVG([unit_price])",
          "SUM([amount]) / SUM([quantity])",
          "[region] / [segment]",
        ],
        answer: 2,
        explanation:
          "Divide total revenue by total units. AVG([unit_price]) is the unweighted 96.56 across 16 lines, and summing the row ratio adds prices instead of weighting them.",
        hint: "The SUM calls wrap each field, and the division happens after those sums.",
        codeContext: "SUM([amount]) / SUM([quantity])",
      },
      drill: {
        kind: "bug",
        prompt: "The author wanted the quantity-weighted Northstar price. Select the broken line and the fix.",
        lines: ["// Weighted average price across line_items", "[amount] / [quantity]"],
        buggyLine: 1,
        fixChoices: [
          "SUM([amount]) / SUM([quantity])",
          "SUM([amount] / [quantity])",
          "ATTR([region])",
          "[quantity] - [amount]",
        ],
        fixAnswer: 0,
        explanation:
          "The row-level ratio equals unit_price on each line. Sum amount and quantity before dividing so the result is 1883 / 31.",
      },
      practice: tableauPractice({
        id: "tab-12-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Build a bar of SUM(quantity) by segment so the unit weights behind the Northstar price ratio are visible.",
        datasetId: "line_items",
        starter: "",
        hint: "Put segment on Columns and quantity on Rows as SUM. Keep the bar mark and leave Color empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "segment" }],
          rows: [{ field: "quantity", agg: "SUM" }],
          color: null,
          mark: "bar",
          filters: [],
        },
      }),
      reflect: {
        prompt: "Why is SUM([amount] / [quantity]) a weak price for the Northstar catalog?",
        choices: [
          "It filters the view to shipped",
          "It adds one Trail Bottle price and one Northstar Annual price as if those lines represented the same number of units",
          "It returns the customer name",
          "It is a table calculation that runs after totals",
        ],
        answer: 1,
        explanation:
          "A line with quantity 5 at 12 and a line with quantity 1 at 499 do not represent the same number of units, so add amount and quantity before dividing.",
      },
      closer: "Aggregate Northstar amount and quantity before you divide when the question is the weighted price.",
    },
    {
      id: "tab-13",
      title: "Percent of total",
      minutes: 6,
      datasetId: "line_items",
      idea: [
        "A percent-of-total table calculation divides each Northstar SUM(amount) by TOTAL(SUM([amount])), so East's 1164 is that region's share of 1883.",
        "The window is the marks in the view, and a status filter changes the percent because table calculations run after dimension filters.",
      ],
      example: {
        language: "tableau",
        code: "SUM([amount]) / TOTAL(SUM([amount]))",
        output: "East 1164 / 1883",
      },
      takeaway: "Use TOTAL(SUM([amount])) when a Northstar mark should show its share of the view.",
      question: {
        prompt: "East contributes 1164 of 1883 Northstar line revenue. Which table calculation returns East's share?",
        choices: [
          "SUM([amount]) / TOTAL(SUM([amount]))",
          "{ FIXED [region] : SUM([amount]) }",
          "RUNNING_SUM(SUM([quantity]))",
          "COUNTD([customer])",
        ],
        answer: 0,
        explanation:
          "TOTAL(SUM([amount])) is the window total 1883, so the East mark becomes 1164 / 1883. The FIXED expression returns 1164 itself, not the share.",
        hint: "The denominator has to see every mark in the window, which is what TOTAL does.",
        codeContext: "SUM([amount]) / TOTAL(SUM([amount]))",
      },
      drill: {
        kind: "fill",
        prompt: "Fill the table-calculation function that turns East's 1164 into a share of Northstar line revenue.",
        answer: ["TOTAL"],
        hint: "Type the function name only. It sums the expression over the whole window, and the denominator is 1883 before any status filter.",
        codeTemplate: "SUM([amount]) / ____(SUM([amount]))",
      },
      practice: tableauPractice({
        id: "tab-13-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Build a bar of SUM(amount) by region with segment on Color, the Northstar view a percent-of-total table calc would run over.",
        datasetId: "line_items",
        starter: "",
        hint: "Columns are region, Rows are SUM(amount), Color is segment, and the mark is bar. Leave filters empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "region" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: { field: "segment" },
          mark: "bar",
          filters: [],
        },
      }),
      reflect: {
        prompt: "You filter Northstar status to shipped before the percent-of-total table calc. What is the new denominator?",
        choices: [
          "1883, because table calcs ignore filters",
          "452, the unfiltered West total",
          "The count of customers, 9",
          "1648, because the table calc sees only the rows that remain after the dimension filter",
        ],
        answer: 3,
        explanation:
          "Table calculations run after dimension filters, so shipped revenue 1648 replaces 1883 as the total.",
      },
      closer: "Divide by TOTAL(SUM([amount])) when the question is a region's share of Northstar line revenue.",
    },
    {
      id: "tab-14",
      title: "Running totals along dates",
      minutes: 7,
      datasetId: "line_items",
      idea: [
        "RUNNING_SUM(SUM([amount])) along order_date accumulates Northstar revenue from the 2025-01-06 lines through 2025-07-07.",
        "LOOKUP(SUM([amount]), -1) reads the prior date in that same order, so 2025-01-14 looks back to the 137 booked on 2025-01-06.",
      ],
      example: {
        language: "tableau",
        code: "RUNNING_SUM(SUM([amount]))",
        output: "2025-01-06 is 137, and 2025-01-14 brings the running total to 173",
      },
      takeaway: "Address RUNNING_SUM and LOOKUP by order_date when the Northstar question is cumulative or prior-day revenue.",
      question: {
        prompt: "What does RUNNING_SUM(SUM([amount])) compute when it is addressed by Northstar order_date?",
        choices: [
          "The distinct count of products",
          "Only the last order's amount",
          "A cumulative total of revenue from the earliest order_date through the current one",
          "The FIXED regional total",
        ],
        answer: 2,
        explanation:
          "Each date adds its SUM(amount) to the dates before it, starting with the 137 from Maya Chen's 2025-01-06 lines.",
        hint: "A running sum keeps every earlier mark. It does not restart at the region grain.",
        codeContext: "RUNNING_SUM(SUM([amount]))",
      },
      drill: {
        kind: "tokens",
        prompt: "Accumulate Northstar revenue along order_date.",
        template: ["", "(SUM([amount]))"],
        bank: ["RUNNING_SUM", "LOOKUP", "FIXED", "WINDOW_AVG"],
        answer: ["RUNNING_SUM"],
        hint: "This table calculation adds each date's SUM(amount) onto the dates before it.",
      },
      practice: tableauPractice({
        id: "tab-14-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Draw SUM(amount) across order_date as a line, split by channel, which is the base view for a Northstar running total.",
        datasetId: "line_items",
        starter: "",
        hint: "Put order_date on Columns, SUM(amount) on Rows, and channel on Color. Set the mark to line.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "order_date" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: { field: "channel" },
          mark: "line",
          filters: [],
        },
      }),
      reflect: {
        prompt: "LOOKUP(SUM([amount]), -1) along Northstar order_date returns which value for a date?",
        choices: [
          "The next date's revenue",
          "The previous order_date's SUM(amount) in the view",
          "The customer's segment",
          "SUM(quantity) for Gear",
        ],
        answer: 1,
        explanation:
          "Offset -1 reads one mark backward along order_date, so 2025-01-14 looks back to the 137 from 2025-01-06.",
      },
      closer: "Run RUNNING_SUM along order_date to turn each day's Northstar SUM(amount) into a cumulative total.",
    },
  ],
);
