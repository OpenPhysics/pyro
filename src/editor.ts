import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { autocompletion } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { Compartment } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { basicSetup, EditorView } from "codemirror";
import {
  ALL_COMPLETIONS,
  PROPERTY_COMPLETIONS,
  VPYTHON_COLORS,
  VPYTHON_SCENE,
} from "./completions";
import { DEFAULT_CODE } from "./examples";

const STORAGE_KEY = "vpython-editor-code";

let editor: EditorView | null = null;
const themeCompartment = new Compartment();

/** Custom completion source for VPython. */
function vpythonCompletions(context: CompletionContext): CompletionResult | null {
  const beforeCursor = context.matchBefore(/[\w.]+/);
  if (!beforeCursor) {
    return null;
  }

  const text = beforeCursor.text;
  const dotIndex = text.lastIndexOf(".");

  if (dotIndex >= 0) {
    const objectPart = text.slice(0, dotIndex);

    if (objectPart === "color" || objectPart.endsWith(".color")) {
      const colorOptions = VPYTHON_COLORS.filter((c) => c.label.startsWith("color.")).map((c) => ({
        ...c,
        label: c.label.replace("color.", ""),
      }));
      return {
        from: beforeCursor.from + dotIndex + 1,
        options: colorOptions,
        validFor: /^[\w]*$/,
      };
    }

    if (objectPart === "scene") {
      const sceneOptions = VPYTHON_SCENE.filter((s) => s.label.startsWith("scene.")).map((s) => ({
        ...s,
        label: s.label.replace("scene.", ""),
      }));
      return {
        from: beforeCursor.from + dotIndex + 1,
        options: sceneOptions,
        validFor: /^[\w]*$/,
      };
    }

    return {
      from: beforeCursor.from + dotIndex + 1,
      options: PROPERTY_COMPLETIONS,
      validFor: /^[\w]*$/,
    };
  }

  return {
    from: beforeCursor.from,
    options: ALL_COMPLETIONS,
    validFor: /^[\w]*$/,
  };
}

/** Initialize the CodeMirror editor instance. */
export function initEditor(container: HTMLElement, onRun: () => void): void {
  const runKeymap = keymap.of([
    {
      key: "Ctrl-Enter",
      run: () => {
        onRun();
        return true;
      },
    },
    {
      key: "Cmd-Enter",
      run: () => {
        onRun();
        return true;
      },
    },
  ]);

  const savedCode = localStorage.getItem(STORAGE_KEY);
  const initialCode = savedCode || DEFAULT_CODE;

  editor = new EditorView({
    doc: initialCode,
    extensions: [
      runKeymap,
      basicSetup,
      python(),
      themeCompartment.of(oneDark),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      EditorView.lineWrapping,
      autocompletion({
        override: [vpythonCompletions],
        activateOnTyping: true,
        maxRenderedOptions: 50,
      }),
    ],
    parent: container,
  });
}

/** Get the current editor content. */
export function getCode(): string {
  if (!editor) {
    return "";
  }
  return editor.state.doc.toString();
}

/** Replace the editor content. */
export function setCode(code: string): void {
  if (!editor) {
    return;
  }
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: code },
  });
}

/** Switch the editor between dark (oneDark) and light (default) themes. */
export function setEditorTheme(dark: boolean): void {
  if (!editor) {
    return;
  }
  editor.dispatch({
    effects: themeCompartment.reconfigure(dark ? oneDark : []),
  });
}

/** Change the editor font size by a delta (in pixels). */
let currentFontSize = 14;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 28;

export function changeEditorFontSize(delta: number): void {
  currentFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, currentFontSize + delta));
  const cmEditor = document.querySelector(".cm-editor") as HTMLElement | null;
  if (cmEditor) {
    cmEditor.style.fontSize = `${currentFontSize}px`;
  }
}
