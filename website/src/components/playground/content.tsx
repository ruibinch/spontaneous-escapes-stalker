import { getMonthsList } from '@/common/get-data-time-range';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { FlightClassSelectOption, RouteAnalysisEntry } from '@/index';
import { Skeleton, cn } from '@nextui-org/react';
import { getRouteAnalysis } from '@/queries/getRouteAnalysis';
import { useQuery } from '@tanstack/react-query';
import {
  ArcElement,
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
import { AlertApiError } from '../common/alert-api-error';
import { SelectOptions } from '../common/filters/autocomplete-search-term-filter';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { AnalysisCharts } from './analysis-charts';
import { DetailsTable } from './details-table';
import { FilterInfo } from './filter-info';
import { filterRouteAnalysisList } from './helpers/filter-route-analysis-list';
import { Filters } from './playground-filters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const monthsList = getMonthsList();

export function Playground() {
  const {
    data: routeAnalysisList,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['route-analysis'],
    queryFn: getRouteAnalysis,
  });

  return (
    <div>
      <PageHeader
        title="Playground"
        subtitle="Explore the dataset of past Spontaneous Escapes redemptions offered"
      />

      <div className={cn(CommonStyles.Page())}>
        {isLoading && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                <Skeleton className="h-12 rounded-md col-span-2 md:col-span-3" />
                <Skeleton className="h-12 rounded-md" />
                <Skeleton className="h-12 rounded-md" />
                <Skeleton className="h-12 rounded-md" />
                <Skeleton className="h-12 rounded-md col-span-2" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg col-span-2" />
            </div>

            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 rounded-md w-3/5" />

              <div className="grid grid-cols-6 gap-2">
                <Skeleton className="h-52 rounded-md col-span-6 md:col-span-3 xl:col-span-2 " />
                <Skeleton className="h-52 rounded-md col-span-6 md:col-span-3 xl:col-span-2 " />
                <Skeleton className="h-52 rounded-md col-span-6 md:col-span-3 xl:col-span-2 " />
                <Skeleton className="h-52 rounded-md col-span-6 md:col-span-3 xl:col-span-2 " />
                <Skeleton className="h-52 rounded-md col-span-6 md:col-span-3 xl:col-span-2 " />
              </div>
            </div>

            <Skeleton className="h-96 rounded-md" />
          </div>
        )}

        {isError && <AlertApiError refetch={refetch} />}

        {routeAnalysisList && (
          <PlaygroundContent routeAnalysisList={routeAnalysisList} />
        )}
      </div>
    </div>
  );
}

function PlaygroundContent({
  routeAnalysisList,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  const [searchTerms, setSearchTerms] = useState<SelectOptions>([]);
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
      searchTerms: searchTerms.map((term) => term.value),
      flightClassOption,
      regions: regions.split(','),
      startDate,
      endDate,
      months: months.split(','),
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <Filters
        flightClassOption={flightClassOption}
        setFlightClassOption={setFlightClassOption}
        searchTerms={searchTerms}
        setSearchTerms={setSearchTerms}
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

        <AnalysisCharts routeAnalysisListFiltered={routeAnalysisListFiltered} />
      </div>

      <DetailsTable
        data={routeAnalysisListFiltered}
        startDate={startDate}
        endDate={endDate}
        months={months.split(',')}
      />
    </div>
  );
}
