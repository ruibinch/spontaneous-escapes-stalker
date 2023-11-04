import { Switch, cn } from '@nextui-org/react';
import { CityIata } from '../..';

export function CityNameIataToggle({
  cityIata,
  onToggleCityIata,
}: {
  cityIata: CityIata;
  onToggleCityIata: (cityIata: CityIata) => void;
}) {
  const onValueChange = (isSelected: boolean) => {
    onToggleCityIata(isSelected ? 'city' : 'iata');
  };

  return (
    <Switch
      isSelected={cityIata === 'city'}
      onValueChange={onValueChange}
      startContent={<span>City</span>}
      endContent={<span>IATA</span>}
      classNames={{
        base: 'cursor-pointer',
        wrapper: cn(
          'p-0 w-32 h-7 rounded-lg overflow-visible border-small border-neutral-300/50',
          'group-data-[selected=true]:bg-amber-600', // city background colour
          'bg-blue-700', // IATA background colour
        ),
        thumb: cn(
          'w-16 h-7 border-2 shadow-lg rounded-lg',
          // selected
          'group-data-[selected=true]:ml-16',
          // pressed
          'group-data-[pressed=true]:w-16',
          'group-data-[selected]:group-data-[pressed]:ml-16',
        ),
        startContent: 'pl-4 text-sm',
        endContent: 'pr-4 text-sm',
      }}
    />
  );
}
