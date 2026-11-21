import { type Blueprint } from "../expand";
import { biPractice, daxSpec, modelSpec } from "./powerbi-shared";

export const filterLessons: Blueprint[] = [
  {
    id: "pbi-11",
    title: "CALCULATE",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "Every measure runs inside a filter context: slicers, the row of a matrix, and page filters. SUM respects that context. CALCULATE evaluates an expression under a context you modify. CALCULATE(SUM(FactSales[amount]), FactSales[region] = \"West\") forces region to West and then sums amount. Those West lines, Maya Chen, Amina Diallo, Owen Brooks, and Hannah Berg, total 452.",
      "A filter argument replaces filters on the columns it sets. If the page is sliced to East, the West argument still returns West for this measure. The training fact stores region on FactSales so this workspace can apply that filter directly. In a fully separated star you would filter DimCustomer[region] and let the active relationship carry it to the fact. The idea is the same: change the region context, then sum.",
    ],
    example: {
      language: "dax",
      code: 'West Sales = CALCULATE(SUM(FactSales[amount]), FactSales[region] = "West")',
      output: "452",
    },
    takeaway: "CALCULATE changes the filter context for one expression. The West amount filter returns 452.",
    question: {
      prompt: 'What does the filter argument FactSales[region] = "West" do inside CALCULATE?',
      choices: [
        "It deletes the amount column",
        "It sets the region filter to West for that expression, overriding other region filters",
        "It appends the West customers onto DimProduct",
        "It changes the relationship cardinality to many-to-many",
      ],
      answer: 1,
      explanation:
        "CALCULATE filter arguments modify context for the duration of the expression. Region becomes West even if the page was on another region. The column, the product dimension, and the cardinality stay as they were.",
    },
    drill: {
      kind: "tokens",
      prompt: "Start the measure that forces the West region and then sums amount.",
      template: ["", "(", "SUM(FactSales[amount])", ",", 'FactSales[region] = "West"', ")"],
      bank: ["CALCULATE", "SUMX", "FILTER", "ALL"],
      answer: ["CALCULATE"],
      hint: "The function takes an expression first, then filter arguments.",
    },
    practice: biPractice(
      "pbi-11-practice",
      'Write CALCULATE(SUM(FactSales[amount]), FactSales[region] = "West"). West sales are 452.',
      "CALCULATE wraps SUM of amount, with region equal to West. Use quotes around West.",
      daxSpec('CALCULATE(SUM(FactSales[amount]), FactSales[region] = "West")'),
    ),
    reflect: {
      prompt: "The page is sliced to East, and a card uses the West Sales measure. What does the card show?",
      choices: [
        "East amount, because page filters always win over CALCULATE",
        "The sum of East and West",
        "An error, because a slicer and a measure cannot disagree",
        "West amount, 452, because CALCULATE overrides the region filter",
      ],
      answer: 3,
      explanation:
        "The filter argument replaces region context for that measure. The rest of the page can stay on East. East itself is 1,164, and this card is not asking for East.",
    },
    closer:
      "Read a CALCULATE from the inside out: the expression, then the filters that reshape it. If a Northstar card ignores a slicer, look for a filter argument on that column.",
  },
  {
    id: "pbi-12",
    title: "ALL",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "ALL removes filters. CALCULATE(SUM(FactSales[amount]), ALL(FactSales)) sums amount as if filters on FactSales were not there. On this extract that grand total is 1,883. Pair the filtered sum with that result and you get a percent of total: DIVIDE(SUM(FactSales[amount]), CALCULATE(SUM(FactSales[amount]), ALL(FactSales))). A West row can show 452 over 1,883.",
      "ALL(FactSales) clears filters that came from columns of that table, including region. It does not delete rows from the model. Use ALL on the denominator. If you also wrap the numerator in ALL, every row becomes 100 percent. ALLEXCEPT is the narrower tool when one filter should survive.",
    ],
    example: {
      language: "dax",
      code: `Pct of Total =
DIVIDE(
  SUM(FactSales[amount]),
  CALCULATE(SUM(FactSales[amount]), ALL(FactSales))
)`,
      output: "West is 452 / 1883. The practice measure is the denominator.",
    },
    takeaway: "ALL inside CALCULATE builds an unfiltered denominator. The percent-of-total pattern divides the filtered sum by that ALL sum.",
    question: {
      prompt: "A matrix has a row for West. The denominator should be every region's amount. Which pattern is right?",
      choices: [
        "DIVIDE the West sum by another copy of the same SUM, with no CALCULATE",
        "CALCULATE the denominator with FactSales[region] = \"West\"",
        "DIVIDE(SUM(FactSales[amount]), CALCULATE(SUM(FactSales[amount]), ALL(FactSales)))",
        "Put ALL(FactSales) in the visual title and leave the measure as SUM only",
      ],
      answer: 2,
      explanation:
        "A plain SUM in both parts of DIVIDE sees the West row, so the ratio is 1. ALL inside CALCULATE removes that row filter for the denominator only. Filtering the denominator to West does the opposite.",
    },
    drill: {
      kind: "fill",
      prompt: "Name the function that, inside CALCULATE, strips filters from FactSales.",
      answer: ["ALL"],
      hint: "Three letters. It is the filter argument, not CALCULATE itself.",
      codeTemplate: "CALCULATE(SUM(FactSales[amount]), ____(FactSales))",
    },
    practice: biPractice(
      "pbi-12-practice",
      'Write the unfiltered total as CALCULATE(SUM(FactSales[amount]), ALL(FactSales)).',
      "CALCULATE the sum of amount, and pass ALL(FactSales). With no extra page filter the result is the grand total, 1,883.",
      daxSpec("CALCULATE(SUM(FactSales[amount]), ALL(FactSales))"),
    ),
    reflect: {
      prompt: "What does ALL(FactSales) change?",
      choices: [
        "The Power Query extract, by deleting every campaign",
        "The filter context of the measure, not the stored rows",
        "The cardinality of DimCustomer",
        "The data type of amount",
      ],
      answer: 1,
      explanation:
        "ALL is a filter-context function. The 16 line items remain in the model. Only the filters applied to that calculation are cleared.",
    },
    closer:
      "Percent of total is the first Northstar measure that needs two contexts at once. Leave the numerator in the visual's context and wrap the denominator in CALCULATE and ALL.",
  },
  {
    id: "pbi-13",
    title: "Time intelligence",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "Time intelligence needs a real date table. DimDate[date] relates to FactSales[order_date], the relationship is active, and the date column is continuous. TOTALYTD(SUM(FactSales[amount]), DimDate[date]) expands the dates from the start of the year in context through the latest date in context, then sums amount. Northstar's lines all fall in 2025, from 6 January through 7 July, so a year-to-date total through the last order is the full 1,883.",
      "SAMEPERIODLASTYEAR shifts a date column back one year, and it belongs inside CALCULATE: CALCULATE(SUM(FactSales[amount]), SAMEPERIODLASTYEAR(DimDate[date])). A 2025 visual then asks for 2024. This extract has no 2024 orders, so the comparison is blank until last year's facts are loaded. Neither function repairs a text date or a missing relationship.",
    ],
    example: {
      language: "dax",
      code: `Sales YTD = TOTALYTD(SUM(FactSales[amount]), DimDate[date])
Sales LY = CALCULATE(SUM(FactSales[amount]), SAMEPERIODLASTYEAR(DimDate[date]))`,
      output: "YTD uses 2025 dates in this extract. Last year is empty until 2024 rows exist.",
    },
    takeaway: "TOTALYTD accumulates inside the year. SAMEPERIODLASTYEAR moves the same span to last year. Both ride on DimDate.",
    question: {
      prompt: "What does TOTALYTD change about the filter context?",
      choices: [
        "It removes DimCustomer and DimProduct from the model",
        "It parses $1,200 text in Power Query",
        "It keeps dates from 1 January of the year in context through the last date in context",
        "It counts distinct customers",
      ],
      answer: 2,
      explanation:
        "Year-to-date widens the date filter back to the start of the year and keeps the dates up through the current context. It does not drop the other dimensions, and it is not a query step.",
    },
    drill: {
      kind: "order",
      prompt: "Order the pieces required before a year-to-date card is trustworthy.",
      items: [
        "Write TOTALYTD around the amount measure and pass DimDate[date]",
        "Mark a continuous DimDate table and relate DimDate[date] to FactSales[order_date]",
        "Confirm the fact grain is one row per line item",
        "Load order_date as a real date, not text",
      ],
      answer: [
        "Confirm the fact grain is one row per line item",
        "Load order_date as a real date, not text",
        "Mark a continuous DimDate table and relate DimDate[date] to FactSales[order_date]",
        "Write TOTALYTD around the amount measure and pass DimDate[date]",
      ],
      explanation:
        "Grain first, then a typed date, then the date table and its relationship, then the time-intelligence measure. TOTALYTD on a text column or an unrelated date does not know what a year is.",
    },
    practice: biPractice(
      "pbi-13-practice",
      'Write TOTALYTD(SUM(FactSales[amount]), DimDate[date]).',
      "TOTALYTD, then SUM of amount, then DimDate[date]. The formula check matches that expression.",
      daxSpec("TOTALYTD(SUM(FactSales[amount]), DimDate[date])"),
    ),
    reflect: {
      prompt: "This extract contains 2025 orders only. What should CALCULATE with SAMEPERIODLASTYEAR return for those sales?",
      choices: [
        "The same 1,883, copied backward",
        "The West-only total of 452",
        "Blank, because there are no 2024 fact rows",
        "The number of columns on DimProduct",
      ],
      answer: 2,
      explanation:
        "Same period last year looks at 2024. Those dates are not in FactSales yet, so the comparison measure is empty until finance loads the prior year.",
    },
    closer:
      "State the calendar rule once with TOTALYTD or SAMEPERIODLASTYEAR on DimDate. Every Northstar page can inherit it, as long as the date relationship is active.",
  },
  {
    id: "pbi-14",
    title: "USERELATIONSHIP",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "A fact can carry two dates. Northstar orders have order_date and, in a fuller warehouse, a ship date. Only one relationship from DimDate to the fact can be active. The active one filters by default. The ship-date relationship stays inactive so the model has a single path.",
      "USERELATIONSHIP turns the inactive path on inside one measure: CALCULATE(SUM(FactSales[amount]), USERELATIONSHIP(FactSales[ship_date], DimDate[date])). Other visuals keep using the active date. This extract's model has one date key, order_date. The practice sets that path as the only active relationship, with customer and product left off, so you can see a single live date path before any measure opts into another one.",
    ],
    example: {
      language: "dax",
      code: "Sales by Ship Date = CALCULATE(SUM(FactSales[amount]), USERELATIONSHIP(FactSales[ship_date], DimDate[date]))",
      output: "The ship-date path is used for this measure only.",
    },
    takeaway: "One date relationship stays active. USERELATIONSHIP activates another date path inside a single CALCULATE.",
    question: {
      prompt: "Order date is the active relationship and ship date is inactive. How does one measure follow ship date?",
      choices: [
        "Delete DimDate",
        "Append ship date under order date in Power Query and drop order date",
        "Change the measure to COUNTROWS(DimCustomer)",
        "CALCULATE with USERELATIONSHIP pointing at the ship-date key and DimDate[date]",
      ],
      answer: 3,
      explanation:
        "USERELATIONSHIP activates an inactive relationship for that CALCULATE only. Deleting the date table removes both paths. Appending dates changes the grain. A customer count is not sales by ship date.",
    },
    drill: {
      kind: "bug",
      prompt: "USERELATIONSHIP was pointed at the measure column instead of the inactive keys. Which line is wrong?",
      lines: [
        "Sales by Ship Date =",
        "CALCULATE(SUM(FactSales[amount]), USERELATIONSHIP(FactSales[amount], DimDate[date]))",
      ],
      buggyLine: 1,
      fixChoices: [
        "SUM(FactSales[amount])",
        "CALCULATE(SUM(FactSales[amount]), USERELATIONSHIP(FactSales[ship_date], DimDate[date]))",
        "USERELATIONSHIP(SUM(FactSales[amount]))",
        "ALL(FactSales[amount])",
      ],
      fixAnswer: 1,
      explanation:
        "USERELATIONSHIP takes the two key columns of the inactive relationship, the fact date and DimDate[date]. Amount is not a key, so it cannot activate a path.",
    },
    practice: biPractice(
      "pbi-14-practice",
      "Activate only the date relationship, DimDate[date] to FactSales[order_date]. Leave the customer and product relationships inactive.",
      "One relationship reads Active. Customer and product stay Inactive.",
      modelSpec(false, false, true),
    ),
    reflect: {
      prompt: "What is true of an inactive relationship when no measure calls USERELATIONSHIP?",
      choices: [
        "It filters every measure on the page",
        "It duplicates fact rows",
        "It does not filter visuals",
        "It converts amount to text",
      ],
      answer: 2,
      explanation:
        "Inactive means dormant. Filters flow along active relationships unless a measure explicitly activates another path for its own calculation.",
    },
    closer:
      "Keep one active date path so Northstar's model stays predictable. Extra dates stay inactive and opt in through USERELATIONSHIP, one measure at a time.",
  },
];
