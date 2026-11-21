import type { Blueprint } from "../expand";

export const tidyLessons: Blueprint[] = [
  {
    id: "r-8",
    title: "Filter and select",
    minutes: 6,
    datasetId: "customers",
    idea: [
      "filter() chooses rows. select() chooses columns and keeps the row order filter left behind. `customers |> filter(region == \"West\") |> select(name, segment)` is a four-row frame with two columns: Maya Chen and Hannah Berg are Enterprise, Amina Diallo is SMB, and Owen Brooks is Mid-Market.",
      "Priya Shah is Enterprise too, and she is East, so this pipeline removes her. Select the columns you intend to read. The other customer columns, region included, drop away once select() runs. Pipe with `|>` or with `%>%`. Both send the current frame into the next verb.",
    ],
    example: {
      language: "r",
      code: `customers |> filter(region == "East") |> select(name)`,
      output: "name\nLuis Ortega\nPriya Shah\nNoah Kim",
    },
    takeaway: "Filter West first, then select name and segment. Four rows remain.",
    question: {
      prompt: 'Which columns remain after customers |> filter(region == "West") |> select(name, segment)?',
      choices: [
        "name, segment, and region",
        "name and segment",
        "Every column customers started with",
        "region only",
      ],
      answer: 1,
      explanation: "select() keeps the columns you name, in that order. region was used to filter and is not one of the kept columns.",
    },
    drill: {
      kind: "order",
      prompt: "Order the steps that produce the West name and segment list.",
      items: [
        "Start from customers",
        "Keep rows where region is West",
        "Keep the name and segment columns",
        "Read the four-row result",
      ],
      answer: [
        "Start from customers",
        "Keep rows where region is West",
        "Keep the name and segment columns",
        "Read the four-row result",
      ],
      explanation: "filter() drops rows first, so select() only has the West accounts left to narrow.",
    },
    practice: {
      id: "r-8-practice",
      kind: "r_sandbox",
      prompt:
        "Assign west_accounts to the West customers, keeping only name and segment. Maya, Amina, Owen, and Hannah should be the four rows.",
      starter: `west_accounts <- customers |>
  select(name, segment)`,
      solutionCode: `west_accounts <- customers |> filter(region == "West") |> select(name, segment)`,
      expectedExpr: `customers |> filter(region == "West") |> select(name, segment)`,
      checkVariable: "west_accounts",
      hint: "Add filter(region == \"West\") before select().",
    },
    reflect: {
      prompt: "Which account in that West result is the SMB row?",
      choices: ["Amina Diallo", "Maya Chen", "Hannah Berg", "Priya Shah"],
      answer: 0,
      explanation: "Amina Diallo is the West SMB account. Maya Chen and Hannah Berg are West Enterprise. Priya Shah is East, so the filter removes her.",
    },
    closer:
      "You narrowed both directions: rows to one region, columns to the two fields a roster needs. Revenue questions need a different frame. line_items already carries customer, region, segment, product, category, status, channel, quantity, and amount.",
  },
  {
    id: "r-9",
    title: "Mutate and arrange",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "mutate() adds a column and keeps every row. On line_items, amount is already quantity times unit_price. Writing `mutate(line_amount = quantity * unit_price)` recomputes that product under a name you choose, which is the check that the stored amount matches the price on the line.",
      "arrange() sorts rows. `arrange(desc(line_amount))` puts large numbers first, and desc() is for numeric columns. The two Northstar Annual lines at 499, both Priya Shah's, lead the list. Sofia Rossi's two Summit Packs are next at 178. select() after the sort can keep just product and line_amount without undoing the order.",
    ],
    example: {
      language: "r",
      code: `products |>
  mutate(promo = round(list_price * 0.8, 2)) |>
  arrange(desc(promo)) |>
  select(product, promo)`,
      output: "product | promo\nNorthstar Annual | 399.2\nSummit Pack | 71.2\nNorthstar Monthly | 39.2\nTrail Bottle | 19.2\nAPI Add-on | 15.2\nField Notebook | 9.6",
    },
    takeaway: "mutate() adds line_amount. arrange(desc(line_amount)) puts the 499 annual lines first.",
    question: {
      prompt: "What does mutate(line_amount = quantity * unit_price) do on line_items?",
      choices: [
        "It replaces the frame with a single number",
        "It drops rows where quantity is 1",
        "It renames amount and deletes quantity",
        "It adds line_amount and keeps every row",
      ],
      answer: 3,
      explanation: "mutate() keeps the existing columns and the 16 lines, and adds line_amount. Dropping rows is filter(). Collapsing to one number is summarise().",
    },
    drill: {
      kind: "tokens",
      prompt: "Choose the verb that adds line_amount and keeps every line.",
      template: ["", "(line_amount = quantity * unit_price)"],
      bank: ["mutate", "summarise", "select", "filter"],
      answer: ["mutate"],
      hint: "This verb adds a column. The name inside the call is bound with =.",
    },
    practice: {
      id: "r-9-practice",
      kind: "r_sandbox",
      prompt:
        "From line_items, add line_amount = quantity * unit_price, sort it largest first with desc(), keep product and line_amount, and assign the frame to ranked.",
      starter: `ranked <- line_items |>
  mutate(line_amount = quantity * unit_price) |>
  arrange(line_amount) |>
  select(product, line_amount)`,
      solutionCode: `ranked <- line_items |> mutate(line_amount = quantity * unit_price) |> arrange(desc(line_amount)) |> select(product, line_amount)`,
      expectedExpr: `line_items |> mutate(line_amount = quantity * unit_price) |> arrange(desc(line_amount)) |> select(product, line_amount)`,
      checkVariable: "ranked",
      hint: "Wrap the sort column in desc() so 499 comes first.",
    },
    reflect: {
      prompt: "arrange(desc(line_amount)) puts which lines first?",
      choices: [
        "Field Notebook, because the product name sorts first",
        "Priya Shah's two Northstar Annual lines at 499",
        "The refunded Northstar Monthly line, because refunds lead the table",
        "One averaged row for the whole catalog",
      ],
      answer: 1,
      explanation: "499 is the largest line amount, and both of those lines are Northstar Annual orders for Priya Shah. Status does not decide the sort. The product name does not either.",
    },
    closer:
      "The sort is a ranking of lines, not a total. The two annuals lead, then Sofia's Summit Pack at 178. A pricing read still has to sum. That is the next verb, and it will add amount by region rather than list every line.",
  },
  {
    id: "r-10",
    title: "Group and summarise",
    minutes: 7,
    datasetId: "line_items",
    idea: [
      "line_items has 16 rows from 12 orders. Four orders bought two products, so a customer or region total has to sum amount. You cannot count orders and call it revenue. group_by(region) marks the buckets. summarise(revenue = sum(amount)) collapses each bucket to one row.",
      "The three rows are West 452, East 1164, and Central 267. They add to 1883, which is sum(line_items$amount) across every status: shipped, refunded, pending, and cancelled. The `=` inside summarise names the new column. group_by() without a later summarise leaves the original 16 lines tagged, not reduced.",
    ],
    example: {
      language: "r",
      code: `region_revenue <- line_items |>
  group_by(region) |>
  summarise(revenue = sum(amount))
region_revenue`,
      output: "region | revenue\nWest | 452\nEast | 1164\nCentral | 267",
    },
    takeaway: "group_by(region) |> summarise(revenue = sum(amount)) is West 452, East 1164, Central 267.",
    question: {
      prompt: "How many rows does line_items |> group_by(region) |> summarise(revenue = sum(amount)) return?",
      choices: [
        "16, one per line",
        "1, the grand total only",
        "3, one per region",
        "9, one per customer",
      ],
      answer: 2,
      explanation: "There are three regions in the lines, so the summary has three rows. The 16-line detail is still in line_items. The grand total 1883 is what you get if you summarise without group_by.",
    },
    drill: {
      kind: "fill",
      prompt: "Fill the verb that collapses each region to one revenue row.",
      codeTemplate: "line_items |> group_by(region) |> ____(revenue = sum(amount))",
      answer: ["summarise", "summarize"],
      hint: "This lesson uses the British spelling. The American spelling also runs here.",
    },
    practice: {
      id: "r-10-practice",
      kind: "r_sandbox",
      prompt:
        "Split line_items by region and assign region_revenue to one row per region, with revenue equal to the sum of amount. Include every status.",
      starter: `region_revenue <- line_items |>
  summarise(revenue = sum(amount))`,
      solutionCode: `region_revenue <- line_items |> group_by(region) |> summarise(revenue = sum(amount))`,
      expectedExpr: `line_items |> group_by(region) |> summarise(revenue = sum(amount))`,
      checkVariable: "region_revenue",
      hint: "Put group_by(region) in the pipe before summarise().",
    },
    reflect: {
      prompt: "The sum of line_items$amount is 1883. Which rows sit inside that total?",
      choices: [
        "Every status: shipped, refunded, pending, and cancelled",
        "Shipped lines only",
        "West lines only",
        "Software lines only",
      ],
      answer: 0,
      explanation: "1883 adds all 16 lines. Shipped revenue is a smaller total you will compute by filtering status first. West alone is 452. Software alone is not the whole book.",
    },
    closer:
      "East carries 1164 of the 1883, West 452, Central 267. That split still mixes shipped lines with refunded, pending, and cancelled ones. The next summary cuts to shipped before it groups.",
  },
  {
    id: "r-11",
    title: "A second grouped summary",
    minutes: 7,
    datasetId: "line_items",
    idea: [
      "orders has customer_id, order_date, status, and channel. It does not have region or amount. In full R you would left-join customers onto orders by customer_id, then join order_items and products, and only then group. This sandbox has no join verb. line_items is that joined grain already: 16 lines with customer, region, product, category, status, channel, and amount.",
      "A second summary asks a narrower question than the regional total. Keep status == \"shipped\", group by channel, and sum amount. Shipped revenue is web 1471, retail 120, and partner 57, which adds to 1648. The `=` in summarise(revenue = sum(amount)) names the column. summarise(revenue == sum(amount)) compares instead, and the revenue column never appears.",
    ],
    example: {
      language: "r",
      code: `line_items |>
  filter(status == "shipped") |>
  group_by(channel) |>
  summarise(revenue = sum(amount))`,
      output: "channel | revenue\nweb | 1471\nretail | 120\npartner | 57",
    },
    takeaway: "Shipped revenue by channel is web 1471, retail 120, and partner 57. The join already lives inside line_items.",
    question: {
      prompt: "orders has customer_id and no region column. In full R, how do you attach each customer's region?",
      codeContext: 'orders |> left_join(customers, by = "customer_id")',
      choices: [
        "Filter orders with region == \"West\", even though orders has no region column",
        "Left-join customers onto orders by customer_id",
        "Divide length(customers$region) by the number of orders",
        "Group orders by amount",
      ],
      answer: 1,
      explanation: "A left join keeps every order and adds the customer columns that share customer_id, including region. This sandbox cannot run that join. line_items already contains the attached fields.",
    },
    drill: {
      kind: "bug",
      prompt: "The shipped-by-channel summary never creates a revenue column. Select the broken line and the fix.",
      lines: [
        "shipped_by_channel <- line_items |>",
        'filter(status == "shipped") |>',
        "group_by(channel) |>",
        "summarise(revenue == sum(amount))",
      ],
      buggyLine: 3,
      fixChoices: [
        "summarise(revenue = sum(amount))",
        "summarise(revenue == sum(amount))",
        "mutate(revenue == sum(amount))",
        "group_by(revenue == sum(amount))",
      ],
      fixAnswer: 0,
      explanation: "== compares two sides and does not name a column. summarise(revenue = sum(amount)) creates revenue. The broken version returns channel only.",
    },
    practice: {
      id: "r-11-practice",
      kind: "r_sandbox",
      prompt:
        "Assign shipped_by_channel to shipped lines only, grouped by channel, with revenue = sum(amount). Leave refunded, pending, and cancelled lines out.",
      starter: `shipped_by_channel <- line_items |>
  group_by(channel) |>
  summarise(revenue = sum(amount))`,
      solutionCode: `shipped_by_channel <- line_items |> filter(status == "shipped") |> group_by(channel) |> summarise(revenue = sum(amount))`,
      expectedExpr: `line_items |> filter(status == "shipped") |> group_by(channel) |> summarise(revenue = sum(amount))`,
      checkVariable: "shipped_by_channel",
      hint: "Filter status == \"shipped\" before group_by(channel).",
    },
    reflect: {
      prompt: "This sandbox cannot join. Why can you still sum shipped revenue by channel?",
      choices: [
        "summarise() quietly opens every table that shares a column name",
        "channel is stored only on campaigns, so the sum is campaign spend",
        "group_by() invents channel from the row number",
        "line_items already carries status, channel, and amount on each of the 16 lines",
      ],
      answer: 3,
      explanation: "The join work is already baked into line_items. filter and summarise run on that flat frame. Campaign spend is a different table and a different question.",
    },
    closer:
      "Web is 1471 of the 1648 shipped. Retail is 120 and partner is 57. The all-status regional total was 1883. The gap is refunded, pending, and cancelled amount, and it should stay out of a shipped read.",
  },
];

