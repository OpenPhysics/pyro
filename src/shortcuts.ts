/**
 * Global keyboard shortcuts handling.
 */

import { closeShortcutsDialog, openShortcutsDialog } from "./shortcutsDialog";
import { toggleSidebar } from "./sidebar";
import { closeSnippetsDialog, openSnippetsDialog } from "./snippetsDialog";

/**
 * Handle global keyboard shortcuts.
 */
function handleShortcutsKeydown(e: KeyboardEvent): void {
  const target = e.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();
  const isEditing = tagName === "input" || tagName === "textarea" || tagName === "select";
  const isInEditor = target.closest(".cm-editor") !== null;

  // ? - Open shortcuts dialog
  if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey && !isEditing && !isInEditor) {
    e.preventDefault();
    openShortcutsDialog();
    return;
  }

  // Ctrl/Cmd+B - Toggle sidebar
  if ((e.ctrlKey || e.metaKey) && e.key === "b" && !e.altKey && !e.shiftKey && !isInEditor) {
    e.preventDefault();
    toggleSidebar();
    return;
  }

  // Ctrl/Cmd+S - Open snippets dialog
  if ((e.ctrlKey || e.metaKey) && e.key === "s" && !e.altKey && !e.shiftKey) {
    e.preventDefault();
    openSnippetsDialog();
    return;
  }

  // Escape - Close open dialogs
  if (e.key === "Escape") {
    const snippetsOverlay = document.getElementById("snippets-dialog-overlay");
    if (snippetsOverlay?.classList.contains("visible")) {
      closeSnippetsDialog();
      return;
    }
    const shortcutsOverlay = document.getElementById("shortcuts-dialog-overlay");
    if (shortcutsOverlay?.classList.contains("visible")) {
      closeShortcutsDialog();
    }
  }
}

/**
 * Initialize global keyboard shortcuts.
 */
export function initGlobalShortcuts(): void {
  document.addEventListener("keydown", handleShortcutsKeydown);
}
