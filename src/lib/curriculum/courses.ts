import type { Course } from "./types";

export const courses: Course[] = [
  {
    id: "sql",
    title: "SQL",
    tagline: "Query real tables with confidence",
    color: "#0F3D3E",
    accent: "#2A9D8F",
    icon: "🗄️",
    lessons: [
      {
        id: "sql-1",
        title: "What is a table?",
        minutes: 3,
        concept:
          "SQL stores data in tables — rows of records and columns of fields. Think of a spreadsheet that you talk to with precise questions.",
        exercise: {
          kind: "multiple_choice",
          prompt: "In SQL, a single row in a table usually represents…",
          choices: [
            "A column name",
            "One record or entity",
            "A database server",
            "A chart type",
          ],
          answer: 1,
          hint: "Rows hold individual people, orders, products, and so on.",
        },
      },
      {
        id: "sql-2",
        title: "SELECT the essentials",
        minutes: 4,
        concept:
          "SELECT picks columns. FROM names the table. Start simple: ask only for what you need.",
        exercise: {
          kind: "code",
          language: "sql",
          prompt:
            "Write a query that returns every column from a table named customers.",
          starter: "SELECT ",
          answer: ["SELECT * FROM customers", "select * from customers"],
          hint: "Use * to mean all columns.",
        },
      },
      {
        id: "sql-3",
        title: "Filter with WHERE",
        minutes: 4,
        concept:
          "WHERE keeps only rows that match a condition. Compare numbers, text, and dates to focus your result set.",
        exercise: {
          kind: "code",
          language: "sql",
          prompt:
            "Return all columns from orders where status equals 'shipped'.",
          starter: "SELECT * FROM orders ",
          answer: [
            "SELECT * FROM orders WHERE status = 'shipped'",
            "SELECT * FROM orders WHERE status=\"shipped\"",
          ],
          hint: "Add WHERE status = 'shipped'.",
        },
      },
      {
        id: "sql-4",
        title: "Aggregate with COUNT",
        minutes: 4,
        concept:
          "Aggregate functions summarize many rows into one value. COUNT(*) tells you how many rows match.",
        exercise: {
          kind: "fill_blank",
          prompt:
            "Complete: SELECT ____(*) FROM users; to count every user row.",
          answer: ["COUNT", "count"],
          placeholder: "function name",
          hint: "The function that tallies rows.",
        },
      },
    ],
  },
  {
    id: "tableau",
    title: "Tableau",
    tagline: "Turn numbers into clear visuals",
    color: "#1B4332",
    accent: "#52B788",
    icon: "📊",
    lessons: [
      {
        id: "tab-1",
        title: "Dimensions vs measures",
        minutes: 3,
        concept:
          "Dimensions slice your data (category, region, date). Measures are numbers you aggregate (sales, profit, quantity).",
        exercise: {
          kind: "multiple_choice",
          prompt: "Which field is typically a dimension?",
          choices: ["Sales amount", "Profit ratio", "Region", "Quantity sold"],
          answer: 2,
          hint: "Dimensions are categorical labels used to break data apart.",
        },
      },
      {
        id: "tab-2",
        title: "Picking a chart",
        minutes: 4,
        concept:
          "Bars compare categories. Lines show change over time. Scatter plots reveal relationships between two measures.",
        exercise: {
          kind: "multiple_choice",
          prompt: "Best chart to show monthly revenue over a year?",
          choices: ["Pie chart", "Line chart", "Treemap", "Packed bubbles"],
          answer: 1,
        },
      },
      {
        id: "tab-3",
        title: "Build a view in order",
        minutes: 4,
        concept:
          "A clean Tableau workflow: connect data, place dimensions on Rows/Columns, drop measures, then format and filter.",
        exercise: {
          kind: "order",
          prompt: "Order these steps for a first bar chart.",
          items: [
            "Connect to the data source",
            "Drag Category to Columns",
            "Drag Sales to Rows",
            "Add a Region filter",
          ],
          answer: [
            "Connect to the data source",
            "Drag Category to Columns",
            "Drag Sales to Rows",
            "Add a Region filter",
          ],
        },
      },
    ],
  },
  {
    id: "powerbi",
    title: "Power BI",
    tagline: "Model data and ship dashboards",
    color: "#F4A261",
    accent: "#E76F51",
    icon: "⚡",
    lessons: [
      {
        id: "pbi-1",
        title: "Power Query vs model",
        minutes: 3,
        concept:
          "Power Query cleans and shapes raw tables. The data model defines relationships and measures for visuals.",
        exercise: {
          kind: "multiple_choice",
          prompt: "Where do you typically remove nulls and split columns?",
          choices: [
            "DAX measure pane",
            "Power Query Editor",
            "Report theme gallery",
            "Gateway monitor",
          ],
          answer: 1,
        },
      },
      {
        id: "pbi-2",
        title: "Relationships matter",
        minutes: 4,
        concept:
          "Tables connect through keys. A one-to-many relationship from DimCustomer to FactSales lets filters flow correctly.",
        exercise: {
          kind: "fill_blank",
          prompt:
            "A ____-to-many relationship is the most common star-schema pattern from a dimension to a fact table.",
          answer: ["one", "1"],
          placeholder: "one / many / many",
        },
      },
      {
        id: "pbi-3",
        title: "A simple DAX measure",
        minutes: 4,
        concept:
          "Measures calculate on the fly. Total Sales = SUM(FactSales[Amount]) aggregates the Amount column.",
        exercise: {
          kind: "multiple_choice",
          prompt: "Which DAX expression sums Amount from FactSales?",
          choices: [
            "COUNT(FactSales[Amount])",
            "SUM(FactSales[Amount])",
            "AVG(FactSales)",
            "LOOKUP(FactSales[Amount])",
          ],
          answer: 1,
        },
      },
    ],
  },
  {
    id: "python",
    title: "Python",
    tagline: "Automate analysis with code",
    color: "#264653",
    accent: "#E9C46A",
    icon: "🐍",
    lessons: [
      {
        id: "py-1",
        title: "Variables hold values",
        minutes: 3,
        concept:
          "Assign with =. Names should be clear: city = \"Austin\" stores text in city.",
        exercise: {
          kind: "code",
          language: "python",
          prompt: "Create a variable named score set to 95.",
          starter: "",
          answer: ["score = 95", "score=95"],
        },
      },
      {
        id: "py-2",
        title: "Lists keep sequences",
        minutes: 4,
        concept:
          "Lists store ordered items in square brackets. sales = [120, 85, 200] holds three numbers.",
        exercise: {
          kind: "code",
          language: "python",
          prompt: "Create a list named cities with 'Paris' and 'Tokyo'.",
          answer: [
            "cities = ['Paris', 'Tokyo']",
            "cities = [\"Paris\", \"Tokyo\"]",
            "cities=['Paris','Tokyo']",
            "cities=[\"Paris\",\"Tokyo\"]",
          ],
        },
      },
      {
        id: "py-3",
        title: "Loop through items",
        minutes: 4,
        concept:
          "for item in items: repeats a block once per element — perfect for transforming rows of data.",
        exercise: {
          kind: "fill_blank",
          prompt: "Complete: ____ name in names: print(name)",
          answer: ["for"],
          placeholder: "keyword",
        },
      },
      {
        id: "py-4",
        title: "Define a function",
        minutes: 4,
        concept:
          "Functions package reusable logic. def double(n): return n * 2 creates a small calculator you can call anywhere.",
        exercise: {
          kind: "code",
          language: "python",
          prompt: "Write a function named greet that returns 'hi'.",
          starter: "def ",
          answer: [
            "def greet():\n    return 'hi'",
            "def greet():\n    return \"hi\"",
            "def greet(): return 'hi'",
            "def greet(): return \"hi\"",
          ],
          hint: "Use def greet(): and return 'hi'.",
        },
      },
    ],
  },
  {
    id: "r",
    title: "R",
    tagline: "Stats-ready scripts for data work",
    color: "#1D3557",
    accent: "#457B9D",
    icon: "📈",
    lessons: [
      {
        id: "r-1",
        title: "Assign with <-",
        minutes: 3,
        concept:
          "R’s classic assignment operator is <-. x <- 10 stores 10 in x. = also works, but <- is idiomatic in scripts.",
        exercise: {
          kind: "code",
          language: "r",
          prompt: "Assign 42 to a variable named answer using <-.",
          answer: ["answer <- 42", "answer<-42"],
        },
      },
      {
        id: "r-2",
        title: "Vectors are core",
        minutes: 4,
        concept:
          "c() combines values into a vector. ages <- c(21, 34, 29) is the building block for columns in a data frame.",
        exercise: {
          kind: "code",
          language: "r",
          prompt: "Create a vector named nums with 1, 2, and 3.",
          answer: ["nums <- c(1, 2, 3)", "nums <- c(1,2,3)", "nums=c(1,2,3)"],
        },
      },
      {
        id: "r-3",
        title: "Summarize a vector",
        minutes: 4,
        concept:
          "mean(), median(), and sum() summarize numeric vectors quickly — handy before you plot.",
        exercise: {
          kind: "fill_blank",
          prompt: "Which function computes the average of a numeric vector?",
          answer: ["mean", "mean()"],
          placeholder: "function name",
        },
      },
    ],
  },
];

export function getCourse(courseId: string) {
  return courses.find((c) => c.id === courseId);
}

export function getLesson(courseId: string, lessonId: string) {
  const course = getCourse(courseId);
  if (!course) return null;
  const index = course.lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) return null;
  return {
    course,
    lesson: course.lessons[index],
    index,
    prev: course.lessons[index - 1] ?? null,
    next: course.lessons[index + 1] ?? null,
  };
}