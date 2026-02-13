/**
 * Unified localStorage operations for the application.
 */

import { CONFIG } from "../config";
import type { Snippet } from "../types";
import { safeCall } from "../utils/safeCall";

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
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as Snippet[]) : [];
      },
      [],
      "storageService.getSnippets",
    );
  },

  setSnippets(snippets: Snippet[]): void {
    localStorage.setItem(CONFIG.storage.snippets, JSON.stringify(snippets));
  },
};
