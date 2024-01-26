import { trackEvent } from '@/analytics';
import { Input, Slider, SliderStepMark } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';

export interface DateRangeFilterProps {
  monthRange: [string, string];
  setMonthRange: Dispatch<SetStateAction<[string, string]>>;
  monthsList: string[];
}

export function DateRangeFilter({
  monthRange,
  setMonthRange,
  monthsList,
}: DateRangeFilterProps) {
  const pathname = usePathname();

  const formatMonthDisplay = (month: string) =>
    `${month.slice(0, 4)}-${month.slice(4, 6)}`;

  const monthMin = formatMonthDisplay(monthsList[0]);
  const monthMax = formatMonthDisplay(monthsList[monthsList.length - 1]);

  const handleValueChange = (value: string, field: 'start' | 'end') => {
    const valueInYyyymm = value.replace('-', '');
    const startMonthUpd = field === 'start' ? valueInYyyymm : monthRange[0];
    const endMonthUpd = field === 'end' ? valueInYyyymm : monthRange[1];
    setMonthRange([startMonthUpd, endMonthUpd]);
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
        value={formatMonthDisplay(monthRange[0])}
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
        value={formatMonthDisplay(monthRange[1])}
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
