/**
 * Centralized configuration constants for the application.
 * All magic numbers and configuration values should be defined here.
 */

export const CONFIG = {
  storage: {
    editorCode: "vpython-editor-code",
    snippets: "vpython-snippets",
  },
  editor: {
    minFontSize: 10,
    maxFontSize: 28,
    defaultFontSize: 14,
  },
  executor: {
    timeoutMs: 20_000,
    maxPollAttempts: 50,
    pollIntervalMs: 100,
    glowscriptVersion: "3.2",
    iframeBgColor: "#1a1a1a",
  },
  ui: {
    notificationDurationMs: 2_000,
    minPanelWidth: 200,
    keyboardResizeStep: 50,
  },
} as const;

export type Config = typeof CONFIG;
