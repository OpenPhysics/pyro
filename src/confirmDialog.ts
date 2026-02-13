/**
 * Accessible confirm dialog to replace native confirm().
 */

import { announce } from "./ui";

let currentDialog: HTMLElement | null = null;
let resolvePromise: ((value: boolean) => void) | null = null;

/**
 * Show an accessible confirm dialog.
 * Returns a Promise that resolves to true (confirm) or false (cancel).
 */
export function showConfirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    resolvePromise = resolve;

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "confirm-dialog-overlay";
    overlay.className = "confirm-overlay visible";
    overlay.setAttribute("role", "presentation");
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeConfirmDialog(false);
      }
    });

    // Create dialog
    const dialog = document.createElement("div");
    dialog.id = "confirm-dialog";
    dialog.className = "confirm-dialog";
    dialog.setAttribute("role", "alertdialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "confirm-dialog-message");

    // Message
    const messageEl = document.createElement("p");
    messageEl.id = "confirm-dialog-message";
    messageEl.className = "confirm-message";
    messageEl.textContent = message;
    dialog.appendChild(messageEl);

    // Buttons
    const buttons = document.createElement("div");
    buttons.className = "confirm-buttons";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "confirm-btn confirm-btn-cancel";
    cancelBtn.textContent = "Cancel";
    cancelBtn.setAttribute("aria-label", "Cancel");
    cancelBtn.addEventListener("click", () => closeConfirmDialog(false));

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "confirm-btn confirm-btn-confirm";
    confirmBtn.textContent = "Confirm";
    confirmBtn.setAttribute("aria-label", "Confirm");
    confirmBtn.addEventListener("click", () => closeConfirmDialog(true));

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    dialog.appendChild(buttons);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    currentDialog = overlay;

    // Focus the cancel button (safer default)
    cancelBtn.focus();

    // Add keyboard handler
    overlay.addEventListener("keydown", handleConfirmKeydown);

    // Announce for screen readers
    announce(message);
  });
}

function closeConfirmDialog(result: boolean): void {
  if (currentDialog) {
    currentDialog.removeEventListener("keydown", handleConfirmKeydown);
    currentDialog.remove();
    currentDialog = null;
  }
  if (resolvePromise) {
    resolvePromise(result);
    resolvePromise = null;
  }
  announce(result ? "Confirmed" : "Cancelled");
}

function handleConfirmKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    e.preventDefault();
    closeConfirmDialog(false);
    return;
  }

  if (e.key === "Tab") {
    const dialog = document.getElementById("confirm-dialog");
    if (!dialog) {
      return;
    }
    const buttons = Array.from(dialog.querySelectorAll<HTMLElement>("button"));
    if (buttons.length < 2) {
      return;
    }
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
}
