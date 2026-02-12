// ---- SVG icon helpers (inline, no external deps) ----

const ICONS = {
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>`,
  stop: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
  reset: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
  fullscreen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  exitFullscreen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  dark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  projector: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  console: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  fontIncrease: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><text x="2" y="17" font-size="14" font-weight="bold" fill="currentColor" stroke="none">A</text><line x1="18" y1="8" x2="18" y2="16"/><line x1="14" y1="12" x2="22" y2="12"/></svg>`,
  fontDecrease: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><text x="2" y="17" font-size="14" font-weight="bold" fill="currentColor" stroke="none">A</text><line x1="14" y1="12" x2="22" y2="12"/></svg>`,
  keyboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="14" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>`,
  snippet: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
} as const;

// ---- State ----

let isCollapsed = true;
let isFullScreen = false;
let sidebarEl: HTMLElement | null = null;
let storedCallbacks: SidebarCallbacks | null = null;

// ---- Public API ----

export interface SidebarCallbacks {
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onToggleConsole: () => void;
  onSnippets?: () => void;
  onThemeChange?: (dark: boolean) => void;
  onFontIncrease?: () => void;
  onFontDecrease?: () => void;
}

/**
 * Build the sidebar DOM and attach it to the page.
 * Returns the sidebar root element.
 */
export function createSidebar(callbacks: SidebarCallbacks): HTMLElement {
  const sidebar = document.createElement("aside");
  sidebar.id = "sidebar";
  sidebar.className = "sidebar collapsed";
  sidebar.setAttribute("role", "navigation");
  sidebar.setAttribute("aria-label", "Main sidebar");
  sidebarEl = sidebar;
  storedCallbacks = callbacks;

  // Hamburger toggle
  const toggle = document.createElement("button");
  toggle.className = "sidebar-toggle";
  toggle.innerHTML = ICONS.menu;
  toggle.title = "Toggle sidebar";
  toggle.setAttribute("aria-label", "Toggle sidebar");
  toggle.setAttribute("aria-expanded", String(!isCollapsed));
  toggle.setAttribute("aria-controls", "sidebar-nav");
  toggle.addEventListener("click", () => {
    toggleSidebar();
    toggle.setAttribute("aria-expanded", String(!isCollapsed));
  });
  sidebar.appendChild(toggle);

  // Nav container
  const nav = document.createElement("nav");
  nav.className = "sidebar-nav";
  nav.id = "sidebar-nav";
  nav.setAttribute("aria-label", "Editor tools");

  // --- Execution section ---
  nav.appendChild(sectionLabel("Run"));
  nav.appendChild(navButton("run-sidebar-btn", ICONS.play, "Run", callbacks.onRun, "sidebar-run"));
  nav.appendChild(
    navButton("stop-sidebar-btn", ICONS.stop, "Stop", callbacks.onStop, "sidebar-stop"),
  );

  // --- File section ---
  nav.appendChild(divider());
  nav.appendChild(sectionLabel("File"));
  nav.appendChild(
    navButton("snippets-sidebar-btn", ICONS.snippet, "Snippets", () => callbacks.onSnippets?.()),
  );

  // --- View section ---
  nav.appendChild(divider());
  nav.appendChild(sectionLabel("View"));
  nav.appendChild(
    navButton("console-sidebar-btn", ICONS.console, "Console", callbacks.onToggleConsole),
  );
  nav.appendChild(navButton("reset-sidebar-btn", ICONS.reset, "Reset", callbacks.onReset));
  nav.appendChild(
    navButton("fullscreen-sidebar-btn", ICONS.fullscreen, "Full Screen", () => toggleFullScreen()),
  );
  nav.appendChild(
    navButton("font-increase-btn", ICONS.fontIncrease, "Font Larger", () =>
      callbacks.onFontIncrease?.(),
    ),
  );
  nav.appendChild(
    navButton("font-decrease-btn", ICONS.fontDecrease, "Font Smaller", () =>
      callbacks.onFontDecrease?.(),
    ),
  );

  // --- Help section ---
  nav.appendChild(divider());
  nav.appendChild(sectionLabel("Help"));
  nav.appendChild(
    navButton("keyboard-shortcuts-btn", ICONS.keyboard, "Shortcuts", () => openShortcutsDialog()),
  );

  // --- Theme section ---
  nav.appendChild(divider());
  nav.appendChild(sectionLabel("Theme"));

  const darkBtn = navButton(
    "dark-sidebar-btn",
    ICONS.dark,
    "Dark Mode",
    () => setDarkMode(true),
    "sidebar-theme-dark active",
  );
  darkBtn.setAttribute("aria-pressed", "true");
  nav.appendChild(darkBtn);

  const projBtn = navButton(
    "projector-sidebar-btn",
    ICONS.projector,
    "Projector",
    () => setDarkMode(false),
    "sidebar-theme-projector",
  );
  projBtn.setAttribute("aria-pressed", "false");
  nav.appendChild(projBtn);

  sidebar.appendChild(nav);

  // Build keyboard shortcuts dialog (hidden by default)
  sidebar.appendChild(buildShortcutsDialog());

  return sidebar;
}

