/**
 * Markdown rendering utilities with KaTeX math support.
 */

import DOMPurify from "dompurify";
import katex from "katex";
import { marked } from "marked";

/**
 * Render markdown content with LaTeX math support.
 * Supports both display math \[...\] and inline math \(...\).
 */
export function renderMarkdownWithMath(markdown: string): string {
  const mathBlocks: string[] = [];

  // Extract and protect display math: \[ ... \]
  let processed = markdown.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex: string) => {
    const index = mathBlocks.length;
    try {
      mathBlocks.push(katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }));
    } catch {
      mathBlocks.push(`\\[${tex}\\]`);
    }
    return `%%MATH_BLOCK_${index}%%`;
  });

  // Extract and protect inline math: \( ... \)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex: string) => {
    const index = mathBlocks.length;
    try {
      mathBlocks.push(
        katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }),
      );
    } catch {
      mathBlocks.push(`\\(${tex}\\)`);
    }
    return `%%MATH_BLOCK_${index}%%`;
  });

  // Run marked on the protected markdown
  let html = marked(processed, { async: false }) as string;

  // Restore math blocks
  for (let i = 0; i < mathBlocks.length; i++) {
    html = html.replace(`%%MATH_BLOCK_${i}%%`, mathBlocks[i] ?? "");
  }

  return html;
}

/**
 * Render and sanitize markdown with math support.
 */
export function renderAndSanitizeMarkdown(markdown: string): string {
  const html = renderMarkdownWithMath(markdown);
  return DOMPurify.sanitize(html);
}
