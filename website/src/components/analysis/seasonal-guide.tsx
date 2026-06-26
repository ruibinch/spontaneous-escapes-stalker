'use client';

import { MonthSummaryAnalysisEntry } from '@/index';
import { CommonStyles } from '../common/styles';
import { cn } from '@heroui/react';

interface Props {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
}

interface CalendarMonthData {
  month: number;
  name: string;
  avgRedemptions: number;
  avgBlackoutPct: number | null;
  avgRoutes: number;
  dataPoints: number;
}

export function SeasonalGuide({ monthSummaryAnalysisList }: Props) {
  const calendarData = computeCalendarData(monthSummaryAnalysisList);

  const bestAvailability = [...calendarData]
    .filter((d) => d.avgBlackoutPct !== null)
    .sort((a, b) => (a.avgBlackoutPct ?? 100) - (b.avgBlackoutPct ?? 100))
    .slice(0, 3);

  const worstAvailability = [...calendarData]
    .filter((d) => d.avgBlackoutPct !== null)
    .sort((a, b) => (b.avgBlackoutPct ?? 0) - (a.avgBlackoutPct ?? 0))
    .slice(0, 3);

  const mostRoutes = [...calendarData]
    .sort((a, b) => b.avgRoutes - a.avgRoutes)
    .slice(0, 3);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className={CommonStyles.SectionTitle}>
          Seasonal Availability Guide
        </h2>
        <p className="text-sm text-text-secondary mt-0.5">
          When to watch for deals and what to expect each calendar month
        </p>
      </div>

      {/* Heatmap table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-xs font-medium text-text-muted">
                Month
              </th>
              <th className="text-center py-2 px-3 text-xs font-medium text-text-muted">
                Avg Redemptions
              </th>
              <th className="text-center py-2 px-3 text-xs font-medium text-text-muted">
                Avg Routes
              </th>
              <th className="text-center py-2 px-3 text-xs font-medium text-text-muted">
                Avg Blackout %
              </th>
              <th className="py-2 pl-4 text-xs font-medium text-text-muted">
                Availability
              </th>
            </tr>
          </thead>
          <tbody>
            {calendarData.map((data) => {
              const blackoutLevel = getBlackoutLevel(data.avgBlackoutPct);
              return (
                <tr
                  key={data.month}
                  className="border-b border-border-subtle"
                >
                  <td className="py-2.5 pr-4 font-medium text-text-primary">
                    {data.name}
                  </td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">
                    {Math.round(data.avgRedemptions)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">
                    {Math.round(data.avgRoutes)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-text-secondary">
                    {data.avgBlackoutPct !== null
                      ? `${data.avgBlackoutPct.toFixed(1)}%`
                      : '—'}
                  </td>
                  <td className="py-2.5 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-border overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            blackoutLevel.barColor,
                          )}
                          style={{
                            width: `${100 - (data.avgBlackoutPct ?? 0)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={cn('text-xs font-medium', blackoutLevel.textColor)}
                      >
                        {blackoutLevel.label}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Insight callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InsightCard
          title="Best Availability"
          accent="green"
          items={bestAvailability.map(
            (d) => `${d.name} — ${d.avgBlackoutPct?.toFixed(1)}% avg blackout`,
          )}
          tip="These months historically have the fewest blackout restrictions."
        />
        <InsightCard
          title="Most Restrictive"
          accent="red"
          items={worstAvailability.map(
            (d) => `${d.name} — ${d.avgBlackoutPct?.toFixed(1)}% avg blackout`,
          )}
          tip="Expect limited date availability. Book early for travel in these months."
        />
        <InsightCard
          title="Most Route Choices"
          accent="blue"
          items={mostRoutes.map(
            (d) => `${d.name} — ${Math.round(d.avgRoutes)} avg routes`,
          )}
          tip="These months offer the widest selection of destinations."
        />
      </div>
    </section>
  );
}

function InsightCard({
  title,
  accent,
  items,
  tip,
}: {
  title: string;
  accent: 'green' | 'red' | 'blue';
  items: string[];
  tip: string;
}) {
  const styles = {
    green: {
      border: 'border-green-200 dark:border-green-900',
      bg: 'bg-green-50/50 dark:bg-green-950/20',
      title: 'text-green-700 dark:text-green-400',
    },
    red: {
      border: 'border-red-200 dark:border-red-900',
      bg: 'bg-red-50/50 dark:bg-red-950/20',
      title: 'text-red-700 dark:text-red-400',
    },
    blue: {
      border: 'border-blue-200 dark:border-blue-900',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      title: 'text-blue-700 dark:text-blue-400',
    },
  };

  const s = styles[accent];

  return (
    <div className={`flex flex-col gap-2 p-4 rounded-lg border ${s.border} ${s.bg}`}>
      <span className={`text-xs font-semibold uppercase tracking-wider ${s.title}`}>
        {title}
      </span>
      <ul className="text-sm text-text-primary space-y-1">
        {items.map((item, i) => (
          <li key={i}>
            {i + 1}. {item}
          </li>
        ))}
      </ul>
      <p className="text-xs text-text-muted mt-1">{tip}</p>
    </div>
  );
}

function getBlackoutLevel(pct: number | null) {
  if (pct === null) return { label: '—', barColor: 'bg-slate-300', textColor: 'text-text-muted' };
  if (pct <= 12)
    return { label: 'Good', barColor: 'bg-green-500 dark:bg-green-400', textColor: 'text-green-600 dark:text-green-400' };
  if (pct <= 18)
    return { label: 'Fair', barColor: 'bg-amber-500 dark:bg-amber-400', textColor: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Tight', barColor: 'bg-red-500 dark:bg-red-400', textColor: 'text-red-600 dark:text-red-400' };
}

function computeCalendarData(
  list: MonthSummaryAnalysisEntry[],
): CalendarMonthData[] {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const buckets: Record<
    number,
    { redemptions: number[]; routes: number[]; blackouts: number[] }
  > = {};
  for (let m = 1; m <= 12; m++) {
    buckets[m] = { redemptions: [], routes: [], blackouts: [] };
  }

  for (const entry of list) {
    const calMonth = parseInt(entry.month.slice(4, 6), 10);
    buckets[calMonth].redemptions.push(entry.count);
    buckets[calMonth].routes.push(
      entry.byUniqueRoutes.availableForRedemption.total,
    );
    if (entry.blackoutPctAverages.total !== null) {
      buckets[calMonth].blackouts.push(entry.blackoutPctAverages.total);
    }
  }

  return Object.entries(buckets).map(([month, data]) => {
    const m = parseInt(month, 10);
    return {
      month: m,
      name: monthNames[m - 1],
      avgRedemptions: avg(data.redemptions),
      avgBlackoutPct: data.blackouts.length > 0 ? avg(data.blackouts) : null,
      avgRoutes: avg(data.routes),
      dataPoints: data.redemptions.length,
    };
  });
}

function avg(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}
