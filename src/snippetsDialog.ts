import { deleteSnippet, loadSnippets, overwriteSnippet, saveSnippet } from "./snippets";
import type { Snippet } from "./types";
import { announce, escapeHtml, showNotification } from "./ui";

let getCodeFn: (() => string) | null = null;
let setCodeFn: ((code: string) => void) | null = null;

/** Initialize the snippets dialog with editor accessors. */
export function initSnippetsDialog(getCode: () => string, setCode: (code: string) => void): void {
  getCodeFn = getCode;
  setCodeFn = setCode;
}

/** Build the snippets dialog DOM (hidden by default). */
export function buildSnippetsDialog(): HTMLElement {
  const overlay = document.createElement("div");
  overlay.id = "snippets-dialog-overlay";
  overlay.className = "snippets-overlay";
  overlay.setAttribute("role", "presentation");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeSnippetsDialog();
    }
  });

  const dialog = document.createElement("div");
  dialog.id = "snippets-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "Code snippets");
  dialog.className = "snippets-dialog";

  // Header
  const header = document.createElement("div");
  header.className = "snippets-dialog-header";
  const title = document.createElement("h2");
  title.textContent = "Code Snippets";
  title.id = "snippets-dialog-title";
  dialog.setAttribute("aria-labelledby", "snippets-dialog-title");

  const closeBtn = document.createElement("button");
  closeBtn.className = "snippets-close-btn";
  closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  closeBtn.setAttribute("aria-label", "Close snippets dialog");
  closeBtn.addEventListener("click", closeSnippetsDialog);
  header.appendChild(title);
  header.appendChild(closeBtn);
  dialog.appendChild(header);

  // Body
  const body = document.createElement("div");
  body.className = "snippets-dialog-body";

  // Save form
  const saveSection = document.createElement("div");
  saveSection.className = "snippets-save-section";
  const saveLabel = document.createElement("h3");
  saveLabel.textContent = "Save Current Code";
  saveSection.appendChild(saveLabel);

  const saveForm = document.createElement("div");
  saveForm.className = "snippets-save-form";

  const nameLabel = document.createElement("label");
  nameLabel.htmlFor = "snippet-name-input";
  nameLabel.textContent = "Snippet name";
  nameLabel.className = "snippets-input-label";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = "snippet-name-input";
  nameInput.placeholder = "Enter a name...";
  nameInput.maxLength = 60;

  const saveBtn = document.createElement("button");
  saveBtn.className = "snippets-save-btn";
  saveBtn.textContent = "Save";
  saveBtn.setAttribute("aria-label", "Save snippet");
  saveBtn.addEventListener("click", () => handleSaveSnippet(nameInput));

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveSnippet(nameInput);
    }
  });

  saveForm.appendChild(nameLabel);
  saveForm.appendChild(nameInput);
  saveForm.appendChild(saveBtn);
  saveSection.appendChild(saveForm);
  body.appendChild(saveSection);

  // Saved snippets list
  const listSection = document.createElement("div");
  listSection.className = "snippets-list-section";
  const listLabel = document.createElement("h3");
  listLabel.textContent = "Saved Snippets";
  listSection.appendChild(listLabel);

  const listContainer = document.createElement("div");
  listContainer.id = "snippets-list";
  listContainer.className = "snippets-list";
  listSection.appendChild(listContainer);
  body.appendChild(listSection);

  dialog.appendChild(body);
  overlay.appendChild(dialog);
  return overlay;
}

/** Open the snippets dialog and refresh the list. */
export function openSnippetsDialog(): void {
  const overlay = document.getElementById("snippets-dialog-overlay");
  if (!overlay) {
    return;
  }
  overlay.classList.add("visible");
  refreshSnippetsList();
  const nameInput = document.getElementById("snippet-name-input") as HTMLInputElement | null;
  nameInput?.focus();
  overlay.addEventListener("keydown", trapFocusInSnippetsDialog);
}

