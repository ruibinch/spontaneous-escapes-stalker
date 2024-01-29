import { trackEvent } from '@/analytics';
import {
  DateRangeFilter,
  DateRangeFilterProps,
} from '../common/filters/month-range-filter';
import {
  FlightClassFilter,
  FlightClassFilterProps,
} from '../common/filters/flight-class-filter';
import { MonthFilter, MonthFilterProps } from '../common/filters/month-filter';
import {
  RegionFilter,
  RegionFilterProps,
} from '../common/filters/region-filter';
import { ResetAllFiltersButton } from '../common/filters/reset-all-filters';
import {
  SearchTermFilter,
  SearchTermFilterProps,
} from '../common/filters/search-term-filter';

type Props = SearchTermFilterProps &
  FlightClassFilterProps &
  RegionFilterProps &
  DateRangeFilterProps &
  MonthFilterProps;

export function Filters(props: Props) {
  const resetAllFilters = () => {
    trackEvent(['playground', 'resetAllFilters']);
    props.setSearchTerm('');
    props.setFlightClassOption('ALL');
    props.setRegions('All');
    props.setMonthRange([
      props.monthsList[0],
      props.monthsList[props.monthsList.length - 1],
    ]);
    props.setMonths('All');
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          <SearchTermFilter
            searchTerm={props.searchTerm}
            setSearchTerm={props.setSearchTerm}
          />

          <RegionFilter regions={props.regions} setRegions={props.setRegions} />

          <FlightClassFilter
            flightClassOption={props.flightClassOption}
            setFlightClassOption={props.setFlightClassOption}
          />

          <MonthFilter months={props.months} setMonths={props.setMonths} />

          <DateRangeFilter
            monthRange={props.monthRange}
            setMonthRange={props.setMonthRange}
            monthsList={props.monthsList}
          />
        </div>

        <ResetAllFiltersButton resetAllFilters={resetAllFilters} />
      </div>
    </div>
  );
}
