/**
 * Converts a string in the format YYYYMM to a Date object with day at 02.
 */
export function yyyymmToDate(s: string) {
  return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-02`);
}
