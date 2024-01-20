import { FlightClassSelectOption, RouteAnalysisEntry } from '@/index';
import { useState } from 'react';
import routeAnalysisFile from '../../static/route-analysis.json';
import { Filters } from './filters';
import { computeRouteFrequencyByFlightClass } from './helpers/compute-route-frequency-by-flight-class';
import { DetailsTable } from './details-table';
import { RouteFrequencyTable } from './route-frequency-table';

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];

export function HomeContent() {
  const [flightClassOption, setFlightClassOption] =
    useState<FlightClassSelectOption>('ALL');

  const routeFrequencyByFlightClass = computeRouteFrequencyByFlightClass({
    routeAnalysisList,
  });

  return (
    <div className="h-full lg:px-6">
      <div className="flex flex-col justify-center pt-16 pb-8 px-4 gap-8 lg:px-0 max-w-[90rem] mx-auto w-full">
        <Filters
          flightClassOption={flightClassOption}
          setFlightClassOption={setFlightClassOption}
        />

        <div className="border-b"></div>

        <div className="grid grid-cols-3">
          <div className="col-span-2">
            <RouteFrequencyTable
              data={routeFrequencyByFlightClass[flightClassOption]}
            />
          </div>
        </div>

        <div>
          <DetailsTable data={routeAnalysisList} />
        </div>
      </div>
    </div>
  );
}
