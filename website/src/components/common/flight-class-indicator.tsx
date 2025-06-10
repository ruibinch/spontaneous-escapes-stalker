import { cn } from '@heroui/react';

export function FlightClassIndicator({
  flightClass,
  flightClassCode,
  size = 'normal',
}: {
  flightClass?: string;
  flightClassCode?: string;
  size?: 'small' | 'normal';
}) {
  const color = getFlightClassIndicatorColor({
    flightClass,
    flightClassCode,
  });

  return color ? (
    <div
      className={cn(
        size === 'normal' ? 'w-2 h-2' : 'w-1.5 h-1.5',
        `rounded-lg ${color}`,
      )}
    />
  ) : null;
}

export function getFlightClassIndicatorColor({
  flightClass,
  flightClassCode,
}: {
  flightClass?: string;
  flightClassCode?: string;
}) {
  if (flightClass === 'Economy' || flightClassCode === 'Y') {
    return 'bg-green-600';
  }
  if (flightClass === 'Premium Economy' || flightClassCode === 'W') {
    return 'bg-blue-600';
  }
  if (flightClass === 'Business' || flightClassCode === 'J') {
    return 'bg-red-700';
  }
  return '';
}
