'use client';

import { MonthSummaryAnalysisEntry } from '@/index';
import { CommonStyles } from '@/components/common/styles';
import { cn } from '@heroui/react';
import { useMemo } from 'react';

interface Props {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
}

interface CalendarMonthStats {
  month: number; // 1-12
  name: string;
  avgCount: number;
  avgBlackoutPct: number | null;
  numDataPoints: number;
}

export function SeasonalSnapshot({ monthSummaryAnalysisList }: Props) {
  const calendarStats = useMemo(
    () => computeCalendarStats(monthSummaryAnalysisList),
    [monthSummaryAnalysisList],
  );

  const maxAvgCount = Math.max(...calendarStats.map((s) => s.avgCount));
  const minAvgCount = Math.min(...calendarStats.map((s) => s.avgCount));
  const bestMonth = calendarStats.reduce((best, s) =>
    s.avgCount > best.avgCount ? s : best,
  );
  const worstMonth = calendarStats.reduce((worst, s) =>
    s.avgCount < worst.avgCount ? s : worst,
  );

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className={CommonStyles.SectionTitle}>Seasonal Patterns</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Average redemption counts by calendar month across all years
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {calendarStats.map((stats) => {
          const intensity =
            maxAvgCount === minAvgCount
              ? 0.5
              : (stats.avgCount - minAvgCount) / (maxAvgCount - minAvgCount);

          return (
            <div
              key={stats.month}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-2xs font-medium text-text-muted uppercase">
                {stats.name}
              </span>
              <div
                className={cn(
                  'w-full aspect-square rounded-lg flex items-center justify-center',
                  getIntensityClass(intensity),
                )}
              >
                <span className="text-sm font-semibold">
                  {Math.round(stats.avgCount)}
                </span>
              </div>
              {stats.avgBlackoutPct !== null && (
                <span className="text-2xs text-text-muted">
                  {stats.avgBlackoutPct.toFixed(0)}% b/o
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        <span>
          Peak:{' '}
          <span className="font-medium text-deal-good">
            {bestMonth.name} ({Math.round(bestMonth.avgCount)} avg)
          </span>
        </span>
        <span>
          Lowest:{' '}
          <span className="font-medium text-deal-poor">
            {worstMonth.name} ({Math.round(worstMonth.avgCount)} avg)
          </span>
        </span>
        <span>
          Ratio:{' '}
          <span className="font-medium text-text-primary">
            {(bestMonth.avgCount / worstMonth.avgCount).toFixed(1)}x
          </span>
        </span>
        <span className="text-text-muted">
          b/o = avg blackout %
        </span>
      </div>
    </section>
  );
}

function getIntensityClass(intensity: number): string {
  if (intensity >= 0.85)
    return 'bg-blue-600 dark:bg-blue-500 text-white';
  if (intensity >= 0.65)
    return 'bg-blue-400 dark:bg-blue-600 text-white';
  if (intensity >= 0.45)
    return 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100';
  if (intensity >= 0.25)
    return 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
}

function computeCalendarStats(
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[],
): CalendarMonthStats[] {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const buckets: Record<
    number,
    { counts: number[]; blackoutPcts: number[] }
  > = {};
  for (let m = 1; m <= 12; m++) {
    buckets[m] = { counts: [], blackoutPcts: [] };
  }

  for (const entry of monthSummaryAnalysisList) {
    const calMonth = parseInt(entry.month.slice(4, 6), 10);
    buckets[calMonth].counts.push(entry.count);
    if (entry.blackoutPctAverages.total !== null) {
      buckets[calMonth].blackoutPcts.push(entry.blackoutPctAverages.total);
    }
  }

  return Object.entries(buckets).map(([month, data]) => {
    const m = parseInt(month, 10);
    const avgCount =
      data.counts.length > 0
        ? data.counts.reduce((sum, v) => sum + v, 0) / data.counts.length
        : 0;
    const avgBlackout =
      data.blackoutPcts.length > 0
        ? data.blackoutPcts.reduce((sum, v) => sum + v, 0) /
          data.blackoutPcts.length
        : null;

    return {
      month: m,
      name: monthNames[m - 1],
      avgCount,
      avgBlackoutPct: avgBlackout,
      numDataPoints: data.counts.length,
    };
  });
}
