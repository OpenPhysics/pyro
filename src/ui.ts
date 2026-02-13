import { CONFIG } from "./config";

/** Escape HTML to prevent XSS. */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/** Announce a message to screen readers via the live region. */
export function announce(message: string): void {
  const region = document.getElementById("sr-announcements");
  if (!region) {
    return;
  }
  region.textContent = message;
  // Clear after a delay so repeated identical messages are re-announced
  setTimeout(() => {
    region.textContent = "";
  }, 1000);
}

/** Show an error message in the error display element. */
export function showError(errorDisplay: HTMLElement, message: string): void {
  errorDisplay.innerHTML = `<pre>${escapeHtml(message)}</pre>`;
  errorDisplay.classList.add("visible");
  announce(`Error: ${message}`);
}

/** Hide the error display element. */
export function hideError(errorDisplay: HTMLElement): void {
  errorDisplay.classList.remove("visible");
  errorDisplay.innerHTML = "";
}

/** Append a log line to the console output. */
export function addConsoleLog(
  consoleOutput: HTMLElement,
  consolePanel: HTMLElement,
  toggleConsoleBtn: HTMLButtonElement,
  message: string,
): void {
  const line = document.createElement("div");
  line.className = "log-line";
  line.textContent = message;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;

  if (!consolePanel.classList.contains("visible")) {
    toggleConsole(consolePanel, toggleConsoleBtn);
  }
}

/** Clear all console output lines. */
export function clearConsole(consoleOutput: HTMLElement): void {
  consoleOutput.innerHTML = "";
  announce("Console cleared");
}

/** Toggle the console panel visibility. */
export function toggleConsole(
  consolePanel: HTMLElement,
  toggleConsoleBtn: HTMLButtonElement,
): void {
  consolePanel.classList.toggle("visible");
  toggleConsoleBtn.classList.toggle("active");
  const isVisible = consolePanel.classList.contains("visible");
  toggleConsoleBtn.setAttribute("aria-expanded", String(isVisible));
  toggleConsoleBtn.textContent = "Console";
}

/** Show the console panel (idempotent - does nothing if already visible). */
export function showConsole(consolePanel: HTMLElement, toggleConsoleBtn: HTMLButtonElement): void {
  if (!consolePanel.classList.contains("visible")) {
    consolePanel.classList.add("visible");
    toggleConsoleBtn.classList.add("active");
    toggleConsoleBtn.setAttribute("aria-expanded", "true");
    toggleConsoleBtn.textContent = "Console";
  }
}

/** Show a toast notification. */
export function showNotification(
  message: string,
  type: "success" | "error" | "info" = "success",
): void {
  const notification = document.createElement("div");
  notification.className = "save-notification";
  notification.setAttribute("role", "status");
  notification.textContent = message;
  if (type === "error") {
    notification.style.backgroundColor = "#f44336";
  } else if (type === "info") {
    notification.style.backgroundColor = "#2196f3";
  }
  document.body.appendChild(notification);
  announce(message);
  setTimeout(() => notification.remove(), CONFIG.ui.notificationDurationMs);
}
