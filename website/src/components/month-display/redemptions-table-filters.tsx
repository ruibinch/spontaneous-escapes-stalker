import {
  FlightClassFilterProps,
  FlightClassFilter,
} from '../playground/filters/flight-class-filter';
import {
  RegionFilterProps,
  RegionFilter,
} from '../playground/filters/region-filter';
import {
  SearchTermFilterProps,
  SearchTermFilter,
} from '../playground/filters/search-term-filter';

type Props = SearchTermFilterProps & FlightClassFilterProps & RegionFilterProps;

export function RedemptionsTableFilters(props: Props) {
  return (
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
  );
}
