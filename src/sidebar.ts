// ---- SVG icon helpers (inline, no external deps) ----

const ICONS = {
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`,
  stop: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
  save: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  load: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
  reset: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
  fullscreen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  exitFullscreen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  dark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  projector: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  console: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  fontIncrease: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="2" y="17" font-size="14" font-weight="bold" fill="currentColor" stroke="none">A</text><line x1="18" y1="8" x2="18" y2="16"/><line x1="14" y1="12" x2="22" y2="12"/></svg>`,
  fontDecrease: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="2" y="17" font-size="14" font-weight="bold" fill="currentColor" stroke="none">A</text><line x1="14" y1="12" x2="22" y2="12"/></svg>`,
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
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  onToggleConsole: () => void;
  onThemeChange?: (dark: boolean) => void;
  onFontIncrease?: () => void;
  onFontDecrease?: () => void;
}

/**
 * Build the sidebar DOM and attach it to the page.
 * Returns the sidebar root element.
 */
export function createSidebar(callbacks: SidebarCallbacks): HTMLElement {
  const sidebar = document.createElement('aside');
  sidebar.id = 'sidebar';
  sidebar.className = 'sidebar collapsed';
  sidebarEl = sidebar;
  storedCallbacks = callbacks;

  // Hamburger toggle
  const toggle = document.createElement('button');
  toggle.className = 'sidebar-toggle';
  toggle.innerHTML = ICONS.menu;
  toggle.title = 'Toggle sidebar';
  toggle.addEventListener('click', () => toggleSidebar());
  sidebar.appendChild(toggle);

  // Nav container
  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';

  // --- Execution section ---
  nav.appendChild(sectionLabel('Run'));
  nav.appendChild(
    navButton('run-sidebar-btn', ICONS.play, 'Run', callbacks.onRun, 'sidebar-run'),
  );
  nav.appendChild(
    navButton('stop-sidebar-btn', ICONS.stop, 'Stop', callbacks.onStop, 'sidebar-stop'),
  );

  // --- File section ---
  nav.appendChild(divider());
  nav.appendChild(sectionLabel('File'));
  nav.appendChild(navButton('save-sidebar-btn', ICONS.save, 'Save', callbacks.onSave));
  nav.appendChild(navButton('load-sidebar-btn', ICONS.load, 'Load', callbacks.onLoad));

  // --- View section ---
  nav.appendChild(divider());
  nav.appendChild(sectionLabel('View'));
  nav.appendChild(
    navButton('console-sidebar-btn', ICONS.console, 'Console', callbacks.onToggleConsole),
  );
  nav.appendChild(
    navButton('reset-sidebar-btn', ICONS.reset, 'Reset', callbacks.onReset),
  );
  nav.appendChild(
    navButton('fullscreen-sidebar-btn', ICONS.fullscreen, 'Full Screen', () => toggleFullScreen()),
  );
  nav.appendChild(
    navButton('font-increase-btn', ICONS.fontIncrease, 'Font Larger', () => callbacks.onFontIncrease?.()),
  );
  nav.appendChild(
    navButton('font-decrease-btn', ICONS.fontDecrease, 'Font Smaller', () => callbacks.onFontDecrease?.()),
  );

  // --- Theme section ---
  nav.appendChild(divider());
  nav.appendChild(sectionLabel('Theme'));
  nav.appendChild(
    navButton('dark-sidebar-btn', ICONS.dark, 'Dark Mode', () => setDarkMode(true), 'sidebar-theme-dark active'),
  );
  nav.appendChild(
    navButton('projector-sidebar-btn', ICONS.projector, 'Projector', () => setDarkMode(false), 'sidebar-theme-projector'),
  );

  sidebar.appendChild(nav);
  return sidebar;
}

// ---- Sidebar collapse / expand ----

export function toggleSidebar(): void {
  if (!sidebarEl) return;
  isCollapsed = !isCollapsed;
  sidebarEl.classList.toggle('collapsed', isCollapsed);
}

// ---- Full-screen toggle ----

function toggleFullScreen(): void {
  isFullScreen = !isFullScreen;
  if (isFullScreen) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
  const btn = document.getElementById('fullscreen-sidebar-btn');
  if (btn) {
    const icon = btn.querySelector('.sidebar-icon');
    if (icon) icon.innerHTML = isFullScreen ? ICONS.exitFullscreen : ICONS.fullscreen;
    const label = btn.querySelector('.sidebar-label');
    if (label) label.textContent = isFullScreen ? 'Exit Full Screen' : 'Full Screen';
  }
}

// listen for browser-initiated fullscreen changes (e.g. Escape key)
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && isFullScreen) {
    isFullScreen = false;
    const btn = document.getElementById('fullscreen-sidebar-btn');
    if (btn) {
      const icon = btn.querySelector('.sidebar-icon');
      if (icon) icon.innerHTML = ICONS.fullscreen;
      const label = btn.querySelector('.sidebar-label');
      if (label) label.textContent = 'Full Screen';
    }
  }
});

// ---- Dark / Projector mode ----

function setDarkMode(dark: boolean): void {
  document.body.classList.toggle('projector-mode', !dark);

  const darkBtn = document.getElementById('dark-sidebar-btn');
  const projBtn = document.getElementById('projector-sidebar-btn');
  darkBtn?.classList.toggle('active', dark);
  projBtn?.classList.toggle('active', !dark);

  storedCallbacks?.onThemeChange?.(dark);
}

// ---- DOM helpers ----

function sectionLabel(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'sidebar-section-label';
  el.textContent = text;
  return el;
}

function divider(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'sidebar-divider';
  return el;
}

function navButton(
  id: string,
  iconSvg: string,
  label: string,
  onClick: () => void,
  extraClass?: string,
): HTMLElement {
  const btn = document.createElement('button');
  btn.id = id;
  btn.className = 'sidebar-btn' + (extraClass ? ' ' + extraClass : '');
  btn.title = label;
  btn.innerHTML = `<span class="sidebar-icon">${iconSvg}</span><span class="sidebar-label">${label}</span>`;
  btn.addEventListener('click', onClick);
  return btn;
}
