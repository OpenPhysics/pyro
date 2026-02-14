import type { Completion } from "@codemirror/autocomplete";
import { snippetCompletion } from "@codemirror/autocomplete";

/**
 * Python snippet templates with tab stops for beginners.
 *
 * Tab stop syntax (CodeMirror snippet format, NOT JS template literals):
 *   ${n}       — cursor stop (numbered)
 *   ${n:text}  — cursor stop with default text
 *   \n\t       — newline + indent
 */

export const PYTHON_SNIPPETS: Completion[] = [
  snippetCompletion("for ${1:i} in range(${2:10}):\n\t${3:pass}", {
    label: "for",
    type: "keyword",
    detail: "for i in range(...):",
    info: "For loop with range",
    boost: 5,
  }),
  snippetCompletion("for ${1:item} in ${2:items}:\n\t${3:pass}", {
    label: "for in",
    type: "keyword",
    detail: "for item in iterable:",
    info: "For loop over iterable",
    boost: 4,
  }),
  snippetCompletion("while ${1:True}:\n\t${2:rate(60)}\n\t${3:pass}", {
    label: "while",
    type: "keyword",
    detail: "while condition:",
    info: "While loop (with rate for animations)",
    boost: 5,
  }),
  snippetCompletion("def ${1:name}(${2:}):\n\t${3:pass}", {
    label: "def",
    type: "keyword",
    detail: "def name(...):",
    info: "Define a function",
    boost: 5,
  }),
  snippetCompletion("if ${1:condition}:\n\t${2:pass}", {
    label: "if",
    type: "keyword",
    detail: "if condition:",
    info: "If statement",
    boost: 5,
  }),
  snippetCompletion("elif ${1:condition}:\n\t${2:pass}", {
    label: "elif",
    type: "keyword",
    detail: "elif condition:",
    info: "Else-if branch",
    boost: 5,
  }),
  snippetCompletion("else:\n\t${1:pass}", {
    label: "else",
    type: "keyword",
    detail: "else:",
    info: "Else branch",
    boost: 5,
  }),
  snippetCompletion("class ${1:Name}:\n\tdef __init__(self${2:}):\n\t\t${3:pass}", {
    label: "class",
    type: "keyword",
    detail: "class Name:",
    info: "Define a class with __init__",
    boost: 5,
  }),
  snippetCompletion("try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:print(e)}", {
    label: "try",
    type: "keyword",
    detail: "try/except",
    info: "Try-except error handling",
    boost: 5,
  }),
  snippetCompletion("with ${1:expr} as ${2:var}:\n\t${3:pass}", {
    label: "with",
    type: "keyword",
    detail: "with ... as ...:",
    info: "Context manager",
    boost: 3,
  }),
];

/** Labels of keywords that have snippet versions (to filter from plain keyword completions). */
export const SNIPPET_KEYWORD_LABELS = new Set(PYTHON_SNIPPETS.map((s) => s.label));
