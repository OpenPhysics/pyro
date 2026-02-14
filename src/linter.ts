import type { Diagnostic as RuffDiagnostic } from "@astral-sh/ruff-wasm-web";
import type { Diagnostic as CmDiagnostic } from "@codemirror/lint";
import { linter, lintGutter } from "@codemirror/lint";
import type { Extension } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

/** Ruff WASM workspace loaded lazily on first lint run. */
let workspace: import("@astral-sh/ruff-wasm-web").Workspace | null = null;
let initPromise: Promise<void> | null = null;
let initFailed = false;

/** Ruff rule categories enabled for linting. */
const LINT_RULES = [
  "E", // pycodestyle errors
  "F", // Pyflakes
  "W", // pycodestyle warnings
  "I", // isort
  "UP", // pyupgrade
  "B", // flake8-bugbear
  "SIM", // flake8-simplify
  "RUF", // Ruff-specific rules
];

/** Initialize the Ruff WASM module and workspace (idempotent). */
async function initRuff(): Promise<void> {
  if (workspace) {
    return;
  }
  if (initFailed) {
    return;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const mod = await import("@astral-sh/ruff-wasm-web");
      await mod.default();

      workspace = new mod.Workspace(
        {
          "line-length": 120,
          "indent-width": 4,
          lint: {
            select: LINT_RULES,
          },
        },
        mod.PositionEncoding.Utf16,
      );
    } catch {
      initFailed = true;
      workspace = null;
    }
  })();

  return initPromise;
}

/** Map a Ruff severity (error code prefix) to a CodeMirror severity. */
function mapSeverity(code: string | null): CmDiagnostic["severity"] {
  if (!code) {
    return "error";
  }
  if (code.startsWith("W")) {
    return "warning";
  }
  if (code.startsWith("I")) {
    return "info";
  }
  return "warning";
}

/**
 * Convert 1-based row/column from Ruff to a 0-based absolute offset
 * in the CodeMirror document.
 */
function toOffset(view: EditorView, row: number, column: number): number {
  const lineIndex = row - 1;
  const lineCount = view.state.doc.lines;

  if (lineIndex < 0) {
    return 0;
  }
  if (lineIndex >= lineCount) {
    return view.state.doc.length;
  }

  const line = view.state.doc.line(row);
  return Math.min(line.from + column, line.to);
}

/** Convert a Ruff diagnostic to a CodeMirror diagnostic. */
function convertDiagnostic(view: EditorView, diag: RuffDiagnostic): CmDiagnostic {
  const from = toOffset(view, diag.start_location.row, diag.start_location.column);
  const to = toOffset(view, diag.end_location.row, diag.end_location.column);

  const codePrefix = diag.code ? `${diag.code}: ` : "";

  const cmDiag: CmDiagnostic = {
    from,
    to: Math.max(to, from),
    severity: mapSeverity(diag.code),
    message: `${codePrefix}${diag.message}`,
    source: "ruff",
  };

  if (diag.fix) {
    cmDiag.actions = [
      {
        name: diag.fix.message ?? "Fix",
        apply(fixView) {
          const changes = diag.fix?.edits.map((edit) => ({
            from: toOffset(fixView, edit.location.row, edit.location.column),
            to: toOffset(fixView, edit.end_location.row, edit.end_location.column),
            insert: edit.content ?? "",
          }));
          if (changes && changes.length > 0) {
            fixView.dispatch({ changes });
          }
        },
      },
    ];
  }

  return cmDiag;
}

/** Lint source function: runs Ruff check and returns CodeMirror diagnostics. */
async function ruffLintSource(view: EditorView): Promise<readonly CmDiagnostic[]> {
  await initRuff();

  if (!workspace) {
    return [];
  }

  const code = view.state.doc.toString();
  if (code.trim().length === 0) {
    return [];
  }

  try {
    const diagnostics = workspace.check(code) as RuffDiagnostic[];
    return diagnostics.map((d) => convertDiagnostic(view, d));
  } catch {
    return [];
  }
}

/** Create the CodeMirror linter extension using Ruff WASM. */
export function ruffLinter(): Extension {
  return [
    linter(ruffLintSource, {
      delay: 300,
    }),
    lintGutter(),
  ];
}
