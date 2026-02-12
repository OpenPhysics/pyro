import './styles/main.css';
import { initEditor, getCode, setCode, setEditorTheme } from './editor';
import { EXAMPLES } from './examples';
import { runCode, stopExecution } from './executor';
import { initResizable } from './resizable';
import { createSidebar } from './sidebar';
import {
  showError,
  hideError,
  addConsoleLog,
  clearConsole,
  toggleConsole,
  showNotification,
} from './ui';
import type { ExampleKey } from './types';

const STORAGE_KEY = 'vpython-editor-code';

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
  const runBtn = document.getElementById('run-sidebar-btn') as HTMLButtonElement | null;
  const stopBtn = document.getElementById('stop-sidebar-btn') as HTMLButtonElement | null;
  if (runBtn) {
    runBtn.disabled = running;
    const label = runBtn.querySelector('.sidebar-label');
    if (label) label.textContent = running ? 'Running...' : 'Run';
  }
  if (stopBtn) {
    stopBtn.disabled = !running;
  }
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

function handleSave(): void {
  const code = getCode();
  localStorage.setItem(STORAGE_KEY, code);
  showNotification('Code saved to browser!');
}

function handleLoad(): void {
  const savedCode = localStorage.getItem(STORAGE_KEY);
  if (savedCode) {
    setCode(savedCode);
    showNotification('Code loaded!', 'info');
  } else {
    showNotification('No saved code found', 'error');
  }
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

// ---- Bootstrap ----

function init(): void {
  // Resolve DOM elements
  outputDiv = document.getElementById('output')!;
  errorDisplay = document.getElementById('error-display')!;
  consoleOutput = document.getElementById('console-output')!;
  consolePanel = document.getElementById('console-panel')!;
  toggleConsoleBtn = document.getElementById('toggle-console') as HTMLButtonElement;
  clearConsoleBtn = document.getElementById('clear-console') as HTMLButtonElement;
  gutter = document.getElementById('gutter')!;
  editorPanel = document.querySelector('.editor-panel')!;
  outputPanel = document.querySelector('.output-panel')!;

  // Build & mount sidebar
  const sidebar = createSidebar({
    onRun: handleRun,
    onStop: handleStop,
    onSave: handleSave,
    onLoad: handleLoad,
    onReset: handleReset,
    onToggleConsole: handleToggleConsole,
    onThemeChange: handleThemeChange,
  });
  document.body.insertBefore(sidebar, document.body.firstChild);

  // Initialize editor
  const editorContainer = document.getElementById('editor')!;
  initEditor(editorContainer, handleRun, handleSave);

  // Resizable panels
  initResizable(gutter, editorPanel, outputPanel);

  // Header examples combobox
  const examplesSelect = document.getElementById('examples-select') as HTMLSelectElement;
  examplesSelect.addEventListener('change', (e) => {
    const key = (e.target as HTMLSelectElement).value as ExampleKey;
    if (key) {
      handleExample(key);
      examplesSelect.value = '';
    }
  });

  // Console panel buttons
  toggleConsoleBtn.addEventListener('click', handleToggleConsole);
  clearConsoleBtn.addEventListener('click', () => clearConsole(consoleOutput));

  // Initialize sidebar stop button as disabled
  const stopBtn = document.getElementById('stop-sidebar-btn') as HTMLButtonElement | null;
  if (stopBtn) stopBtn.disabled = true;

  // Initial output placeholder
  outputDiv.innerHTML = '<div class="loading">Click "Run" to execute your VPython code</div>';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
