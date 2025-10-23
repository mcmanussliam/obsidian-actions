/**
 * Creates a {@link Map} from an iterable by mapping each element to a key–value pair.
 *
 * @example
 * const users = [
 *   {id: 6, name: 'Fooby'},
 *   {id: 7, name: 'Baro'},
 * ];
 *
 * const userMap = keyByMap(users, u => u.id, u => u.name);
 * // Map(2) {6 => 'Fooby', 7 => 'Baro'}
 */
export function keyByMap<A, K, M>(
  iter: Iterable<A>,
  keyFn: (_el: A, _i: number) => K,
  mapFn: (_el: A, _i: number) => M = (x) => x as unknown as M
): Map<K, M> {
  const result = new Map<K, M>();

  let i = 0;
  for (const el of iter) {
    result.set(keyFn(el, i), mapFn(el, i));
    i++;
  }

  return result;
}
