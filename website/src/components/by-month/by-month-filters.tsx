import { RedemptionEntry } from '@/index';
import { usePathname, useRouter } from 'next/navigation';
import { AutocompleteSearchTermFilter } from '../common/filters/autocomplete-search-term-filter';
import { FlightClassFilter } from '../common/filters/flight-class-filter';
import { RegionFilter } from '../common/filters/region-filter';
import { ResetAllFiltersButton } from '../common/filters/reset-all-filters';

type Props = {
  redemptions: RedemptionEntry[];
};

export function ByMonthFilters(props: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const resetAllFilters = () => {
    router.replace(pathname);
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <AutocompleteSearchTermFilter redemptions={props.redemptions} />
          </div>

          <RegionFilter />

          <FlightClassFilter />
        </div>

        <ResetAllFiltersButton resetAllFilters={resetAllFilters} />
      </div>
    </div>
  );
}
