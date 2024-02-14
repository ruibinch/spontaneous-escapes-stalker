import { trackEvent } from '@/analytics';
import { FlightClassIndicator } from '@/components/common/flight-class-indicator';
import { FlightClassSelectOption } from '@/index';
import { Select, SelectItem, SelectedItems } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

export interface FlightClassFilterProps {
  flightClassOption: FlightClassSelectOption;
  setFlightClassOption: Dispatch<SetStateAction<FlightClassSelectOption>>;
}

const flightClassOptions = [
  {
    label: 'All',
    value: 'ALL',
  },
  {
    label: 'Economy',
    value: 'Y',
  },
  {
    label: 'Premium Economy',
    value: 'W',
  },
  {
    label: 'Business',
    value: 'J',
  },
];

export function FlightClassFilter({
  flightClassOption,
  setFlightClassOption,
}: FlightClassFilterProps) {
  const pathname = usePathname();

  return (
    <Select
      size="sm"
      items={flightClassOptions}
      label="Flight class"
      selectedKeys={[flightClassOption]}
      renderValue={(items: SelectedItems<(typeof flightClassOptions)[0]>) => {
        return items.map((item) => (
          <div
            key={item.data?.value}
            className="flex flex-row gap-2 items-center"
          >
            <FlightClassIndicator flightClassCode={item.data?.value} />
            {item.data?.label}
          </div>
        ));
      }}
      onChange={(e) => {
        const selectedFlightClassOption = e.target
          .value as FlightClassSelectOption;
        trackEvent(['flightClassFilter'], {
          pathname,
          selectedFlightClassOption,
        });
        setFlightClassOption(selectedFlightClassOption);
      }}
    >
      {(option) => (
        <SelectItem key={option.value} textValue={option.value}>
          <div key={option.value} className="flex flex-row gap-2 items-center">
            <FlightClassIndicator flightClassCode={option.value} />
            {option.label}
          </div>
        </SelectItem>
      )}
    </Select>
  );
}
