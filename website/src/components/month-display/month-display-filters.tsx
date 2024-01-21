import { Button } from '@nextui-org/react';
import {
  FlightClassFilterProps,
  FlightClassFilter,
} from '../common/filters/flight-class-filter';
import {
  RegionFilterProps,
  RegionFilter,
} from '../common/filters/region-filter';
import {
  SearchTermFilterProps,
  SearchTermFilter,
} from '../common/filters/search-term-filter';

type Props = SearchTermFilterProps & FlightClassFilterProps & RegionFilterProps;

export function MonthDisplayFilters(props: Props) {
  const resetAllFilters = () => {
    props.setSearchTerm('');
    props.setRegions('All');
    props.setFlightClassOption('ALL');
  };

  return (
    <div>
      <div className="grid lg:grid-cols-3 gap-6">
        <SearchTermFilter
          searchTerm={props.searchTerm}
          setSearchTerm={props.setSearchTerm}
        />

        <RegionFilter regions={props.regions} setRegions={props.setRegions} />

        <FlightClassFilter
          flightClassOption={props.flightClassOption}
          setFlightClassOption={props.setFlightClassOption}
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button onPress={resetAllFilters}>Reset all filters</Button>
      </div>
    </div>
  );
}
