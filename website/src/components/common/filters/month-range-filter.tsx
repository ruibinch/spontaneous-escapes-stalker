import { trackEvent } from '@/analytics';
import { getMonthsList } from '@/common/get-data-time-range';
import { useSearchParams } from '@/hooks/use-search-params';
import { Input } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

const monthsList = getMonthsList();

const formatMonthDisplay = (month: string) =>
  `${month.slice(0, 4)}-${month.slice(4, 6)}`;

export function MonthRangeFilter() {
  const { searchParams, generateUrlWithUpdatedSearchParams } =
    useSearchParams();
  const router = useRouter();
  const startMonth = searchParams.get('startMonth') ?? monthsList[0];
  const endMonth =
    searchParams.get('endMonth') ?? monthsList[monthsList.length - 1];

  const monthMin = formatMonthDisplay(monthsList[0]);
  const monthMax = formatMonthDisplay(monthsList[monthsList.length - 1]);

  const handleValueChange = (value: string, field: 'start' | 'end') => {
    const valueInYyyymm = value.replace('-', '');

    let startMonthUpd = startMonth;
    let endMonthUpd = endMonth;
    let newUrl;
    if (field === 'start') {
      startMonthUpd = valueInYyyymm;
      newUrl = generateUrlWithUpdatedSearchParams('startMonth', startMonthUpd);
    } else if (field === 'end') {
      endMonthUpd = valueInYyyymm;
      newUrl = generateUrlWithUpdatedSearchParams('endMonth', endMonthUpd);
    }

    const selectedMonthRange = [startMonthUpd, endMonthUpd];
    trackEvent(['monthRangeFilter'], {
      selectedMonthRange: selectedMonthRange.join('-'),
    });
    if (newUrl) {
      router.push(newUrl);
    }
  };

  return (
    <div className="flex flex-row">
      <Input
        size="sm"
        type="month"
        label="Start month"
        radius="none"
        min={monthMin}
        max={monthMax}
        value={formatMonthDisplay(startMonth)}
        onValueChange={(value) => {
          handleValueChange(value, 'start');
        }}
        classNames={{
          inputWrapper: 'rounded-l-md',
        }}
      />
      <Input
        size="sm"
        type="month"
        label="End month"
        radius="none"
        min={monthMin}
        max={monthMax}
        value={formatMonthDisplay(endMonth)}
        onValueChange={(value) => {
          handleValueChange(value, 'end');
        }}
        classNames={{
          inputWrapper: 'rounded-r-md',
        }}
      />
    </div>
  );
}
