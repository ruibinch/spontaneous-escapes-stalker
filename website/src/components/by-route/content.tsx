'use client';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { RouteAnalysisEntry } from '@/index';
import { BreadcrumbItem, Breadcrumbs, Skeleton, cn } from '@heroui/react';
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
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { AlertInfo } from '../common/alert-info';
import { FLIGHT_CLASS_ALL } from '../common/filters/flight-class-filter';
import { YEAR_ALL } from '../common/filters/year-filter';
import { PageHeader } from '../common/page-header';
import { SilkairRoutesToggle } from '../common/silkair-routes-toggle';
import { CommonStyles } from '../common/styles';
import { ByRouteFilters } from './by-route-filters';
import { ByRouteSummary } from './by-route-summary';
import { filterRouteDetailsList } from './helpers/filter-route-details-list';
import { makeRouteDetailsList } from './helpers/make-route-details-list';
import { MonthView } from './month-view';
import { MonthYearFrequencyTable } from './month-year-frequency-table';

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

const ByRouteCharts = dynamic(
  () => import('./by-route-charts').then((mod) => mod.ByRouteCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 gap-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="col-span-2 xl:col-span-1">
            <Skeleton className={cn(CommonStyles.Skeleton, 'w-full h-60')} />
          </div>
        ))}
      </div>
    ),
  },
);
const RouteHistoryTable = dynamic(
  () => import('./route-history-table').then((mod) => mod.RouteHistoryTable),
  {
    ssr: false,
    loading: () => (
      <Skeleton className={cn(CommonStyles.Skeleton, 'w-full h-60')} />
    ),
  },
);

export function ByRouteContent({
  routeMetadata: { origin, destination, originIata, destinationIata },
  routeAnalysisListFull,
  routeAnalysisListSiaOnly,
}: {
  routeMetadata: {
    origin: string;
    destination: string;
    originIata: string;
    destinationIata: string;
  };
  routeAnalysisListFull: RouteAnalysisEntry[];
  routeAnalysisListSiaOnly: RouteAnalysisEntry[];
}) {
  const searchParams = useSearchParams();
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const routeAnalysisList = showSilkairRoutes
    ? routeAnalysisListFull
    : routeAnalysisListSiaOnly;
  const routeAnalysisEntry = routeAnalysisList.find(
    (d) => d.originIata === originIata && d.destinationIata === destinationIata,
  );
  // only necessary to display if a route has both SIA and Silkair flights
  const shouldShowSilkairRoutesToggle = routeAnalysisEntry
    ? !routeAnalysisEntry.isSiaOnlyRoute &&
      !routeAnalysisEntry.isSilkairOnlyRoute
    : false;

  const flightClass = searchParams.get('flightClass') ?? FLIGHT_CLASS_ALL;
  const year = searchParams.get('year') ?? YEAR_ALL;

  const detailsList = makeRouteDetailsList(routeAnalysisEntry);
  const detailsListFiltered = filterRouteDetailsList({
    detailsList,
    filters: {
      years: year.split(','),
      flightClass,
    },
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs size="md">
            <BreadcrumbItem href="/route">View by Route</BreadcrumbItem>
            <BreadcrumbItem>{`${originIata}-${destinationIata}`}</BreadcrumbItem>
          </Breadcrumbs>
        }
        title={`${origin} - ${destination}`}
        rightComponent={
          shouldShowSilkairRoutesToggle && <SilkairRoutesToggle />
        }
      />

      <div className={cn(CommonStyles.Page(), 'flex flex-col w-full gap-8')}>
        {routeAnalysisEntry?.metadata.remarks && (
          <AlertInfo content={routeAnalysisEntry.metadata.remarks} />
        )}

        <ByRouteFilters />

        <div className="flex flex-col gap-4">
          <ByRouteSummary
            routeMetadata={{ originIata, destinationIata }}
            routeAnalysisList={routeAnalysisList}
            detailsList={detailsList}
            detailsListFiltered={detailsListFiltered}
          />

          <ByRouteCharts detailsListFiltered={detailsListFiltered} />
        </div>

        <div className="grid grid-cols-2 gap-4 xl:gap-2">
          <div className="col-span-2 xl:col-span-1">
            <MonthYearFrequencyTable data={detailsListFiltered} />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <MonthView detailsListFiltered={detailsListFiltered} />
          </div>
        </div>

        <RouteHistoryTable data={detailsListFiltered} />
      </div>
    </div>
  );
}
