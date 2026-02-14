import type { Extension } from "@codemirror/state";
import type { Tooltip } from "@codemirror/view";
import { type EditorView, hoverTooltip } from "@codemirror/view";
import {
  ALL_COMPLETIONS,
  PROPERTY_COMPLETIONS,
  VPYTHON_COLORS,
  VPYTHON_SCENE,
} from "./completions";
import type { CompletionItem } from "./types";

/** Lookup map from identifier to completion item for fast hover resolution. */
const HOVER_LOOKUP: Map<string, CompletionItem> = new Map();

// Add property completions first so that top-level functions (with richer docs)
// take priority over property variants for shared names like mag, dot, cross, etc.
for (const item of PROPERTY_COMPLETIONS) {
  HOVER_LOOKUP.set(item.label, item);
}
for (const item of ALL_COMPLETIONS) {
  HOVER_LOOKUP.set(item.label, item);
}

/** Resolve the word (or dotted path) at `pos` in the document. */
function getWordAt(
  view: EditorView,
  pos: number,
): { word: string; from: number; to: number } | null {
  const line = view.state.doc.lineAt(pos);
  const text = line.text;
  const col = pos - line.from;

  // Expand left to find start of dotted identifier (e.g. "scene.background")
  let start = col;
  while (start > 0 && /[\w.]/.test(text.charAt(start - 1))) {
    start--;
  }

  // Expand right to find end of identifier
  let end = col;
  while (end < text.length && /\w/.test(text.charAt(end))) {
    end++;
  }

  if (start === end) {
    return null;
  }

  return {
    word: text.slice(start, end),
    from: line.from + start,
    to: line.from + end,
  };
}

/** Look up a VPython identifier and return the matching completion item. */
function lookupItem(word: string): CompletionItem | null {
  // Direct match (e.g. "sphere", "scene.background", "color.red")
  const direct = HOVER_LOOKUP.get(word);
  if (direct) {
    return direct;
  }

  // For dotted paths like "ball.pos" → look up "pos" in properties
  const dotIndex = word.lastIndexOf(".");
  if (dotIndex >= 0) {
    const prefix = word.slice(0, dotIndex);
    const prop = word.slice(dotIndex + 1);

    // color.X completions
    if (prefix === "color" || prefix.endsWith(".color")) {
      const colorItem = VPYTHON_COLORS.find((c) => c.label === `color.${prop}`);
      if (colorItem) {
        return colorItem;
      }
    }

    // scene.X completions
    if (prefix === "scene") {
      const sceneItem = VPYTHON_SCENE.find((s) => s.label === `scene.${prop}`);
      if (sceneItem) {
        return sceneItem;
      }
    }

    // Generic property lookup (e.g. ball.pos → "pos")
    const propItem = PROPERTY_COMPLETIONS.find((p) => p.label === prop);
    if (propItem) {
      return propItem;
    }
  }

  return null;
}

/** Hover tooltip source: shows VPython API docs on hover. */
function vpythonHoverSource(view: EditorView, pos: number, _side: -1 | 1): Tooltip | null {
  const result = getWordAt(view, pos);
  if (!result) {
    return null;
  }

  const item = lookupItem(result.word);
  if (!item?.info) {
    return null;
  }

  return {
    pos: result.from,
    end: result.to,
    above: true,
    create() {
      const container = document.createElement("div");
      container.className = "cm-vpython-tooltip";

      const header = document.createElement("div");
      header.className = "cm-vpython-tooltip-header";

      const name = document.createElement("span");
      name.className = "cm-vpython-tooltip-name";
      name.textContent = item.label;
      header.appendChild(name);

      if (item.detail) {
        const detail = document.createElement("span");
        detail.className = "cm-vpython-tooltip-detail";
        detail.textContent = item.detail;
        header.appendChild(detail);
      }

      container.appendChild(header);

      if (item.info) {
        const info = document.createElement("div");
        info.className = "cm-vpython-tooltip-info";
        info.textContent = item.info;
        container.appendChild(info);
      }

      if (item.type) {
        const badge = document.createElement("span");
        badge.className = "cm-vpython-tooltip-type";
        badge.textContent = item.type;
        container.appendChild(badge);
      }

      return { dom: container };
    },
  };
}

/** Create the hover tooltip extension for VPython API docs. */
export function vpythonTooltips(): Extension {
  return hoverTooltip(vpythonHoverSource, {
    hideOnChange: true,
    hoverTime: 350,
  });
}
