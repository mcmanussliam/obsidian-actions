/**
 * Converts a given string to `kebab-case`.
 *
 * @example:
 * ```ts
 * kebabCase("HelloWorld") // hello-world
 * kebabCase("Hello World") // hello-world
 * kebabCase("hello_world") // hello-world
 * ```
 */
export function kebabCase(value: string): string {
   return value
		.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
