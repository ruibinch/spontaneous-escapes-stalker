'use client';
import { trackEvent } from '@/analytics';
import { getMonthsList, getYearsList } from '@/common/get-data-time-range';
import { monthNumToNameMap } from '@/common/months-map';
import { Button, cn } from '@nextui-org/react';
import NextLink from 'next/link';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';

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
    <div>
      <PageHeader
        title="View by Month"
        subtitle="View the history of Spontaneous Escapes redemptions offered in a past month"
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-6')}>
        {yearMonthListSorted.map((entry) => (
          <div key={entry.year} className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">{entry.year}</h1>

            <div className="grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-2">
              {entry.months.map((month) => (
                <NextLink
                  key={month}
                  href={`/month/${month}`}
                  onClick={() => {
                    trackEvent(['monthOverview'], { month });
                  }}
                >
                  <Button
                    size="sm"
                    className={cn(
                      CommonStyles.Border,
                      'w-full bg-neutral-100 dark:bg-neutral-700 border-2 rounded-md',
                    )}
                  >
                    {monthNumToNameMap[month.slice(4, 6)]}
                  </Button>
                </NextLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
