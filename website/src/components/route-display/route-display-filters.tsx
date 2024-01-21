import { Button } from '@nextui-org/react';
import {
  FlightClassFilter,
  FlightClassFilterProps,
} from '../common/filters/flight-class-filter';
import { YearFilter, YearFilterProps } from '../common/filters/year-filter';

type Props = FlightClassFilterProps & YearFilterProps;

export function RouteDisplayFilters(props: Props) {
  const resetAllFilters = () => {
    props.setFlightClassOption('ALL');
    props.setYears('All');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <YearFilter years={props.years} setYears={props.setYears} />

      <FlightClassFilter
        flightClassOption={props.flightClassOption}
        setFlightClassOption={props.setFlightClassOption}
      />

      <div className="flex justify-end items-end">
        <Button onPress={resetAllFilters}>Reset all filters</Button>
      </div>
    </div>
  );
}
