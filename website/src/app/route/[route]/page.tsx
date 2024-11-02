import { excludeSilkairFlightsFromRouteAnalysis } from '@/common/exclude-silkair-flights';
import {
  getStaticFileContent,
  getStaticFilepath,
} from '@/common/get-static-file-content';
import { ByRouteContent } from '@/components/by-route/content';
import { makeRouteDetailsList } from '@/components/by-route/helpers/make-route-details-list';
import ClientOnly from '@/components/common/client-only';
import { NoDataIllustration } from '@/components/icons/no-data';
import { RouteAnalysisEntry } from '@/index';
import { promises as fs } from 'fs';
import path from 'path';

export default async function ByRoute({
  params,
}: {
  params: { route: string };
}) {
  const route = params.route.toUpperCase();

  const routeAnalysisEntryFilepath = getStaticFilepath(`route-${route}.json`);
  const routeAnalysisListFilepath = getStaticFilepath('route-analysis.json');

  try {
    await fs.access(routeAnalysisEntryFilepath);

    const routeAnalysisEntryFile = await fs.readFile(
      routeAnalysisEntryFilepath,
      'utf8',
    );
    const routeAnalysisEntry = JSON.parse(
      routeAnalysisEntryFile,
    ) as RouteAnalysisEntry;

    const routeInfo = makeRouteDetailsList(routeAnalysisEntry);
    return (
      <ClientOnly>
        <ByRouteContent routeInfo={routeInfo} />ß
      </ClientOnly>
    );
  } catch (e) {
    return (
      <div className="pt-12 px-4">
        <div className="flex flex-col gap-16 items-center justify-center">
          <NoDataIllustration className="w-1/2 h-1/2" />

          <h1 className="text-2xl font-semibold">Invalid route</h1>
        </div>
      </div>
    );
  }
}

const routeAnalysisListFull = getStaticFileContent<RouteAnalysisEntry[]>({
  filename: 'route-analysis.json',
});
const routeAnalysisListSiaOnly = excludeSilkairFlightsFromRouteAnalysis(
  routeAnalysisListFull,
);
