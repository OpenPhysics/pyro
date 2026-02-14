import type { Diagnostic as RuffDiagnostic } from "@astral-sh/ruff-wasm-web";
import type { Diagnostic as CmDiagnostic } from "@codemirror/lint";
import { linter, lintGutter, lintKeymap } from "@codemirror/lint";
import type { Extension } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { keymap } from "@codemirror/view";
import { ALL_COMPLETIONS, PROPERTY_COMPLETIONS } from "./completions";

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

/**
 * Rules to ignore in the VPython context.
 * - F403: `from module import *` (standard VPython pattern)
 * - F405: name may be undefined from star import
 * - F821: undefined name (VPython globals like sphere, vector, etc.)
 */
const IGNORED_RULES = new Set(["F403", "F405", "F821"]);

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

// ---- Beginner-friendly message rewriting ----

/** All known identifiers for "did you mean?" suggestions. */
const KNOWN_NAMES: string[] = [
  ...ALL_COMPLETIONS.map((c) => c.label),
  ...PROPERTY_COMPLETIONS.map((c) => c.label),
];

/** Levenshtein edit distance between two strings (two-row approach). */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  let curr: number[] = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const prevDiag = prev[j - 1] ?? 0;
      if (a.charCodeAt(i - 1) === b.charCodeAt(j - 1)) {
        curr[j] = prevDiag;
      } else {
        curr[j] = 1 + Math.min(prev[j] ?? 0, curr[j - 1] ?? 0, prevDiag);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n] ?? 0;
}

/** Find the closest known identifier to `name`, within a reasonable distance. */
function findClosestName(name: string): string | null {
  const maxDist = Math.max(1, Math.floor(name.length / 3));
  let bestMatch: string | null = null;
  let bestDist = maxDist + 1;

  for (const known of KNOWN_NAMES) {
    // Skip if lengths differ too much
    if (Math.abs(known.length - name.length) > maxDist) {
      continue;
    }
    const dist = editDistance(name.toLowerCase(), known.toLowerCase());
    if (dist > 0 && dist < bestDist) {
      bestDist = dist;
      bestMatch = known;
    }
  }

  return bestMatch;
}

/** Static rewrites: code → beginner-friendly message. */
const FRIENDLY_MESSAGES: Record<string, string> = {
  E101: "Mixed tabs and spaces — use only spaces for indentation",
  E111: "Indentation should be a multiple of 4 spaces",
  E117: "This line is indented too far",
  E401: "Put each import on its own line",
  E711: "Use 'is None' or 'is not None' instead of '== None' or '!= None'",
  E712: "Don't compare with '== True' or '== False' — just use the value directly",
  E721: "Use isinstance() to check types instead of type() == ...",
  E731: "Use 'def' to define a function instead of assigning a lambda",
  W291: "Extra whitespace at end of line (remove trailing spaces)",
  W292: "File should end with a newline",
  W293: "Extra whitespace at end of line (remove trailing spaces)",
  SIM118: "Simpler: use 'key in dict' instead of 'key in dict.keys()'",
};

/** Pattern-based rewrites that extract names from the original message. */
function rewritePatternMessage(code: string, message: string): string | null {
  if (code === "F811") {
    const name = message.match(/Redefinition of unused `(\w+)`/)?.[1];
    if (name) {
      return `You already defined '${name}' above but never used it. Did you mean to use a different name?`;
    }
  }
  if (code === "F841") {
    const name = message.match(/Local variable `(\w+)` is assigned to but never used/)?.[1];
    if (name) {
      return `Variable '${name}' is created but never used — is this a typo, or did you forget to use it?`;
    }
  }
  if (code === "B007") {
    const name = message.match(/Loop control variable `(\w+)` not used/)?.[1];
    if (name) {
      return `Loop variable '${name}' is never used in the loop body. Use '_' if you don't need it: for _ in range(...)`;
    }
  }
  return null;
}

/**
 * Beginner-friendly rewrites for common Ruff error messages.
 * Returns a friendlier message, or null to keep the original.
 */
function rewriteMessage(code: string | null, message: string): string | null {
  if (!code) {
    return null;
  }
  return FRIENDLY_MESSAGES[code] ?? rewritePatternMessage(code, message);
}

/** Convert a Ruff diagnostic to a CodeMirror diagnostic. */
function convertDiagnostic(view: EditorView, diag: RuffDiagnostic): CmDiagnostic {
  const from = toOffset(view, diag.start_location.row, diag.start_location.column);
  const to = toOffset(view, diag.end_location.row, diag.end_location.column);

  const codePrefix = diag.code ? `${diag.code}: ` : "";

  // Try beginner-friendly rewrite first
  let friendlyMsg = rewriteMessage(diag.code, diag.message);

  // For undefined-name errors that weren't suppressed, suggest closest match
  if (!friendlyMsg && diag.code === "F821") {
    const nameMatch = diag.message.match(/Undefined name `(\w+)`/);
    const undefinedName = nameMatch?.[1];
    if (undefinedName) {
      const suggestion = findClosestName(undefinedName);
      if (suggestion) {
        friendlyMsg = `'${undefinedName}' is not defined. Did you mean '${suggestion}'?`;
      }
    }
  }

  const displayMessage = friendlyMsg
    ? `${codePrefix}${friendlyMsg}`
    : `${codePrefix}${diag.message}`;

  const cmDiag: CmDiagnostic = {
    from,
    to: Math.max(to, from),
    severity: mapSeverity(diag.code),
    message: displayMessage,
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
    return diagnostics
      .filter((d) => !(d.code && IGNORED_RULES.has(d.code)))
      .map((d) => convertDiagnostic(view, d));
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
    keymap.of(lintKeymap),
  ];
}
