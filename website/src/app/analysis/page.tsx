import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getStaticFileContent } from '@/common/get-static-file-content';
import { AnalysisContent } from '@/components/analysis/content';
import ClientOnly from '@/components/common/client-only';
import { MonthSummaryAnalysisEntry } from '@/index';
import { fetchRouteAnalysis } from '../lib/fetchRouteAnalysis';

export default async function Analysis() {
  const monthSummaryAnalysisList = getStaticFileContent<
    MonthSummaryAnalysisEntry[]
  >({
    filename: 'month-summary-analysis.json',
  });
  const routeAnalysisListFull = await fetchRouteAnalysis();
  const routeAnalysisListSiaOnly = excludeSilkairFlightsFromRouteAnalysis(
    routeAnalysisListFull,
  );

  return (
    <ClientOnly>
      <AnalysisContent
        monthSummaryAnalysisList={monthSummaryAnalysisList}
        routeAnalysisListFull={routeAnalysisListFull}
        routeAnalysisListSiaOnly={routeAnalysisListSiaOnly}
      />
    </ClientOnly>
  );
}
