import { FlightClassSelectOption } from '@/index';
import { Select, SelectItem, SelectedItems } from '@nextui-org/react';
import { Dispatch, SetStateAction } from 'react';
import { FlightClassIndicator } from '../common/flight-class-indicator';

interface FilterProps {
  flightClassOption: FlightClassSelectOption;
  setFlightClassOption: Dispatch<SetStateAction<FlightClassSelectOption>>;
}

const flightClassOptions = [
  {
    label: 'Economy',
    value: 'Y',
  },
  {
    label: 'Premium Economy',
    value: 'PY',
  },
  {
    label: 'Business',
    value: 'J',
  },
  {
    label: 'All',
    value: 'ALL',
  },
];

export function Filters({
  flightClassOption,
  setFlightClassOption,
}: FilterProps) {
  return (
    <div>
      <Select
        items={flightClassOptions}
        label="Flight class"
        className="max-w-xs"
        selectedKeys={[flightClassOption]}
        renderValue={(items: SelectedItems<(typeof flightClassOptions)[0]>) => {
          return items.map((item) => (
            <div
              key={item.data?.value}
              className="flex flex-row gap-2 items-center"
            >
              <FlightClassIndicator flightClass={item.data?.value} />
              {item.data?.label}
            </div>
          ));
        }}
        onChange={(e) => {
          setFlightClassOption(e.target.value as FlightClassSelectOption);
        }}
      >
        {(option) => (
          <SelectItem key={option.value} textValue={option.value}>
            <div
              key={option.value}
              className="flex flex-row gap-2 items-center"
            >
              <FlightClassIndicator flightClass={option.value} />
              {option.label}
            </div>
          </SelectItem>
        )}
      </Select>
    </div>
  );
}
