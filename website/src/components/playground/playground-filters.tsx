import { RouteAnalysisEntry } from '@/index';
import { usePathname, useRouter } from 'next/navigation';
import { AutocompleteSearchTermFilter } from '../common/filters/autocomplete-search-term-filter';
import { FlightClassFilter } from '../common/filters/flight-class-filter';
import { MonthFilter } from '../common/filters/month-filter';
import { MonthRangeFilter } from '../common/filters/month-range-filter';
import { RegionFilter } from '../common/filters/region-filter';
import { ResetAllFiltersButton } from '../common/filters/reset-all-filters';

export function PlaygroundFilters({
  routeAnalysisList,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const resetAllFilters = () => {
    router.replace(pathname);
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="col-span-2 md:col-span-3 flex flex-row gap-2 items-center">
            <AutocompleteSearchTermFilter
              routeAnalysisList={routeAnalysisList}
            />
          </div>

          <RegionFilter />

          <FlightClassFilter />

          <MonthFilter />

          <div className="col-span-2">
            <MonthRangeFilter />
          </div>
        </div>

        <ResetAllFiltersButton resetAllFilters={resetAllFilters} />
      </div>
    </div>
  );
}
