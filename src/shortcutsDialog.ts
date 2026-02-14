import { announce } from "./ui";

export function buildShortcutsDialog(): HTMLElement {
  const overlay = document.createElement("div");
  overlay.id = "shortcuts-dialog-overlay";
  overlay.className = "shortcuts-overlay";
  overlay.setAttribute("role", "presentation");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeShortcutsDialog();
    }
  });

  const dialog = document.createElement("div");
  dialog.id = "shortcuts-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "Keyboard shortcuts");
  dialog.className = "shortcuts-dialog";

  // Header
  const header = document.createElement("div");
  header.className = "shortcuts-dialog-header";
  const title = document.createElement("h2");
  title.textContent = "Keyboard Shortcuts";
  title.id = "shortcuts-dialog-title";
  dialog.setAttribute("aria-labelledby", "shortcuts-dialog-title");

  const closeBtn = document.createElement("button");
  closeBtn.className = "shortcuts-close-btn";
  closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  closeBtn.setAttribute("aria-label", "Close keyboard shortcuts dialog");
  closeBtn.addEventListener("click", closeShortcutsDialog);
  header.appendChild(title);
  header.appendChild(closeBtn);
  dialog.appendChild(header);

  // Shortcut groups
  const body = document.createElement("div");
  body.className = "shortcuts-dialog-body";

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const ctrlKey = isMac ? "\u2318" : "Ctrl";

  const groups: { title: string; shortcuts: { keys: string; description: string }[] }[] = [
    {
      title: "Execution",
      shortcuts: [{ keys: `${ctrlKey} + Enter`, description: "Run code" }],
    },
    {
      title: "Editor",
      shortcuts: [
        { keys: `${ctrlKey} + Z`, description: "Undo" },
        { keys: `${ctrlKey} + Shift + Z`, description: "Redo" },
        { keys: `${ctrlKey} + A`, description: "Select all" },
        { keys: `${ctrlKey} + D`, description: "Select next occurrence" },
        { keys: `${ctrlKey} + /`, description: "Toggle line comment" },
        { keys: `${ctrlKey} + F`, description: "Find and replace" },
        { keys: "Tab", description: "Indent" },
        { keys: "Shift + Tab", description: "Dedent" },
      ],
    },
    {
      title: "Linting",
      shortcuts: [
        { keys: "F8", description: "Go to next lint diagnostic" },
        { keys: `${ctrlKey} + Shift + M`, description: "Open lint panel" },
      ],
    },
    {
      title: "Navigation",
      shortcuts: [
        { keys: `${ctrlKey} + B`, description: "Toggle sidebar" },
        { keys: `${ctrlKey} + S`, description: "Open save/load snippets dialog" },
        { keys: "?", description: "Show this shortcuts dialog" },
        { keys: "Escape", description: "Close dialog / Exit fullscreen" },
      ],
    },
  ];

  for (const group of groups) {
    const section = document.createElement("div");
    section.className = "shortcuts-group";
    const sTitle = document.createElement("h3");
    sTitle.textContent = group.title;
    section.appendChild(sTitle);

    const list = document.createElement("dl");
    list.className = "shortcuts-list";
    for (const shortcut of group.shortcuts) {
      const row = document.createElement("div");
      row.className = "shortcut-row";

      const dt = document.createElement("dt");
      const keys = shortcut.keys.split(" + ");
      dt.innerHTML = keys
        .map((k) => `<kbd>${k}</kbd>`)
        .join('<span class="shortcut-plus">+</span>');

      const dd = document.createElement("dd");
      dd.textContent = shortcut.description;

      row.appendChild(dt);
      row.appendChild(dd);
      list.appendChild(row);
    }
    section.appendChild(list);
    body.appendChild(section);
  }

  dialog.appendChild(body);
  overlay.appendChild(dialog);
  return overlay;
}

export function openShortcutsDialog(): void {
  const overlay = document.getElementById("shortcuts-dialog-overlay");
  if (!overlay) {
    return;
  }
  overlay.classList.add("visible");
  // Focus the close button for keyboard accessibility
  const closeBtn = overlay.querySelector(".shortcuts-close-btn") as HTMLElement | null;
  closeBtn?.focus();
  // Trap focus in dialog
  overlay.addEventListener("keydown", trapFocusInDialog);
}

export function closeShortcutsDialog(): void {
  const overlay = document.getElementById("shortcuts-dialog-overlay");
  if (!overlay) {
    return;
  }
  overlay.classList.remove("visible");
  overlay.removeEventListener("keydown", trapFocusInDialog);
  // Return focus to the shortcuts button
  const triggerBtn = document.getElementById("keyboard-shortcuts-btn");
  triggerBtn?.focus();
  announce("Keyboard shortcuts dialog closed");
}

function trapFocusInDialog(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    closeShortcutsDialog();
    return;
  }
  if (e.key !== "Tab") {
    return;
  }
  const dialog = document.getElementById("shortcuts-dialog");
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
