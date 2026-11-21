import { mod } from "../expand";
import type { Module } from "../types";
import { queryLessons } from "./powerbi-query";
import { modelLessons } from "./powerbi-model";
import { daxLessons } from "./powerbi-dax";
import { filterLessons } from "./powerbi-filter";
import { capstoneLessons } from "./powerbi-capstone";

export const powerBiModules: Module[] = [
  mod(
    "pbi-query",
    "Power Query",
    "Shape Northstar Retail extracts before they reach the model. Power Query removes the duplicated Spring Search row, drops blank spend, and decides what one row means.",
    [
      {
        title: "Query versus model",
        items: [
          "Power Query shapes rows before load: duplicates, nulls, types, split, unpivot, merge, and append.",
          "The model stores relationships and DAX measures after the query loads.",
          "A duplicated campaign row cannot be fixed by a measure.",
        ],
      },
      {
        title: "Clean the campaign extract",
        items: [
          "Remove duplicate campaign rows first. Spring Search was pasted twice at $1,200.",
          "Drop blank spend next. Spring Social never reported an amount.",
          "Parse $1,200 text into a number last. The remaining spend totals 1,900.",
        ],
      },
    ],
    queryLessons,
  ),
  mod(
    "pbi-model",
    "Star schema",
    "Put Northstar line items in FactSales and let DimCustomer, DimProduct, and DimDate filter them.",
    [
      {
        title: "Facts and dimensions",
        items: [
          "FactSales is one row per line item: quantity, unit_price, and amount. The 16 lines total 1,883.",
          "DimCustomer, DimProduct, and DimDate hold the attributes you slice by.",
          "Filter from the dimension toward the fact.",
        ],
      },
      {
        title: "Relationships",
        items: [
          "DimCustomer[customer_id] to FactSales[customer_id]",
          "DimProduct[product_id] to FactSales[product_id]",
          "DimDate[date] to FactSales[order_date]",
          "An inactive relationship does not filter until you activate it or call USERELATIONSHIP.",
        ],
      },
    ],
    modelLessons,
  ),
  mod(
    "pbi-dax",
    "DAX measures",
    "Measures compute Northstar's numbers at read time, in whatever filter context the visual has set.",
    [
      {
        title: "Aggregates",
        items: [
          "SUM(FactSales[amount]) is 1,883 on the full extract and 452 for West.",
          "DISTINCTCOUNT(FactSales[customer_id]) counts 9 customers, not 16 lines.",
          "DIVIDE(numerator, denominator) is the safe way to write a rate.",
        ],
      },
      {
        title: "Row by row",
        items: [
          "SUMX(FactSales, FactSales[quantity] * FactSales[unit_price]) multiplies on each line, then sums.",
          "On this extract that product equals amount, so SUMX matches SUM of amount.",
          "Use SUM when the column is already stored.",
        ],
      },
    ],
    daxLessons,
  ),
  mod(
    "pbi-filter",
    "Filter context and time",
    "CALCULATE changes the filters a measure sees. Time intelligence and USERELATIONSHIP are specific ways to change that context.",
    [
      {
        title: "CALCULATE",
        items: [
          'CALCULATE(SUM(FactSales[amount]), FactSales[region] = "West") is 452.',
          'The East filter is 1,164. Central is 267.',
          "ALL(FactSales) inside CALCULATE clears fact filters for a percent-of-total denominator.",
        ],
      },
      {
        title: "Time and inactive paths",
        items: [
          "TOTALYTD(SUM(FactSales[amount]), DimDate[date]) accumulates inside the year.",
          "SAMEPERIODLASTYEAR shifts the date context back one year, inside CALCULATE.",
          "USERELATIONSHIP activates an inactive relationship for one measure.",
        ],
      },
    ],
    filterLessons,
  ),
  mod(
    "pbi-capstone",
    "Executive reporting",
    "Package the model into a page a Northstar executive can read: conditional color, row-level security, and average line amount.",
    [
      {
        title: "The page",
        items: [
          "One SUM measure feeds the bars and the conditional color.",
          "East clears a 1,000 goal. West at 452 and Central at 267 stay visible in the other color.",
          "Show category beside the average so Annual plans at 499 are not hidden inside the blend.",
        ],
      },
      {
        title: "Access and the capstone measure",
        items: [
          "A row-level security role filters region for the viewer. The East role sees 1,164.",
          "Avg line amount is DIVIDE(SUM(FactSales[amount]), COUNTROWS(FactSales)), 1,883 over 16 lines.",
          "Test with View as role before you share the app.",
        ],
      },
    ],
    capstoneLessons,
  ),
];
