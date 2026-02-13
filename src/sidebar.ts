import { ICONS } from "./icons";
import { buildShortcutsDialog, openShortcutsDialog } from "./shortcutsDialog";
import { appState } from "./state";
import { initTheme, setDarkMode, toggleFullScreen } from "./theme";

// ---- State ----

let sidebarEl: HTMLElement | null = null;

// ---- Public API ----

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

  // Initialize theme with callback
  initTheme(callbacks.onThemeChange);

  // Hamburger toggle
  const toggle = document.createElement("button");
  toggle.className = "sidebar-toggle";
  toggle.innerHTML = ICONS.menu;
  toggle.title = "Toggle sidebar";
  toggle.setAttribute("aria-label", "Toggle sidebar");
  toggle.setAttribute("aria-expanded", String(!appState.isSidebarCollapsed));
  toggle.setAttribute("aria-controls", "sidebar-nav");
  toggle.addEventListener("click", () => {
    toggleSidebar();
    toggle.setAttribute("aria-expanded", String(!appState.isSidebarCollapsed));
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
  const snippetsBtn = navButton("snippets-sidebar-btn", ICONS.snippet, "Snippets", () =>
    callbacks.onSnippets?.(),
  );
  snippetsBtn.setAttribute("aria-controls", "snippets-dialog-overlay");
  nav.appendChild(snippetsBtn);
  nav.appendChild(
    navButton("download-sidebar-btn", ICONS.download, "Download", () => callbacks.onDownload?.()),
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
  const shortcutsBtn = navButton("keyboard-shortcuts-btn", ICONS.keyboard, "Shortcuts", () =>
    openShortcutsDialog(),
  );
  shortcutsBtn.setAttribute("aria-controls", "shortcuts-dialog-overlay");
  nav.appendChild(shortcutsBtn);

  // --- Theme section ---
  nav.appendChild(divider());
  nav.appendChild(sectionLabel("Theme"));

  const themeGroup = document.createElement("div");
  themeGroup.setAttribute("role", "group");
  themeGroup.setAttribute("aria-label", "Theme selection");

  const darkBtn = navButton(
    "dark-sidebar-btn",
    ICONS.dark,
    "Dark Mode",
    () => setDarkMode(true),
    "sidebar-theme-dark active",
  );
  darkBtn.setAttribute("aria-pressed", "true");
  themeGroup.appendChild(darkBtn);

  const projBtn = navButton(
    "projector-sidebar-btn",
    ICONS.projector,
    "Projector",
    () => setDarkMode(false),
    "sidebar-theme-projector",
  );
  projBtn.setAttribute("aria-pressed", "false");
  themeGroup.appendChild(projBtn);

  nav.appendChild(themeGroup);

  sidebar.appendChild(nav);

  // Build keyboard shortcuts dialog (hidden by default)
  sidebar.appendChild(buildShortcutsDialog());

  return sidebar;
}

// ---- Sidebar collapse / expand ----

export function toggleSidebar(): void {
  if (!sidebarEl) {
    return;
  }
  appState.isSidebarCollapsed = !appState.isSidebarCollapsed;
  sidebarEl.classList.toggle("collapsed", appState.isSidebarCollapsed);
}

/** Hide or show the sidebar entirely (not just collapse). */
export function setSidebarVisible(visible: boolean): void {
  if (!sidebarEl) {
    return;
  }
  sidebarEl.style.display = visible ? "" : "none";
  const appWrapper = document.getElementById("app-wrapper");
  if (appWrapper) {
    appWrapper.classList.toggle("sidebar-hidden", !visible);
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
  btn.className = `sidebar-btn${extraClass ? ` ${extraClass}` : ""}`;
  btn.title = label;
  btn.setAttribute("aria-label", label);
  btn.innerHTML = `<span class="sidebar-icon" aria-hidden="true">${iconSvg}</span><span class="sidebar-label">${label}</span>`;
  btn.addEventListener("click", onClick);
  return btn;
}
