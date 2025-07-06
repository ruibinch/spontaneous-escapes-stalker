import { RedemptionEntry } from '@/index';
import { FlightClassDistributionChart } from './charts/flight-class-distribution-chart';
import { RoutesRegionDistributionChart } from './charts/routes-region-distribution-chart';

interface Props {
  redemptionsFiltered: RedemptionEntry[];
  isFilterActive: boolean;
}

export function ByMonthCharts({ redemptionsFiltered, isFilterActive }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 xl:col-span-1">
        <FlightClassDistributionChart
          redemptionsFiltered={redemptionsFiltered}
          isFilterActive={isFilterActive}
        />
      </div>
      <div className="col-span-2 xl:col-span-1">
        <RoutesRegionDistributionChart
          redemptionsFiltered={redemptionsFiltered}
        />
      </div>
    </div>
  );
}
