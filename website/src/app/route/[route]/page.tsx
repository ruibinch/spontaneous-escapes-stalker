import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import { getStaticFileContent } from '@/common/get-static-file-content';
import { ByRouteContent } from '@/components/by-route/content';
import { RouteAnalysisEntry } from '@/index';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type ByRouteParams = Promise<{ route: string }>;

export default async function ByRoute({ params }: { params: ByRouteParams }) {
  const { route } = await params;
  const routeUpper = route.toUpperCase();
  const originIata = routeUpper.slice(0, 3);
  const destinationIata = routeUpper.slice(3, 6);

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
    // Return 404 status for SEO purposes
    notFound();
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
