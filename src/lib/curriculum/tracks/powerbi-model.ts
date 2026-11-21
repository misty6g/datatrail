import { type Blueprint } from "../expand";
import { biPractice, modelSpec } from "./powerbi-shared";

export const modelLessons: Blueprint[] = [
  {
    id: "pbi-2",
    title: "Relationships",
    minutes: 5,
    datasetId: "line_items",
    idea: [
      "A relationship is a join the model remembers. Each Northstar line item knows a customer_id, a product_id, and an order_date. DimCustomer, DimProduct, and DimDate store one row per customer, product, and date. A one-to-many relationship from each dimension key to the matching fact key lets a slicer on Maya Chen keep only her line items.",
      "The dimension is the one side and FactSales is the many side: Maya has several lines, and Trail Bottle appears on many orders. An active relationship passes filters. An inactive one stays in the model but does not filter until a measure turns it on. This lesson turns all three paths on.",
    ],
    example: {
      language: "text",
      code: `DimCustomer[customer_id] → FactSales[customer_id]
DimProduct[product_id]   → FactSales[product_id]
DimDate[date]            → FactSales[order_date]`,
      output: "Three active one-to-many relationships.",
    },
    takeaway: "Relate each dimension key to the fact key, one-to-many, and keep the path active when visuals should filter through it.",
    question: {
      prompt: "Which relationship lets a customer-name slicer filter Northstar line items?",
      choices: [
        "FactSales[amount] to DimProduct[list_price]",
        "DimDate[date] to DimCustomer[joined_on]",
        "DimCustomer[customer_id] to FactSales[customer_id], one-to-many",
        "FactSales[region] to FactSales[region]",
      ],
      answer: 2,
      explanation:
        "The shared customer_id is the key. Amount and list price are not keys. Joining the date table to a customer attribute does not connect the sales fact, and a column does not relate to itself.",
    },
    drill: {
      kind: "fill",
      prompt: "A ____-to-many relationship is the usual star-schema pattern from a dimension to a fact table.",
      answer: ["one", "1"],
      hint: "The dimension holds each customer, product, or date once.",
      codeTemplate: "DimCustomer ____-to-many FactSales",
    },
    practice: biPractice(
      "pbi-2-practice",
      "Activate the star. Turn on all three relationships: DimCustomer[customer_id] to FactSales[customer_id], DimProduct[product_id] to FactSales[product_id], and DimDate[date] to FactSales[order_date].",
      "Each relationship should read Active. The check compares the set of active links.",
      modelSpec(true, true, true),
    ),
    reflect: {
      prompt: "Trail Bottle is product_id 1 and appears on many line items. What cardinality runs from DimProduct to FactSales?",
      choices: [
        "Many products to one line item",
        "One product to many line items",
        "One amount to one region",
        "Many dates to many customers, with no key",
      ],
      answer: 1,
      explanation:
        "product_id is unique on DimProduct and repeats on FactSales. That is one-to-many from the dimension to the fact.",
    },
    closer:
      "If a Northstar slicer does nothing, trace the key from the dimension you clicked to the fact the visual aggregates. The missing piece is usually a relationship.",
  },
  {
    id: "pbi-7",
    title: "Facts vs dimensions",
    minutes: 5,
    datasetId: "line_items",
    idea: [
      "FactSales is the event. Each row is one Northstar line item: a quantity, a unit price, and the amount, which is quantity times unit price. Sixteen line items sum to 1,883. Facts are what you aggregate. You almost never slice a report by a fact surrogate such as item_id.",
      "Dimensions describe the event and stay narrow. DimCustomer holds the name, region, and segment once per customer, so West is Maya Chen's attribute and reaches her lines through customer_id. DimProduct holds the product and its category. DimDate holds the calendar. Descriptive text stays on the one side.",
    ],
    takeaway: "Aggregate the fact. Filter and group with dimensions. Keys connect them.",
    question: {
      prompt: "Which field belongs on FactSales rather than on a dimension?",
      choices: [
        "The customer's region, stored once",
        "The product category, stored once",
        "A calendar table of dates",
        "The amount for a single line item",
      ],
      answer: 3,
      explanation:
        "Amount is the additive fact. Region and category describe the customer and the product. A calendar is DimDate, not a fact.",
    },
    drill: {
      kind: "order",
      prompt: "Order the modeling steps for the Northstar star.",
      items: [
        "Hide the foreign keys on the fact from the report view",
        "Relate DimCustomer[customer_id] to FactSales[customer_id]",
        "Put customer name and region on DimCustomer",
        "Put quantity, unit price, and amount on FactSales",
      ],
      answer: [
        "Put quantity, unit price, and amount on FactSales",
        "Put customer name and region on DimCustomer",
        "Relate DimCustomer[customer_id] to FactSales[customer_id]",
        "Hide the foreign keys on the fact from the report view",
      ],
      explanation:
        "Define the fact grain and the dimension attributes, relate the keys, then hide the keys so people filter on name and region.",
    },
    practice: biPractice(
      "pbi-7-practice",
      "The fact only filters when every dimension key is connected. Activate customer, product, and date: all three relationships on.",
      "DimCustomer, DimProduct, and DimDate should each show Active.",
      modelSpec(true, true, true),
    ),
    reflect: {
      prompt: "Maya Chen's region, West, is needed on every report. Where should that text live?",
      choices: [
        "Copied onto DimDate",
        "As a numeric constant inside SUM",
        "On DimCustomer, once, filtered through customer_id",
        "Only inside the report title",
      ],
      answer: 2,
      explanation:
        "Region describes the customer. Store it on DimCustomer and let the relationship filter FactSales. This workspace also carries region on the fact extract so a measure can filter FactSales[region] directly.",
    },
    closer:
      "When you want to add another text column to FactSales, ask whether it describes the line or a customer, product, or day. Descriptive text is a dimension. The number you sum is the fact.",
  },
  {
    id: "pbi-8",
    title: "Filter direction",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "A single-direction relationship filters from the one side to the many side. Selecting a customer flows to that customer's fact rows and does not, by itself, rewrite DimProduct. That is the safe default for Northstar's star. Both-direction filtering also lets the fact filter back into the other dimension, which can make a product slicer shrink to products those customers bought, and it can create a second path that filters a measure you did not mean to filter.",
      "An inactive relationship passes nothing in either direction. In this exercise the customer and product paths stay active, and DimDate to FactSales[order_date] stays inactive. A March slicer on that date table will not change sales until you activate the relationship or a measure calls USERELATIONSHIP.",
    ],
    takeaway: "Single direction filters from the dimension to the fact. An inactive relationship does not filter at all.",
    question: {
      prompt: "DimDate's relationship to FactSales is inactive. You slice to March 2025. What reaches the sales measure?",
      choices: [
        "Nothing from that date slicer, because an inactive relationship does not filter",
        "Every fact row still filters as if the relationship were active",
        "The slicer filters DimCustomer instead",
        "The slicer deletes March rows from the extract",
      ],
      answer: 0,
      explanation:
        "Inactive means the path exists and filter context does not flow along it. The March slicer does not change the sum of amount until that relationship is activated or a measure turns it on for one calculation.",
    },
    drill: {
      kind: "fill",
      prompt:
        "Type the default cross-filter direction from DimCustomer to FactSales. The dimension filters the fact, and the fact does not filter the dimension back.",
      answer: ["single", "single direction", "one direction", "one-way"],
      hint: "The other setting is both. Type single.",
      codeTemplate: "Cross filter direction: ____",
    },
    practice: biPractice(
      "pbi-8-practice",
      "Set the filter paths for this page. Activate DimCustomer to FactSales and DimProduct to FactSales. Leave DimDate[date] to FactSales[order_date] inactive.",
      "Two relationships read Active. The date relationship stays Inactive.",
      modelSpec(true, true, false),
    ),
    reflect: {
      prompt: "Why is both-direction filtering risky between DimCustomer and DimProduct through FactSales?",
      choices: [
        "It removes the fact table from the model",
        "It changes amount into text",
        "It disables SUM",
        "Each dimension can filter the other, so a measure may pick up a path you did not intend",
      ],
      answer: 3,
      explanation:
        "Bidirectional cross-filter lets a product selection filter the customer dimension and the reverse. Measures then inherit extra filters, and an ambiguous path can make the model reject the relationship.",
    },
    closer:
      "Draw the filter arrows before you publish. Northstar visuals should be filtered by the dimensions you turned on. An inactive date path is a choice until a page actually needs the calendar.",
  },
];
