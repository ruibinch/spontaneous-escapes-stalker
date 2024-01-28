import { getMonthsList } from '@/common/get-data-time-range';
import { isApplicableMonth } from '../helpers/is-applicable-month';
import { MonthColumnOrder } from './top-content';

export const getColumns = (filters: {
  startDate: Date;
  endDate: Date;
  months: string[];
  monthColumnOrder: MonthColumnOrder;
}): Array<{
  key: string;
  label: string;
  allowsSorting?: boolean;
}> => {
  const monthsListOldestFirst = getMonthsList();
  const monthsList =
    filters.monthColumnOrder === 'latest'
      ? [...monthsListOldestFirst.reverse()]
      : monthsListOldestFirst;

  return [
    { key: 'actions', label: '' },
    { key: 'from', label: 'FROM', allowsSorting: true },
    { key: 'to', label: 'TO', allowsSorting: true },
    { key: 'count', label: 'COUNT', allowsSorting: true },
    ...monthsList
      .filter((month) =>
        isApplicableMonth({
          month,
          filters,
        }),
      )
      .map((month) => ({
        key: month,
        label: `${month.slice(0, 4)}-${month.slice(4, 6)}`,
      })),
  ];
};
