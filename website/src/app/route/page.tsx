import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getStaticFileContent } from '@/common/get-static-file-content';
import ClientOnly from '@/components/common/client-only';
import { RouteOverviewContent } from '@/components/route-overview/content';
import { RouteAnalysisEntry } from '@/index';

export default function RouteOverview() {
  const routeAnalysisListFull = getStaticFileContent<RouteAnalysisEntry[]>({
    filename: 'route-analysis.json',
  });
  const routeAnalysisListSiaOnly = excludeSilkairFlightsFromRouteAnalysis(
    routeAnalysisListFull,
  );

  return (
    <ClientOnly>
      <RouteOverviewContent
        routeAnalysisListFull={routeAnalysisListFull}
        routeAnalysisListSiaOnly={routeAnalysisListSiaOnly}
      />
    </ClientOnly>
  );
}
