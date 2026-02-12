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
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const totalWidth = startEditorWidth + startOutputWidth;
    const newEditorWidth = Math.max(200, Math.min(startEditorWidth + dx, totalWidth - 200));
    const newOutputWidth = totalWidth - newEditorWidth;

    editorPanel.style.flex = "none";
    editorPanel.style.width = newEditorWidth + "px";
    outputPanel.style.flex = "none";
    outputPanel.style.width = newOutputWidth + "px";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      gutter.classList.remove("dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });
}
