import { trackEvent } from '@/analytics';
import { monthNameToNumMap } from '@/common/months-map';
import { Select, SelectItem } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

export interface MonthFilterProps {
  months: string;
  setMonths: Dispatch<SetStateAction<string>>;
}

const monthsOptions = Object.keys(monthNameToNumMap);
const monthsOptionsWithAll = ['All', ...monthsOptions] as const;

export function MonthFilter({ months, setMonths }: MonthFilterProps) {
  const pathname = usePathname();

  // Do some manual tweaking of the selected months list so that "All" option is correctly handled
  const tweakSelectedMonths = (value: string) => {
    if (value === '') {
      return 'All';
    }
    const selectedMonths = value.split(',');
    const lastSelectedMonth = selectedMonths[selectedMonths.length - 1];
    if (lastSelectedMonth === 'All') {
      return 'All';
    }
    const isAllMonthsSelected = monthsOptions.every((month) =>
      selectedMonths.includes(month),
    );
    if (isAllMonthsSelected) {
      return 'All';
    }
    return selectedMonths.filter((month) => month !== 'All').join(',');
  };

  return (
    <Select
      size="sm"
      items={monthsOptionsWithAll.map((month) => ({
        label: month,
        value: month,
      }))}
      label="Month"
      selectionMode="multiple"
      selectedKeys={months.split(',')}
      onChange={(e) => {
        const selectedMonths = tweakSelectedMonths(e.target.value);
        trackEvent(['monthFilter'], {
          pathname,
          selectedMonths,
        });
        setMonths(selectedMonths);
      }}
    >
      {(option) => <SelectItem key={option.label}>{option.label}</SelectItem>}
    </Select>
  );
}