// ---- Sidebar collapse / expand ----

export function toggleSidebar(): void {
  if (!sidebarEl) return;
  isCollapsed = !isCollapsed;
  sidebarEl.classList.toggle("collapsed", isCollapsed);
}

// ---- Full-screen toggle ----

function toggleFullScreen(): void {
  isFullScreen = !isFullScreen;
  if (isFullScreen) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
  const btn = document.getElementById("fullscreen-sidebar-btn");
  if (btn) {
    const icon = btn.querySelector(".sidebar-icon");
    if (icon) icon.innerHTML = isFullScreen ? ICONS.exitFullscreen : ICONS.fullscreen;
    const label = btn.querySelector(".sidebar-label");
    if (label) label.textContent = isFullScreen ? "Exit Full Screen" : "Full Screen";
    btn.setAttribute("aria-label", isFullScreen ? "Exit full screen" : "Full screen");
  }
}

// listen for browser-initiated fullscreen changes (e.g. Escape key)
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && isFullScreen) {
    isFullScreen = false;
    const btn = document.getElementById("fullscreen-sidebar-btn");
    if (btn) {
      const icon = btn.querySelector(".sidebar-icon");
      if (icon) icon.innerHTML = ICONS.fullscreen;
      const label = btn.querySelector(".sidebar-label");
      if (label) label.textContent = "Full Screen";
      btn.setAttribute("aria-label", "Full screen");
    }
  }
});

// ---- Dark / Projector mode ----

function setDarkMode(dark: boolean): void {
  document.body.classList.toggle("projector-mode", !dark);

  const darkBtn = document.getElementById("dark-sidebar-btn");
  const projBtn = document.getElementById("projector-sidebar-btn");
  darkBtn?.classList.toggle("active", dark);
  projBtn?.classList.toggle("active", !dark);
  darkBtn?.setAttribute("aria-pressed", String(dark));
  projBtn?.setAttribute("aria-pressed", String(!dark));

  storedCallbacks?.onThemeChange?.(dark);
}

// ---- Keyboard Shortcuts Dialog ----

function buildShortcutsDialog(): HTMLElement {
  const overlay = document.createElement("div");
  overlay.id = "shortcuts-dialog-overlay";
  overlay.className = "shortcuts-overlay";
  overlay.setAttribute("role", "presentation");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeShortcutsDialog();
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
        { keys: `${ctrlKey} + F`, description: "Find" },
        { keys: `${ctrlKey} + H`, description: "Find and replace" },
        { keys: "Tab", description: "Indent" },
        { keys: "Shift + Tab", description: "Dedent" },
      ],
    },
    {
      title: "Navigation",
      shortcuts: [
        { keys: `${ctrlKey} + B`, description: "Toggle sidebar" },
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
  if (!overlay) return;
  overlay.classList.add("visible");
  // Focus the close button for keyboard accessibility
  const closeBtn = overlay.querySelector(".shortcuts-close-btn") as HTMLElement | null;
  closeBtn?.focus();
  // Trap focus in dialog
  overlay.addEventListener("keydown", trapFocusInDialog);
}

export function closeShortcutsDialog(): void {
  const overlay = document.getElementById("shortcuts-dialog-overlay");
  if (!overlay) return;
  overlay.classList.remove("visible");
  overlay.removeEventListener("keydown", trapFocusInDialog);
  // Return focus to the shortcuts button
  const triggerBtn = document.getElementById("keyboard-shortcuts-btn");
  triggerBtn?.focus();
}

function trapFocusInDialog(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    closeShortcutsDialog();
    return;
  }
  if (e.key !== "Tab") return;
  const dialog = document.getElementById("shortcuts-dialog");
  if (!dialog) return;
  const focusable = dialog.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ---- DOM helpers ----

function sectionLabel(text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "sidebar-section-label";
  el.textContent = text;
  el.setAttribute("aria-hidden", "true");
  return el;
}

function divider(): HTMLElement {
  const el = document.createElement("div");
  el.className = "sidebar-divider";
  el.setAttribute("role", "separator");
  return el;
}

function navButton(
  id: string,
  iconSvg: string,
  label: string,
  onClick: () => void,
  extraClass?: string,
): HTMLElement {
  const btn = document.createElement("button");
  btn.id = id;
  btn.className = "sidebar-btn" + (extraClass ? " " + extraClass : "");
  btn.title = label;
  btn.setAttribute("aria-label", label);
  btn.innerHTML = `<span class="sidebar-icon" aria-hidden="true">${iconSvg}</span><span class="sidebar-label">${label}</span>`;
  btn.addEventListener("click", onClick);
  return btn;
}
