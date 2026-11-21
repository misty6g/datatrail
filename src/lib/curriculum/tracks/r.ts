import { mod } from "../expand";
import type { Module } from "../types";
import { vectorLessons, frameLessons } from "./r-vectors";
import { tidyLessons, ggplotLessons } from "./r-tidy";
import { statsLessons } from "./r-stats";

export const rModules: Module[] = [
  mod(
    "r-vectors",
    "Vectors",
    "Assign with <-, build vectors with c(), do math on every element, and summarise without letting NA turn the result into NaN.",
    [
      {
        title: "Assign",
        items: [
          "answer <- 42 stores a value. This sandbox assigns with <-.",
          "Inside a call, = names an argument: seq(1, 5, by = 1) and na.rm = TRUE.",
        ],
      },
      {
        title: "Build a vector",
        items: [
          "c(1, 2, 3) combines values. nums <- c(1, 2, 3) has length 3.",
          "seq(1, 4) walks a range. seq(1, 5, by = 1) names the step. rep(\"West\", 4) repeats a value.",
          "Gear list prices are c(24, 89, 12): Trail Bottle, Summit Pack, Field Notebook.",
        ],
      },
      {
        title: "Math and summaries",
        items: [
          "c(24, 89, 12) * 0.8 runs on every element. ifelse(prices > 20, prices * 0.8, prices) leaves 12 unchanged.",
          "Comparisons are ==, !=, <, >, <=, >=. Combine them with & and |.",
          "mean, sum, median, min, and max reduce a numeric vector. length counts elements, including NA.",
          "mean(c(80, 40, NA, 30), na.rm = TRUE) is 50. Without na.rm, the mean is NaN.",
        ],
      },
    ],
    vectorLessons,
  ),
  mod(
    "r-frames",
    "Data frames",
    "Northstar tables are data frames. Pull a column with $, mark segment as a factor, and keep the four West customers with filter.",
    [
      {
        title: "Frames and columns",
        items: [
          "data.frame(region = c(\"West\", \"East\", \"Central\"), n_customers = c(4, 3, 2)) matches the customer census.",
          "customers$region is a vector of 9 labels. customers$name, customers$segment, and line_items$amount work the same way.",
          "Twelve orders become 16 line_items because four orders contain two products.",
        ],
      },
      {
        title: "Categories and rows",
        items: [
          "factor(customers$segment) marks Enterprise, Mid-Market, and SMB. This sandbox returns those labels unchanged.",
          "The census is 3 Enterprise, 2 Mid-Market, and 4 SMB.",
          "customers |> filter(region == \"West\") keeps Maya Chen, Amina Diallo, Owen Brooks, and Hannah Berg. %>% pipes the same way.",
          "filter(region = \"West\") names an argument and keeps every customer. The test is ==.",
        ],
      },
    ],
    frameLessons,
  ),
  mod(
    "r-tidy",
    "Tidy verbs",
    "filter, select, mutate, arrange, group_by, and summarise answer revenue questions on line_items. Joins stay conceptual because this sandbox has no join verb.",
    [
      {
        title: "Rows and columns",
        items: [
          "filter(status == \"shipped\") keeps rows. select(name, segment) keeps columns.",
          "mutate(line_amount = quantity * unit_price) adds a column. arrange(desc(line_amount)) sorts numbers high to low.",
          "|> and %>% both pipe the frame into the next verb.",
        ],
      },
      {
        title: "Groups",
        items: [
          "group_by(region) |> summarise(revenue = sum(amount)) is West 452, East 1164, Central 267. The all-status total is 1883.",
          "Name the summary with =. summarise(revenue == sum(amount)) does not create the column.",
          "Shipped revenue by channel is web 1471, retail 120, partner 57, totaling 1648.",
          "This sandbox has no join. In full R, orders left-joins to customers on customer_id. line_items already holds that grain.",
        ],
      },
    ],
    tidyLessons,
  ),
  mod(
    "r-ggplot",
    "ggplot2",
    "Map region and amount with aes, pick a geom, split panels with facet_wrap(region), and keep scales as an axis idea while the sandbox draws the geom.",
    [
      {
        title: "Layers",
        items: [
          "ggplot(line_items, aes(x = region, y = amount)) + geom_col() maps columns, then draws bars.",
          "geom_point() marks each row. geom_line() follows row order. geom_histogram() bins x.",
          "Assign the plot to p and put a bare p on the last line to draw it.",
          "Add panels with + facet_wrap(region). Pass the bare column name.",
        ],
      },
      {
        title: "Scales and series",
        items: [
          "A scale redraws the axis. Full ggplot2 adds one with + scale_y_log10(). This sandbox exercise draws the geom in recorded dollars.",
          "Enterprise mrr is 1200, 1800, 2400, 3100. Filter segment == \"Enterprise\" before geom_line(), because each month also has an SMB row.",
          "Start with ggplot(data, aes(...)), then add the geom with +.",
        ],
      },
    ],
    ggplotLessons,
  ),
  mod(
    "r-stats",
    "Statistics",
    "Contrast the mean and median of the six list prices, measure campaign spend against signups with cor(), and close on shipped revenue by category.",
    [
      {
        title: "Center and association",
        items: [
          "List prices c(24, 89, 12, 49, 499, 19) have mean 115.333 and median 36.5.",
          "An even-length median averages the two middle sorted values. Here those are 24 and 49.",
          "cor(c(1200, 800, 500, 200), c(80, 40, 25, 30)) is 0.887. c(1, 2, 3, 4) with c(2, 4, 6, 8) is exactly 1.",
        ],
      },
      {
        title: "Capstone",
        items: [
          "category_revenue filters line_items to status == \"shipped\", groups by category, and sums amount.",
          "Shipped revenue is Gear 555 and Software 1093. Together they are 1648.",
          "All-status line amount is 1883. The median list price, 36.5, stays next to the category totals so the 499 annual plan is not read as the typical price.",
        ],
      },
    ],
    statsLessons,
  ),
];
