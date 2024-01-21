import { Button } from '@nextui-org/react';
import {
  DateRangeFilter,
  DateRangeFilterProps,
} from './filters/date-range-filter';
import {
  FlightClassFilter,
  FlightClassFilterProps,
} from './filters/flight-class-filter';
import { MonthFilter, MonthFilterProps } from './filters/month-filter';
import { RegionFilter, RegionFilterProps } from './filters/region-filter';
import {
  SearchTermFilter,
  SearchTermFilterProps,
} from './filters/search-term-filter';

type Props = SearchTermFilterProps &
  FlightClassFilterProps &
  RegionFilterProps &
  DateRangeFilterProps &
  MonthFilterProps;

export function Filters(props: Props) {
  const resetAllFilters = () => {
    props.setSearchTerm('');
    props.setFlightClassOption('ALL');
    props.setRegions('All');
    props.setDateRange([0, props.monthsList.length - 1]);
    props.setMonths('All');
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

        <div className="lg:col-span-2">
          <DateRangeFilter
            dateRange={props.dateRange}
            setDateRange={props.setDateRange}
            monthsList={props.monthsList}
          />
        </div>

        <MonthFilter months={props.months} setMonths={props.setMonths} />
      </div>

      <div className="flex justify-end mt-6">
        <Button onPress={resetAllFilters}>Reset all filters</Button>
      </div>
    </div>
  );
}
