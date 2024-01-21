import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { isAfter, isBefore, isEqual } from 'date-fns';

export function filterApplicableMonthsList({
  months,
  startDate,
  endDate,
}: {
  months: string[];
  startDate?: Date;
  endDate?: Date;
}) {
  return months.filter((month) => {
    const monthDate = yyyymmToDate(month);
    const isAfterOrEqualStartDate = startDate
      ? isAfter(monthDate, startDate) || isEqual(monthDate, startDate)
      : true;
    const isBeforeOrEqualEndDate = endDate
      ? isBefore(monthDate, endDate) || isEqual(monthDate, endDate)
      : true;

    return isAfterOrEqualStartDate && isBeforeOrEqualEndDate;
  });
}
