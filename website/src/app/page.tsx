import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getStaticFileContent } from '@/common/get-static-file-content';
import { DashboardContent } from '@/components/dashboard/content';
import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { Suspense } from 'react';

export default function Dashboard() {
  const latestRedemptionAt = getStaticFileContent<string>({
    filename: '.latest-redemption-at',
    filetype: 'string',
  });
  const routeAnalysisListFull = getStaticFileContent<RouteAnalysisEntry[]>({
    filename: 'route-analysis.json',
  });
  const routeAnalysisListSiaOnly = excludeSilkairFlightsFromRouteAnalysis(
    routeAnalysisListFull,
  );
  const monthSummaryAnalysisList = getStaticFileContent<
    MonthSummaryAnalysisEntry[]
  >({
    filename: 'month-summary-analysis.json',
  });
  const monthsList = routeAnalysisListFull[0].details.map(({ month }) => month);

  return (
    <Suspense>
      <DashboardContent
        latestRedemptionAt={new Date(latestRedemptionAt)}
        routeAnalysisListFull={routeAnalysisListFull}
        routeAnalysisListSiaOnly={routeAnalysisListSiaOnly}
        monthSummaryAnalysisList={monthSummaryAnalysisList}
        monthsList={monthsList}
      />
    </Suspense>
  );
}