export const ggplotLessons: Blueprint[] = [
  {
    id: "r-12",
    title: "Aesthetics",
    minutes: 6,
    datasetId: "line_items",
    idea: [
      "ggplot starts with a frame and an aesthetic map. `aes(x = region, y = amount)` says the horizontal position is region and the vertical position is amount. The names x and y are arguments, so they use `=`. The column names are bare: region, not a quoted string and not customers$region inside aes().",
      "geom_col() then draws one bar per region and stacks the line amounts. You already summarised those totals: West 452, East 1164, Central 267, summing to 1883. The chart includes every status. Assign the plot with `<-` to p. A bare p on the last line draws it.",
    ],
    example: {
      language: "r",
      code: `ggplot(line_items, aes(x = region, y = amount)) + geom_col()`,
      output: "col chart",
    },
    takeaway: "aes(x = region, y = amount) maps columns. geom_col() turns that map into regional bars.",
    question: {
      prompt: "What does aes(x = region, y = amount) tell geom_col?",
      choices: [
        "Put region on the horizontal axis and amount on the bar height",
        "Keep only one region",
        "Color the bars by segment",
        "Replace amount with its median",
      ],
      answer: 0,
      explanation: "aes() maps columns to positions. It does not filter. Color would be another mapping, color = segment, and this chart does not set one.",
    },
    drill: {
      kind: "tokens",
      prompt: "Fill the aesthetic map for region on x and amount on y.",
      template: ["ggplot(line_items, ", "", ") + geom_col()"],
      bank: ["aes(x = region, y = amount)", "aes(region, amount)", "filter(region)", "geom_point()"],
      answer: ["aes(x = region, y = amount)"],
      hint: "Name x and y with =. This sandbox reads those names.",
    },
    practice: {
      id: "r-12-practice",
      kind: "r_sandbox",
      prompt:
        "Draw a column chart of line_items with region on x and amount on y. Assign it to p, and leave a bare p on the last line so the chart renders. Use geom_col().",
      starter: `p <- ggplot(line_items, aes(x = region, y = amount)) + geom_point()
p`,
      solutionCode: `p <- ggplot(line_items, aes(x = region, y = amount)) + geom_col()
p`,
      expectedExpr: `ggplot(line_items, aes(x = region, y = amount)) + geom_col()`,
      checkVariable: "p",
      hint: "Swap geom_point() for geom_col(). Keep the aes() map.",
    },
    reflect: {
      prompt: "On that column chart of amount by region, which bar is tallest?",
      choices: ["West at 452", "Central at 267", "East at 1164", "A National bar that is not in the table"],
      answer: 2,
      explanation: "East's lines sum to 1164, West to 452, and Central to 267. The chart stacks every status into those three bars.",
    },
    closer:
      "The East bar is tall because Priya Shah's annual plans sit in that region, along with the rest of the East lines. The chart is the picture of the 452 / 1164 / 267 summary. It still mixes statuses. A shipped decision filters before it plots.",
  },
  {
    id: "r-13",
    title: "Geoms",
    minutes: 6,
    datasetId: "products",
    idea: [
      "The geom is the mark. geom_col() draws bars from zero and stacks rows that share an x value, which is why region bars summed amount. geom_point() places one point per row at its x and y. geom_line() connects rows in their current order. geom_histogram() bins a single x and counts the rows, so it does not need a y mapping.",
      "products has six rows, one per catalog item, and list_price is already one price per product. A point at each product shows Trail Bottle 24, Summit Pack 89, Field Notebook 12, Northstar Monthly 49, Northstar Annual 499, and API Add-on 19 without stacking. Bars would also reach those heights here, because each product appears once. The point is the mark this lesson asks for.",
    ],
    example: {
      language: "r",
      code: `ggplot(products, aes(x = product, y = list_price)) + geom_point()`,
      output: "point chart",
    },
    takeaway: "geom_point() marks each product at its list price. Six products, six points.",
    question: {
      prompt: "You want one mark per product at that product's list price. Which layer is the mark?",
      choices: ["geom_histogram", "geom_point", "geom_line", "facet_wrap"],
      answer: 1,
      explanation: "geom_point() draws one point per row. A histogram bins x and drops the price scale. A line connects rows. facet_wrap splits panels. It is not a mark.",
    },
    drill: {
      kind: "order",
      prompt: "Order the pieces of the list-price point chart.",
      items: [
        "Pass products into ggplot",
        "Map product to x and list_price to y",
        "Add geom_point",
        "Assign the plot to p",
      ],
      answer: [
        "Pass products into ggplot",
        "Map product to x and list_price to y",
        "Add geom_point",
        "Assign the plot to p",
      ],
      explanation: "The frame comes first, then aes() names the columns, then the geom decides the mark. The arrow stores the finished plot.",
    },
    practice: {
      id: "r-13-practice",
      kind: "r_sandbox",
      prompt:
        "Draw a point for each row in products, with product on x and list_price on y. Assign the plot to p and end with a bare p. Use geom_point().",
      starter: `p <- ggplot(products, aes(x = product, y = list_price)) + geom_col()
p`,
      solutionCode: `p <- ggplot(products, aes(x = product, y = list_price)) + geom_point()
p`,
      expectedExpr: `ggplot(products, aes(x = product, y = list_price)) + geom_point()`,
      checkVariable: "p",
      hint: "Replace geom_col() with geom_point().",
    },
    reflect: {
      prompt: "products has 6 rows and the point chart maps each row. How many points should you see?",
      choices: ["6", "1", "16", "3"],
      answer: 0,
      explanation: "One row per product means one point per product. 16 is the line_items grain. 3 is the number of regions. The chart is not a single collapsed average.",
    },
    closer:
      "The point at 499 is Northstar Annual, far from Field Notebook at 12. That gap is the catalog, not shipped revenue. geom_col on regions summed lines. geom_point on products shows the price list itself.",
  },
  {
    id: "r-14",
    title: "Facets",
    minutes: 7,
    datasetId: "line_items",
    idea: [
      "A facet splits one chart into panels. `+ facet_wrap(region)` uses the bare column name. This sandbox does not take a formula such as ~ region. Add the facet with + after the geom, the same way you add the geom to ggplot().",
      "Bars of amount by category, faceted by region, use every status. West is Gear 365 and Software 87. East is Gear 60 and Software 1104. Central is Gear 267 and no Software lines at all. One regional bar chart hides that Central never bought software, and that East's height is almost all Software.",
    ],
    example: {
      language: "r",
      code: `ggplot(line_items, aes(x = category, y = amount)) + geom_col() + facet_wrap(region)`,
      output: "col chart",
    },
    takeaway: "Add panels with + facet_wrap(region). The argument is the bare column name.",
    question: {
      prompt: "Which facet layer does this sandbox understand?",
      codeContext: "ggplot(line_items, aes(x = category, y = amount)) + geom_col() + ____",
      choices: [
        "+ facet_wrap(~ region)",
        "+ facet(region ~ category)",
        'facet_wrap("region") written before ggplot()',
        "+ facet_wrap(region)",
      ],
      answer: 3,
      explanation: "facet_wrap takes the bare name region and is added with + after the geom. A formula, a two-sided facet, or a quoted string before ggplot() is not the layer this sandbox reads.",
    },
    drill: {
      kind: "fill",
      prompt: "Fill the layer that makes one panel per region.",
      codeTemplate: "ggplot(line_items, aes(x = category, y = amount)) + geom_col() + ____(region)",
      answer: ["facet_wrap"],
      hint: "Two words joined by an underscore. Pass the bare name region.",
    },
    practice: {
      id: "r-14-practice",
      kind: "r_sandbox",
      prompt:
        "Column-chart line_items with category on x and amount on y, then add one panel per region with facet_wrap(region). Assign the plot to p and end with a bare p.",
      starter: `p <- ggplot(line_items, aes(x = category, y = amount)) + geom_point()
p`,
      solutionCode: `p <- ggplot(line_items, aes(x = category, y = amount)) + geom_col() + facet_wrap(region)
p`,
      expectedExpr: `ggplot(line_items, aes(x = category, y = amount)) + geom_col() + facet_wrap(region)`,
      checkVariable: "p",
      hint: "Use geom_col(), then + facet_wrap(region) with the bare name.",
    },
    reflect: {
      prompt: "What does faceting category by region show that a single region chart hides?",
      choices: [
        "The correlation of campaign spend and signups",
        "Central bought only Gear, while East's amount is mostly Software",
        "The median list price of the six products",
        "Which customers were referred by Maya Chen",
      ],
      answer: 1,
      explanation: "Central's panel is Gear only: Jonah Park and Sofia Rossi. East's panel is dominated by Software, including Priya Shah's annual plans. The single East bar of 1164 does not say that.",
    },
    closer:
      "Those panels still include refunded, pending, and cancelled lines. West's Software slice of 87 contains Maya's refunded monthly plan. Read the panels as composition, then filter to shipped before you call it revenue.",
  },
  {
    id: "r-15",
    title: "Scales",
    minutes: 6,
    datasetId: "monthly_mrr",
    idea: [
      "A scale controls how a mapped number becomes a position on the axis. monthly_mrr records Enterprise and SMB on each month. Enterprise mrr steps 1200, 1800, 2400, then 3100. In full ggplot2 a log scale is another layer, `+ scale_y_log10()`, and the stored dollars stay the same. This sandbox does not implement that layer, so leave it out of the code you run. Draw geom_line() on the recorded dollars.",
      "Each month has two rows, one per segment. geom_line() connects rows in order, so leave SMB out with filter(segment == \"Enterprise\") before the line. The series you want is those four Enterprise points. geom_line() is the mark. The scale conversation stays on the axis. It does not replace the geom.",
    ],
    example: {
      language: "r",
      code: `ggplot(monthly_mrr |> filter(segment == "Enterprise"), aes(x = month, y = mrr)) + geom_line()`,
      output: "line chart",
    },
    takeaway: "A scale redraws the axis. This chart is geom_line() on Enterprise mrr: 1200, 1800, 2400, 3100.",
    question: {
      prompt: "What is a y scale doing for the Enterprise mrr line in full ggplot2?",
      choices: [
        "It drops the SMB rows",
        "It turns the line into columns",
        "It redraws the axis while mrr stays 1200, 1800, 2400, then 3100",
        "It computes the correlation of month and mrr",
      ],
      answer: 2,
      explanation: "The scale changes the guide, not the stored mrr. Filtering is what removes SMB. The geom is still geom_line(). Correlation is cor(), a different tool.",
    },
    drill: {
      kind: "bug",
      prompt: "This Enterprise line is built in an order the sandbox rejects. Select the broken line and the fix.",
      lines: [
        "p <- geom_line() +",
        'ggplot(monthly_mrr |> filter(segment == "Enterprise"), aes(x = month, y = mrr))',
      ],
      buggyLine: 0,
      fixChoices: [
        'p <- ggplot(monthly_mrr |> filter(segment == "Enterprise"), aes(x = month, y = mrr)) + geom_line()',
        "p <- geom_line(monthly_mrr) + ggplot()",
        "p <- aes(x = month, y = mrr) + geom_line()",
        "p <- ggplot + geom_line(monthly_mrr)",
      ],
      fixAnswer: 0,
      explanation: "Start with ggplot(data, aes(...)), then add geom_line() with +. A geom on its own has no frame and no map.",
    },
    practice: {
      id: "r-15-practice",
      kind: "r_sandbox",
      prompt:
        "Filter monthly_mrr to segment Enterprise, map month to x and mrr to y, and draw geom_line(). Assign the plot to p and end with a bare p. Leave the dollars as recorded.",
      starter: `p <- ggplot(monthly_mrr |> filter(segment == "Enterprise"), aes(x = month, y = mrr)) + geom_col()
p`,
      solutionCode: `p <- ggplot(monthly_mrr |> filter(segment == "Enterprise"), aes(x = month, y = mrr)) + geom_line()
p`,
      expectedExpr: `ggplot(monthly_mrr |> filter(segment == "Enterprise"), aes(x = month, y = mrr)) + geom_line()`,
      checkVariable: "p",
      hint: "Replace geom_col() with geom_line(). Keep the Enterprise filter.",
    },
    reflect: {
      prompt: "Why filter monthly_mrr to Enterprise before geom_line?",
      choices: [
        "Each month has an Enterprise row and an SMB row, and this line should follow one series",
        "The filter is what sets a log scale",
        "geom_line() accepts only a one-row frame",
        "SMB mrr is stored as NA",
      ],
      answer: 0,
      explanation: "SMB is present and numeric: 200, 350, 420, 510. Leaving both segments in the frame makes one line jump between them. The filter keeps the Enterprise path.",
    },
    closer:
      "Enterprise recurring revenue in this extract climbs from 1200 to 3100. That is a time series, not the shipped product revenue on line_items. Scales would change the spacing of those four points. The values you plotted are still 1200, 1800, 2400, and 3100.",
  },
];
