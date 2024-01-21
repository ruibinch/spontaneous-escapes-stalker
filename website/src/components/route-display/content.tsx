'use client';
import { FlightClassSelectOption, RouteAnalysisEntry } from '@/index';
import { MonthYearFrequencyTable } from './month-year-frequency-table';
import { RouteHistoryTable } from './route-history-table';
import { RouteDisplayFilters } from './route-display-filters';
import { useState } from 'react';
import { filterRouteDetails } from './helpers/filter-route-details';

export function RouteDisplayContent({
  routeInfo,
}: {
  routeInfo: RouteAnalysisEntry;
}) {
  const [years, setYears] = useState<string>('All'); // comma-separated list of years
  const [flightClassOption, setFlightClassOption] =
    useState<FlightClassSelectOption>('ALL');

  const { from, to, fromIata, toIata, details } = routeInfo;

  const routeDetailsFiltered = filterRouteDetails({
    details,
    filters: {
      years: years.split(','),
      flightClassOption,
    },
  });
  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center pt-12 pb-12 px-4 lg:px-0 flex-wrap xl:flex-nowrap max-w-[90rem] mx-auto w-full">
        <div className="gap-12 flex flex-col w-full">
          <div className="flex flex-row gap-6 items-end">
            <h1 className="text-2xl font-bold">{`${from} - ${to}`}</h1>
            <h1 className="text-md">{`${fromIata}-${toIata}`}</h1>
          </div>

          <div className="flex flex-col gap-8">
            <RouteDisplayFilters
              years={years}
              setYears={setYears}
              flightClassOption={flightClassOption}
              setFlightClassOption={setFlightClassOption}
            />

            <MonthYearFrequencyTable
              data={routeDetailsFiltered}
              years={years.split(',')}
            />

            <RouteHistoryTable data={routeDetailsFiltered} />
          </div>
        </div>
      </div>
    </div>
  );
}
