import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getStaticFileContent } from '@/common/get-static-file-content';
import { ByRouteContent } from '@/components/by-route/content';
import { NoDataIllustration } from '@/components/icons/no-data';
import { RouteAnalysisEntry } from '@/index';
import { Suspense } from 'react';

export default function ByRoute({ params }: { params: { route: string } }) {
  const route = params.route.toUpperCase();
  const originIata = route.slice(0, 3);
  const destinationIata = route.slice(3, 6);

  const routeAnalysisListFull = getStaticFileContent<RouteAnalysisEntry[]>({
    filename: 'route-analysis.json',
  });
  const routeAnalysisListSiaOnly = excludeSilkairFlightsFromRouteAnalysis(
    routeAnalysisListFull,
  );

  const routeAnalysisEntry = routeAnalysisListFull.find(
    (d) => d.originIata === originIata && d.destinationIata === destinationIata,
  );
  if (!routeAnalysisEntry) {
    return (
      <div className="pt-12 px-4">
        <div className="flex flex-col gap-16 items-center justify-center">
          <NoDataIllustration className="w-1/2 h-1/2" />

          <h1 className="text-2xl font-semibold">Invalid route</h1>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <ByRouteContent
        routeMetadata={{
          origin: routeAnalysisEntry.origin,
          destination: routeAnalysisEntry.destination,
          originIata,
          destinationIata,
        }}
        routeAnalysisListFull={routeAnalysisListFull}
        routeAnalysisListSiaOnly={routeAnalysisListSiaOnly}
      />
    </Suspense>
  );
}
