/**
 * Converts the input Date object to the YYYYMM format.
 */
export function dateToYyyymm(d: Date) {
  return (d ?? new Date())
    .toISOString()
    .split('T')[0]
    .slice(0, 7)
    .replace('-', '');
}
