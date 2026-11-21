import type { Blueprint } from "../expand";

export const vectorLessons: Blueprint[] = [
  {
    id: "r-1",
    title: "Assign with <-",
    minutes: 4,
    idea: [
      "The R sandbox stores a result by pointing a name at it. `answer <- 42` means the name answer now holds the number 42. Counts of West customers, revenue frames, and plots later in the track all hang on that same arrow.",
      "The equals sign shows up inside calls, where it names an argument: `seq(1, 5, by = 1)`. It does not assign a variable here. When you want a name you can reuse, write `<-`.",
    ],
    example: {
      language: "r",
      code: `answer <- 42
answer`,
      output: "42",
    },
    takeaway: "Assign with <- so the name answer holds 42.",
    question: {
      prompt: "After answer <- 42, what does the name answer hold?",
      codeContext: "answer <- 42",
      choices: [
        "A TRUE or FALSE comparison",
        "The number 42",
        "All 9 rows of customers",
        "A missing value, NA",
      ],
      answer: 1,
      explanation: "The arrow stores the right-hand side. answer is the number 42, and the next line can use that name.",
    },
    drill: {
      kind: "tokens",
      prompt: "Assemble the assignment that stores 42.",
      template: ["answer", "", "42"],
      bank: ["<-", "=", "==", "->"],
      answer: ["<-"],
      hint: "The arrow points from the value to the name on its left.",
    },
    practice: {
      id: "r-1-practice",
      kind: "r_sandbox",
      prompt: "Assign 42 to a variable named answer using <-.",
      starter: "answer <- 0",
      solutionCode: "answer <- 42",
      expectedExpr: "42",
      checkVariable: "answer",
      hint: "Replace 0 with 42 and keep the left arrow.",
    },
    reflect: {
      prompt: "In seq(1, 5, by = 1), what does the equals sign do?",
      choices: [
        "It assigns 1 to a variable named by",
        "It keeps rows where a column equals 1",
        "It names the by argument of seq",
        "It tests whether by is equal to 1",
      ],
      answer: 2,
      explanation: "Inside a call, = binds an argument name. seq steps from 1 to 5 one unit at a time. Storing answer still uses <-.",
    },
    closer:
      "You have a name for a result. Every Northstar summary in this track is that same habit: compute something, point a name at it with <-, and reuse the name.",
  },
  {
    id: "r-2",
    title: "Vectors with c()",
    minutes: 5,
    datasetId: "products",
    idea: [
      "A vector is an ordered list of one kind of value, and it is the object behind every column. `nums <- c(1, 2, 3)` stores three numbers under one name. `c()` is the function that combines them.",
      "The same idea builds real Northstar lists. Trail Bottle, Summit Pack, and Field Notebook list at 24, 89, and 12, so `c(24, 89, 12)` is those three Gear prices. `seq(1, 4)` walks a range, and `rep(\"West\", 4)` repeats a label. `customers$region` is this kind of vector with one entry for each of the 9 customers.",
    ],
    example: {
      language: "r",
      code: `nums <- c(1, 2, 3)
gear_prices <- c(24, 89, 12)
gear_prices`,
      output: "24, 89, 12",
    },
    takeaway: "c() builds a vector. nums <- c(1, 2, 3) has length 3.",
    question: {
      prompt: "What is nums after nums <- c(1, 2, 3)?",
      choices: [
        "A numeric vector of length 3",
        "Three separate variables named 1, 2, and 3",
        "A data frame with a single row",
        "The single number 6, the sum of the values",
      ],
      answer: 0,
      explanation: "c() keeps the values in order under one name. The length is 3. The sum would be a later step, with sum().",
    },
    drill: {
      kind: "fill",
      prompt: "Fill the function that combines 1, 2, and 3 into a vector.",
      codeTemplate: "nums <- ____(1, 2, 3)",
      answer: ["c"],
      hint: "The combine function is a single letter.",
    },
    practice: {
      id: "r-2-practice",
      kind: "r_sandbox",
      prompt: "Create a numeric vector named nums that holds 1, then 2, then 3.",
      starter: "nums <- c(1, 2)",
      solutionCode: "nums <- c(1, 2, 3)",
      expectedExpr: "c(1, 2, 3)",
      checkVariable: "nums",
      hint: "Pass all three numbers to c(), in order.",
    },
    reflect: {
      prompt: "customers$region is a vector with one label per customer. How long is it?",
      choices: [
        "3, because only the distinct names West, East, and Central are stored",
        "4, because only the West customers are stored",
        "12, one label for every order",
        "9, one region label for every customer",
      ],
      answer: 3,
      explanation: "There are 9 customers, so the region column has 9 entries. West, East, and Central repeat. Distinct names are a summary you have not taken yet.",
    },
    closer:
      "nums is a toy vector of length 3. The tables you are about to open are the same shape at business size: products$list_price has the six catalog prices, and line_items$amount has one amount for each of the 16 lines.",
  },
  {
    id: "r-4",
    title: "Vectorized math",
    minutes: 6,
    datasetId: "products",
    idea: [
      "Math on a vector runs once per element. `c(24, 89, 12) * 0.8` is the Gear list prices at 20% off: Trail Bottle 19.2, Summit Pack 71.2, and Field Notebook 9.6. A length-1 number recycles across the longer vector.",
      "ifelse() picks a result per element. `ifelse(prices > 20, prices * 0.8, prices)` discounts only prices above 20. The notebook stays 12 because its condition is FALSE. round(prices * 0.8, 2) is available when you want a fixed number of decimals. Comparisons use ==, !=, <, >, <=, and >=, and you can combine them with & and |.",
    ],
    example: {
      language: "r",
      code: `prices <- c(24, 89, 12)
ifelse(prices > 20, prices * 0.8, prices)`,
      output: "19.2, 71.2, 12",
    },
    takeaway: "Arithmetic and ifelse() run element by element. The 12 notebook stays 12 when the cutoff is 20.",
    question: {
      prompt: "What does c(24, 89, 12) * 0.8 return?",
      codeContext: "c(24, 89, 12) * 0.8",
      choices: [
        "The single number 100, which is the sum of the three products",
        "The vector 19.2, 71.2, 9.6",
        "Only 19.2, because a shorter number cannot line up with three prices",
        "NA, because 0.8 and the price vector have different lengths",
      ],
      answer: 1,
      explanation: "Each price is multiplied by 0.8. The notebook becomes 9.6 in this plain product. The sum of those three results is 100, and that sum is a separate step.",
    },
    drill: {
      kind: "order",
      prompt: "Order the steps that discount Gear prices above 20 and leave the notebook alone.",
      items: [
        "Combine 24, 89, and 12 with c()",
        "Test each price against 20",
        "Multiply the TRUE positions by 0.8",
        "Keep 12 where the test is FALSE",
      ],
      answer: [
        "Combine 24, 89, and 12 with c()",
        "Test each price against 20",
        "Multiply the TRUE positions by 0.8",
        "Keep 12 where the test is FALSE",
      ],
      explanation: "ifelse() tests every element, then chooses the discounted price or the original price for that same position.",
    },
    practice: {
      id: "r-4-practice",
      kind: "r_sandbox",
      prompt:
        "Gear list prices are 24, 89, and 12 for Trail Bottle, Summit Pack, and Field Notebook. Assign them to prices. Assign discounted with ifelse so prices above 20 become price * 0.8 and the notebook stays 12.",
      starter: `prices <- c(24, 89, 12)
discounted <- prices`,
      solutionCode: `prices <- c(24, 89, 12)
discounted <- ifelse(prices > 20, prices * 0.8, prices)`,
      expectedExpr: "ifelse(c(24, 89, 12) > 20, c(24, 89, 12) * 0.8, c(24, 89, 12))",
      checkVariable: "discounted",
      hint: "ifelse needs the test, the value when it is TRUE, and the value when it is FALSE.",
    },
    reflect: {
      prompt: "Field Notebook lists at 12. In ifelse(prices > 20, prices * 0.8, prices), what happens to that 12?",
      choices: [
        "It becomes 9.6",
        "It becomes NA because the condition is FALSE",
        "It stays 12",
        "It is dropped, leaving a vector of length 2",
      ],
      answer: 2,
      explanation: "The condition is FALSE at the notebook, so ifelse returns the original price there. The bottle becomes 19.2 and the pack becomes 71.2.",
    },
    closer:
      "That discount is a what-if on the catalog, not a change to orders already taken. The capstone reads shipped revenue by category on the recorded lines. Hold both numbers apart: a hypothetical list price, and cash already shipped.",
  },
  {
    id: "r-3",
    title: "Summaries and NA",
    minutes: 6,
    idea: [
      "mean(), sum(), median(), min(), and max() collapse a numeric vector to one number. A scratch four-week export is `c(80, 40, NA, 30)`: Spring Search, Spring Social, a week whose file never landed, and Summer Email. The campaigns table is a different object, and it is complete. Partner Webinar there is 25 signups.",
      "NA is a missing measurement. mean() of a vector that contains NA is NaN until you pass na.rm = TRUE, which drops the missing element and averages the three known weeks: (80 + 40 + 30) / 3 = 50. sum() with the same argument is 150. length() still counts the gap, so the vector stays length 4. Typing 0 would claim a real week with nobody signed up.",
    ],
    example: {
      language: "r",
      code: `signups <- c(80, 40, NA, 30)
sum(signups, na.rm = TRUE)`,
      output: "150",
    },
    takeaway: "Pass na.rm = TRUE or one missing signup turns the mean into NaN. The three known weeks average to 50.",
    question: {
      prompt: "For c(80, 40, NA, 30), what is mean(signups, na.rm = TRUE)?",
      codeContext: "mean(c(80, 40, NA, 30), na.rm = TRUE)",
      choices: [
        "50, the mean of the three known reports",
        "NA, because any missing value blocks the mean",
        "37.5, from treating the gap as zero and dividing by 4",
        "150, the sum of the known signups",
      ],
      answer: 0,
      explanation: "na.rm = TRUE drops the NA, then divides 150 by 3. Dividing by 4 would treat the gap as a real zero. The sum itself is 150, which is the example, not the mean.",
    },
    drill: {
      kind: "bug",
      prompt: "This average of the scratch signup export is wrong. Select the broken line and the fix.",
      lines: ["signups <- c(80, 40, NA, 30)", "avg_signups <- mean(signups)", "avg_signups"],
      buggyLine: 1,
      fixChoices: [
        "avg_signups <- mean(signups, na.rm = TRUE)",
        "avg_signups <- sum(signups)",
        "avg_signups <- length(signups)",
        "avg_signups <- mean(signups, na.rm = FALSE)",
      ],
      fixAnswer: 0,
      explanation: "Without na.rm = TRUE the missing week makes the mean NaN. The fix drops NA and averages 80, 40, and 30.",
    },
    practice: {
      id: "r-3-practice",
      kind: "r_sandbox",
      prompt:
        "The scratch export is c(80, 40, NA, 30). Assign it to signups, then assign avg_signups to the mean with the missing week removed.",
      starter: `signups <- c(80, 40, NA, 30)
avg_signups <- mean(signups)`,
      solutionCode: `signups <- c(80, 40, NA, 30)
avg_signups <- mean(signups, na.rm = TRUE)`,
      expectedExpr: "mean(c(80, 40, NA, 30), na.rm = TRUE)",
      checkVariable: "avg_signups",
      hint: "Add na.rm = TRUE inside mean(). TRUE must be the uppercase token.",
    },
    reflect: {
      prompt: "The third element is NA because that week's export never landed. What changes if you type 0 there instead?",
      choices: [
        "mean() will refuse to run",
        "The average will treat a missing export as a real week with no signups",
        "length() will skip that element",
        "cor() has to run before mean() can run",
      ],
      answer: 1,
      explanation: "0 is a measured zero and it stays inside the average. NA plus na.rm = TRUE leaves that week out. length() still counts the NA, so the vector length remains 4.",
    },
    closer:
      "You averaged the weeks you actually have. Partner Webinar in the campaigns table is a recorded 25, not this scratch NA. When a Northstar extract contains NA, decide whether the gap should leave the summary or stay visible as missing.",
  },
];

