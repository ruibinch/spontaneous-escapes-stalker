'use client';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { RouteAnalysisEntry } from '@/index';
import { Skeleton, cn } from '@heroui/react';
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
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { FLIGHT_CLASS_ALL } from '../common/filters/flight-class-filter';
import { MONTH_ALL } from '../common/filters/month-filter';
import { REGION_ALL } from '../common/filters/region-filter';
import { PageHeader } from '../common/page-header';
import { SilkairRoutesToggle } from '../common/silkair-routes-toggle';
import { CommonStyles } from '../common/styles';
import { filterRouteAnalysisList } from './helpers/filter-route-analysis-list';
import { NewRedemptionAlert } from './new-redemption-alert';
import { PlaygroundFilters } from './playground-filters';
import { PlaygroundSummary } from './playground-summary';

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

const AnalysisCharts = dynamic(
  () => import('./analysis-charts').then((mod) => mod.AnalysisCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-6 gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="col-span-6 md:col-span-3 xl:col-span-2">
            <Skeleton className={cn(CommonStyles.Skeleton, 'w-full h-60')} />
          </div>
        ))}
      </div>
    ),
  },
);
const DetailsTable = dynamic(
  () => import('./details-table').then((mod) => mod.DetailsTable),
  {
    ssr: false,
    loading: () => (
      <Skeleton className={cn(CommonStyles.Skeleton, 'w-full h-60')} />
    ),
  },
);

export function PlaygroundContent({
  latestRedemptionAt,
  routeAnalysisListFull,
  routeAnalysisListSiaOnly,
  monthsList,
}: {
  latestRedemptionAt: Date;
  routeAnalysisListFull: RouteAnalysisEntry[];
  routeAnalysisListSiaOnly: RouteAnalysisEntry[];
  monthsList: string[];
}) {
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const routeAnalysisList = showSilkairRoutes
    ? routeAnalysisListFull
    : routeAnalysisListSiaOnly;

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
        rightComponent={<SilkairRoutesToggle />}
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col gap-6')}>
        <NewRedemptionAlert latestRedemptionAt={latestRedemptionAt} />

        <PlaygroundFilters />

        <div className="flex flex-col gap-4">
          <PlaygroundSummary
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
          tableData={routeAnalysisListFiltered}
          startDate={startDate}
          endDate={endDate}
          months={month.split(',')}
        />
      </div>
    </div>
  );
}
