'use client';

import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { CommonStyles } from '@/components/common/styles';
import { PageHeader } from '@/components/common/page-header';
import { LatestReleaseHighlights } from './latest-release-highlights';
import { RouteIntelligence } from './route-intelligence';
import { SeasonalSnapshot } from './seasonal-snapshot';
import { ProgramPulse } from './program-pulse';

interface Props {
  latestRedemptionAt: Date;
  routeAnalysisListFull: RouteAnalysisEntry[];
  routeAnalysisListSiaOnly: RouteAnalysisEntry[];
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
  monthsList: string[];
}

export function DashboardContent({
  latestRedemptionAt,
  routeAnalysisListFull,
  routeAnalysisListSiaOnly,
  monthSummaryAnalysisList,
  monthsList,
}: Props) {
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const routeAnalysisList = showSilkairRoutes
    ? routeAnalysisListFull
    : routeAnalysisListSiaOnly;

  const latestMonth = monthsList[monthsList.length - 1];
  const latestMonthSummary = monthSummaryAnalysisList.find(
    (entry) => entry.month === latestMonth,
  );

  return (
    <div className={CommonStyles.Page()}>
      <div className="flex flex-col gap-10">
        <PageHeader
          title="Dashboard"
          subtitle="Historical analysis of KrisFlyer Spontaneous Escapes redemptions since 2017"
        />

        <LatestReleaseHighlights
          routeAnalysisList={routeAnalysisList}
          latestMonth={latestMonth}
          latestMonthSummary={latestMonthSummary}
          latestRedemptionAt={latestRedemptionAt}
          totalMonths={monthsList.length}
        />

        <RouteIntelligence
          routeAnalysisList={routeAnalysisList}
          monthsList={monthsList}
        />

        <SeasonalSnapshot
          monthSummaryAnalysisList={monthSummaryAnalysisList}
        />

        <ProgramPulse
          monthSummaryAnalysisList={monthSummaryAnalysisList}
          totalRoutes={routeAnalysisList.length}
        />
      </div>
    </div>
  );
}
