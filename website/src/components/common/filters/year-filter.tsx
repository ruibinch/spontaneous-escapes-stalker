import { trackEvent } from '@/analytics';
import { getYearsList } from '@/common/get-data-time-range';
import { useSearchParams } from '@/hooks/use-search-params';
import { Select, SelectItem } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

export const YEAR_ALL = 'All';

const yearsOptions = getYearsList();
const yearsOptionsWithAll = [YEAR_ALL, ...yearsOptions] as const;

export function YearFilter() {
  const { searchParams, generateUrlWithUpdatedSearchParams } =
    useSearchParams();
  const router = useRouter();
  const year = searchParams.get('year') ?? YEAR_ALL;

  // Do some manual tweaking of the selected months list so that "All" option is correctly handled
  const tweakSelectedYears = (value: string) => {
    if (value === '') {
      return YEAR_ALL;
    }
    const selectedYears = value.split(',');
    const lastSelectedYear = selectedYears[selectedYears.length - 1];
    if (lastSelectedYear === YEAR_ALL) {
      return lastSelectedYear;
    }
    const isAllYearsSelected = yearsOptions.every((year) =>
      selectedYears.includes(year),
    );
    if (isAllYearsSelected) {
      return YEAR_ALL;
    }
    return selectedYears.filter((year) => year !== YEAR_ALL).join(',');
  };

  return (
    <Select
      size="sm"
      items={yearsOptionsWithAll.map((year) => ({
        label: year,
        value: year,
      }))}
      label="Filter by specific year"
      selectionMode="multiple"
      selectedKeys={year.split(',')}
      onChange={(e) => {
        const selectedYears = tweakSelectedYears(e.target.value);
        trackEvent(['yearFilter'], { selectedYears });

        const url = generateUrlWithUpdatedSearchParams('year', selectedYears);
        router.replace(url);
      }}
    >
      {(option) => <SelectItem key={option.label}>{option.label}</SelectItem>}
    </Select>
  );
}

export function isYearMatch({
  yearsFiltered,
  year,
}: {
  yearsFiltered: string[];
  year: string;
}) {
  return yearsFiltered.includes(YEAR_ALL) || yearsFiltered.includes(year);
}
