import DOMPurify from "dompurify";
import katex from "katex";
import "katex/dist/katex.min.css";
import { marked } from "marked";
import "./styles/main.css";
import {
  changeEditorFontSize,
  getCode,
  initEditor,
  setCode,
  setEditorFontSize,
  setEditorTheme,
} from "./editor";
import { EXAMPLE_DISPLAY_NAMES, EXAMPLE_INSTRUCTIONS, EXAMPLE_KEYS, EXAMPLES } from "./examples";
import { runCode, stopExecution } from "./executor";
import type { QueryParams } from "./queryParams";
import { parseQueryParams } from "./queryParams";
import { initResizable } from "./resizable";
import { closeShortcutsDialog, openShortcutsDialog } from "./shortcutsDialog";
import { createSidebar, setSidebarVisible, toggleSidebar } from "./sidebar";
import {
  buildSnippetsDialog,
  closeSnippetsDialog,
  initSnippetsDialog,
  openSnippetsDialog,
} from "./snippetsDialog";
import { setDarkMode } from "./theme";
import {
  addConsoleLog,
  announce,
  clearConsole,
  hideError,
  showConsole,
  showError,
  toggleConsole,
} from "./ui";
import { setViewMode } from "./viewMode";

// ---- DOM references (populated in init) ----

let outputDiv: HTMLElement;
let errorDisplay: HTMLElement;
let consoleOutput: HTMLElement;
let consolePanel: HTMLElement;
let toggleConsoleBtn: HTMLButtonElement;
let clearConsoleBtn: HTMLButtonElement;
let gutter: HTMLElement;
let editorPanel: HTMLElement;
let outputPanel: HTMLElement;
let instructionsBody: HTMLElement;
let currentExampleKey: string | null = null;

// ---- Run/Stop state management via sidebar buttons ----

function updateRunState(running: boolean): void {
  const runBtn = document.getElementById("run-sidebar-btn") as HTMLButtonElement | null;
  const stopBtn = document.getElementById("stop-sidebar-btn") as HTMLButtonElement | null;
  if (runBtn) {
    runBtn.disabled = running;
    const label = runBtn.querySelector(".sidebar-label");
    if (label) {
      label.textContent = running ? "Running..." : "Run";
    }
    runBtn.setAttribute("aria-label", running ? "Running..." : "Run");
  }
  if (stopBtn) {
    stopBtn.disabled = !running;
  }
  announce(running ? "Code is running" : "Code execution stopped");
}

// ---- Callbacks wired to the DOM ----

function handleRun(): void {
  void runCode(getCode, outputDiv, {
    onError: (msg) => showError(errorDisplay, msg),
    onConsoleLog: (msg) => addConsoleLog(consoleOutput, consolePanel, toggleConsoleBtn, msg),
    hideError: () => hideError(errorDisplay),
    clearConsole: () => clearConsole(consoleOutput),
    onRunStateChange: updateRunState,
  });
}

function handleStop(): void {
  stopExecution();
  updateRunState(false);
}

function handleSnippets(): void {
  openSnippetsDialog();
}

function handleReset(): void {
  stopExecution();
  updateRunState(false);
  outputDiv.innerHTML = '<div class="loading">Click "Run" to execute your VPython code</div>';
  hideError(errorDisplay);
}

function handleExample(key: string): void {
  if (EXAMPLES[key]) {
    setCode(EXAMPLES[key]);
    currentExampleKey = key;
    updateInstructionsDisplay();
  }
}

function renderMarkdownWithMath(markdown: string): string {
  const mathBlocks: string[] = [];

  // Extract and protect display math: \[ ... \]
  let processed = markdown.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => {
    const index = mathBlocks.length;
    try {
      mathBlocks.push(katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }));
    } catch {
      mathBlocks.push(`\\[${tex}\\]`);
    }
    return `%%MATH_BLOCK_${index}%%`;
  });

  // Extract and protect inline math: \( ... \)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
    const index = mathBlocks.length;
    try {
      mathBlocks.push(
        katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }),
      );
    } catch {
      mathBlocks.push(`\\(${tex}\\)`);
    }
    return `%%MATH_BLOCK_${index}%%`;
  });

  // Run marked on the protected markdown
  let html = marked(processed, { async: false }) as string;

  // Restore math blocks
  for (let i = 0; i < mathBlocks.length; i++) {
    html = html.replace(`%%MATH_BLOCK_${i}%%`, mathBlocks[i] ?? "");
  }

  return html;
}

function updateInstructionsDisplay(): void {
  if (!instructionsBody) {
    return;
  }
  const md =
    currentExampleKey && EXAMPLE_INSTRUCTIONS[currentExampleKey]
      ? EXAMPLE_INSTRUCTIONS[currentExampleKey]
      : null;
  if (md) {
    const html = renderMarkdownWithMath(md);
    instructionsBody.innerHTML = DOMPurify.sanitize(html);
  } else {
    instructionsBody.innerHTML =
      '<p class="instructions-placeholder">Select an example from the dropdown to see its instructions.</p>';
  }
}

type OutputTab = "output" | "instructions";

