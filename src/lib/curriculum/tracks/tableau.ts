import type { Module } from "../types";
import { tab_foundations } from "./tableau-tab-foundations";
import { tab_time } from "./tableau-tab-time";
import { tab_filters } from "./tableau-tab-filters";
import { tab_calcs } from "./tableau-tab-calcs";
import { tab_lod } from "./tableau-tab-lod";

export const tableauModules: Module[] = [
  tab_foundations,
  tab_time,
  tab_filters,
  tab_calcs,
  tab_lod,
];
