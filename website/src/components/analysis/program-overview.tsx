'use client';

import { MonthSummaryAnalysisEntry } from '@/index';
import { CommonStyles } from '../common/styles';
import { SummaryEntryCard } from '../common/summary-entry-card';

interface Props {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
}

export function ProgramOverview({ monthSummaryAnalysisList }: Props) {
  const totalMonths = monthSummaryAnalysisList.length;
  const first = monthSummaryAnalysisList[0];
  const latest = monthSummaryAnalysisList[totalMonths - 1];

  const totalRedemptions = monthSummaryAnalysisList.reduce(
    (sum, e) => sum + e.count,
    0,
  );

  const avgPerMonth = Math.round(totalRedemptions / totalMonths);

  // Peak month
  const peakMonth = monthSummaryAnalysisList.reduce((best, e) =>
    e.count > best.count ? e : best,
  );

  // Count unique routes with at least one redemption
  const avgRoutes = Math.round(
    monthSummaryAnalysisList.reduce(
      (sum, e) => sum + e.byUniqueRoutes.availableForRedemption.total,
      0,
    ) / totalMonths,
  );

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className={CommonStyles.SectionTitle}>Program Overview</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          {formatMonth(first.month)} to {formatMonth(latest.month)} —{' '}
          {totalMonths} monthly releases tracked
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryEntryCard
          header="Total Redemptions"
          content={totalRedemptions.toLocaleString()}
          subcontent="across all months and classes"
        />
        <SummaryEntryCard
          header="Avg / Month"
          content={avgPerMonth}
          subcontent={`${latest.count} in latest month`}
        />
        <SummaryEntryCard
          header="Avg Routes / Month"
          content={avgRoutes}
          subcontent={`${latest.byUniqueRoutes.availableForRedemption.total} in latest month`}
        />
        <SummaryEntryCard
          header="Peak Month"
          content={peakMonth.count}
          subcontent={formatMonth(peakMonth.month)}
        />
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
