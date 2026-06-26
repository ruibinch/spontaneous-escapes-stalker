'use client';
import { trackEvent } from '@/analytics';
import { getMonthsList, getYearsList } from '@/common/get-data-time-range';
import { monthNumToNameMap } from '@/common/months-map';
import { Button, Link, cn } from '@heroui/react';
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
    (a, b) => Number(b.year) - Number(a.year),
  );

  return (
    <div className={CommonStyles.Page()}>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Monthly View"
          subtitle="Browse Spontaneous Escapes redemptions by month"
        />

        <div className="flex flex-col gap-6">
          {yearMonthListSorted.map((entry) => (
            <div key={entry.year} className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold text-text-primary">
                {entry.year}
              </h2>

              <div className="grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                {entry.months.map((month) => (
                  <Link
                    key={month}
                    href={`/month/${month}`}
                    onClick={() => {
                      trackEvent(['monthOverview'], { month });
                    }}
                  >
                    <Button
                      size="sm"
                      className="w-full bg-surface-raised border border-border rounded-lg hover:border-accent/30 hover:bg-accent-subtle/50 transition-colors text-text-primary"
                    >
                      {monthNumToNameMap[month.slice(4, 6)]}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
