import { mod } from "../expand";
import type { Module } from "../types";
import { basicLessons, collectionLessons } from "./python-basics";
import { functionLessons, tableLessons } from "./python-practice";
import { reshapeLessons, capstoneLessons } from "./python-applied";

export const pythonModules: Module[] = [
  mod(
    "py-basics",
    "Python basics",
    "Store numbers, divide campaign results, format a customer label, and branch on order status.",
    [
      {
        title: "Assignment",
        items: [
          "score = 95 stores the integer 95.",
          "score = score + 5 replaces it with 100.",
          "score and Score are different names.",
        ],
      },
      {
        title: "Types and arithmetic",
        items: [
          "1200 / 80 is the float 15.0.",
          "1200 // 80 is the integer 15.",
          "The four campaigns spent 2700 and recorded 175 signups.",
        ],
      },
      {
        title: "Text and branches",
        items: [
          "f\"{name} is in {region}\" inserts the current values.",
          "if, elif, and else each end with a colon.",
          "Shipped maps to closed, pending maps to open, and else covers refunded and cancelled.",
        ],
      },
    ],
    basicLessons,
  ),
  mod(
    "py-collections",
    "Collections",
    "Keep ordered values, read customer fields, walk the nine customers, and filter them in one expression.",
    [
      {
        title: "Lists",
        items: [
          "cities = [\"Paris\", \"Tokyo\"] keeps order.",
          "cities[0] is Paris and len(cities) is 2.",
        ],
      },
      {
        title: "Dictionaries",
        items: [
          "row[\"region\"] reads a key from a customer dictionary.",
          "row.get(\"plan\", \"none\") returns a default when the key is absent.",
          "The first customer row is Maya Chen in the West.",
        ],
      },
      {
        title: "Loops and comprehensions",
        items: [
          "for row in customers: runs once per customer.",
          "Four West names: Maya Chen, Amina Diallo, Owen Brooks, Hannah Berg.",
          "[row[\"name\"] for row in customers if row[\"segment\"] == \"SMB\"] builds a filtered list.",
        ],
      },
    ],
    collectionLessons,
  ),
  mod(
    "py-functions",
    "Functions",
    "Return a value from a function, sort products with a lambda, and recover when spend arrives as text.",
    [
      {
        title: "def and return",
        items: [
          "def greet(): starts the function.",
          "return \"hi\" makes greet() evaluate to hi.",
        ],
      },
      {
        title: "Sorting",
        items: [
          "sorted(products, key=lambda row: row[\"list_price\"], reverse=True) sorts high to low.",
          "Northstar Annual at 499 comes first. Field Notebook at 12 comes last.",
        ],
      },
      {
        title: "Conversion errors",
        items: [
          "Strip $ and commas, then call float.",
          "except (TypeError, ValueError) can return 0 for a blank cell.",
          "The messy file double-counts Spring Search and totals 3100. Clean campaign spend is 2700.",
        ],
      },
    ],
    functionLessons,
  ),
  mod(
    "py-tables",
    "Tables",
    "The sandbox preloads each table as a list of dictionaries, with column, keep, and total ready to use.",
    [
      {
        title: "column",
        items: [
          "column(line_items, \"amount\") returns 16 amounts.",
          "Those amounts sum to 1883.",
        ],
      },
      {
        title: "keep and total",
        items: [
          "keep(line_items, \"status\", \"shipped\") keeps shipped line items.",
          "That filter has 12 rows, not the 8 shipped orders.",
          "total(shipped, \"amount\") is 1648.",
        ],
      },
      {
        title: "Missing values",
        items: [
          "A missing referred_by is None.",
          "sum(1 for row in customers if row[\"referred_by\"] is None) is 6.",
        ],
      },
    ],
    tableLessons,
  ),
  mod(
    "py-reshape",
    "Reshape",
    "Sum revenue by region, attach a customer name to every order, and bucket order dates by month.",
    [
      {
        title: "Group",
        items: [
          "Add line-item amount into a dictionary keyed by region.",
          "West is 452, East is 1164, and Central is 267.",
        ],
      },
      {
        title: "Join",
        items: [
          "Index customers by customer_id, then walk the 12 orders.",
          "Copy name and region onto a list named labeled.",
        ],
      },
      {
        title: "Months",
        items: [
          "order_date[:7] keeps YYYY-MM from a YYYY-MM-DD string.",
          "The 12 orders cover 7 months, January through July 2025.",
        ],
      },
    ],
    reshapeLessons,
  ),
  mod(
    "py-capstone",
    "Capstone",
    "Check the extreme line-item amount, then report the subscription MRR that is still active.",
    [
      {
        title: "Outliers",
        items: [
          "max(column(line_items, \"amount\")) is 499.",
          "That peak is the Northstar Annual price on two real line items.",
        ],
      },
      {
        title: "Retention",
        items: [
          "keep(subscriptions, \"status\", \"active\") returns the retained plans.",
          "Four active subscriptions total 4300 MRR.",
          "Paused and canceled plans stay out of that total.",
        ],
      },
    ],
    capstoneLessons,
  ),
];
