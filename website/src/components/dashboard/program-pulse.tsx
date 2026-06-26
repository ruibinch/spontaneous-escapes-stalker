'use client';

import { MonthSummaryAnalysisEntry } from '@/index';
import { CommonStyles } from '@/components/common/styles';
import { SummaryEntryCard } from '@/components/common/summary-entry-card';
import { Link } from '@heroui/react';

interface Props {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
  totalRoutes: number;
}

export function ProgramPulse({
  monthSummaryAnalysisList,
  totalRoutes,
}: Props) {
  const totalMonths = monthSummaryAnalysisList.length;
  const latestMonth = monthSummaryAnalysisList[monthSummaryAnalysisList.length - 1];
  const firstMonth = monthSummaryAnalysisList[0];

  // Compute average count for recent 12 months vs first 12 months
  const recent12 = monthSummaryAnalysisList.slice(-12);
  const first12 = monthSummaryAnalysisList.slice(0, 12);
  const avgRecent =
    recent12.reduce((sum, e) => sum + e.count, 0) / recent12.length;
  const avgFirst =
    first12.reduce((sum, e) => sum + e.count, 0) / first12.length;
  const growthPct = ((avgRecent - avgFirst) / avgFirst) * 100;

  // Format date range
  const formatMonth = (m: string) => {
    const year = m.slice(0, 4);
    const monthNum = parseInt(m.slice(4, 6), 10);
    const names = [
      'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr',
      'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct',
    ];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${monthNames[monthNum - 1]} ${year}`;
  };

  const avgRoutesPerMonth = Math.round(
    monthSummaryAnalysisList.reduce(
      (sum, e) => sum + e.byUniqueRoutes.availableForRedemption.total,
      0,
    ) / totalMonths,
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={CommonStyles.SectionTitle}>Program Pulse</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Tracking since {formatMonth(firstMonth.month)}
          </p>
        </div>
        <Link
          href="/trends"
          className="text-sm text-accent hover:text-accent-hover"
        >
          Full analysis →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryEntryCard
          header="Monthly Releases"
          content={totalMonths}
          subcontent={`${formatMonth(firstMonth.month)} — ${formatMonth(latestMonth.month)}`}
        />

        <SummaryEntryCard
          header="Total Routes"
          content={totalRoutes}
          subcontent="unique origin-destination pairs"
        />

        <SummaryEntryCard
          header="Avg Routes / Month"
          content={avgRoutesPerMonth}
          subcontent={`${latestMonth.byUniqueRoutes.availableForRedemption.total} this month`}
        />

        <SummaryEntryCard
          header="Program Growth"
          content={`${growthPct > 0 ? '+' : ''}${growthPct.toFixed(0)}%`}
          subcontent="recent vs. early avg redemptions"
          contentClassName={`text-stat ${growthPct > 0 ? 'text-deal-good' : 'text-deal-poor'}`}
        />
      </div>
    </section>
  );
}
