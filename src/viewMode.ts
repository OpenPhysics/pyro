import { announce } from "./ui";

export type ViewMode = "code" | "split" | "output";

export function setViewMode(mode: ViewMode): void {
  const edPanel = document.querySelector(".editor-panel") as HTMLElement | null;
  const outPanel = document.querySelector(".output-panel") as HTMLElement | null;
  const gutterEl = document.getElementById("gutter");
  if (!(edPanel && outPanel && gutterEl)) {
    return;
  }

  // Reset inline styles from resizable dragging
  edPanel.style.width = "";
  outPanel.style.width = "";

  // Remove all view-mode classes and add the correct one
  const main = document.querySelector("main");
  if (!main) {
    return;
  }
  main.classList.remove("view-code-only", "view-output-only");

  if (mode === "code") {
    main.classList.add("view-code-only");
    edPanel.style.flex = "1";
    outPanel.style.flex = "";
  } else if (mode === "output") {
    main.classList.add("view-output-only");
    edPanel.style.flex = "";
    outPanel.style.flex = "1";
  } else {
    edPanel.style.flex = "1";
    outPanel.style.flex = "1";
  }

  // Update active button state and aria-pressed
  const codeBtn = document.getElementById("view-code-btn");
  const splitBtn = document.getElementById("view-split-btn");
  const outputBtn = document.getElementById("view-output-btn");
  codeBtn?.classList.toggle("active", mode === "code");
  splitBtn?.classList.toggle("active", mode === "split");
  outputBtn?.classList.toggle("active", mode === "output");
  codeBtn?.setAttribute("aria-pressed", String(mode === "code"));
  splitBtn?.setAttribute("aria-pressed", String(mode === "split"));
  outputBtn?.setAttribute("aria-pressed", String(mode === "output"));

  const modeLabels: Record<ViewMode, string> = {
    code: "Code only",
    split: "Split",
    output: "Output only",
  };
  announce(`View mode: ${modeLabels[mode]}`);
}
