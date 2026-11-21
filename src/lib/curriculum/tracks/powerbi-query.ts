import { type Blueprint } from "../expand";
import { biPractice, querySpec, spendCleanPrompt, spendCleanHint } from "./powerbi-shared";

export const queryLessons: Blueprint[] = [
  {
    id: "pbi-1",
    title: "Power Query vs the model",
    minutes: 5,
    datasetId: "messy_spend",
    idea: [
      "Northstar Retail's marketing extract lands as messy_spend. Spring Search is pasted twice at $1,200 for 2025-03, and Spring Social has no spend at all. Power Query is the editor that shapes those rows before they load: it removes the duplicate on campaign, spend text, and month (row_id differs, so a distinct on every column would keep both), drops the blank spend, and parses the currency text into a number.",
      "The data model is the next room. After the query loads, relationships and DAX measures live there. A measure adds whatever rows it is given, so it will double-count Spring Search if the duplicate survived the load. Clean the extract once in Power Query, then calculate on the result.",
    ],
    example: {
      language: "powerquery",
      code: `let
  Source = messy_spend,
  Deduped = Table.Distinct(Source, {"campaign", "spend_text", "month"}),
  NoBlank = Table.SelectRows(Deduped, each [spend_text] <> null),
  Parsed = Table.AddColumn(NoBlank, "spend", each Number.From(Text.Replace(Text.Replace([spend_text], "$", ""), ",", "")))
in
  Parsed`,
      output: "Spring Search 1200, Partner Webinar 500, Summer Email 200",
    },
    takeaway: "Power Query changes the rows that get loaded. The model relates those rows and calculates on top of them.",
    question: {
      prompt: "Where do you typically remove nulls and split columns?",
      choices: ["DAX measure pane", "Power Query Editor", "Report theme gallery", "Gateway monitor"],
      answer: 1,
      explanation:
        "Nulls and split columns are row-shaping work. Power Query applies those steps to the Northstar extract before load. A DAX measure only calculates on rows that already arrived, and themes and gateways do not edit the table.",
    },
    drill: {
      kind: "order",
      prompt: "Order the work that turns the campaign extract into a number finance can trust.",
      items: [
        "Write a SUM measure for spend",
        "Load the cleaned table into the model",
        "Remove duplicate rows and blank spend in Power Query",
        "Connect to the messy campaign extract",
      ],
      answer: [
        "Connect to the messy campaign extract",
        "Remove duplicate rows and blank spend in Power Query",
        "Load the cleaned table into the model",
        "Write a SUM measure for spend",
      ],
      explanation:
        "Connect, clean, load, then calculate. A measure written while Spring Search is still duplicated will report 1,200 twice.",
    },
    practice: biPractice("pbi-1-practice", spendCleanPrompt, spendCleanHint, querySpec()),
    reflect: {
      prompt: "After those three steps, what is true of Spring Social?",
      choices: [
        "It stays in the table with spend 0",
        "It is removed because its spend was blank",
        "It is merged into Spring Search",
        "It becomes the date table",
      ],
      answer: 1,
      explanation:
        "The blank-spend step removes Spring Social. The duplicate Spring Search row collapses to one 1,200, and Partner Webinar 500 and Summer Email 200 are parsed only after that.",
    },
    closer:
      "When a Northstar total is twice what finance expects, open Power Query before you rewrite the measure. A duplicated extract row inflates every visual that uses the table.",
  },
  {
    id: "pbi-4",
    title: "Types and nulls",
    minutes: 5,
    datasetId: "messy_spend",
    idea: [
      "A column's type decides which operations are legal. spend_text looks numeric, but $1,200 is text, so a sum will not add it until the dollar sign and comma are parsed and the type is a decimal number. A date stored as 3/1/2025 is also text: 12/1/2024 sorts first because the character 1 comes before 3.",
      "Null is a missing value, and zero is a reported amount. Spring Social's blank spend means the campaign never reported, not that Northstar spent nothing. Replacing that null with 0 pulls the average down. Drop the row or leave it null, and record which choice you made.",
    ],
    example: {
      language: "powerquery",
      code: `NoBlank = Table.SelectRows(Source, each [spend_text] <> null),
AsNumber = Table.TransformColumns(NoBlank, {{"spend_text", each Number.From(Text.Replace(Text.Replace(_, "$", ""), ",", "")), type number}})`,
      output: "Blank spend is removed. Remaining spend text becomes a number.",
    },
    takeaway: "Set the type on purpose, and treat null as missing. Zero is a real amount.",
    question: {
      prompt: "Spring Social has a blank spend_text. Which statement is the right one for a spend total?",
      choices: [
        "Blank spend is the same as zero dollars, so add 0",
        "Blank spend is null, so it is not a reported zero",
        "The text $1,200 can be summed without changing its type",
        "Creating a relationship deletes nulls automatically",
      ],
      answer: 1,
      explanation:
        "The extract stores null, not 0. Filling 0 would claim Northstar spent nothing on Spring Social. Currency text still has to be parsed, and a relationship does not delete nulls.",
    },
    drill: {
      kind: "bug",
      prompt: "This step was meant to drop campaigns that never reported spend. Which line is wrong, and which fix replaces it?",
      lines: [
        "Clean = Table.SelectRows(Source, each [spend_text] = null)",
        'Typed = Table.TransformColumnTypes(Clean, {{"spend_text", type number}})',
      ],
      buggyLine: 0,
      fixChoices: [
        "Clean = Table.SelectRows(Source, each [spend_text] <> null)",
        "Clean = Table.SelectRows(Source, each [spend_text] = 0)",
        "Clean = Table.Distinct(Source)",
        'Clean = Table.AddColumn(Source, "null", each null)',
      ],
      fixAnswer: 0,
      explanation:
        "The condition = null keeps Spring Social and throws away the campaigns that have spend. <> null keeps the rows finance can total.",
    },
    practice: biPractice(
      "pbi-4-practice",
      "Set the spend column up properly. Enable the full clean in order: remove duplicate campaign rows, drop rows with a blank spend, then parse $1,200 text into a number.",
      spendCleanHint,
      querySpec(),
    ),
    reflect: {
      prompt: "You parse the spend text before you drop the null. What is still true of Spring Social?",
      choices: [
        "The blank row still has to be removed, because parsing does not invent a spend figure",
        "Parsing turns the blank into 1200",
        "Parsing creates a relationship to DimDate",
        "The word null is summed as the number 4",
      ],
      answer: 0,
      explanation:
        "Parsing a blank does not produce 1,200 or any other reported amount. The row stays missing until the drop-null step removes it. The graded sequence still drops duplicates, then nulls, then parses.",
    },
    closer:
      "Finance will trust a Northstar spend column when its type is numeric and its blanks were an explicit decision. Leave the column as text and every later measure looks broken for a reason that is not DAX.",
  },
  {
    id: "pbi-5",
    title: "Split and unpivot",
    minutes: 6,
    datasetId: "messy_spend",
    idea: [
      "Split a column when one field hides two facts. A Northstar export sometimes arrives as West|Enterprise in a single region_segment field, or TB-01|Trail Bottle in product_sku_name. Split on the delimiter in Power Query so each piece can be typed, filtered, and joined on its own.",
      "Unpivot when the export uses headers as values. Columns named spend_jan, spend_feb, and spend_mar put the month in the header. Unpivot those columns into month and spend so one row is one month. The campaign file in this lesson is already one row per month, with a messy spend_text, so the practice is the clean. The quiz is the reshape you do when the file is not yet one row per fact.",
    ],
    example: {
      language: "powerquery",
      code: `Split = Table.SplitColumn(Source, "region_segment", Splitter.SplitTextByDelimiter("|"), {"region", "segment"}),
Unpivoted = Table.Unpivot(Monthly, {"spend_jan", "spend_feb", "spend_mar"}, "month", "spend")`,
      output: "One row per region and segment, or one row per month, instead of a jammed header.",
    },
    takeaway: "Split jammed labels into columns. Unpivot month headers into rows so the fact grain is one event per row.",
    question: {
      prompt: "The campaign file arrives with columns spend_jan, spend_feb, and spend_mar. What should Power Query do so the model can filter by month?",
      choices: [
        "Unpivot the three month columns into month and spend",
        "Split each month column on the letter e",
        "Append the file to DimCustomer",
        "Leave the months as columns and write twelve measures",
      ],
      answer: 0,
      explanation:
        "Unpivot turns the month headers into a month column and stacks the spend values. The model can then relate month to DimDate. Splitting on a letter does not create a month, and a customer dimension is the wrong grain.",
    },
    drill: {
      kind: "tokens",
      prompt: "Name the two transforms. One breaks a delimiter column apart. The other turns month headers into rows.",
      template: ["", "a delimiter column, and", "", "month headers into rows."],
      bank: ["Split", "Unpivot", "Append", "Merge"],
      answer: ["Split", "Unpivot"],
      hint: "Delimiter first. Headers that are really values come second.",
    },
    practice: biPractice(
      "pbi-5-practice",
      "This extract is already one row per campaign and month, so there is nothing to unpivot here. Run the clean that makes spend usable: remove duplicate campaign rows, drop blank spend, then parse the $ text. In that order.",
      "Split and unpivot are the quiz. This workspace grades the three clean steps.",
      querySpec(),
    ),
    reflect: {
      prompt: 'A column product_sku_name contains TB-01|Trail Bottle. Which result of a split belongs in the model?',
      choices: [
        "The pipe stays in one text column",
        "Two columns, sku and product name, each with its own type",
        "A new fact table with one row per letter",
        "An inactive relationship from the pipe character to DimDate",
      ],
      answer: 1,
      explanation:
        "Split on the pipe so SKU and name can be filtered and joined separately. A single column that still contains the delimiter forces every visual to parse text.",
    },
    closer:
      "If the grain is wrong, one row with a jammed label or one column per month, no star schema will rescue the report. Split and unpivot until one row is one Northstar fact.",
  },
  {
    id: "pbi-6",
    title: "Merge vs append",
    minutes: 5,
    datasetId: "line_items",
    idea: [
      "Append stacks rows that mean the same kind of event. Northstar's January line items and February line items share columns, so you append them into one fact table. The result has more rows and the same grain. Table.Combine is the M form of that stack.",
      "Merge looks up columns from another table, the way a left join does. Merge a product list onto a query on product_id when that query needs category before it loads. If the product list will be DimProduct in the model, prefer the relationship: a merge that copies category onto every fact row repeats a dimension attribute. Append adds events. Merge adds attributes.",
    ],
    example: {
      language: "powerquery",
      code: `AllMonths = Table.Combine({January, February}),
WithCategory = Table.NestedJoin(Lines, {"product_id"}, Products, {"product_id"}, "Product", JoinKind.LeftOuter)`,
      output: "Append grows the fact. Merge brings category across by product_id.",
    },
    takeaway: "Append when the tables are more of the same rows. Merge when you need columns from a lookup table.",
    question: {
      prompt: "January and February order extracts have the same columns. How do you combine them?",
      choices: [
        "Merge on order_date, because the months differ",
        "Append, because they are the same kind of rows",
        "Unpivot both tables on customer_id",
        "Create a many-to-many relationship between the two files and stop",
      ],
      answer: 1,
      explanation:
        "Same grain and the same columns means append. A merge pairs rows side by side and drops or duplicates orders that do not share a key. A relationship between two fact extracts is not a substitute for one fact table.",
    },
    drill: {
      kind: "bug",
      prompt: "The goal is every January order and every February order. Which line uses the wrong combine, and what should replace it?",
      lines: [
        "Goal: stack both monthly extracts",
        'AllMonths = Table.NestedJoin(January, {"order_id"}, February, {"order_id"}, "Feb", JoinKind.LeftOuter)',
      ],
      buggyLine: 1,
      fixChoices: [
        "AllMonths = Table.Combine({January, February})",
        "AllMonths = Table.Unpivot(January, February)",
        "AllMonths = Table.Distinct(January)",
        "AllMonths = Table.Transpose(February)",
      ],
      fixAnswer: 0,
      explanation:
        "NestedJoin is a merge. Orders that exist only in February never appear as their own rows. Table.Combine appends the two extracts.",
    },
    practice: biPractice(
      "pbi-6-practice",
      "The monthly files are already appended in this workspace. Finish the stacked campaign table: remove duplicate campaign rows, drop blank spend, and parse the $ text, in that order.",
      spendCleanHint,
      querySpec(),
    ),
    reflect: {
      prompt: "A campaign query needs product category, which lives on a product table keyed by product_id. The query is not the star schema. What do you do?",
      choices: [
        "Append the product table under the campaigns",
        "Split product_id on a comma",
        "Merge the product table onto the query on product_id",
        "Replace product_id with null",
      ],
      answer: 2,
      explanation:
        "Merge brings category across by key. Append would stack product rows under campaign rows and mis-align the columns. The model relationship is the right tool later, when category lives on DimProduct.",
    },
    closer:
      "Ask one question before you combine Northstar tables: are you adding events, or looking up attributes? More events is append. A lookup is merge.",
  },
];
