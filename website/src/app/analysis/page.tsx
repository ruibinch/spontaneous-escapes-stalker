import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getStaticFileContent } from '@/common/get-static-file-content';
import { AnalysisContent } from '@/components/analysis/content';
import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { Suspense } from 'react';

export default function Analysis() {
  const monthSummaryAnalysisList = getStaticFileContent<
    MonthSummaryAnalysisEntry[]
  >({
    filename: 'month-summary-analysis.json',
  });
  const routeAnalysisListFull = getStaticFileContent<RouteAnalysisEntry[]>({
    filename: 'route-analysis.json',
  });
  const routeAnalysisListSiaOnly = excludeSilkairFlightsFromRouteAnalysis(
    routeAnalysisListFull,
  );

  return (
    <Suspense>
      <AnalysisContent
        monthSummaryAnalysisList={monthSummaryAnalysisList}
        routeAnalysisListFull={routeAnalysisListFull}
        routeAnalysisListSiaOnly={routeAnalysisListSiaOnly}
      />
    </Suspense>
  );
}
