import { mod } from "../expand";
import type { Module } from "../types";
import { tableauPractice } from "./tableau-shared";

export const tab_time: Module =
mod(
  "tab-time",
  "Time, hierarchy, dual axis",
  "Follow Northstar order_date down its hierarchy, compare web, retail, and partner with color, and read product revenue with a circle while you learn the scatter.",
  [
    {
      title: "order_date",
      items: [
        "Every line falls in 2025, from 2025-01-06 through 2025-07-07",
        "Drill the hierarchy from year to quarter, month, then day",
        "A continuous date plus a line shows movement, a discrete date shows one header per date",
      ],
    },
    {
      title: "Color versus dual axis",
      items: [
        "Color splits one measure by channel: web 1617, retail 120, partner 146",
        "A dual axis plots two measures, such as SUM(amount) and SUM(quantity), on a shared order_date",
        "Channel belongs on Color when the question is web versus retail versus partner",
      ],
    },
    {
      title: "Scatter grain",
      items: [
        "A scatter pairs SUM(quantity) with SUM(amount)",
        "Trail Bottle is 10 units and 240 revenue",
        "Northstar Annual is 2 units and 998 revenue",
        "The practice circle still needs product as the dimension pill",
      ],
    },
  ],
  [
    {
      id: "tab-5",
      title: "Dates and hierarchies",
      minutes: 6,
      datasetId: "line_items",
      idea: [
        "Every Northstar order_date falls in 2025, so the date hierarchy drills from that year into quarter and month.",
        "SUM(quantity) on a line across order_date shows unit volume through the year, including Priya Shah's Northstar Annual units in March and June.",
      ],
      example: {
        language: "tableau",
        code: "DATETRUNC('month', [order_date])",
        output: "All 16 lines sit in 2025, from 2025-01-06 to 2025-07-07",
      },
      takeaway: "Drill Northstar order_date from the year 2025 down to month before you describe a change in quantity.",
      question: {
        prompt: "You drill Northstar order_date from year to month. What do the headers become?",
        choices: [
          "One header per customer",
          "One header per product category",
          "Month headers inside 2025, such as January and March",
          "A continuous measure of unit_price",
        ],
        answer: 2,
        explanation:
          "The hierarchy keeps the same SUM and only changes the date grain, so January holds the 2025-01-06 and 2025-01-14 lines.",
        hint: "Drilling a date changes the grain of order_date, not the dimension you grouped by.",
      },
      drill: {
        kind: "tokens",
        prompt: "Truncate Northstar order_date to the month grain.",
        template: ["DATETRUNC(", "", ", ", "", ")"],
        bank: ["'month'", "[order_date]", "[amount]", "'customer'"],
        answer: ["'month'", "[order_date]"],
        hint: "The first argument is the date part, and the second is the order_date field.",
      },
      practice: tableauPractice({
        id: "tab-5-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Draw a line of SUM(quantity) across order_date so Northstar unit volume can be read across 2025.",
        datasetId: "line_items",
        starter: "",
        hint: "Put order_date on Columns and quantity on Rows as SUM. Set the mark to line and leave Color empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "order_date" }],
          rows: [{ field: "quantity", agg: "SUM" }],
          color: null,
          mark: "line",
          filters: [],
        },
      }),
      reflect: {
        prompt: "Which date setup gives a separate header for each Northstar order_date instead of one continuous axis?",
        choices: [
          "order_date as a discrete date part",
          "SUM(amount) moved to Color",
          "channel converted into a measure",
          "region set to a continuous axis",
        ],
        answer: 0,
        explanation:
          "A discrete order_date creates one header per date, such as 2025-01-06 beside 2025-01-14, rather than a single connected axis.",
      },
      closer: "Drill Northstar order_date from 2025 into months before you read a movement in quantity.",
    },
    {
      id: "tab-6",
      title: "Compare channels with color",
      minutes: 6,
      datasetId: "line_items",
      idea: [
        "Channel on Color splits each Northstar category bar into web, retail, and partner, which compares 1617 of web revenue with 120 of retail and 146 of partner.",
        "A dual axis is a different comparison: it draws SUM(amount) and SUM(quantity) together across order_date.",
      ],
      example: {
        language: "tableau",
        code: "Columns: category\nRows: SUM([amount])\nColor: channel\nMark: bar",
        output: "web 1617 · retail 120 · partner 146",
      },
      takeaway: "Put channel on Color to compare web, retail, and partner inside a Northstar category bar.",
      question: {
        prompt: "How do you compare web, retail, and partner inside each Northstar category?",
        choices: [
          "Put channel on Rows as SUM(channel)",
          "Put category on Columns, SUM(amount) on Rows, and channel on Color",
          "Put SUM(amount) and SUM(quantity) on a dual axis",
          "Replace amount with the customer dimension",
        ],
        answer: 1,
        explanation:
          "Color slices each category bar by channel. A dual axis is for two measures over order_date, not for splitting one revenue measure into web, retail, and partner.",
        hint: "Channel is a dimension. Color can encode it while the bar length stays SUM(amount).",
      },
      drill: {
        kind: "bug",
        prompt: "The view should split Northstar Gear and Software revenue by channel. Find the shelf that is wrong.",
        lines: ["Columns: category", "Rows: SUM(amount)", "Color: SUM(amount)", "Mark: bar"],
        buggyLine: 2,
        fixChoices: ["Color: channel", "Color: order_date", "Color: SUM(quantity)", "Remove category from Columns"],
        fixAnswer: 0,
        explanation:
          "Channel carries web, retail, and partner. SUM(amount) is already the bar length, so Color should be the channel dimension.",
      },
      practice: tableauPractice({
        id: "tab-6-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Build a bar of SUM(amount) by category and put channel on Color to compare web, retail, and partner.",
        datasetId: "line_items",
        starter: "",
        hint: "Columns are category, Rows are SUM(amount), Color is channel, and the mark is bar. Leave filters empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "category" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: { field: "channel" },
          mark: "bar",
          filters: [],
        },
      }),
      reflect: {
        prompt: "When is a dual axis the right Northstar comparison?",
        choices: [
          "When you only need to rename the sheet",
          "When you want web versus retail as colors of one measure",
          "When you filter to a single customer",
          "When SUM(amount) and SUM(quantity) should share an order_date axis",
        ],
        answer: 3,
        explanation:
          "Dual axis keeps revenue and units aligned on order_date. Comparing web, retail, and partner on one measure belongs on Color.",
      },
      closer: "Color by channel to compare web, retail, and partner, and use a dual axis when Northstar amount and quantity share order_date.",
    },
    {
      id: "tab-7",
      title: "Scatter quantity against amount",
      minutes: 7,
      datasetId: "line_items",
      idea: [
        "A scatter of Northstar products places SUM(quantity) beside SUM(amount), so Trail Bottle at 10 units and 240 sits apart from Northstar Annual at 2 units and 998.",
        "This practice still needs a dimension pill, so the circle view groups SUM(amount) by product while the quiz checks the two-measure scatter.",
      ],
      example: {
        language: "tableau",
        code: "Columns: SUM([quantity])\nRows: SUM([amount])\nDetail: product\nMark: circle",
        output: "Trail Bottle 10 units, 240 · Northstar Annual 2 units, 998",
      },
      takeaway: "A Northstar scatter pairs SUM(quantity) with SUM(amount) and keeps one mark per product.",
      question: {
        prompt: "Which shelf pair is a scatter of Northstar quantity against revenue, with one mark per product?",
        choices: [
          "SUM(quantity) and SUM(amount), with product identifying the mark",
          "region and segment, with no measures",
          "status on Columns and channel on Rows",
          "customer on Rows and order_date on Color",
        ],
        answer: 0,
        explanation:
          "Trail Bottle then sits at 10 units and 240 revenue, while Northstar Annual sits at 2 units and 998 revenue.",
        hint: "A scatter needs two measures. Product tells you which mark is which.",
        codeContext: "Columns: SUM([quantity])\nRows: SUM([amount])\nDetail: product",
      },
      drill: {
        kind: "order",
        prompt: "Order the shelves for a scatter of Northstar quantity against revenue, one mark per product.",
        items: [
          "Set the mark to circle",
          "Put product on Detail",
          "Put SUM(amount) on Rows",
          "Put SUM(quantity) on Columns",
        ],
        answer: [
          "Put product on Detail",
          "Put SUM(quantity) on Columns",
          "Put SUM(amount) on Rows",
          "Set the mark to circle",
        ],
        explanation:
          "Product identifies the mark, SUM(quantity) and SUM(amount) become the axes, and the circle mark separates Trail Bottle from Northstar Annual.",
      },
      practice: tableauPractice({
        id: "tab-7-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Use the circle mark to show SUM(amount) for each Northstar product.",
        datasetId: "line_items",
        starter: "",
        hint: "Put product on Columns and amount on Rows as SUM. Set the mark to circle and leave Color empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "product" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "circle",
          filters: [],
        },
      }),
      reflect: {
        prompt: "Why does this Northstar sandbox draw a circle of SUM(amount) by product?",
        choices: [
          "Because amount is a dimension on line_items",
          "Because the circle mark deletes quantity",
          "Because the chart needs a dimension pill, and product supplies the grouping a circle can show",
          "Because a scatter cannot include Northstar Annual",
        ],
        answer: 2,
        explanation:
          "Product is the pill without an aggregation. SUM(amount) is the measure, and the circle draws one mark per product, such as Summit Pack at 356.",
      },
      closer: "Draw each Northstar product's revenue with a circle, and remember a full scatter pairs SUM(quantity) with SUM(amount).",
    },
  ],
);
