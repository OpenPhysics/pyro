/**
 * Application initialization logic.
 */

import { CONFIG } from "./config";
import { dom, getElementOrThrow, querySelectorOrThrow } from "./dom";
import { getCode, initEditor, setCode, setEditorFontSize, setEditorTheme } from "./editor";
import { EXAMPLE_DISPLAY_NAMES, EXAMPLE_KEYS, EXAMPLES } from "./examples";
import {
  handleDownload,
  handleExample,
  handleFontDecrease,
  handleFontIncrease,
  handleReset,
  handleRun,
  handleSnippets,
  handleStop,
  handleThemeChange,
  handleToggleConsole,
  setCurrentExampleKey,
  setOutputTab,
  updateInstructionsDisplay,
} from "./handlers";
import type { QueryParams } from "./queryParams";
import { parseQueryParams } from "./queryParams";
import { initResizable } from "./resizable";
import { initGlobalShortcuts } from "./shortcuts";
import { createSidebar, setSidebarVisible } from "./sidebar";
import { buildSnippetsDialog, initSnippetsDialog } from "./snippetsDialog";
import { setDarkMode } from "./theme";
import { clearConsole, showConsole } from "./ui";
import { setViewMode } from "./viewMode";

// ---- Query Parameters Application ----

function applyQueryParams(params: QueryParams): void {
  // Apply header visibility
  const header = dom.header;
  if (header instanceof HTMLElement) {
    header.style.display = params.header ? "" : "none";
  }

  // Apply sidebar visibility
  setSidebarVisible(params.sidebar);

  // Apply theme (before font size so theme changes don't override)
  const isDark = params.theme === "dark";
  setDarkMode(isDark);
  setEditorTheme(isDark);

  // Apply font size
  if (params.fontSize !== CONFIG.editor.defaultFontSize) {
    setEditorFontSize(params.fontSize);
  }

  // Apply view mode
  setViewMode(params.view);

  // Load example (before run so auto-run uses the correct code)
  // params.example is already sanitized against EXAMPLE_KEYS whitelist in parseQueryParams
  if (params.example && params.example in EXAMPLES) {
    handleExample(params.example);
  }

  // Apply output tab
  setOutputTab(params.tab);

  // Apply console visibility
  if (params.console) {
    showConsole(dom.consolePanel, dom.toggleConsoleBtn);
  }

  // Auto-run with delay to ensure initialization complete
  if (params.run) {
    setTimeout(() => {
      handleRun();
    }, 100);
  }
}

// ---- Bootstrap ----

export function init(): void {
  // Parse query parameters at the start
  const queryParams = parseQueryParams(EXAMPLE_KEYS);

  // Resolve DOM elements (validates they exist)
  const outputDiv = getElementOrThrow("output");
  const gutter = getElementOrThrow("gutter");
  const editorPanel = querySelectorOrThrow(".editor-panel");
  const outputPanel = querySelectorOrThrow(".output-panel");
  const consoleOutput = getElementOrThrow("console-output");
  const toggleConsoleBtn = getElementOrThrow<HTMLButtonElement>("toggle-console");
  const clearConsoleBtn = getElementOrThrow<HTMLButtonElement>("clear-console");

  // Build & mount sidebar
  const sidebar = createSidebar({
    onRun: handleRun,
    onStop: handleStop,
    onReset: handleReset,
    onToggleConsole: handleToggleConsole,
    onSnippets: handleSnippets,
    onDownload: handleDownload,
    onThemeChange: handleThemeChange,
    onFontIncrease: handleFontIncrease,
    onFontDecrease: handleFontDecrease,
  });
  document.body.insertBefore(sidebar, document.body.firstChild);

  // Initialize editor
  const editorContainer = getElementOrThrow("editor");
  initEditor(editorContainer, handleRun);

  // Initialize snippets dialog
  initSnippetsDialog(getCode, setCode);
  document.body.appendChild(buildSnippetsDialog());

  // Resizable panels
  initResizable(gutter, editorPanel, outputPanel);

  // Header examples combobox (populated from src/examples/)
  const examplesSelect = dom.examplesSelect;
  if (examplesSelect) {
    for (const key of EXAMPLE_KEYS) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = EXAMPLE_DISPLAY_NAMES[key] ?? key;
      examplesSelect.appendChild(opt);
    }
    examplesSelect.addEventListener("change", (e) => {
      const key = (e.target as HTMLSelectElement).value;
      if (key) {
        handleExample(key);
        examplesSelect.value = "";
      }
    });
  }

  // Output panel tabs (Output | Instructions)
  setCurrentExampleKey(EXAMPLE_KEYS[0] ?? null);
  updateInstructionsDisplay();

  dom.tabOutput?.addEventListener("click", () => setOutputTab("output"));
  dom.tabInstructions?.addEventListener("click", () => {
    setOutputTab("instructions");
    updateInstructionsDisplay();
  });

  // Console panel buttons
  toggleConsoleBtn.addEventListener("click", handleToggleConsole);
  clearConsoleBtn.addEventListener("click", () => clearConsole(consoleOutput));

  // View mode buttons
  dom.viewCodeBtn?.addEventListener("click", () => setViewMode("code"));
  dom.viewSplitBtn?.addEventListener("click", () => setViewMode("split"));
  dom.viewOutputBtn?.addEventListener("click", () => setViewMode("output"));

  // Initialize sidebar stop button as disabled
  const stopBtn = dom.stopBtn;
  if (stopBtn) {
    stopBtn.disabled = true;
  }

  // Initial output placeholder
  outputDiv.innerHTML = '<div class="loading">Click "Run" to execute your VPython code</div>';

  // Initialize global keyboard shortcuts
  initGlobalShortcuts();

  // Apply query parameters after all initialization is complete
  applyQueryParams(queryParams);
}