export const frameLessons: Blueprint[] = [
  {
    id: "r-5",
    title: "data.frame and $",
    minutes: 6,
    datasetId: "customers",
    idea: [
      "A data frame is columns of equal length, one row per thing. The customers frame already has 9 rows and the columns customer_id, name, region, segment, joined_on, and referred_by. `$` pulls one column out as a vector: `customers$region` is 9 labels, and `customers$name` is the 9 names.",
      "You can build a small frame for a result you want to keep. West has 4 customers, East 3, and Central 2. `data.frame(region = c(\"West\", \"East\", \"Central\"), n_customers = c(4, 3, 2))` stores that tally. `snapshot$n_customers` is the numeric column. Twelve orders become 16 line_items because four of those orders contain two products. A frame is the right home for that wider grain.",
    ],
    example: {
      language: "r",
      code: `snapshot <- data.frame(region = c("West", "East"), n_customers = c(4, 3))
snapshot$n_customers`,
      output: "4, 3",
    },
    takeaway: "data.frame() builds columns, and $ extracts one of them as a vector.",
    question: {
      prompt: "What does customers$region give you?",
      choices: [
        "A one-column data frame",
        "The distinct regions West, East, and Central, each stored once",
        "A character vector with one label for each of the 9 customers",
        "The number 9",
      ],
      answer: 2,
      explanation: "The dollar operator returns the column as a vector. Nine customers produce nine labels, with West, East, and Central repeated.",
    },
    drill: {
      kind: "tokens",
      prompt: "Pull the region column off customers.",
      template: ["customers", "", "region"],
      bank: ["$", "%>%", "@", "&"],
      answer: ["$"],
      hint: "The dollar sits between the frame and the column name.",
    },
    practice: {
      id: "r-5-practice",
      kind: "r_sandbox",
      prompt:
        "Build snapshot with data.frame: region West, East, Central and n_customers 4, 3, 2. Assign answer to the n_customers column using $.",
      starter: `snapshot <- data.frame(region = c("West", "East", "Central"), n_customers = c(4, 3, 2))
answer <- snapshot$region`,
      solutionCode: `snapshot <- data.frame(region = c("West", "East", "Central"), n_customers = c(4, 3, 2))
answer <- snapshot$n_customers`,
      expectedExpr: "c(4, 3, 2)",
      checkVariable: "answer",
      hint: "The numeric column is n_customers, not region.",
    },
    reflect: {
      prompt: "snapshot$n_customers is 4, 3, 2 for West, East, and Central. What does that match in the warehouse tables?",
      choices: [
        "The customers table: 4 West, 3 East, and 2 Central",
        "The orders table counted as 4 shipped, 3 pending, and 2 cancelled",
        "An even split of customers across the three regions",
        "A fourth region whose count is 0",
      ],
      answer: 0,
      explanation: "Maya Chen, Amina Diallo, Owen Brooks, and Hannah Berg are West. Luis Ortega, Priya Shah, and Noah Kim are East. Jonah Park and Sofia Rossi are Central.",
    },
    closer:
      "The loaded tables are already frames: customers, products, orders, order_items, subscriptions, campaigns, monthly_mrr, line_items, and messy_spend. `$` is how you lift a single column out when a verb is more than you need.",
  },
  {
    id: "r-6",
    title: "Factors",
    minutes: 5,
    datasetId: "customers",
    idea: [
      "segment is a category with three labels: Enterprise, Mid-Market, and SMB. In full R, factor() records those as levels so a later model or chart knows the set is closed. Enterprise is Maya Chen, Priya Shah, and Hannah Berg. Mid-Market is Luis Ortega and Owen Brooks. SMB is Amina Diallo, Jonah Park, Sofia Rossi, and Noah Kim.",
      "This sandbox's factor() returns the same labels it was given, so the printed vector still reads Enterprise, Mid-Market, and SMB. You still pass the column through factor() to mark the intent. The levels are a property full R keeps beside the vector. The labels themselves stay the text you filter on.",
    ],
    example: {
      language: "r",
      code: `segments <- factor(customers$segment)
segments`,
      output: "Enterprise, Mid-Market, SMB, SMB, Enterprise, Mid-Market, SMB, SMB, Enterprise",
    },
    takeaway: "factor() marks segment as a category. In this sandbox the labels come back unchanged.",
    question: {
      prompt: "Why would full R store customers$segment as a factor?",
      choices: [
        "So the labels become dollar amounts you can sum",
        "So Enterprise, Mid-Market, and SMB are a fixed set of levels",
        "So filter() can only test numbers",
        "So the segment column is removed from customers",
      ],
      answer: 1,
      explanation: "A factor keeps the allowed labels with the vector. Summing still wants a numeric column such as amount or mrr. Filtering on the label keeps working.",
    },
    drill: {
      kind: "fill",
      prompt: "Fill the function that marks segment as a category.",
      codeTemplate: "segments <- ____(customers$segment)",
      answer: ["factor"],
      hint: "It starts with f and records categorical levels in full R.",
    },
    practice: {
      id: "r-6-practice",
      kind: "r_sandbox",
      prompt: "Assign segments to factor() applied to the segment column of customers.",
      starter: "segments <- factor(customers$region)",
      solutionCode: "segments <- factor(customers$segment)",
      expectedExpr: "customers$segment",
      checkVariable: "segments",
      hint: "The column is segment. region is a different category.",
    },
    reflect: {
      prompt: "factor() in this sandbox returns the labels unchanged. Which label stays on Maya Chen?",
      choices: ["1, an internal level code", "West", "NA", "Enterprise"],
      answer: 3,
      explanation: "Maya Chen's segment is Enterprise. West is her region. The sandbox does not recode the label to a number.",
    },
    closer:
      "Read the column as a small census: 3 Enterprise, 2 Mid-Market, and 4 SMB. Those three labels are the levels. When you filter or group segment later, you are splitting the 9 accounts along that set.",
  },
  {
    id: "r-7",
    title: "Subset with filter",
    minutes: 5,
    datasetId: "customers",
    idea: [
      "filter() keeps rows whose condition is TRUE and drops the rest. `customers |> filter(region == \"West\")` keeps Maya Chen, Amina Diallo, Owen Brooks, and Hannah Berg. The comparison operator is `==`. A single `=` names an argument and does not test the column.",
      "`|>` pipes the frame into the next function, and `%>%` does the same thing here. After the filter, `length(west_customers$name)` counts the remaining names. That count is 4. East is 3 and Central is 2, which is the tally you stored in the previous frame.",
    ],
    example: {
      language: "r",
      code: `enterprise <- customers |> filter(segment == "Enterprise")
length(enterprise$name)`,
      output: "3",
    },
    takeaway: "filter(region == \"West\") keeps 4 customers. Count them with length() on a column.",
    question: {
      prompt: "How many customers have region West?",
      choices: [
        "4: Maya Chen, Amina Diallo, Owen Brooks, and Hannah Berg",
        "3: Luis Ortega, Priya Shah, and Noah Kim",
        "2: Jonah Park and Sofia Rossi",
        "9: every row in customers",
      ],
      answer: 0,
      explanation: "Four accounts are West. The three-name list is East, and the two-name list is Central. All three regions together are the 9 customers.",
    },
    drill: {
      kind: "bug",
      prompt: "This West subset does not test the region. Select the broken line and the fix.",
      lines: ["west <- customers |>", 'filter(region = "West")'],
      buggyLine: 1,
      fixChoices: [
        'filter(region == "West")',
        'filter(region = "West")',
        'filter("West")',
        'select(region = "West")',
      ],
      fixAnswer: 0,
      explanation: "A single = names an argument, so the comparison never runs and every customer stays. == tests region against the string West.",
    },
    practice: {
      id: "r-7-practice",
      kind: "r_sandbox",
      prompt:
        "Filter customers to region West, store that frame in west_customers, and assign answer to the number of remaining names.",
      starter: `west_customers <- customers
answer <- length(west_customers$name)`,
      solutionCode: `west_customers <- customers |> filter(region == "West")
answer <- length(west_customers$name)`,
      expectedExpr: 'length((customers |> filter(region == "West"))$name)',
      checkVariable: "answer",
      hint: "Use == inside filter, then length() on the name column.",
    },
    reflect: {
      prompt: 'What does customers |> filter(region = "West") do in this sandbox?',
      choices: [
        "It keeps the four West customers",
        "It stops with a syntax error on the equals sign",
        "It keeps every customer, because = names an argument and never compares region",
        "It keeps rows whose name is West",
      ],
      answer: 2,
      explanation: "The named argument is ignored by the row test, so the mask stays TRUE for all 9 customers. The West subset is region == \"West\".",
    },
    closer:
      "Four West accounts is a headcount, not revenue. Maya and Hannah are Enterprise, Amina is SMB, and Owen is Mid-Market. The dollar question uses line_items, where those same customers show up on order lines.",
  },
];
