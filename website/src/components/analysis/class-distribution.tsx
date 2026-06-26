'use client';

import { MonthSummaryAnalysisEntry, FlightClass } from '@/index';
import { CommonStyles } from '../common/styles';
import { cn } from '@heroui/react';

interface Props {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
}

export function ClassDistribution({ monthSummaryAnalysisList }: Props) {
  // Compute class stats across all months
  const totals = { Y: 0, W: 0, J: 0, all: 0 };
  const yearly: Record<
    string,
    { Y: number; W: number; J: number; total: number }
  > = {};

  for (const entry of monthSummaryAnalysisList) {
    const year = entry.month.slice(0, 4);
    if (!yearly[year]) yearly[year] = { Y: 0, W: 0, J: 0, total: 0 };

    totals.Y += entry.byFlightClass.Y;
    totals.W += entry.byFlightClass.W;
    totals.J += entry.byFlightClass.J;
    totals.all += entry.count;

    yearly[year].Y += entry.byFlightClass.Y;
    yearly[year].W += entry.byFlightClass.W;
    yearly[year].J += entry.byFlightClass.J;
    yearly[year].total += entry.count;
  }

  // Find first W appearance
  const firstW = monthSummaryAnalysisList.find((e) => e.byFlightClass.W > 0);

  // Latest year stats
  const years = Object.keys(yearly).sort();
  const latestYear = years[years.length - 1];
  const latestYearData = yearly[latestYear];

  const classData: Array<{
    code: FlightClass;
    name: string;
    total: number;
    pct: number;
    latestPct: number;
    color: string;
    bgColor: string;
  }> = [
    {
      code: 'Y',
      name: 'Economy',
      total: totals.Y,
      pct: (totals.Y / totals.all) * 100,
      latestPct: (latestYearData.Y / latestYearData.total) * 100,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500 dark:bg-green-400',
    },
    {
      code: 'J',
      name: 'Business',
      total: totals.J,
      pct: (totals.J / totals.all) * 100,
      latestPct: (latestYearData.J / latestYearData.total) * 100,
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-600 dark:bg-blue-400',
    },
    {
      code: 'W',
      name: 'Premium Economy',
      total: totals.W,
      pct: (totals.W / totals.all) * 100,
      latestPct: (latestYearData.W / latestYearData.total) * 100,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-500 dark:bg-violet-400',
    },
  ];

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className={CommonStyles.SectionTitle}>Flight Class Distribution</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          How Economy, Business, and Premium Economy offerings compare
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {classData.map((cls) => (
          <div
            key={cls.code}
            className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-surface"
          >
            <div className="flex items-center justify-between">
              <span className={cn('text-sm font-medium', cls.color)}>
                {cls.name}
              </span>
              <span className="text-xs text-text-muted">{cls.code}</span>
            </div>

            <div className="text-stat text-text-primary">
              {cls.pct.toFixed(1)}%
            </div>
            <div className="text-xs text-text-muted">
              of all redemptions ({cls.total.toLocaleString()} total)
            </div>

            {/* Bar */}
            <div className="w-full h-2 rounded-full bg-border">
              <div
                className={cn('h-full rounded-full', cls.bgColor)}
                style={{ width: `${cls.pct}%` }}
              />
            </div>

            <div className="text-xs text-text-secondary">
              {latestYear}:{' '}
              <span className="font-medium">{cls.latestPct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Key insights */}
      <div className="flex flex-col gap-2 text-sm text-text-secondary">
        {firstW && (
          <p>
            Premium Economy first appeared in{' '}
            <span className="font-medium text-text-primary">
              {formatMonth(firstW.month)}
            </span>
            . It remains the rarest class, offered on select long-haul routes.
          </p>
        )}
        <p>
          Economy dominates at {classData[0].pct.toFixed(0)}% of all
          redemptions. Business class makes up{' '}
          {classData[1].pct.toFixed(0)}%.
        </p>
      </div>
    </section>
  );
}

function formatMonth(month: string): string {
  const year = month.slice(0, 4);
  const monthNum = parseInt(month.slice(4, 6), 10);
  const names = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${names[monthNum - 1]} ${year}`;
}
