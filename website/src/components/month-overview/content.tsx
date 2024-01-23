import { getMonthsList, getYearsList } from '@/common/get-data-time-range';
import { monthNumToNameMap } from '@/common/months-map';
import { Button } from '@nextui-org/react';
import NextLink from 'next/link';

const monthsList = getMonthsList();
const yearsList = getYearsList();

export function MonthOverviewContent() {
  const yearMonthList = yearsList.map((year) => {
    const monthsForYear = monthsList.filter((yyyymm) =>
      yyyymm.startsWith(year),
    );
    return {
      year,
      months: monthsForYear,
    };
  });
  const yearMonthListSorted = [...yearMonthList].sort(
    (a, b) => Number(b.year) - Number(a.year), // latest year first
  );

  return (
    <div className="flex flex-col gap-8">
      {yearMonthListSorted.map((entry) => (
        <div key={entry.year} className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{entry.year}</h1>

          <div className="grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-2">
            {entry.months.map((month) => (
              <NextLink key={month} href={`/month/${month}`}>
                <Button size="sm" className="w-full">
                  {monthNumToNameMap[month.slice(4, 6)]}
                </Button>
              </NextLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
