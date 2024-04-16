export function generateFromProbabilityMap(
  probabilityMap: Record<string, number>,
) {
  const rand = Math.random();
  let cumulative = 0;

  for (const key in probabilityMap) {
    cumulative += probabilityMap[key];
    if (rand <= cumulative) {
      return key;
    }
  }

  const lastKey = Object.keys(probabilityMap).pop() as string;
  return lastKey;
}
