import { RouteDisplayContent } from '@/components/by-route/content';
import { makeRouteDetailsList } from '@/components/by-route/helpers/make-route-details-list';
import { RouteAnalysisEntry } from '@/index';
import routeAnalysisFile from '@/static/route-analysis.json';

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];

export default function ByRoute({ params }: { params: { route: string } }) {
  const route = params.route.toUpperCase();
  const routeAnalysisEntry = routeAnalysisList.find(
    (d) => d.fromIata === route.slice(0, 3) && d.toIata === route.slice(3, 6),
  );

  if (!routeAnalysisEntry) {
    return (
      <div className="pt-12 px-4">
        <h1 className="text-2xl font-semibold">Invalid route</h1>
      </div>
    );
  }

  const routeInfo = makeRouteDetailsList(routeAnalysisEntry);
  return <RouteDisplayContent routeInfo={routeInfo} />;
}
