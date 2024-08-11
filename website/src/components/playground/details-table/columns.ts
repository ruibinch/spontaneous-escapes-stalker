import { getMonthsList } from '@/common/get-data-time-range';
import { isApplicableMonth } from '../helpers/is-applicable-month';
import { MonthColumnOrder, ShowRoutesAs } from './top-content';

export const getColumns = (filters: {
  startDate: Date;
  endDate: Date;
  months: string[];
  monthColumnOrder: MonthColumnOrder;
  showRoutesAs: ShowRoutesAs;
}): Array<{
  key: string;
  label: string;
  allowsSorting?: boolean;
  sortBy?: 'string' | 'number';
}> => {
  const monthsListOldestFirst = getMonthsList();
  const monthsList =
    filters.monthColumnOrder === 'latest'
      ? [...monthsListOldestFirst.reverse()]
      : monthsListOldestFirst;

  return [
    { key: 'actions', label: 'Details' },
    ...(filters.showRoutesAs === 'separate'
      ? [
          {
            key: 'from',
            label: 'Origin',
            allowsSorting: true,
            sortBy: 'string' as const,
          },
          {
            key: 'to',
            label: 'Destination',
            allowsSorting: true,
            sortBy: 'string' as const,
          },
        ]
      : [{ key: 'cities', label: 'Cities' }]),
    {
      key: 'numMonths',
      label: 'Months',
      allowsSorting: true,
      sortBy: 'number',
    },
    {
      key: 'numRedemptions',
      label: 'Redemptions',
      allowsSorting: true,
      sortBy: 'number',
    },
    {
      key: 'averageBlackoutPct',
      label: 'Avg Blackout %',
      allowsSorting: true,
      sortBy: 'number',
    },
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
