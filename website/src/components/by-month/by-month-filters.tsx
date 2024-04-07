import { RedemptionEntry } from '@/index';
import {
  AutocompleteSearchTermFilter,
  AutocompleteSearchTermFilterProps,
} from '../common/filters/autocomplete-search-term-filter';
import {
  FlightClassFilter,
  FlightClassFilterProps,
} from '../common/filters/flight-class-filter';
import {
  RegionFilter,
  RegionFilterProps,
} from '../common/filters/region-filter';
import { ResetAllFiltersButton } from '../common/filters/reset-all-filters';

type Props = {
  redemptions: RedemptionEntry[];
} & AutocompleteSearchTermFilterProps &
  FlightClassFilterProps &
  RegionFilterProps;

export function ByMonthFilters(props: Props) {
  const resetAllFilters = () => {
    props.setSearchTerms([]);
    props.setRegions('All');
    props.setFlightClassOption('ALL');
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <AutocompleteSearchTermFilter
              searchTerms={props.searchTerms}
              setSearchTerms={props.setSearchTerms}
              redemptions={props.redemptions}
            />
          </div>

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
