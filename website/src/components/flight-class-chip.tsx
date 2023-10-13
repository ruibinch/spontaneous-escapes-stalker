import { Chip } from '@nextui-org/react';
import { FlightClass } from '..';

interface Props {
  flightClass: FlightClass;
  highlight?: boolean;
  useStandardisedWidth?: boolean; // render all chips with equal width (i.e. 40px)
  onClick?: () => void;
}

export function FlightClassChip({
  flightClass,
  highlight,
  useStandardisedWidth = false,
  onClick,
}: Props) {
  const appendHighlight = () => (highlight ? 'ring-2 ring-amber-400' : '');
  const appendHoverEffect = (hoverColor: string) =>
    onClick ? `${hoverColor} cursor-pointer` : '';

  const classBase = (() => {
    switch (flightClass) {
      case 'Y':
        return `bg-gradient-to-br from-lime-700 to-green-900 border-small border-lime-400/50 ${appendHighlight()} ${appendHoverEffect(
          'hover:from-lime-900',
        )}`;
      case 'PY':
        return `bg-gradient-to-br from-blue-500 to-indigo-900 border-small border-sky-500/50 ${appendHighlight()} ${appendHoverEffect(
          'hover:from-blue-700',
        )}`;
      case 'J':
        return `bg-gradient-to-br from-red-700 to-red-950 border-small border-amber-400/50 ${appendHighlight()} ${appendHoverEffect(
          'hover:from-red-900',
        )}`;
      default:
        return '';
    }
  })();

  return (
    <Chip
      size="sm"
      variant="flat"
      itemType="button"
      className={`ml-1 ${useStandardisedWidth ? 'min-w-[40px]' : ''}`}
      classNames={{
        base: classBase,
        content: `${useStandardisedWidth ? 'grid place-items-center' : ''}`,
      }}
      onClick={onClick}
    >
      <span>{flightClass}</span>
    </Chip>
  );
}
