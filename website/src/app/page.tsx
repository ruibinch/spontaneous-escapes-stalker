import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getStaticFileContent } from '@/common/get-static-file-content';
import ClientOnly from '@/components/common/client-only';
import { PlaygroundContent } from '@/components/playground/content';
import { RouteAnalysisEntry } from '..';

export default function Playground() {
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

  // TODO: refer to common server-side getMonthsList fn
  const monthsList = routeAnalysisListFull[0].details.map(({ month }) => month);

  return (
    <ClientOnly>
      <PlaygroundContent
        latestRedemptionAt={new Date(latestRedemptionAt)}
        routeAnalysisListFull={routeAnalysisListFull}
        routeAnalysisListSiaOnly={routeAnalysisListSiaOnly}
        monthsList={monthsList}
      />
    </ClientOnly>
  );
}
