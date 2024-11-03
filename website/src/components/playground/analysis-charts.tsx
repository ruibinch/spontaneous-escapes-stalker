import { RouteAnalysisEntry } from '@/index';
import { RedemptionsPerMonthChart } from './charts/redemptions-per-month-chart';
import { RoutesByRegionChart } from './charts/routes-by-region-chart';
import { RedemptionsByMonthAndFlightClassChart } from './charts/redemptions-by-month-and-flight-class-chart';
import { RedemptionsByRegionAndFlightClassChart } from './charts/redemptions-by-region-and-flight-class-chart';
import { RedemptionsByFlightClassPerMonthChart } from './charts/redemptions-by-flight-class-per-month-chart';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

export function AnalysisCharts({ routeAnalysisListFiltered }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2">
      <div className="col-span-6 md:col-span-3 xl:col-span-2">
        <RedemptionsPerMonthChart
          routeAnalysisListFiltered={routeAnalysisListFiltered}
        />
      </div>
      <div className="col-span-6 md:col-span-3 xl:col-span-2">
        <RedemptionsByFlightClassPerMonthChart
          routeAnalysisListFiltered={routeAnalysisListFiltered}
        />
      </div>
      <div className="col-span-6 md:col-span-3 xl:col-span-2">
        <RoutesByRegionChart
          routeAnalysisListFiltered={routeAnalysisListFiltered}
        />
      </div>
      <div className="col-span-6 md:col-span-3 xl:col-span-3">
        <RedemptionsByRegionAndFlightClassChart
          routeAnalysisListFiltered={routeAnalysisListFiltered}
        />
      </div>
      <div className="col-span-6 md:col-span-3 xl:col-span-3">
        <RedemptionsByMonthAndFlightClassChart
          routeAnalysisListFiltered={routeAnalysisListFiltered}
        />
      </div>
    </div>
  );
}
