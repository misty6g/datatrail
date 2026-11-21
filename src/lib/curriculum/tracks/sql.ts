import { mod } from "../expand";
import type { Module } from "../types";
import { foundations, aggregates } from "./sql-foundations";
import { joins, queries } from "./sql-joins";
import { windows, capstone } from "./sql-windows";

export const sqlModules: Module[] = [
  mod("sql-foundations", "Relational foundations", "Read Northstar tables, choose columns, filter rows, and list distinct regions.", [
    { title: "Shapes", items: ["customers: 9 rows, regions Central, East, West", "orders: 12 rows, 8 of them shipped", "line_items.amount = quantity * unit_price"] },
    { title: "Clauses", items: ["SELECT chooses columns", "WHERE filters rows before grouping", "DISTINCT then ORDER BY for a stable list"] },
  ], foundations),
  mod("sql-aggregates", "Aggregates and labels", "Count rows, group by a dimension, keep groups with HAVING, and label segments with CASE.", [
    { title: "Counts", items: ["COUNT(*) counts rows, including nulls", "COUNT(column) skips nulls", "6 customers have a null referred_by"] },
    { title: "Groups", items: ["West 4, East 3, Central 2 customers", "Line revenue: East 1164, West 452, Central 267", "HAVING filters after SUM"] },
  ], aggregates),
  mod("sql-joins", "Joins and gaps", "Match orders to customers, find accounts with no subscription, and follow referrals.", [
    { title: "Keys", items: ["orders.customer_id = customers.customer_id", "LEFT JOIN plus IS NULL finds Jonah, Sofia, and Noah", "referred_by stores a name, so the self join matches referrer.name"] },
  ], joins),
  mod("sql-queries", "Subqueries and CTEs", "Filter with IN, test existence, and name the shipped set before aggregating it.", [
    { title: "Patterns", items: ["Active subscribers: Maya, Luis, Priya, Hannah", "Pending orders belong to Jonah and Hannah", "Shipped channel revenue: web 1471, retail 120, partner 57"] },
  ], queries),
  mod("sql-windows", "Window functions", "Keep detail rows while you attach a grand total, a rank, or last period's MRR.", [
    { title: "Windows", items: ["OVER () sees the whole result", "PARTITION BY restarts ROW_NUMBER", "LAG(mrr) is null on the first month of each segment"] },
  ], windows),
  mod("sql-capstone", "Writes and the revenue capstone", "Prove an UPDATE by reading the row back, then ship the segment revenue query.", [
    { title: "Capstone", items: ["Subscription 5 is Owen's 400 MRR Growth plan", "Shipped revenue excludes pending, refunded, and cancelled", "Group by segment and sort revenue descending"] },
  ], capstone),
];
