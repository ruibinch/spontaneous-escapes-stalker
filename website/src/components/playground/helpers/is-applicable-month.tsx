import { monthNameToNumMap } from '@/common/months-map';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { MONTH_ALL } from '@/components/common/filters/month-filter';
import { isAfter, isBefore } from 'date-fns';

/**
 * Returns if the input month is applicable given the input date-related filters.
 */
export function isApplicableMonth({
  month,
  filters: { startDate, endDate, months },
}: {
  month: string; // YYYYMM format
  filters: {
    startDate: Date;
    endDate: Date;
    months: string[];
  };
}) {
  const monthsInNumFormat = months.map((month) =>
    month === MONTH_ALL ? month : monthNameToNumMap[month],
  );

  const monthDate = yyyymmToDate(month);
  const isOutsideDateBounds =
    isBefore(monthDate, startDate) || isAfter(monthDate, endDate);
  const isValidMonth =
    monthsInNumFormat.includes(MONTH_ALL) ||
    monthsInNumFormat.includes(month.slice(4, 6));

  return !isOutsideDateBounds && isValidMonth;
}
