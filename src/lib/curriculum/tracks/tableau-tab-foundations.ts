import { mod } from "../expand";
import type { Module } from "../types";
import { tableauPractice } from "./tableau-shared";

export const tab_foundations: Module =
mod(
  "tab-foundations",
  "Visual grammar",
  "Read Northstar line_items as dimensions and measures, choose a mark that matches the question, and build a shipped-revenue bar in order.",
  [
    {
      title: "Dimensions on line_items",
      items: [
        "region, segment, category, status, channel, product, customer, and order_date group rows",
        "Region values are West, East, and Central",
        "Segment values are Enterprise, Mid-Market, and SMB",
        "Status values are shipped, refunded, pending, and cancelled",
      ],
    },
    {
      title: "Measures",
      items: [
        "amount, quantity, and unit_price aggregate",
        "amount on each line is quantity times unit_price",
        "SUM(amount) across the extract is 1883",
        "SUM(quantity) across the extract is 31",
      ],
    },
    {
      title: "Marks and build order",
      items: [
        "Bar compares categories such as Gear and Software",
        "Line follows order_date",
        "Connect line_items, place Columns, place Rows, set the mark, then filter",
      ],
    },
  ],
  [
    {
      id: "tab-1",
      title: "Dimensions vs measures",
      minutes: 5,
      datasetId: "line_items",
      idea: [
        "Region, segment, category, status, channel, product, customer, and order_date group Northstar line_items into the slices a view can compare.",
        "Amount, quantity, and unit_price are measures, and SUM(amount) by region totals 452 in the West, 1164 in the East, and 267 in Central.",
      ],
      example: {
        language: "tableau",
        code: "SUM([amount])",
        output: "East 1164 · West 452 · Central 267",
      },
      takeaway: "Group Northstar line_items with a dimension, then total amount with SUM.",
      question: {
        prompt: "Which field on Northstar line_items is a dimension?",
        choices: ["amount", "quantity", "region", "unit_price"],
        answer: 2,
        explanation:
          "Region labels West, East, and Central customers, while amount, quantity, and unit_price are the measures you aggregate.",
        hint: "A dimension is a label you group by, such as the customer's region.",
      },
      drill: {
        kind: "tokens",
        prompt: "Assemble the measure that totals Northstar line revenue.",
        template: ["", "(", "", ")"],
        bank: ["SUM", "[amount]", "[region]", "AVG"],
        answer: ["SUM", "[amount]"],
        hint: "Amount is the revenue field. Sum it, and leave region off the measure.",
      },
      practice: tableauPractice({
        id: "tab-1-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Build a bar of SUM(amount) by region for every Northstar line item.",
        datasetId: "line_items",
        starter: "",
        hint: "Put region on Columns and amount on Rows so the aggregation stays SUM. Leave Color empty and keep the bar mark.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "region" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "bar",
          filters: [],
        },
      }),
      reflect: {
        prompt: "You want Northstar revenue by customer segment. Which shelf layout answers it?",
        choices: [
          "segment on Columns and SUM(amount) on Rows",
          "amount on Columns with no aggregation and segment on Color",
          "unit_price on Rows as a dimension and region beside it",
          "status on Rows and channel on Color, with no measure",
        ],
        answer: 0,
        explanation:
          "Segment splits Enterprise, Mid-Market, and SMB, and SUM(amount) totals the line revenue inside each segment.",
      },
      closer: "Group Northstar customers with region and total their line items with SUM(amount).",
    },
    {
      id: "tab-2",
      title: "Picking a chart",
      minutes: 5,
      datasetId: "line_items",
      idea: [
        "Gear contributes 22 units and Software contributes 9 units on Northstar line_items, which is a comparison between categories.",
        "A bar mark compares those category totals, and a line mark is the chart for order_date.",
      ],
      example: {
        language: "tableau",
        code: "Columns: category\nRows: SUM([quantity])\nMark: bar",
        output: "Gear 22 · Software 9",
      },
      takeaway: "Use a bar when the Northstar question compares categories such as Gear and Software.",
      question: {
        prompt: "Which mark compares Northstar quantity for Gear, 22 units, with Software, 9 units?",
        choices: [
          "A line of order_date",
          "A bar with category on Columns and SUM(quantity) on Rows",
          "A text list of customer names with no measure",
          "A circle with no dimension and no measure",
        ],
        answer: 1,
        explanation:
          "Category is a discrete comparison, and the bar length is SUM(quantity), which is 22 for Gear and 9 for Software.",
        hint: "You are comparing two catalog categories, not a sequence of dates.",
      },
      drill: {
        kind: "bug",
        prompt: "This shelf setup should compare Gear quantity with Software quantity. Select the broken line and the fix.",
        lines: ["Columns: category", "Rows: SUM(quantity)", "Mark: line", "Filters: none"],
        buggyLine: 2,
        fixChoices: [
          "Mark: bar",
          "Mark: text",
          "Replace category with order_date and keep the line",
          "Put quantity on Filters",
        ],
        fixAnswer: 0,
        explanation:
          "Category compares Gear with Software, so the mark is a bar. A line is the mark for a continuous Northstar order_date axis.",
      },
      practice: tableauPractice({
        id: "tab-2-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Build a bar of SUM(quantity) by category so Gear and Software can be compared.",
        datasetId: "line_items",
        starter: "",
        hint: "Put category on Columns and quantity on Rows. Keep SUM and the bar mark, and leave Color empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "category" }],
          rows: [{ field: "quantity", agg: "SUM" }],
          color: null,
          mark: "bar",
          filters: [],
        },
      }),
      reflect: {
        prompt: "A merchandiser asks how Northstar unit volume changed from January 2025 to July 2025. Which chart fits?",
        choices: [
          "A pie of segment",
          "A bar of status with no date",
          "Bubbles labeled only with customer names",
          "A line with order_date on Columns and SUM(quantity) on Rows",
        ],
        answer: 3,
        explanation:
          "order_date supplies the time order, and a line connects SUM(quantity) from the January lines through Hannah Berg's July order.",
      },
      closer: "Compare Gear and Software quantity with a bar, and save the line mark for Northstar order_date.",
    },
    {
      id: "tab-3",
      title: "Build a view in order",
      minutes: 6,
      datasetId: "line_items",
      idea: [
        "A shipped-revenue view starts by connecting Northstar line_items, then places region on Columns and SUM(amount) on Rows.",
        "The status filter comes after the shelves and keeps shipped rows, which leaves 1648 of the 1883 in line revenue.",
      ],
      example: {
        language: "tableau",
        code: "Columns: region\nRows: SUM([amount])\nFilter: status = shipped\nMark: bar",
        output: "East 1115 · West 355 · Central 178",
      },
      takeaway: "Connect line_items, place region and SUM(amount), then filter status to shipped.",
      question: {
        prompt: "Where does the status = shipped filter belong on the first Northstar region-revenue view?",
        choices: [
          "After region and SUM(amount) are on the shelves",
          "Before you connect line_items",
          "In place of the measure, so Rows stays empty",
          "On the Color shelf instead of a filter",
        ],
        answer: 0,
        explanation:
          "Connect the extract, place region and SUM(amount), then filter status to shipped so the bars total 1648 instead of 1883.",
        hint: "The data source has to be connected before a shelf or a filter can see line_items.",
      },
      drill: {
        kind: "order",
        prompt: "Order the steps for a bar of shipped Northstar revenue by region.",
        items: [
          "Filter status to shipped",
          "Connect data",
          "Put SUM(amount) on Rows",
          "Put region on Columns",
        ],
        answer: [
          "Connect data",
          "Put region on Columns",
          "Put SUM(amount) on Rows",
          "Filter status to shipped",
        ],
        explanation:
          "Connect line_items first, then region, then SUM(amount), and only then keep status = shipped so the bars total 1648.",
      },
      practice: tableauPractice({
        id: "tab-3-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Build a bar of SUM(amount) by region for Northstar line items whose status is shipped.",
        datasetId: "line_items",
        starter: "",
        hint: "Columns are region, Rows are SUM(amount), the mark is bar, and the filter is status equals shipped.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "region" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "bar",
          filters: [{ field: "status", value: "shipped" }],
        },
      }),
      reflect: {
        prompt: "After you filter Northstar status to shipped, which lines drop out of the region bars?",
        choices: [
          "Priya Shah's Northstar Annual lines, because they are web orders",
          "Owen Brooks's Field Notebook line, because it is retail",
          "Maya Chen's refunded Monthly line, Jonah Park's pending Summit Pack, Luis Ortega's cancelled Monthly line, and Hannah Berg's pending Trail Bottle",
          "Every Gear line, because shipped applies only to Software",
        ],
        answer: 2,
        explanation:
          "Those four lines are refunded, pending, or cancelled and total 235, which is why shipped revenue is 1648 rather than 1883.",
      },
      closer: "Connect Northstar line_items, lay region and SUM(amount) on the shelves, then filter status to shipped.",
    },
    {
      id: "tab-4",
      title: "Discrete vs continuous",
      minutes: 6,
      datasetId: "line_items",
      idea: [
        "Region, status, and segment are discrete headers on a Northstar view, so each value such as West or Enterprise gets its own column.",
        "SUM(amount) is continuous, and order_date draws a revenue line when it is used as a continuous axis from 2025-01-06 through 2025-07-07.",
      ],
      example: {
        language: "tableau",
        code: "Columns: order_date (continuous)\nRows: SUM([amount])\nMark: line",
        output: "A line from Maya Chen's 2025-01-06 order through Hannah Berg's 2025-07-07 order",
      },
      takeaway: "Discrete pills separate Northstar labels, and a continuous order_date axis connects revenue across 2025.",
      question: {
        prompt: "Which pill is continuous on a Northstar revenue view?",
        choices: ["region", "SUM(amount)", "status", "segment"],
        answer: 1,
        explanation:
          "SUM(amount) is a continuous measure, while region, status, and segment are discrete headers such as West, shipped, and Enterprise.",
        hint: "Continuous pills form an axis. Discrete pills form headers.",
      },
      drill: {
        kind: "fill",
        prompt: "Name the pill type that turns order_date into an axis for a Northstar revenue line.",
        answer: ["continuous", "green"],
        hint: "Discrete dates are separate headers. The axis that connects January to July is the other pill type.",
        codeTemplate: "order_date (____) + SUM([amount]) → line",
      },
      practice: tableauPractice({
        id: "tab-4-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Draw a line of SUM(amount) across order_date for every Northstar line item.",
        datasetId: "line_items",
        starter: "",
        hint: "Put order_date on Columns and amount on Rows as SUM. Change the mark to line and leave Color empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "order_date" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "line",
          filters: [],
        },
      }),
      reflect: {
        prompt: "You want a line of Northstar revenue across order_date. Which setup draws that line?",
        choices: [
          "Continuous order_date on Columns, SUM(amount) on Rows, mark set to line",
          "Discrete region on Columns, mark set to line, and no measure",
          "status on Columns and customer on Rows",
          "category on Color and no date pill",
        ],
        answer: 0,
        explanation:
          "A continuous date axis orders 2025-01-06 through 2025-07-07, SUM(amount) supplies the height, and the line mark connects those dates.",
      },
      closer:
        "Use a continuous order_date axis when the Northstar story is change across 2025, and discrete headers when the story is a category such as region.",
    },
  ],
);
