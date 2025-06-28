import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getMonthsList } from '@/common/get-data-time-range';
import { getStaticFileContent } from '@/common/get-static-file-content';
import ClientOnly from '@/components/common/client-only';
import { PlaygroundContent } from '@/components/playground/content';
import { fetchRouteAnalysis } from './lib/fetchRouteAnalysis';

export default async function Playground() {
  const latestRedemptionAt = getStaticFileContent<string>({
    filename: '.latest-redemption-at',
    filetype: 'string',
  });

  const routeAnalysisListFull = await fetchRouteAnalysis();
  const routeAnalysisListSiaOnly = excludeSilkairFlightsFromRouteAnalysis(
    routeAnalysisListFull,
  );
  const monthsList = getMonthsList();

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
