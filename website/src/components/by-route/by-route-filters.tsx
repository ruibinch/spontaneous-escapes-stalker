import { usePathname, useRouter } from 'next/navigation';
import { FlightClassFilter } from '../common/filters/flight-class-filter';
import { ResetAllFiltersButton } from '../common/filters/reset-all-filters';
import { YearFilter } from '../common/filters/year-filter';

export function ByRouteFilters() {
  const router = useRouter();
  const pathname = usePathname();

  const resetAllFilters = () => {
    router.replace(pathname);
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          <YearFilter />

          <FlightClassFilter />
        </div>

        <ResetAllFiltersButton resetAllFilters={resetAllFilters} />
      </div>
    </div>
  );
}
