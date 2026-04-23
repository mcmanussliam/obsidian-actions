/**
 * Gets the keys from type `T` whose type extend another type `V`.
 *
 * @example
 * ```ts
 * interface Settings {
 *   name: string;
 *   age: number;
 *   active: boolean;
 * }
 *
 * // Only keys whose type is `string`
 * type StringKeys = TypedKeys<Settings, string>; // name
 *
 * // Only keys whose type is `boolean`
 * type BooleanKeys = TypedKeys<Settings, boolean>; // active
 * ```
 */
export type TypedKeys<T, V> = keyof {
  [P in keyof T as T[P] extends V? P: never]: unknown
}
