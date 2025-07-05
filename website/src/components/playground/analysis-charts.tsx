import { RouteAnalysisEntry } from '@/index';
import { Skeleton, cn } from '@heroui/react';
import { CommonStyles } from '../common/styles';
import { RedemptionsByFlightClassPerMonthChart } from './charts/redemptions-by-flight-class-per-month-chart';
import { RedemptionsByMonthAndFlightClassChart } from './charts/redemptions-by-month-and-flight-class-chart';
import { RedemptionsByRegionAndFlightClassChart } from './charts/redemptions-by-region-and-flight-class-chart';
import { RedemptionsPerMonthChart } from './charts/redemptions-per-month-chart';
import { RoutesByRegionChart } from './charts/routes-by-region-chart';

interface Props {
  routeAnalysisListFiltered: RouteAnalysisEntry[];
}

const chartGrid = [
  {
    key: 'redemptionsPerMonth',
    className: 'col-span-6 md:col-span-3 xl:col-span-2',
    Chart: RedemptionsPerMonthChart,
  },
  {
    key: 'redemptionsByFlightClassPerMonth',
    className: 'col-span-6 md:col-span-3 xl:col-span-2',
    Chart: RedemptionsByFlightClassPerMonthChart,
  },
  {
    key: 'routesByRegion',
    className: 'col-span-6 md:col-span-3 xl:col-span-2',
    Chart: RoutesByRegionChart,
  },
  {
    key: 'redemptionsByRegionAndFlightClass',
    className: 'col-span-6 md:col-span-3 xl:col-span-3',
    Chart: RedemptionsByRegionAndFlightClassChart,
  },
  {
    key: 'redemptionsByMonthAndFlightClass',
    className: 'col-span-6 md:col-span-3 xl:col-span-3',
    Chart: RedemptionsByMonthAndFlightClassChart,
  },
];

export function AnalysisCharts({ routeAnalysisListFiltered }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {chartGrid.map(({ key, className, Chart }) => (
        <div key={key} className={className}>
          <Chart routeAnalysisListFiltered={routeAnalysisListFiltered} />
        </div>
      ))}
    </div>
  );
}

export function AnalysisChartsSkeleton() {
  return (
    <div className="grid grid-cols-6 gap-2">
      {chartGrid.map(({ key, className }) => (
        <div key={key} className={className}>
          <Skeleton className={cn(CommonStyles.Skeleton, 'w-full h-60')} />
        </div>
      ))}
    </div>
  );
}
