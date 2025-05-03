import { subMonths } from 'date-fns';
import { RedemptionTableInfo } from './types';

/**
 * To get the current month, extract all the blackout periods, find the most common month amongst
 * the blackout period dates and assume that is the next month (this covers the case where there are
 * multiple months in the blackout period).
 *
 * Then, subtract 1 month to get the current month.
 */
export function getCurrentMonth(
  redemptionTablesInfo: RedemptionTableInfo[],
): Date {
  const datesInYYYYMM = redemptionTablesInfo.flatMap((redemptionInfo) => {
    return redemptionInfo.blackoutPeriod.flatMap((period) => [
      period.from.slice(0, 7),
      period.to.slice(0, 7),
    ]);
  });

  const counts: Record<string, number> = {};
  for (const yyyymm of datesInYYYYMM) {
    counts[yyyymm] = (counts[yyyymm] ?? 0) + 1;
  }

  const mostCommonYYYYMM = Object.entries(counts).reduce((a, b) =>
    a[1] > b[1] ? a : b,
  )[0];
  return subMonths(new Date(`${mostCommonYYYYMM}-01`), 1);
}
