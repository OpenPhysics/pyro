import "./styles/main.css";
import { changeEditorFontSize, getCode, initEditor, setCode, setEditorTheme } from "./editor";
import { EXAMPLES } from "./examples";
import { runCode, stopExecution } from "./executor";
import { initResizable } from "./resizable";
import { closeShortcutsDialog, createSidebar, openShortcutsDialog, toggleSidebar } from "./sidebar";
import {
  buildSnippetsDialog,
  closeSnippetsDialog,
  initSnippetsDialog,
  openSnippetsDialog,
} from "./snippetsDialog";
import type { ExampleKey } from "./types";
import { addConsoleLog, announce, clearConsole, hideError, showError, toggleConsole } from "./ui";

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

// ---- Run/Stop state management via sidebar buttons ----

function updateRunState(running: boolean): void {
  const runBtn = document.getElementById("run-sidebar-btn") as HTMLButtonElement | null;
  const stopBtn = document.getElementById("stop-sidebar-btn") as HTMLButtonElement | null;
  if (runBtn) {
    runBtn.disabled = running;
    const label = runBtn.querySelector(".sidebar-label");
    if (label) label.textContent = running ? "Running..." : "Run";
    runBtn.setAttribute("aria-label", running ? "Running..." : "Run");
  }
  if (stopBtn) {
    stopBtn.disabled = !running;
  }
  announce(running ? "Code is running" : "Code execution stopped");
}

// ---- Callbacks wired to the DOM ----

function handleRun(): void {
  runCode(getCode, outputDiv, {
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

function handleExample(key: ExampleKey): void {
  if (EXAMPLES[key]) {
    setCode(EXAMPLES[key]);
  }
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

// ---- View mode (code-only, split, output-only) ----

type ViewMode = "code" | "split" | "output";

function setViewMode(mode: ViewMode): void {
  const edPanel = document.querySelector(".editor-panel") as HTMLElement | null;
  const outPanel = document.querySelector(".output-panel") as HTMLElement | null;
  const gutterEl = document.getElementById("gutter");
  if (!edPanel || !outPanel || !gutterEl) return;

  // Reset inline styles from resizable dragging
  edPanel.style.width = "";
  outPanel.style.width = "";

  // Remove all view-mode classes and add the correct one
  const main = document.querySelector("main")!;
  main.classList.remove("view-code-only", "view-output-only");

  if (mode === "code") {
    main.classList.add("view-code-only");
    edPanel.style.flex = "1";
    outPanel.style.flex = "";
  } else if (mode === "output") {
    main.classList.add("view-output-only");
    edPanel.style.flex = "";
    outPanel.style.flex = "1";
  } else {
    edPanel.style.flex = "1";
    outPanel.style.flex = "1";
  }

  // Update active button state and aria-pressed
  const codeBtn = document.getElementById("view-code-btn");
  const splitBtn = document.getElementById("view-split-btn");
  const outputBtn = document.getElementById("view-output-btn");
  codeBtn?.classList.toggle("active", mode === "code");
  splitBtn?.classList.toggle("active", mode === "split");
  outputBtn?.classList.toggle("active", mode === "output");
  codeBtn?.setAttribute("aria-pressed", String(mode === "code"));
  splitBtn?.setAttribute("aria-pressed", String(mode === "split"));
  outputBtn?.setAttribute("aria-pressed", String(mode === "output"));

  const modeLabels: Record<ViewMode, string> = {
    code: "Code only",
    split: "Split",
    output: "Output only",
  };
  announce(`View mode: ${modeLabels[mode]}`);
}

// ---- Global keyboard shortcuts ----

function initGlobalShortcuts(): void {
  document.addEventListener("keydown", (e) => {
    // Don't trigger shortcuts when typing in inputs/textareas
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isEditing = tagName === "input" || tagName === "textarea" || tagName === "select";
    const isInEditor = target.closest(".cm-editor") !== null;

    // ? key (without modifiers) opens shortcuts dialog — only when not editing
    if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey && !isEditing && !isInEditor) {
      e.preventDefault();
      openShortcutsDialog();
      return;
    }

    // Ctrl/Cmd + B toggles sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === "b" && !e.altKey && !e.shiftKey) {
      // Don't prevent default in editor (bold text in some contexts)
      if (!isInEditor) {
        e.preventDefault();
        toggleSidebar();
      }
    }

    // Escape closes dialogs
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
  });
}

// ---- Bootstrap ----

function init(): void {
  // Resolve DOM elements
  outputDiv = document.getElementById("output")!;
  errorDisplay = document.getElementById("error-display")!;
  consoleOutput = document.getElementById("console-output")!;
  consolePanel = document.getElementById("console-panel")!;
  toggleConsoleBtn = document.getElementById("toggle-console") as HTMLButtonElement;
  clearConsoleBtn = document.getElementById("clear-console") as HTMLButtonElement;
  gutter = document.getElementById("gutter")!;
  editorPanel = document.querySelector(".editor-panel")!;
  outputPanel = document.querySelector(".output-panel")!;

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
  const editorContainer = document.getElementById("editor")!;
  initEditor(editorContainer, handleRun);

  // Initialize snippets dialog
  initSnippetsDialog(getCode, setCode);
  document.body.appendChild(buildSnippetsDialog());

  // Resizable panels
  initResizable(gutter, editorPanel, outputPanel);

  // Header examples combobox
  const examplesSelect = document.getElementById("examples-select") as HTMLSelectElement;
  examplesSelect.addEventListener("change", (e) => {
    const key = (e.target as HTMLSelectElement).value as ExampleKey;
    if (key) {
      handleExample(key);
      examplesSelect.value = "";
    }
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
  if (stopBtn) stopBtn.disabled = true;

  // Initial output placeholder
  outputDiv.innerHTML = '<div class="loading">Click "Run" to execute your VPython code</div>';

  // Initialize global keyboard shortcuts
  initGlobalShortcuts();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
