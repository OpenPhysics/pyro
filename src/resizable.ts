import { CONFIG } from "./config";
import { announce } from "./ui";

/** Set up drag-to-resize behaviour on the gutter between two panels. */
export function initResizable(
  gutter: HTMLElement,
  editorPanel: HTMLElement,
  outputPanel: HTMLElement,
): void {
  let isDragging = false;
  let startX: number;
  let startEditorWidth: number;
  let startOutputWidth: number;

  const KEYBOARD_STEP = CONFIG.ui.keyboardResizeStep;
  const MIN_PANEL_WIDTH = CONFIG.ui.minPanelWidth;

  /** Update ARIA value to reflect current split percentage */
  function updateAriaValue(): void {
    const totalWidth = editorPanel.offsetWidth + outputPanel.offsetWidth;
    const percentage = Math.round((editorPanel.offsetWidth / totalWidth) * 100);
    gutter.setAttribute("aria-valuenow", String(percentage));
  }

  /** Resize panels by a delta amount */
  function resizePanels(dx: number): void {
    const totalWidth = editorPanel.offsetWidth + outputPanel.offsetWidth;
    const newEditorWidth = Math.max(
      MIN_PANEL_WIDTH,
      Math.min(editorPanel.offsetWidth + dx, totalWidth - MIN_PANEL_WIDTH),
    );
    const newOutputWidth = totalWidth - newEditorWidth;

    editorPanel.style.flex = "none";
    editorPanel.style.width = `${newEditorWidth}px`;
    outputPanel.style.flex = "none";
    outputPanel.style.width = `${newOutputWidth}px`;
    updateAriaValue();
  }

  // Mouse drag support
  gutter.addEventListener("mousedown", (e: MouseEvent) => {
    isDragging = true;
    gutter.classList.add("dragging");
    startX = e.clientX;
    startEditorWidth = editorPanel.offsetWidth;
    startOutputWidth = outputPanel.offsetWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e: MouseEvent) => {
    if (!isDragging) {
      return;
    }

    const dx = e.clientX - startX;
    const totalWidth = startEditorWidth + startOutputWidth;
    const newEditorWidth = Math.max(
      MIN_PANEL_WIDTH,
      Math.min(startEditorWidth + dx, totalWidth - MIN_PANEL_WIDTH),
    );
    const newOutputWidth = totalWidth - newEditorWidth;

    editorPanel.style.flex = "none";
    editorPanel.style.width = `${newEditorWidth}px`;
    outputPanel.style.flex = "none";
    outputPanel.style.width = `${newOutputWidth}px`;
    updateAriaValue();
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      gutter.classList.remove("dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });

  // Keyboard support for accessibility
  gutter.addEventListener("keydown", (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
      case "Left":
        e.preventDefault();
        resizePanels(-KEYBOARD_STEP);
        announce("Editor panel narrower");
        break;
      case "ArrowRight":
      case "Right":
        e.preventDefault();
        resizePanels(KEYBOARD_STEP);
        announce("Editor panel wider");
        break;
      case "Home":
        e.preventDefault();
        resizePanels(-editorPanel.offsetWidth + MIN_PANEL_WIDTH);
        announce("Editor panel minimized");
        break;
      case "End":
        e.preventDefault();
        resizePanels(outputPanel.offsetWidth - MIN_PANEL_WIDTH);
        announce("Output panel minimized");
        break;
    }
  });

  // Touch support for mobile accessibility
  let touchStartX: number;
  let touchStartEditorWidth: number;
  let touchStartOutputWidth: number;

  gutter.addEventListener(
    "touchstart",
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) {
        return;
      }
      touchStartX = touch.clientX;
      touchStartEditorWidth = editorPanel.offsetWidth;
      touchStartOutputWidth = outputPanel.offsetWidth;
      gutter.classList.add("dragging");
    },
    { passive: true },
  );

  gutter.addEventListener(
    "touchmove",
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) {
        return;
      }
      const dx = touch.clientX - touchStartX;
      const totalWidth = touchStartEditorWidth + touchStartOutputWidth;
      const newEditorWidth = Math.max(
        MIN_PANEL_WIDTH,
        Math.min(touchStartEditorWidth + dx, totalWidth - MIN_PANEL_WIDTH),
      );
      const newOutputWidth = totalWidth - newEditorWidth;

      editorPanel.style.flex = "none";
      editorPanel.style.width = `${newEditorWidth}px`;
      outputPanel.style.flex = "none";
      outputPanel.style.width = `${newOutputWidth}px`;
      updateAriaValue();
    },
    { passive: true },
  );

  gutter.addEventListener("touchend", () => {
    gutter.classList.remove("dragging");
  });
}
