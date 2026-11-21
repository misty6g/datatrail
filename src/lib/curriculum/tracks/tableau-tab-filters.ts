import { mod } from "../expand";
import type { Module } from "../types";
import { tableauPractice } from "./tableau-shared";

export const tab_filters: Module =
mod(
  "tab-filters",
  "Filters, sets",
  "Filter Northstar orders with the order of operations in mind, rank products with top N, and keep Enterprise customers in a set.",
  [
    {
      title: "Order of operations",
      items: [
        "Context filters run before FIXED level-of-detail expressions",
        "Dimension filters, including status = shipped, run after FIXED",
        "Table calculations run after dimension filters",
        "Equality filters combine with AND",
      ],
    },
    {
      title: "Shipped revenue",
      items: [
        "status = shipped keeps 1648 of 1883",
        "Shipped by region is East 1115, West 355, Central 178",
        "A second equality such as region = West would AND with shipped",
      ],
    },
    {
      title: "Top N and sets",
      items: [
        "Top product by SUM(amount) is Northstar Annual at 998",
        "Inside Gear, Summit Pack leads at 356",
        "The Enterprise set is Maya Chen, Priya Shah, and Hannah Berg",
      ],
    },
  ],
  [
    {
      id: "tab-8",
      title: "Filter order of operations",
      minutes: 7,
      datasetId: "line_items",
      idea: [
        "Tableau computes a FIXED Northstar regional total before a dimension filter, so status shipped leaves the West FIXED value at 452.",
        "Equality filters combine with AND, and this practice applies the one filter the shelf supports, status shipped, which keeps 1648 of line revenue.",
      ],
      example: {
        language: "tableau",
        code: "{ FIXED [region] : SUM([amount]) }",
        output: "West stays 452 when status = shipped is only a dimension filter",
      },
      takeaway: "A Northstar dimension filter on status changes the bars after FIXED has already computed the regional total.",
      question: {
        prompt:
          "A Northstar sheet shows { FIXED [region] : SUM([amount]) } and you add a dimension filter for status = shipped. What happens to the FIXED West value?",
        choices: [
          "It falls from 452 to 355 because every filter runs first",
          "It stays 452 unless status is added to context",
          "It becomes the West quantity, 18",
          "It keeps only Maya Chen's rows",
        ],
        answer: 1,
        explanation:
          "FIXED runs before dimension filters. West shipped revenue is 355, but the FIXED result stays 452 until the shipped filter is a context filter.",
        hint: "Context filters are the ones that can reach a FIXED expression. An ordinary status filter cannot.",
        codeContext: "{ FIXED [region] : SUM([amount]) }",
      },
      drill: {
        kind: "order",
        prompt: "Order these Tableau operations from earliest to latest on a Northstar sheet.",
        items: [
          "Table calculations",
          "Context filters",
          "Dimension filters",
          "FIXED level-of-detail expressions",
        ],
        answer: [
          "Context filters",
          "FIXED level-of-detail expressions",
          "Dimension filters",
          "Table calculations",
        ],
        explanation:
          "Context filters run before FIXED, so a context filter on status changes the regional total. A dimension filter runs after FIXED, and table calculations run after that filter.",
      },
      practice: tableauPractice({
        id: "tab-8-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Show SUM(amount) by category for Northstar lines whose status is shipped.",
        datasetId: "line_items",
        starter: "",
        hint: "Put category on Columns and SUM(amount) on Rows. Filter status to shipped, keep the bar mark, and leave Color empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "category" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "bar",
          filters: [{ field: "status", value: "shipped" }],
        },
      }),
      reflect: {
        prompt: "This practice allows one equality filter, and you need shipped Northstar revenue by category. Which filter is it?",
        choices: [
          "status equals shipped",
          "region equals West",
          "channel equals partner",
          "segment equals SMB",
        ],
        answer: 0,
        explanation:
          "status = shipped keeps 1648 of line revenue. A second equality such as region = West would AND with it, and this shelf applies one filter.",
      },
      closer: "Add status to context when a shipped filter must change a FIXED regional total for Northstar.",
    },
    {
      id: "tab-9",
      title: "Top N products",
      minutes: 5,
      datasetId: "line_items",
      idea: [
        "A top N filter ranks Northstar products by SUM(amount), and the first product on the full extract is Northstar Annual at 998.",
        "The practice bars stay inside category Gear, where Summit Pack leads Trail Bottle and Field Notebook.",
      ],
      example: {
        language: "tableau",
        code: "Top 1 product by SUM([amount])",
        output: "Northstar Annual 998",
      },
      takeaway: "Rank Northstar products by SUM(amount) before you keep a top N, and use a Gear filter when the contest is only gear.",
      question: {
        prompt: "A top 1 filter on product by SUM(amount) keeps which Northstar product?",
        choices: ["Trail Bottle", "Summit Pack", "Field Notebook", "Northstar Annual"],
        answer: 3,
        explanation:
          "Northstar Annual totals 998, ahead of Summit Pack at 356, Trail Bottle at 240, and Field Notebook at 96.",
        hint: "Look at revenue, not unit count. The annual license is the largest amount.",
      },
      drill: {
        kind: "fill",
        prompt: "Name the filter that keeps the first N Northstar products by SUM(amount).",
        answer: ["top n", "Top N", "top N", "Top n"],
        hint: "It ranks product by the measure and keeps the head of the list, which starts with Northstar Annual.",
        codeTemplate: "product filter: ____ by SUM([amount])",
      },
      practice: tableauPractice({
        id: "tab-9-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Show SUM(amount) by product for Northstar lines in category Gear.",
        datasetId: "line_items",
        starter: "",
        hint: "Put product on Columns and SUM(amount) on Rows. Filter category to Gear and keep the bar mark.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "product" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "bar",
          filters: [{ field: "category", value: "Gear" }],
        },
      }),
      reflect: {
        prompt: "Inside Northstar category Gear, which product ranks first by SUM(amount)?",
        choices: ["Field Notebook", "Summit Pack", "Trail Bottle", "API Add-on"],
        answer: 1,
        explanation:
          "Gear contains Summit Pack at 356, Trail Bottle at 240, and Field Notebook at 96. API Add-on is Software, so the Gear filter removes it.",
      },
      closer: "Rank Northstar products by SUM(amount) before you keep a top N, and filter to Gear when the ranking should stay in that category.",
    },
    {
      id: "tab-10",
      title: "Sets of customers",
      minutes: 6,
      datasetId: "line_items",
      idea: [
        "An Enterprise set built from segment contains Maya Chen, Priya Shah, and Hannah Berg.",
        "Filtering line_items to that segment keeps their 1256 of revenue, including Priya Shah's two Northstar Annual lines.",
      ],
      example: {
        language: "tableau",
        code: "IF [segment] = \"Enterprise\" THEN \"In\" ELSE \"Out\" END",
        output: "In: Maya Chen, Priya Shah, Hannah Berg · their lines total 1256",
      },
      takeaway: "A set stores Enterprise membership so Maya Chen, Priya Shah, and Hannah Berg can be reused as one Northstar group.",
      question: {
        prompt: "Which Northstar customers belong in a set defined by segment = Enterprise?",
        choices: [
          "Maya Chen, Priya Shah, and Hannah Berg",
          "Luis Ortega and Owen Brooks",
          "Amina Diallo, Jonah Park, Sofia Rossi, and Noah Kim",
          "Every customer whose region is West",
        ],
        answer: 0,
        explanation:
          "Those three customers are the Enterprise rows. Luis Ortega and Owen Brooks are Mid-Market, and the four-name list is SMB.",
        hint: "Read the segment column, not the region column. West includes more than Enterprise.",
      },
      drill: {
        kind: "tokens",
        prompt: "Build the membership test for a Northstar Enterprise set.",
        template: ["IF ", "", " THEN ", "", " ELSE ", "", " END"],
        bank: ["[segment] = \"Enterprise\"", "\"In\"", "\"Out\"", "[status] = \"shipped\""],
        answer: ["[segment] = \"Enterprise\"", "\"In\"", "\"Out\""],
        hint: "Test the segment column, then label the members In and everyone else Out.",
      },
      practice: tableauPractice({
        id: "tab-10-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Show SUM(amount) by customer for the Northstar Enterprise segment.",
        datasetId: "line_items",
        starter: "",
        hint: "Put customer on Columns and SUM(amount) on Rows. Filter segment to Enterprise and keep the bar mark.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "customer" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "bar",
          filters: [{ field: "segment", value: "Enterprise" }],
        },
      }),
      reflect: {
        prompt: "What does the Enterprise filter on this Northstar practice view measure?",
        choices: [
          "Only refunded lines",
          "Quantity of Field Notebooks",
          "SUM(amount) for Maya Chen, Priya Shah, and Hannah Berg, totaling 1256",
          "Partner-channel revenue of 146",
        ],
        answer: 2,
        explanation:
          "The Enterprise lines total 1256, including Priya Shah's two Northstar Annual purchases at 499 each.",
      },
      closer: "Keep Maya Chen, Priya Shah, and Hannah Berg together in a Northstar Enterprise set built from segment.",
    },
  ],
);
