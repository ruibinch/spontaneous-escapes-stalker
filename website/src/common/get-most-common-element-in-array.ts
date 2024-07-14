/**
 * Returns the most common occurring element in the array.
 * This is not the most efficient way to do this, but it is the most concise.
 */
export function getMostCommonElementInArray<T>(arr: T[]) {
  return [...arr]
    .sort(
      (a, b) =>
        arr.filter((v) => v === a).length - arr.filter((v) => v === b).length,
    )
    .pop();
}
