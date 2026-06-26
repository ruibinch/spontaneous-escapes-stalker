import { RoutesStats, useRoutesStats } from '@/hooks/use-routes-stats';
import { RouteAnalysisEntry } from '@/index';
import { Link, cn } from '@heroui/react';
import { CommonStyles } from '../../common/styles';

const NUM_ROUTES_TO_DISPLAY = 10;

export function BlackoutPctTables({
  routeAnalysisList,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  const routesStats = useRoutesStats(routeAnalysisList);
  const routesStatsFiltered = routesStats.filter(
    (stats) => stats.numRedemptions > 10,
  );

  const topRoutesWithHighestBlackoutPct = [...routesStatsFiltered]
    .sort((a, b) => b.averageBlackoutPct - a.averageBlackoutPct)
    .slice(0, NUM_ROUTES_TO_DISPLAY);
  const topRoutesWithLowestBlackoutPct = [...routesStatsFiltered]
    .filter((stats) => stats.averageBlackoutPct > 0)
    .sort((a, b) => a.averageBlackoutPct - b.averageBlackoutPct)
    .slice(0, NUM_ROUTES_TO_DISPLAY);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <BlackoutPctTable
        title="Highest blackout %"
        subtitle="Most restricted routes"
        accent="red"
        data={topRoutesWithHighestBlackoutPct}
      />
      <BlackoutPctTable
        title="Lowest blackout %"
        subtitle="Best availability routes"
        accent="green"
        data={topRoutesWithLowestBlackoutPct}
      />
    </div>
  );
}

function BlackoutPctTable({
  title,
  subtitle,
  accent,
  data,
}: {
  title: string;
  subtitle: string;
  accent: 'red' | 'green';
  data: RoutesStats[];
}) {
  const borderColor =
    accent === 'red'
      ? 'border-red-200 dark:border-red-900'
      : 'border-green-200 dark:border-green-900';
  const bgColor =
    accent === 'red'
      ? 'bg-red-50/30 dark:bg-red-950/10'
      : 'bg-green-50/30 dark:bg-green-950/10';
  const titleColor =
    accent === 'red'
      ? 'text-red-700 dark:text-red-400'
      : 'text-green-700 dark:text-green-400';

  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-lg border ${borderColor} ${bgColor}`}
    >
      <div>
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${titleColor}`}
        >
          {title}
        </span>
        <p className="text-xs text-text-muted mt-0.5">
          {subtitle} (min 10 redemptions)
        </p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1.5 text-xs font-medium text-text-muted">
              Route
            </th>
            <th className="text-center py-1.5 text-xs font-medium text-text-muted w-16">
              Months
            </th>
            <th className="text-center py-1.5 text-xs font-medium text-text-muted w-24">
              Redemptions
            </th>
            <th className="text-right py-1.5 text-xs font-medium text-text-muted w-24">
              Avg blackout %
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={`${item.originIata}-${item.destinationIata}`}
              className="border-b border-border-subtle"
            >
              <td className="py-2 text-sm">
                <Link
                  href={`/route/${item.originIata}${item.destinationIata}`}
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  {item.origin} - {item.destination}
                </Link>
              </td>
              <td className="py-2 text-center text-text-secondary text-xs">
                {item.numMonths}
              </td>
              <td className="py-2 text-center text-text-secondary text-xs">
                {item.numRedemptions}
              </td>
              <td className="py-2 text-right font-medium text-text-primary text-xs">
                {item.averageBlackoutPct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
