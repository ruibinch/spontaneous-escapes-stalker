import { getMonthsList } from '@/common/get-data-time-range';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { RouteAnalysisEntry } from '@/index';
import routeAnalysisFile from '@/static/route-analysis.json';
import { cn } from '@nextui-org/react';
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
import { useSearchParams } from 'next/navigation';
import { FLIGHT_CLASS_ALL } from '../common/filters/flight-class-filter';
import { REGION_ALL } from '../common/filters/region-filter';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { AnalysisCharts } from './analysis-charts';
import { DetailsTable } from './details-table';
import { FilterInfo } from './filter-info';
import { filterRouteAnalysisList } from './helpers/filter-route-analysis-list';
import { PlaygroundFilters } from './playground-filters';
import { MONTH_ALL } from '../common/filters/month-filter';

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

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];
const monthsList = getMonthsList();

export function PlaygroundContent() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('searchTerm') ?? '';
  const flightClass = searchParams.get('flightClass') ?? FLIGHT_CLASS_ALL;
  const region = searchParams.get('region') ?? REGION_ALL;
  const month = searchParams.get('month') ?? MONTH_ALL;
  const startMonth = searchParams.get('startMonth') ?? monthsList[0];
  const endMonth =
    searchParams.get('endMonth') ?? monthsList[monthsList.length - 1];

  const startDate = yyyymmToDate(startMonth);
  const endDate = yyyymmToDate(endMonth);

  const routeAnalysisListFiltered = filterRouteAnalysisList({
    data: routeAnalysisList,
    filters: {
      searchTerms: searchTerm.split(',').filter(Boolean),
      flightClass,
      regions: region.split(','),
      startDate,
      endDate,
      months: month.split(','),
    },
  });

  return (
    <div>
      <PageHeader
        title="Playground"
        subtitle="Explore the dataset of past Spontaneous Escapes redemptions offered"
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-8')}>
        <PlaygroundFilters />

        <div className="flex flex-col gap-4">
          <FilterInfo
            routeAnalysisList={routeAnalysisList}
            routeAnalysisListFiltered={routeAnalysisListFiltered}
            startDate={startDate}
            endDate={endDate}
            months={month.split(',')}
          />

          <AnalysisCharts
            routeAnalysisListFiltered={routeAnalysisListFiltered}
          />
        </div>

        <DetailsTable
          data={routeAnalysisListFiltered}
          startDate={startDate}
          endDate={endDate}
          months={month.split(',')}
        />
      </div>
    </div>
  );
}
