import { trackEvent } from '@/analytics';
import { Button } from '@nextui-org/react';
import {
  FlightClassFilter,
  FlightClassFilterProps,
} from '../common/filters/flight-class-filter';
import { YearFilter, YearFilterProps } from '../common/filters/year-filter';
import { ResetAllFiltersButton } from '../common/filters/reset-all-filters';

type Props = FlightClassFilterProps & YearFilterProps;

export function ByRouteFilters(props: Props) {
  const resetAllFilters = () => {
    trackEvent(['routeDisplay', 'resetAllFilters']);
    props.setFlightClassOption('ALL');
    props.setYears('All');
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          <YearFilter years={props.years} setYears={props.setYears} />

          <FlightClassFilter
            flightClassOption={props.flightClassOption}
            setFlightClassOption={props.setFlightClassOption}
          />
        </div>

        <ResetAllFiltersButton resetAllFilters={resetAllFilters} />
      </div>
    </div>
  );
}
