import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getStaticFileContent } from '@/common/get-static-file-content';
import { AnalysisContent } from '@/components/analysis/content';
import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';

export default function Trends() {
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
    <AnalysisContent
      monthSummaryAnalysisList={monthSummaryAnalysisList}
      routeAnalysisListFull={routeAnalysisListFull}
      routeAnalysisListSiaOnly={routeAnalysisListSiaOnly}
    />
  );
}
