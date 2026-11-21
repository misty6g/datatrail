import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeAnswer(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/;\s*$/, "")
    .toLowerCase();
}

export function answersMatch(user: string, expected: string | string[]) {
  const normalized = normalizeAnswer(user);
  const options = Array.isArray(expected) ? expected : [expected];
  return options.some((opt) => normalizeAnswer(opt) === normalized);
}