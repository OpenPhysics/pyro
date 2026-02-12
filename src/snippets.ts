import type { Snippet } from './types';

const SNIPPETS_KEY = 'vpython-snippets';

/** Load all saved snippets from localStorage. */
export function loadSnippets(): Snippet[] {
  const raw = localStorage.getItem(SNIPPETS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Snippet[];
  } catch {
    return [];
  }
}

/** Save a snippet to localStorage. Returns true if saved, false if name is duplicate. */
export function saveSnippet(name: string, code: string): boolean {
  const snippets = loadSnippets();
  if (snippets.some((s) => s.name === name)) {
    return false;
  }
  snippets.push({ name, code, createdAt: Date.now() });
  snippets.sort((a, b) => b.createdAt - a.createdAt);
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
  return true;
}

/** Overwrite a snippet that already exists. */
export function overwriteSnippet(name: string, code: string): void {
  const snippets = loadSnippets().filter((s) => s.name !== name);
  snippets.push({ name, code, createdAt: Date.now() });
  snippets.sort((a, b) => b.createdAt - a.createdAt);
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
}

/** Delete a snippet by name. */
export function deleteSnippet(name: string): void {
  const snippets = loadSnippets().filter((s) => s.name !== name);
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
}

/** Get a single snippet by name. */
export function getSnippet(name: string): Snippet | undefined {
  return loadSnippets().find((s) => s.name === name);
}
