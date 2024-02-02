import { trackEvent } from '@/analytics';
import { getYearsList } from '@/common/get-data-time-range';
import { Select, SelectItem } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

export interface YearFilterProps {
  years: string;
  setYears: Dispatch<SetStateAction<string>>;
}

const yearsOptions = getYearsList();
const yearsOptionsWithAll = ['All', ...yearsOptions] as const;

export function YearFilter({ years, setYears }: YearFilterProps) {
  const pathname = usePathname();

  // Do some manual tweaking of the selected months list so that "All" option is correctly handled
  const tweakSelectedYears = (value: string) => {
    if (value === '') {
      return 'All';
    }
    const selectedYears = value.split(',');
    const lastSelectedYear = selectedYears[selectedYears.length - 1];
    if (lastSelectedYear === 'All') {
      return 'All';
    }
    const isAllYearsSelected = yearsOptions.every((year) =>
      selectedYears.includes(year),
    );
    if (isAllYearsSelected) {
      return 'All';
    }
    return selectedYears.filter((year) => year !== 'All').join(',');
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
      selectedKeys={years.split(',')}
      onChange={(e) => {
        const selectedYears = tweakSelectedYears(e.target.value);
        trackEvent(['yearFilter'], { pathname, selectedYears });
        setYears(selectedYears);
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
  return yearsFiltered.includes('All') || yearsFiltered.includes(year);
}
