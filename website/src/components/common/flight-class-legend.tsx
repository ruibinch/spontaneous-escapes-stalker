import { cn } from '@nextui-org/react';
import { FlightClassIndicator } from './flight-class-indicator';

export function FlightClassLegend({ styles }: { styles?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col text-default-400 dark:text-default-500 text-xs',
        styles,
      )}
    >
      <div className="flex flex-row gap-2 items-center">
        <FlightClassIndicator flightClassCode={'Y'} />
        {'Economy'}
      </div>
      <div className="flex flex-row gap-2 items-center">
        <FlightClassIndicator flightClassCode={'W'} />
        {'Premium Economy'}
      </div>
      <div className="flex flex-row gap-2 items-center">
        <FlightClassIndicator flightClassCode={'J'} />
        {'Business'}
      </div>
    </div>
  );
}
