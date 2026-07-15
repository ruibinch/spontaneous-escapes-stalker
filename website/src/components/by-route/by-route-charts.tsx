import { BlackoutPctOverTimeChart } from './charts/blackout-pct-over-time-chart';
import { MonthsDistributionChart } from './charts/months-distribution-chart';
import { RouteDetailDatum } from './helpers/make-route-details-list';

interface Props {
  detailsListFiltered: RouteDetailDatum[];
}

export function ByRouteCharts({ detailsListFiltered }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      <MonthsDistributionChart detailsListFiltered={detailsListFiltered} />
      <BlackoutPctOverTimeChart detailsListFiltered={detailsListFiltered} />
    </div>
  );
}
