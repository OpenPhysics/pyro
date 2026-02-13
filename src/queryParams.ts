/**
 * Query parameter parsing and validation for iframe embedding.
 *
 * Supported parameters:
 * - header: true/false (default: true) - Show/hide top navigation bar
 * - sidebar: true/false (default: true) - Show/hide sidebar
 * - example: string (default: none) - Load specific example by key
 * - view: code/split/output (default: split) - View mode
 * - tab: output/instructions (default: instructions) - Active output tab
 * - console: true/false (default: false) - Show console by default
 * - theme: dark/light (default: dark) - Color theme ("projector" maps to "light")
 * - fontSize: 10-28 (default: 14) - Editor font size in pixels
 * - run: true/false (default: false) - Auto-run code on load
 */

import type { ViewMode } from "./viewMode";

export type OutputTab = "output" | "instructions";
export type Theme = "dark" | "light";

export interface QueryParams {
  header: boolean;
  sidebar: boolean;
  example: string | null;
  view: ViewMode;
  tab: OutputTab;
  console: boolean;
  theme: Theme;
  fontSize: number;
  run: boolean;
}

const DEFAULT_PARAMS: QueryParams = {
  header: true,
  sidebar: true,
  example: null,
  view: "split",
  tab: "instructions",
  console: false,
  theme: "dark",
  fontSize: 14,
  run: false,
};

/**
 * Dangerous keys that could cause prototype pollution or other issues.
 */
const DANGEROUS_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
  "toString",
  "valueOf",
]);

/**
 * Sanitize a string value by validating against a whitelist.
 * Returns null if the value is not in the whitelist or is a dangerous key.
 */
function sanitizeWhitelistString(
  value: string | null,
  whitelist: readonly string[],
): string | null {
  if (value === null) {
    return null;
  }

  // Reject dangerous keys that could cause prototype pollution
  if (DANGEROUS_KEYS.has(value)) {
    return null;
  }

  // Only allow values that are in the whitelist
  if (whitelist.includes(value)) {
    return value;
  }

  return null;
}

function parseBoolean(value: string | null, defaultValue: boolean): boolean {
  if (value === null) {
    return defaultValue;
  }
  return value.toLowerCase() === "true";
}

function parseEnum<T extends string>(value: string | null, validValues: T[], defaultValue: T): T {
  if (value === null) {
    return defaultValue;
  }
  const lower = value.toLowerCase() as T;
  return validValues.includes(lower) ? lower : defaultValue;
}

function parseNumber(value: string | null, min: number, max: number, defaultValue: number): number {
  if (value === null) {
    return defaultValue;
  }
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, num));
}

/**
 * Parse all query parameters from the URL.
 * @param validExampleKeys - Array of valid example keys to validate against
 */
export function parseQueryParams(validExampleKeys: readonly string[] = []): QueryParams {
  const params = new URLSearchParams(window.location.search);

  // Parse theme with support for "projector" alias
  let theme: Theme = DEFAULT_PARAMS.theme;
  const themeParam = params.get("theme");
  if (themeParam !== null) {
    const lower = themeParam.toLowerCase();
    if (lower === "light" || lower === "projector") {
      theme = "light";
    } else if (lower === "dark") {
      theme = "dark";
    }
  }

  // Parse tab with backward compatibility for showInstructions=false
  let tab: OutputTab = DEFAULT_PARAMS.tab;
  const tabParam = params.get("tab");
  const showInstructionsParam = params.get("showInstructions");

  if (tabParam !== null) {
    tab = parseEnum(tabParam, ["output", "instructions"], DEFAULT_PARAMS.tab);
  } else if (showInstructionsParam === "false") {
    // Backward compatibility: showInstructions=false maps to tab=output
    tab = "output";
  }

  // Sanitize example parameter against whitelist of valid example keys
  const exampleParam = sanitizeWhitelistString(params.get("example"), validExampleKeys);

  return {
    header: parseBoolean(params.get("header"), DEFAULT_PARAMS.header),
    sidebar: parseBoolean(params.get("sidebar"), DEFAULT_PARAMS.sidebar),
    example: exampleParam,
    view: parseEnum(params.get("view"), ["code", "split", "output"], DEFAULT_PARAMS.view),
    tab,
    console: parseBoolean(params.get("console"), DEFAULT_PARAMS.console),
    theme,
    fontSize: parseNumber(params.get("fontSize"), 10, 28, DEFAULT_PARAMS.fontSize),
    run: parseBoolean(params.get("run"), DEFAULT_PARAMS.run),
  };
}
