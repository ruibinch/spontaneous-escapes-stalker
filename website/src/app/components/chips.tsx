import { Chip } from '@nextui-org/react';

interface Props {
  flightClass: 'Y' | 'PY' | 'J';
  useStandardisedWidth?: boolean; // render all chips with equal width (i.e. 40px)
}

export function FlightClassChip({
  flightClass,
  useStandardisedWidth = false,
}: Props) {
  const classBase = (() => {
    switch (flightClass) {
      case 'Y':
        return 'bg-gradient-to-br from-lime-700 to-green-900 border-small border-lime-400/50';
      case 'PY':
        return 'bg-gradient-to-br from-blue-500 to-indigo-900 border-small border-sky-500/50';
      case 'J':
        return 'bg-gradient-to-br from-red-800 to-red-950 border-small border-amber-400/50';
      default:
        return '';
    }
  })();

  return (
    <Chip
      size="sm"
      variant="flat"
      className={`ml-1 ${useStandardisedWidth ? 'min-w-[40px]' : ''}`}
      classNames={{
        base: classBase,
        content: useStandardisedWidth ? 'grid place-items-center' : undefined,
      }}
    >
      <span>{flightClass}</span>
    </Chip>
  );
}