function setOutputTab(tab: OutputTab): void {
  const outputTabBtn = document.getElementById("tab-output");
  const instructionsTabBtn = document.getElementById("tab-instructions");
  const outputContent = document.getElementById("output-content");
  const instructionsContent = document.getElementById("instructions-content");

  if (!(outputTabBtn && instructionsTabBtn && outputContent && instructionsContent)) {
    return;
  }

  const isOutput = tab === "output";
  outputTabBtn.setAttribute("aria-selected", String(isOutput));
  instructionsTabBtn.setAttribute("aria-selected", String(!isOutput));
  outputContent.hidden = !isOutput;
  instructionsContent.hidden = isOutput;
}

function handleToggleConsole(): void {
  toggleConsole(consolePanel, toggleConsoleBtn);
}

function handleThemeChange(dark: boolean): void {
  setEditorTheme(dark);
}

function handleFontIncrease(): void {
  changeEditorFontSize(2);
}

function handleFontDecrease(): void {
  changeEditorFontSize(-2);
}

// ---- Global keyboard shortcuts ----

function handleShortcutsKeydown(e: KeyboardEvent): void {
  const target = e.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();
  const isEditing = tagName === "input" || tagName === "textarea" || tagName === "select";
  const isInEditor = target.closest(".cm-editor") !== null;

  if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey && !isEditing && !isInEditor) {
    e.preventDefault();
    openShortcutsDialog();
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === "b" && !e.altKey && !e.shiftKey && !isInEditor) {
    e.preventDefault();
    toggleSidebar();
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === "s" && !e.altKey && !e.shiftKey) {
    e.preventDefault();
    openSnippetsDialog();
    return;
  }

  if (e.key === "Escape") {
    const snippetsOverlay = document.getElementById("snippets-dialog-overlay");
    if (snippetsOverlay?.classList.contains("visible")) {
      closeSnippetsDialog();
      return;
    }
    const overlay = document.getElementById("shortcuts-dialog-overlay");
    if (overlay?.classList.contains("visible")) {
      closeShortcutsDialog();
    }
  }
}

function initGlobalShortcuts(): void {
  document.addEventListener("keydown", handleShortcutsKeydown);
}

// ---- Query Parameters Application ----

function applyQueryParams(params: QueryParams): void {
  // Apply header visibility
  const header = document.querySelector("header");
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
  if (params.fontSize !== 14) {
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
    showConsole(consolePanel, toggleConsoleBtn);
  }

  // Auto-run with delay to ensure initialization complete
  if (params.run) {
    setTimeout(() => {
      handleRun();
    }, 100);
  }
}

// ---- Bootstrap ----

function getRequiredElement(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Required element #${id} not found`);
  }
  return el;
}

function getRequiredElementBySelector(selector: string): HTMLElement {
  const el = document.querySelector(selector);
  if (!(el && el instanceof HTMLElement)) {
    throw new Error(`Required element ${selector} not found`);
  }
  return el;
}

function init(): void {
  // Parse query parameters at the start
  const queryParams = parseQueryParams(EXAMPLE_KEYS);

  // Resolve DOM elements
  outputDiv = getRequiredElement("output");
  errorDisplay = getRequiredElement("error-display");
  consoleOutput = getRequiredElement("console-output");
  consolePanel = getRequiredElement("console-panel");
  toggleConsoleBtn = getRequiredElement("toggle-console") as HTMLButtonElement;
  clearConsoleBtn = getRequiredElement("clear-console") as HTMLButtonElement;
  gutter = getRequiredElement("gutter");
  editorPanel = getRequiredElementBySelector(".editor-panel");
  outputPanel = getRequiredElementBySelector(".output-panel");
  instructionsBody = getRequiredElement("instructions-body");

  // Build & mount sidebar
  const sidebar = createSidebar({
    onRun: handleRun,
    onStop: handleStop,
    onReset: handleReset,
    onToggleConsole: handleToggleConsole,
    onSnippets: handleSnippets,
    onThemeChange: handleThemeChange,
    onFontIncrease: handleFontIncrease,
    onFontDecrease: handleFontDecrease,
  });
  document.body.insertBefore(sidebar, document.body.firstChild);

  // Initialize editor
  const editorContainer = getRequiredElement("editor");
  initEditor(editorContainer, handleRun);

  // Initialize snippets dialog
  initSnippetsDialog(getCode, setCode);
  document.body.appendChild(buildSnippetsDialog());

  // Resizable panels
  initResizable(gutter, editorPanel, outputPanel);

  // Header examples combobox (populated from src/examples/)
  const examplesSelect = document.getElementById("examples-select") as HTMLSelectElement;
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

  // Output panel tabs (Output | Instructions)
  currentExampleKey = EXAMPLE_KEYS[0] ?? null;
  updateInstructionsDisplay();

  document.getElementById("tab-output")?.addEventListener("click", () => setOutputTab("output"));
  document.getElementById("tab-instructions")?.addEventListener("click", () => {
    setOutputTab("instructions");
    updateInstructionsDisplay();
  });

  // Console panel buttons
  toggleConsoleBtn.addEventListener("click", handleToggleConsole);
  clearConsoleBtn.addEventListener("click", () => clearConsole(consoleOutput));

  // View mode buttons
  document.getElementById("view-code-btn")?.addEventListener("click", () => setViewMode("code"));
  document.getElementById("view-split-btn")?.addEventListener("click", () => setViewMode("split"));
  document
    .getElementById("view-output-btn")
    ?.addEventListener("click", () => setViewMode("output"));

  // Initialize sidebar stop button as disabled
  const stopBtn = document.getElementById("stop-sidebar-btn") as HTMLButtonElement | null;
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
