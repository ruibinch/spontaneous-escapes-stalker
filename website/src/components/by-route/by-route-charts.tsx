import { BlackoutPctOverTimeChart } from './charts/blackout-pct-over-time-chart';
import { MonthsDistributionChart } from './charts/months-distribution-chart';
import { RouteDetailDatum } from './helpers/make-route-details-list';

interface Props {
  detailsListFiltered: RouteDetailDatum[];
}

export function ByRouteCharts({ detailsListFiltered }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 xl:col-span-1">
        <MonthsDistributionChart detailsListFiltered={detailsListFiltered} />
      </div>
      <div className="col-span-2 xl:col-span-1">
        <BlackoutPctOverTimeChart detailsListFiltered={detailsListFiltered} />
      </div>
    </div>
  );
}
