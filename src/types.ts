/** Completion item for the CodeMirror autocomplete system. */
export interface CompletionItem {
  label: string;
  type: string;
  info?: string;
  detail?: string;
}

/** Map of example keys (filename without extension) to their source code. */
export type ExamplesMap = Record<string, string>;

/** Message types sent from the execution iframe to the parent window. */
export interface IframeMessage {
  type: "glowscript-error" | "glowscript-ready" | "console-log";
  message?: string;
}

/** A locally saved code snippet. */
export interface Snippet {
  name: string;
  code: string;
  createdAt: number;
}

/** Callbacks for sidebar actions */
export interface SidebarCallbacks {
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onToggleConsole: () => void;
  onSnippets?: () => void;
  onDownload?: () => void;
  onThemeChange?: (dark: boolean) => void;
  onFontIncrease?: () => void;
  onFontDecrease?: () => void;
}

/** Callbacks for code execution */
export interface ExecutionCallbacks {
  onError: (message: string) => void;
  onConsoleLog: (message: string) => void;
  hideError: () => void;
  clearConsole: () => void;
  onRunStateChange: (running: boolean) => void;
}

/** Callbacks for iframe execution */
export interface IframeCallbacks {
  onError: (message: string) => void;
  onConsoleLog: (message: string) => void;
  onReady: () => void;
}

/** Callbacks for snippets dialog */
export interface SnippetsDialogCallbacks {
  getCode: () => string;
  setCode: (code: string) => void;
}

/** Theme change callback */
export type ThemeChangeCallback = (dark: boolean) => void;

/** Run state change callback */
export type RunStateChangeCallback = (running: boolean) => void;
