import { getMonthsList } from '@/common/get-data-time-range';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { isAfter, isBefore } from 'date-fns';

export function filterApplicableMonthsList({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) {
  const months = getMonthsList();
  return months.filter((month) => {
    const monthDate = yyyymmToDate(month);
    const isOutsideDateBounds =
      isBefore(monthDate, startDate) || isAfter(monthDate, endDate);
    return !isOutsideDateBounds;
  });
}
