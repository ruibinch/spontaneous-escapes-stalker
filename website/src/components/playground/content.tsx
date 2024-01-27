import { getMonthsList } from '@/common/get-data-time-range';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { FlightClassSelectOption, RouteAnalysisEntry } from '@/index';
import routeAnalysisFile from '@/static/route-analysis.json';
import { cn } from '@nextui-org/react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useState } from 'react';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { AnalysisCharts } from './analysis-charts';
import { DetailsTable } from './details-table';
import { FilterInfo } from './filter-info';
import { computeRouteFrequencyByFlightClass } from './helpers/compute-route-frequency-by-flight-class';
import { filterRouteAnalysisList } from './helpers/filter-route-analysis-list';
import { Filters } from './playground-filters';
import { RouteFrequencyTable } from './route-frequency-table';

// initialise chart components at parent component level
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];
const monthsList = getMonthsList();

export function PlaygroundContent() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [flightClassOption, setFlightClassOption] =
    useState<FlightClassSelectOption>('ALL');
  const [regions, setRegions] = useState<string>('All'); // comma-separated list of regions
  const [dateRange, setDateRange] = useState<[string, string]>([
    monthsList[0],
    monthsList[monthsList.length - 1],
  ]);
  const [months, setMonths] = useState<string>('All'); // comma-separated list of months

  const startDate = yyyymmToDate(dateRange[0]);
  const endDate = yyyymmToDate(dateRange[1]);

  const routeAnalysisListFiltered = filterRouteAnalysisList({
    data: routeAnalysisList,
    filters: {
      searchTerm: searchTerm.toLowerCase(),
      flightClassOption,
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
    <div>
      <PageHeader title="Playground" />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-8')}>
        <Filters
          flightClassOption={flightClassOption}
          setFlightClassOption={setFlightClassOption}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          regions={regions}
          setRegions={setRegions}
          monthRange={dateRange}
          setMonthRange={setDateRange}
          monthsList={monthsList}
          months={months}
          setMonths={setMonths}
        />

        <div className="flex flex-col gap-4">
          <FilterInfo
            routeAnalysisList={routeAnalysisList}
            routeAnalysisListFiltered={routeAnalysisListFiltered}
            startDate={startDate}
            endDate={endDate}
            months={months.split(',')}
          />

          <AnalysisCharts
            routeAnalysisListFiltered={routeAnalysisListFiltered}
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
            months={months.split(',')}
          />
        </div>
      </div>
    </div>
  );
}
