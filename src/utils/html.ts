/**
 * Creates a `DocumentFragment` containing a span with the given HTML content.
 *
 * @param htmlContent - The HTML string to set inside the span.
 * @returns A `DocumentFragment` containing the span with the HTML content.
 *
 * @example
 * ```ts
 * new Setting()
 *   .setDesc(html('See <a href="https://obsidian.md" target="_blank">Documentation</a>'));
 * ```
 */
export function html(htmlContent: string): DocumentFragment {
  const desc = new DocumentFragment();
  desc.createSpan({}, span => {
    // Controlled HTML content from i18n translations, sanitized at source
    span.innerHTML = htmlContent;
  });

  return desc;
}
