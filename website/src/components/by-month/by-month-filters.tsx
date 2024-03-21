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
import { trackEvent } from '@/analytics';
import { ResetAllFiltersButton } from '../common/filters/reset-all-filters';

type Props = Pick<SearchTermFilterProps, 'searchTerm' | 'setSearchTerm'> &
  FlightClassFilterProps &
  RegionFilterProps;

export function ByMonthFilters(props: Props) {
  const resetAllFilters = () => {
    trackEvent(['byMonth', 'resetAllFilters']);
    props.setSearchTerm('');
    props.setRegions('All');
    props.setFlightClassOption('ALL');
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          <SearchTermFilter
            searchTerm={props.searchTerm}
            setSearchTerm={props.setSearchTerm}
            placeholder="Search by city/IATA"
          />

          <RegionFilter regions={props.regions} setRegions={props.setRegions} />

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
