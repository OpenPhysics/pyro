/**
 * Unified localStorage operations for the application.
 */

import { CONFIG } from "../config";
import type { Snippet } from "../types";
import { safeCall } from "../utils/safeCall";

function isQuotaExceeded(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

interface StoredSnippet {
  code?: unknown;
  name?: unknown;
  createdAt?: unknown;
}

/** Keep entries that are objects with a string `code`. Drop anything else. */
function parseSnippets(value: unknown): Snippet[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const snippets: Snippet[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const record = item as StoredSnippet;
    if (typeof record.code !== "string") {
      continue;
    }
    snippets.push({
      name: typeof record.name === "string" ? record.name : "",
      code: record.code,
      createdAt: typeof record.createdAt === "number" ? record.createdAt : 0,
    });
  }
  return snippets;
}

export const storageService = {
  // Editor code
  getEditorCode(): string | null {
    return localStorage.getItem(CONFIG.storage.editorCode);
  },

  setEditorCode(code: string): void {
    localStorage.setItem(CONFIG.storage.editorCode, code);
  },

  // Snippets
  getSnippets(): Snippet[] {
    return safeCall(
      () => {
        const raw = localStorage.getItem(CONFIG.storage.snippets);
        if (!raw) {
          return [];
        }
        const parsed: unknown = JSON.parse(raw);
        return parseSnippets(parsed);
      },
      [],
      "storageService.getSnippets",
    );
  },

  setSnippets(snippets: Snippet[]): void {
    try {
      localStorage.setItem(CONFIG.storage.snippets, JSON.stringify(snippets));
    } catch (error) {
      if (isQuotaExceeded(error)) {
        // biome-ignore lint/suspicious/noConsole: storage failure should not take down the editor
        console.error("[storageService.setSnippets] localStorage quota exceeded", error);
        return;
      }
      throw error;
    }
  },
};