/** Close the snippets dialog. */
export function closeSnippetsDialog(): void {
  const overlay = document.getElementById("snippets-dialog-overlay");
  if (!overlay) {
    return;
  }
  overlay.classList.remove("visible");
  overlay.removeEventListener("keydown", trapFocusInSnippetsDialog);
  const triggerBtn = document.getElementById("snippets-sidebar-btn");
  triggerBtn?.focus();
  announce("Snippets dialog closed");
}

function handleSaveSnippet(nameInput: HTMLInputElement): void {
  const name = nameInput.value.trim();
  if (!name) {
    showNotification("Please enter a snippet name", "error");
    nameInput.focus();
    return;
  }
  if (!getCodeFn) {
    return;
  }
  const code = getCodeFn();
  if (!code.trim()) {
    showNotification("Nothing to save — editor is empty", "error");
    return;
  }

  const saved = saveSnippet(name, code);
  if (!saved) {
    // Name already exists — ask to overwrite via a confirm-style UI
    if (confirm(`A snippet named "${name}" already exists. Overwrite it?`)) {
      overwriteSnippet(name, code);
      showNotification(`Snippet "${name}" updated!`);
    } else {
      return;
    }
  } else {
    showNotification(`Snippet "${name}" saved!`);
  }
  nameInput.value = "";
  refreshSnippetsList();
}

function refreshSnippetsList(): void {
  const container = document.getElementById("snippets-list");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  const snippets = loadSnippets();
  if (snippets.length === 0) {
    const empty = document.createElement("div");
    empty.className = "snippets-empty";
    empty.textContent = "No saved snippets yet.";
    container.appendChild(empty);
    return;
  }

  for (const snippet of snippets) {
    container.appendChild(buildSnippetRow(snippet));
  }
}

function buildSnippetRow(snippet: Snippet): HTMLElement {
  const row = document.createElement("div");
  row.className = "snippet-row";

  const info = document.createElement("div");
  info.className = "snippet-info";

  const nameEl = document.createElement("span");
  nameEl.className = "snippet-name";
  nameEl.textContent = snippet.name;

  const dateEl = document.createElement("span");
  dateEl.className = "snippet-date";
  dateEl.textContent = formatDate(snippet.createdAt);

  const preview = document.createElement("div");
  preview.className = "snippet-preview";
  const previewText = snippet.code.split("\n").slice(0, 3).join("\n");
  preview.innerHTML = `<pre>${escapeHtml(previewText)}</pre>`;

  info.appendChild(nameEl);
  info.appendChild(dateEl);
  row.appendChild(info);
  row.appendChild(preview);

  const actions = document.createElement("div");
  actions.className = "snippet-actions";

  const loadBtn = document.createElement("button");
  loadBtn.className = "snippet-load-btn";
  loadBtn.textContent = "Load";
  loadBtn.setAttribute("aria-label", `Load snippet "${snippet.name}"`);
  loadBtn.addEventListener("click", () => {
    if (!setCodeFn) {
      return;
    }
    setCodeFn(snippet.code);
    showNotification(`Loaded "${snippet.name}"`, "info");
    announce(`Loaded snippet: ${snippet.name}`);
    closeSnippetsDialog();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "snippet-delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute("aria-label", `Delete snippet "${snippet.name}"`);
  deleteBtn.addEventListener("click", () => {
    if (confirm(`Delete snippet "${snippet.name}"?`)) {
      deleteSnippet(snippet.name);
      showNotification(`Deleted "${snippet.name}"`, "info");
      refreshSnippetsList();
    }
  });

  actions.appendChild(loadBtn);
  actions.appendChild(deleteBtn);
  row.appendChild(actions);

  return row;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

function trapFocusInSnippetsDialog(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    closeSnippetsDialog();
    return;
  }
  if (e.key !== "Tab") {
    return;
  }
  const dialog = document.getElementById("snippets-dialog");
  if (!dialog) {
    return;
  }
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
  if (focusable.length === 0) {
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!(first && last)) {
    return;
  }
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
