/**
 * Creates a `DocumentFragment` containing a span with the given HTML content.
 *
 * @param innerHTML - The HTML string to set inside the span.
 * @returns A `DocumentFragment` containing the span with the HTML content.
 *
 * @example
 * ```ts
 * new Setting()
 *   .setDesc(html('See <a href="https://obsidian.md" target="_blank">Documentation</a>'));
 * ```
 */
export function html(innerHTML: string): DocumentFragment {
  const desc = new DocumentFragment();
  desc.createSpan({}, span => {
    span.innerHTML = innerHTML;
  });

  return desc;
}
