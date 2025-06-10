import { trackEvent } from '@/analytics';
import { FlightClassIndicator } from '@/components/common/flight-class-indicator';
import { useSearchParams } from '@/hooks/use-search-params';
import { FlightClassSelectOption } from '@/index';
import { Select, SelectItem, SelectedItems } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

export const FLIGHT_CLASS_ALL = 'All';

const flightClassOptions = [
  {
    label: 'All',
    value: FLIGHT_CLASS_ALL,
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

export function FlightClassFilter() {
  const { searchParams, generateUrlWithUpdatedSearchParams } =
    useSearchParams();
  const router = useRouter();
  const flightClass = searchParams.get('flightClass') ?? FLIGHT_CLASS_ALL;

  return (
    <Select
      size="sm"
      items={flightClassOptions}
      label="Flight class"
      selectedKeys={[flightClass]}
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
        const selectedFlightClassOption = !!e.target.value
          ? e.target.value
          : FLIGHT_CLASS_ALL;
        trackEvent(['flightClassFilter'], { selectedFlightClassOption });

        const url = generateUrlWithUpdatedSearchParams(
          'flightClass',
          selectedFlightClassOption,
        );
        router.replace(url);
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
