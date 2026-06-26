'use client';

import { MonthSummaryAnalysisEntry, Region } from '@/index';
import { CommonStyles } from '../common/styles';
import { cn } from '@heroui/react';
import { regionColors } from '../common/colors';

interface Props {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
}

interface RegionStats {
  region: string;
  totalRedemptions: number;
  pct: number;
  avgPerMonth: number;
  latestCount: number;
  color: string;
}

export function RegionalBreakdown({ monthSummaryAnalysisList }: Props) {
  const totalMonths = monthSummaryAnalysisList.length;
  const latest = monthSummaryAnalysisList[monthSummaryAnalysisList.length - 1];

  const regionTotals: Record<string, number> = {};
  const grandTotal = monthSummaryAnalysisList.reduce((sum, entry) => {
    for (const [region, count] of Object.entries(entry.byRegion)) {
      regionTotals[region] = (regionTotals[region] || 0) + count;
    }
    return sum + entry.count;
  }, 0);

  const regionStats: RegionStats[] = Object.entries(regionTotals)
    .map(([region, total]) => ({
      region,
      totalRedemptions: total,
      pct: (total / grandTotal) * 100,
      avgPerMonth: total / totalMonths,
      latestCount: latest.byRegion[region as Region] ?? 0,
      color: regionColors[region as keyof typeof regionColors] || '#888',
    }))
    .sort((a, b) => b.totalRedemptions - a.totalRedemptions);

  const maxPct = Math.max(...regionStats.map((r) => r.pct));

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className={CommonStyles.SectionTitle}>Regional Breakdown</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Distribution of redemptions across geographic regions
        </p>
      </div>

      <div className="space-y-3">
        {regionStats.map((stats) => (
          <div key={stats.region} className="flex items-center gap-4">
            <div className="w-40 shrink-0 text-sm text-text-primary font-medium truncate">
              {stats.region}
            </div>

            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-6 rounded bg-border overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${(stats.pct / maxPct) * 100}%`,
                    backgroundColor: stats.color,
                    opacity: 0.75,
                  }}
                />
              </div>

              <span className="text-sm font-medium text-text-primary w-12 text-right">
                {stats.pct.toFixed(1)}%
              </span>

              <span className="text-xs text-text-muted w-20 text-right hidden sm:block">
                {stats.latestCount} this month
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-text-secondary">
        South East Asia and North Asia account for{' '}
        <span className="font-medium text-text-primary">
          {(regionStats[0].pct + regionStats[1].pct).toFixed(0)}%
        </span>{' '}
        of all redemptions historically.
      </p>
    </section>
  );
}
