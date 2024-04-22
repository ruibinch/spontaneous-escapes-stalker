import {
  AutocompleteSearchTermFilter,
  AutocompleteSearchTermFilterProps,
} from '../common/filters/autocomplete-search-term-filter';
import {
  FlightClassFilter,
  FlightClassFilterProps,
} from '../common/filters/flight-class-filter';
import { MonthFilter, MonthFilterProps } from '../common/filters/month-filter';
import {
  DateRangeFilter,
  DateRangeFilterProps,
} from '../common/filters/month-range-filter';
import {
  RegionFilter,
  RegionFilterProps,
} from '../common/filters/region-filter';
import { ResetAllFiltersButton } from '../common/filters/reset-all-filters';

type Props = AutocompleteSearchTermFilterProps &
  FlightClassFilterProps &
  RegionFilterProps &
  DateRangeFilterProps &
  MonthFilterProps;

export function Filters(props: Props) {
  const resetAllFilters = () => {
    props.setSearchTerms([]);
    props.setFlightClassOption('ALL');
    props.setRegions('All');
    props.setMonthRange([
      props.monthsList[0],
      props.monthsList[props.monthsList.length - 1],
    ]);
    props.setMonths('All');
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="col-span-2 md:col-span-3 flex flex-row items-center">
          <AutocompleteSearchTermFilter
            searchTerms={props.searchTerms}
            setSearchTerms={props.setSearchTerms}
          />
        </div>

        <RegionFilter regions={props.regions} setRegions={props.setRegions} />

        <FlightClassFilter
          flightClassOption={props.flightClassOption}
          setFlightClassOption={props.setFlightClassOption}
        />

        <MonthFilter months={props.months} setMonths={props.setMonths} />

        <div className="col-span-2">
          <DateRangeFilter
            monthRange={props.monthRange}
            setMonthRange={props.setMonthRange}
            monthsList={props.monthsList}
          />
        </div>
      </div>

      <ResetAllFiltersButton resetAllFilters={resetAllFilters} />
    </div>
  );
}
