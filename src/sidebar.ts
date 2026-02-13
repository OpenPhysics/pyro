import { ICONS } from "./icons";
import { buildShortcutsDialog, openShortcutsDialog } from "./shortcutsDialog";
import { initTheme, setDarkMode, toggleFullScreen } from "./theme";

// ---- State ----

let isCollapsed = true;
let sidebarEl: HTMLElement | null = null;

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

  // Initialize theme with callback
  initTheme(callbacks.onThemeChange);

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
  if (!sidebarEl) {
    return;
  }
  isCollapsed = !isCollapsed;
  sidebarEl.classList.toggle("collapsed", isCollapsed);
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
