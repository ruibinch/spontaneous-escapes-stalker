'use client';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { FlightClass, RouteAnalysisEntry } from '@/index';
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
import { useMemo } from 'react';
import { AlertInfo } from '../common/alert-info';
import { FLIGHT_CLASS_ALL } from '../common/filters/flight-class-filter';
import { YEAR_ALL } from '../common/filters/year-filter';
import { PageHeader } from '../common/page-header';
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
      <div className="grid grid-cols-2 gap-3">
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

  // Compute contextual intelligence
  const intelligence = useMemo(() => {
    if (!routeAnalysisEntry) return null;

    const totalMonths = routeAnalysisEntry.details.length;
    let monthsAppeared = 0;
    const bestMonths: Record<number, number> = {};

    for (const detail of routeAnalysisEntry.details) {
      const hasRedemption = (['Y', 'W', 'J'] as FlightClass[]).some(
        (c) => detail.redemptionDetails[c] !== null,
      );
      if (hasRedemption) {
        monthsAppeared++;
        const calMonth = parseInt(detail.month.slice(4, 6), 10);
        bestMonths[calMonth] = (bestMonths[calMonth] || 0) + 1;
      }
    }

    const frequency = Math.round((monthsAppeared / totalMonths) * 100);
    const sortedCalMonths = Object.entries(bestMonths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const bestMonthNames = sortedCalMonths.map(
      ([m]) => monthNames[parseInt(m, 10) - 1],
    );

    return { frequency, monthsAppeared, totalMonths, bestMonthNames };
  }, [routeAnalysisEntry]);

  return (
    <div className={CommonStyles.Page()}>
      <div className="flex flex-col gap-8">
        <PageHeader
          breadcrumbs={
            <Breadcrumbs size="md">
              <BreadcrumbItem href="/route">Route Explorer</BreadcrumbItem>
              <BreadcrumbItem>{`${originIata}–${destinationIata}`}</BreadcrumbItem>
            </Breadcrumbs>
          }
          title={`${origin} → ${destination}`}
          subtitle={
            intelligence
              ? `${routeAnalysisEntry?.region} · Appears in ${intelligence.frequency}% of months · Best months: ${intelligence.bestMonthNames.join(', ')}`
              : routeAnalysisEntry?.region
          }
        />

        {routeAnalysisEntry?.metadata.remarks && (
          <AlertInfo content={routeAnalysisEntry.metadata.remarks} />
        )}

        <ByRouteFilters />

        <div className="flex flex-col gap-6">
          <ByRouteSummary
            routeMetadata={{ originIata, destinationIata }}
            routeAnalysisList={routeAnalysisList}
            detailsList={detailsList}
            detailsListFiltered={detailsListFiltered}
          />

          <ByRouteCharts detailsListFiltered={detailsListFiltered} />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
