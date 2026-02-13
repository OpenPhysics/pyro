import { ICONS } from "./icons";
import { appState } from "./state";

let themeChangeCallback: ((dark: boolean) => void) | undefined;

export function initTheme(onThemeChange?: (dark: boolean) => void): void {
  themeChangeCallback = onThemeChange;
}

export function setDarkMode(dark: boolean): void {
  document.body.classList.toggle("projector-mode", !dark);

  const darkBtn = document.getElementById("dark-sidebar-btn");
  const projBtn = document.getElementById("projector-sidebar-btn");
  darkBtn?.classList.toggle("active", dark);
  projBtn?.classList.toggle("active", !dark);
  darkBtn?.setAttribute("aria-pressed", String(dark));
  projBtn?.setAttribute("aria-pressed", String(!dark));

  themeChangeCallback?.(dark);
}

export function toggleFullScreen(): void {
  appState.isFullScreen = !appState.isFullScreen;
  if (appState.isFullScreen) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
  const btn = document.getElementById("fullscreen-sidebar-btn");
  if (btn) {
    const icon = btn.querySelector(".sidebar-icon");
    if (icon) {
      icon.innerHTML = appState.isFullScreen ? ICONS.exitFullscreen : ICONS.fullscreen;
    }
    const label = btn.querySelector(".sidebar-label");
    if (label) {
      label.textContent = appState.isFullScreen ? "Exit Full Screen" : "Full Screen";
    }
    btn.setAttribute("aria-label", appState.isFullScreen ? "Exit full screen" : "Full screen");
  }
}

// Listen for browser-initiated fullscreen changes (e.g. Escape key)
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && appState.isFullScreen) {
    appState.isFullScreen = false;
    const btn = document.getElementById("fullscreen-sidebar-btn");
    if (btn) {
      const icon = btn.querySelector(".sidebar-icon");
      if (icon) {
        icon.innerHTML = ICONS.fullscreen;
      }
      const label = btn.querySelector(".sidebar-label");
      if (label) {
        label.textContent = "Full Screen";
      }
      btn.setAttribute("aria-label", "Full screen");
    }
  }
});
