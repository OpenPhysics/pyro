/**
 * DOM element references and utilities.
 * Provides lazy-evaluated, type-safe access to DOM elements.
 */

/**
 * Get an element by ID, returning null if not found.
 */
export function getElement<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Get an element by ID, throwing if not found.
 */
export function getElementOrThrow<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) {
    throw new Error(`Required element #${id} not found`);
  }
  return el;
}

/**
 * Query select an element, returning null if not found.
 */
export function querySelector<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}

/**
 * Query select an element, throwing if not found.
 */
export function querySelectorOrThrow<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector(selector) as T | null;
  if (!el) {
    throw new Error(`Required element ${selector} not found`);
  }
  return el;
}

/**
 * Lazily-resolved DOM element references.
 * These are getters so they're evaluated when accessed, not at module load time.
 */
export const dom = {
  // Output area
  get output() {
    return getElementOrThrow("output");
  },
  get errorDisplay() {
    return getElementOrThrow("error-display");
  },

  // Console
  get consoleOutput() {
    return getElementOrThrow("console-output");
  },
  get consolePanel() {
    return getElementOrThrow("console-panel");
  },
  get toggleConsoleBtn() {
    return getElementOrThrow<HTMLButtonElement>("toggle-console");
  },
  get clearConsoleBtn() {
    return getElementOrThrow<HTMLButtonElement>("clear-console");
  },

  // Layout panels
  get gutter() {
    return getElementOrThrow("gutter");
  },
  get editorPanel() {
    return querySelectorOrThrow(".editor-panel");
  },
  get outputPanel() {
    return querySelectorOrThrow(".output-panel");
  },

  // Editor
  get editorContainer() {
    return getElementOrThrow("editor");
  },

  // Instructions
  get instructionsBody() {
    return getElementOrThrow("instructions-body");
  },

  // Tabs
  get tabOutput() {
    return getElement("tab-output");
  },
  get tabInstructions() {
    return getElement("tab-instructions");
  },
  get outputContent() {
    return getElement("output-content");
  },
  get instructionsContent() {
    return getElement("instructions-content");
  },

  // Header
  get header() {
    return querySelector("header");
  },
  get examplesSelect() {
    return getElement<HTMLSelectElement>("examples-select");
  },

  // View mode buttons
  get viewCodeBtn() {
    return getElement("view-code-btn");
  },
  get viewSplitBtn() {
    return getElement("view-split-btn");
  },
  get viewOutputBtn() {
    return getElement("view-output-btn");
  },

  // Sidebar buttons
  get runBtn() {
    return getElement<HTMLButtonElement>("run-sidebar-btn");
  },
  get stopBtn() {
    return getElement<HTMLButtonElement>("stop-sidebar-btn");
  },

  // Screen reader
  get srAnnouncements() {
    return getElement("sr-announcements");
  },

  // Dialogs
  get snippetsOverlay() {
    return getElement("snippets-dialog-overlay");
  },
  get shortcutsOverlay() {
    return getElement("shortcuts-dialog-overlay");
  },
};
