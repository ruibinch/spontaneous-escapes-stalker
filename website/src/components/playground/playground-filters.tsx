import { trackEvent } from '@/analytics';
import { Button, Tooltip } from '@nextui-org/react';
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
import {
  SearchTermFilter,
  SearchTermFilterProps,
} from '../common/filters/search-term-filter';
import { RefreshIcon } from '../icons/refresh';

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
        <div className="flex flex-col flex-1 gap-2">
          <div className="grid grid-cols-3 gap-1">
            <SearchTermFilter
              searchTerm={props.searchTerm}
              setSearchTerm={props.setSearchTerm}
            />

            <RegionFilter
              regions={props.regions}
              setRegions={props.setRegions}
            />

            <FlightClassFilter
              flightClassOption={props.flightClassOption}
              setFlightClassOption={props.setFlightClassOption}
            />
          </div>

          <div className="grid grid-cols-3 gap-1">
            <MonthFilter months={props.months} setMonths={props.setMonths} />

            <DateRangeFilter
              monthRange={props.monthRange}
              setMonthRange={props.setMonthRange}
              monthsList={props.monthsList}
            />
          </div>
        </div>

        <div className="px-4">
          <Tooltip content="Reset all filters" placement="bottom">
            <div
              className="border-1 text-lg bg-neutral-100 rounded-md p-1 cursor-pointer"
              onClick={resetAllFilters}
            >
              <Button
                size="sm"
                variant="light"
                isIconOnly
                className="pointer-events-none"
              >
                <RefreshIcon />
              </Button>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
