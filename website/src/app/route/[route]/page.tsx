import { RouteDisplayContent } from '@/components/route-display/content';
import { RouteAnalysisEntry } from '@/index';
import routeAnalysisFile from '@/static/route-analysis.json';

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];

export default function ByRoute({ params }: { params: { route: string } }) {
  const route = params.route.toUpperCase();
  const routeInfo = routeAnalysisList.find(
    (d) => d.fromIata === route.slice(0, 3) && d.toIata === route.slice(3, 6),
  );

  if (!routeInfo) {
    return (
      <div className="pt-12 px-4">
        <h1 className="text-2xl font-bold">Invalid route</h1>
      </div>
    );
  }

  return <RouteDisplayContent routeInfo={routeInfo} />;
}
