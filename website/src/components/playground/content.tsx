import { monthsMap } from '@/common/months-map';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { FlightClassSelectOption, RouteAnalysisEntry } from '@/index';
import { isAfter, isBefore } from 'date-fns';
import { useState } from 'react';
import routeAnalysisFile from '../../static/route-analysis.json';
import { DetailsTable } from './details-table';
import { FilterInfo } from './filter-info';
import { Filters } from './filters';
import { computeRouteFrequencyByFlightClass } from './helpers/compute-route-frequency-by-flight-class';
import { RouteFrequencyTable } from './route-frequency-table';

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];
const monthsList = Object.keys(routeAnalysisList[0].details);

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

  const routeAnalysisListFiltered = filterRouteAnalysisList({
    routeAnalysisList,
    filters: {
      searchTerm,
      regions: regions.split(','),
      startDate: yyyymmToDate(monthsList[dateRange[0]]),
      endDate: yyyymmToDate(monthsList[dateRange[1]]),
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
            monthsList={monthsList}
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
          />
        </div>
      </div>
    </div>
  );
}

function filterRouteAnalysisList({
  routeAnalysisList,
  filters: { searchTerm, regions, startDate, endDate, months },
}: {
  routeAnalysisList: RouteAnalysisEntry[];
  filters: {
    searchTerm: string;
    regions: string[];
    startDate: Date;
    endDate: Date;
    months: string[];
  };
}) {
  const monthsInNumFormat = months.map((month) =>
    month === 'All' ? month : monthsMap[month],
  );

  return routeAnalysisList
    .filter((d) => {
      const isSearchTermMatch =
        searchTerm === ''
          ? true
          : d.from.toLowerCase().includes(searchTerm) ||
            d.fromIata.toLowerCase().includes(searchTerm) ||
            d.to.toLowerCase().includes(searchTerm) ||
            d.toIata.toLowerCase().includes(searchTerm);

      const isRegionsMatch =
        regions.includes('All') || regions.includes(d.region);

      return isSearchTermMatch && isRegionsMatch;
    })
    .map((d) => {
      const detailsFiltered = Object.entries(d.details).reduce(
        (
          _detailsFiltered: RouteAnalysisEntry['details'],
          [month, detailsInfo],
        ) => {
          const monthDate = yyyymmToDate(month);
          const isOutsideDateBounds =
            isBefore(monthDate, startDate) || isAfter(monthDate, endDate);
          const isValidMonth =
            monthsInNumFormat.includes('All') ||
            monthsInNumFormat.includes(month.slice(4, 6));

          if (!isOutsideDateBounds && isValidMonth) {
            _detailsFiltered[month] = detailsInfo;
          }
          return _detailsFiltered;
        },
        {},
      );

      return {
        ...d,
        details: detailsFiltered,
      };
    });
}
