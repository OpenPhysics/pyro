/** Completion item for the CodeMirror autocomplete system. */
export interface CompletionItem {
  label: string;
  type: string;
  info?: string;
  detail?: string;
}

/** Keys for the built-in example code snippets. */
export type ExampleKey = 'basic' | 'animation' | 'solar' | 'spring' | 'projectile';

/** Map of example keys to their source code. */
export type ExamplesMap = Record<ExampleKey, string>;

/** Message types sent from the execution iframe to the parent window. */
export interface IframeMessage {
  type: 'glowscript-error' | 'glowscript-ready' | 'console-log';
  message?: string;
}

/** A locally saved code snippet. */
export interface Snippet {
  name: string;
  code: string;
  createdAt: number;
}
