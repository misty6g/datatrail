import { type Blueprint } from "../expand";
import { biPractice, daxSpec } from "./powerbi-shared";

export const daxLessons: Blueprint[] = [
  {
    id: "pbi-3",
    title: "A simple SUM",
    minutes: 5,
    datasetId: "line_items",
    idea: [
      "A measure is a formula the visual runs after filters are applied. Total Sales = SUM(FactSales[amount]) adds amount on the rows that survive the current filters. With no filter, Northstar's 16 line items total 1,883. That total includes shipped, pending, refunded, and cancelled lines, because this exercise sums the whole extract. Slice the visual to West and the same measure adds only Maya Chen, Amina Diallo, Owen Brooks, and Hannah Berg, which is 452.",
      "SUM takes a numeric column. SUM(FactSales[amount]) is the revenue measure. SUM of the table name is not valid DAX, and COUNT answers how many non-blank values, which is 16, not 1,883. Keep the formula in one measure so every visual shares it. The fact column is amount, lowercase, on FactSales.",
    ],
    example: {
      language: "dax",
      code: "Total Sales = SUM(FactSales[amount])",
      output: "1883 with no report filter. West is 452.",
    },
    takeaway: "SUM(FactSales[amount]) adds amount for whatever rows the visual has filtered in. Unfiltered, that is 1,883.",
    question: {
      prompt: "Which DAX expression sums amount from FactSales?",
      choices: ["COUNT(FactSales[amount])", "SUM(FactSales[amount])", "SUM(FactSales)", "LOOKUPVALUE(FactSales[amount])"],
      answer: 1,
      explanation:
        "SUM adds the amount column and returns 1,883 on the full extract. COUNT would tally non-blank amounts. SUM cannot take a table, and LOOKUPVALUE retrieves a single value rather than a total.",
    },
    drill: {
      kind: "tokens",
      prompt: "Assemble the measure that totals Northstar line amount.",
      template: ["Total Sales", "=", "", "(", "FactSales[amount]", ")"],
      bank: ["SUM", "COUNT", "DIVIDE", "CALCULATE"],
      answer: ["SUM"],
      hint: "The function that adds a numeric column.",
    },
    practice: biPractice(
      "pbi-3-practice",
      'Write a measure that sums line amount: SUM(FactSales[amount]). The full extract totals 1,883.',
      "SUM the amount column. The table name in the formula is FactSales. Spaces and capitalization can vary.",
      daxSpec("SUM(FactSales[amount])"),
    ),
    reflect: {
      prompt: "A card with no slicer shows 1,883. You then slice region to West. What does the same SUM measure do?",
      choices: [
        "It stays 1,883 because SUM ignores slicers",
        "It counts West customers instead of adding amount",
        "It adds only the West rows that remain in filter context, which total 452",
        "It returns the list price of Trail Bottle, which is 24",
      ],
      answer: 2,
      explanation:
        "The measure text does not change. Filter context does. West lines for Maya, Amina, Owen, and Hannah sum to 452.",
    },
    closer:
      "Put SUM in a measure the first time finance asks for a total. A number typed into a card title will not follow the next slicer.",
  },
  {
    id: "pbi-9",
    title: "DIVIDE and DISTINCTCOUNT",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "DISTINCTCOUNT(FactSales[customer_id]) counts different customers, not line items. Maya Chen has three line items and is still one customer. The fact holds 9 customers and 16 lines, so a count of rows overstates the customer base. Priya Shah's two Northstar Annual lines are one customer.",
      "DIVIDE protects the ratio. Revenue per customer is DIVIDE(SUM(FactSales[amount]), DISTINCTCOUNT(FactSales[customer_id])), which is 1,883 divided by 9. DIVIDE stays defined when the denominator is zero, which the / operator does not promise. Use it for any rate a card might compute on an empty slicer.",
    ],
    example: {
      language: "dax",
      code: "Revenue per Customer = DIVIDE(SUM(FactSales[amount]), DISTINCTCOUNT(FactSales[customer_id]))",
      output: "1883 / 9 customers",
    },
    takeaway: "DISTINCTCOUNT counts identities. DIVIDE builds the ratio and stays safe when the denominator is zero.",
    question: {
      prompt: "Why use DISTINCTCOUNT on customer_id instead of COUNTROWS for how many customers bought?",
      choices: [
        "DISTINCTCOUNT sums amount",
        "COUNTROWS ignores the fact table",
        "customer_id is stored only on DimDate",
        "One customer can have many line items, and those rows are not extra customers",
      ],
      answer: 3,
      explanation:
        "Maya, Priya, and others each appear on more than one line. COUNTROWS(FactSales) returns 16 line items. DISTINCTCOUNT of customer_id returns 9 customers.",
    },
    drill: {
      kind: "bug",
      prompt: "This revenue-per-customer measure uses the wrong denominator and an unsafe operator. Which line do you replace?",
      lines: [
        "Revenue per Customer =",
        "SUM(FactSales[amount]) / COUNTROWS(FactSales[customer_id])",
      ],
      buggyLine: 1,
      fixChoices: [
        "DIVIDE(SUM(FactSales[amount]), DISTINCTCOUNT(FactSales[customer_id]))",
        "SUM(FactSales[customer_id])",
        "DIVIDE(FactSales[amount], FactSales[region])",
        "COUNTROWS(DimDate)",
      ],
      fixAnswer: 0,
      explanation:
        "COUNTROWS accepts a table, not a column, and it would not drop duplicate customers. DIVIDE with DISTINCTCOUNT is 1,883 over 9 customers.",
    },
    practice: biPractice(
      "pbi-9-practice",
      'Write revenue per customer as DIVIDE(SUM(FactSales[amount]), DISTINCTCOUNT(FactSales[customer_id])).',
      "DIVIDE the amount sum by the distinct customer count. Column names stay lowercase. Spaces can vary.",
      daxSpec("DIVIDE(SUM(FactSales[amount]), DISTINCTCOUNT(FactSales[customer_id]))"),
    ),
    reflect: {
      prompt: "A slicer leaves no customers in context, so the denominator is zero. What does DIVIDE do that the / operator may not?",
      choices: [
        "It substitutes the region name",
        "It avoids a divide-by-zero error when the denominator is 0",
        "It activates an inactive relationship",
        "It unpivots the fact table",
      ],
      answer: 1,
      explanation:
        "The slash operator can error on zero and break the visual. DIVIDE is the function to use for rates so an empty Northstar selection does not take the page down.",
    },
    closer:
      "Every rate needs two decisions: which rows are in the numerator, and which identities are in the denominator. Write both into the measure so the card and the matrix cannot drift apart.",
  },
  {
    id: "pbi-10",
    title: "SUMX",
    minutes: 5,
    datasetId: "line_items",
    idea: [
      "SUM adds a column that already exists. SUMX walks row by row, evaluates an expression, and then adds those results. SUMX(FactSales, FactSales[quantity] * FactSales[unit_price]) multiplies quantity by unit price on each line and sums the products. On this extract, amount is already that product, so the iterator matches SUM(FactSales[amount]) at 1,883.",
      "Reach for SUMX when the row math is not stored, such as quantity times a price that still lives only on DimProduct, or an extended amount before a discount. The X functions are iterators. If you can already point at the amount column, SUM is the clearer measure.",
    ],
    example: {
      language: "dax",
      code: "Extended Amount = SUMX(FactSales, FactSales[quantity] * FactSales[unit_price])",
      output: "1883, the same total as SUM of amount",
    },
    takeaway: "SUMX evaluates an expression per row, then sums. If the column already holds the product, SUM is enough.",
    question: {
      prompt: "When is SUMX the right function?",
      choices: [
        "You need the distinct count of customers",
        "You need to multiply two columns on each row and then add those products",
        "You need to remove duplicate queries in Power Query",
        "You need a relationship between DimDate and the fact",
      ],
      answer: 1,
      explanation:
        "SUMX is an iterator. Quantity times unit price is its textbook case. Distinct counts, query steps, and relationships are different tools.",
    },
    drill: {
      kind: "tokens",
      prompt: "Build the iterator that multiplies quantity by unit price on each Northstar line.",
      template: ["", "(", "FactSales", ",", "FactSales[quantity]", "*", "FactSales[unit_price]", ")"],
      bank: ["SUMX", "SUM", "DIVIDE", "CALCULATE"],
      answer: ["SUMX"],
      hint: "The iterator takes a table and a row expression.",
    },
    practice: biPractice(
      "pbi-10-practice",
      'Write SUMX(FactSales, FactSales[quantity] * FactSales[unit_price]). It matches total amount because each line amount is already quantity times unit price.',
      "SUMX, then FactSales, then quantity times unit price. The preview total is 1,883.",
      daxSpec("SUMX(FactSales, FactSales[quantity] * FactSales[unit_price])"),
    ),
    reflect: {
      prompt: "amount is already quantity times unit_price on every line. Which measure is the simpler total?",
      choices: [
        "SUM(FactSales[amount])",
        "DISTINCTCOUNT(FactSales[amount])",
        "COUNTROWS(DimProduct)",
        "SUMX is required because SUM cannot add a stored amount",
      ],
      answer: 0,
      explanation:
        "The product is stored in amount. SUM of that column is the direct total. SUMX recomputes the same 1,883 and is the tool you keep for formulas that are not stored.",
    },
    closer:
      "If you can point at the column, SUM it. If the number is a formula the row must compute first, SUMX it. Northstar's amount column is the first case.",
  },
];
