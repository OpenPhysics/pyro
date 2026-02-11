import './styles/main.css';
import { initEditor, getCode, setCode } from './editor';
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
let runBtn: HTMLButtonElement;
let stopBtn: HTMLButtonElement;
let toggleConsoleBtn: HTMLButtonElement;
let clearConsoleBtn: HTMLButtonElement;
let gutter: HTMLElement;
let editorPanel: HTMLElement;
let outputPanel: HTMLElement;

// ---- Callbacks wired to the DOM ----

function handleRun(): void {
  runCode(getCode, outputDiv, runBtn, stopBtn, {
    onError: (msg) => showError(errorDisplay, msg),
    onConsoleLog: (msg) => addConsoleLog(consoleOutput, consolePanel, toggleConsoleBtn, msg),
    hideError: () => hideError(errorDisplay),
    clearConsole: () => clearConsole(consoleOutput),
  });
}

function handleStop(): void {
  stopExecution(runBtn, stopBtn);
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
  stopExecution(runBtn, stopBtn);
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

// ---- Bootstrap ----

function init(): void {
  // Resolve DOM elements
  outputDiv = document.getElementById('output')!;
  errorDisplay = document.getElementById('error-display')!;
  consoleOutput = document.getElementById('console-output')!;
  consolePanel = document.getElementById('console-panel')!;
  runBtn = document.getElementById('run-btn') as HTMLButtonElement;
  stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;
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
    onExample: handleExample,
    onToggleConsole: handleToggleConsole,
  });
  document.body.insertBefore(sidebar, document.body.firstChild);

  // Initialize editor
  const editorContainer = document.getElementById('editor')!;
  initEditor(editorContainer, handleRun, handleSave);

  // Resizable panels
  initResizable(gutter, editorPanel, outputPanel);

  // Header button listeners
  runBtn.addEventListener('click', handleRun);
  stopBtn.addEventListener('click', handleStop);
  document.getElementById('clear-btn')!.addEventListener('click', handleReset);
  document.getElementById('save-btn')!.addEventListener('click', handleSave);
  document.getElementById('load-btn')!.addEventListener('click', handleLoad);

  const examplesSelect = document.getElementById('examples-select') as HTMLSelectElement;
  examplesSelect.addEventListener('change', (e) => {
    const key = (e.target as HTMLSelectElement).value as ExampleKey;
    if (key) {
      handleExample(key);
      examplesSelect.value = '';
    }
  });

  toggleConsoleBtn.addEventListener('click', handleToggleConsole);
  clearConsoleBtn.addEventListener('click', () => clearConsole(consoleOutput));

  // Initial output placeholder
  outputDiv.innerHTML = '<div class="loading">Click "Run" to execute your VPython code</div>';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
