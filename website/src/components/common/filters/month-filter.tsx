import { trackEvent } from '@/analytics';
import { monthNameToNumMap } from '@/common/months-map';
import { useSearchParams } from '@/hooks/use-search-params';
import { Select, SelectItem } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

export const MONTH_ALL = 'All';

const monthsOptions = Object.keys(monthNameToNumMap);
const monthsOptionsWithAll = [MONTH_ALL, ...monthsOptions] as const;

export function MonthFilter() {
  const { searchParams, generateUrlWithUpdatedSearchParams } =
    useSearchParams();
  const router = useRouter();
  const month = searchParams.get('month') ?? MONTH_ALL;

  // Do some manual tweaking of the selected months list so that "All" option is correctly handled
  const tweakSelectedMonths = (value: string) => {
    if (value === '') {
      return MONTH_ALL;
    }
    const selectedMonths = value.split(',');
    const lastSelectedMonth = selectedMonths[selectedMonths.length - 1];
    if (lastSelectedMonth === MONTH_ALL) {
      return lastSelectedMonth;
    }
    const isAllMonthsSelected = monthsOptions.every((month) =>
      selectedMonths.includes(month),
    );
    if (isAllMonthsSelected) {
      return MONTH_ALL;
    }
    return selectedMonths.filter((month) => month !== MONTH_ALL).join(',');
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
      selectedKeys={month.split(',')}
      onChange={(e) => {
        const selectedMonths = tweakSelectedMonths(e.target.value);
        trackEvent(['monthFilter'], { selectedMonths });

        const url = generateUrlWithUpdatedSearchParams('month', selectedMonths);
        router.push(url);
      }}
    >
      {(option) => <SelectItem key={option.label}>{option.label}</SelectItem>}
    </Select>
  );
}
