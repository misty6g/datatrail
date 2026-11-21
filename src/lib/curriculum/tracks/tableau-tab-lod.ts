import { mod } from "../expand";
import type { Module } from "../types";
import { tableauPractice } from "./tableau-shared";

export const tab_lod: Module =
mod(
  "tab-lod",
  "LOD, parameters, capstone",
  "Fix Northstar regional revenue with a FIXED expression, drive channel choice from a parameter, and finish with an executive bar of segment by category.",
  [
    {
      title: "FIXED region",
      items: [
        "{ FIXED [region] : SUM([amount]) } returns West 452, East 1164, and Central 267",
        "A dimension filter on status does not change that result",
        "Put status in context when shipped revenue, West 355, should replace the FIXED total",
      ],
    },
    {
      title: "Parameters",
      items: [
        "A parameter holds one viewer-chosen value",
        "Channel options are web, retail, and partner",
        "[channel] = [Parameters].[Channel] compares the column with the control",
      ],
    },
    {
      title: "Executive bar",
      items: [
        "Columns: segment",
        "Rows: SUM(amount)",
        "Color: category, with no aggregation",
        "Enterprise is 1256, of which Software is 1047 and Gear is 209",
        "SMB is 458, of which Gear is 363 and Software is 95",
      ],
    },
  ],
  [
    {
      id: "tab-15",
      title: "FIXED level of detail",
      minutes: 7,
      datasetId: "line_items",
      idea: [
        "{ FIXED [region] : SUM([amount]) } returns 452 on every Northstar West line, 1164 on every East line, and 267 on every Central line.",
        "A dimension filter on status does not change those values, so shipped bars can show West at 355 while the FIXED West value stays 452.",
      ],
      example: {
        language: "tableau",
        code: "{ FIXED [region] : SUM([amount]) }",
        output: "West 452 · East 1164 · Central 267",
      },
      takeaway: "FIXED [region] stamps the full Northstar regional revenue onto every line in that region.",
      question: {
        prompt: "What does { FIXED [region] : SUM([amount]) } return on a Northstar West line such as Owen Brooks's Field Notebook?",
        choices: [
          "60, the amount on that single line",
          "452, the sum of every West line",
          "355, the shipped-only West total",
          "18, the West quantity",
        ],
        answer: 1,
        explanation:
          "FIXED [region] aggregates every line in the region, so each West row, including Owen Brooks's 60 notebook line, carries the West revenue of 452.",
        hint: "The expression ignores the line's own amount and uses the region grain.",
        codeContext: "{ FIXED [region] : SUM([amount]) }",
      },
      drill: {
        kind: "tokens",
        prompt: "Write the FIXED expression that attaches each Northstar region's full revenue to every line in that region.",
        template: ["{ FIXED ", "", " : ", "", " }"],
        bank: ["[region]", "SUM([amount])", "[customer]", "AVG([unit_price])"],
        answer: ["[region]", "SUM([amount])"],
        hint: "Fix the grain at region, then sum amount. West lines all show 452.",
      },
      practice: tableauPractice({
        id: "tab-15-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Show a text table of SUM(amount) by region, the same grain as the Northstar FIXED regional total.",
        datasetId: "line_items",
        starter: "",
        hint: "Put region on Columns and SUM(amount) on Rows. Set the mark to text and leave Color empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "region" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "text",
          filters: [],
        },
      }),
      reflect: {
        prompt: "The Northstar view is filtered to segment Enterprise. Which expression still returns the full regional revenue, including SMB and Mid-Market lines?",
        choices: [
          "{ FIXED [region] : SUM([amount]) }, unless segment is a context filter",
          "SUM(amount) in the view",
          "A percent-of-total table calculation",
          "RUNNING_SUM(SUM([amount])) addressed by segment",
        ],
        answer: 0,
        explanation:
          "A dimension filter on segment is applied after FIXED, so East stays 1164 even when the bars show only Priya Shah.",
      },
      closer: "Use { FIXED [region] : SUM([amount]) } when the Northstar regional total must stay put while a status filter changes the bars.",
    },
    {
      id: "tab-16",
      title: "Parameters",
      minutes: 6,
      datasetId: "line_items",
      idea: [
        "A parameter holds one value the viewer changes, such as a Northstar Channel parameter whose options are web, retail, and partner.",
        "The channel column on line_items stays the dimension, and a calculated comparison with the Channel parameter applies the viewer's choice.",
      ],
      example: {
        language: "tableau",
        code: "[channel] = [Parameters].[Channel]",
        output: "One of web, retail, or partner, chosen by the viewer",
      },
      takeaway: "Store a Northstar channel choice in a parameter, then compare it with the channel column.",
      question: {
        prompt: "A merchandiser should switch the Northstar view among web, retail, and partner from a control. What do you create?",
        choices: [
          "A group on product",
          "A new measure named SUM(channel)",
          "A context filter that deletes retail rows from the extract",
          "A string parameter Channel, used in [channel] = [Parameters].[Channel]",
        ],
        answer: 3,
        explanation:
          "The parameter holds one channel at a time. The calculated comparison keeps the channel column as the field being tested.",
        hint: "The control has a single current value. It is not a new row on line_items.",
        codeContext: "[channel] = [Parameters].[Channel]",
      },
      drill: {
        kind: "fill",
        prompt: "Name the object that stores one chosen Northstar channel for the viewer.",
        answer: ["parameter", "a parameter", "Parameter"],
        hint: "It is a single control value, separate from the channel column on each line.",
        codeTemplate: "[channel] = [Parameters].[Channel]",
      },
      practice: tableauPractice({
        id: "tab-16-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Build a bar of SUM(amount) by channel, the Northstar view a Channel parameter would later filter.",
        datasetId: "line_items",
        starter: "",
        hint: "Put channel on Columns and SUM(amount) on Rows. Keep the bar mark and leave Color and filters empty.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "channel" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: null,
          mark: "bar",
          filters: [],
        },
      }),
      reflect: {
        prompt: "How is a Channel parameter different from the channel column on Northstar line_items?",
        choices: [
          "The parameter stores web, retail, and partner on every line at once",
          "The parameter is a column with one row per order",
          "The parameter holds a single viewer-chosen value, while channel can differ on each line",
          "The parameter replaces SUM(amount)",
        ],
        answer: 2,
        explanation:
          "line_items.channel varies by order, from Maya Chen's web orders to Owen Brooks's retail orders. The parameter stores one selection for the control.",
      },
      closer: "Store the viewer's channel choice in a parameter and compare it with the channel column on Northstar line_items.",
    },
    {
      id: "tab-17",
      title: "Executive Tableau capstone",
      minutes: 8,
      capstone: true,
      datasetId: "line_items",
      idea: [
        "The executive question is which Northstar segment produces revenue and whether that revenue is Gear or Software.",
        "SUM(amount) by segment with category on Color shows Enterprise at 1256, mostly Software, and SMB at 458, mostly Gear.",
      ],
      example: {
        language: "tableau",
        code: "Columns: segment\nRows: SUM([amount])\nColor: category\nMark: bar",
        output: "Enterprise 1256 (Software 1047, Gear 209) · SMB 458 (Gear 363, Software 95)",
      },
      takeaway: "The executive Northstar bar uses segment, SUM(amount), and category on Color.",
      question: {
        prompt: "On the executive Northstar bar of SUM(amount) by segment with category on Color, what does the Enterprise bar show?",
        choices: [
          "Enterprise Gear 1047 and Enterprise Software 209",
          "Enterprise Software 1047 and Enterprise Gear 209, inside a 1256 total",
          "Only Mid-Market's 169",
          "Shipped revenue of 1648 with no segment split",
        ],
        answer: 1,
        explanation:
          "Priya Shah's Annual licenses and Maya Chen's Monthly line make Enterprise mostly Software at 1047, with Gear at 209 from Trail Bottle and Summit Pack.",
        hint: "Add the category amounts inside Enterprise and check that they total 1256.",
      },
      drill: {
        kind: "order",
        prompt: "Order the build for the executive Northstar bar.",
        items: [
          "Set the mark to bar",
          "Put category on Color",
          "Connect line_items",
          "Put SUM(amount) on Rows",
          "Put segment on Columns",
        ],
        answer: [
          "Connect line_items",
          "Put segment on Columns",
          "Put SUM(amount) on Rows",
          "Put category on Color",
          "Set the mark to bar",
        ],
        explanation:
          "Connect the extract, place segment and SUM(amount), color the bars by category, and keep the bar mark so Enterprise shows Gear against Software.",
      },
      practice: tableauPractice({
        id: "tab-17-practice",
        kind: "bi_sandbox",
        tool: "tableau",
        prompt: "Build the executive bar: SUM(amount) by segment, with category on Color, for every Northstar line item.",
        datasetId: "line_items",
        starter: "",
        hint: "Put segment on Columns, SUM(amount) on Rows, and category on Color. Keep the bar mark and add no filters.",
        targetSpec: {
          mode: "tableau",
          columns: [{ field: "segment" }],
          rows: [{ field: "amount", agg: "SUM" }],
          color: { field: "category" },
          mark: "bar",
          filters: [],
        },
      }),
      reflect: {
        prompt: "SMB's bar on that same executive Northstar view is mostly which category?",
        choices: [
          "Gear at 363 of SMB's 458",
          "Software at 363 of SMB's 458",
          "Partner channel only, at 146",
          "Refunded lines only, at 49",
        ],
        answer: 0,
        explanation:
          "Amina Diallo, Jonah Park, and Sofia Rossi buy Gear, and Noah Kim plus Amina's API Add-on add 95 of Software.",
      },
      closer: "Ship the Northstar executive bar with segment on Columns, SUM(amount) on Rows, and category on Color.",
    },
  ],
);
