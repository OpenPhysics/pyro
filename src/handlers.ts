/**
 * Event handlers for the application.
 * These functions are called in response to user actions.
 */

import { dom } from "./dom";
import { changeEditorFontSize, getCode, setCode, setEditorTheme } from "./editor";
import { EXAMPLE_INSTRUCTIONS, EXAMPLES } from "./examples";
import { runCode, stopExecution } from "./executor";
import { renderAndSanitizeMarkdown } from "./markdown";
import { openSnippetsDialog } from "./snippetsDialog";
import { addConsoleLog, announce, clearConsole, hideError, showError, toggleConsole } from "./ui";

// ---- State ----

let currentExampleKey: string | null = null;

// ---- Getters/Setters for state ----

export function getCurrentExampleKey(): string | null {
  return currentExampleKey;
}

export function setCurrentExampleKey(key: string | null): void {
  currentExampleKey = key;
}

// ---- Run/Stop state management ----

export function updateRunState(running: boolean): void {
  const runBtn = dom.runBtn;
  const stopBtn = dom.stopBtn;
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

// ---- Event Handlers ----

export function handleRun(): void {
  void runCode(getCode, dom.output, {
    onError: (msg) => showError(dom.errorDisplay, msg),
    onConsoleLog: (msg) =>
      addConsoleLog(dom.consoleOutput, dom.consolePanel, dom.toggleConsoleBtn, msg),
    hideError: () => hideError(dom.errorDisplay),
    clearConsole: () => clearConsole(dom.consoleOutput),
    onRunStateChange: updateRunState,
  });
}

export function handleStop(): void {
  stopExecution();
  updateRunState(false);
}

export function handleSnippets(): void {
  openSnippetsDialog();
}

export function handleDownload(): void {
  const code = getCode();
  const filename = currentExampleKey ? `${currentExampleKey}.py` : "vpython-code.py";
  const blob = new Blob([code], { type: "text/x-python" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  announce(`Downloaded ${filename}`);
}

export function handleReset(): void {
  stopExecution();
  updateRunState(false);
  dom.output.innerHTML = '<div class="loading">Click "Run" to execute your VPython code</div>';
  hideError(dom.errorDisplay);
}

export function handleExample(key: string): void {
  if (EXAMPLES[key]) {
    setCode(EXAMPLES[key]);
    currentExampleKey = key;
    updateInstructionsDisplay();
  }
}

export function handleToggleConsole(): void {
  toggleConsole(dom.consolePanel, dom.toggleConsoleBtn);
}

export function handleThemeChange(dark: boolean): void {
  setEditorTheme(dark);
}

export function handleFontIncrease(): void {
  changeEditorFontSize(2);
}

export function handleFontDecrease(): void {
  changeEditorFontSize(-2);
}

// ---- Tab management ----

export type OutputTab = "output" | "instructions";

export function setOutputTab(tab: OutputTab): void {
  const outputTabBtn = dom.tabOutput;
  const instructionsTabBtn = dom.tabInstructions;
  const outputContent = dom.outputContent;
  const instructionsContent = dom.instructionsContent;

  if (!(outputTabBtn && instructionsTabBtn && outputContent && instructionsContent)) {
    return;
  }

  const isOutput = tab === "output";
  outputTabBtn.setAttribute("aria-selected", String(isOutput));
  instructionsTabBtn.setAttribute("aria-selected", String(!isOutput));
  outputContent.hidden = !isOutput;
  instructionsContent.hidden = isOutput;
}

// ---- Instructions display ----

export function updateInstructionsDisplay(): void {
  const instructionsBody = dom.instructionsBody;
  if (!instructionsBody) {
    return;
  }
  const md =
    currentExampleKey && EXAMPLE_INSTRUCTIONS[currentExampleKey]
      ? EXAMPLE_INSTRUCTIONS[currentExampleKey]
      : null;
  if (md) {
    instructionsBody.innerHTML = renderAndSanitizeMarkdown(md);
  } else {
    instructionsBody.innerHTML =
      '<p class="instructions-placeholder">Select an example from the dropdown to see its instructions.</p>';
  }
}
