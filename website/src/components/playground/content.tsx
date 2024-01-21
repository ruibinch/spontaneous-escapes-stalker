import { getMonthsList } from '@/common/get-data-time-range';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { FlightClassSelectOption, RouteAnalysisEntry } from '@/index';
import routeAnalysisFile from '@/static/route-analysis.json';
import { useState } from 'react';
import { DetailsTable } from './details-table';
import { FilterInfo } from './filter-info';
import { computeRouteFrequencyByFlightClass } from './helpers/compute-route-frequency-by-flight-class';
import { filterRouteAnalysisList } from './helpers/filter-route-analysis-list';
import { Filters } from './playground-filters';
import { RouteFrequencyTable } from './route-frequency-table';

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];
const monthsList = getMonthsList();

export function PlaygroundContent() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [flightClassOption, setFlightClassOption] =
    useState<FlightClassSelectOption>('ALL');
  const [regions, setRegions] = useState<string>('All'); // comma-separated list of regions
  const [dateRange, setDateRange] = useState<[number, number]>([
    0,
    monthsList.length - 1,
  ]);
  const [months, setMonths] = useState<string>('All'); // comma-separated list of months

  const startDate = yyyymmToDate(monthsList[dateRange[0]]);
  const endDate = yyyymmToDate(monthsList[dateRange[1]]);

  const routeAnalysisListFiltered = filterRouteAnalysisList({
    data: routeAnalysisList,
    filters: {
      searchTerm: searchTerm.toLowerCase(),
      regions: regions.split(','),
      startDate,
      endDate,
      months: months.split(','),
    },
  });

  const routeFrequencyByFlightClass = computeRouteFrequencyByFlightClass({
    routeAnalysisList: routeAnalysisListFiltered,
  });

  return (
    <div className="h-full lg:px-6">
      <div className="flex flex-col pt-12 pb-8 px-4 lg:px-0 gap-8 max-w-[90rem] mx-auto w-full">
        <Filters
          flightClassOption={flightClassOption}
          setFlightClassOption={setFlightClassOption}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          regions={regions}
          setRegions={setRegions}
          dateRange={dateRange}
          setDateRange={setDateRange}
          monthsList={monthsList}
          months={months}
          setMonths={setMonths}
        />

        <div className="border-t">
          <FilterInfo
            routeAnalysisList={routeAnalysisList}
            routeAnalysisListFiltered={routeAnalysisListFiltered}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        <div className="grid grid-cols-3">
          <div className="col-span-3 lg:col-span-2">
            <RouteFrequencyTable
              data={routeFrequencyByFlightClass[flightClassOption]}
            />
          </div>
        </div>

        <div>
          <DetailsTable
            data={routeAnalysisListFiltered}
            flightClassSelectedOption={flightClassOption}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
    </div>
  );
}
