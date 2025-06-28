import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import ClientOnly from '@/components/common/client-only';
import { RouteOverviewContent } from '@/components/route-overview/content';
import { fetchRouteAnalysis } from '../lib/fetchRouteAnalysis';

export default async function RouteOverview() {
  const routeAnalysisListFull = await fetchRouteAnalysis();
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
