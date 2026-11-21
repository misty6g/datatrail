import { type Blueprint } from "../expand";
import { biPractice, daxSpec } from "./powerbi-shared";

export const capstoneLessons: Blueprint[] = [
  {
    id: "pbi-15",
    title: "Conditional visuals",
    minutes: 5,
    datasetId: "line_items",
    idea: [
      "Conditional formatting is a visual rule on top of a measure. A bar of sales by region can change color when amount clears a threshold. East is 1,164, West is 452, and Central, Jonah Park and Sofia Rossi, is 267. A goal of 1,000 highlights East only. The color reads the same SUM you already trust.",
      "Do not encode the rule by filtering the other regions out of the model. An executive page that hides Central is a different claim from a page that shows Central in a quieter color. Use SUM(FactSales[amount]) as the value and attach the color rule on the visual. If the rule will be reused, such as a behind-plan flag, write that flag as a measure and format by it.",
    ],
    takeaway: "Conditional formatting changes how a number looks. It should not change which rows the measure sees.",
    question: {
      prompt: "East amount is 1,164 and the goal is 1,000. How do you flag East on a bar chart that still shows every region?",
      choices: [
        "Add a CALCULATE that keeps only East, so West and Central disappear",
        "Color the bar when the SUM measure is at least 1,000",
        "Replace amount with customer_id",
        "Unpivot region into three measures and delete the chart",
      ],
      answer: 1,
      explanation:
        "The chart still shows West, East, and Central. The rule only changes color. A CALCULATE that filters to East would remove the regions that missed the goal.",
    },
    drill: {
      kind: "tokens",
      prompt: "Choose what the bar's color rule should read.",
      template: ["Color", "the", "bar", "from", "", "of", "FactSales[amount]", "against", "the", "goal"],
      bank: ["SUM", "ALL", "Unpivot", "Append"],
      answer: ["SUM"],
      hint: "The color rule reads the same total the bar already uses.",
    },
    practice: biPractice(
      "pbi-15-practice",
      'The conditional format needs a value measure. Write SUM(FactSales[amount]).',
      "SUM the amount column on FactSales. The visual applies the color rule to this result.",
      daxSpec("SUM(FactSales[amount])"),
    ),
    reflect: {
      prompt: "Central is 267, under the 1,000 goal. What should the executive still see?",
      choices: [
        "No Central bar, because conditional formatting deletes categories that miss the goal",
        "Central moved onto DimDate",
        "Central's bar, in the below-goal color",
        "Central's amount replaced by nulls in Power Query",
      ],
      answer: 2,
      explanation:
        "The format is conditional. The row stays. Hiding a region that missed the goal is a filter, and it would overstate how complete the picture is.",
    },
    closer:
      "Pick one revenue measure and let every Northstar visual, including the color rule, read it. A second copy of the formula pasted into a title will drift.",
  },
  {
    id: "pbi-16",
    title: "Row-level security",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "Row-level security filters the model by the person who opens the report. A Northstar East sales lead should see East rows only: Luis Ortega, Priya Shah, and Noah Kim. You define a role whose filter is region = East, and you assign people to that role in the service. SUM(FactSales[amount]) under that role totals 1,164, because the role is another filter context. The lead cannot clear it the way they can clear a slicer.",
      "RLS is not a second copy of the dataset. Test with View as role before you publish. Dynamic security uses a table of user principals, USERPRINCIPALNAME(), and a relationship to the dimension that person may see. The practice measure hard-codes the East total so you can check the number the role should produce. The role itself belongs on the model, so every measure on the page inherits it.",
    ],
    example: {
      language: "dax",
      code: 'East Sales = CALCULATE(SUM(FactSales[amount]), FactSales[region] = "East")',
      output: "1164, the total an East role should see.",
    },
    takeaway: "A security role filters rows the viewer cannot put back. The East role limits the model to 1,164.",
    question: {
      prompt: "Where should the East-lead restriction live?",
      choices: [
        "In a visual-level filter the lead can clear",
        "In a copied report file for each employee",
        "In the color theme",
        "In a security role that filters region to East",
      ],
      answer: 3,
      explanation:
        "A role filter is enforced for everyone assigned to it. A visual filter is interface, not security. Copies of the file drift apart, and a theme does not hide rows.",
    },
    drill: {
      kind: "fill",
      prompt: "Name the security feature that filters rows by the viewer's role. The short name or the full name both count.",
      answer: ["RLS", "row level security", "row-level security"],
      hint: "Three letters, or the words row-level security.",
      codeTemplate: "Enforce the East region with ____",
    },
    practice: biPractice(
      "pbi-16-practice",
      'Write the East total a regional role would see: CALCULATE(SUM(FactSales[amount]), FactSales[region] = "East").',
      "CALCULATE the sum of amount where region is East. East's line items total 1,164.",
      daxSpec('CALCULATE(SUM(FactSales[amount]), FactSales[region] = "East")'),
    ),
    reflect: {
      prompt: "You assign the East role and then view the report as that role. What does an unfiltered SUM of amount return?",
      choices: [
        "1,883, because measures ignore roles",
        "1,164, because the role already filtered the model to East",
        "452, the West total",
        "0, because roles delete measures",
      ],
      answer: 1,
      explanation:
        "The role adds filter context before the measure runs. SUM does not need to mention East for the viewer to be restricted. The practice measure states that same East filter explicitly and also returns 1,164.",
    },
    closer:
      "Security is part of the model. If an executive and a regional lead share one Northstar app, row-level security is what lets them open the same report and see different rows.",
  },
  {
    id: "pbi-17",
    title: "SaaS metrics Power BI capstone",
    minutes: 8,
    capstone: true,
    datasetId: "line_items",
    idea: [
      "Northstar Retail sells gear and software on the same fact. Trail Bottles sit next to Northstar Annual lines at 499, and those two annual lines pull the blend up. The capstone metric is average line amount: DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales)). Amount sums to 1,883 across 16 line items. COUNTROWS counts lines, not customers. Revenue per customer would use DISTINCTCOUNT, and that is a different question.",
      "The page needs the whole loop you already built. Power Query has cleaned types, nulls, and duplicates. The star relates customer, product, and date. The measure uses DIVIDE so an empty slice does not error. Put the average on a card, show SUM of amount by category beside it so the Annual plans are visible, and say the grain in the subtitle: one row per line item. Under the East role, the same measure averages only East lines.",
    ],
    example: {
      language: "dax",
      code: "Avg Line Amount = DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales))",
      output: "1883 / 16 line items",
    },
    takeaway: "Average line amount is total amount divided by the number of fact rows: DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales)).",
    question: {
      prompt: "Which formula is average line amount, rather than revenue per customer or a grand total?",
      choices: [
        "DIVIDE(SUM(FactSales[amount]), DISTINCTCOUNT(FactSales[customer_id]))",
        "SUMX(FactSales, FactSales[customer_id])",
        "DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales))",
        "CALCULATE(SUM(FactSales[amount]), ALL(FactSales))",
      ],
      answer: 2,
      explanation:
        "COUNTROWS(FactSales) is the line count, 16. DISTINCTCOUNT of customer_id is revenue per customer. SUMX of the id is not an average. ALL removes filters and returns the grand total, 1,883.",
    },
    drill: {
      kind: "order",
      prompt: "Order the capstone build for the Northstar executive page.",
      items: [
        "Place the average-line measure on a card and amount by category beside it",
        "Define DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales))",
        "Clean types, nulls, and duplicates in Power Query",
        "Relate DimCustomer, DimProduct, and DimDate to FactSales",
      ],
      answer: [
        "Clean types, nulls, and duplicates in Power Query",
        "Relate DimCustomer, DimProduct, and DimDate to FactSales",
        "Define DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales))",
        "Place the average-line measure on a card and amount by category beside it",
      ],
      explanation:
        "A page cannot rescue a dirty extract or an unrelated dimension. Shape the query, build the star, write the measure once, then lay out the card next to category so the software lines are visible.",
    },
    practice: biPractice(
      "pbi-17-practice",
      'Write the capstone measure DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales)).',
      "DIVIDE the sum of amount by COUNTROWS of FactSales. That is 1,883 across 16 lines.",
      daxSpec("DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales))"),
    ),
    reflect: {
      prompt: "The East security role is active. What does this average measure describe?",
      choices: [
        "The average of every region, because DIVIDE ignores roles",
        "The distinct count of products",
        "Last year's year-to-date total",
        "The average amount of East line items only",
      ],
      answer: 3,
      explanation:
        "Row-level security is filter context. SUM and COUNTROWS both see East rows only, so the average is the East average. The formula stays the one you wrote for the whole company.",
    },
    closer:
      "You have the whole loop: a cleaned query, a star, a measure that respects filter context, and a page that a role can secure. Ship the average line amount from that measure, and show category beside it so a 499 Annual plan is not mistaken for a typical Trail Bottle.",
  },
];
