/** Escape HTML to prevent XSS. */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Show an error message in the error display element. */
export function showError(errorDisplay: HTMLElement, message: string): void {
  errorDisplay.innerHTML = `<pre>${escapeHtml(message)}</pre>`;
  errorDisplay.classList.add('visible');
}

/** Hide the error display element. */
export function hideError(errorDisplay: HTMLElement): void {
  errorDisplay.classList.remove('visible');
  errorDisplay.innerHTML = '';
}

/** Append a log line to the console output. */
export function addConsoleLog(
  consoleOutput: HTMLElement,
  consolePanel: HTMLElement,
  toggleConsoleBtn: HTMLButtonElement,
  message: string,
): void {
  const line = document.createElement('div');
  line.className = 'log-line';
  line.textContent = message;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;

  if (!consolePanel.classList.contains('visible')) {
    toggleConsole(consolePanel, toggleConsoleBtn);
  }
}

/** Clear all console output lines. */
export function clearConsole(consoleOutput: HTMLElement): void {
  consoleOutput.innerHTML = '';
}

/** Toggle the console panel visibility. */
export function toggleConsole(
  consolePanel: HTMLElement,
  toggleConsoleBtn: HTMLButtonElement,
): void {
  consolePanel.classList.toggle('visible');
  toggleConsoleBtn.classList.toggle('active');
  toggleConsoleBtn.textContent = consolePanel.classList.contains('visible')
    ? 'Console'
    : 'Console';
}

/** Show a toast notification. */
export function showNotification(
  message: string,
  type: 'success' | 'error' | 'info' = 'success',
): void {
  const notification = document.createElement('div');
  notification.className = 'save-notification';
  notification.textContent = message;
  if (type === 'error') {
    notification.style.backgroundColor = '#f44336';
  } else if (type === 'info') {
    notification.style.backgroundColor = '#2196f3';
  }
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}
